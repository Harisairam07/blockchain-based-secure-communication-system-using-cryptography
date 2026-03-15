require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

app.get('/health', (_, res) => res.json({ service: 'crypto-service', status: 'ok' }));

app.post('/pipeline', (req, res) => {
  try {
    const { message, senderPrivateKeyPem, receiverPublicKeyPem } = req.body;
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    let encryptedMessage = cipher.update(message, 'utf8', 'base64');
    encryptedMessage += cipher.final('base64');

    const encryptedAesKey = crypto.publicEncrypt({ key: receiverPublicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, aesKey);

    const hash = sha256(encryptedMessage);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(hash);
    signer.end();
    const signature = signer.sign(senderPrivateKeyPem, 'base64');

    res.json({
      encryptedMessage,
      encryptedAesKey: encryptedAesKey.toString('base64'),
      iv: iv.toString('hex'),
      hash,
      signature
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/decrypt', (req, res) => {
  try {
    const { encryptedMessage, encryptedAesKey, iv, receiverPrivateKeyPem } = req.body;
    const aesKey = crypto.privateDecrypt(
      { key: receiverPrivateKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
      Buffer.from(encryptedAesKey, 'base64')
    );
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, Buffer.from(iv, 'hex'));
    let text = decipher.update(encryptedMessage, 'base64', 'utf8');
    text += decipher.final('utf8');
    res.json({ decryptedMessage: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4003, () => console.log('crypto-service on 4003'));

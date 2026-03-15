const crypto = require('crypto');
const forge = require('node-forge');

const AES_ALGO = 'aes-256-cbc';

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function generateRsaKeyPair() {
  const pair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
  return {
    publicKey: forge.pki.publicKeyToPem(pair.publicKey),
    privateKey: forge.pki.privateKeyToPem(pair.privateKey)
  };
}

function deriveKeyFromPassword(password, saltHex) {
  return crypto.pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), 120000, 32, 'sha256');
}

function encryptPrivateKey(privateKey, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = deriveKeyFromPassword(password, salt.toString('hex'));
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encryptedPrivateKey: encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex')
  };
}

function decryptPrivateKey(encryptedPrivateKey, password, saltHex, ivHex) {
  const key = deriveKeyFromPassword(password, saltHex);
  const decipher = crypto.createDecipheriv(AES_ALGO, key, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function encryptMessageForReceiver(plainText, receiverPublicKeyPem) {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(AES_ALGO, aesKey, iv);
  let encryptedMessage = cipher.update(plainText, 'utf8', 'base64');
  encryptedMessage += cipher.final('base64');

  const encryptedAesKey = crypto.publicEncrypt(
    { key: receiverPublicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    aesKey
  );

  return {
    encryptedMessage,
    encryptedAesKey: encryptedAesKey.toString('base64'),
    iv: iv.toString('hex')
  };
}

function decryptMessageForReceiver(encryptedMessage, encryptedAesKey, ivHex, receiverPrivateKeyPem) {
  const aesKey = crypto.privateDecrypt(
    { key: receiverPrivateKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
    Buffer.from(encryptedAesKey, 'base64')
  );

  const decipher = crypto.createDecipheriv(AES_ALGO, aesKey, Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedMessage, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function signHash(hashHex, senderPrivateKeyPem) {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(hashHex);
  sign.end();
  return sign.sign(senderPrivateKeyPem, 'base64');
}

function verifySignature(hashHex, signatureB64, senderPublicKeyPem) {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(hashHex);
  verify.end();
  return verify.verify(senderPublicKeyPem, signatureB64, 'base64');
}

module.exports = {
  sha256,
  generateRsaKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  encryptMessageForReceiver,
  decryptMessageForReceiver,
  signHash,
  verifySignature
};

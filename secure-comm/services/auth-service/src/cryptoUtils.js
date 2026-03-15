const crypto = require('crypto');
const forge = require('node-forge');

function generateRsaPair() {
  const pair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
  return {
    publicKey: forge.pki.publicKeyToPem(pair.publicKey),
    privateKey: forge.pki.privateKeyToPem(pair.privateKey)
  };
}

function encryptPrivateKey(privateKey, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return { encryptedPrivateKey: encrypted, keySalt: salt.toString('hex'), keyIv: iv.toString('hex') };
}

function decryptPrivateKey(encryptedPrivateKey, password, keySaltHex, keyIvHex) {
  const key = crypto.pbkdf2Sync(password, Buffer.from(keySaltHex, 'hex'), 120000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(keyIvHex, 'hex'));
  let decrypted = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { generateRsaPair, encryptPrivateKey, decryptPrivateKey };

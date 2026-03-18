const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateRsaKeyPair, encryptPrivateKey } = require('./cryptoService');

async function ensureDefaultAdmin() {
  const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
  const defaultName = process.env.DEFAULT_ADMIN_NAME || 'Administrator';

  const existing = await User.findOne({ email: defaultEmail });
  if (existing) {
    const updates = {};

    // Recovery path: prevent permanent lockout of the configured default admin.
    if (existing.isBlocked) {
      updates.isBlocked = false;
      updates.blockedReason = null;
      updates.blockedAt = null;
    }

    if (existing.failedLoginCount && existing.failedLoginCount > 0) {
      updates.failedLoginCount = 0;
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: existing._id }, { $set: updates });
      return { created: false, recovered: true, email: defaultEmail };
    }

    return { created: false, recovered: false, email: defaultEmail };
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  const { publicKey, privateKey } = generateRsaKeyPair();
  const { encryptedPrivateKey, salt, iv } = encryptPrivateKey(privateKey, defaultPassword);

  await User.create({
    name: defaultName,
    email: defaultEmail,
    passwordHash,
    role: 'admin',
    publicKey,
    encryptedPrivateKey,
    keySalt: salt,
    keyIv: iv
  });

  return { created: true, recovered: false, email: defaultEmail };
}

module.exports = { ensureDefaultAdmin };

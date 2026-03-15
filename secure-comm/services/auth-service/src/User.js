const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  publicKey: { type: String, required: true },
  encryptedPrivateKey: { type: String, required: true },
  keySalt: { type: String, required: true },
  keyIv: { type: String, required: true },
  failedAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

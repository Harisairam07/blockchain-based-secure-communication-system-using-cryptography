const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    publicKey: { type: String, required: true },
    encryptedPrivateKey: { type: String, required: true },
    keySalt: { type: String, required: true },
    keyIv: { type: String, required: true },
    lastLoginAt: Date,
    failedLoginCount: { type: Number, default: 0 },
    isLockedUntil: Date,
    johnVoiceProfile: {
      vector: { type: [Number], default: undefined },
      samples: { type: Number, default: 0 },
      updatedAt: Date
    },
    johnFailedVoiceAttempts: { type: Number, default: 0 },
    johnLockedUntil: Date,
    isBlocked: { type: Boolean, default: false, index: true },
    blockedReason: { type: String, default: null },
    blockedAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'users' }
);

module.exports = mongoose.model('User', UserSchema);

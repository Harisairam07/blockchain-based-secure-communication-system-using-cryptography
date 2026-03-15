const mongoose = require('mongoose');

// Captures authenticated user sessions for forensic traceability.
const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    ip: { type: String, default: null },
    userAgent: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'sessions' }
);

module.exports = mongoose.model('Session', SessionSchema);

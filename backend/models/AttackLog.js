const mongoose = require('mongoose');

const AttackLogSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, index: true },
    email: { type: String, default: null },
    type: {
      type: String,
      enum: ['honeypot', 'bruteforce', 'invalid_login', 'rate_limit', 'abnormal_messaging', 'suspicious_ip', 'emergency_shutdown'],
      required: true
    },
    userAgent: String,
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    blocked: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'security_logs' }
);

module.exports = mongoose.model('AttackLog', AttackLogSchema);

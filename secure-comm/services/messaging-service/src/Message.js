const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, index: true },
  receiverId: { type: String, index: true },
  encryptedMessage: String,
  encryptedAesKey: String,
  iv: String,
  hash: String,
  signature: String,
  blockchainTxHash: String,
  verificationStatus: { type: String, default: 'verified' }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

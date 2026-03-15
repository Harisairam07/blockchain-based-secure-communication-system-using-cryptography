const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    encryptedMessage: { type: String, required: true },
    encryptedAesKey: { type: String, required: true },
    iv: { type: String, required: true },
    encryptionKeyID: { type: String, required: true, index: true },
    hash: { type: String, required: true, index: true },
    messageHash: { type: String, required: true, index: true },
    signature: { type: String, required: true },
    blockchainTxHash: { type: String, default: null },
    blockchainTransactionID: { type: String, default: null },
    onChainId: { type: Number, default: null },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    deliveredAt: Date,
    readAt: Date
  },
  { timestamps: true, collection: 'messages' }
);

module.exports = mongoose.model('Message', MessageSchema);

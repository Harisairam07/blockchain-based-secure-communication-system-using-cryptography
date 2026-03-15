const mongoose = require('mongoose');

// Stores blockchain write results for verification and SOC monitoring.
const TransactionSchema = new mongoose.Schema(
  {
    txHash: { type: String, required: true, index: true },
    onChainId: { type: Number, default: null },
    messageHash: { type: String, required: true, index: true },
    senderAddress: { type: String, default: null },
    receiverAddress: { type: String, default: null },
    timestamp: { type: Number, required: true },
    signature: { type: String, required: true },
    status: { type: String, enum: ['confirmed', 'simulated', 'failed'], default: 'confirmed' },
    blockNumber: { type: Number, default: null },
    error: { type: String, default: null }
  },
  { timestamps: true, collection: 'transactions' }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

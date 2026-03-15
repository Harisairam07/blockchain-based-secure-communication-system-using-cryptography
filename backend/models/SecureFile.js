const mongoose = require('mongoose');

const SecureFileSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    encryptedFileData: { type: String, required: true },
    encryptedAesKey: { type: String, required: true },
    iv: { type: String, required: true },
    fileHash: { type: String, required: true, index: true },
    encryptionKeyID: { type: String, required: true, index: true },
    signature: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    blockchainTxHash: { type: String, default: null },
    blockchainTransactionID: { type: String, default: null },
    onChainId: { type: Number, default: null }
  },
  { timestamps: true, collection: 'files' }
);

module.exports = mongoose.model('SecureFile', SecureFileSchema);

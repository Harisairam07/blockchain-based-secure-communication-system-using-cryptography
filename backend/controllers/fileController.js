const multer = require('multer');
const crypto = require('crypto');
const {
  encryptMessageForReceiver,
  decryptMessageForReceiver,
  sha256,
  signHash,
  verifySignature,
  decryptPrivateKey
} = require('../services/cryptoService');
const { writeMessageRecord } = require('../services/blockchainService');
const SecureFile = require('../models/SecureFile');
const User = require('../models/User');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

async function uploadFile(req, res) {
  try {
    const { receiverId, passphrase } = req.body;
    const file = req.file;

    if (!file || !receiverId || !passphrase) {
      return res.status(400).json({ error: 'File, receiverId, and passphrase are required' });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const fileContentB64 = file.buffer.toString('base64');

    const encryptedPayload = encryptMessageForReceiver(fileContentB64, receiver.publicKey);

    const hash = sha256(encryptedPayload.encryptedMessage);
    const encryptionKeyID = `file-key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create signature from the sender's decrypted RSA private key
    const senderPrivateKey = decryptPrivateKey(
      sender.encryptedPrivateKey,
      passphrase,
      sender.keySalt,
      sender.keyIv
    );
    const signature = signHash(hash, senderPrivateKey);

    const chain = await writeMessageRecord({
      hashHex: hash,
      senderWallet: null,
      receiverWallet: null,
      timestamp: Math.floor(Date.now() / 1000),
      signatureBase64: signature
    });

    const secureFile = await SecureFile.create({
      sender: sender._id,
      receiver: receiver._id,
      encryptedFileData: encryptedPayload.encryptedMessage,
      encryptedAesKey: encryptedPayload.encryptedAesKey,
      iv: encryptedPayload.iv,
      fileHash: hash,
      encryptionKeyID,
      signature,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      blockchainTxHash: chain.txHash,
      blockchainTransactionID: chain.txHash,
      onChainId: chain.onChainId || null
    });

    res.status(201).json({
      message: 'File uploaded and secured',
      fileId: String(secureFile._id),
      encryptionKeyID,
      hash,
      blockchainTxHash: chain.txHash
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error.message });
  }
}

async function downloadFile(req, res) {
  try {
    const { fileId } = req.params;
    const file = await SecureFile.findById(fileId).populate('sender', 'email publicKey').populate('receiver', 'email');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const isSender = String(file.sender?._id || file.sender) === String(req.user._id);
    const isReceiver = String(file.receiver?._id || file.receiver) === String(req.user._id);

    if (!isSender && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this file' });
    }

    res.json({
      fileId,
      encryptedMessage: file.encryptedFileData,
      encryptedAesKey: file.encryptedAesKey,
      iv: file.iv,
      hash: file.fileHash,
      signature: file.signature,
      encryptionKeyID: file.encryptionKeyID,
      blockchainTxHash: file.blockchainTxHash,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      createdAt: file.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'File download failed', details: error.message });
  }
}

async function decryptDownloadFile(req, res) {
  try {
    const { fileId } = req.params;
    const { passphrase, encryptionKeyID } = req.body;

    if (!passphrase || !encryptionKeyID) {
      return res.status(400).json({ error: 'passphrase and encryptionKeyID are required' });
    }

    const file = await SecureFile.findById(fileId).populate('sender', 'publicKey').populate('receiver');
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.encryptionKeyID !== encryptionKeyID) {
      return res.status(403).json({ error: 'Invalid encryption key ID' });
    }

    const isSender = String(file.sender?._id || file.sender) === String(req.user._id);
    const isReceiver = String(file.receiver?._id || file.receiver) === String(req.user._id);
    if (!isSender && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to decrypt this file' });
    }

    const receiver = await User.findById(req.user._id);
    const privateKey = decryptPrivateKey(receiver.encryptedPrivateKey, passphrase, receiver.keySalt, receiver.keyIv);

    const recomputedHash = sha256(file.encryptedFileData);
    const hashMatched = recomputedHash === file.fileHash;
    const signatureValid = verifySignature(file.fileHash, file.signature, file.sender.publicKey);

    if (!hashMatched || !signatureValid) {
      return res.status(400).json({ error: 'File integrity validation failed' });
    }

    const decryptedB64 = decryptMessageForReceiver(file.encryptedFileData, file.encryptedAesKey, file.iv, privateKey);

    return res.json({
      message: 'File decrypted successfully',
      fileId: String(file._id),
      originalName: file.originalName,
      mimeType: file.mimeType,
      contentBase64: decryptedB64,
      hashMatched,
      signatureValid,
      blockchainTransactionID: file.blockchainTransactionID
    });
  } catch (error) {
    return res.status(500).json({ error: 'Secure file decrypt failed', details: error.message });
  }
}

module.exports = {
  upload,
  uploadFile,
  downloadFile,
  decryptDownloadFile
};
const Message = require('../models/Message');
const User = require('../models/User');
const AttackLog = require('../models/AttackLog');
const {
  encryptMessageForReceiver,
  decryptPrivateKey,
  decryptMessageForReceiver,
  sha256,
  signHash,
  verifySignature
} = require('../services/cryptoService');
const { writeMessageRecord } = require('../services/blockchainService');
const { detectAbnormalMessaging } = require('../services/attackDetectionService');
const { getSecurityState } = require('../services/securityStateService');

async function sendMessage(req, res) {
  try {
    const { receiverId, message, signingPassphrase, senderWallet = null, receiverWallet = null } = req.body;

    if (!receiverId || !message || !signingPassphrase) {
      return res.status(400).json({ error: 'receiverId, message and signingPassphrase are required' });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    const behavior = await detectAbnormalMessaging(req, sender._id);
    if (behavior.blocked) {
      return res.status(429).json({ error: 'Abnormal messaging behavior detected. Sending temporarily blocked.' });
    }

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const senderPrivateKey = decryptPrivateKey(
      sender.encryptedPrivateKey,
      signingPassphrase,
      sender.keySalt,
      sender.keyIv
    );

    const encryptedPayload = encryptMessageForReceiver(message, receiver.publicKey);
    const hash = sha256(encryptedPayload.encryptedMessage);
    const encryptionKeyID = `key-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const signature = signHash(hash, senderPrivateKey);

    const chain = await writeMessageRecord({
      hashHex: hash,
      senderWallet,
      receiverWallet,
      timestamp: Math.floor(Date.now() / 1000),
      signatureBase64: signature
    });

    const record = await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      encryptedMessage: encryptedPayload.encryptedMessage,
      encryptedAesKey: encryptedPayload.encryptedAesKey,
      iv: encryptedPayload.iv,
      encryptionKeyID,
      hash,
      messageHash: hash,
      signature,
      verificationStatus: 'verified',
      blockchainTxHash: chain.txHash,
      blockchainTransactionID: chain.txHash,
      onChainId: chain.onChainId || null,
      deliveredAt: new Date()
    });

    if (req.io) {
      req.io.to(String(receiver._id)).emit('receive_message', {
        id: String(record._id),
        sender: String(sender._id),
        receiver: String(receiver._id),
        encrypted: true,
        timestamp: record.createdAt,
        preview: '[Encrypted message received]'
      });
    }

    return res.status(201).json({
      message: 'Message secured and recorded',
      data: {
        id: record._id,
        hash: record.hash,
        signature: record.signature,
        encryptionKeyID: record.encryptionKeyID,
        blockchainTxHash: record.blockchainTxHash,
        verificationStatus: record.verificationStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Message send failed', details: error.message });
  }
}

async function getInbox(req, res) {
  try {
    const records = await Message.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email publicKey')
      .lean();

    return res.json({ messages: records });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inbox', details: error.message });
  }
}

async function decryptMessage(req, res) {
  try {
    const { id } = req.params;
    const { passphrase } = req.body;

    if (!passphrase) {
      return res.status(400).json({ error: 'passphrase is required' });
    }

    const record = await Message.findById(id).populate('sender', 'publicKey');
    if (!record) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (String(record.receiver) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not allowed to decrypt this message' });
    }

    const receiver = await User.findById(req.user._id);

    const privateKey = decryptPrivateKey(
      receiver.encryptedPrivateKey,
      passphrase,
      receiver.keySalt,
      receiver.keyIv
    );

    const plainText = decryptMessageForReceiver(
      record.encryptedMessage,
      record.encryptedAesKey,
      record.iv,
      privateKey
    );

    const derivedHash = sha256(record.encryptedMessage);
    const signatureValid = verifySignature(derivedHash, record.signature, record.sender.publicKey);

    record.readAt = new Date();
    record.verificationStatus = signatureValid ? 'verified' : 'failed';
    await record.save();

    return res.json({
      message: 'Decryption successful',
      data: {
        plainText,
        signatureValid,
        hashMatched: derivedHash === record.hash,
        blockchainTxHash: record.blockchainTxHash
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Decryption failed', details: error.message });
  }
}

async function verifyMessage(req, res) {
  try {
    const { id } = req.params;
    const record = await Message.findById(id).populate('sender', 'publicKey');

    if (!record) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const hashValid = sha256(record.encryptedMessage) === record.hash;
    const signatureValid = verifySignature(record.hash, record.signature, record.sender.publicKey);

    return res.json({
      id: record._id,
      hashValid,
      signatureValid,
      verificationStatus: hashValid && signatureValid ? 'verified' : 'failed',
      blockchainTxHash: record.blockchainTxHash
    });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed', details: error.message });
  }
}

async function retrieveByKey(req, res) {
  try {
    const { encryptionKeyID, passphrase } = req.body;

    if (!encryptionKeyID || !passphrase) {
      return res.status(400).json({ error: 'encryptionKeyID and passphrase are required' });
    }

    const record = await Message.findOne({
      encryptionKeyID,
      receiver: req.user._id
    }).populate('sender', 'publicKey email');

    if (!record) {
      return res.status(404).json({ error: 'Message not found for provided retrieval key' });
    }

    const receiver = await User.findById(req.user._id);

    const privateKey = decryptPrivateKey(
      receiver.encryptedPrivateKey,
      passphrase,
      receiver.keySalt,
      receiver.keyIv
    );

    const computedHash = sha256(record.encryptedMessage);
    const hashMatched = computedHash === record.messageHash;
    const signatureValid = verifySignature(record.messageHash, record.signature, record.sender.publicKey);

    if (!hashMatched || !signatureValid) {
      record.verificationStatus = 'failed';
      await record.save();
      return res.status(400).json({ error: 'Integrity verification failed. Message cannot be decrypted.' });
    }

    const plainText = decryptMessageForReceiver(
      record.encryptedMessage,
      record.encryptedAesKey,
      record.iv,
      privateKey
    );

    record.readAt = new Date();
    record.verificationStatus = 'verified';
    await record.save();

    return res.json({
      message: 'Message retrieved successfully',
      data: {
        id: record._id,
        plainText,
        sender: record.sender?.email || null,
        encryptionKeyID: record.encryptionKeyID,
        hashMatched,
        signatureValid,
        blockchainTransactionID: record.blockchainTransactionID
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Key-based retrieval failed', details: error.message });
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await Message.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .lean();

    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    const isAdmin = req.user.role === 'admin';
    const scope = isAdmin
      ? {}
      : {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        };

    const [encryptedSessions, blockchainVerifications, activeUsers, threatEvents, attackAttempts] = await Promise.all([
      Message.countDocuments(scope),
      Message.countDocuments({ ...scope, verificationStatus: 'verified' }),
      User.countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      AttackLog.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      AttackLog.countDocuments({
        blocked: true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);

    return res.json({
      encryptedSessions,
      blockchainVerifications,
      threatEvents,
      activeUsers,
      attackAttempts,
      systemHealth: getSecurityState().emergencyShutdown ? 'degraded' : 'healthy'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load dashboard stats', details: error.message });
  }
}

module.exports = {
  sendMessage,
  getInbox,
  decryptMessage,
  retrieveByKey,
  verifyMessage,
  getAuditLogs,
  getDashboardStats
};

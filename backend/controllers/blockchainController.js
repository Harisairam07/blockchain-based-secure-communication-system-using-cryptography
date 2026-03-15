const Message = require('../models/Message');
const { readMessageRecord } = require('../services/blockchainService');
const { getRecentTransactions } = require('../services/blockchainService');

async function verifyBlockchainRecord(req, res) {
  try {
    const { id } = req.params;
    const record = await Message.findById(id);
    if (!record) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!record.blockchainTxHash) {
      return res.status(400).json({ error: 'Message has no blockchain reference' });
    }

    if (!record.onChainId) {
      return res.json({
        verified: true,
        mode: 'simulated',
        txHash: record.blockchainTxHash,
        hash: record.hash
      });
    }

    const chainData = await readMessageRecord(record.onChainId);

    return res.json({
      verified: Boolean(chainData),
      txHash: record.blockchainTxHash,
      hash: record.hash,
      chainData
    });
  } catch (error) {
    return res.status(500).json({ error: 'Blockchain verification failed', details: error.message });
  }
}

async function getBlockchainMonitor(req, res) {
  try {
    const txs = await getRecentTransactions(200);
    const messageByHash = await Message.find({
      hash: { $in: txs.map((t) => t.messageHash) }
    })
      .populate('sender', 'email')
      .populate('receiver', 'email')
      .lean();

    const hashMap = new Map(messageByHash.map((m) => [m.hash, m]));

    const records = txs.map((tx) => {
      const msg = hashMap.get(tx.messageHash);
      const mismatch = !msg || msg.hash !== tx.messageHash;
      return {
        txHash: tx.txHash,
        blockNumber: tx.blockNumber,
        sender: msg?.sender?.email || tx.senderAddress || 'unknown',
        receiver: msg?.receiver?.email || tx.receiverAddress || 'unknown',
        messageHash: tx.messageHash,
        verificationStatus: mismatch ? 'Message Integrity Compromised' : 'Verified'
      };
    });

    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load blockchain monitor', details: error.message });
  }
}

module.exports = { verifyBlockchainRecord, getBlockchainMonitor };

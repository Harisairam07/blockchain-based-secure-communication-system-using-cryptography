const { ethers } = require('ethers');
const Transaction = require('../models/Transaction');

const abi = [
  'function storeMessageHash(bytes32 messageHash,address sender,address receiver,uint256 timestamp,bytes signature) returns (uint256)',
  'function verifyMessageHash(bytes32 messageHash) view returns (bool)',
  'function getMessageRecord(uint256 id) view returns (tuple(bytes32 messageHash,address sender,address receiver,uint256 timestamp,bytes signature))',
  'function messageCount() view returns (uint256)'
];

function getContract() {
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    return null;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, abi, wallet);
}

async function writeMessageRecord({ hashHex, senderWallet, receiverWallet, timestamp, signatureBase64 }) {
  const contract = getContract();
  if (!contract) {
    const simulated = {
      txHash: `demo-${Date.now()}`,
      onChainId: null,
      simulated: true
    };

    await Transaction.create({
      txHash: simulated.txHash,
      onChainId: null,
      messageHash: hashHex,
      senderAddress: senderWallet || null,
      receiverAddress: receiverWallet || null,
      timestamp,
      signature: signatureBase64,
      status: 'simulated',
      blockNumber: null,
      error: null
    });

    return {
      ...simulated
    };
  }

  try {
    const bytesHash = `0x${hashHex}`;
    const sigBytes = Buffer.from(signatureBase64, 'base64');
    const tx = await contract.storeMessageHash(
      bytesHash,
      senderWallet || ethers.ZeroAddress,
      receiverWallet || ethers.ZeroAddress,
      timestamp,
      sigBytes
    );

    const receipt = await tx.wait();
    await Transaction.create({
      txHash: receipt.hash,
      onChainId: Number(await contract.messageCount()),
      messageHash: hashHex,
      senderAddress: senderWallet || null,
      receiverAddress: receiverWallet || null,
      timestamp,
      signature: signatureBase64,
      status: 'confirmed',
      blockNumber: Number(receipt.blockNumber || 0),
      error: null
    });

    return {
      txHash: receipt.hash,
      onChainId: Number(await contract.messageCount())
    };
  } catch (error) {
    const fallback = {
      txHash: `fallback-${Date.now()}`,
      onChainId: null,
      simulated: true,
      details: error.message
    };

    await Transaction.create({
      txHash: fallback.txHash,
      onChainId: null,
      messageHash: hashHex,
      senderAddress: senderWallet || null,
      receiverAddress: receiverWallet || null,
      timestamp,
      signature: signatureBase64,
      status: 'failed',
      blockNumber: null,
      error: error.message
    });

    return {
      ...fallback
    };
  }
}

async function readMessageRecord(onChainId) {
  const contract = getContract();
  if (!contract) {
    return null;
  }
  return contract.getMessageRecord(onChainId);
}

async function getRecentTransactions(limit = 100) {
  return Transaction.find().sort({ createdAt: -1 }).limit(limit).lean();
}

module.exports = {
  writeMessageRecord,
  readMessageRecord,
  getRecentTransactions
};

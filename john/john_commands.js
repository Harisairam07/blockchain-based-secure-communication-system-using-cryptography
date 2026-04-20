const User = require('../backend/models/User');
const Message = require('../backend/models/Message');
const AttackLog = require('../backend/models/AttackLog');
const { getRecentTransactions, readMessageRecord } = require('../backend/services/blockchainService');
const {
  generateRsaKeyPair,
  encryptPrivateKey,
  sha256,
  verifySignature
} = require('../backend/services/cryptoService');
const { logAttack } = require('../backend/services/attackDetectionService');
const { getSecurityState, setEmergencyShutdown } = require('../backend/services/securityStateService');
const config = require('./john_config.json');
const { logJohnActivity } = require('./john_logger');

const UNKNOWN_RESPONSE = "I'm sorry Sir, I didn't quite catch that. Could you rephrase?";

function stripWakeWord(text = '') {
  return String(text)
    .trim()
    .replace(/^hey[\s,]+john[\s,]*/i, '')
    .replace(/^john[\s,]*/i, '')
    .trim();
}

function parseJohnCommand(rawText = '') {
  const original = String(rawText || '').trim();
  const text = stripWakeWord(original).toLowerCase();

  if (!text) return { intent: 'greeting', sensitive: false, original, text };

  const verifyMatch = text.match(/\b(?:verify|validate|check)\s+(?:block|message|record)?\s*([a-f0-9]{12,}|demo-\d+|fallback-\d+|\d+)/i);
  if (verifyMatch) return { intent: 'verify_block', sensitive: false, original, text, blockId: verifyMatch[1] };

  const sendMatch = text.match(/\bsend\s+(?:an?\s+)?encrypted\s+message\s+to\s+(.+)$/i);
  if (sendMatch) {
    return { intent: 'send_encrypted_message', sensitive: true, original, text, recipient: cleanEntity(sendMatch[1]) };
  }

  if (/\b(blockchain|chain|ledger)\b.*\b(status|health|integrity)\b|\bshow blockchain status\b/.test(text)) {
    return { intent: 'blockchain_status', sensitive: false, original, text };
  }
  if (/\b(scan|check|search)\b.*\b(tamper|tampering|integrity|compromise)\b/.test(text)) {
    return { intent: 'scan_tampering', sensitive: true, original, text };
  }
  if (/\b(who is online|active users|online users|active nodes|online nodes)\b/.test(text)) {
    return { intent: 'who_online', sensitive: false, original, text };
  }
  if (/\b(lock|shutdown|secure)\b.*\b(system|platform|operations)\b|\block system\b/.test(text)) {
    return { intent: 'lock_system', sensitive: true, original, text };
  }
  if (/\b(generate|rotate|create)\b.*\b(keys?|rsa|keypair)\b|\bgenerate new keys\b/.test(text)) {
    return { intent: 'generate_keys', sensitive: true, original, text };
  }
  if (/\b(encrypt|cipher)\b.*\b(message|text|payload)\b|\bencryption workflow\b/.test(text)) {
    return { intent: 'encrypt_message', sensitive: false, original, text };
  }
  if (/\b(decrypt|decipher)\b.*\b(message|text|payload)\b|\bdecryption workflow\b/.test(text)) {
    return { intent: 'decrypt_message', sensitive: false, original, text };
  }
  if (/\bdiagnostics?\b|\ball systems\b|\bsystem report\b/.test(text)) {
    return { intent: 'diagnostics', sensitive: false, original, text };
  }
  if (/\b(threats?|alerts?|intrusions?)\b/.test(text)) {
    return { intent: 'threat_report', sensitive: false, original, text };
  }

  return { intent: 'unknown', sensitive: false, original, text };
}

async function handleJohnCommand({ command, user, context = {}, req = null }) {
  const parsed = parseJohnCommand(command);
  const owner = getOwner(user);

  logJohnActivity('command_received', {
    user: user?.email,
    intent: parsed.intent,
    command: parsed.original
  });

  switch (parsed.intent) {
    case 'greeting':
      return johnResponse(`Good ${getTimeOfDay()}, I am ${config.name}. How may I assist you?`, parsed);
    case 'blockchain_status':
      return blockchainStatusResponse(parsed);
    case 'verify_block':
      return verifyBlockResponse(parsed);
    case 'send_encrypted_message':
      return startEncryptedMessageFlow(parsed, owner);
    case 'scan_tampering':
      return tamperScanResponse(parsed, user, req);
    case 'who_online':
      return onlineUsersResponse(parsed);
    case 'lock_system':
      return lockSystemResponse(parsed, user, req);
    case 'generate_keys':
      return generateKeysResponse(parsed, user, context, req);
    case 'encrypt_message':
      return johnResponse('Encryption protocol active. Opening the secure message workflow, Sir.', parsed, {
        action: { type: 'navigate', path: '/secure-chat', mode: 'encrypt' }
      });
    case 'decrypt_message':
      return johnResponse('Decryption workflow standing by. I will keep the sarcasm encrypted as well, Sir.', parsed, {
        action: { type: 'navigate', path: '/secure-chat', mode: 'decrypt' }
      });
    case 'diagnostics':
      return diagnosticsResponse(parsed, owner);
    case 'threat_report':
      return threatReportResponse(parsed);
    default:
      return johnResponse(UNKNOWN_RESPONSE, parsed);
  }
}

async function blockchainStatusResponse(parsed) {
  const integrity = await scanBlockchainIntegrity();
  const answer = integrity.compromised
    ? `Alert: Chain integrity compromised. ${integrity.compromisedRecords} suspect record${plural(integrity.compromisedRecords)} found.`
    : `All systems nominal. Blockchain integrity is nominal across ${integrity.checkedRecords} recent record${plural(integrity.checkedRecords)}.`;

  return johnResponse(answer, parsed, {
    severity: integrity.compromised ? 'critical' : 'normal',
    data: { integrity }
  });
}

async function verifyBlockResponse(parsed) {
  const result = await verifyBlockOrMessage(parsed.blockId);
  if (!result.found) {
    return johnResponse(`I could not locate block or message ${parsed.blockId}, Sir. It appears to be playing hard to get.`, parsed, {
      severity: 'warning',
      data: result
    });
  }

  if (result.verified) {
    return johnResponse(`Verification complete. Block ${parsed.blockId} is valid and its cryptographic signature checks out.`, parsed, {
      data: result
    });
  }

  return johnResponse(`Alert: Block ${parsed.blockId} failed verification. Chain integrity may be compromised.`, parsed, {
    severity: 'critical',
    data: result
  });
}

async function startEncryptedMessageFlow(parsed, owner) {
  const recipient = await findUserByNameOrEmail(parsed.recipient);
  if (!recipient) {
    return johnResponse(`I could not find ${parsed.recipient}, ${owner}. A precise recipient does help the whole secure communication part.`, parsed, {
      severity: 'warning'
    });
  }

  return johnResponse(`Encryption protocol active. Opening a secure channel to ${recipient.name || recipient.email}, ${owner}.`, parsed, {
    action: {
      type: 'navigate',
      path: '/secure-chat',
      mode: 'send',
      recipient: {
        id: String(recipient._id),
        name: recipient.name,
        email: recipient.email
      }
    }
  });
}

async function tamperScanResponse(parsed, user, req) {
  const integrity = await scanBlockchainIntegrity();
  if (!integrity.compromised) {
    return johnResponse(`Running diagnostics... All systems nominal. No tampering detected across ${integrity.checkedRecords} recent chain record${plural(integrity.checkedRecords)}.`, parsed, {
      data: { integrity }
    });
  }

  await logAttack({
    ip: req?.ip || 'john-local',
    email: user?.email || null,
    type: 'blockchain_tamper',
    userAgent: req?.headers?.['user-agent'] || 'JOHN',
    details: integrity,
    blocked: true
  });

  const lockdown = user?.role === 'admin'
    ? setEmergencyShutdown(true, 'JOHN detected blockchain tampering')
    : null;

  return johnResponse('Alert: Chain integrity compromised. Initiating countermeasures.', parsed, {
    severity: 'critical',
    data: { integrity, lockdown },
    action: { type: 'alert', mode: 'tamper' }
  });
}

async function onlineUsersResponse(parsed) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const users = await User.find({ lastLoginAt: { $gte: since } })
    .select('name email role lastLoginAt')
    .sort({ lastLoginAt: -1 })
    .limit(20)
    .lean();

  const names = users.map((u) => u.name || u.email).slice(0, 5);
  const answer = users.length
    ? `${users.length} active user${plural(users.length)} detected: ${names.join(', ')}${users.length > 5 ? ', and others' : ''}.`
    : 'No active users detected in the last 24 hours, Sir. Either quiet operations or everyone finally took a hint.';

  return johnResponse(answer, parsed, { data: { users } });
}

async function lockSystemResponse(parsed, user, req) {
  if (user?.role !== 'admin') {
    return johnResponse('Access denied. Security lockdown requires administrator privileges.', parsed, {
      severity: 'warning'
    });
  }

  const state = setEmergencyShutdown(true, `JOHN lockdown requested by ${user.email}`);
  await logAttack({
    ip: req?.ip || 'john-local',
    email: user.email,
    type: 'emergency_shutdown',
    userAgent: req?.headers?.['user-agent'] || 'JOHN',
    details: { source: 'JOHN voice command', state },
    blocked: true
  });

  return johnResponse('Security lockdown engaged. Non-essential API operations are now restricted, Sir.', parsed, {
    severity: 'critical',
    data: { state },
    action: { type: 'lockdown', state }
  });
}

async function generateKeysResponse(parsed, user, context, req) {
  const passphrase = String(context.securePassphrase || context.passphrase || '').trim();
  if (!passphrase) {
    return johnResponse('I need your signing passphrase before rotating cryptographic keys, Sir. Security can be terribly literal.', parsed, {
      requiresSecret: {
        label: 'Signing passphrase',
        field: 'securePassphrase',
        intent: parsed.intent,
        command: parsed.original
      }
    });
  }

  const record = await User.findById(user._id);
  if (!record) {
    return johnResponse('User profile unavailable. Key generation aborted.', parsed, { severity: 'warning' });
  }

  const pair = generateRsaKeyPair();
  const encrypted = encryptPrivateKey(pair.privateKey, passphrase);
  record.publicKey = pair.publicKey;
  record.encryptedPrivateKey = encrypted.encryptedPrivateKey;
  record.keySalt = encrypted.salt;
  record.keyIv = encrypted.iv;
  await record.save();

  logJohnActivity('key_generation_complete', {
    user: record.email,
    requestIp: req?.ip || null
  });

  return johnResponse('Key generation complete. Your keys are secured.', parsed, {
    data: { publicKeyFingerprint: sha256(pair.publicKey).slice(0, 16) }
  });
}

async function diagnosticsResponse(parsed, owner) {
  const [integrity, activeUsers, blockedThreats] = await Promise.all([
    scanBlockchainIntegrity(),
    User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    AttackLog.countDocuments({ blocked: true, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);
  const state = getSecurityState();
  const answer = integrity.compromised
    ? `Diagnostics complete, ${owner}. Blockchain integrity requires attention. ${blockedThreats} blocked threat${plural(blockedThreats)} logged today.`
    : `Running diagnostics... All systems nominal. ${activeUsers} active user${plural(activeUsers)}, ${blockedThreats} blocked threat${plural(blockedThreats)}, encryption protocol active.`;

  return johnResponse(answer, parsed, {
    severity: integrity.compromised || state.emergencyShutdown ? 'warning' : 'normal',
    data: { integrity, activeUsers, blockedThreats, state }
  });
}

async function threatReportResponse(parsed) {
  const threats = await AttackLog.find().sort({ createdAt: -1 }).limit(10).lean();
  const blocked = threats.filter((entry) => entry.blocked).length;
  const answer = threats.length
    ? `${threats.length} recent security event${plural(threats.length)} reviewed. ${blocked} blocked, because apparently subtlety remains optional.`
    : 'No recent threat events logged. I am monitoring all channels, Sir.';

  return johnResponse(answer, parsed, {
    severity: blocked ? 'warning' : 'normal',
    data: { threats }
  });
}

async function scanBlockchainIntegrity(limit = 200) {
  const txs = await getRecentTransactions(limit);
  const hashes = txs.map((tx) => tx.messageHash).filter(Boolean);
  const messages = await Message.find({ hash: { $in: hashes } })
    .select('hash messageHash verificationStatus blockchainTxHash onChainId encryptedMessage signature sender')
    .populate('sender', 'publicKey')
    .lean();
  const byHash = new Map(messages.map((msg) => [msg.hash, msg]));

  const compromised = [];
  for (const tx of txs) {
    const msg = byHash.get(tx.messageHash);
    const reasons = [];

    if (!msg) {
      reasons.push('missing_message_record');
    } else {
      const computedHash = msg.encryptedMessage ? sha256(msg.encryptedMessage) : null;
      if (computedHash && computedHash !== msg.hash) reasons.push('payload_hash_mismatch');
      if (msg.verificationStatus === 'failed') reasons.push('message_verification_failed');
      if (msg.messageHash !== tx.messageHash) reasons.push('transaction_hash_mismatch');
      if (msg.signature && msg.sender?.publicKey && !verifySignature(msg.hash, msg.signature, msg.sender.publicKey)) {
        reasons.push('signature_invalid');
      }
    }

    if (reasons.length) {
      compromised.push({
        txHash: tx.txHash,
        messageHash: tx.messageHash,
        blockNumber: tx.blockNumber,
        reasons
      });
    }
  }

  return {
    checkedRecords: txs.length,
    compromisedRecords: compromised.length,
    compromised: compromised.length > 0,
    records: txs.slice(0, 20),
    suspectRecords: compromised.slice(0, 20),
    emergencyShutdown: getSecurityState().emergencyShutdown
  };
}

async function verifyBlockOrMessage(id) {
  const query = [];
  if (Message.db.base.Types.ObjectId.isValid(id)) query.push({ _id: id });
  if (/^\d+$/.test(String(id))) query.push({ onChainId: Number(id) });
  query.push({ blockchainTxHash: id }, { blockchainTransactionID: id });

  const record = await Message.findOne({ $or: query })
    .populate('sender', 'publicKey email name')
    .lean();

  if (!record) return { found: false, id };

  const hashValid = sha256(record.encryptedMessage) === record.hash;
  const signatureValid = record.sender?.publicKey
    ? verifySignature(record.hash, record.signature, record.sender.publicKey)
    : false;
  let chainData = null;

  if (record.onChainId) {
    try {
      chainData = await readMessageRecord(record.onChainId);
    } catch (error) {
      chainData = { error: error.message };
    }
  }

  return {
    found: true,
    id,
    messageId: String(record._id),
    blockchainTxHash: record.blockchainTxHash,
    onChainId: record.onChainId,
    hashValid,
    signatureValid,
    verified: Boolean(hashValid && signatureValid),
    chainData
  };
}

async function findUserByNameOrEmail(input) {
  const value = String(input || '').trim();
  if (!value) return null;

  const exact = await User.findOne({
    $or: [
      { email: value.toLowerCase() },
      { name: new RegExp(`^${escapeRegExp(value)}$`, 'i') }
    ]
  }).select('name email role').lean();

  if (exact) return exact;

  return User.findOne({
    $or: [
      { email: new RegExp(escapeRegExp(value), 'i') },
      { name: new RegExp(escapeRegExp(value), 'i') }
    ]
  }).select('name email role').lean();
}

function johnResponse(answer, parsed, extra = {}) {
  return {
    answer,
    intent: parsed.intent,
    command: parsed.original,
    speaking: true,
    ...extra
  };
}

function getOwner(user) {
  return user?.name || config.owner || 'Sir';
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function cleanEntity(value) {
  return String(value || '').replace(/[.?!]+$/g, '').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function plural(count) {
  return Number(count) === 1 ? '' : 's';
}

module.exports = {
  UNKNOWN_RESPONSE,
  handleJohnCommand,
  parseJohnCommand,
  scanBlockchainIntegrity,
  verifyBlockOrMessage
};

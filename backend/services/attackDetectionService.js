const AttackLog = require('../models/AttackLog');

const attemptStore = new Map();
const messageRateStore = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MESSAGE_RATE_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 25;

function getKey(ip, email) {
  return `${ip}:${email || 'unknown'}`;
}

function getAttemptState(ip, email) {
  const key = getKey(ip, email);
  const now = Date.now();
  let state = attemptStore.get(key);

  if (!state || now - state.firstAttemptAt > WINDOW_MS) {
    state = { count: 0, firstAttemptAt: now };
  }

  state.count += 1;
  attemptStore.set(key, state);

  return { ...state, key, blocked: state.count >= MAX_ATTEMPTS };
}

async function logAttack({ ip, email = null, type, userAgent = '', details = {}, blocked = false }) {
  await AttackLog.create({ ip, email, type, userAgent, details, blocked });
}

function resetAttempts(ip, email) {
  attemptStore.delete(getKey(ip, email));
}

async function detectHoneypot(req) {
  if (req.body && req.body.hiddenField) {
    await logAttack({
      ip: req.ip,
      email: req.body.email || null,
      type: 'honeypot',
      userAgent: req.headers['user-agent'],
      details: { reason: 'Honeypot field populated' },
      blocked: true
    });
    return true;
  }
  return false;
}

async function registerLoginFailure(req, email) {
  const state = getAttemptState(req.ip, email);

  await logAttack({
    ip: req.ip,
    email,
    type: state.blocked ? 'bruteforce' : 'invalid_login',
    userAgent: req.headers['user-agent'],
    details: { attempts: state.count, windowMs: WINDOW_MS },
    blocked: state.blocked
  });

  return state;
}

function getMessageRateState(userId) {
  const now = Date.now();
  const key = String(userId);
  let state = messageRateStore.get(key);

  if (!state || now - state.startedAt > MESSAGE_RATE_WINDOW_MS) {
    state = { count: 0, startedAt: now };
  }

  state.count += 1;
  messageRateStore.set(key, state);

  return {
    count: state.count,
    blocked: state.count > MAX_MESSAGES_PER_WINDOW
  };
}

async function detectAbnormalMessaging(req, userId) {
  const state = getMessageRateState(userId);
  if (!state.blocked) {
    return state;
  }

  await logAttack({
    ip: req.ip,
    email: req.user?.email || null,
    type: 'abnormal_messaging',
    userAgent: req.headers['user-agent'],
    details: {
      count: state.count,
      windowMs: MESSAGE_RATE_WINDOW_MS,
      userId: String(userId)
    },
    blocked: true
  });

  return state;
}

async function detectSuspiciousIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const isProxyChain = typeof forwarded === 'string' && forwarded.includes(',');

  if (!isProxyChain) {
    return false;
  }

  await logAttack({
    ip: req.ip,
    email: req.user?.email || null,
    type: 'suspicious_ip',
    userAgent: req.headers['user-agent'],
    details: { forwardedFor: forwarded },
    blocked: false
  });

  return true;
}

async function getRecentAttackLogs(limit = 100) {
  return AttackLog.find().sort({ createdAt: -1 }).limit(limit).lean();
}

module.exports = {
  detectHoneypot,
  registerLoginFailure,
  detectAbnormalMessaging,
  detectSuspiciousIp,
  resetAttempts,
  getRecentAttackLogs,
  logAttack
};

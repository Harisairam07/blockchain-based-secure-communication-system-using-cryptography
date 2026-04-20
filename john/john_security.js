const User = require('../backend/models/User');
const AttackLog = require('../backend/models/AttackLog');
const { logAttack } = require('../backend/services/attackDetectionService');
const { logJohnActivity } = require('./john_logger');

const VOICE_THRESHOLD = 0.66;
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_MS = 15 * 60 * 1000;

function normalizeFeatures(features) {
  const vector = Array.isArray(features?.vector) ? features.vector : Array.isArray(features) ? features : [];
  const numeric = vector
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .slice(0, 32);

  if (numeric.length < 8) return null;

  const magnitude = Math.sqrt(numeric.reduce((sum, value) => sum + value * value, 0)) || 1;
  return numeric.map((value) => Number((value / magnitude).toFixed(6)));
}

function similarity(a, b) {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    magA += a[index] * a[index];
    magB += b[index] * b[index];
  }

  return Math.max(0, Math.min(1, Number((dot / ((Math.sqrt(magA) * Math.sqrt(magB)) || 1)).toFixed(4))));
}

async function verifyVoiceAuthentication({ user, features, enroll = false, req = null }) {
  const record = await User.findById(user._id);
  if (!record) {
    return {
      authenticated: false,
      locked: false,
      reason: 'user_not_found',
      message: 'Voice authentication failed. User profile unavailable.'
    };
  }

  if (record.johnLockedUntil && record.johnLockedUntil > new Date()) {
    return {
      authenticated: false,
      locked: true,
      reason: 'locked',
      message: 'Access denied. System locked.',
      lockedUntil: record.johnLockedUntil
    };
  }

  const vector = normalizeFeatures(features);
  if (!vector) {
    return {
      authenticated: false,
      locked: false,
      reason: 'invalid_voice_sample',
      message: 'Voice sample unreadable. Please try again, Sir.'
    };
  }

  const existing = normalizeFeatures(record.johnVoiceProfile);
  if (enroll || !existing) {
    record.johnVoiceProfile = { vector, samples: 1, updatedAt: new Date() };
    record.johnFailedVoiceAttempts = 0;
    record.johnLockedUntil = null;
    await record.save();

    logJohnActivity('voice_profile_enrolled', { user: record.email });
    return {
      authenticated: true,
      enrolled: true,
      score: 1,
      message: 'Voice profile registered. JOHN will now recognize your command pattern, Sir.'
    };
  }

  const score = similarity(vector, existing);
  if (score >= VOICE_THRESHOLD) {
    record.johnFailedVoiceAttempts = 0;
    record.johnLockedUntil = null;
    record.johnVoiceProfile = blendProfile(existing, vector, record.johnVoiceProfile?.samples || 1);
    await record.save();

    logJohnActivity('voice_auth_success', { user: record.email, score });
    return {
      authenticated: true,
      enrolled: false,
      score,
      message: 'Voice authentication accepted.'
    };
  }

  record.johnFailedVoiceAttempts = Number(record.johnFailedVoiceAttempts || 0) + 1;
  let locked = false;
  if (record.johnFailedVoiceAttempts >= MAX_FAILED_ATTEMPTS) {
    record.johnLockedUntil = new Date(Date.now() + LOCK_MS);
    locked = true;
  }
  await record.save();

  await logAttack({
    ip: req?.ip || 'john-local',
    email: record.email,
    type: 'john_voice_auth',
    userAgent: req?.headers?.['user-agent'] || 'JOHN',
    details: { score, attempts: record.johnFailedVoiceAttempts, locked },
    blocked: locked
  });

  logJohnActivity('voice_auth_failed', {
    user: record.email,
    score,
    attempts: record.johnFailedVoiceAttempts,
    locked
  });

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.johnFailedVoiceAttempts);
  return {
    authenticated: false,
    locked,
    score,
    attemptsRemaining: remaining,
    reason: locked ? 'locked' : 'voice_mismatch',
    message: locked
      ? 'Access denied. System locked.'
      : `Voice authentication failed. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
  };
}

async function getThreatAlerts(limit = 10) {
  const logs = await AttackLog.find({ blocked: true }).sort({ createdAt: -1 }).limit(limit).lean();

  return logs.map((entry) => ({
    id: String(entry._id),
    message: `Warning: Unauthorized access detected on Node ${nodeNumber(entry.ip)}`,
    node: nodeNumber(entry.ip),
    type: entry.type,
    ip: entry.ip,
    createdAt: entry.createdAt
  }));
}

function blendProfile(existing, sample, sampleCount) {
  const nextCount = Math.min(Number(sampleCount || 1) + 1, 10);
  const weight = 1 / nextCount;
  const length = Math.min(existing.length, sample.length);
  const vector = [];

  for (let index = 0; index < length; index += 1) {
    vector.push(Number((existing[index] * (1 - weight) + sample[index] * weight).toFixed(6)));
  }

  return { vector, samples: nextCount, updatedAt: new Date() };
}

function nodeNumber(input = '') {
  const sum = String(input)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return (sum % 5) + 1;
}

module.exports = {
  verifyVoiceAuthentication,
  getThreatAlerts,
  normalizeFeatures
};

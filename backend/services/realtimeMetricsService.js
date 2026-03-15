const Message = require('../models/Message');
const User = require('../models/User');
const AttackLog = require('../models/AttackLog');
const { getSecurityState } = require('./securityStateService');

// Computes live SOC metrics and broadcasts over websocket.
async function collectMetrics() {
  const [encryptedSessions, blockchainVerifications, threatEvents, activeUsers] = await Promise.all([
    Message.countDocuments(),
    Message.countDocuments({ verificationStatus: 'verified' }),
    AttackLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    User.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  return {
    encryptedSessions,
    blockchainVerifications,
    threatEvents,
    activeUsers,
    systemHealth: getSecurityState().emergencyShutdown ? 'degraded' : 'healthy',
    at: new Date().toISOString()
  };
}

async function emitRealtimeMetrics(io) {
  if (!io) return;
  const metrics = await collectMetrics();
  io.emit('metrics:update', metrics);
}

module.exports = {
  collectMetrics,
  emitRealtimeMetrics
};

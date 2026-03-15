const User = require('../models/User');
const { logAttack } = require('../services/attackDetectionService');
const { getSecurityState, setEmergencyShutdown } = require('../services/securityStateService');

async function listUsers(req, res) {
  try {
    const users = await User.find().select('name email role isBlocked blockedReason blockedAt lastLoginAt createdAt').sort({ createdAt: -1 }).lean();
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
}

async function blockUser(req, res) {
  try {
    const { id } = req.params;
    const { blocked = true, reason = 'manual_admin_block' } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = Boolean(blocked);
    user.blockedReason = user.isBlocked ? reason : null;
    user.blockedAt = user.isBlocked ? new Date() : null;
    await user.save();

    await logAttack({
      ip: req.ip,
      email: user.email,
      type: user.isBlocked ? 'suspicious_ip' : 'rate_limit',
      userAgent: req.headers['user-agent'],
      details: {
        action: user.isBlocked ? 'admin_block_user' : 'admin_unblock_user',
        admin: req.user.email,
        reason
      },
      blocked: user.isBlocked
    });

    return res.json({
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      user: {
        id: user._id,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        blockedAt: user.blockedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user block status', details: error.message });
  }
}

async function getSecurityStateController(req, res) {
  return res.json({ state: getSecurityState() });
}

async function toggleEmergencyShutdown(req, res) {
  try {
    const { enabled, reason } = req.body;
    const updated = setEmergencyShutdown(Boolean(enabled), reason || 'Manual admin activation');

    await logAttack({
      ip: req.ip,
      email: req.user.email,
      type: 'emergency_shutdown',
      userAgent: req.headers['user-agent'],
      details: {
        enabled: updated.emergencyShutdown,
        reason: updated.reason,
        updatedAt: updated.updatedAt
      },
      blocked: updated.emergencyShutdown
    });

    return res.json({
      message: updated.emergencyShutdown ? 'Emergency shutdown activated' : 'Emergency shutdown cleared',
      state: updated
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle emergency shutdown', details: error.message });
  }
}

module.exports = {
  listUsers,
  blockUser,
  getSecurityStateController,
  toggleEmergencyShutdown
};

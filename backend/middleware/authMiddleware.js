const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getDefaultAdminEmail() {
  return (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.isBlocked) {
      if (user.role === 'admin' && user.email === getDefaultAdminEmail()) {
        user.isBlocked = false;
        user.blockedReason = null;
        user.blockedAt = null;
        user.failedLoginCount = 0;
        await user.save();
      } else {
        return res.status(403).json({ error: 'User is blocked', reason: user.blockedReason || 'security_policy' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

module.exports = { authMiddleware, requireAdmin };

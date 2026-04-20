const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getDefaultAdminEmail() {
  return (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
}

function normalizeBearerToken(value) {
  if (!value) return null;
  let token = String(value).trim();

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }

  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = normalizeBearerToken(authHeader);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(401).json({ error: 'Token verification failed', details: error.message });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

module.exports = { authMiddleware, requireAdmin };

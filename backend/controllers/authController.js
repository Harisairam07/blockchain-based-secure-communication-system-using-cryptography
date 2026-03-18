const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const {
  generateRsaKeyPair,
  encryptPrivateKey
} = require('../services/cryptoService');
const {
  detectHoneypot,
  detectSuspiciousIp,
  registerLoginFailure,
  resetAttempts
} = require('../services/attackDetectionService');

function signToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

function getDefaultAdminEmail() {
  return (process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
}

function isConfiguredDefaultAdmin(user) {
  return user?.role === 'admin' && user?.email === getDefaultAdminEmail();
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { publicKey, privateKey } = generateRsaKeyPair();
    const { encryptedPrivateKey, salt, iv } = encryptPrivateKey(privateKey, password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      publicKey,
      encryptedPrivateKey,
      keySalt: salt,
      keyIv: iv
    });

    return res.status(201).json({
      message: 'Registration successful',
      token: signToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Registration failed', details: error.message });
  }
}

async function login(req, res) {
  try {
    const honeypotTriggered = await detectHoneypot(req);
    if (honeypotTriggered) {
      return res.status(403).json({ error: 'Suspicious request detected' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    await detectSuspiciousIp(req);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const attempt = await registerLoginFailure(req, email.toLowerCase());
      return res.status(401).json({ error: attempt.blocked ? 'Too many failed attempts' : 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const attempt = await registerLoginFailure(req, email.toLowerCase());
      return res.status(401).json({ error: attempt.blocked ? 'Too many failed attempts' : 'Invalid credentials' });
    }

    if (user.isBlocked) {
      if (isConfiguredDefaultAdmin(user)) {
        user.isBlocked = false;
        user.blockedReason = null;
        user.blockedAt = null;
      } else {
        return res.status(403).json({ error: 'Account blocked by security policy', reason: user.blockedReason || 'security_policy' });
      }
    }

    resetAttempts(req.ip, email.toLowerCase());
    user.failedLoginCount = 0;
    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: 'Login successful',
      token: (() => {
        const token = signToken(user._id, user.role);
        Session.create({
          user: user._id,
          tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
          ip: req.ip,
          userAgent: req.headers['user-agent'] || ''
        }).catch(() => null);
        return token;
      })(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed', details: error.message });
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};

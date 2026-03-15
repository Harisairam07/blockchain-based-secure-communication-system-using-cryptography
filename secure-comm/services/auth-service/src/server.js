require('dotenv').config({ path: '../../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User');
const { generateRsaPair, encryptPrivateKey, decryptPrivateKey } = require('./cryptoUtils');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const attempts = new Map();
function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.get('/health', (_, res) => res.json({ service: 'auth-service', status: 'ok' }));

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, hiddenField } = req.body;
    if (hiddenField) return res.status(403).json({ error: 'Bot detection triggered' });
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { publicKey, privateKey } = generateRsaPair();
    const secureKey = encryptPrivateKey(privateKey, password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'user',
      publicKey,
      ...secureKey
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password, hiddenField } = req.body;
    if (hiddenField) return res.status(403).json({ error: 'Bot detection triggered' });

    const key = `${req.ip}:${email?.toLowerCase()}`;
    const state = attempts.get(key) || { count: 0, time: Date.now() };
    if (state.count >= 5 && Date.now() - state.time < 15 * 60 * 1000) {
      return res.status(429).json({ error: 'Too many attempts' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      attempts.set(key, { count: state.count + 1, time: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      attempts.set(key, { count: state.count + 1, time: Date.now() });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    attempts.delete(key);
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id/public-key', async (req, res) => {
  const user = await User.findById(req.params.id).select('publicKey email');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ userId: user._id, email: user.email, publicKey: user.publicKey });
});

app.post('/users/:id/private-key', auth, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password required' });
  if (req.auth.userId !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  try {
    const privateKey = decryptPrivateKey(user.encryptedPrivateKey, password, user.keySalt, user.keyIv);
    res.json({ privateKey });
  } catch {
    res.status(401).json({ error: 'Invalid password for key access' });
  }
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(4001, () => console.log('auth-service on 4001'));
});

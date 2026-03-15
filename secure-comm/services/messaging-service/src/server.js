require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/health', (_, res) => res.json({ service: 'messaging-service', status: 'ok' }));

app.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, message, password, senderAddress = '0x0', receiverAddress = '0x0' } = req.body;
    if (!receiverId || !message || !password) return res.status(400).json({ error: 'Missing fields' });

    const [receiverKeyRes, privateKeyRes] = await Promise.all([
      axios.get(`${process.env.AUTH_SERVICE_URL}/users/${receiverId}/public-key`),
      axios.post(
        `${process.env.AUTH_SERVICE_URL}/users/${req.auth.userId}/private-key`,
        { password },
        { headers: { Authorization: `Bearer ${req.token}` } }
      )
    ]);

    const cryptoRes = await axios.post(`${process.env.CRYPTO_SERVICE_URL}/pipeline`, {
      message,
      receiverPublicKeyPem: receiverKeyRes.data.publicKey,
      senderPrivateKeyPem: privateKeyRes.data.privateKey
    });

    const record = await Message.create({
      senderId: req.auth.userId,
      receiverId,
      ...cryptoRes.data,
      verificationStatus: 'pending'
    });

    const chainRes = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL}/store`, {
      messageId: String(record._id),
      messageHash: record.hash,
      senderAddress,
      receiverAddress,
      timestamp: Date.now(),
      signature: record.signature
    });

    record.blockchainTxHash = chainRes.data.txHash;
    record.verificationStatus = 'verified';
    await record.save();

    io.to(receiverId).emit('incoming_message', { messageId: record._id, from: req.auth.userId, verified: true });

    res.status(201).json({ message: 'sent', data: record });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/inbox', auth, async (req, res) => {
  const messages = await Message.find({ receiverId: req.auth.userId }).sort({ createdAt: -1 }).lean();
  res.json({ messages });
});

app.post('/verify/:id', auth, async (req, res) => {
  const msg = await Message.findById(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  const verify = await axios.post(`${process.env.BLOCKCHAIN_SERVICE_URL}/verify`, {
    messageId: String(msg._id),
    messageHash: msg.hash
  });
  res.json(verify.data);
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(String(userId)));
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(4002, () => console.log('messaging-service on 4002'));
});

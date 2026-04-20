const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const johnRoutes = require('./routes/johnRoutes');
const { logAttack } = require('./services/attackDetectionService');
const { getSecurityState } = require('./services/securityStateService');
const { emitRealtimeMetrics } = require('./services/realtimeMetricsService');
const { ensureDefaultAdmin } = require('./services/seedService');
const { createJohnAssistant } = require('../john');

function getAllowedOrigins() {
  const fallback = [
    'http://localhost:5173',
    'https://harisairam07.github.io',
    'https://harisairam07.github.io/blockchain-based-secure-communication-system-using-cryptography'
  ];
  const raw = process.env.FRONTEND_URL;
  if (!raw) return fallback;

  const parsed = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return parsed.length ? parsed : fallback;
}

const allowedOrigins = getAllowedOrigins();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on('connection', (socket) => {
  emitRealtimeMetrics(io).catch(() => null);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(String(userId));
    }
  });

  socket.on('send_message', (payload) => {
    if (!payload || !payload.receiver) return;
    io.to(String(payload.receiver)).emit('receive_message', {
      ...payload,
      encrypted: true,
      timestamp: payload.timestamp || new Date().toISOString()
    });
  });
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await logAttack({
      ip: req.ip,
      type: 'rate_limit',
      userAgent: req.headers['user-agent'],
      details: { path: req.originalUrl },
      blocked: true
    });

    res.status(429).json({ error: 'Too many requests. Try later.' });
  }
});

app.use('/api', limiter);

app.use('/api', (req, res, next) => {
  const state = getSecurityState();

  if (!state.emergencyShutdown) {
    return next();
  }

  const path = req.path || '';
  const allowlist = ['/auth/login', '/auth/me', '/auth/register', '/john'];
  if (allowlist.some((p) => path.startsWith(p))) {
    return next();
  }

  if (path.startsWith('/admin')) {
    return next();
  }

  return res.status(503).json({
    error: 'Emergency shutdown active. API operations are restricted.',
    state
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'secure-communication-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/john', johnRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ error: 'Internal server error', details: error.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_comm';
const MONGODB_FALLBACK_URI = process.env.MONGODB_FALLBACK_URI || 'mongodb://127.0.0.1:27017/secure_comm';

async function connectToMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    const canFallback = MONGODB_FALLBACK_URI && MONGODB_FALLBACK_URI !== MONGODB_URI;
    if (!canFallback) {
      throw error;
    }

    console.warn(`Primary MongoDB connection failed, retrying with fallback URI: ${error.message}`);
    await mongoose.connect(MONGODB_FALLBACK_URI);
  }
}

connectToMongo()
  .then(async () => {
    const seeded = await ensureDefaultAdmin();
    if (seeded.created) {
      console.log(`Default admin user created: ${seeded.email}`);
    } else if (seeded.recovered) {
      console.log(`Default admin user recovered/unblocked: ${seeded.email}`);
    }
    server.listen(PORT, () => {
      console.log(`Secure Communication API running at http://localhost:${PORT}`);
    });

    const johnAssistant = createJohnAssistant();
    johnAssistant.start({ io });

    setInterval(() => {
      emitRealtimeMetrics(io).catch(() => null);
    }, 8000);
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

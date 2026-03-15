require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.get('/health', (req, res) => res.json({ service: 'gateway', status: 'ok' }));

app.use('/api/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true }));
app.use('/api/messages', createProxyMiddleware({ target: process.env.MESSAGE_SERVICE_URL, changeOrigin: true }));
app.use('/api/crypto', createProxyMiddleware({ target: process.env.CRYPTO_SERVICE_URL, changeOrigin: true }));
app.use('/api/blockchain', createProxyMiddleware({ target: process.env.BLOCKCHAIN_SERVICE_URL, changeOrigin: true }));

app.listen(process.env.GATEWAY_PORT || 8080, () => {
  console.log(`Gateway running on ${process.env.GATEWAY_PORT || 8080}`);
});

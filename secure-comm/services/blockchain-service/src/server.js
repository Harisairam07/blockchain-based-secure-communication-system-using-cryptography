require('dotenv').config({ path: '../../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const records = new Map();

app.get('/health', (_, res) => res.json({ service: 'blockchain-service', status: 'ok' }));

app.post('/store', async (req, res) => {
  const { messageId, messageHash, senderAddress, receiverAddress, timestamp, signature } = req.body;
  const txHash = `demo-tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  records.set(messageId, { messageHash, senderAddress, receiverAddress, timestamp, signature, txHash });
  res.json({ txHash, status: 'recorded' });
});

app.post('/verify', async (req, res) => {
  const { messageId, messageHash } = req.body;
  const rec = records.get(messageId);
  if (!rec) return res.status(404).json({ verified: false, reason: 'not_found' });
  res.json({ verified: rec.messageHash === messageHash, txHash: rec.txHash, record: rec });
});

app.get('/record/:messageId', (req, res) => {
  const rec = records.get(req.params.messageId);
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json(rec);
});

app.listen(4004, () => console.log('blockchain-service on 4004'));

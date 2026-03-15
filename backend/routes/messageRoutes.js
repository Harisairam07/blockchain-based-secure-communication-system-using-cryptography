const express = require('express');
const {
  sendMessage,
  getInbox,
  decryptMessage,
  retrieveByKey,
  verifyMessage,
  getAuditLogs,
  getDashboardStats
} = require('../controllers/messageController');
const { verifyBlockchainRecord } = require('../controllers/blockchainController');
const { getRecentAttackLogs } = require('../services/attackDetectionService');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/send', sendMessage);
router.post('/retrieve-by-key', retrieveByKey);
router.get('/inbox', getInbox);
router.get('/get', getInbox);
router.get('/stats', getDashboardStats);
router.get('/admin/audit', requireAdmin, getAuditLogs);
router.get('/admin/attacks', requireAdmin, async (req, res) => {
  const logs = await getRecentAttackLogs(200);
  res.json({ logs });
});
router.post('/:id/decrypt', decryptMessage);
router.get('/:id/verify', verifyMessage);
router.get('/:id/blockchain', verifyBlockchainRecord);

module.exports = router;

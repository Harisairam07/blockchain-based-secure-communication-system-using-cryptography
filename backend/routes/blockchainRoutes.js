const express = require('express');
const { verifyBlockchainRecord, getBlockchainMonitor } = require('../controllers/blockchainController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Compatibility endpoint for /api/blockchain/verify/:id
router.get('/verify/:id', verifyBlockchainRecord);
router.get('/monitor', getBlockchainMonitor);

module.exports = router;

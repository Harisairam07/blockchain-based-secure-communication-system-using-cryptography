const express = require('express');
const {
  listUsers,
  blockUser,
  getSecurityStateController,
  toggleEmergencyShutdown
} = require('../controllers/adminController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id/block', blockUser);
router.get('/security-state', getSecurityStateController);
router.post('/emergency-shutdown', toggleEmergencyShutdown);

module.exports = router;

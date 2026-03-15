const express = require('express');
const { upload, uploadFile, downloadFile, decryptDownloadFile } = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:fileId', downloadFile);
router.post('/download/:fileId/decrypt', decryptDownloadFile);

module.exports = router;
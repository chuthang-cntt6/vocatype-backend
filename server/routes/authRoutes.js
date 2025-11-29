// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: path.join(__dirname, '../../client/public/avatars') });
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', auth.register);
router.post('/login', auth.login);

// OAuth routes
router.get('/google', auth.googleAuth);
router.get('/google/callback', auth.googleAuthCallback);
router.get('/facebook', auth.facebookAuth);
router.get('/facebook/callback', auth.facebookAuthCallback);

// Route upload avatar (bảo vệ bằng token)
router.post('/users/avatar', authMiddleware.verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const ext = path.extname(req.file.originalname);
    const newFilename = `avatar_${userId}${ext}`;
    const newPath = path.join(req.file.destination, newFilename);
    fs.renameSync(req.file.path, newPath);
    const avatarUrl = `/avatars/${newFilename}`;
    // Cập nhật DB
    await require('../models/db').query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);
    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
  
});

// Lấy thông tin user hiện tại (bảo vệ bằng token)
router.get('/users/me', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const db = require('../models/db');
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Cập nhật thông tin user (bảo vệ bằng token)
router.put('/users/profile', authMiddleware.verifyToken, auth.updateProfile);

// Forgot Password routes (không cần token)
router.post('/forgot-password', auth.forgotPassword);
router.get('/validate-token', auth.validateResetToken);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, notificationController.getNotificationsForUser);
router.get('/:id', verifyToken, notificationController.getNotificationDetail);
router.post('/mark-all-read', verifyToken, notificationController.markAllRead);
router.post('/:id/mark-read', verifyToken, notificationController.markAsRead);

module.exports = router;
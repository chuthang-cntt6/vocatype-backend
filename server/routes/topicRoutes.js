const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const vocabController = require('../controllers/vocabController');
const authMiddleware = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

// Danh sách các topic
router.get('/', topicController.getTopics);

// Lấy danh sách từ vựng của 1 topic
router.get('/:id/vocab', vocabController.getByTopic);

// Lấy 1 topic cụ thể
router.get('/:id', topicController.getTopicById);

// Các route dưới đây yêu cầu đăng nhập và phải là teacher
router.use(authMiddleware.verifyToken);
router.use(roleMiddleware(['teacher']));

// Tạo chủ đề mới
router.post('/', topicController.createTopic);

// Cập nhật chủ đề
router.put('/:id', topicController.updateTopic);

// Xóa chủ đề
router.delete('/:id', topicController.deleteTopic);

module.exports = router;

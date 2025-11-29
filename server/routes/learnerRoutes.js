// server/routes/learnerRoutes.js
const express = require('express');
const router = express.Router();
const learner = require('../controllers/learnerController');
const typingController = require('../controllers/typingController');

// 📌 Lấy thông tin học viên
// router.get('/:id', learner.getProfile); // Undefined handler

// 📌 Gửi kết quả học
router.post('/:id/submit', learner.submitTypingResult); // Fixed handler name

// 📌 Cập nhật cấp độ hoặc streak
// router.put('/:id/progress', learner.updateProgress); // Undefined handler

// 📌 Lấy thống kê học tập (WPM, Accuracy, số từ đã học)
// router.get('/:id/stats', learner.getStatistics); // Undefined handler

// Lấy dashboard tổng hợp
router.get('/:id/dashboard', learner.getDashboard);
// Lấy lịch sử luyện tập
router.get('/:id/history', learner.getHistory);

// Lưu kết quả học từ mới
router.post('/:id/save-learning-progress', learner.saveLearningProgress);
router.get('/:id/learning-summary', learner.getTodayLearningSummary);
router.post('/:id/add-exp', learner.addExpForActivity);

router.get('/:id/review-schedule', learner.getReviewSchedule);
router.get('/:id/review-schedule/today', learner.getTodayReviewSchedule);

router.post('/:id/typingrecord', typingController.create);

// Dictation activity endpoints
router.post('/:id/dictation-activity', learner.saveDictationActivity);
router.get('/:id/dictation-recent', learner.getDictationRecent);

// router.post('/join-class', require('../middlewares/authMiddleware').verifyToken, learner.joinClass); // Removed - no longer needed

module.exports = router;

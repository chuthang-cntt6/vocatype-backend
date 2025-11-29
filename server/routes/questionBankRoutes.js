const express = require('express');
const router = express.Router();
const questionBank = require('../controllers/questionBankController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/authMiddleware');

// Tạo bộ đề thi mới (giáo viên hoặc admin)
router.post('/', verifyToken, questionBank.createQuestionBank);

// Lấy danh sách bộ đề thi (đã gộp AI search vào đây)
router.get('/', questionBank.getQuestionBanks);

// AI-assisted search endpoint
router.get('/search/ai', questionBank.aiSearchQuestionBanks);

// Legacy endpoint for backward compatibility
router.get('/question-bank/search/ai', questionBank.aiSearchQuestionBanks);

// Teacher routes - MUST be before /:id route
router.get('/my-tests', verifyToken, questionBank.getMyTests);

// Lấy chi tiết bộ đề thi
router.get('/:id', questionBank.getQuestionBankById);

// Lấy lịch sử làm bài thi
router.get('/history/attempts', verifyToken, questionBank.getExamHistory);

// Lấy danh sách attempts của user cho bank này
router.get('/:id/attempts', verifyToken, questionBank.getAttemptsByBank);

// Lấy chi tiết một attempt
router.get('/attempts/:attempt_id', verifyToken, questionBank.getAttemptDetail);

// Cập nhật bộ đề thi (chỉ giáo viên)
router.put('/:id', verifyToken, requireRole('teacher'), questionBank.updateQuestionBank);

// Xóa bộ đề thi (Admin và Teacher)
router.delete('/:id', verifyToken, questionBank.deleteQuestionBank);

// Làm bài thi
router.get('/:bank_id/take', verifyToken, questionBank.takeExam);

// Nộp bài thi
router.post('/:bank_id/submit', verifyToken, questionBank.submitExam);

// Tạo passage cho bộ đề
router.post('/:id/passages', verifyToken, questionBank.createPassage);

// Tạo question cho bộ đề
router.post('/:id/questions', verifyToken, questionBank.createQuestion);

// TOEIC random exam endpoints
router.get('/toeic/random', questionBank.generateRandomToeic);
router.post('/toeic/grade', questionBank.gradeRandomToeic);

// Admin approval routes
router.get('/admin/pending', verifyToken, requireRole('admin'), questionBank.getPendingTests);
router.post('/:id/approve', verifyToken, requireRole('admin'), questionBank.approveQuestionBank);
router.post('/:id/reject', verifyToken, requireRole('admin'), questionBank.rejectQuestionBank);

module.exports = router;
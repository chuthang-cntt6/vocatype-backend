const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken } = require('../middlewares/authMiddleware');

// 📌 Lấy danh sách học sinh của giáo viên
router.get('/students', verifyToken, teacherController.getStudents);

// 📌 Giao bài tập cho học sinh
router.post('/assignments', verifyToken, teacherController.createAssignment);

// 📌 Lấy danh sách assignment đã giao
router.get('/assignments', verifyToken, teacherController.getAssignments);

// 📌 Lấy thống kê assignment của học sinh
router.get('/assignments/:assignmentId/students/:studentId/stats', verifyToken, teacherController.getAssignmentStats);

// 📌 Bảng xếp hạng (Leaderboard)
router.get('/leaderboard', teacherController.getLeaderboard);

module.exports = router;

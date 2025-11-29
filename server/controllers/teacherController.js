const db = require('../models/db');

// 📌 Lấy danh sách học sinh của giáo viên
exports.getStudents = async (req, res) => {
  const teacherId = req.user.id; // từ token
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url
       FROM users u
       JOIN class_student cs ON u.id = cs.student_id
       JOIN class c ON cs.class_id = c.id
       WHERE c.teacher_id = $1 AND u.role = 'learner'`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getStudents:', err);
    res.status(500).json({ error: 'Không lấy được danh sách học sinh' });
  }
};

// 📌 Giao bài tập cho học sinh
exports.createAssignment = async (req, res) => {
  const teacherId = req.user.id;
  const { title, description, deadline, studentIds } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO assignment (title, description, deadline, teacher_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [title, description, deadline, teacherId]
    );

    const assignmentId = result.rows[0].id;

    // Gán bài tập cho học sinh
    for (let sid of studentIds) {
      await db.query(
        `INSERT INTO assignment_student (assignment_id, student_id)
         VALUES ($1, $2)`,
        [assignmentId, sid]
      );
    }

    res.json({ message: 'Đã tạo bài tập', assignmentId });
  } catch (err) {
    console.error('Error createAssignment:', err);
    res.status(500).json({ error: 'Không tạo được bài tập' });
  }
};

// 📌 Lấy danh sách assignment đã giao
exports.getAssignments = async (req, res) => {
  const teacherId = req.user.id;
  try {
    const result = await db.query(
      `SELECT id, title, description, deadline, created_at
       FROM assignment
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getAssignments:', err);
    res.status(500).json({ error: 'Không lấy được danh sách bài tập' });
  }
};

// 📌 Lấy thống kê assignment của học sinh
exports.getAssignmentStats = async (req, res) => {
  const { assignmentId, studentId } = req.params;
  try {
    const result = await db.query(
      `SELECT tr.wpm, tr.accuracy, tr.errors, tr.created_at
       FROM typingrecord tr
       JOIN assignment_student ast ON tr.learner_id = ast.student_id
       WHERE ast.assignment_id = $1 AND ast.student_id = $2
       ORDER BY tr.created_at DESC`,
      [assignmentId, studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getAssignmentStats:', err);
    res.status(500).json({ error: 'Không lấy được thống kê' });
  }
};

// 📌 Bảng xếp hạng (Leaderboard)
exports.getLeaderboard = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.avatar_url,
             COALESCE(MAX(t.wpm), 0) as best_wpm,
             COALESCE(AVG(t.accuracy), 0) as avg_accuracy,
             COUNT(t.*) as tests
      FROM users u
      LEFT JOIN typingrecord t ON u.id = t.learner_id
      WHERE u.role = 'learner'
      GROUP BY u.id, u.name, u.avatar_url
      ORDER BY best_wpm DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error getLeaderboard:', err);
    res.status(500).json({ error: 'Không lấy được leaderboard' });
  }
};
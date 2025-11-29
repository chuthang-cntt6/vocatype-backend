const db = require('../models/db');

// Lấy danh sách chủ đề
exports.getTopics = async (req, res) => {
  try {
    let result;
    const user = req.user || req.session?.user;
    if (user && user.role === 'teacher') {
      // Giáo viên: lấy tất cả chủ đề public hoặc do mình tạo
      result = await db.query(
        'SELECT * FROM topic WHERE is_public = true OR created_by = $1 ORDER BY title ASC',
        [user.id]
      );
    } else {
      // Học viên: chỉ lấy chủ đề public
      result = await db.query(
        'SELECT * FROM topic WHERE is_public = true ORDER BY title ASC'
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getTopics:', err);
    res.status(500).json({ error: 'Không thể tải danh sách chủ đề', detail: err.message });
  }
};

// Lấy 1 chủ đề cụ thể theo ID
exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, title, description, level, created_by FROM topic WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chủ đề' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getTopicById:', err);
    res.status(500).json({ error: 'Không thể tải thông tin chủ đề', detail: err.message });
  }
};

// Tạo chủ đề mới (chỉ dành cho teacher)
exports.createTopic = async (req, res) => {
  const { title, description, level, created_by } = req.body;
  
  if (!title || title.trim().length < 2) {
    return res.status(400).json({ error: 'Tên chủ đề phải có ít nhất 2 ký tự' });
  }

  try {
    // Kiểm tra xem chủ đề đã tồn tại chưa
    const existing = await db.query(
      'SELECT id FROM topic WHERE LOWER(title) = LOWER($1)',
      [title.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Chủ đề này đã tồn tại' });
    }

    // Thêm chủ đề mới
    const result = await db.query(
      'INSERT INTO topic (title, description, level, created_by) VALUES ($1, $2, $3, $4) RETURNING id, title, description, level, created_by',
      [title.trim(), description?.trim() || null, level || 1, created_by || 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in createTopic:', err);
    res.status(500).json({ error: 'Không thể tạo chủ đề mới', detail: err.message });
  }
};

// Cập nhật chủ đề (chỉ dành cho teacher)
exports.updateTopic = async (req, res) => {
  const { id } = req.params;
  const { title, description, level } = req.body;

  if (!title || title.trim().length < 2) {
    return res.status(400).json({ error: 'Tên chủ đề phải có ít nhất 2 ký tự' });
  }

  try {
    // Kiểm tra xem chủ đề có tồn tại không
    const existing = await db.query(
      'SELECT id FROM topic WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chủ đề' });
    }

    // Cập nhật chủ đề
    const result = await db.query(
      'UPDATE topic SET title = $1, description = $2, level = $3 WHERE id = $4 RETURNING id, title, description, level, created_by',
      [title.trim(), description?.trim() || null, level || 1, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in updateTopic:', err);
    res.status(500).json({ error: 'Không thể cập nhật chủ đề', detail: err.message });
  }
};

// Xóa chủ đề (chỉ dành cho teacher)
exports.deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra xem chủ đề có từ vựng không
    const vocabCount = await db.query(
      'SELECT COUNT(*) FROM vocabulary WHERE topic_id = $1',
      [id]
    );

    if (vocabCount.rows[0].count > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa chủ đề này vì đã có từ vựng được gán cho nó' 
      });
    }

    // Xóa chủ đề
    await db.query('DELETE FROM topic WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa chủ đề thành công' });
  } catch (err) {
    console.error('Error in deleteTopic:', err);
    res.status(500).json({ error: 'Không thể xóa chủ đề', detail: err.message });
  }
};

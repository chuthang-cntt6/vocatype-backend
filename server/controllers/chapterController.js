const db = require('../models/db');

// Get all chapters for a specific topic
const getChaptersByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    
    const result = await db.query(`
      SELECT c.*, 
             COUNT(v.id) as vocab_count,
             t.title as topic_title
      FROM chapters c
      LEFT JOIN vocabulary v ON c.id = v.chapter_id
      LEFT JOIN topic t ON c.topic_id = t.id
      WHERE c.topic_id = $1
      GROUP BY c.id, t.title
      ORDER BY c.order_index ASC
    `, [topicId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chương'
    });
  }
};

// Get vocabulary for a specific chapter
const getVocabularyByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    const result = await db.query(`
      SELECT v.*, c.title as chapter_title, t.title as topic_title
      FROM vocabulary v
      LEFT JOIN chapters c ON v.chapter_id = c.id
      LEFT JOIN topic t ON v.topic_id = t.id
      WHERE v.chapter_id = $1
      ORDER BY v.id ASC
    `, [chapterId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting vocabulary by chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy từ vựng theo chương'
    });
  }
};

// Get chapter details
const getChapterDetails = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    const result = await db.query(`
      SELECT c.*, 
             t.title as topic_title,
             COUNT(v.id) as vocab_count
      FROM chapters c
      LEFT JOIN topic t ON c.topic_id = t.id
      LEFT JOIN vocabulary v ON c.id = v.chapter_id
      WHERE c.id = $1
      GROUP BY c.id, t.title
    `, [chapterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting chapter details:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin chương'
    });
  }
};

// Create a new chapter
const createChapter = async (req, res) => {
  try {
    const { topic_id, title, description, order_index } = req.body;
    
    const result = await db.query(`
      INSERT INTO chapters (topic_id, title, description, order_index)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [topic_id, title, description, order_index || 0]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tạo chương thành công'
    });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo chương'
    });
  }
};

// Update chapter
const updateChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, order_index } = req.body;
    
    const result = await db.query(`
      UPDATE chapters 
      SET title = $1, description = $2, order_index = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [title, description, order_index, chapterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cập nhật chương thành công'
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật chương'
    });
  }
};

// Delete chapter
const deleteChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    // First, update vocabulary to remove chapter_id
    await db.query(`
      UPDATE vocabulary 
      SET chapter_id = NULL 
      WHERE chapter_id = $1
    `, [chapterId]);
    
    // Then delete the chapter
    const result = await db.query(`
      DELETE FROM chapters 
      WHERE id = $1
      RETURNING *
    `, [chapterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chương'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa chương thành công'
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa chương'
    });
  }
};

// Assign vocabulary to chapter
const assignVocabularyToChapter = async (req, res) => {
  try {
    const { chapterId, vocabIds } = req.body;
    
    // Update vocabulary to assign to chapter
    const result = await db.query(`
      UPDATE vocabulary 
      SET chapter_id = $1
      WHERE id = ANY($2)
      RETURNING id, word, chapter_id
    `, [chapterId, vocabIds]);
    
    res.json({
      success: true,
      data: result.rows,
      message: `Đã gán ${result.rows.length} từ vựng vào chương`
    });
  } catch (error) {
    console.error('Error assigning vocabulary to chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gán từ vựng vào chương'
    });
  }
};

module.exports = {
  getChaptersByTopic,
  getVocabularyByChapter,
  getChapterDetails,
  createChapter,
  updateChapter,
  deleteChapter,
  assignVocabularyToChapter
};

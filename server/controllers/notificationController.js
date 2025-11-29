const db = require('../models/db');

exports.getNotificationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

exports.getNotificationDetail = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    const db = require('../models/db');
    // Đánh dấu đã đọc
    await db.query('UPDATE notification SET is_read = true WHERE id = $1 AND user_id = $2', [notificationId, userId]);
    // Lấy notification
    const notiRes = await db.query('SELECT * FROM notification WHERE id = $1 AND user_id = $2', [notificationId, userId]);
    if (!notiRes.rows.length) return res.status(404).json({ error: 'Notification not found' });
    const notification = notiRes.rows[0];
    let assignment = null;
    if (notification.type === 'assignment') {
      // Tìm assignment liên quan đến notification này
      // Giả sử notification có trường assignment_id, nếu chưa có thì cần bổ sung khi tạo notification
      if (notification.assignment_id) {
        const assignRes = await db.query(
          `SELECT a.*, t.title as topic_title, c.name as class_name
           FROM assignment a
           LEFT JOIN topic t ON a.topic_id = t.id
           LEFT JOIN class c ON a.class_id = c.id
           WHERE a.id = $1`,
          [notification.assignment_id]
        );
        assignment = assignRes.rows[0] || null;
      }
    }
    res.json({ notification, assignment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../models/db');
    await db.query('UPDATE notification SET is_read = true WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const db = require('../models/db');
    
    // Đánh dấu 1 thông báo đã đọc
    await db.query(
      'UPDATE notification SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
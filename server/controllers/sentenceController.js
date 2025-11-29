const db = require('../models/db');

exports.create = async (req, res) => {
  try {
    const { vocab_id, content, audio_url } = req.body;
    if (!vocab_id || !content) return res.status(400).json({ error: 'Thiếu thông tin.' });
    const result = await db.query(
      'INSERT INTO sentence (vocab_id, content, audio_url) VALUES ($1, $2, $3) RETURNING *',
      [vocab_id, content, audio_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
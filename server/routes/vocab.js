const express = require('express');
const router = express.Router();
const db = require('../models/db'); // ✅ đúng đường dẫn

// Lấy toàn bộ vocabulary (phục vụ Flashcard)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vocabulary ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error in GET /api/vocab:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/search', async (req, res) => {
  const { word } = req.query;
  try {
    const result = await db.query(
      'SELECT * FROM vocabulary WHERE word ILIKE $1 LIMIT 10',
      [`%${word}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error in /vocab/search:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/random-dictation', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, title, transcript, audio_url, level, topic
      FROM dictation_exercises
      ORDER BY RANDOM()
      LIMIT 1
    `);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No dictation exercise available' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Dictation error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

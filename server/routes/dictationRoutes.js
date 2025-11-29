const express = require('express');
const router = express.Router();
const db = require('../models/db');
const dictationController = require('../controllers/dictationController');

// Get all topics with lesson count
router.get('/topics', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        topic,
        COUNT(*) as lesson_count,
        MIN(level) as min_level,
        MAX(level) as max_level
      FROM dictation_exercises
      GROUP BY topic
      ORDER BY topic
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get exercises by topic
router.get('/exercises/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const result = await db.query(
      'SELECT * FROM dictation_exercises WHERE topic = $1 ORDER BY id',
      [topic]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific exercise by ID
router.get('/exercise/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM dictation_exercises WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Random exercise (giữ lại route cũ)
router.get('/random-dictation', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM dictation_exercises 
      ORDER BY RANDOM() 
      LIMIT 1
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Check dictation with correction and explanation
router.post('/check-with-ai', dictationController.checkWithAI);

module.exports = router;
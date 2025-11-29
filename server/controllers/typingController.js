const db = require('../models/db');
const learnerController = require('./learnerController');

exports.create = async (req, res) => {
  try {
    const learner_id = req.params.id;
    const { vocab_id, wpm, accuracy, errors, attempts, words_typed } = req.body;
    const result = await db.query(
      'INSERT INTO typingrecord (learner_id, vocab_id, wpm, accuracy, errors, attempts, words_typed) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [learner_id, vocab_id, wpm, accuracy, errors, attempts, words_typed]
    );
    // Tự động tặng huy hiệu, tăng level
    await learnerController.checkAndGrantBadges(learner_id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
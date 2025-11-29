const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middlewares/authMiddleware');

// Guard: only admin
router.use(verifyToken, (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
});

// Summary stats for Admin dashboard
router.get('/summary', async (req, res) => {
  try {
    const [usersCount, topicsCount, banksCount, activeLearners, teachers] = await Promise.all([
      db.query('SELECT COUNT(*)::int as c FROM users'),
      db.query('SELECT COUNT(*)::int as c FROM topic'),
      db.query('SELECT COUNT(*)::int as c FROM question_bank'),
      db.query("SELECT COUNT(*)::int as c FROM users WHERE role = 'learner'"),
      db.query("SELECT COUNT(*)::int as c FROM users WHERE role = 'teacher'")
    ]);
    res.json({
      totalUsers: usersCount.rows[0].c,
      totalTopics: topicsCount.rows[0].c,
      totalBanks: banksCount.rows[0].c,
      activeUsers: activeLearners.rows[0].c,
      teachers: teachers.rows[0].c
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List users with optional role filter and search
router.get('/users', async (req, res) => {
  try {
    const { role, q, page = 1, limit = 50, sort = 'name' } = req.query;
    const clauses = [];
    const params = [];
    if (role) {
      params.push(role);
      clauses.push(`role = $${params.length}`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sortCol = ['name','role','created_at','id'].includes(String(sort)) ? sort : 'name';
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offsetNum = Math.max(0, (parseInt(page) - 1) * limitNum);

    const total = await db.query(`SELECT COUNT(*)::int as c FROM users ${where}`, params);
    const items = await db.query(
      `SELECT id, name, email, role, avatar_url, created_at
       FROM users ${where}
       ORDER BY ${sortCol} ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offsetNum]
    );
    res.json({ total: total.rows[0].c, items: items.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update role or name/email
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const fields = [];
    const params = [];
    if (name) { params.push(name); fields.push(`name = $${params.length}`); }
    if (email) { params.push(email); fields.push(`email = $${params.length}`); }
    if (role) { params.push(role); fields.push(`role = $${params.length}`); }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING id, name, email, role, avatar_url, created_at`;
    const result = await db.query(sql, params);
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;



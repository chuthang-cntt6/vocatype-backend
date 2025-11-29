const express = require("express");
const router = express.Router();
const db = require("../models/db");

// Hàm chuẩn hóa options
function normalizeQuestion(row) {
    let opts = [];
  
    if (!row.options) {
      opts = [];
    } else if (typeof row.options === "object" && !Array.isArray(row.options)) {
      // Postgres JSONB: {A: "text", B: "text"}
      opts = Object.entries(row.options).map(([key, val]) => ({
        key,
        text: val
      }));
    } else if (Array.isArray(row.options)) {
      // Nếu đã là mảng thì giữ nguyên
      opts = row.options.map((val, i) => ({ key: String.fromCharCode(65 + i), text: val }));
    } else if (typeof row.options === "string") {
      try {
        const parsed = JSON.parse(row.options);
        if (Array.isArray(parsed)) {
          opts = parsed.map((val, i) => ({ key: String.fromCharCode(65 + i), text: val }));
        } else {
          opts = Object.entries(parsed).map(([k, v]) => ({ key: k, text: v }));
        }
      } catch {
        // fallback: chuỗi "A. xxx; B. yyy"
        opts = row.options.split(";").map((s, i) => ({
          key: String.fromCharCode(65 + i),
          text: s.trim()
        }));
      }
    }
  
    return { ...row, options: opts };
  }
  

// API: Sinh đề TOEIC ngẫu nhiên theo số lượng
router.get("/toeic/random", async (req, res) => {
  try {
    const num = parseInt(req.query.num_questions) || 10;
    const part = parseInt(req.query.part) || null;

    let query = "SELECT * FROM toeic_questions";
    let params = [];

    if (part) {
      query += " WHERE part_number = $1";
      params.push(part);
    }

    query += " ORDER BY RANDOM() LIMIT $2";
    params.push(num);

    const { rows } = await db.query(query, params);
    res.json({ questions: rows.map(normalizeQuestion) });
  } catch (err) {
    console.error("Error fetching random TOEIC questions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Lấy đề TOEIC đủ 7 part
router.get("/toeic/full-test", async (req, res) => {
  try {
    const parts = {
      1: 6,
      2: 25,
      3: 39,
      4: 30,
      5: 30,
      6: 16,
      7: 54,
    };

    let result = {};

    for (const [part, num] of Object.entries(parts)) {
      const { rows } = await db.query(
        `SELECT * FROM toeic_questions
         WHERE part_number = $1
         ORDER BY RANDOM()
         LIMIT $2`,
        [part, num]
      );

      result[`part_${part}`] = rows.map(normalizeQuestion);
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching TOEIC test:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API: Chấm điểm
router.post("/toeic/grade", async (req, res) => {
  try {
    const { answers } = req.body; // [{id, answer}]
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid answers format" });
    }

    const ids = answers.map(a => a.id);
    if (ids.length === 0) {
      return res.json({ score: 0, total_questions: 0, percentage: 0, results: [] });
    }

    const { rows } = await db.query(
      `SELECT id, correct_answer FROM toeic_questions WHERE id = ANY($1)`,
      [ids]
    );

    let score = 0;
    const results = answers.map(ans => {
      const correct = rows.find(r => r.id === ans.id);
      const isCorrect = correct && ans.answer === correct.correct_answer;
      if (isCorrect) score++;
      return {
        question_id: ans.id,
        user_answer: ans.answer,
        correct_answer: correct ? correct.correct_answer : null,
        is_correct: isCorrect,
      };
    });

    const percentage = Math.round((score / answers.length) * 100);
    res.json({ score, total_questions: answers.length, percentage, results });
  } catch (err) {
    console.error("Error grading TOEIC answers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

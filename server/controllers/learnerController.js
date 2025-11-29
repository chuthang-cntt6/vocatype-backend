const db = require('../models/db');

// Helper functions for EXP system
const calculateLevelFromExp = (exp) => {
  // Level formula: level = floor(sqrt(exp / 100)) + 1
  // Level 1: 0-99 EXP, Level 2: 100-399 EXP, Level 3: 400-899 EXP, etc.
  return Math.floor(Math.sqrt(exp / 100)) + 1;
};

const getExpForNextLevel = (currentLevel) => {
  // EXP needed for next level = (currentLevel)^2 * 100
  // Level 2 needs 400 EXP, Level 3 needs 900 EXP, etc.
  return Math.pow(currentLevel, 2) * 100;
};

const getExpForCurrentLevel = (currentLevel) => {
  if (currentLevel <= 1) return 0;
  // EXP needed for current level = (currentLevel - 1)^2 * 100
  // Level 2 starts at 100 EXP, Level 3 starts at 400 EXP, etc.
  return Math.pow(currentLevel - 1, 2) * 100;
};

// Add EXP to learner and update level (exported for use in other controllers)
exports.addExp = async (learnerId, expToAdd) => {
  try {
    // Ensure learner record exists
    await db.query(
      'INSERT INTO learner (user_id, level, exp) VALUES ($1, 1, 0) ON CONFLICT (user_id) DO NOTHING',
      [learnerId]
    );
    
    // Get current EXP
    const current = (await db.query(
      'SELECT exp, level FROM learner WHERE user_id = $1',
      [learnerId]
    )).rows[0];
    
    if (!current) {
      // Create learner record if doesn't exist
      await db.query(
        'INSERT INTO learner (user_id, level, exp) VALUES ($1, 1, $2)',
        [learnerId, expToAdd]
      );
      return { newExp: expToAdd, newLevel: 1, leveledUp: false };
    }
    
    const oldExp = current.exp || 0;
    const oldLevel = current.level || 1;
    const newExp = oldExp + expToAdd;
    const newLevel = calculateLevelFromExp(newExp);
    const leveledUp = newLevel > oldLevel;
    
    // Update EXP and level
    await db.query(
      'UPDATE learner SET exp = $1, level = $2 WHERE user_id = $3',
      [newExp, newLevel, learnerId]
    );
    
    return { newExp, newLevel, leveledUp, expAdded: expToAdd };
  } catch (err) {
    console.error('Error adding EXP:', err);
    throw err;
  }
};

// Lấy từ cần ôn trong ngày
exports.getTodayReview = async (req, res) => {
  const { id } = req.user;
  try {
    const words = await db.query(
      `SELECT v.* FROM spacedrepetition s
       JOIN vocabulary v ON v.id = s.vocab_id
       WHERE s.learner_id = $1 AND s.next_review_date <= CURRENT_DATE`,
      [id]
    );
    res.json(words.rows);
  } catch (err) {
    console.error('Lỗi getTodayReview:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Gửi kết quả luyện tập
exports.submitTypingResult = async (req, res) => {
  const { vocabId, wpm, accuracy, errors, wordsTyped } = req.body;
  const learnerId = req.params.id; // Lấy id từ params thay vì req.user
  try {
    await db.query(
      `INSERT INTO typingrecord (learner_id, vocab_id, wpm, accuracy, errors, words_typed)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [learnerId, vocabId, wpm, accuracy, errors, wordsTyped]
    );
    
    // Calculate EXP based on performance
    // Base EXP: 10 per word typed
    // Bonus: +5 EXP for accuracy >= 90%, +10 EXP for accuracy >= 95%
    let expGained = Math.max(1, Math.floor(wordsTyped || 1) * 10);
    if (accuracy >= 95) {
      expGained += 10;
    } else if (accuracy >= 90) {
      expGained += 5;
    }
    
    // Add EXP
    const expResult = await exports.addExp(learnerId, expGained);
    
    res.json({ 
      message: 'Đã lưu kết quả',
      expGained,
      leveledUp: expResult.leveledUp,
      newLevel: expResult.newLevel
    });
  } catch (err) {
    console.error('Lỗi submitTypingResult:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/learner/:id/dashboard
exports.getDashboard = async (req, res) => {
  const learnerId = req.params.id;
  console.log('📊 getDashboard called for learner:', learnerId);
  try {
    const info = (await db.query(
      'SELECT id, name, email, avatar_url, created_at, role FROM users WHERE id = $1',
      [learnerId]
    )).rows[0];

    if (!info) {
      console.error('❌ User not found:', learnerId);
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    console.log('✅ User found:', info.name);

    const stats = (await db.query(
      `SELECT
         COALESCE(MAX(wpm), 0) as best_wpm,
         COUNT(*) as tests,
         COALESCE(SUM(words_typed), 0) as typing_words
       FROM typingrecord
       WHERE learner_id = $1`,
      [learnerId]
    )).rows[0];

    // ✅ Bổ sung: Đếm từ vựng THỰC TẾ đã học từ learning_progress
    let vocabStats = { total_words: 0 };
    try {
      vocabStats = (await db.query(
        `SELECT COUNT(DISTINCT vocab_id) as total_words
         FROM learning_progress
         WHERE learner_id = $1`,
        [learnerId]
      )).rows[0] || { total_words: 0 };
    } catch (err) {
      console.error('⚠️ Error fetching vocab stats:', err.message);
      vocabStats = { total_words: 0 };
    }

    // ✅ Bổ sung: Đếm số bài Dictation đã hoàn thành
    let dictationStats = { dictation_count: 0 };
    try {
      await ensureDictationTable();
      dictationStats = (await db.query(
        `SELECT COUNT(*) as dictation_count
         FROM dictation_history
         WHERE learner_id = $1`,
        [learnerId]
      )).rows[0] || { dictation_count: 0 };
    } catch (err) {
      console.error('⚠️ Error fetching dictation stats:', err.message);
      dictationStats = { dictation_count: 0 };
    }

    // ✅ Bổ sung: Đếm số flashcard đã review
    let flashcardStats = { flashcard_reviewed: 0 };
    try {
      flashcardStats = (await db.query(
        `SELECT COUNT(DISTINCT vocab_id) as flashcard_reviewed
         FROM learning_progress
         WHERE learner_id = $1 AND phase IN ('review', 'mastered')`,
        [learnerId]
      )).rows[0] || { flashcard_reviewed: 0 };
    } catch (err) {
      console.error('⚠️ Error fetching flashcard stats:', err.message);
      flashcardStats = { flashcard_reviewed: 0 };
    }

    // ✅ Bổ sung: Đếm số bài thi Reading đã làm
    let readingStats = { reading_tests: 0 };
    try {
      readingStats = (await db.query(
        `SELECT COUNT(*) as reading_tests
         FROM exam_attempts
         WHERE user_id = $1 AND status = 'completed'`,
        [learnerId]
      )).rows[0] || { reading_tests: 0 };
      console.log('📖 Reading tests count:', readingStats.reading_tests);
    } catch (err) {
      console.error('⚠️ Error fetching reading stats:', err.message);
      readingStats = { reading_tests: 0 };
    }

    // ❌ Speaking: Tạm thời không track (chưa có tính năng thực sự)
    let speakingStats = { pronunciation_score: 0 };

    // ✅ Bổ sung: Đếm số lần điền câu ví dụ (Writing)
    let writingStats = { grammar_exercises: 0 };
    try {
      writingStats = (await db.query(
        `SELECT SUM(writing_count) as grammar_exercises
         FROM learning_progress
         WHERE learner_id = $1`,
        [learnerId]
      )).rows[0] || { grammar_exercises: 0 };
      console.log('✍️ Writing count:', writingStats.grammar_exercises);
    } catch (err) {
      console.error('⚠️ Error fetching writing stats:', err.message);
      writingStats = { grammar_exercises: 0 };
    }

    // Compute streak based on learning activity (learning_progress + dictation_history)
    try { await ensureDictationTable(); } catch {}
    const daysRes = await db.query(`
      SELECT d::date AS day
      FROM (
        SELECT DISTINCT DATE(learned_at) AS d
        FROM learning_progress
        WHERE learner_id = $1 AND learned_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION
        SELECT DISTINCT DATE(created_at) AS d
        FROM dictation_history
        WHERE learner_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      ) x
      ORDER BY d DESC
    `, [learnerId]);
    let streak = 0;
    if (daysRes.rows && daysRes.rows.length) {
      let cursor = new Date();
      cursor.setHours(0,0,0,0);
      for (const row of daysRes.rows) {
        const d = new Date(row.day);
        d.setHours(0,0,0,0);
        const diffDays = Math.round((cursor - d) / (1000*60*60*24));
        if (diffDays === 0) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (diffDays === 1) {
          // allow skipping to previous day if list not sorted strictly consecutive
          // but since ordered DESC, this case shouldn't happen unless today has no activity
          break;
        } else {
          break;
        }
      }
    }

    // Get EXP and level from learner table
    const learnerData = (await db.query(
      'SELECT exp, level FROM learner WHERE user_id = $1',
      [learnerId]
    )).rows[0] || { exp: 0, level: 1 };

    const currentExp = learnerData.exp || 0;
    const currentLevel = learnerData.level || 1;
    const expForCurrentLevel = getExpForCurrentLevel(currentLevel);
    const expForNextLevel = getExpForNextLevel(currentLevel);
    const expProgress = currentExp - expForCurrentLevel;
    const expNeeded = expForNextLevel - expForCurrentLevel;

    // Lấy badges động từ CSDL
    const badges = (await db.query(`
      SELECT b.id, b.title, b.icon_url, b.description, lb.achieved_at
      FROM learner_badge lb
      JOIN badge b ON lb.badge_id = b.id
      WHERE lb.learner_id = $1
      ORDER BY lb.achieved_at DESC
    `, [learnerId])).rows;

    const assignments = [
      { id: 1, title: 'Ôn tập chủ đề Du lịch', status: 'done', deadline: '2025-06-28' },
      { id: 2, title: 'Luyện gõ 20 từ mới', status: 'pending', deadline: '2025-06-29' },
    ];

    const history = (await db.query(
      `SELECT wpm, accuracy, created_at
       FROM typingrecord
       WHERE learner_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [learnerId]
    )).rows;

    // Ensure learning_progress exists and compute learn sessions
    await db.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id SERIAL PRIMARY KEY,
        learner_id INTEGER REFERENCES users(id),
        topic_id INTEGER REFERENCES topic(id),
        chapter_id INTEGER,
        vocab_id INTEGER REFERENCES vocabulary(id),
        remembered BOOLEAN NOT NULL,
        phase VARCHAR(50) NOT NULL,
        learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const todaySessionsRow = (await db.query(`
      SELECT COUNT(*)::int AS cnt FROM (
        SELECT topic_id, chapter_id
        FROM learning_progress
        WHERE learner_id = $1
          AND learned_at >= CURRENT_DATE
          AND learned_at < CURRENT_DATE + INTERVAL '1 day'
        GROUP BY topic_id, chapter_id
      ) s
    `, [learnerId])).rows[0] || { cnt: 0 };
    const totalSessionsRow = (await db.query(`
      SELECT COUNT(*)::int AS cnt FROM (
        SELECT topic_id, chapter_id
        FROM learning_progress
        WHERE learner_id = $1
        GROUP BY topic_id, chapter_id
      ) s
    `, [learnerId])).rows[0] || { cnt: 0 };

    res.json({ 
      info, 
      stats: { 
        ...stats,
        // ✅ Ghi đè total_words bằng số từ vựng THỰC TẾ đã học
        total_words: vocabStats.total_words || 0,
        typing_words: stats.typing_words || 0, // Giữ lại số từ đã gõ
        // ✅ Bổ sung các field mới cho skill assessment
        dictation_count: dictationStats.dictation_count || 0,
        flashcard_reviewed: flashcardStats.flashcard_reviewed || 0,
        reading_tests: readingStats.reading_tests || 0,
        pronunciation_score: 0, // ❌ Speaking: Chưa có tính năng
        grammar_exercises: writingStats.grammar_exercises || 0,   // ✅ Số lần điền câu ví dụ
        toeic_listening: 0,     // TODO: Thêm logic cho TOEIC Listening
        // Stats hiện tại
        streak,
        exp: currentExp,
        level: currentLevel,
        expProgress,
        expNeeded,
        learn_sessions_today: todaySessionsRow.cnt || 0,
        learn_sessions_total: totalSessionsRow.cnt || 0,
        active_days_30d: (daysRes.rows || []).length
      }, 
      badges, 
      assignments, 
      history 
    });
  } catch (err) {
    console.error('❌ Dashboard Error:', err.message);
    console.error('❌ Full error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message, stack: err.stack });
  }
};

// GET /api/learner/:id/history
exports.getHistory = async (req, res) => {
  const learnerId = req.params.id;
  try {
    const history = (
      await db.query(
        `SELECT wpm, accuracy, created_at
         FROM typingrecord
         WHERE learner_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [learnerId]
      )
    ).rows;
    res.json(history);
  } catch (err) {
    console.error('Lỗi getHistory:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/learner/:id/review-schedule/today
exports.getTodayReviewSchedule = async (req, res) => {
  const learnerId = req.params.id;
  try {
    const result = await db.query(
      `SELECT v.* FROM spacedrepetition s
       JOIN vocabulary v ON s.vocab_id = v.id
       WHERE s.learner_id = $1 AND s.next_review_date <= CURRENT_DATE`,
      [learnerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/learner/:id/review-schedule?tomorrow=1 HOẶC /review-schedule/tomorrow
exports.getReviewSchedule = async (req, res) => {
  const learnerId = req.params.id;
  try {
    const result = await db.query(
      `SELECT v.* FROM spacedrepetition s
       JOIN vocabulary v ON s.vocab_id = v.id
       WHERE s.learner_id = $1 AND s.next_review_date = CURRENT_DATE + 1`,
      [learnerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Ensure dictation_history table exists
const ensureDictationTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dictation_history (
      id SERIAL PRIMARY KEY,
      learner_id INTEGER NOT NULL,
      sentences INTEGER NOT NULL DEFAULT 0,
      avg_score INTEGER NOT NULL DEFAULT 0,
      topic TEXT,
      exercise_id INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
};

// POST /api/learner/:id/dictation-activity
exports.saveDictationActivity = async (req, res) => {
  const learnerId = req.params.id;
  const { sentencesChecked, avgScore, topic, exerciseId } = req.body || {};
  if (!sentencesChecked || sentencesChecked <= 0) {
    return res.status(400).json({ error: 'sentencesChecked must be > 0' });
  }
  try {
    await ensureDictationTable();
    const result = await db.query(
      `INSERT INTO dictation_history (learner_id, sentences, avg_score, topic, exercise_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, learner_id, sentences, avg_score, topic, exercise_id, created_at`,
      [learnerId, Math.floor(sentencesChecked), Math.floor(avgScore || 0), topic || null, exerciseId || null]
    );
    // Optional EXP: 3 EXP per sentence + small bonus by avg score
    const expBase = Math.max(0, Math.floor(sentencesChecked)) * 3;
    const expBonus = Math.round((avgScore || 0) / 20);
    let expResult = null;
    try { expResult = await exports.addExp(learnerId, expBase + expBonus); } catch {}
    res.json({ success: true, activity: result.rows[0], exp: expBase + expBonus, leveledUp: expResult?.leveledUp, newLevel: expResult?.newLevel });
  } catch (err) {
    console.error('saveDictationActivity error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// GET /api/learner/:id/dictation-recent
exports.getDictationRecent = async (req, res) => {
  const learnerId = req.params.id;
  try {
    await ensureDictationTable();
    const result = await db.query(
      `SELECT id, sentences, avg_score, topic, exercise_id, created_at
       FROM dictation_history
       WHERE learner_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [learnerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getDictationRecent error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lưu kết quả học từ mới
exports.saveLearningProgress = async (req, res) => {
  const learnerId = req.params.id;
  const { topicId, chapterId, vocabResults } = req.body; // vocabResults: [{vocabId, remembered, phase, pronunciationCount, writingCount}]
  
  try {
    // Tạo bảng learning_progress nếu chưa có
    await db.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id SERIAL PRIMARY KEY,
        learner_id INTEGER REFERENCES users(id),
        topic_id INTEGER REFERENCES topic(id),
        chapter_id INTEGER,
        vocab_id INTEGER REFERENCES vocabulary(id),
        remembered BOOLEAN NOT NULL,
        phase VARCHAR(50) NOT NULL,
        pronunciation_count INTEGER DEFAULT 0,
        writing_count INTEGER DEFAULT 0,
        learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let totalExpGained = 0;
    let rememberedCount = 0;

    // Lưu từng kết quả học
    for (const result of vocabResults) {
      const pronunciationCount = result.pronunciationCount || 0;
      const writingCount = result.writingCount || 0;
      
      await db.query(
        `INSERT INTO learning_progress (learner_id, topic_id, chapter_id, vocab_id, remembered, phase, pronunciation_count, writing_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [learnerId, topicId, chapterId, result.vocabId, result.remembered, result.phase, pronunciationCount, writingCount]
      );
      
      // Calculate EXP: 15 EXP per word remembered, 5 EXP per word forgotten
      // + 2 EXP per pronunciation, + 3 EXP per writing
      let wordExp = result.remembered ? 15 : 5;
      let bonusExp = (pronunciationCount * 2) + (writingCount * 3);
      totalExpGained += wordExp + bonusExp;
      
      if (result.remembered) {
        rememberedCount++;
      }
    }

    // Add EXP
    const expResult = await exports.addExp(learnerId, totalExpGained);

    res.json({ 
      success: true, 
      message: 'Đã lưu tiến độ học tập',
      expGained: totalExpGained,
      rememberedCount,
      leveledUp: expResult.leveledUp,
      newLevel: expResult.newLevel
    });
  } catch (err) {
    console.error('Lỗi saveLearningProgress:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lấy tổng kết học tập hôm nay
exports.getTodayLearningSummary = async (req, res) => {
  const learnerId = req.params.id;
  
  try {
    console.log('🔍 Getting learning summary for learner:', learnerId);
    
    // Tạo bảng nếu chưa có
    await db.query(`
      CREATE TABLE IF NOT EXISTS learning_progress (
        id SERIAL PRIMARY KEY,
        learner_id INTEGER REFERENCES users(id),
        topic_id INTEGER REFERENCES topic(id),
        chapter_id INTEGER,
        vocab_id INTEGER REFERENCES vocabulary(id),
        remembered BOOLEAN NOT NULL,
        phase VARCHAR(50) NOT NULL,
        learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lấy tổng kết học tập hôm nay
    const summary = await db.query(`
      SELECT 
        t.title as topic_name,
        lp.chapter_id,
        c.title as chapter_name,
        COUNT(*) as total_words,
        COUNT(CASE WHEN lp.remembered = true THEN 1 END) as remembered_words,
        COUNT(CASE WHEN lp.remembered = false THEN 1 END) as forgotten_words,
        ROUND(
          COUNT(CASE WHEN lp.remembered = true THEN 1 END) * 100.0 / COUNT(*), 2
        ) as remember_rate
      FROM learning_progress lp
      JOIN topic t ON lp.topic_id = t.id
      LEFT JOIN chapters c ON lp.chapter_id = c.id
      WHERE lp.learner_id = $1 
        AND lp.learned_at >= CURRENT_DATE 
        AND lp.learned_at < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY t.title, lp.chapter_id, c.title
      ORDER BY t.title, lp.chapter_id
    `, [learnerId]);

    // Lấy chi tiết từ vựng đã học hôm nay
    const vocabDetails = await db.query(`
      SELECT DISTINCT
        v.word,
        v.meaning,
        lp.remembered,
        lp.phase,
        t.title as topic_name,
        lp.chapter_id,
        c.title as chapter_name,
        lp.learned_at
      FROM learning_progress lp
      JOIN vocabulary v ON lp.vocab_id = v.id
      JOIN topic t ON lp.topic_id = t.id
      LEFT JOIN chapters c ON lp.chapter_id = c.id
      WHERE lp.learner_id = $1 
        AND lp.learned_at >= CURRENT_DATE 
        AND lp.learned_at < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY lp.chapter_id, lp.learned_at DESC, v.word
    `, [learnerId]);

    console.log('📊 Summary rows:', summary.rows.length);
    console.log('📝 Vocab details:', vocabDetails.rows.length);
    console.log('📊 Summary data:', JSON.stringify(summary.rows, null, 2));
    console.log('📝 Vocab details data:', JSON.stringify(vocabDetails.rows, null, 2));

    res.json({
      summary: summary.rows,
      vocabDetails: vocabDetails.rows
    });
  } catch (err) {
    console.error('❌ Lỗi getTodayLearningSummary:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// API endpoint để cộng EXP cho các hoạt động khác (flashcard, Learn.jsx, etc.)
exports.addExpForActivity = async (req, res) => {
  const learnerId = req.params.id;
  const { expAmount, activityType } = req.body; // activityType: 'flashcard', 'learn', etc.
  
  try {
    if (!expAmount || expAmount <= 0) {
      return res.status(400).json({ error: 'EXP amount must be positive' });
    }
    
    const expResult = await exports.addExp(learnerId, expAmount);
    
    res.json({
      success: true,
      expGained: expAmount,
      leveledUp: expResult.leveledUp,
      newLevel: expResult.newLevel,
      newExp: expResult.newExp
    });
  } catch (err) {
    console.error('Lỗi addExpForActivity:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

exports.checkAndGrantBadges = async (learnerId) => {
  // Lấy tổng số từ đã học
  const stats = (await db.query('SELECT COUNT(DISTINCT vocab_id) as total FROM typingrecord WHERE learner_id = $1', [learnerId])).rows[0];
  // Lấy streak
  const streak = (await db.query(`SELECT COUNT(DISTINCT DATE(created_at)) as streak FROM typingrecord WHERE learner_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [learnerId])).rows[0].streak || 0;
  // Huy hiệu 10 từ mới
  if (stats.total >= 10) {
    const result = await db.query('INSERT INTO learner_badge (learner_id, badge_id) VALUES ($1, 2) ON CONFLICT DO NOTHING RETURNING *', [learnerId]);
    if (result.rows.length > 0) {
      await db.query(
        `INSERT INTO notification (user_id, content, type) VALUES ($1, $2, 'badge')`,
        [learnerId, 'Chúc mừng! Bạn vừa nhận được huy hiệu "10 từ mới"!']
      );
    }
  }
  // Huy hiệu streak 5 ngày
  if (streak >= 5) {
    const result = await db.query('INSERT INTO learner_badge (learner_id, badge_id) VALUES ($1, 1) ON CONFLICT DO NOTHING RETURNING *', [learnerId]);
    if (result.rows.length > 0) {
      await db.query(
        `INSERT INTO notification (user_id, content, type) VALUES ($1, $2, 'badge')`,
        [learnerId, 'Chúc mừng! Bạn vừa nhận được huy hiệu "Streak 5 ngày"!']
      );
    }
  }
  // Level được tính dựa trên EXP, không cần cập nhật ở đây nữa
};


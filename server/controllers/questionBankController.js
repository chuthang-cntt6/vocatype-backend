const db = require('../models/db');
const learnerController = require('./learnerController');

// Fallback function để tạo từ khóa mở rộng khi Gemini API không khả dụng
function getFallbackTerms(query) {
  const lowerQuery = query.toLowerCase();
  
  // Mapping các từ khóa phổ biến (bao gồm cả có dấu và không dấu)
  const keywordMap = {
    'medical': 'y tế, healthcare, medicine, nursing, medical',
    'business': 'kinh doanh, commerce, management, trade',
    'travel': 'du lịch, du lich, tourism, vacation, trip, tour',
    'education': 'giáo dục, giao duc, learning, teaching, school, study',
    'technology': 'công nghệ, cong nghe, tech, computer, software, IT',
    'science': 'khoa học, khoa hoc, research, laboratory, experiment',
    'art': 'nghệ thuật, nghe thuat, creative, design, painting, music',
    'sport': 'thể thao, the thao, sports, exercise, fitness, game',
    'food': 'ẩm thực, am thuc, cooking, cuisine, restaurant, meal',
    'fashion': 'thời trang, thoi trang, clothing, style, fashion, dress',
    'y tế': 'medical, healthcare, medicine, nursing, medical',
    'y te': 'medical, healthcare, medicine, nursing, medical',
    'kinh doanh': 'business, commerce, management, trade',
    'du lịch': 'travel, du lich, tourism, vacation, trip, tour',
    'du lich': 'travel, du lịch, tourism, vacation, trip, tour',
    'giáo dục': 'education, giao duc, learning, teaching, school',
    'giao duc': 'education, giáo dục, learning, teaching, school',
    'công nghệ': 'technology, cong nghe, tech, computer, software',
    'cong nghe': 'technology, công nghệ, tech, computer, software',
    'khoa học': 'science, khoa hoc, research, laboratory, experiment',
    'khoa hoc': 'science, khoa học, research, laboratory, experiment',
    'nghệ thuật': 'art, nghe thuat, creative, design, painting, music',
    'nghe thuat': 'art, nghệ thuật, creative, design, painting, music',
    'thể thao': 'sport, the thao, sports, exercise, fitness, game',
    'the thao': 'sport, thể thao, sports, exercise, fitness, game',
    'ẩm thực': 'food, am thuc, cooking, cuisine, restaurant, meal',
    'am thuc': 'food, ẩm thực, cooking, cuisine, restaurant, meal',
    'thời trang': 'fashion, thoi trang, clothing, style, dress',
    'thoi trang': 'fashion, thời trang, clothing, style, dress'
  };

  // Tìm kiếm exact match
  if (keywordMap[lowerQuery]) {
    return keywordMap[lowerQuery];
  }
  
  // Thử tìm kiếm với các từ khóa phổ biến dựa trên từ đầu tiên (ưu tiên cao)
  const firstWord = lowerQuery.split(' ')[0];
  if (firstWord === 'du') {
    return 'du lịch, du lich, travel, tourism, vacation, trip, tour';
  }
  if (firstWord === 'kinh') {
    return 'kinh doanh, business, commerce, management, trade';
  }
  if (firstWord === 'tu') {
    return 'từ vựng, vocabulary, word, language, learning';
  }
  if (firstWord === 'am') {
    return 'ẩm thực, am thuc, food, cooking, cuisine, restaurant, meal';
  }
  if (firstWord === 'cong') {
    return 'công nghệ, cong nghe, technology, tech, computer, software';
  }
  
  // Tìm kiếm partial match
  for (const [key, value] of Object.entries(keywordMap)) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      return value;
    }
  }
  
  // Fallback chung - chỉ trả về từ khóa gốc để tránh kết quả không liên quan
  return query;
}

// Export for testing
module.exports.getFallbackTerms = getFallbackTerms;

// Lấy danh sách attempt của user cho một bank cụ thể
exports.getAttemptsByBank = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // bank id
    const { limit = 10 } = req.query;
    const { rows } = await db.query(`
      SELECT ea.id, ea.score, ea.total_questions, ea.time_taken, ea.created_at, ea.answers, qb.title
      FROM exam_attempts ea
      JOIN question_bank qb ON ea.bank_id = qb.id
      WHERE ea.user_id = $1 AND ea.bank_id = $2
      ORDER BY ea.created_at DESC
      LIMIT $3
    `, [userId, id, parseInt(limit,10)]);
    // Parse answers để lấy passage info
    const enriched = rows.map(row => {
      let results = [];
      try {
        if (Array.isArray(row.answers)) {
          results = row.answers;
        } else if (typeof row.answers === 'string') {
          results = JSON.parse(row.answers);
        }
      } catch {}
      const parts = new Set(results.map(r => r.part_id).filter(Boolean));
      return {
        id: row.id,
        score: row.score,
        total_questions: row.total_questions,
        time_taken: row.time_taken,
        created_at: row.created_at,
        title: row.title,
        passages: Array.from(parts).sort((a,b) => a - b)
      };
    });
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lấy chi tiết 1 attempt (kèm passages để render)
exports.getAttemptDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attempt_id } = req.params;
    const attemptRes = await db.query(`
      SELECT ea.*, qb.title AS bank_title
      FROM exam_attempts ea
      JOIN question_bank qb ON ea.bank_id = qb.id
      WHERE ea.id = $1 AND ea.user_id = $2
    `, [attempt_id, userId]);
    if (!attemptRes.rows.length) return res.status(404).json({ error: 'Attempt không tồn tại' });
    const attempt = attemptRes.rows[0];
    // Lấy passages
    const passages = await db.query(`
      SELECT id, part_id, passage_text
      FROM question_bank_passages
      WHERE bank_id = $1
      ORDER BY part_id
    `, [attempt.bank_id]);
    // Parse answers JSON (results)
    let results = [];
    console.log('🔍 Raw attempt.answers from DB:', attempt.answers);
    try { 
      // PostgreSQL JSONB is already parsed by node-postgres driver
      if (Array.isArray(attempt.answers)) {
        results = attempt.answers;
      } else if (typeof attempt.answers === 'string') {
        results = JSON.parse(attempt.answers);
      } else {
        results = [];
      }
      console.log('✅ Parsed results:', results.length, 'items');
    } catch (e) {
      console.error('❌ Parse error:', e);
    }
    // Summary
    const correct = results.filter(r => r.is_correct).length;
    const skipped = results.filter(r => !r.user_answer).length;
    const total = attempt.total_questions;
    const wrong = Math.max(0, total - correct - skipped);
    const percentage = total > 0 ? Math.round((attempt.score / total) * 100) : 0;
    res.json({
      id: attempt.id,
      bank_id: attempt.bank_id,
      bank_title: attempt.bank_title,
      created_at: attempt.created_at,
      score: attempt.score,
      total_questions: attempt.total_questions,
      time_taken: attempt.time_taken,
      percentage,
      passages: passages.rows,
      results,
      summary: { correct, wrong, skipped }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Tạo bộ đề thi mới (teacher) - cần admin duyệt
exports.createQuestionBank = async (req, res) => {
  try {
    const { title, description, is_public, difficulty_level, time_limit, passages, vocab_ids } = req.body;
    const creator_id = req.user.id;

    // Teacher tạo đề → status = 'pending'
    // Admin tạo đề → status = 'approved'
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    // Calculate total questions from passages
    let total_questions = 0;
    if (passages && Array.isArray(passages)) {
      passages.forEach(p => {
        if (p.questions && Array.isArray(p.questions)) {
          total_questions += p.questions.length;
        }
      });
    }

    // Tạo bộ đề thi
    const bankResult = await db.query(
      'INSERT INTO question_bank (title, description, creator_id, is_public, difficulty_level, time_limit, total_questions, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, creator_id, is_public || false, difficulty_level || 'medium', time_limit || 60, total_questions, status]
    );

    const bankId = bankResult.rows[0].id;
    
    // Nếu là teacher, gửi notification cho admin
    if (req.user.role === 'teacher') {
      try {
        // Get all admins
        const admins = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
        
        // Send notification to each admin
        for (const admin of admins.rows) {
          await db.query(
            'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
            [
              admin.id,
              'test_approval',
              'Đề thi mới cần duyệt',
              `${req.user.name || req.user.email} đã tạo đề thi "${title}" và đang chờ duyệt.`,
              JSON.stringify({ bank_id: bankId, creator_id, creator_name: req.user.name || req.user.email })
            ]
          );
        }
      } catch (notifErr) {
        console.error('Error sending notification:', notifErr);
      }
    }

    // Lưu passages và questions
    if (passages && Array.isArray(passages)) {
      for (const passage of passages) {
        // Insert passage
        const passageResult = await db.query(
          'INSERT INTO question_bank_passages (bank_id, part_id, passage_text) VALUES ($1, $2, $3) RETURNING id',
          [bankId, passage.part_id, passage.passage_text]
        );
        const passageId = passageResult.rows[0].id;

        // Insert questions for this passage
        if (passage.questions && Array.isArray(passage.questions)) {
          for (const question of passage.questions) {
            // Xử lý keywords: chuyển string thành array
            let keywordsArray = null;
            if (question.keywords) {
              if (typeof question.keywords === 'string') {
                keywordsArray = question.keywords.split(',').map(k => k.trim()).filter(Boolean);
              } else if (Array.isArray(question.keywords)) {
                keywordsArray = question.keywords;
              }
            }
            
            console.log('📝 Inserting question with explanation:', {
              question_number: question.question_number,
              has_explanation: !!question.explanation,
              has_keywords: !!keywordsArray,
              has_answer_location: !!question.answer_location
            });
            
            await db.query(
              `INSERT INTO question_bank_questions 
               (bank_id, passage_id, question_number, question_text, options, correct_answer, explanation, keywords, answer_location) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                bankId,
                passageId,
                question.question_number,
                question.question_text,
                JSON.stringify(question.options),
                question.correct_answer,
                question.explanation || null,
                keywordsArray,
                question.answer_location || null
              ]
            );
          }
        }
      }
    }
    // Fallback: old vocab_ids method
    else if (vocab_ids && vocab_ids.length > 0) {
      for (let i = 0; i < vocab_ids.length; i++) {
        await db.query(
          'INSERT INTO question_bank_items (bank_id, vocab_id) VALUES ($1, $2)',
          [bankId, vocab_ids[i]]
        );
      }
    }

    res.json({ 
      message: status === 'pending' ? 'Đã gửi đề thi để admin duyệt!' : 'Tạo bộ đề thi thành công!', 
      question_bank: bankResult.rows[0],
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lấy danh sách bộ đề thi
exports.getQuestionBanks = async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, is_public, creator_id, topic, status } = req.query;
    let { search } = req.query;
    const offset = (page - 1) * limit;
    let expanded = search || '';

    // Thêm typo correction cho các từ phổ biến TRƯỚC khi expand
    if (search) {
      const typoCorrections = {
        'medcal': 'medical',
        'medic': 'medical', 
        'medicin': 'medicine',
        'bussiness': 'business',
        'busines': 'business',
        'progamming': 'programming',
        'progaming': 'programming',
        'techology': 'technology',
        'technolgy': 'technology'
      };
      
      const correctedTerm = typoCorrections[search.toLowerCase()];
      if (correctedTerm) {
        // Thay thế search term bằng corrected term
        const originalSearch = search;
        search = correctedTerm;
        expanded = correctedTerm;
        console.log('Typo corrected:', originalSearch, '->', correctedTerm);
      }
    }

    // Expand với Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && search) {
      try {
        const prompt = `Expand '${search}' into a concise list of specific synonyms and related terms (max 4) for educational exam bank search. Focus on domain-specific terms only. Avoid generic words like 'health', 'study', 'learn'. Return a comma-separated string only.`;
        const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) expanded = `${search}, ${text}`;
      } catch (e) {
        console.error('Gemini API error:', e);
      }
    }

    // Luôn sử dụng fallback nếu có search và chưa được expand
    if (search && expanded === search) {
      const fallbackTerms = getFallbackTerms(search);
      // Chỉ expand nếu fallback khác với query gốc (có mapping)
      if (fallbackTerms !== search) {
        expanded = `${search}, ${fallbackTerms}`;
      }
    }

    console.log('Search input:', search);
    console.log('Expanded terms:', expanded);

    const terms = expanded.split(/[\,\n]/).map(s => s.trim()).filter(Boolean);
    const searchText = terms.join(' '); // Text để tìm kiếm
    const searchPattern = `%${terms.join('%')}%`; // Pattern cho ILIKE
    
    // Tạo searchText an toàn cho tsquery (thay khoảng trắng bằng &)
    const safeSearchText = searchText.replace(/\s+/g, ' & ');

    let query = `
      SELECT qb.*, u.name as creator_name,
             COUNT(qbi.id) as actual_questions,
             (SELECT COUNT(*) FROM question_bank_questions qq WHERE qq.bank_id = qb.id) as rb_questions,
             ${searchText ? `
               greatest(similarity(qb.title, $1), similarity(coalesce(qb.description,''), $1)) as rank_trgm
             ` : '0 as rank_trgm'}
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      LEFT JOIN question_bank_items qbi ON qb.id = qbi.bank_id
      ${topic ? 'JOIN vocabulary v ON qbi.vocab_id = v.id JOIN topic t ON v.topic_id = t.id' : ''}
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (searchText) {
      params.push(searchText, searchPattern);
      terms.forEach(term => params.push(`%${term}%`));
      paramCount = terms.length + 2;
    }

    if (status) {
      paramCount++;
      query += ` AND qb.status = $${paramCount}`;
      params.push(status);
    }

    if (difficulty) {
      paramCount++;
      query += ` AND qb.difficulty_level = $${paramCount}`;
      params.push(difficulty);
    }

    if (is_public !== undefined) {
      paramCount++;
      query += ` AND qb.is_public = $${paramCount}`;
      params.push(is_public === 'true');
    }

    if (topic) {
      paramCount++;
      query += ` AND t.name ILIKE $${paramCount}`;
      params.push(`%${topic}%`);
    }

    if (searchText) {
      query += ` AND (
        similarity(qb.title, $1) > 0.3 OR similarity(coalesce(qb.description,''), $1) > 0.3
        OR ${terms.map((_, i) => `similarity(qb.title, $${i + 3}) > 0.3`).join(' OR ')}
        OR ${terms.map((_, i) => `similarity(coalesce(qb.description,''), $${i + 3}) > 0.3`).join(' OR ')}
        OR qb.title ILIKE $2
        OR qb.description ILIKE $2
        OR ${terms.map((_, i) => `qb.title ILIKE $${i + 3}`).join(' OR ')}
        OR ${terms.map((_, i) => `qb.description ILIKE $${i + 3}`).join(' OR ')}
      )`;
    }

    if (creator_id) {
      paramCount++;
      query += ` AND qb.creator_id = $${paramCount}`;
      params.push(parseInt(creator_id, 10));
    }

    query += ` GROUP BY qb.id, u.name`;
    if (searchText) {
      query += ` ORDER BY rank_trgm DESC, qb.created_at DESC`;
    } else {
      query += ` ORDER BY qb.created_at DESC`;
    }
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    console.log('Query result count:', result.rows.length);
    res.json({ results: result.rows, count: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lấy chi tiết bộ đề thi
exports.getQuestionBankById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID is a number
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question bank ID format'
      });
    }
    
    // Lấy thông tin bộ đề
    const bankResult = await db.query(`
      SELECT qb.*, u.name as creator_name
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      WHERE qb.id = $1
    `, [id]);

    if (!bankResult.rows.length) {
      return res.status(404).json({ error: 'Bộ đề thi không tồn tại' });
    }

    // Lấy passages (nếu có) và đếm số câu hỏi theo passage
    const passages = await db.query(`
      SELECT p.id, p.part_id, p.passage_text,
             (SELECT COUNT(*) FROM question_bank_questions qq WHERE qq.passage_id = p.id) as count
      FROM question_bank_passages p
      WHERE p.bank_id = $1
      ORDER BY p.part_id ASC
    `, [id]);

    // Lấy danh sách câu hỏi reading test (từ question_bank_questions)
    const readingQuestions = await db.query(`
      SELECT qq.id, qq.question_number, qq.question_text, qq.options, qq.correct_answer, qq.passage_id,
             qq.explanation, qq.keywords, qq.answer_location,
             p.part_id
      FROM question_bank_questions qq
      LEFT JOIN question_bank_passages p ON qq.passage_id = p.id
      WHERE qq.bank_id = $1
      ORDER BY p.part_id ASC, qq.question_number ASC
    `, [id]);

    // Lấy danh sách câu hỏi vocab (fallback cho đề cũ)
    const vocabQuestions = await db.query(`
      SELECT qbi.*, v.word, v.meaning, v.image_url, v.audio_url
      FROM question_bank_items qbi
      JOIN vocabulary v ON qbi.vocab_id = v.id
      WHERE qbi.bank_id = $1
      ORDER BY qbi.id ASC
    `, [id]);

    // Ưu tiên reading questions, fallback về vocab questions
    const questions = readingQuestions.rows.length > 0 ? readingQuestions.rows : vocabQuestions.rows;

    res.json({
      ...bankResult.rows[0],
      passages: passages.rows,
      questions: questions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Cập nhật bộ đề thi
exports.updateQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_public, difficulty_level, time_limit, total_questions, vocab_ids } = req.body;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const bankResult = await db.query('SELECT creator_id FROM question_bank WHERE id = $1', [id]);
    if (!bankResult.rows.length) {
      return res.status(404).json({ error: 'Bộ đề thi không tồn tại' });
    }
    if (bankResult.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: 'Không có quyền chỉnh sửa bộ đề thi này' });
    }

    // Cập nhật thông tin bộ đề
    await db.query(
      'UPDATE question_bank SET title = $1, description = $2, is_public = $3, difficulty_level = $4, time_limit = $5, total_questions = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7',
      [title, description, is_public, difficulty_level, time_limit, total_questions, id]
    );

    // Xóa các câu hỏi cũ và thêm câu hỏi mới
    if (vocab_ids) {
      await db.query('DELETE FROM question_bank_items WHERE bank_id = $1', [id]);
      
      for (let i = 0; i < vocab_ids.length; i++) {
        await db.query(
          'INSERT INTO question_bank_items (bank_id, vocab_id) VALUES ($1, $2)',
          [id, vocab_ids[i]]
        );
      }
    }

    res.json({ message: 'Cập nhật bộ đề thi thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Xóa bộ đề thi
exports.deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Kiểm tra quyền sở hữu (Admin có thể xóa bất kỳ đề nào)
    const bankResult = await db.query('SELECT creator_id FROM question_bank WHERE id = $1', [id]);
    if (!bankResult.rows.length) {
      return res.status(404).json({ error: 'Bộ đề thi không tồn tại' });
    }
    
    // Admin có thể xóa bất kỳ đề nào, Teacher chỉ xóa đề của mình
    if (userRole !== 'admin' && bankResult.rows[0].creator_id !== userId) {
      return res.status(403).json({ error: 'Không có quyền xóa bộ đề thi này' });
    }

    await db.query('DELETE FROM question_bank WHERE id = $1', [id]);
    res.json({ message: 'Xóa bộ đề thi thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Làm bài thi
exports.takeExam = async (req, res) => {
  try {
    const { bank_id } = req.params;
    const userId = req.user.id;

    // Lấy thông tin bộ đề (chỉ lấy đề đã duyệt)
    const bankResult = await db.query(`
      SELECT qb.*, u.name as creator_name
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      WHERE qb.id = $1 AND qb.status = 'approved'
    `, [bank_id]);

    if (!bankResult.rows.length) {
      return res.status(404).json({ error: 'Bộ đề thi không tồn tại hoặc không có quyền truy cập' });
    }

    // Ưu tiên: nếu có câu hỏi Reading trong question_bank_questions thì trả về dạng Reading
    const rb = await db.query(`
      SELECT qq.id, qq.question_number, qq.question_text, qq.options, qq.correct_answer, qq.passage_id,
             p.part_id
      FROM question_bank_questions qq
      LEFT JOIN question_bank_passages p ON qq.passage_id = p.id
      WHERE qq.bank_id = $1
      ORDER BY p.part_id ASC, qq.question_number ASC
    `, [bank_id]);

    if (rb.rows.length > 0) {
      const questions = rb.rows.map(q => ({
        id: q.id,
        question_number: q.question_number,
        prompt: q.question_text,  // Map question_text to prompt for frontend
        type: q.options && q.options.length > 0 ? 'mcq' : 'short',  // Determine type based on options
        options: q.options || null,
        correct_answer: q.correct_answer,
        passage_id: q.passage_id,
        part_id: q.part_id || null
      }));
      // Lấy passages nếu có
      const passages = await db.query(`
        SELECT id, part_id, passage_text
        FROM question_bank_passages
        WHERE bank_id = $1
        ORDER BY part_id ASC
      `, [bank_id]);
      return res.json({
        ...bankResult.rows[0],
        questions,
        passages: passages.rows
      });
    }

    // Fallback: câu hỏi từ vocabulary (giữ nguyên hành vi cũ)
    const questionsResult = await db.query(`
      SELECT qbi.*, v.word, v.meaning, v.image_url, v.audio_url
      FROM question_bank_items qbi
      JOIN vocabulary v ON qbi.vocab_id = v.id
      WHERE qbi.bank_id = $1
      ORDER BY qbi.id ASC
    `, [bank_id]);

    res.json({
      ...bankResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Nộp bài thi
exports.submitExam = async (req, res) => {
  try {
    const { bank_id } = req.params;
    const { answers, time_taken } = req.body;
    const userId = req.user.id;

    // Lấy thông tin bộ đề
    const bankResult = await db.query('SELECT * FROM question_bank WHERE id = $1', [bank_id]);
    if (!bankResult.rows.length) {
      return res.status(404).json({ error: 'Bộ đề thi không tồn tại' });
    }

    // Trường hợp 1: Đề Reading với question_bank_questions
    const rb = await db.query(`
      SELECT qq.id, qq.question_number, qq.question_text, qq.options, qq.correct_answer, qq.passage_id,
             qq.explanation, qq.keywords, qq.answer_location,
             p.part_id
      FROM question_bank_questions qq
      LEFT JOIN question_bank_passages p ON qq.passage_id = p.id
      WHERE qq.bank_id = $1
      ORDER BY p.part_id ASC, qq.question_number ASC
    `, [bank_id]);

    let score = 0;
    let totalQuestions = 0;
    let results = [];

    const normalize = (s) => (s || '').toString().trim().toLowerCase();

    if (rb.rows.length > 0) {
      // Support answers as array of primitives (by index) OR array of objects with question_id
      let byId = null;
      if (Array.isArray(answers) && answers.length && typeof answers[0] === 'object') {
        byId = new Map();
        answers.forEach(a => {
          const qid = a.question_id || a.id;
          if (qid != null) byId.set(Number(qid), a.answer ?? '');
        });
      }

      const gradedRows = byId
        ? rb.rows.filter(q => byId.has(q.id))
        : rb.rows;

      totalQuestions = gradedRows.length;
      results = gradedRows.map((q, idx) => {
        const ua = byId ? byId.get(q.id) : ((answers && answers[idx] !== undefined) ? answers[idx] : '');
        
        // For reading tests, correct_answer is stored as VARCHAR(1) - just A, B, C, or D
        const correctAnswer = q.correct_answer;
        const is_correct = normalize(ua) === normalize(correctAnswer);
        
        if (is_correct) score++;
        
        return {
          question_id: q.id,
          question_number: q.question_number,
          question_text: q.question_text,
          options: q.options, // Thêm options để hiển thị nội dung đáp án
          explanation: q.explanation,
          keywords: q.keywords,
          answer_location: q.answer_location,
          part_id: q.part_id || null,
          user_answer: ua,
          correct_answer: correctAnswer,
          is_correct
        };
      });
    } else {
      // Trường hợp 2: đề vocabulary (hành vi cũ)
      const questionsResult = await db.query(`
        SELECT qbi.*, v.word, v.meaning
        FROM question_bank_items qbi
        JOIN vocabulary v ON qbi.vocab_id = v.id
        WHERE qbi.bank_id = $1
        ORDER BY qbi.id ASC
      `, [bank_id]);

      totalQuestions = questionsResult.rows.length;
      results = questionsResult.rows.map((question, index) => {
        const userAnswer = answers[index] || '';
        const isCorrect = normalize(userAnswer) === normalize(question.word);
        if (isCorrect) score++;
        return {
          question_id: question.id,
          correct_answer: question.word,
          user_answer: userAnswer,
          is_correct: isCorrect,
          meaning: question.meaning
        };
      });
    }

    // Lưu kết quả với status = 'completed'
    const attemptInsert = await db.query(
      'INSERT INTO exam_attempts (user_id, bank_id, score, total_questions, time_taken, answers, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [userId, bank_id, score, totalQuestions, time_taken, JSON.stringify(results), 'completed']
    );
    const attempt_id = attemptInsert.rows?.[0]?.id;

    // Calculate EXP based on exam performance
    // Base EXP: 20 per correct answer
    // Bonus: +50 EXP for 100% score, +30 EXP for >= 80% score
    const percentage = Math.round((score / totalQuestions) * 100);
    let expGained = score * 20;
    if (percentage === 100) {
      expGained += 50;
    } else if (percentage >= 80) {
      expGained += 30;
    }

    // Add EXP
    const expResult = await learnerController.addExp(userId, expGained);

    // Build summary
    const correct = results.filter(r => r.is_correct).length;
    const skipped = results.filter(r => !r.user_answer).length;
    const wrong = totalQuestions - correct - skipped;

    res.json({
      message: 'Nộp bài thành công!',
      score,
      total_questions: totalQuestions,
      percentage,
      results,
      time_taken: time_taken || 0,
      summary: { correct, wrong, skipped },
      expGained,
      leveledUp: expResult.leveledUp,
      newLevel: expResult.newLevel,
      attempt_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Lấy lịch sử làm bài thi
// Lấy lịch sử làm bài thi
exports.getExamHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // FIX 1: parseInt để tránh lỗi LIMIT/OFFSET
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT ea.*, qb.title as bank_title, qb.difficulty_level
      FROM exam_attempts ea
      JOIN question_bank qb ON ea.bank_id = qb.id
      WHERE ea.user_id = $1
      ORDER BY ea.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};


// Sinh đề TOEIC ngẫu nhiên (MCQ từ vocabulary)
exports.generateRandomToeic = async (req, res) => {
  try {
    const { topic_id, num_questions = 10, difficulty = 'medium' } = req.query;
    const params = [];
    let sql = `SELECT id, word, meaning FROM vocabulary WHERE 1=1`;
    if (topic_id) {
      params.push(parseInt(topic_id, 10));
      sql += ` AND topic_id = $${params.length}`;
    }
    if (difficulty) {
      params.push(difficulty);
      sql += ` AND (difficulty_level = $${params.length} OR difficulty_level IS NULL)`;
    }
    sql += ` ORDER BY RANDOM() LIMIT $${params.length + 1}`;
    params.push(parseInt(num_questions, 10));

    const { rows } = await db.query(sql, params);
    // Tạo đáp án nhiễu (distractors) từ các meaning khác
    const allMeanings = (await db.query(`SELECT meaning FROM vocabulary WHERE meaning IS NOT NULL AND meaning <> ''`)).rows.map(r => r.meaning);
    const questions = rows.map((r, idx) => {
      const correct = r.meaning || '';
      // chọn 3 distractors khác nhau
      const d = [];
      while (d.length < 3 && allMeanings.length) {
        const pick = allMeanings[Math.floor(Math.random() * allMeanings.length)];
        if (pick && pick !== correct && !d.includes(pick)) d.push(pick);
      }
      const options = [correct, ...d].sort(() => Math.random() - 0.5);
      return {
        id: r.id,
        type: 'vocab_mcq',
        prompt: `Chọn nghĩa đúng của từ: ${r.word}`,
        options,
        answer: correct
      };
    });
    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Chấm điểm bài TOEIC ngẫu nhiên
exports.gradeRandomToeic = async (req, res) => {
  try {
    const { answers } = req.body; // [{id, answer}]
    if (!Array.isArray(answers) || !answers.length) return res.status(400).json({ error: 'Thiếu answers' });

    const ids = answers.map(a => parseInt(a.id, 10)).filter(Boolean);
    const { rows } = await db.query(`SELECT id, word, meaning FROM vocabulary WHERE id = ANY($1::int[])`, [ids]);
    const idToMeaning = new Map(rows.map(r => [r.id, r.meaning]));

    let score = 0;
    const detailed = answers.map((a) => {
      const correct = idToMeaning.get(parseInt(a.id, 10)) || '';
      const is_correct = (a.answer || '').trim().toLowerCase() === (correct || '').trim().toLowerCase();
      if (is_correct) score++;
      return {
        id: a.id,
        user_answer: a.answer,
        correct_answer: correct,
        is_correct
      };
    });

    res.json({
      score,
      total_questions: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      results: detailed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// AI-assisted search using Gemini to expand query, then FTS/trigram
exports.aiSearchQuestionBanks = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Tạm thời disable Gemini API để tránh quota exceeded
    let expanded = q;
    console.log('AI Search - Original query:', q);
    
    // Sử dụng fallback search thay vì gọi Gemini API
    if (q) {
      const fallbackTerms = getFallbackTerms(q);
      // Chỉ expand nếu fallback khác với query gốc (có mapping)
      if (fallbackTerms !== q) {
        expanded = `${q}, ${fallbackTerms}`;
        console.log('AI Search - Using fallback expanded query:', expanded);
      } else {
        console.log('AI Search - No mapping found, using original query:', q);
      }
    }

    const terms = expanded.split(/[\,\n]/).map(s => s.trim()).filter(Boolean);
    const searchText = terms.join(' '); // Text để tìm kiếm
    const searchPattern = `%${terms.join('%')}%`; // Pattern cho ILIKE
    
    // Tạo searchText an toàn cho tsquery (thay khoảng trắng bằng &)
    const safeSearchText = searchText.replace(/\s+/g, ' & ');

    const params = [searchText, searchPattern];
    // Thêm các terms riêng lẻ cho ILIKE search
    terms.forEach(term => params.push(`%${term}%`));
    
    let query = `
      SELECT qb.*, u.name as creator_name,
             COUNT(qbi.id) as actual_questions,
             greatest(similarity(qb.title, $1), similarity(coalesce(qb.description,''), $1)) as rank_trgm
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      LEFT JOIN question_bank_items qbi ON qb.id = qbi.bank_id
      WHERE (
        similarity(qb.title, $1) > 0.3 OR similarity(coalesce(qb.description,''), $1) > 0.3
        OR ${terms.map((_, i) => `similarity(qb.title, $${i + 3}) > 0.3`).join(' OR ')}
        OR ${terms.map((_, i) => `similarity(coalesce(qb.description,''), $${i + 3}) > 0.3`).join(' OR ')}
        OR qb.title ILIKE $2 OR qb.description ILIKE $2
        OR ${terms.map((_, i) => `qb.title ILIKE $${i + 3}`).join(' OR ')}
        OR ${terms.map((_, i) => `qb.description ILIKE $${i + 3}`).join(' OR ')}
      )
      GROUP BY qb.id, u.name
      ORDER BY rank_trgm DESC, qb.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({ query: q, expanded, results: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Admin: Duyệt đề thi
exports.approveQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const admin_id = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có thể duyệt đề thi' });
    }

    // Get test info
    const test = await db.query('SELECT * FROM question_bank WHERE id = $1', [id]);
    if (test.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    // Update status to approved
    const updateResult = await db.query(
      'UPDATE question_bank SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3 RETURNING *',
      ['approved', admin_id, id]
    );
    console.log('✅ Approved test:', updateResult.rows[0]);

    // Notify teacher (creator)
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
      [
        test.rows[0].creator_id,
        'test_approved',
        'Đề thi đã được duyệt',
        `Đề thi "${test.rows[0].title}" của bạn đã được duyệt và hiển thị công khai.`,
        JSON.stringify({ bank_id: id })
      ]
    );

    // Notify all learners and other teachers about new test in bank
    const allUsers = await db.query(
      `SELECT id FROM users WHERE role IN ('learner', 'teacher') AND id != $1`,
      [test.rows[0].creator_id]
    );

    // Insert notifications for all users
    for (const user of allUsers.rows) {
      await db.query(
        'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
        [
          user.id,
          'new_test_bank',
          '📚 Đề thi mới trong ngân hàng',
          `Đề thi "${test.rows[0].title}" vừa được thêm vào ngân hàng đề thi. Hãy thử sức ngay!`,
          JSON.stringify({ bank_id: id })
        ]
      );
    }

    console.log(`✅ Sent notifications to ${allUsers.rows.length} users`);

    res.json({ message: 'Đã duyệt đề thi thành công', bank_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Admin: Từ chối đề thi
exports.rejectQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const admin_id = req.user.id;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có thể từ chối đề thi' });
    }

    // Get test info
    const test = await db.query('SELECT * FROM question_bank WHERE id = $1', [id]);
    if (test.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đề thi' });
    }

    // Update status to rejected
    await db.query(
      'UPDATE question_bank SET status = $1, approved_by = $2, approved_at = NOW(), rejection_reason = $3 WHERE id = $4',
      ['rejected', admin_id, reason || 'Không đạt yêu cầu', id]
    );

    // Notify teacher
    await db.query(
      'INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5)',
      [
        test.rows[0].creator_id,
        'test_rejected',
        'Đề thi bị từ chối',
        `Đề thi "${test.rows[0].title}" của bạn bị từ chối. Lý do: ${reason || 'Không đạt yêu cầu'}`,
        JSON.stringify({ bank_id: id, reason })
      ]
    );

    res.json({ message: 'Đã từ chối đề thi', bank_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Get my tests (teacher) - all statuses
exports.getMyTests = async (req, res) => {
  try {
    const creator_id = req.user.id;

    const result = await db.query(`
      SELECT qb.*, u.name as creator_name
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      WHERE qb.creator_id = $1
      ORDER BY qb.created_at DESC
    `, [creator_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Get pending tests for admin
exports.getPendingTests = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền xem' });
    }

    const result = await db.query(`
      SELECT qb.*, u.name as creator_name, u.email as creator_email
      FROM question_bank qb
      LEFT JOIN users u ON qb.creator_id = u.id
      WHERE qb.status = 'pending'
      ORDER BY qb.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Tạo passage mới cho bộ đề
exports.createPassage = async (req, res) => {
  try {
    const { id } = req.params; // bank_id
    const { part_id, passage_text } = req.body;

    if (!passage_text || !passage_text.trim()) {
      return res.status(400).json({ error: 'Nội dung đoạn văn không được rỗng' });
    }

    const result = await db.query(
      `INSERT INTO question_bank_passages (bank_id, part_id, passage_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, part_id || 1, passage_text]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating passage:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Tạo question mới cho bộ đề
exports.createQuestion = async (req, res) => {
  try {
    const { id } = req.params; // bank_id
    const { passage_id, question_number, question_text, options, correct_answer } = req.body;

    if (!question_text || !question_text.trim()) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không được rỗng' });
    }

    if (!options || typeof options !== 'object') {
      return res.status(400).json({ error: 'Options phải là object với các key A, B, C, D' });
    }

    if (!correct_answer || !['A', 'B', 'C', 'D'].includes(correct_answer)) {
      return res.status(400).json({ error: 'Đáp án đúng phải là A, B, C hoặc D' });
    }

    const result = await db.query(
      `INSERT INTO question_bank_questions (bank_id, passage_id, question_number, question_text, options, correct_answer)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, passage_id, question_number || 1, question_text, JSON.stringify(options), correct_answer]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
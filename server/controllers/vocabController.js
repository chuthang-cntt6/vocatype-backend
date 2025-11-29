const db = require('../models/db');

// Generate sentence using AI
exports.generateSentence = async (req, res) => {
  try {
    const { word, meaning } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ error: 'Thiếu word và meaning' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI API not configured', sentence: null });
    }

    const prompt = `Generate a natural, authentic English sentence for a fill-in-the-blank exercise.
Requirements:
- Use the word "${word}" (meaning: "${meaning}") naturally in context
- Create a sentence that demonstrates the word's actual meaning and usage
- Make it clear, grammatically correct, and educational
- Suitable for intermediate English learners
- Maximum 15 words
Return ONLY the sentence, nothing else.`;

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${word}`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Gemini API error (attempt ${attempt}):`, response.status, response.statusText);
          lastError = new Error(`API error ${response.status}: ${errorData}`);

          if (response.status === 503 && attempt < maxRetries) {
            const delay = attempt * 2000;
            console.log(`⏳ Service overloaded, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            return res.status(500).json({ error: 'AI generation failed', sentence: null });
          }
        }

        const data = await response.json();
        let aiSentence = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        aiSentence = aiSentence.replace(/^["']|["']$/g, '').trim();

        if (!aiSentence) {
          return res.status(500).json({ error: 'Empty AI response', sentence: null });
        }

        console.log(`✅ Generated sentence for ${word}:`, aiSentence);
        return res.json({ sentence: aiSentence });

      } catch (err) {
        console.error(`❌ Network error (attempt ${attempt}):`, err.message);
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    // All retries failed
    return res.status(500).json({ error: 'AI generation failed after retries', sentence: null, details: lastError?.message });

  } catch (err) {
    console.error('❌ Generate sentence error:', err);
    res.status(500).json({ error: 'Lỗi khi tạo câu', sentence: null });
  }
};


exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vocabulary ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM vocabulary WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy từ vựng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.create = async (req, res) => {
  try {
    const { word, meaning, image_url, audio_url, topic_id, phonetic, word_type, example } = req.body;
    const result = await db.query(
      'INSERT INTO vocabulary (word, meaning, image_url, audio_url, topic_id, phonetic, word_type, example) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [word, meaning, image_url, audio_url, topic_id, phonetic, word_type, example]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { word, meaning, image_url, audio_url, topic_id, phonetic, word_type, example } = req.body;
    const result = await db.query(
      'UPDATE vocabulary SET word=$1, meaning=$2, image_url=$3, audio_url=$4, topic_id=$5, phonetic=$6, word_type=$7, example=$8 WHERE id=$9 RETURNING *',
      [word, meaning, image_url, audio_url, topic_id, phonetic, word_type, example, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy từ vựng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM vocabulary WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy từ vựng' });
    res.json({ message: 'Đã xóa từ vựng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getByTopic = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM vocabulary WHERE topic_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
// 🔍 Tìm kiếm từ vựng theo keyword
exports.searchVocabulary = async (req, res) => {
  try {
    const { word } = req.query;

    if (!word) {
      return res.status(400).json({ error: 'Thiếu từ cần tìm' });
    }

    const result = await db.query(
      `SELECT * FROM vocabulary 
       WHERE LOWER(word) LIKE LOWER($1)
       ORDER BY id
       LIMIT 10`,
      [`%${word}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Lỗi khi tìm từ vựng:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Helper function to normalize text (remove punctuation, trim, lowercase)
function normalizeText(text) {
  if (!text) return '';
  return text.trim().replace(/[.,!?;:]+$/, '').trim().toLowerCase();
}

// Helper function for basic similarity (Levenshtein-based)
function calculateBasicSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  const matrix = [];
  for (let i = 0; i <= s2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 100 : Math.round((1 - matrix[s2.length][s1.length] / maxLen) * 100);
}

// AI Pronunciation Analysis using Gemini
exports.analyzePronunciation = async (req, res) => {
  try {
    let { recognizedText, expectedWord, confidence } = req.body;

    if (!recognizedText || !expectedWord) {
      return res.status(400).json({ error: 'Thiếu recognizedText hoặc expectedWord' });
    }

    const normalizedRec = normalizeText(recognizedText);
    const normalizedExp = normalizeText(expectedWord);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      return res.json({
        similarityScore: calculateBasicSimilarity(normalizedRec, normalizedExp),
        feedback: 'AI không khả dụng, sử dụng phương pháp cơ bản',
        detailedFeedback: null,
        suggestions: [],
        pronunciationIssues: [],
        isAI: false
      });
    }

    console.log(`🤖 AI Analyzing pronunciation: "${normalizedRec}" vs "${normalizedExp}"`);

    const prompt = `Bạn là chuyên gia đánh giá phát âm tiếng Anh. Phân tích phát âm của người học và đưa ra phản hồi chi tiết.

Từ mong đợi (chuẩn): "${normalizedExp}"
Text nhận diện được: "${normalizedRec}"
Độ tin cậy nhận diện: ${confidence ? (confidence * 100).toFixed(1) : 'N/A'}%

Hãy phân tích và trả về JSON với format sau (chỉ trả về JSON, không có text khác):
{
  "similarityScore": <số từ 0-100, đánh giá độ chính xác phát âm>,
  "feedback": "<phản hồi ngắn gọn bằng tiếng Việt, 1 câu>",
  "detailedFeedback": "<phản hồi chi tiết bằng tiếng Việt về lỗi phát âm cụ thể, ngữ điệu, tốc độ nói>",
  "suggestions": ["<gợi ý 1>", "<gợi ý 2>", "<gợi ý 3>"],
  "pronunciationIssues": ["<vấn đề 1>", "<vấn đề 2>"]
}

Lưu ý:
- Text đã normalize, KHÔNG đề cập dấu câu
- similarityScore: Dựa trên phát âm, không chỉ so sánh text
- detailedFeedback: Mô tả lỗi phát âm
- suggestions: gợi ý cải thiện phát âm
- pronunciationIssues: liệt kê vấn đề phát âm`;

    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Gemini API error (attempt ${attempt}):`, response.status, errorData);
          lastError = new Error(`API error: ${response.status}`);
          if (attempt < maxRetries && response.status === 503) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
            continue;
          }
          throw lastError;
        }

        let data = await response.json();
        let aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        aiResponse = aiResponse.replace(/```(json)?/g, '').trim(); // remove markdown

        let analysisResult;
        try {
          const jsonMatches = aiResponse.match(/\{[\s\S]*\}/g);
          if (jsonMatches && jsonMatches.length > 0) {
            analysisResult = JSON.parse(jsonMatches[jsonMatches.length - 1]);
          } else {
            throw new Error('No JSON found in AI response');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse AI response:', aiResponse);
          analysisResult = {
            similarityScore: calculateBasicSimilarity(normalizedRec, normalizedExp),
            feedback: 'Lỗi phân tích AI, sử dụng phương pháp cơ bản',
            detailedFeedback: null,
            suggestions: [],
            pronunciationIssues: [],
            isAI: false
          };
        }

        // Ensure all fields exist
        analysisResult.similarityScore ??= calculateBasicSimilarity(normalizedRec, normalizedExp);
        analysisResult.feedback ??= '';
        analysisResult.detailedFeedback ??= '';
        analysisResult.suggestions ??= [];
        analysisResult.pronunciationIssues ??= [];
        analysisResult.isAI = true;

        console.log(`✅ AI Pronunciation Analysis: ${analysisResult.similarityScore}%`);
        return res.json(analysisResult);

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        lastError = error;
        if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }

    // Fallback if all retries fail
    console.log('⚠️ AI failed, using basic similarity');
    const basicScore = calculateBasicSimilarity(normalizedRec, normalizedExp);
    return res.json({
      similarityScore: basicScore,
      feedback: basicScore >= 80 ? 'Phát âm khá tốt!' : basicScore >= 60 ? 'Cần cải thiện' : 'Phát âm chưa đúng',
      detailedFeedback: null,
      suggestions: [],
      pronunciationIssues: [],
      isAI: false
    });

  } catch (err) {
    console.error('❌ Analyze pronunciation error:', err);
    const normalizedRec = normalizeText(req.body.recognizedText || '');
    const normalizedExp = normalizeText(req.body.expectedWord || '');
    const basicScore = calculateBasicSimilarity(normalizedRec, normalizedExp);
    res.json({
      similarityScore: basicScore,
      feedback: 'Lỗi phân tích, sử dụng phương pháp cơ bản',
      detailedFeedback: null,
      suggestions: [],
      pronunciationIssues: [],
      isAI: false
    });
  }
};

const db = require('../models/db');

// AI Correction and Explanation for Dictation
exports.checkWithAI = async (req, res) => {
  try {
    const { userInput, correctTranscript } = req.body;
    
    if (!userInput || !correctTranscript) {
      return res.status(400).json({ 
        error: 'Thiếu userInput hoặc correctTranscript' 
      });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      // Fallback to basic comparison
      return res.json({
        score: calculateBasicScore(userInput, correctTranscript),
        isPerfect: false,
        errors: [],
        corrections: [],
        explanation: 'AI không khả dụng, sử dụng phương pháp cơ bản',
        isAI: false
      });
    }
    
    console.log(`🤖 AI Checking dictation: "${userInput}" vs "${correctTranscript}"`);
    
    const prompt = `Bạn là giáo viên tiếng Anh chuyên nghiệp, chuyên sửa bài dictation cho học sinh. Phân tích câu trả lời của học sinh và so sánh với đáp án đúng.

Đáp án đúng: "${correctTranscript}"
Câu trả lời của học sinh: "${userInput}"

Hãy phân tích và trả về JSON với format sau (chỉ trả về JSON, không có text khác, không có markdown code blocks):
{
  "score": <số từ 0-100, điểm số dựa trên độ chính xác>,
  "isPerfect": <true nếu hoàn toàn đúng, false nếu có lỗi>,
  "errors": [
    {
      "position": <vị trí từ trong câu (0-based index)>,
      "userWord": "<từ học sinh viết sai>",
      "correctWord": "<từ đúng>",
      "errorType": "<loại lỗi: spelling/grammar/word_order/missing_word/extra_word>",
      "explanation": "<giải thích ngắn gọn lỗi này bằng tiếng Việt>"
    }
  ],
  "corrections": [
    {
      "position": <vị trí>,
      "original": "<từ/cụm từ sai>",
      "corrected": "<từ/cụm từ đúng>",
      "reason": "<lý do sửa bằng tiếng Việt>"
    }
  ],
  "explanation": "<giải thích tổng quan về các lỗi và cách cải thiện bằng tiếng Việt, 2-3 câu>",
  "suggestions": ["<gợi ý 1>", "<gợi ý 2>", "<gợi ý 3>"]
}

Lưu ý QUAN TRỌNG:
- So sánh chính xác từng từ, không bỏ qua lỗi chính tả nhỏ
- Phân biệt rõ các loại lỗi: spelling (chính tả), grammar (ngữ pháp), word_order (thứ tự từ), missing_word (thiếu từ), extra_word (thừa từ)
- errors: Liệt kê TẤT CẢ các từ sai, kể cả lỗi nhỏ
- corrections: Đưa ra cách sửa cụ thể cho từng lỗi
- explanation: Giải thích dễ hiểu, khuyến khích học sinh
- suggestions: Gợi ý thực tế để cải thiện kỹ năng nghe và viết
- Nếu câu hoàn toàn đúng, errors và corrections là mảng rỗng, isPerfect = true, score = 100`;

    const maxRetries = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000,
              }
            })
          }
        );
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`❌ Gemini API error (attempt ${attempt}):`, response.status);
          lastError = new Error(`API error: ${response.status}`);
          if (attempt < maxRetries && response.status === 503) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }
          throw lastError;
        }
        
        const data = await response.json();
        const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        
        // Parse JSON from AI response
        let analysisResult;
        try {
          // Extract JSON from response (might have markdown code blocks)
          let jsonText = aiResponse;
          // Remove markdown code blocks if present
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          // Find JSON object
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse AI response:', aiResponse);
          // Fallback to basic analysis
          analysisResult = createBasicAnalysis(userInput, correctTranscript);
          analysisResult.isAI = false;
          return res.json(analysisResult);
        }
        
        // Ensure all required fields
        if (typeof analysisResult.score !== 'number') {
          analysisResult.score = calculateBasicScore(userInput, correctTranscript);
        }
        if (!Array.isArray(analysisResult.errors)) {
          analysisResult.errors = [];
        }
        if (!Array.isArray(analysisResult.corrections)) {
          analysisResult.corrections = [];
        }
        if (!analysisResult.explanation) {
          analysisResult.explanation = 'Đã phân tích bài làm của bạn.';
        }
        if (!Array.isArray(analysisResult.suggestions)) {
          analysisResult.suggestions = [];
        }
        analysisResult.isAI = true;
        analysisResult.isPerfect = analysisResult.score === 100 && analysisResult.errors.length === 0;
        
        console.log(`✅ AI Dictation Check: ${analysisResult.score}%`);
        return res.json(analysisResult);
        
      } catch (error) {
        console.error(`❌ Error (attempt ${attempt}):`, error.message);
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }
    
    // All retries failed, return basic analysis
    console.log('⚠️ AI failed, using basic comparison');
    const basicResult = createBasicAnalysis(userInput, correctTranscript);
    basicResult.isAI = false;
    return res.json(basicResult);
    
  } catch (err) {
    console.error('❌ Check dictation with AI error:', err);
    // Fallback to basic comparison
    const basicResult = createBasicAnalysis(req.body.userInput || '', req.body.correctTranscript || '');
    basicResult.isAI = false;
    return res.json(basicResult);
  }
};

// Helper function to create basic analysis
function createBasicAnalysis(userInput, correctTranscript) {
  const score = calculateBasicScore(userInput, correctTranscript);
  const userWords = userInput.toLowerCase().trim().split(/\s+/);
  const correctWords = correctTranscript.toLowerCase().trim().split(/\s+/);
  const errors = [];
  const corrections = [];
  
  // Simple word-by-word comparison
  const maxLen = Math.max(userWords.length, correctWords.length);
  for (let i = 0; i < maxLen; i++) {
    const userWord = userWords[i] || '';
    const correctWord = correctWords[i] || '';
    
    if (userWord !== correctWord) {
      if (userWord && correctWord) {
        errors.push({
          position: i,
          userWord: userWord,
          correctWord: correctWord,
          errorType: 'spelling',
          explanation: `Từ "${userWord}" nên là "${correctWord}"`
        });
        corrections.push({
          position: i,
          original: userWord,
          corrected: correctWord,
          reason: 'Chính tả sai'
        });
      } else if (userWord && !correctWord) {
        errors.push({
          position: i,
          userWord: userWord,
          correctWord: '',
          errorType: 'extra_word',
          explanation: `Từ "${userWord}" không cần thiết`
        });
      } else if (!userWord && correctWord) {
        errors.push({
          position: i,
          userWord: '',
          correctWord: correctWord,
          errorType: 'missing_word',
          explanation: `Thiếu từ "${correctWord}"`
        });
        corrections.push({
          position: i,
          original: '',
          corrected: correctWord,
          reason: 'Thiếu từ'
        });
      }
    }
  }
  
  return {
    score: score,
    isPerfect: score === 100 && errors.length === 0,
    errors: errors,
    corrections: corrections,
    explanation: score === 100 
      ? 'Hoàn hảo! Bạn đã viết chính xác.' 
      : `Có ${errors.length} lỗi cần sửa. Hãy nghe lại và viết chính xác hơn.`,
    suggestions: [
      'Nghe kỹ từng từ một',
      'Chú ý chính tả và dấu câu',
      'Kiểm tra lại sau khi viết'
    ],
    isAI: false
  };
}

// Helper function for basic score calculation
function calculateBasicScore(userInput, correctTranscript) {
  const normalize = (str) => str.toLowerCase().trim().replace(/[.,!?;:]/g, '');
  const userNorm = normalize(userInput);
  const correctNorm = normalize(correctTranscript);
  
  if (userNorm === correctNorm) return 100;
  
  const userWords = userNorm.split(/\s+/).filter(w => w.length > 0);
  const correctWords = correctNorm.split(/\s+/).filter(w => w.length > 0);
  
  if (userWords.length === 0) return 0;
  
  let matches = 0;
  const maxLen = Math.max(userWords.length, correctWords.length);
  
  for (let i = 0; i < maxLen; i++) {
    const userWord = userWords[i] || '';
    const correctWord = correctWords[i] || '';
    
    if (userWord === correctWord) {
      matches += 1;
    } else if (userWord && correctWord) {
      // Partial match
      if (userWord.includes(correctWord) || correctWord.includes(userWord)) {
        matches += 0.5;
      }
    }
  }
  
  return Math.round((matches / correctWords.length) * 100);
}


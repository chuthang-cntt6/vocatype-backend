const API_KEY = process.argv[2];           // key truyền từ terminal
const MODEL = "models/gemini-2.0-flash";   // model muốn test

// Từ người học phát âm và từ chuẩn
const RECOGNIZED_TEXT = "oil";   // giả lập text nhận diện
const EXPECTED_WORD = "oil";     // từ chuẩn
const CONFIDENCE = 0.95;         // độ tin cậy nhận diện, 0-1

if (!API_KEY) {
  console.error("❌ Missing API key. Usage:");
  console.error("node test_gemini.js YOUR_API_KEY");
  process.exit(1);
}

// Tạo prompt đánh giá phát âm
const PROMPT = `Bạn là chuyên gia đánh giá phát âm tiếng Anh. Phân tích phát âm của người học và đưa ra phản hồi chi tiết.

Từ mong đợi (chuẩn): "${EXPECTED_WORD}"
Text nhận diện được: "${RECOGNIZED_TEXT}"
Độ tin cậy nhận diện: ${CONFIDENCE * 100}%

Hãy phân tích và trả về JSON với format sau (chỉ trả về JSON, không có text khác):
{
  "similarityScore": <số từ 0-100, đánh giá độ chính xác phát âm>,
  "feedback": "<phản hồi ngắn gọn bằng tiếng Việt, 1 câu>",
  "detailedFeedback": "<phản hồi chi tiết bằng tiếng Việt về lỗi phát âm cụ thể, ngữ điệu, tốc độ nói>",
  "suggestions": ["<gợi ý 1>", "<gợi ý 2>", "<gợi ý 3>"],
  "pronunciationIssues": ["<vấn đề 1>", "<vấn đề 2>"]
}`;

async function runTest() {
  const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{ parts: [{ text: PROMPT }] }],
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 500,
    }
  };

  try {
    console.log("🔑 Using key:", API_KEY.slice(0, 10) + "...");
    console.log("⚙️  Model:", MODEL);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Gemini API error:", res.status, data);
      return;
    }

    // Lấy text từ response
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log("✅ AI Response:");
    console.log(aiResponse);

  } catch (err) {
    console.error("❌ Request failed:", err);
  }
}

runTest();

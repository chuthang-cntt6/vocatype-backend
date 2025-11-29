require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent("Expand 'kinh doanh' into a concise list of synonyms and related keyphrases (max 5) for exam bank search. Return a comma-separated string only.");
    console.log('✅ Response:', result.response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
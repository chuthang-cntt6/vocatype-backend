const axios = require('axios');

async function testLearningSummary() {
  try {
    console.log('🧪 Testing learning summary API...');
    
    const response = await axios.get('http://localhost:5050/api/learner/8/learning-summary');
    
    console.log('✅ Success!');
    console.log('📊 Summary:', response.data.summary);
    console.log('📝 Vocab Details:', response.data.vocabDetails);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLearningSummary();

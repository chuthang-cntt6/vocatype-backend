const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testLogin() {
  try {
    // Kiểm tra user
    const userResult = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', ['hv1@example.com']);
    console.log('User data:', userResult.rows[0]);
    
    // Test login
    const loginResponse = await fetch('http://localhost:5050/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hv1@example.com', password: 'password123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      // Test take exam
      const examResponse = await fetch('http://localhost:5050/api/question-bank/5/take', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + loginData.token }
      });
      
      const examData = await examResponse.json();
      console.log('Take exam response:', examData);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testLogin();


// Test avatar upload endpoint
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testAvatarUpload() {
  try {
    console.log('Testing avatar upload endpoint...');
    
    // Create a test file
    const testFile = 'test-avatar.txt';
    fs.writeFileSync(testFile, 'test avatar content');
    
    const form = new FormData();
    form.append('avatar', fs.createReadStream(testFile), {
      filename: 'test-avatar.txt',
      contentType: 'text/plain'
    });
    
    const response = await fetch('http://localhost:5050/api/auth/users/avatar', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response:', text);
    
    // Clean up
    fs.unlinkSync(testFile);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAvatarUpload();

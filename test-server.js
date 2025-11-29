// Test server connection
const http = require('http');

function testServer() {
  const options = {
    hostname: 'localhost',
    port: 5050,
    path: '/api/auth/users/profile',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(JSON.stringify({
    name: 'Test User',
    email: 'test@example.com'
  }));
  
  req.end();
}

testServer();

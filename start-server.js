// Start server and test API
const { spawn } = require('child_process');
const http = require('http');

console.log('Starting server...');

// Start server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: { ...process.env, JWT_SECRET: 'default-secret-key', PORT: 5050 }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Wait for server to start
setTimeout(() => {
  console.log('Testing API...');
  
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
    console.log('API Test - Status:', res.statusCode);
    console.log('API Test - Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('API Test - Response:', data);
      server.kill();
    });
  });

  req.on('error', (e) => {
    console.error('API Test - Error:', e.message);
    server.kill();
  });

  req.write(JSON.stringify({
    name: 'Test User',
    email: 'test@example.com'
  }));
  
  req.end();
}, 3000);

// Handle process exit
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill();
  process.exit(0);
});

// Quick API test
fetch('http://localhost:5050/api/auth/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com'
  })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(text => {
  console.log('Response:', text);
})
.catch(error => {
  console.error('Error:', error.message);
});

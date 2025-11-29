// Test file to check if Blog component can be imported
const React = require('react');

try {
  console.log('Testing Blog component import...');
  
  // Check if the file exists
  const fs = require('fs');
  const path = require('path');
  
  const blogPath = path.join(__dirname, 'client/src/pages/Blog.jsx');
  console.log('Blog file path:', blogPath);
  console.log('Blog file exists:', fs.existsSync(blogPath));
  
  if (fs.existsSync(blogPath)) {
    const content = fs.readFileSync(blogPath, 'utf8');
    console.log('Blog file size:', content.length, 'characters');
    console.log('Blog file starts with:', content.substring(0, 100));
  }
  
} catch (error) {
  console.error('Error testing Blog component:', error.message);
}

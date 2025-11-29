// models/db.js
const { Pool } = require('pg');

// Parse DATABASE_URL hoặc sử dụng cấu hình riêng biệt
let dbConfig;

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 20
    };
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    // Fallback to connection string
    dbConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: false
    };
  }
} else {
  dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'vocatype',
    user: 'postgres',
    password: '250403',
    ssl: false
  };
}

const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err.message);
});

module.exports = pool;

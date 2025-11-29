// Script để chạy migration thêm cột explanation, keywords, answer_location
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vocatype',
  password: process.env.DB_PASSWORD || '123',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  try {
    console.log('🔄 Đang chạy migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'add_explanation_to_questions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration thành công!');
    console.log('✅ Đã thêm các cột:');
    console.log('   - explanation (TEXT)');
    console.log('   - keywords (TEXT[])');
    console.log('   - answer_location (TEXT)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error.message);
    process.exit(1);
  }
}

runMigration();

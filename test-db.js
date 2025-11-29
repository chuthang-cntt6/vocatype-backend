const db = require('./server/models/db');
(async () => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Các bảng hiện có trong DB:');
    console.table(result.rows);
    process.exit();
  } catch (err) {
    console.error('❌ Lỗi khi truy vấn:', err);
    process.exit(1);
  }
})();

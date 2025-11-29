// Run SQL migration using existing pg Pool config
const fs = require('fs');
const path = require('path');
const db = require('../models/db');

(async () => {
  const sqlPath = path.resolve(__dirname, '../migrations/fts_setup.sql');
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await db.query(sql);
    console.log('✅ Migration executed successfully');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  }
})();



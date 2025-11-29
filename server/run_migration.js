const db = require('./models/db');

async function runMigration() {
  try {
    console.log('🔄 Running migration: add status to exam_attempts...');
    
    // Add status column
    await db.query(`
      ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed'
    `);
    console.log('✅ Added status column');
    
    // Update existing records
    await db.query(`
      UPDATE exam_attempts SET status = 'completed' WHERE status IS NULL
    `);
    console.log('✅ Updated existing records');
    
    // Add indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_status ON exam_attempts(user_id, status)
    `);
    console.log('✅ Added indexes');
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

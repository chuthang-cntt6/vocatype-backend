console.log('Please run the following SQL commands in your PostgreSQL database:');
console.log('');
console.log('-- 1. Add password_hash column if not exists');
console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(100);');
console.log('');
console.log('-- 2. Copy data from password to password_hash');
console.log('UPDATE users SET password_hash = password WHERE password_hash IS NULL;');
console.log('');
console.log('-- 3. Drop old password column');
console.log('ALTER TABLE users DROP COLUMN IF EXISTS password;');
console.log('');
console.log('-- 4. Create question_bank table');
console.log(`CREATE TABLE IF NOT EXISTS question_bank (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id INTEGER REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  time_limit INTEGER DEFAULT 60,
  total_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
console.log('');
console.log('-- 5. Create question_bank_items table');
console.log(`CREATE TABLE IF NOT EXISTS question_bank_items (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
  vocab_id INTEGER REFERENCES vocabulary(id),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
console.log('');
console.log('-- 6. Create exam_attempts table');
console.log(`CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bank_id INTEGER REFERENCES question_bank(id),
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers JSONB
);`);
console.log('');
console.log('Migration SQL commands generated successfully!');
console.log('');
console.log('-- 7. Add phonetic/word_type/grammar to vocabulary');
console.log('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS phonetic TEXT;');
console.log('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS word_type VARCHAR(20);');
console.log('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS grammar TEXT;');
console.log('');
console.log('-- 8. Enable pg_trgm and FTS (question_bank)');
console.log('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
console.log("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS tsv tsvector;");
console.log("UPDATE question_bank SET tsv = setweight(to_tsvector('simple', coalesce(title, '')), 'A') || setweight(to_tsvector('simple', coalesce(description, '')), 'B');");
console.log(`CREATE OR REPLACE FUNCTION question_bank_tsv_trigger() RETURNS trigger AS $$
begin
  new.tsv := setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') || setweight(to_tsvector('simple', coalesce(new.description, '')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;`);
console.log('DROP TRIGGER IF EXISTS trg_qb_tsv ON question_bank;');
console.log('CREATE TRIGGER trg_qb_tsv BEFORE INSERT OR UPDATE ON question_bank FOR EACH ROW EXECUTE PROCEDURE question_bank_tsv_trigger();');
console.log('CREATE INDEX IF NOT EXISTS idx_qb_tsv ON question_bank USING GIN (tsv);');
console.log('CREATE INDEX IF NOT EXISTS idx_qb_title_trgm ON question_bank USING GIN (title gin_trgm_ops);');
console.log('CREATE INDEX IF NOT EXISTS idx_qb_description_trgm ON question_bank USING GIN (description gin_trgm_ops);');

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(100),
  role VARCHAR(20) DEFAULT 'learner',
  avatar_url TEXT,
  oauth_provider VARCHAR(20), -- 'google', 'facebook', null
  oauth_id VARCHAR(100), -- OAuth provider user ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng topic
CREATE TABLE IF NOT
 EXISTS topic (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Tạo bảng vocabulary
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  meaning TEXT NOT NULL,
  topic_id INTEGER REFERENCES topic(id),
  image_url TEXT,
  audio_url TEXT,
  phonetic TEXT,
  word_type VARCHAR(20),
  grammar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng sentence
CREATE TABLE IF NOT EXISTS sentence (
  id SERIAL PRIMARY KEY,
  vocab_id INTEGER REFERENCES vocabulary(id),
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng typingrecord
CREATE TABLE IF NOT EXISTS typingrecord (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER REFERENCES users(id),
  vocab_id INTEGER REFERENCES vocabulary(id),
  wpm INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  errors INTEGER DEFAULT 0,
  words_typed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng badge
CREATE TABLE IF NOT EXISTS badge (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng learner_badge
CREATE TABLE IF NOT EXISTS learner_badge (
  learner_id INTEGER REFERENCES users(id),
  badge_id INTEGER REFERENCES badge(id),
  achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (learner_id, badge_id)
);


-- Tạo bảng question_bank (ngân hàng đề thi)
CREATE TABLE IF NOT EXISTS question_bank (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id INTEGER REFERENCES users(id),
  is_public BOOLEAN DEFAULT false,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  time_limit INTEGER DEFAULT 60, -- thời gian làm bài (giây)
  total_questions INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng question_bank_items (các câu hỏi trong bộ đề)
CREATE TABLE IF NOT EXISTS question_bank_items (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
  vocab_id INTEGER REFERENCES vocabulary(id),
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng exam_attempts (lịch sử làm bài thi)
CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bank_id INTEGER REFERENCES question_bank(id),
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0, -- thời gian làm bài thực tế (giây)
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers JSONB, -- lưu câu trả lời của user
  status VARCHAR(20) DEFAULT 'completed' -- trạng thái: completed, in_progress, abandoned
);

-- Thêm một số chủ đề mẫu
INSERT INTO topic (name, description) VALUES
('Du lịch', 'Từ vựng về du lịch, đi lại, khách sạn...'),
('Công nghệ', 'Từ vựng về máy tính, internet, phần mềm...'),
('Ẩm thực', 'Từ vựng về món ăn, nấu nướng, nhà hàng...')
ON CONFLICT (name) DO NOTHING; 

-- Enable extensions for full-text and trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add tsvector and keep it updated
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS tsv tsvector;
UPDATE question_bank SET tsv =
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B');

CREATE OR REPLACE FUNCTION question_bank_tsv_trigger() RETURNS trigger AS $$
begin
  new.tsv :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'B');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qb_tsv ON question_bank;
CREATE TRIGGER trg_qb_tsv BEFORE INSERT OR UPDATE ON question_bank
FOR EACH ROW EXECUTE PROCEDURE question_bank_tsv_trigger();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qb_tsv ON question_bank USING GIN (tsv);
CREATE INDEX IF NOT EXISTS idx_qb_title_trgm ON question_bank USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_qb_description_trgm ON question_bank USING GIN (description gin_trgm_ops);
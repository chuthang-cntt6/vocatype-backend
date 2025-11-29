-- Create passages table for question banks
CREATE TABLE IF NOT EXISTS question_bank_passages (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
  part_id INTEGER NOT NULL,
  passage_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table for passages
CREATE TABLE IF NOT EXISTS question_bank_questions (
  id SERIAL PRIMARY KEY,
  bank_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
  passage_id INTEGER REFERENCES question_bank_passages(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_passages_bank_id ON question_bank_passages(bank_id);
CREATE INDEX IF NOT EXISTS idx_passages_part_id ON question_bank_passages(part_id);
CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON question_bank_questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_passage_id ON question_bank_questions(passage_id);

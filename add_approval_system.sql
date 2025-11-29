-- Add approval system for question banks
ALTER TABLE question_bank 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing question banks to 'approved' status
UPDATE question_bank SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_question_bank_status ON question_bank(status);
CREATE INDEX IF NOT EXISTS idx_question_bank_creator ON question_bank(creator_id);

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

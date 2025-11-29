-- Add status column to exam_attempts table
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Update existing records to have status = 'completed'
UPDATE exam_attempts SET status = 'completed' WHERE status IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_status ON exam_attempts(user_id, status);

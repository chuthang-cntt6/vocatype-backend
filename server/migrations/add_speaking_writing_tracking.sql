-- Add pronunciation_count and writing_count to learning_progress
ALTER TABLE learning_progress ADD COLUMN IF NOT EXISTS pronunciation_count INTEGER DEFAULT 0;
ALTER TABLE learning_progress ADD COLUMN IF NOT EXISTS writing_count INTEGER DEFAULT 0;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_learning_progress_pronunciation ON learning_progress(learner_id, pronunciation_count);
CREATE INDEX IF NOT EXISTS idx_learning_progress_writing ON learning_progress(learner_id, writing_count);

-- Update existing records to have default values
UPDATE learning_progress SET pronunciation_count = 0 WHERE pronunciation_count IS NULL;
UPDATE learning_progress SET writing_count = 0 WHERE writing_count IS NULL;

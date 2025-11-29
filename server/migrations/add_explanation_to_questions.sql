-- Thêm cột explanation, keywords, và answer_location vào bảng question_bank_questions
-- Chạy migration này để thêm tính năng giải thích chi tiết đáp án

ALTER TABLE question_bank_questions 
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[], -- Mảng từ khóa quan trọng
ADD COLUMN IF NOT EXISTS answer_location TEXT; -- Vị trí đáp án trong passage (trích dẫn)

-- Thêm comment để giải thích các cột mới
COMMENT ON COLUMN question_bank_questions.explanation IS 'Giải thích chi tiết tại sao đáp án này đúng';
COMMENT ON COLUMN question_bank_questions.keywords IS 'Các từ khóa quan trọng trong câu hỏi và đáp án';
COMMENT ON COLUMN question_bank_questions.answer_location IS 'Trích đoạn văn bản chứa đáp án từ passage';

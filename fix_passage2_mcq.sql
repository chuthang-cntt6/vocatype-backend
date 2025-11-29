-- Sửa Passage 2 câu 14-26 thành MCQ với 4 đáp án

-- Câu 14: Section A
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section A – What marks the beginning of commercial 3-D films?',
    options = '["The Power of Love (1922)", "Bwana Devil (1952)", "Avatar (2009)", "IMAX in the 1990s"]'::jsonb,
    correct_answer = '["The Power of Love (1922)"]'::jsonb
WHERE bank_id = 11 AND order_index = 14;

-- Câu 15: Section B
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section B – Which film exemplified the modern commercial success of 3-D?',
    options = '["Titanic", "Avatar", "Bwana Devil", "Clash of the Titans"]'::jsonb,
    correct_answer = '["Avatar"]'::jsonb
WHERE bank_id = 11 AND order_index = 15;

-- Câu 16: Section C
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section C – What are some benefits of 3-D for the audience experience?',
    options = '["Enhanced immersion and sense of vertigo", "Lower ticket prices", "Shorter film duration", "Better sound quality"]'::jsonb,
    correct_answer = '["Enhanced immersion and sense of vertigo"]'::jsonb
WHERE bank_id = 11 AND order_index = 16;

-- Câu 17: Section D
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section D – What physical problems can 3-D films cause for viewers?',
    options = '["Improved vision", "Eyestrain, headaches, nausea", "Better depth perception", "Increased energy"]'::jsonb,
    correct_answer = '["Eyestrain, headaches, nausea"]'::jsonb
WHERE bank_id = 11 AND order_index = 17;

-- Câu 18: Section E
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section E – What are criticisms of 3-D in terms of film-making quality?',
    options = '["Enhances storytelling", "Diminishes narrative, encourages gimmicks", "Improves acting quality", "Reduces production costs"]'::jsonb,
    correct_answer = '["Diminishes narrative, encourages gimmicks"]'::jsonb
WHERE bank_id = 11 AND order_index = 18;

-- Câu 19: Section F
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Section F – How is 3-D influencing the current film industry?',
    options = '["Declining in popularity", "Boosting box office success", "Being replaced by 2-D", "Only used in documentaries"]'::jsonb,
    correct_answer = '["Boosting box office success"]'::jsonb
WHERE bank_id = 11 AND order_index = 19;

-- Câu 20: Matching opinions
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = '3-D can cause eye strain and headaches for some viewers.',
    options = '["Kenneth Turan", "Dr. Michael Rosenberg", "Roger Ebert", "Kevin Carr"]'::jsonb,
    correct_answer = '["Dr. Michael Rosenberg"]'::jsonb
WHERE bank_id = 11 AND order_index = 20;

-- Câu 21
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = '3-D encourages filmmakers to rely on visual effects rather than story.',
    options = '["Kenneth Turan", "Roger Ebert", "Dr. Deborah Friedman", "Animation Ideas blogger"]'::jsonb,
    correct_answer = '["Roger Ebert"]'::jsonb
WHERE bank_id = 11 AND order_index = 21;

-- Câu 22
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Well-executed 3-D can create a sense of vertigo or elevation.',
    options = '["Roger Ebert", "Kenneth Turan", "Animation Ideas blogger", "Dr. Michael Rosenberg"]'::jsonb,
    correct_answer = '["Animation Ideas blogger"]'::jsonb
WHERE bank_id = 11 AND order_index = 22;

-- Câu 23
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = '3-D may worsen existing minor visual problems.',
    options = '["Dr. Michael Rosenberg", "Kenneth Turan", "Roger Ebert", "Kevin Carr"]'::jsonb,
    correct_answer = '["Dr. Michael Rosenberg"]'::jsonb
WHERE bank_id = 11 AND order_index = 23;

-- Câu 24
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Avatar is the prime example of 3-D commercial power.',
    options = '["Exhibitor Relations analyst", "Kenneth Turan", "Roger Ebert", "Dr. Deborah Friedman"]'::jsonb,
    correct_answer = '["Exhibitor Relations analyst"]'::jsonb
WHERE bank_id = 11 AND order_index = 24;

-- Câu 25
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'The main strength of Avatar is its visual effects, not dialogue.',
    options = '["Roger Ebert", "Kenneth Turan", "Kevin Carr", "Dr. Michael Rosenberg"]'::jsonb,
    correct_answer = '["Kenneth Turan"]'::jsonb
WHERE bank_id = 11 AND order_index = 25;

-- Câu 26
UPDATE question_bank_questions
SET 
    type = 'mcq',
    prompt = 'Our minds can perceive 3-D even in regular 2-D films.',
    options = '["Kenneth Turan", "Animation Ideas blogger", "Roger Ebert", "Dr. Deborah Friedman"]'::jsonb,
    correct_answer = '["Roger Ebert"]'::jsonb
WHERE bank_id = 11 AND order_index = 26;

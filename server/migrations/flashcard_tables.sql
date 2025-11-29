-- Create flashcard_lists table
CREATE TABLE IF NOT EXISTS flashcard_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    language VARCHAR(100) NOT NULL DEFAULT 'Tiếng Anh-Mỹ',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Create flashcard_cards table
CREATE TABLE IF NOT EXISTS flashcard_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    phonetic VARCHAR(255),
    example TEXT,
    note TEXT,
    image VARCHAR(500),
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES flashcard_lists(id) ON DELETE CASCADE,
    INDEX idx_list_id (list_id),
    INDEX idx_word (word),
    INDEX idx_created_at (created_at)
);

-- Create flashcard_progress table for tracking learning progress
CREATE TABLE IF NOT EXISTS flashcard_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    last_reviewed TIMESTAMP NULL,
    review_count INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    next_review TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES flashcard_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_card (user_id, card_id),
    INDEX idx_user_id (user_id),
    INDEX idx_next_review (next_review)
);

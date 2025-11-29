// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
console.log('🔍 Environment check:');
console.log('SMTP_USER from env:', process.env.SMTP_USER);
console.log('SMTP_PASS from env:', process.env.SMTP_PASS ? 'Set' : 'Not set');
console.log('GEMINI_API_KEY from env:', process.env.GEMINI_API_KEY ? 'Set' : '❌ NOT SET');
const path = require('path');
const db = require('./models/db');
require('./utils/emailService'); // Initialize email service

const authRoutes = require('./routes/authRoutes');
const learnerRoutes = require('./routes/learnerRoutes');
const topicRoutes = require('./routes/topicRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const questionBankRoutes = require('./routes/questionBankRoutes');
const adminRoutes = require('./routes/adminRoutes');
const toeicRoutes = require('./routes/toeicRoutes');
// Use full vocabulary CRUD/GET routes
const vocabRoutes = require('./routes/vocabRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const dictationRoutes = require('./routes/dictationRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');


const app = express();
const server = http.createServer(app);

// ⚙️ Middleware
app.use(cors());
app.use(express.json());
app.use('/avatars', express.static(path.resolve(__dirname, '../client/public/avatars')));
// app.use('/test1', express.static(path.resolve(__dirname, '../client/public/upload/photos/test1')));
app.use('/audio', express.static(path.join(__dirname, 'upload/audio')));

// 🔗 Routes
app.use('/api/auth', authRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/question-banks', questionBankRoutes); // Alias for plural form

// Alias to support both singular and plural endpoint used by client
app.use('/api/toeic', toeicRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.use('/api/dictation', dictationRoutes);
app.use('/api/flashcard', flashcardRoutes);

// Serve React build (SPA)
const clientBuildPath = path.join(__dirname, '../client/build');
app.use(express.static(clientBuildPath));

// For non-API routes, always send React index.html (Express 5 compatible)
// This regex matches any path that does NOT start with /api/
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// 🔌 Socket.IO config
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

// 👥 Đang theo dõi người dùng đang hoạt động
const activeUsers = {};

// ⚡ Sự kiện Socket.IO
io.on('connection', (socket) => {
  socket.on('join_class', ({ learnerId, classId }) => {
    socket.join(`class_${classId}`);
    activeUsers[socket.id] = { learnerId, classId };
  });

  socket.on('typing_result', ({ learnerId, vocabId, wpm, accuracy }) => {
    const classId = activeUsers[socket.id]?.classId;
    if (classId) {
      io.to(`class_${classId}`).emit('live_update', {
        learnerId,
        vocabId,
        wpm,
        accuracy,
        timestamp: new Date(),
      });
    }
  });

  socket.on('disconnect', () => {
    const disconnectedUser = activeUsers[socket.id];
    if (disconnectedUser) {
    }
    delete activeUsers[socket.id];
  });
});

// 🚀 Khởi chạy server
async function ensureSchema() {
  try {
    // Vocabulary columns
    await db.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS phonetic TEXT');
    await db.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS word_type VARCHAR(20)');
    await db.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS grammar TEXT');
    await db.query('ALTER TABLE vocabulary ADD COLUMN IF NOT EXISTS example TEXT');
    
    // Users OAuth columns
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(20)');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(100)');
    await db.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
    
    // Learner table - create if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS learner (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add exp column if table exists but column doesn't
    await db.query('ALTER TABLE learner ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0');
    
    // Password reset table
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Dictation exercises table
    await db.query(`
      CREATE TABLE IF NOT EXISTS dictation_exercises (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        transcript TEXT NOT NULL,
        audio_url TEXT,
        level VARCHAR(50),
        topic VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Flashcard tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS flashcard_lists (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        language VARCHAR(100) NOT NULL DEFAULT 'Tiếng Anh-Mỹ',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_lists_user_id ON flashcard_lists(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_lists_created_at ON flashcard_lists(created_at)`);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS flashcard_cards (
        id SERIAL PRIMARY KEY,
        list_id INT NOT NULL,
        word VARCHAR(255) NOT NULL,
        definition TEXT NOT NULL,
        phonetic VARCHAR(255),
        example TEXT,
        note TEXT,
        image VARCHAR(500),
        audio_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES flashcard_lists(id) ON DELETE CASCADE
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_cards_list_id ON flashcard_cards(list_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_cards_word ON flashcard_cards(word)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_cards_created_at ON flashcard_cards(created_at)`);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS flashcard_progress (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        card_id INT NOT NULL,
        difficulty_level VARCHAR(20) DEFAULT 'medium',
        last_reviewed TIMESTAMP NULL,
        review_count INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        next_review TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (card_id) REFERENCES flashcard_cards(id) ON DELETE CASCADE,
        UNIQUE (user_id, card_id)
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review ON flashcard_progress(next_review)`);
    
    // ✅ Migration: Add status column to exam_attempts
    await db.query(`ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed'`);
    await db.query(`UPDATE exam_attempts SET status = 'completed' WHERE status IS NULL`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_status ON exam_attempts(user_id, status)`);
    console.log('✅ Migration: exam_attempts.status column added');
    
    // ✅ Migration: Add pronunciation_count and writing_count to learning_progress
    await db.query(`ALTER TABLE learning_progress ADD COLUMN IF NOT EXISTS pronunciation_count INTEGER DEFAULT 0`);
    await db.query(`ALTER TABLE learning_progress ADD COLUMN IF NOT EXISTS writing_count INTEGER DEFAULT 0`);
    await db.query(`UPDATE learning_progress SET pronunciation_count = 0 WHERE pronunciation_count IS NULL`);
    await db.query(`UPDATE learning_progress SET writing_count = 0 WHERE writing_count IS NULL`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_learning_progress_pronunciation ON learning_progress(learner_id, pronunciation_count)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_learning_progress_writing ON learning_progress(learner_id, writing_count)`);
    console.log('✅ Migration: learning_progress speaking/writing tracking added');
    
    // Insert sample data if table is empty
    const countResult = await db.query('SELECT COUNT(*) FROM dictation_exercises');
    if (countResult.rows[0].count === '0') {
      await db.query(`
        INSERT INTO dictation_exercises (title, transcript, audio_url, level, topic) VALUES
        -- Short Stories
        ('First snowfall', 'It was my first time seeing snow fall from the sky.', '', 'A1', 'Short Stories'),
        ('Jessica first day of school', 'Jessica was excited but nervous about her first day.', '', 'A1', 'Short Stories'),
        ('My flower garden', 'I planted roses and tulips in my backyard garden.', '', 'A1', 'Short Stories'),
        
        -- TOEIC Listening
        ('Office Meeting Schedule', 'The meeting will start at nine thirty sharp in conference room B.', '', 'A2', 'TOEIC Listening'),
        ('Business Call', 'Could you please send me the quarterly report by Friday?', '', 'B1', 'TOEIC Listening'),
        ('Restaurant Reservation', 'I would like to book a table for four people tonight at seven.', '', 'A2', 'TOEIC Listening'),
        
        -- Conversations
        ('At the Coffee Shop', 'Can I get a large cappuccino with an extra shot of espresso?', '', 'A1', 'Conversations'),
        ('Job Interview', 'Tell me about your experience working in customer service.', '', 'B1', 'Conversations'),
        
        -- News
        ('Tech Innovation', 'Scientists have developed a new type of renewable energy source.', '', 'B2', 'News'),
        ('Weather Report', 'Expect heavy rain and strong winds throughout the weekend.', '', 'B1', 'News')
      `);
      console.log('✅ Sample dictation exercises inserted');
    }
    
    console.log('Schema check OK: vocabulary, users, password_resets, dictation_exercises updated');
  } catch (e) {
    console.error('Schema check failed:', e.message);
  }
}

server.listen(process.env.PORT || 5050, async () => {
  await ensureSchema();
  console.log('Server running on port', process.env.PORT || 5050);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./server/routes/authRoutes');
const questionBankRoutes = require('./server/routes/questionBankRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/question-banks', questionBankRoutes);
app.use('/api', questionBankRoutes); // Legacy support for /api/question-bank/search/ai

// Route gốc kiểm tra backend hoạt động
app.get('/', (req, res) => {
  res.send('🎉 VocaType Backend hoạt động!');
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`🚀 Backend chạy tại http://localhost:${port}`));

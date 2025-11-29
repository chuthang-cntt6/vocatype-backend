import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon
} from '@mui/icons-material';

export default function CreateTestModal({ open, onClose, onSubmit }) {
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    difficulty_level: 'medium',
    time_limit: 60,
    passages: [
      {
        part_id: 1,
        passage_text: '',
        questions: [
          {
            question_number: 1,
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: '',
            explanation: '',
            keywords: '',
            answer_location: ''
          }
        ]
      }
    ]
  });

  const [error, setError] = useState('');

  const handleAddPassage = () => {
    setTestData({
      ...testData,
      passages: [
        ...testData.passages,
        {
          part_id: testData.passages.length + 1,
          passage_text: '',
          questions: [
            {
              question_number: 1,
              question_text: '',
              options: ['', '', '', ''],
              correct_answer: '',
              explanation: '',
              keywords: '',
              answer_location: ''
            }
          ]
        }
      ]
    });
  };

  const handleRemovePassage = (passageIndex) => {
    if (testData.passages.length === 1) {
      alert('Phải có ít nhất 1 passage');
      return;
    }
    const newPassages = testData.passages.filter((_, i) => i !== passageIndex);
    // Re-number passages
    newPassages.forEach((p, i) => {
      p.part_id = i + 1;
    });
    setTestData({ ...testData, passages: newPassages });
  };

  const handlePassageTextChange = (passageIndex, value) => {
    const newPassages = [...testData.passages];
    newPassages[passageIndex].passage_text = value;
    setTestData({ ...testData, passages: newPassages });
  };

  const handleAddQuestion = (passageIndex) => {
    const newPassages = [...testData.passages];
    const currentQuestions = newPassages[passageIndex].questions;
    newPassages[passageIndex].questions = [
      ...currentQuestions,
      {
        question_number: currentQuestions.length + 1,
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        keywords: '',
        answer_location: ''
      }
    ];
    setTestData({ ...testData, passages: newPassages });
  };

  const handleRemoveQuestion = (passageIndex, questionIndex) => {
    const newPassages = [...testData.passages];
    if (newPassages[passageIndex].questions.length === 1) {
      alert('Phải có ít nhất 1 câu hỏi');
      return;
    }
    newPassages[passageIndex].questions = newPassages[passageIndex].questions.filter(
      (_, i) => i !== questionIndex
    );
    // Re-number questions
    newPassages[passageIndex].questions.forEach((q, i) => {
      q.question_number = i + 1;
    });
    setTestData({ ...testData, passages: newPassages });
  };

  const handleQuestionChange = (passageIndex, questionIndex, field, value) => {
    const newPassages = [...testData.passages];
    newPassages[passageIndex].questions[questionIndex][field] = value;
    setTestData({ ...testData, passages: newPassages });
  };

  const handleOptionChange = (passageIndex, questionIndex, optionIndex, value) => {
    const newPassages = [...testData.passages];
    newPassages[passageIndex].questions[questionIndex].options[optionIndex] = value;
    setTestData({ ...testData, passages: newPassages });
  };

  const handleCorrectAnswerChange = (passageIndex, questionIndex, value) => {
    const newPassages = [...testData.passages];
    newPassages[passageIndex].questions[questionIndex].correct_answer = value;
    setTestData({ ...testData, passages: newPassages });
  };

  const validateAndSubmit = () => {
    // Validation
    if (!testData.title.trim()) {
      setError('Vui lòng nhập tên bộ đề');
      return;
    }

    for (let i = 0; i < testData.passages.length; i++) {
      const passage = testData.passages[i];
      if (!passage.passage_text.trim()) {
        setError(`Passage ${i + 1}: Vui lòng nhập đoạn văn`);
        return;
      }

      for (let j = 0; j < passage.questions.length; j++) {
        const q = passage.questions[j];
        if (!q.question_text.trim()) {
          setError(`Passage ${i + 1}, Câu ${j + 1}: Vui lòng nhập câu hỏi`);
          return;
        }

        const filledOptions = q.options.filter(opt => opt.trim());
        if (filledOptions.length < 2) {
          setError(`Passage ${i + 1}, Câu ${j + 1}: Phải có ít nhất 2 đáp án`);
          return;
        }

        if (!q.correct_answer) {
          setError(`Passage ${i + 1}, Câu ${j + 1}: Vui lòng chọn đáp án đúng`);
          return;
        }
      }
    }

    setError('');
    onSubmit(testData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Tạo bộ đề thi mới
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Tên bộ đề *"
            placeholder="VD: IELTS Reading Test 1"
            value={testData.title}
            onChange={(e) => setTestData({ ...testData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mô tả"
            placeholder="Mô tả ngắn gọn về bộ đề thi..."
            multiline
            rows={2}
            value={testData.description}
            onChange={(e) => setTestData({ ...testData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Thời gian (phút)"
              type="number"
              value={testData.time_limit}
              onChange={(e) => setTestData({ ...testData, time_limit: parseInt(e.target.value) })}
              sx={{ width: 200 }}
            />
            <TextField
              select
              label="Độ khó"
              value={testData.difficulty_level}
              onChange={(e) => setTestData({ ...testData, difficulty_level: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ width: 200 }}
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </TextField>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Passages */}
        {testData.passages.map((passage, pIndex) => (
          <Box
            key={pIndex}
            sx={{
              mb: 4,
              p: 3,
              border: '2px solid #e5e7eb',
              borderRadius: 3,
              background: '#f9fafb'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip
                label={`Passage ${pIndex + 1}`}
                color="primary"
                sx={{ fontWeight: 700, fontSize: 14 }}
              />
              {testData.passages.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemovePassage(pIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label={`Đoạn văn ${pIndex + 1} *`}
              placeholder="Nhập đoạn văn tiếng Anh..."
              multiline
              rows={6}
              value={passage.passage_text}
              onChange={(e) => handlePassageTextChange(pIndex, e.target.value)}
              sx={{ mb: 3, background: '#fff' }}
            />

            {/* Questions */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Câu hỏi:
            </Typography>

            {passage.questions.map((question, qIndex) => (
              <Box
                key={qIndex}
                sx={{
                  mb: 3,
                  p: 2,
                  border: '1px solid #d1d5db',
                  borderRadius: 2,
                  background: '#fff'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Câu {question.question_number}
                  </Typography>
                  {passage.questions.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveQuestion(pIndex, qIndex)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Câu hỏi *"
                  placeholder="Nhập câu hỏi..."
                  value={question.question_text}
                  onChange={(e) => handleQuestionChange(pIndex, qIndex, 'question_text', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Đáp án:
                </Typography>

                <RadioGroup
                  value={question.correct_answer}
                  onChange={(e) => handleCorrectAnswerChange(pIndex, qIndex, e.target.value)}
                >
                  {['A', 'B', 'C', 'D'].map((letter, optIndex) => (
                    <Box key={letter} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <FormControlLabel
                        value={letter}
                        control={<Radio />}
                        label={letter}
                        sx={{ minWidth: 60 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Đáp án ${letter}`}
                        value={question.options[optIndex]}
                        onChange={(e) => handleOptionChange(pIndex, qIndex, optIndex, e.target.value)}
                      />
                    </Box>
                  ))}
                </RadioGroup>

                {/* Phần giải thích chi tiết */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1e40af' }}>
                  📚 Giải thích chi tiết (tùy chọn)
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Trích đoạn chứa đáp án (từ passage)"
                  placeholder="Ví dụ: However, users must first download the updated printer driver..."
                  value={question.answer_location || ''}
                  onChange={(e) => handleQuestionChange(pIndex, qIndex, 'answer_location', e.target.value)}
                  sx={{ mb: 1.5 }}
                  helperText="Copy đoạn văn bản từ passage chứa đáp án"
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Từ khóa quan trọng (cách nhau bởi dấu phẩy)"
                  placeholder="Ví dụ: printer driver, download, intranet"
                  value={question.keywords || ''}
                  onChange={(e) => handleQuestionChange(pIndex, qIndex, 'keywords', e.target.value)}
                  sx={{ mb: 1.5 }}
                  helperText="Các từ khóa giúp tìm đáp án"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Giải thích chi tiết"
                  placeholder="Giải thích tại sao đáp án này đúng..."
                  value={question.explanation || ''}
                  onChange={(e) => handleQuestionChange(pIndex, qIndex, 'explanation', e.target.value)}
                  helperText="Giải thích logic để chọn đáp án đúng"
                />
              </Box>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleAddQuestion(pIndex)}
              sx={{ mt: 1 }}
            >
              Thêm câu hỏi
            </Button>
          </Box>
        ))}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPassage}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 700
          }}
        >
          Thêm Passage mới
        </Button>
      </DialogContent>

      <DialogActions sx={{ p: 3, background: '#f9fafb' }}>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={validateAndSubmit}
          sx={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            fontWeight: 700,
            px: 4
          }}
        >
          Tạo bộ đề
        </Button>
      </DialogActions>
    </Dialog>
  );
}

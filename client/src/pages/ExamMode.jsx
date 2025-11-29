import React, { useEffect, useState } from 'react';
import './ExamMode.css';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function ExamMode() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(60); // giây
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(setTopics)
      .catch(err => {
        console.error('Error fetching topics:', err);
        setTopics([]);
      });
  }, []);

  useEffect(() => {
    let timer;
    if (startTime && !done) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [startTime, done]);

  const startExam = async () => {
    setLoading(true);
    setDone(false);
    setScore(0);
    setCurrent(0);
    setResult([]);
    setInput('');
    // Lấy random từ/câu
    try {
      const res = await fetch(`/api/topics/${selectedTopic}/vocab`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      let data = await res.json();
      data = shuffleArray(data).slice(0, numQuestions);
      setQuestions(data);
      setStartTime(Date.now());
      setTimeLeft(duration);
    } catch (error) {
      console.error('Error fetching vocab:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questions[current] || !input.trim()) return;
    const correct = input.trim().toLowerCase() === questions[current].word.toLowerCase();
    setIsCorrect(correct);
    setShowCorrectAnswer(true);
    
    // Delay before moving to next question
    setTimeout(() => {
      setResult(r => [...r, { ...questions[current], userAnswer: input, isCorrect: correct }]);
      if (correct) setScore(s => s + 1);
      setInput('');
      setShowCorrectAnswer(false);
      setIsCorrect(null);
      
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        // Focus lại input sau khi chuyển câu
        setTimeout(() => {
          const inputElement = document.querySelector('.answer-input');
          if (inputElement) inputElement.focus();
        }, 100);
      } else {
        finishExam();
      }
    }, 1500);
  };

  const finishExam = () => {
    setDone(true);
    setTimeLeft(0);
  };

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  if (!selectedTopic) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Thi thử', path: '/exam' }
            ]}
          />
        </div>
        <div className="exam-container">
          <div className="exam-card topic-selection">
          <div className="exam-header">
            <h2 className="exam-title">🎯 Chọn chủ đề để thi thử</h2>
            <p className="exam-subtitle">Hãy chọn chủ đề từ vựng bạn muốn kiểm tra</p>
          </div>
          
          <div className="topic-grid">
            {topics.map(topic => (
              <div 
                key={topic.id} 
                className="topic-card"
                onClick={() => setSelectedTopic(topic.id)}
              >
                <div className="topic-icon">📚</div>
                <h3 className="topic-title">{topic.title}</h3>
                <p className="topic-description">Bắt đầu thi ngay</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!questions.length && !loading && !done) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Chọn đề thi', path: '/exam' }
            ]}
          />
        </div>
        <div className="exam-container">
          <div className="exam-card exam-settings">
          <div className="exam-header">
            <h2 className="exam-title">⚙️ Cài đặt đề thi</h2>
            <p className="exam-subtitle">Tùy chỉnh bài thi theo ý muốn của bạn</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-icon">📝</span>
                Số câu hỏi
              </label>
              <div className="setting-control">
                <input 
                  type="number" 
                  min={1} 
                  max={50} 
                  value={numQuestions} 
                  onChange={e => setNumQuestions(Number(e.target.value))}
                  className="setting-input"
                />
                <span className="setting-unit">câu</span>
              </div>
            </div>
            
            <div className="setting-item">
              <label className="setting-label">
                <span className="setting-icon">⏱️</span>
                Thời gian
              </label>
              <div className="setting-control">
                <input 
                  type="number" 
                  min={10} 
                  max={600} 
                  value={duration} 
                  onChange={e => setDuration(Number(e.target.value))}
                  className="setting-input"
                />
                <span className="setting-unit">giây</span>
              </div>
            </div>
          </div>
          
          <div className="exam-actions">
            <button 
              onClick={() => setSelectedTopic('')} 
              className="btn btn-secondary"
            >
              ← Quay lại
            </button>
            <button 
              onClick={startExam} 
              className="btn btn-primary btn-start"
            >
              🚀 Bắt đầu thi
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Thi thử', path: '/exam' }
            ]}
          />
        </div>
        <div className="exam-container">
          <div className="exam-card loading-card">
            <div className="loading-spinner"></div>
            <h3 className="loading-text">Đang tải đề thi...</h3>
            <p className="loading-subtext">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const percentage = Math.round((score/questions.length)*100);
    const getScoreMessage = () => {
      if (percentage >= 90) return { message: "Xuất sắc! 🎉", color: "#10b981" };
      if (percentage >= 70) return { message: "Tốt! 👍", color: "#3b82f6" };
      if (percentage >= 50) return { message: "Khá! 💪", color: "#f59e0b" };
      return { message: "Cần cố gắng thêm! 💪", color: "#ef4444" };
    };
    
    const scoreInfo = getScoreMessage();
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
        padding: '40px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Thi thử', path: '/exam' }
            ]}
          />
        </div>
        <div className="exam-container">
          <div className="exam-card result-card">
          <div className="result-header">
            <div className="result-icon">🏆</div>
            <h2 className="result-title">Kết quả thi thử</h2>
            <p className="result-subtitle">Bạn đã hoàn thành bài thi!</p>
          </div>
          
          <div className="result-stats">
            <div className="stat-item">
              <div className="stat-value" style={{ color: scoreInfo.color }}>
                {score}/{questions.length}
              </div>
              <div className="stat-label">Điểm số</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: scoreInfo.color }}>
                {percentage}%
              </div>
              <div className="stat-label">Tỉ lệ đúng</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: scoreInfo.color }}>
                {scoreInfo.message}
              </div>
              <div className="stat-label">Đánh giá</div>
            </div>
          </div>
          
          <div className="result-details">
            <h3 className="details-title">Chi tiết từng câu</h3>
            <div className="details-list">
              {result.map((q, i) => (
                <div key={i} className={`detail-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="detail-question">
                    <span className="detail-word">{q.word}</span>
                    <span className="detail-meaning">{q.meaning}</span>
                  </div>
                  <div className="detail-answer">
                    <span className="detail-label">Bạn trả lời:</span>
                    <span className="detail-user-answer">{q.userAnswer || '(Bỏ trống)'}</span>
                  </div>
                  <div className="detail-status">
                    {q.isCorrect ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="result-actions">
            <button 
              onClick={() => {setDone(false); setQuestions([]); setSelectedTopic('');}} 
              className="btn btn-secondary"
            >
              ← Chọn chủ đề khác
            </button>
            <button 
              onClick={() => {setDone(false); setQuestions([]); setCurrent(0); setScore(0); setResult([]);}} 
              className="btn btn-primary"
            >
              🔄 Thi lại
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Đang thi
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Thi thử', path: '/exam' }
          ]}
        />
      </div>
      <div className="exam-container">
        <div className="exam-card exam-active">
        {/* Header với thông tin tiến trình */}
        <div className="exam-header">
          <div className="progress-info">
            <div className="question-counter">
              Câu {current + 1} / {questions.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((current + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="timer-container">
            <div className={`timer ${timeLeft < 10 ? 'timer-warning' : ''}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Câu hỏi */}
        <div className="question-container">
          <div className="question-text">
            {questions[current]?.meaning}
          </div>
          
          {showCorrectAnswer && (
            <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {isCorrect ? '✅' : '❌'}
              </div>
              <div className="feedback-text">
                {isCorrect ? 'Chính xác!' : `Sai rồi! Đáp án đúng là: ${questions[current]?.word}`}
              </div>
            </div>
          )}
        </div>

        {/* Form nhập câu trả lời */}
        <form onSubmit={handleSubmit} className="answer-form">
          <div className="input-group">
            <input 
              value={input} 
              onChange={handleInput} 
              placeholder="Nhập từ tiếng Anh..." 
              autoFocus 
              className="answer-input"
              disabled={showCorrectAnswer}
              autoComplete="off"
              spellCheck="false"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim() && !showCorrectAnswer) {
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-answer"
              disabled={showCorrectAnswer || !input.trim()}
            >
              {showCorrectAnswer ? '⏳' : 'Trả lời'}
            </button>
          </div>
        </form>

        {/* Thông tin điểm số */}
        <div className="score-info">
          <div className="score-item">
            <span className="score-label">Điểm hiện tại:</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Tỉ lệ đúng:</span>
            <span className="score-value">{Math.round((score / (current + 1)) * 100)}%</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
} 
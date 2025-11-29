import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaClock, FaStar, FaTrophy, FaFire, FaBullseye, FaChartLine, FaKeyboard, FaRocket, FaMedal, FaGem } from 'react-icons/fa';

// Đoạn văn mẫu (có thể random hoặc lấy từ API)
const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog.',
  'Typing practice helps you improve your speed and accuracy.',
  'Practice makes perfect. Keep typing every day!',
  'Learning English vocabulary is fun and rewarding.',
  'Consistency is the key to mastering any skill.'
];

function getRandomText() {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

function getRandomWords(n = 50, allWords = []) {
  // Lấy từ không lặp lại cho đến khi hết, sau đó trộn lại từ allWords
  let pool = [...allWords];
  let arr = [];
  while (arr.length < n) {
    if (pool.length === 0) pool = [...allWords];
    const idx = Math.floor(Math.random() * pool.length);
    arr.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return arr;
}

const TIME_OPTIONS = [30, 60, 120];

// Thêm CSS cho hiệu ứng đếm ngược hiện đại
const countdownStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  background: 'rgba(30,41,59,0.10)',
  pointerEvents: 'none',
};

// Số từ mỗi dòng
const WORDS_PER_ROW = 6; // Giảm từ 10 xuống 6
const WORDS_PER_PAGE = WORDS_PER_ROW * 2;

export default function TypingPractice() {
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState('sentence'); // 'sentence' | 'words' | 'custom'
  const [customText, setCustomText] = useState('');
  const [targetText, setTargetText] = useState(getRandomText());
  const [targetWords, setTargetWords] = useState([]); // for words mode
  const [input, setInput] = useState('');
  const [wordInputs, setWordInputs] = useState([]); // for words mode
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [history, setHistory] = useState([]);
  const [best, setBest] = useState({ wpm: 0, accuracy: 0 });
  const [timer, setTimer] = useState(60); // seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const inputRef = useRef();
  // Số từ mỗi page (2 dòng)
  const [pageIdx, setPageIdx] = useState(0); // page hiện tại
  const [started, setStarted] = useState(false);
  const [allWords, setAllWords] = useState([]); // Toàn bộ từ đơn lấy từ backend
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [slideUp, setSlideUp] = useState(false);

  // Lấy lịch sử luyện gõ và kỷ lục tốt nhất
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/learner/${user.id}/history`)
        .then(r => r.json())
        .then(data => {
          setHistory(data || []);
          let bestWpm = 0, bestAcc = 0;
          data.forEach(item => {
            if (item.wpm > bestWpm) bestWpm = item.wpm;
            if (item.accuracy > bestAcc) bestAcc = item.accuracy;
          });
          setBest({ wpm: bestWpm, accuracy: bestAcc });
        });
    }
  }, [user]);

  // Lấy toàn bộ từ đơn từ các chủ đề ngẫu nhiên (TOPICS_PER_PAGE)
  useEffect(() => {
    async function fetchWords() {
      try {
        // Lấy danh sách chủ đề
        const topicsRes = await fetch('/api/topics');
        const topics = await topicsRes.json();
        // Chọn ngẫu nhiên TOPICS_PER_PAGE chủ đề
        const shuffled = topics.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 1); // 5 = TOPICS_PER_PAGE
        // Lấy từ vựng của các chủ đề này
        let words = [];
        for (const topic of selected) {
          const vocabRes = await fetch(`/api/topics/${topic.id}/vocab`);
          const vocab = await vocabRes.json();
          // Chỉ lấy từ đơn (không chứa dấu cách)
          words = words.concat(vocab.filter(v => v.word && !v.word.includes(' ')).map(v => v.word));
        }
        // Trộn lộn xộn
        for (let i = words.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [words[i], words[j]] = [words[j], words[i]];
        }
        setAllWords(words);
      } catch (e) {
        setAllWords([]);
      }
    }
    fetchWords();
  }, []);

  // Đếm ngược 3-2-1
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && inputRef.current) {
      inputRef.current.focus();
      if (mode === 'words') setTimerRunning(true);
    }
  }, [countdown, mode]);

  // Đếm ngược thời gian luyện gõ
  useEffect(() => {
    if (timerRunning && timeLeft > 0 && !finished) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timerRunning && timeLeft === 0 && !finished) {
      finishPractice();
    }
  }, [timerRunning, timeLeft, finished]);

  // Xử lý khi input thay đổi (sentence/custom mode)
  useEffect(() => {
    if ((mode === 'sentence' || mode === 'custom') && input.length === 1 && !startTime && countdown === 0) {
      setStartTime(Date.now());
    }
    if ((mode === 'sentence' || mode === 'custom') && input === targetText && !finished && countdown === 0) {
      finishPractice();
    }
    if ((mode === 'sentence' || mode === 'custom') && input.length > 0 && startTime && countdown === 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // phút
      const words = input.trim().split(/\s+/).length;
      setWpm(Math.round(words / (elapsed || 1/60)));
      let correct = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === targetText[i]) correct++;
      }
      setAccuracy(Math.round((correct / targetText.length) * 100));
    }
  }, [input, startTime, targetText, finished, countdown, mode]);

  // Xử lý khi wordInputs thay đổi (words mode)
  useEffect(() => {
    if (mode === 'words' && startTime && countdown === 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // phút
      const correctWords = wordInputs.filter((w, i) => w && w.trim() === targetWords[i]).length;
      setWpm(Math.round((wordInputs.filter(Boolean).length) / (elapsed || 1/60)));
      setAccuracy(Math.round((correctWords / targetWords.length) * 100));
    }
  }, [wordInputs, startTime, countdown, mode, targetWords]);

  // Gửi kết quả lên backend khi hoàn thành
  useEffect(() => {
    if (finished && user?.id) {
      fetch(`/api/learner/${user.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        body: JSON.stringify({
          vocabId: null,
          wpm,
          accuracy,
          errors: countErrorsWords(),
          wordsTyped: mode === 'words' ? wordInputs.filter(Boolean).length : input.trim().split(/\s+/).length
        })
      });
    }
  }, [finished, user, wpm, accuracy, input, wordInputs, mode]);

  function countErrorsWords() {
    if (mode !== 'words') return 0;
    let errors = 0;
    for (let i = 0; i < wordInputs.length; i++) {
      if (wordInputs[i] && wordInputs[i].trim() !== targetWords[i]) errors++;
    }
    return errors;
  }

  function finishPractice() {
    setEndTime(Date.now());
    setFinished(true);
    setShowResult(true);
    setTimerRunning(false);
  }

  function handleInput(e) {
    if (finished || countdown > 0) return;
    setInput(e.target.value);
  }

  // Xử lý input cho chế độ words (tính điểm, đúng/sai)
  function handleWordInput(e) {
    if (finished || countdown > 0) return;
    const val = e.target.value;
    if ((val.endsWith(' ') || val.endsWith('\n')) && val.trim().length > 0) {
      const newInputs = [...wordInputs];
      newInputs[currentWordIdx] = val.trim();
      setWordInputs(newInputs);
      if (!startTime) setStartTime(Date.now());
      // Tính điểm và đúng/sai
      if (val.trim() === targetWords[currentWordIdx]) {
        setScore(s => s + 100);
        setCorrectCount(c => c + 1);
      } else {
        setWrongCount(w => w + 1);
      }
      if (currentWordIdx < targetWords.length - 1) {
        setCurrentWordIdx(currentWordIdx + 1);
      } else {
        // Nếu còn thời gian, lấy thêm từ mới và tiếp tục
        if (timeLeft > 0) {
          const words = getRandomWords(Math.min(20, allWords.length), allWords);
          setTargetWords(words);
          setTargetText(words.join(' '));
          setCurrentWordIdx(0);
          setWordInputs([]);
          setPageIdx(0); // Reset phân trang từ về đầu mỗi lượt mới
          setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
          // Nếu không còn từ nào, chỉ hiện thông báo nếu allWords.length === 0
        } else {
          finishPractice();
        }
      }
      e.target.value = '';
    } else if (e.nativeEvent.inputType === 'deleteContentBackward') {
      if (e.target.value.length === 0 && currentWordIdx > 0) {
        e.preventDefault();
      }
    }
  }

  // Reset các chỉ số khi bắt đầu
  function handleStart() {
    setStarted(true);
    setCountdown(5);
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setShowResult(false);
    setTimeLeft(timer);
    setTimerRunning(false);
    setCurrentWordIdx(0);
    setWordInputs([]);
    setPageIdx(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    if (mode === 'sentence') setTargetText(getRandomText());
    else if (mode === 'words') {
      const words = getNextWords(0, allWords);
      setTargetWords(words);
      setTargetText(words.join(' '));
    }
    else setTargetText(customText.trim() || 'Type your custom text here!');
  }

  // Khi hoàn thành, hiện lại nút Bắt đầu
  useEffect(() => {
    if (finished) setStarted(false);
  }, [finished]);

  // Khi đổi mode hoặc thời gian, reset started
  useEffect(() => {
    setStarted(false);
  }, [mode, timer]);

  function handleModeChange(e) {
    setMode(e.target.value);
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setShowResult(false);
    setCountdown(3);
    setTimeLeft(timer);
    setTimerRunning(false);
    setCurrentWordIdx(0);
    setWordInputs([]);
    if (e.target.value === 'sentence') setTargetText(getRandomText());
    else if (e.target.value === 'words') {
      const words = getNextWords(0, allWords);
      setTargetWords(words);
      setTargetText(words.join(' '));
    }
    else setTargetText(customText.trim() || 'Type your custom text here!');
  }

  function handleCustomText(e) {
    setCustomText(e.target.value);
    setTargetText(e.target.value);
  }

  function handleTimeChange(e) {
    setTimer(Number(e.target.value));
    setTimeLeft(Number(e.target.value));
  }

  // Highlight lỗi cho sentence/custom
  function renderColoredText() {
    const chars = targetText.split('');
    return chars.map((ch, i) => {
      let color = '#334155';
      if (input[i] === undefined) color = '#cbd5e1';
      else if (input[i] === ch) color = '#22c55e';
      else color = '#ef4444';
      return <span key={i} style={{ color, fontWeight: 700 }}>{ch}</span>;
    });
  }

  // Khi restart hoặc đổi mode, reset pageIdx
  useEffect(() => {
    setPageIdx(0);
  }, [mode, countdown]);

  // Khi sang lượt từ mới, luôn lấy 20 từ mới (nếu còn), nếu không thì random lại từ allWords
  function getNextWords(currentIdx, allWords) {
    // Lấy 20 từ tiếp theo từ allWords, nếu không đủ thì random lại
    let next = allWords.slice(currentIdx, currentIdx + WORDS_PER_PAGE);
    if (next.length < WORDS_PER_PAGE) {
      // Nếu hết, random lại từ allWords
      const pool = [...allWords];
      while (next.length < WORDS_PER_PAGE && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        next.push(pool[idx]);
        pool.splice(idx, 1);
      }
    }
    return next;
  }

  // Khi bắt đầu hoặc sang trang mới, setTargetWords(getNextWords(currentWordIdx, allWords))
  function handleStart() {
    setStarted(true);
    setCountdown(5);
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setFinished(false);
    setShowResult(false);
    setTimeLeft(timer);
    setTimerRunning(false);
    setCurrentWordIdx(0);
    setWordInputs([]);
    setPageIdx(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    if (mode === 'sentence') setTargetText(getRandomText());
    else if (mode === 'words') {
      const words = getNextWords(0, allWords);
      setTargetWords(words);
      setTargetText(words.join(' '));
    }
    else setTargetText(customText.trim() || 'Type your custom text here!');
  }

  // Khi gõ xong 10 từ trên, chuyển 10 từ dưới lên trên, thêm 10 từ mới vào dưới, wordInputs cũng phải dịch chuyển tương ứng, trigger animation
  useEffect(() => {
    if (
      mode === 'words' &&
      currentWordIdx > 0 &&
      currentWordIdx % WORDS_PER_ROW === 0 &&
      !finished &&
      countdown === 0
    ) {
      setSlideUp(true); // Bắt đầu hiệu ứng
      setTimeout(() => {
        const nextIdx = currentWordIdx;
        const nextWords = getNextWords(nextIdx, allWords);
        setTargetWords(nextWords);
        setTargetText(nextWords.join(' '));
        setPageIdx(0); // reset hiệu ứng
        setWordInputs(prev => {
          const bottom = prev.slice(WORDS_PER_ROW, 2 * WORDS_PER_ROW);
          return [...bottom, ...Array(WORDS_PER_ROW).fill(undefined)];
        });
        setSlideUp(false); // Kết thúc hiệu ứng
        setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      }, 350); // Thời gian hiệu ứng
    }
  }, [currentWordIdx, mode, finished, countdown, allWords]);

  // Render 2 dòng từ (10 trên, 10 dưới), hiệu ứng chuyển mượt
  function renderWords() {
    const topRow = targetWords.slice(0, WORDS_PER_ROW);
    const bottomRow = targetWords.slice(WORDS_PER_ROW, 2 * WORDS_PER_ROW);
    return (
      <div style={{
        background: '#f8fafc', borderRadius: 14, boxShadow: '0 2px 8px #2563eb11', marginBottom: 10,
        maxWidth: 900, marginLeft: 'auto', marginRight: 'auto', fontSize: 22,
        transition: 'all 0.5s cubic-bezier(.4,2,.6,1)',
        overflow: 'hidden',
        position: 'relative',
        height: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0'
      }}>
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.35s cubic-bezier(.4,2,.6,1), opacity 0.35s',
          transform: slideUp ? 'translateY(-40px)' : 'translateY(0)',
          opacity: slideUp ? 0.5 : 1,
          zIndex: 2
        }}>
          <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', width: '100%' }}>
            {topRow.map((word, idx) => {
              const globalIdx = idx;
              let color = '#334155';
              let bg = 'transparent';
              let border = 'none';
              let shadow = 'none';
              let scale = 1;
              if (wordInputs[globalIdx] !== undefined) {
                if (wordInputs[globalIdx] === word) {
                  color = '#22c55e';
                  bg = '#f0fdf4';
                  border = '2px solid #22c55e';
                  shadow = '0 2px 8px #22c55e33';
                  scale = 1.08;
                } else {
                  color = '#ef4444';
                  bg = '#fef2f2';
                  border = '2px solid #ef4444';
                  shadow = '0 2px 8px #ef444433';
                  scale = 1.08;
                }
              }
              if (globalIdx === currentWordIdx % WORDS_PER_PAGE && !finished) {
                bg = '#e0e7ff';
                border = '2.5px solid #6366f1';
                shadow = '0 2px 12px #6366f122';
                scale = 1.12;
              }
              return (
                <span key={globalIdx} style={{
                  color,
                  background: bg,
                  border,
                  borderRadius: 10,
                  padding: '7px 8px',
                  fontWeight: 700,
                  fontSize:
                    word.length > 18 ? 12 :
                    word.length > 14 ? 13 :
                    word.length > 10 ? 15 :
                    word.length > 7 ? 17 : 20,
                  margin: '0 2px',
                  boxShadow: shadow,
                  transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                  transform: `scale(${scale})`,
                  minWidth: 48,
                  maxWidth: word.length > 14 ? 120 : 90,
                  width: 'auto',
                  textAlign: 'center',
                  userSelect: 'none',
                  outline: globalIdx === currentWordIdx % WORDS_PER_PAGE && !finished ? '2px solid #6366f1' : 'none',
                  zIndex: globalIdx === currentWordIdx % WORDS_PER_PAGE ? 2 : 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>{word.length > 18 ? word.slice(0, 15) + '…' : word}</span>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', width: '100%' }}>
            {bottomRow.map((word, idx) => {
              const globalIdx = WORDS_PER_ROW + idx;
              let color = '#334155';
              let bg = 'transparent';
              let border = 'none';
              let shadow = 'none';
              let scale = 1;
              if (wordInputs[globalIdx] !== undefined) {
                if (wordInputs[globalIdx] === word) {
                  color = '#22c55e';
                  bg = '#f0fdf4';
                  border = '2px solid #22c55e';
                  shadow = '0 2px 8px #22c55e33';
                  scale = 1.08;
                } else {
                  color = '#ef4444';
                  bg = '#fef2f2';
                  border = '2px solid #ef4444';
                  shadow = '0 2px 8px #ef444433';
                  scale = 1.08;
                }
              }
              if (globalIdx === currentWordIdx % WORDS_PER_PAGE && !finished) {
                bg = '#e0e7ff';
                border = '2.5px solid #6366f1';
                shadow = '0 2px 12px #6366f122';
                scale = 1.12;
              }
              return (
                <span key={globalIdx} style={{
                  color,
                  background: bg,
                  border,
                  borderRadius: 10,
                  padding: '7px 8px',
                  fontWeight: 700,
                  fontSize:
                    word.length > 18 ? 12 :
                    word.length > 14 ? 13 :
                    word.length > 10 ? 15 :
                    word.length > 7 ? 17 : 20,
                  margin: '0 2px',
                  boxShadow: shadow,
                  transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                  transform: `scale(${scale})`,
                  minWidth: 48,
                  maxWidth: word.length > 14 ? 120 : 90,
                  width: 'auto',
                  textAlign: 'center',
                  userSelect: 'none',
                  outline: globalIdx === currentWordIdx % WORDS_PER_PAGE && !finished ? '2px solid #6366f1' : 'none',
                  zIndex: globalIdx === currentWordIdx % WORDS_PER_PAGE ? 2 : 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}>{word.length > 18 ? word.slice(0, 15) + '…' : word}</span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Khi gõ xong từ cuối page, chuyển sang page tiếp theo
  useEffect(() => {
    if (
      mode === 'words' &&
      currentWordIdx > 0 &&
      currentWordIdx % WORDS_PER_PAGE === 0 &&
      currentWordIdx < targetWords.length &&
      !finished &&
      pageIdx < Math.ceil(targetWords.length / WORDS_PER_PAGE) - 1 // Không vượt quá số trang
    ) {
      setTimeout(() => setPageIdx(prev => prev + 1), 100);
    }
  }, [currentWordIdx, mode, finished, pageIdx, targetWords.length]);

  return (
    <div className="typing-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #1e293b, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                letterSpacing: '-1px'
              }}>
                Luyện gõ tốc độ
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#64748b',
                margin: 0
              }}>
                Nâng cao kỹ năng gõ phím với các bài tập đa dạng
              </p>
            </div>
            
            {/* Live Stats */}
            {started && (
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaBullseye style={{ color: '#6366f1', fontSize: '16px' }} />
                  <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '14px' }}>
                    {wpm} WPM
                  </span>
                </div>
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaChartLine style={{ color: '#22c55e', fontSize: '16px' }} />
                  <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '14px' }}>
                    {accuracy}% chính xác
                  </span>
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaStar style={{ color: '#f59e0b', fontSize: '16px' }} />
                  <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '14px' }}>
                    {score} điểm
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <select
              value={mode}
              onChange={handleModeChange}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '600',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="sentence">Đoạn văn</option>
              <option value="words">Từ đơn</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            
            <select
              value={timer}
              onChange={handleTimeChange}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                fontWeight: '600',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}s</option>)}
            </select>
            
            {mode === 'custom' && (
              <input
                value={customText}
                onChange={handleCustomText}
                placeholder="Nhập đoạn văn/từ..."
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  minWidth: '220px',
                  background: '#f8fafc',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            )}
            
            {!started && (
              <button
                onClick={handleStart}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontWeight: '700',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '18px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }}
              >
                <FaRocket />
                Bắt đầu
              </button>
            )}
          </div>
        </div>
      {started && countdown > 0 && (
        <div style={countdownStyle}>
          <span
            style={{
              fontSize: 160,
              color: '#ef4444',
              fontWeight: 900,
              textShadow: '0 8px 40px #ef444488, 0 2px 8px #2563eb22',
              opacity: 1,
              animation: 'popFade 1s',
              transition: 'all 0.5s',
              userSelect: 'none',
            }}
            key={countdown}
          >{countdown}</span>
          <style>{`
            @keyframes popFade {
              0% { transform: scale(0.7); opacity: 0.2; }
              40% { transform: scale(1.2); opacity: 1; }
              80% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.9); opacity: 0; }
            }
          `}</style>
        </div>
      )}
        {/* Practice Area */}
        {started && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {/* Text Display */}
            <div style={{
              fontSize: '24px',
              marginBottom: '30px',
              lineHeight: '1.6',
              minHeight: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {mode === 'words' && targetWords.length > 0 && renderWords()}
              {(mode === 'sentence' || mode === 'custom') && renderColoredText()}
            </div>

            {/* Input Area */}
            {mode === 'words' && !finished && countdown === 0 && (
              allWords.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '20px',
                  margin: '40px 0',
                  padding: '30px',
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderRadius: '16px',
                  border: '2px solid #fecaca'
                }}>
                  <FaGem style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }} />
                  <div>Không còn từ nào để luyện tập!</div>
                  <div style={{ fontSize: '16px', color: '#64748b', marginTop: '8px' }}>
                    Hãy chọn thêm chủ đề hoặc kiểm tra dữ liệu từ vựng
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  <input
                    ref={inputRef}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && e.target.value.length === 0 && currentWordIdx > 0) {
                        e.preventDefault();
                      }
                    }}
                    onChange={handleWordInput}
                    disabled={finished || countdown > 0}
                    placeholder="Gõ từ và nhấn cách..."
                    style={{
                      width: '400px',
                      fontSize: '24px',
                      borderRadius: '16px',
                      border: '3px solid #6366f1',
                      padding: '20px 24px',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#1e293b',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    autoFocus
                  />
                  <div style={{
                    minWidth: '100px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '24px',
                    color: '#22c55e',
                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    border: '2px solid #22c55e',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                  }}>
                    {timeLeft > 0 ? `${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')}` : '0:00'}
                  </div>
                </div>
              )
            )}
            
            {(mode === 'sentence' || mode === 'custom') && (
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                placeholder="Bắt đầu gõ ở đây..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  fontSize: '20px',
                  borderRadius: '16px',
                  border: '3px solid #e2e8f0',
                  padding: '20px',
                  marginBottom: '20px',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#1e293b',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  resize: 'vertical',
                  transition: 'all 0.3s ease'
                }}
                disabled={finished || countdown > 0}
                autoFocus
              />
            )}
          </div>
        )}

        {/* Stats Display */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderRadius: '24px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Thống kê thời gian thực
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '2px solid #f59e0b',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}>
              <FaStar style={{ fontSize: '32px', color: '#f59e0b', marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#92400e', marginBottom: '4px' }}>
                {score}
              </div>
              <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                Điểm số
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '2px solid #22c55e',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}>
              <FaCheckCircle style={{ fontSize: '32px', color: '#22c55e', marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#166534', marginBottom: '4px' }}>
                {correctCount}
              </div>
              <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>
                Đúng
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '2px solid #ef4444',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}>
              <FaTimesCircle style={{ fontSize: '32px', color: '#ef4444', marginBottom: '12px' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#991b1b', marginBottom: '4px' }}>
                {wrongCount}
              </div>
              <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                Sai
              </div>
            </div>
          </div>
        </div>
        {/* Result Display */}
        {showResult && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#22c55e',
              marginBottom: '16px'
            }}>
              Hoàn thành!
            </h2>
            <div style={{
              fontSize: '20px',
              color: '#1e293b',
              marginBottom: '30px'
            }}>
              Tốc độ: <span style={{ color: '#6366f1', fontWeight: '800' }}>{wpm} WPM</span> • 
              Độ chính xác: <span style={{ color: '#22c55e', fontWeight: '800' }}>{accuracy}%</span>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #f59e0b'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#92400e' }}>{score}</div>
                <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>Điểm số</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #22c55e'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#166534' }}>{correctCount}</div>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>Đúng</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #ef4444'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#991b1b' }}>{wrongCount}</div>
                <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>Sai</div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Records & History */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaTrophy style={{ color: '#f59e0b' }} />
            Kỷ lục cá nhân
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '2px solid #3b82f6'
            }}>
              <FaBullseye style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '12px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e40af', marginBottom: '4px' }}>
                {best.wpm}
              </div>
              <div style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600' }}>
                WPM cao nhất
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              border: '2px solid #22c55e'
            }}>
              <FaChartLine style={{ fontSize: '32px', color: '#22c55e', marginBottom: '12px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#166534', marginBottom: '4px' }}>
                {best.accuracy}%
              </div>
              <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>
                Độ chính xác cao nhất
              </div>
            </div>
          </div>
          
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaClock style={{ color: '#6366f1' }} />
            Lịch sử luyện gõ gần đây
          </h3>
          
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {history.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b'
              }}>
                <FaGem style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }} />
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Chưa có dữ liệu
                </div>
                <div style={{ fontSize: '14px' }}>
                  Hãy bắt đầu luyện tập để xem lịch sử ở đây
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 100px 80px 80px',
                gap: '0',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px'
              }}>
                <div style={{ padding: '16px 20px' }}>Ngày</div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>WPM</div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>Accuracy</div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>Errors</div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>Words</div>
              </div>
            )}
            
            {history.length > 0 && (
              <div>
                {history.slice(0, 10).map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 100px 80px 80px',
                      gap: '0',
                      background: i % 2 === 0 ? '#fff' : '#f8fafc',
                      borderBottom: i < Math.min(history.length, 10) - 1 ? '1px solid #e2e8f0' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ padding: '16px 20px', color: '#374151' }}>
                      {new Date(h.created_at || h.time).toLocaleString('vi-VN')}
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      fontWeight: '700',
                      color: h.wpm >= 40 ? '#22c55e' : '#ef4444'
                    }}>
                      {h.wpm}
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      fontWeight: '700',
                      color: h.accuracy >= 95 ? '#22c55e' : '#ef4444'
                    }}>
                      {h.accuracy}%
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      color: (h.errors || 0) > 0 ? '#ef4444' : '#64748b',
                      fontWeight: '600'
                    }}>
                      {h.errors || 0}
                    </div>
                    <div style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      color: '#6366f1',
                      fontWeight: '600'
                    }}>
                      {h.words_typed || 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
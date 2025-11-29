import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlay, FaCheck, FaRedo, FaVolumeUp, FaArrowLeft, FaLightbulb, FaForward, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';

const Dictation = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get exercise ID from URL
  const [fullTranscript, setFullTranscript] = useState(''); // Full transcript text
  const [sentences, setSentences] = useState([]); // Array of sentences
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentence, setSentence] = useState(''); // Current sentence for display
  const [audioUrl, setAudioUrl] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exerciseInfo, setExerciseInfo] = useState({ 
    title: '', 
    level: '', 
    topic: '',
    id: null 
  });
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState(null);
  const [sentenceResults, setSentenceResults] = useState([]); // Lưu kết quả từng câu
  const [showSummary, setShowSummary] = useState(false); // Hiển thị bảng thống kê tổng hợp
  const [aggregating, setAggregating] = useState(false); // Trạng thái tổng hợp AI khi kết thúc
  const [translations, setTranslations] = useState({}); // vi translation per sentence index
  const [expReward, setExpReward] = useState(null);
  const audioPlayerRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Media controls for per-sentence TTS
  const [playerSpeed, setPlayerSpeed] = useState(1);
  // Removed live volume control for TTS (cannot change mid-utterance)
  const [playerCurrent, setPlayerCurrent] = useState(0); // seconds
  const [playerDuration, setPlayerDuration] = useState(0); // seconds (estimated)
  const [isPaused, setIsPaused] = useState(false);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchExerciseById(id);
    } else {
      fetchRandomExercise();
    }
  }, [id]);

  // Cleanup audio khi unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };

  // (removed) formatTime since time UI is hidden
  }, []);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5050';
  const normalizeAudioUrl = (url) => {
    if (!url) return '';
    let u = String(url).trim();
    if (/^https?:\/\//i.test(u)) return u;
    // if already points to backend /audio serve path
    if (/^\/?audio\//i.test(u)) {
      if (!u.startsWith('/')) u = '/' + u;
      return `${API_BASE}${u}`;
    }
    u = u
      .replace(/^server\/upload\/audio/i, '/audio')
      .replace(/^\/??upload\/audio/i, '/audio')
      .replace(/^server\/audio/i, '/audio')
      .replace(/^audio\//i, '/audio/');
    if (!u.startsWith('/')) u = '/' + u;
    return `${API_BASE}${u}`;
  };

  const fetchExerciseById = async (exerciseId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dictation/exercise/${exerciseId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Không tìm thấy bài tập');
      const data = await res.json();
       loadExerciseData(data);
    } catch (err) {
      console.error('Load exercise error:', err);
      setFeedback('❌ Không tải được bài tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomExercise = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dictation/random-dictation', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Lỗi tải bài tập');
      const data = await res.json();
       loadExerciseData(data);
    } catch (err) {
      console.error('Load exercise error:', err);
      // Fallback data
      loadExerciseData({
        id: 0,
        title: 'Sample Exercise',
        transcript: 'My name is Thang.',
        audio_url: '',
        level: 'Beginner',
        topic: 'General'
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse transcript into sentences
  const parseSentences = (text) => {
    if (!text) return [];
    
    // Normalize text: replace multiple spaces/newlines with single space
    let normalized = text.replace(/\s+/g, ' ').trim();
    
    // First, try to split by sentence endings (. ! ?) but keep the punctuation
    const sentenceRegex = /([^.!?]+[.!?]+)/g;
    const matches = normalized.match(sentenceRegex);
    
    if (matches && matches.length > 0) {
      return matches.map(s => s.trim()).filter(s => s.length > 0);
    }
    
    // If no sentence endings found, try splitting by commas (for multiple sentences)
    const commaSplit = normalized.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (commaSplit.length > 1) {
      // Add comma back to all but the last one
      return commaSplit.map((s, idx) => 
        idx < commaSplit.length - 1 ? s + ',' : s
      );
    }
    
    // If still only one sentence, return it as is
    return [normalized];
  };

  const loadExerciseData = (data) => {
    const transcript = data.transcript || '';
    setFullTranscript(transcript);
    const parsedSentences = parseSentences(transcript);
    console.log('📝 Transcript:', transcript);
    console.log('📝 Parsed sentences:', parsedSentences);
    console.log('📝 Number of sentences:', parsedSentences.length);
    setSentences(parsedSentences);
    // Load Vietnamese translations for each sentence (batch)
    translateSentences(parsedSentences);
    setCurrentSentenceIndex(0);
    setSentence(parsedSentences[0] || '');
    setAudioUrl(normalizeAudioUrl(data.audio_url || ''));
    setExerciseInfo({
      id: data.id,
      title: data.title || 'Dictation Exercise',
      level: data.level || 'Beginner',
      topic: data.topic || 'General'
    });
    setUserInput('');
    setScore(0);
    setFeedback('');
    setShowHint(false);
    setAttempts(0);
    setAiResult(null);
    setShowFullTranscript(false);
    setPlayingSentenceIndex(null);
    setSentenceResults([]); // Reset kết quả
    setShowSummary(false); // Reset bảng thống kê
    setTranslations({}); // Reset bản dịch
    setExpReward(null);
  };

  const playAudio = (speed = 1) => {
    if (isPlaying) return;
    
    setIsPlaying(true);

    // Cleanup previous audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (audioUrl) {
      const player = new Audio(audioUrl);
      player.playbackRate = speed;
      audioPlayerRef.current = player;

      player.addEventListener('ended', () => {
        setIsPlaying(false);
        audioPlayerRef.current = null;
      });

      player.addEventListener('error', () => {
        setIsPlaying(false);
        audioPlayerRef.current = null;
        fallbackTTS(speed);
      });

      player.play().catch(() => {
        setIsPlaying(false);
        audioPlayerRef.current = null;
        fallbackTTS(speed);
      });
    } else {
      fallbackTTS(speed);
    }
  };

  const fallbackTTS = (speed = 1) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.8 * speed;
      utterance.pitch = 1;
      // utterance.volume = 1; // use default
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
    }
  };

  const checkAnswer = async () => {
    if (!userInput.trim()) {
      setFeedback('⚠️ Hãy viết câu bạn nghe được!');
      return;
    }

    // Tắt AI: chỉ chấm cơ bản tại bước kiểm tra từng câu
    setChecking(true);
    setAiResult(null);
    setAttempts(attempts + 1);
    setShowAnswer(true);
    try {
    const similarity = calculateSimilarity(userInput.toLowerCase(), sentence.toLowerCase());
    const newScore = Math.round(similarity * 100);
    setScore(newScore);
      setFeedback(
        newScore === 100 ? '🎉 Hoàn hảo! Bạn nghe cực chuẩn!' :
        newScore >= 90 ? '🌟 Xuất sắc! Chỉ sai vài chi tiết nhỏ!' :
        newScore >= 70 ? '👍 Tốt lắm! Hãy tiếp tục với câu tiếp theo.' :
        newScore >= 50 ? '💪 Cố gắng thêm! Hãy tiếp tục với câu tiếp theo.' :
        '📚 Nghe kỹ hơn nhé! Hãy tiếp tục với câu tiếp theo.'
      );

      const basicResult = {
        sentenceIndex: currentSentenceIndex,
        sentence: sentence,
        userInput: userInput.trim(),
        score: newScore,
        aiResult: null,
        checked: true
      };
      setSentenceResults(prev => {
        const updated = [...prev];
        updated[currentSentenceIndex] = basicResult;
        return updated;
      });
    } finally {
      setChecking(false);
    }
  };

  const calculateSimilarity = (input, original) => {
    // Remove punctuation và normalize
    const normalize = (str) => str.replace(/[.,!?;:]/g, '').trim();
    const inputNorm = normalize(input);
    const originalNorm = normalize(original);

    const inputWords = inputNorm.split(/\s+/).filter(w => w.length > 0);
    const origWords = originalNorm.split(/\s+/).filter(w => w.length > 0);

    if (inputWords.length === 0) return 0;

    let matches = 0;
    inputWords.forEach((word, idx) => {
      // Exact match hoặc substring match
      if (origWords[idx] === word) {
        matches += 1;
      } else if (origWords.some(origWord => origWord.includes(word) || word.includes(origWord))) {
        matches += 0.5;
      }
    });

    return Math.min(matches / origWords.length, 1);
  };

  const skipSentence = () => {
    // Lưu kết quả skip
    const skipResult = {
      sentenceIndex: currentSentenceIndex,
      sentence: sentence,
      userInput: '',
      score: 0,
      aiResult: null,
      checked: true,
      skipped: true
    };
    
    setSentenceResults(prev => {
      const updated = [...prev];
      updated[currentSentenceIndex] = skipResult;
      return updated;
    });
    
    // Reset input và hiển thị đáp án
    setUserInput('');
    setScore(0);
    setFeedback('');
    setAiResult(null);
    setShowAnswer(true); // Hiển thị đáp án khi skip
    
    // Chuyển sang câu tiếp theo nếu có
    if (currentSentenceIndex < sentences.length - 1) {
      setTimeout(() => {
        goToSentence(currentSentenceIndex + 1);
      }, 300);
    }
  };

  const markAsCompleted = () => {
    if (!exerciseInfo.id || !exerciseInfo.topic) return;
    
    const storageKey = `completed_${exerciseInfo.topic}`;
    const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (!completed.includes(exerciseInfo.id)) {
      completed.push(exerciseInfo.id);
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  };
  
  const addExp = async (amount) => {
    if (!user?.id || !amount || amount <= 0) return;
    try {
      const res = await fetch(`/api/learner/${user.id}/add-exp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          expAmount: amount,
          activityType: 'dictation'
        })
      });
      
      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }
      
      if (!res.ok) {
        console.error('Không thể cộng EXP dictation:', data);
        return;
      }
      
      if (data?.success) {
        setExpReward({
          amount,
          leveledUp: !!data.leveledUp,
          newLevel: data.newLevel || null
        });
      }
    } catch (err) {
      console.error('Lỗi khi cộng EXP dictation:', err);
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Navigate between sentences
  const goToSentence = (index) => {
    if (index >= 0 && index < sentences.length) {
      setCurrentSentenceIndex(index);
      setSentence(sentences[index]);
      
      // Khôi phục userInput và kết quả nếu đã check
      const existingResult = sentenceResults[index];
      if (existingResult) {
        setUserInput(existingResult.userInput || '');
        setScore(existingResult.score || 0);
        setShowAnswer(true);
        setAiResult(null); // Không hiển thị bảng thống kê chi tiết khi check từng câu
      } else {
        setUserInput('');
        setScore(0);
        setFeedback('');
        setShowAnswer(false);
        setAiResult(null);
      }
      // Auto scroll to sentence in transcript panel
      if (autoScroll && transcriptScrollRef.current) {
        const sentenceElement = transcriptScrollRef.current.children[index];
        if (sentenceElement) {
          sentenceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      goToSentence(currentSentenceIndex + 1);
    } else if (repeat) {
      goToSentence(0);
    }
  };

  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      goToSentence(currentSentenceIndex - 1);
    }
  };

  // Play specific sentence using TTS
  const playSentence = (sentenceText, index) => {
    // Force per-sentence playback via TTS to keep each sentence isolated
    if (false && audioUrl) {
      try {
        let player = audioPlayerRef.current;
        if (!player) {
          player = new Audio(audioUrl);
          audioPlayerRef.current = player;
        } else if (player.src !== audioUrl) {
          player.src = audioUrl;
        }
        player.playbackRate = playerSpeed;
        player.volume = playerVolume;
        // Reset listeners
        player.onended = () => {
          setIsPlaying(false);
          setPlayingSentenceIndex(null);
        };
        player.ontimeupdate = () => {
          setPlayerCurrent(player.currentTime || 0);
        };
        player.onloadedmetadata = () => {
          setPlayerDuration(player.duration || 0);
        };
        // Start
        setPlayingSentenceIndex(index);
        setIsPaused(false);
        setIsPlaying(true);
        player.currentTime = 0; // play per sentence from start
        player.play().catch(() => {});
        return;
      } catch {}
    }
    // Fallback to TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setPlayingSentenceIndex(index);
      // Do not pre-estimate duration; will set actual elapsed at end
      setPlayerDuration(0);
      setPlayerCurrent(0);
      setIsPaused(false);
      // Clear old timer
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.lang = 'en-US';
      utterance.rate = playerSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;

      // start simulated progress timer
      const startedAt = Date.now();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      progressTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        setPlayerCurrent(elapsed);
      }, 100);

      utterance.onend = () => {
        setPlayingSentenceIndex(null);
        setIsPlaying(false);
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        // Snap duration to actual elapsed to avoid 1s drift
        const actual = (Date.now() - startedAt) / 1000;
        setPlayerDuration(Math.max(0.5, Math.round(actual)));
        // Full transcript behavior
        if (showFullTranscript && sentences && sentences.length > 0) {
          const next = index + 1;
          // Auto-advance to next only when Auto scroll is ON
          if (autoScroll && next < sentences.length) {
            goToSentence(next);
            setTimeout(() => {
              if (sentences[next]) {
                playSentence(sentences[next], next);
              }
            }, 150);
          }
          // If at end and Repeat is ON, always loop regardless of Auto scroll
          if (next >= sentences.length && repeat) {
            goToSentence(0);
            setTimeout(() => {
              if (sentences[0]) {
                playSentence(sentences[0], 0);
              }
            }, 150);
          }
        }
      };

      utterance.onerror = () => {
        setPlayingSentenceIndex(null);
        setIsPlaying(false);
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      };

      speechSynthesis.speak(utterance);
    }
  };

  // Format seconds to m:ss for media HUD
  const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSentence();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const passed = (sentenceResults[currentSentenceIndex]?.score === 100);
        if (passed) {
          nextSentence();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!isPlaying) {
          playSentence(sentence, currentSentenceIndex);
        } else {
          speechSynthesis.cancel();
          setIsPlaying(false);
          setPlayingSentenceIndex(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSentenceIndex, sentences, sentence, isPlaying]);

  // Helper function to highlight errors in text
  const highlightErrors = (text, errors) => {
    if (!errors || errors.length === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(/(\s+)/);
    const errorPositions = new Set(errors.map(e => e.position));
    
    return (
      <span>
        {words.map((word, idx) => {
          const wordIndex = words.slice(0, idx).filter(w => w.trim()).length;
          const isError = errorPositions.has(wordIndex);
          
          if (word.trim() === '') {
            return word; // Preserve whitespace
          }
          
          return (
            <span
              key={idx}
              style={{
                backgroundColor: isError ? '#fee2e2' : 'transparent',
                color: isError ? '#dc2626' : 'inherit',
                fontWeight: isError ? 700 : 'normal',
                textDecoration: isError ? 'underline' : 'none',
                padding: isError ? '2px 4px' : '0',
                borderRadius: isError ? '4px' : '0'
              }}
            >
              {word}
            </span>
          );
        })}
      </span>
    );
  };

  // Render original sentence with DailyDictation-like highlighting:
  // - Words that appear in user's input: normal (black)
  // - Missing words: green (highlighted as needed to complete the sentence)
  const renderOriginalWithMissingHighlights = (original, input) => {
    const wordRegex = /\b[\w']+\b/g;
    const toWords = (s) => (String(s).toLowerCase().match(wordRegex) || []);
    const inputCounts = new Map();
    toWords(input).forEach((w) => {
      inputCounts.set(w, (inputCounts.get(w) || 0) + 1);
    });
    const tokens = original.match(/(\b[\w']+\b|[^\w\s]+|\s+)/g) || [original];
    return (
      <span>
        {tokens.map((tok, i) => {
          // Keep spaces/punctuation unchanged
          if (!/\b[\w']+\b/.test(tok)) return tok;
          const key = tok.toLowerCase();
          const count = inputCounts.get(key) || 0;
          if (count > 0) {
            // Word covered by user's input → render normally
            inputCounts.set(key, count - 1);
            return (
              <span key={i} style={{ color: '#0f172a' }}>
                {tok}
              </span>
            );
          }
          // Missing word → green
          return (
            <span key={i} style={{ color: '#10b981', fontWeight: 600 }}>
              {tok}
            </span>
          );
        })}
      </span>
    );
  };

  const nextExercise = () => {
    if (id) {
      // Nếu đang ở mode practice by ID, quay về danh sách
      navigate(`/dictation/exercises/${encodeURIComponent(exerciseInfo.topic)}`);
    } else {
      // Random mode, load bài mới
      fetchRandomExercise();
    }
  };

  // Simple cached translation via public API (MyMemory). Replace with backend later if needed.
  const getVietnameseTranslation = async (text, idx) => {
    if (!text) return;
    if (translations[idx]) return;
    try {
      // Mark as loading
      setTranslations(prev => ({ ...prev, [idx]: '__loading__' }));
      // Google Translate public endpoint (array response)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      // data format: [[["Translated","Original",null,null,...], ...], ...]
      const vi = Array.isArray(data) && Array.isArray(data[0])
        ? data[0].map(part => part[0]).join('') : '';
      setTranslations(prev => ({ ...prev, [idx]: vi || '(Không dịch được)' }));
    } catch (e) {
      setTranslations(prev => ({ ...prev, [idx]: '(Lỗi dịch)' }));
    }
  };

  // Dịch từng câu sang tiếng Việt theo danh sách (batch)
  const translateSentences = async (list) => {
    if (!list || list.length === 0) {
      setTranslations({});
      return;
    }
    try {
      // Pre-mark all as loading
      const loadingMap = {};
      list.forEach((_, i) => { loadingMap[i] = '__loading__'; });
      setTranslations(loadingMap);
      const results = {};
      for (const [i, s] of list.entries()) {
        try {
          // Google Translate public endpoint (array response)
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(s)}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const vi = Array.isArray(data) && Array.isArray(data[0])
              ? data[0].map(part => part[0]).join('') : '';
            results[i] = vi;
          } else {
            results[i] = '';
          }
        } catch {
          results[i] = '';
        }
      }
      setTranslations(prev => ({ ...prev, ...results }));
    } catch {
      // On failure, clear translations
      const empty = {};
      list.forEach((_, i) => { empty[i] = ''; });
      setTranslations(empty);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: 60,
          height: 60,
          border: '6px solid rgba(255,255,255,0.3)',
          borderTop: '6px solid white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: 'white', fontSize: 18, marginTop: 20, fontWeight: 600 }}>
          Đang tải bài tập...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
     // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
      fontFamily: `'Google Sans', 'Inter', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 0 }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Luyện Dictation TOEIC', path: '/dictation' },
            { label: exerciseInfo?.topic || 'Chủ đề', path: `/dictation/exercises/${encodeURIComponent(exerciseInfo?.topic || '')}` },
            { label: exerciseInfo?.title || 'Bài luyện', path: '#' }
          ]}
        />
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 30,
          background: 'rgba(255,255,255,0.95)',
          padding: '20px 30px',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          flexWrap: 'wrap',
          gap: 15
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate(id ? `/dictation/exercises/${encodeURIComponent(exerciseInfo.topic)}` : '/dictation')}
              style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: 12,
                padding: 12,
                cursor: 'pointer',
                fontSize: 18,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 style={{
                margin: '0 0 6px 0',
                color: '#0f172a',
                fontSize: 28,
                fontWeight: 900
              }}>
                🎧 {exerciseInfo.title}
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: '#e0e7ff',
                  padding: '4px 12px',
                  borderRadius: 12,
                  color: '#3730a3',
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  📚 {exerciseInfo.topic}
                </span>
                <span style={{
                  background: '#fef3c7',
                  padding: '4px 12px',
                  borderRadius: 12,
                  color: '#92400e',
                  fontSize: 13,
                  fontWeight: 600
                }}>
                  ⭐ {exerciseInfo.level}
                </span>
                {attempts > 0 && (
                  <span style={{
                    background: '#dbeafe',
                    padding: '4px 12px',
                    borderRadius: 12,
                    color: '#1e40af',
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    🎯 Lần thử: {attempts}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Compact progress HUD */}
          <div style={{ minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>Tiến độ</span>
              <span style={{ color: '#111827', fontSize: 12, fontWeight: 700 }}>
                {Math.min(currentSentenceIndex + 1, sentences.length)}/{sentences.length || 0}
              </span>
            </div>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${sentences.length ? Math.min(100, Math.round(((currentSentenceIndex + 1) / sentences.length) * 100)) : 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
              }} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: 40,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          {/* Audio Player */}
          {!showFullTranscript && (
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            padding: 30,
            borderRadius: 20,
            marginBottom: 30,
            textAlign: 'center',
            border: '2px solid #e2e8f0'
          }}>
            <p style={{
              color: '#64748b',
              fontSize: 16,
              marginBottom: 20,
              fontWeight: 500
            }}>
              🎵 Nghe và viết lại chính xác nhất
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* Media Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: 9999,
                padding: '8px 12px',
                height: 55,
                width: 'fit-content',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {/* Play/Pause */}
                <button
                  onClick={() => {
                    if (playingSentenceIndex === currentSentenceIndex && isPlaying && !isPaused) {
                      window.speechSynthesis.pause();
                      setIsPaused(true);
                    } else if (playingSentenceIndex === currentSentenceIndex && isPaused) {
                      window.speechSynthesis.resume();
                      setIsPaused(false);
                    } else {
                      playSentence(sentence, currentSentenceIndex);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    border: 'none',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(99,102,241,0.25)'
                  }}
                >
                  <FaPlay />
                </button>

                {/* Removed time/seek and volume for TTS constraints */}

                {/* Speed */}
                <select
                  value={playerSpeed}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPlayerSpeed(v);
                    if (playingSentenceIndex === currentSentenceIndex) {
                      const words = sentence.split(/\s+/).filter(Boolean);
                      const pct = playerDuration ? (playerCurrent / playerDuration) : 0;
                      const idx = Math.min(words.length - 1, Math.floor(pct * words.length));
                      const remaining = words.slice(idx).join(' ');
                      window.speechSynthesis.cancel();
                      playSentence(remaining || sentence, currentSentenceIndex);
                    }
                  }}
                  style={{ height: 32, padding: '4px 10px', borderRadius: 9999, border: '1px solid #e5e7eb', background: '#ffffff' }}
                  title="Tốc độ phát"
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(s => (
                    <option key={s} value={s}>{s}x</option>
                  ))}
                </select>
              </div>

              {/* Hint toggle */}
              <button
                onClick={toggleHint}
                style={{
                  height: 44,
                  padding: '0 16px',
                  background: showHint ? '#fef3c7' : '#f3f4f6',
                  color: showHint ? '#92400e' : '#374151',
                  border: `2px solid ${showHint ? '#fbbf24' : '#e5e7eb'}`,
                  borderRadius: 9999,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                <FaLightbulb />
                {showHint ? 'Ẩn gợi ý' : 'Gợi ý'}
              </button>
            </div>

            {/* Hint Section */}
            {showHint && (
              <div style={{
                background: '#fffbeb',
                border: '2px solid #fbbf24',
                borderRadius: 12,
                padding: 20,
                textAlign: 'left',
                animation: 'slideDown 0.3s ease'
              }}>
                <p style={{
                  margin: '0 0 10px 0',
                  color: '#92400e',
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  💡 Gợi ý:
                </p>
                <p style={{
                  margin: 0,
                  color: '#78350f',
                  fontSize: 15,
                  fontFamily: 'monospace'
                }}>
                  Câu có <strong>{sentence.split(' ').length} từ</strong>
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  color: '#78350f',
                  fontSize: 13
                }}>
                  Chữ cái đầu: <strong>{sentence.split(' ').map(w => w[0]).join(' ')}</strong>
                </p>
              </div>
            )}
          </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            borderBottom: '2px solid #e2e8f0'
          }}>
            <button
              onClick={() => setShowFullTranscript(false)}
              style={{
                padding: '12px 24px',
                background: !showFullTranscript ? '#6366f1' : 'transparent',
                color: !showFullTranscript ? 'white' : '#64748b',
                border: 'none',
                borderBottom: !showFullTranscript ? '3px solid #6366f1' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.2s'
              }}
            >
              Dictation
            </button>
            <button
              onClick={() => setShowFullTranscript(true)}
              style={{
                padding: '12px 24px',
                background: showFullTranscript ? '#6366f1' : 'transparent',
                color: showFullTranscript ? 'white' : '#64748b',
                border: 'none',
                borderBottom: showFullTranscript ? '3px solid #6366f1' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
                transition: 'all 0.2s'
              }}
            >
              Full transcript
            </button>
          </div>

          {showFullTranscript ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              height: '600px',
              background: '#ffffff',
              borderRadius: 12,
              border: '2px solid #e2e8f0',
              marginBottom: 24
            }}>
              {/* Header with checkboxes */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '2px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 500
                }}>
                  <input
                    type="checkbox"
                    checked={repeat}
                    onChange={(e) => setRepeat(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Repeat
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#374151',
                  fontWeight: 500
                }}>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Auto scroll
                </label>
              </div>

              {/* Sentences list - single pane */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 0'
              }} ref={transcriptScrollRef}>
                {sentences.map((sent, idx) => (
                  <div
                    key={idx}
                    onClick={() => goToSentence(idx)}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      background: idx === currentSentenceIndex ? '#eff6ff' : 'transparent',
                      borderLeft: idx === currentSentenceIndex ? '4px solid #6366f1' : '4px solid transparent',
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr',
                      alignItems: 'center',
                      columnGap: 12,
                      transition: 'all 0.2s',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={(e) => {
                      if (idx !== currentSentenceIndex) {
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (idx !== currentSentenceIndex) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playingSentenceIndex === idx) {
                          if ('speechSynthesis' in window) {
                            speechSynthesis.cancel();
                          }
                          setPlayingSentenceIndex(null);
                        } else {
                          playSentence(sent, idx);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: playingSentenceIndex === idx ? '#6366f1' : '#64748b',
                        fontSize: 16,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {playingSentenceIndex === idx ? '⏸' : '▶'}
                    </button>
                    {/* Sentence + translation stacked vertically in the same column */}
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: idx === currentSentenceIndex ? '#1e40af' : '#0f172a',
                        fontWeight: idx === currentSentenceIndex ? 600 : 400
                      }}>
                        {sent}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        {(() => {
                          if (!translations[idx]) {
                            // kick off translation when missing
                            getVietnameseTranslation(sent, idx);
                            return 'Đang dịch...';
                          }
                          if (translations[idx] === '__loading__') return 'Đang dịch...';
                          return translations[idx];
                        })()}
                      </div>
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer instructions */}
              <div style={{
                padding: '12px 20px',
                borderTop: '2px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 12,
                color: '#64748b',
                textAlign: 'center'
              }}>
                Press "Space" to Play/Pause • Press ← and → to move between sentences
              </div>
            </div>
          ) : (
            <>
              {/* Navigation Controls */}
              {sentences.length > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  marginBottom: 20,
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '2px solid #e2e8f0'
                }}>
                  <button
                    onClick={prevSentence}
                    disabled={currentSentenceIndex === 0}
                    style={{
                      background: currentSentenceIndex === 0 ? '#e5e7eb' : '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      cursor: currentSentenceIndex === 0 ? 'not-allowed' : 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    ←
                  </button>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#374151',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    {currentSentenceIndex + 1} / {sentences.length}
                  </span>
                  <button
                    onClick={nextSentence}
                    disabled={(sentenceResults[currentSentenceIndex]?.score !== 100) || (currentSentenceIndex === sentences.length - 1 && !repeat)}
                    style={{
                      background: ((sentenceResults[currentSentenceIndex]?.score !== 100) || (currentSentenceIndex === sentences.length - 1 && !repeat)) ? '#e5e7eb' : '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      cursor: ((sentenceResults[currentSentenceIndex]?.score !== 100) || (currentSentenceIndex === sentences.length - 1 && !repeat)) ? 'not-allowed' : 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    →
                  </button>
                </div>
              )}

          {/* User Input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              color: '#0f172a',
              marginBottom: 12,
              fontWeight: 700,
              fontSize: 16
            }}>
              ✍️ Viết lại câu bạn nghe được:
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type exactly what you hear..."
              style={{
                width: '100%',
                height: 140,
                padding: 16,
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                fontSize: 17,
                resize: 'vertical',
                fontFamily: 'monospace',
                lineHeight: 1.6,
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 24
          }}>
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim() || isPlaying || checking || showFullTranscript}
              style={{
                padding: 16,
                background: (!userInput.trim() || isPlaying || checking || showFullTranscript) ? '#d1d5db' : 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: (!userInput.trim() || isPlaying || checking || showFullTranscript) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: (!userInput.trim() || isPlaying || checking || showFullTranscript) ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              {checking ? (
                <>⏳ Đang kiểm tra...</>
              ) : (
                <><FaCheck /> Kiểm tra</>
              )}
            </button>

            <button
              onClick={async () => {
                // Chỉ gọi AI ở bước kết thúc: tổng hợp lần lượt cho các câu đã kiểm tra
                const checked = sentenceResults
                  .map((r, i) => ({ r, i }))
                  .filter(x => x.r && x.r.checked);
                const checkedCount = checked.length;
                if (checkedCount === 0) {
                  setFeedback('⚠️ Hãy kiểm tra ít nhất một câu trước khi xem thống kê!');
                  return;
                }
                setAggregating(true);
                setExpReward(null);
                // TẠM TẮT AI: dùng điểm cơ bản đã tính sẵn cho từng câu
                try {
                  const checkedAfter = sentenceResults.filter(x => x && x.checked);
                  const total = checkedAfter.reduce((s, x) => s + (x?.score || 0), 0);
                  const avg = Math.round(total / checkedAfter.length);
                  setScore(avg);
                  setShowSummary(true);
                  // Award EXP: 5 EXP per checked sentence + bonus by avg score (avg/10 rounded)
                  const expFromSentences = checkedAfter.length * 5;
                  const expBonus = Math.round(avg / 10);
                  addExp(expFromSentences + expBonus);
                  markAsCompleted();
                  // Save dictation activity to backend for dashboard/roadmap
                  try {
                    if (user?.id && checkedAfter.length > 0) {
                      await fetch(`/api/learner/${user.id}/dictation-activity`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                        },
                        body: JSON.stringify({
                          sentencesChecked: checkedAfter.length,
                          avgScore: avg,
                          topic: exerciseInfo?.topic || null,
                          exerciseId: exerciseInfo?.id || null
                        })
                      }).catch(() => {});
                    }
                  } catch {}
                  // Save to localStorage as fallback for Roadmap
                  try {
                    const fallback = {
                      sentences: checkedAfter.length,
                      avg_score: avg,
                      topic: exerciseInfo?.topic || null,
                      exercise_id: exerciseInfo?.id || null,
                      created_at: new Date().toISOString()
                    };
                    localStorage.setItem('dictation_last_activity', JSON.stringify(fallback));
                  } catch {}
                } catch (err) {
                  console.error('Lỗi tổng hợp kết quả dictation (no-AI):', err);
                } finally {
                  setAggregating(false);
                }
              }}
              disabled={aggregating || sentenceResults.filter(r => r && r.checked).length === 0}
              style={{
                padding: 16,
                background: aggregating
                  ? '#d1d5db'
                  : (sentenceResults.filter(r => r && r.checked).length === 0 ? '#d1d5db' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'),
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: aggregating || sentenceResults.filter(r => r && r.checked).length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: aggregating
                  ? 'none'
                  : (sentenceResults.filter(r => r && r.checked).length === 0 ? 'none' : '0 6px 20px rgba(99, 102, 241, 0.4)'),
                transition: 'all 0.2s'
              }}
            >
              {aggregating ? '⏳ Đang tổng hợp...' : '📊 Kết thúc hội thoại'}
            </button>

            <button
              onClick={nextExercise}
              style={{
                padding: 16,
                background: '#f3f4f6',
                color: '#374151',
                border: '2px solid #e5e7eb',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
              }}
            >
              {id ? <><FaArrowLeft /> Danh sách</> : <><FaRedo /> Bài mới</>}
            </button>
          </div>

          {/* DailyDictation Style Feedback - Đơn giản, gọn gàng */}
          {((score > 0 || (sentenceResults[currentSentenceIndex] && sentenceResults[currentSentenceIndex].checked)) && !showSummary) && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 24,
              padding: 16,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {/* Icon và status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {score === 100 ? (
                  <FaCheckCircle style={{ color: '#10b981', fontSize: 20 }} />
                ) : (
                  <FaExclamationTriangle style={{ color: '#f59e0b', fontSize: 20 }} />
                )}
                <span style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: score === 100 ? '#10b981' : '#f59e0b'
                }}>
                  {score === 100 ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              {/* Đáp án đúng */}
              {showAnswer && (
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    color: '#10b981',
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    fontFamily: 'monospace'
                  }}>
                    {renderOriginalWithMissingHighlights(sentence, userInput)}
                  </p>
                </div>
              )}
              
              {/* Nút Skip - chỉ hiển thị khi chưa check */}
              {!sentenceResults[currentSentenceIndex]?.checked && (
                <button
                  onClick={skipSentence}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    flexShrink: 0,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6';
                  }}
                >
                  Skip
                </button>
              )}
            </div>
          )}

          {/* Bảng thống kê tổng hợp - CHỈ HIỂN THỊ KHI showSummary = true */}
          {showSummary && sentenceResults.filter(r => r && r.checked).length > 0 && (
            <div style={{
              padding: 24,
              background: score >= 90 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 
                         score >= 70 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 
                         'linear-gradient(135deg, #fee2e2, #fecaca)',
              borderRadius: 16,
              borderLeft: `6px solid ${score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginBottom: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{
                  margin: 0,
                  color: score >= 90 ? '#065f46' : score >= 70 ? '#92400e' : '#991b1b',
                  fontSize: 24,
                  fontWeight: 900
                }}>
                  📊 Kết quả tổng hợp
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {score === 100 && <span style={{ fontSize: 32 }}>🏆</span>}
                </div>
              </div>
              
              {expReward && (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  background: 'rgba(15, 23, 42, 0.1)',
                  borderRadius: 12,
                  color: score >= 90 ? '#065f46' : score >= 70 ? '#92400e' : '#991b1b',
                  fontSize: 16,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>+{expReward.amount} EXP</span>
                  {expReward.leveledUp && expReward.newLevel && (
                    <span>🎉 Lên cấp {expReward.newLevel}!</span>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <p style={{
                  margin: '0 0 8px 0',
                  color: score >= 90 ? '#065f46' : score >= 70 ? '#92400e' : '#991b1b',
                  fontSize: 18,
                  fontWeight: 700
                }}>
                  Điểm trung bình: {score}%
                </p>
                <p style={{
                  margin: 0,
                  color: score >= 90 ? '#065f46' : score >= 70 ? '#92400e' : '#991b1b',
                  fontSize: 14,
                  fontWeight: 500
                }}>
                  Đã kiểm tra: {sentenceResults.filter(r => r && r.checked).length} / {sentences.length} câu
                </p>
              </div>

              {/* Hiển thị chi tiết từng câu */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sentenceResults.map((result, idx) => {
                  if (!result || !result.checked) return null;
                  
                  const sentenceScore = result.score;
                  const aiResult = result.aiResult;
                  
                  return (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.95)',
                      padding: 20,
                      borderRadius: 12,
                      border: `2px solid ${sentenceScore >= 90 ? '#10b981' : sentenceScore >= 70 ? '#f59e0b' : '#ef4444'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h4 style={{
                          margin: 0,
                          color: '#0f172a',
                          fontSize: 16,
                          fontWeight: 700
                        }}>
                          Câu {idx + 1}: Điểm {sentenceScore}%
                        </h4>
                        {sentenceScore === 100 && <span style={{ fontSize: 24 }}>✅</span>}
                      </div>

                      {/* Câu trả lời của bạn */}
                      <div style={{ marginBottom: 12 }}>
                        <p style={{
                          margin: '0 0 6px 0',
                          color: '#64748b',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          ✍️ Câu trả lời của bạn:
                        </p>
                        <p style={{
                          margin: 0,
                          color: '#0f172a',
                          fontSize: 15,
                          fontFamily: 'monospace',
                          lineHeight: 1.6,
                          padding: 10,
                          background: '#f8fafc',
                          borderRadius: 8
                        }}>
                          {result.userInput}
                        </p>
                      </div>

                      {/* Đáp án đúng */}
                      <div style={{ marginBottom: 12 }}>
                        <p style={{
                          margin: '0 0 6px 0',
                          color: '#64748b',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                          ✅ Đáp án đúng:
                        </p>
                        <p style={{
                          margin: 0,
                          color: '#0f172a',
                          fontSize: 15,
                          fontFamily: 'monospace',
                          lineHeight: 1.6,
                          padding: 10,
                          background: '#f0fdf4',
                          borderRadius: 8
                        }}>
                          {result.sentence}
                        </p>
                      </div>

                      {/* Lỗi chi tiết */}
                      {aiResult && aiResult.errors && aiResult.errors.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={{
                            margin: '0 0 8px 0',
                            color: '#dc2626',
                            fontSize: 13,
                            fontWeight: 700
                          }}>
                            ❌ Các lỗi ({aiResult.errors.length}):
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {aiResult.errors.map((error, errorIdx) => (
                              <div key={errorIdx} style={{
                                padding: 10,
                                background: '#fee2e2',
                                borderRadius: 6,
                                borderLeft: '3px solid #dc2626'
                              }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                  {error.userWord && (
                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                      "{error.userWord}"
                                    </span>
                                  )}
                                  <span style={{ color: '#64748b' }}>→</span>
                                  {error.correctWord && (
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                                      "{error.correctWord}"
                                    </span>
                                  )}
                                </div>
                                <p style={{
                                  margin: 0,
                                  color: '#991b1b',
                                  fontSize: 12,
                                  lineHeight: 1.4
                                }}>
                                  {error.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Giải thích */}
                      {aiResult && aiResult.explanation && (
                        <div style={{
                          padding: 12,
                          background: '#eff6ff',
                          borderRadius: 8,
                          borderLeft: '3px solid #3b82f6'
                        }}>
                          <p style={{
                            margin: '0 0 6px 0',
                            color: '#1e40af',
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            💡 Giải thích:
                          </p>
                          <p style={{
                            margin: 0,
                            color: '#1e3a8a',
                            fontSize: 13,
                            lineHeight: 1.5
                          }}>
                            {aiResult.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gợi ý cải thiện tổng hợp */}
              {sentenceResults.some(r => r && r.aiResult && r.aiResult.suggestions) && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 12
                }}>
                  <p style={{
                    margin: '0 0 12px 0',
                    color: '#059669',
                    fontSize: 14,
                    fontWeight: 700
                  }}>
                    💪 Gợi ý cải thiện:
                  </p>
                  <ul style={{
                    margin: 0,
                    paddingLeft: 20,
                    color: '#047857',
                    fontSize: 14,
                    lineHeight: 1.8
                  }}>
                    {sentenceResults
                      .find(r => r && r.aiResult && r.aiResult.suggestions)?.aiResult.suggestions
                      .map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Fallback: Basic feedback without AI — removed per request */}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dictation;
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Flashcard from '../components/Flashcard';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { FaArrowLeft, FaRedo, FaTrophy, FaChartLine, FaCheck, FaTimes, FaFire, FaStar } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FlashcardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ⭐ NEW - Enhanced features
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardHistory, setCardHistory] = useState([]);
  const [audioPreloadProgress, setAudioPreloadProgress] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioCache = useRef(new Map());
  
  // ⭐ Quản lý từ chưa nhớ
  const [wrongCards, setWrongCards] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false); // Để biết đang học lại từ chưa nhớ
  const [initialCards, setInitialCards] = useState([]); // Lưu danh sách ban đầu 20 từ

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vocab?timestamp=${new Date().getTime()}`);
        if (!res.ok) throw new Error('Không tải được từ vựng');
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map(v => ({
          id: v.id,
          front: v.word,
          back: v.meaning,
          phonetic: v.phonetic || '',
          grammar: v.grammar || v.word_type || '',
          audioUrl: v.audio_url || '',
          exampleEn: v.example_sentence || '',
          exampleVi: v.example_vi || ''
        }));
        const shuffled = mapped.sort(() => Math.random() - 0.5).slice(0, 10);
        setInitialCards(shuffled); // Lưu danh sách ban đầu
        setCards(shuffled);
        setCardHistory(new Array(shuffled.length).fill(null));
      } catch (e) {
        setError(e.message || 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, []);

  useEffect(() => {
    if (cards.length === 0) return;

    const preloadAudio = async () => {
      const audioUrls = cards
        .filter(card => card.audioUrl)
        .map(card => card.audioUrl);
      
      if (audioUrls.length === 0) {
        setIsAudioReady(true);
        return;
      }

      let loadedCount = 0;
      const totalAudio = audioUrls.length;

      const preloadPromises = audioUrls.map((url) => {
        return new Promise((resolve) => {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.crossOrigin = 'anonymous';

          const onSuccess = () => {
            audio.removeEventListener('canplaythrough', onSuccess);
            audio.removeEventListener('loadeddata', onSuccess);
            audioCache.current.set(url, audio);
            loadedCount++;
            setAudioPreloadProgress(Math.round((loadedCount / totalAudio) * 100));
            resolve();
          };

          audio.addEventListener('canplaythrough', onSuccess, { once: true });
          audio.addEventListener('loadeddata', onSuccess, { once: true });

          audio.addEventListener('error', () => {
            console.warn(`Failed to preload: ${url}`);
            loadedCount++;
            setAudioPreloadProgress(Math.round((loadedCount / totalAudio) * 100));
            resolve();
          }, { once: true });

          audio.src = url;
          try { audio.load(); } catch (_) {}
        });
      });

      await Promise.all(preloadPromises);
      setIsAudioReady(true);
    };

    preloadAudio();

    return () => {
      audioCache.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioCache.current.clear();
    };
  }, [cards]);
    
  const handleCorrect = () => {
    setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }
    if (newStreak === 5 || newStreak === 10) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    const newHistory = [...cardHistory];
    newHistory[currentCardIndex] = true;
    setCardHistory(newHistory);
    
    // 🔥 FIX: Xử lý đúng review mode
    if (isReviewMode) {
      // Loại bỏ thẻ đã nhớ khỏi danh sách
      const newCards = cards.filter((_, idx) => idx !== currentCardIndex);
      const newCardHistory = cardHistory.filter((_, idx) => idx !== currentCardIndex);
      setCards(newCards);
      setCardHistory(newCardHistory);
      
      // Nếu hết thẻ → hoàn thành
      if (newCards.length === 0) {
        setIsCompleted(true);
      } else {
        // Nếu index vượt quá → reset về 0
        const nextIndex = currentCardIndex >= newCards.length ? 0 : currentCardIndex;
        setCurrentCardIndex(nextIndex);
      }
    } else {
      // Mode bình thường: chuyển sang thẻ tiếp theo
      handleNext();
    }
  };
  
  const handleIncorrect = () => {
    setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));  
    setStreak(0);
    
    const newHistory = [...cardHistory];
    newHistory[currentCardIndex] = false;
    setCardHistory(newHistory);
    
    // 🔥 FIX CRITICAL: Xử lý đúng trong cả 2 mode
    if (!isReviewMode) {
      // Mode bình thường: CHỈ lưu vào wrongCards
      const wrongCard = cards[currentCardIndex];
      setWrongCards(prev => [...prev, wrongCard]);
      handleNext(); // Chuyển sang thẻ tiếp theo
    } else {
      // 🔥 Review mode: Di chuyển thẻ vào cuối (remove rồi append) để giữ size không đổi
      const currentCard = cards[currentCardIndex];
      const currentHist = cardHistory[currentCardIndex];
      
      const newCards = cards.filter((_, idx) => idx !== currentCardIndex);
      const newCardHistory = cardHistory.filter((_, idx) => idx !== currentCardIndex);
      
      // Thêm vào cuối
      const updatedCards = [...newCards, currentCard];
      const updatedHistory = [...newCardHistory, currentHist];
      
      // Tính index tiếp theo (sau khi remove, index giữ nguyên để trỏ tới thẻ tiếp theo)
      const nextIndex = currentCardIndex >= newCards.length ? 0 : currentCardIndex;
      
      setCards(updatedCards);
      setCardHistory(updatedHistory);
      setCurrentCardIndex(nextIndex);
    }
  };
  
  const handleNext = () => {
    // Chỉ dùng cho mode bình thường
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleContinueLearning = () => {
    setIsReviewMode(true);
    setCards([...wrongCards]); // Sao chép danh sách từ chưa nhớ
    setWrongCards([]);
    setCurrentCardIndex(0);
    setCardHistory(new Array(wrongCards.length).fill(null));
    setShowSummary(false);
  };

  const handleStopLearning = () => {
    setIsCompleted(true);
    setShowSummary(false);
  };

  // Add EXP when completing flashcard session
  useEffect(() => {
    if (showSummary && user?.id && !isReviewMode && initialCards.length > 0) {
      const totalCards = initialCards.length;
      const percentage = Math.round((score.correct / totalCards) * 100) || 0;
      
      // Calculate EXP: 10 EXP per card + bonus based on accuracy
      const baseExp = totalCards * 10;
      let bonusExp = 0;
      
      if (percentage === 100) {
        bonusExp = 50; // Perfect score bonus
      } else if (percentage >= 80) {
        bonusExp = 30; // Excellent bonus
      } else if (percentage >= 60) {
        bonusExp = 15; // Good bonus
      }
      
      const totalExp = baseExp + bonusExp;
      
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/add-exp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        },
        body: JSON.stringify({
          expAmount: totalExp,
          activityType: 'flashcard'
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.leveledUp) {
          toast.success(`🎉 Level Up! Bạn đã lên cấp ${data.newLevel}!`, { autoClose: 3000 });
        } else if (data.success) {
          toast.success(`+${totalExp} EXP!`, { autoClose: 2000 });
        }
      })
      .catch(err => {
        console.error('Error adding EXP:', err);
      });
    }
  }, [showSummary, user?.id, isReviewMode, initialCards.length, score.correct]);

  const handleRestart = async () => {
    setCurrentCardIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setIsCompleted(false);
    setStreak(0);
    setBestStreak(0);
    setCardHistory([]);
    setWrongCards([]);
    setShowSummary(false);
    setIsReviewMode(false);
  
    try {
      setLoading(true); // Hiển thị loading khi tải lại
      const res = await fetch(`/api/vocab?timestamp=${new Date().getTime()}`);
      if (!res.ok) throw new Error('Không tải được từ vựng');
      const data = await res.json();
      const mapped = (Array.isArray(data) ? data : []).map(v => ({
        id: v.id,
        front: v.word,
        back: v.meaning,
        phonetic: v.phonetic || '',
        grammar: v.grammar || v.word_type || '',
        audioUrl: v.audio_url || '',
        exampleEn: v.example_sentence || '',
        exampleVi: v.example_vi || ''
      }));
      const shuffled = mapped.sort(() => Math.random() - 0.5).slice(0, 10);
      setInitialCards(shuffled); // Cập nhật danh sách ban đầu
      setCards(shuffled); // Cập nhật danh sách hiện tại
      setCardHistory(new Array(shuffled.length).fill(null)); // Reset lịch sử
    } catch (e) {
      setError(e.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false); // Tắt loading khi hoàn tất
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage === 100) return { emoji: '🏆', text: 'Hoàn hảo!', color: '#fbbf24' };
    if (percentage >= 80) return { emoji: '🌟', text: 'Xuất sắc!', color: '#10b981' };
    if (percentage >= 60) return { emoji: '👍', text: 'Tốt lắm!', color: '#6366f1' };
    if (percentage >= 40) return { emoji: '💪', text: 'Cố gắng thêm!', color: '#f59e0b' };
    return { emoji: '📚', text: 'Cần luyện tập!', color: '#ef4444' };
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '50px 40px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: '#ef4444', marginBottom: '15px', fontSize: '28px' }}>
            Vui lòng đăng nhập
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '16px' }}>
            Bạn cần đăng nhập để sử dụng chức năng flashcard
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 30px rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
            }}
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading || !isAudioReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '50px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          minWidth: '300px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid rgba(99, 102, 241, 0.2)',
            borderTop: '5px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
            {loading ? 'Đang tải lại flashcard...' : 'Đang chuẩn bị audio...'}
          </p>
          
          {!loading && !isAudioReady && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${audioPreloadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <p style={{ 
                color: '#6366f1', 
                fontSize: '14px', 
                fontWeight: '600',
                marginTop: '10px'
              }}>
                🔊 {audioPreloadProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', color: '#ef4444' }}>❌</div>
          <h2 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '24px' }}>
            Lỗi tải dữ liệu
          </h2>
          <p style={{ color: '#475569', marginBottom: '30px', fontSize: '16px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 32px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalCards = isReviewMode ? wrongCards.length : initialCards.length;
    const percentage = Math.round((score.correct / totalCards) * 100) || 0;
    const message = getPerformanceMessage(percentage);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4f46e5'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            <FaArrowLeft /> Quay lại
          </button>

          <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 1s ease-in-out' }}>{message.emoji}</div>
          <h2 style={{ color: message.color, marginBottom: '10px', fontSize: '32px' }}>
            {message.text}
          </h2>
          <p style={{ color: '#475569', fontSize: '18px', marginBottom: '30px' }}>
            Bạn đã hoàn thành {totalCards} thẻ!
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <FaCheck size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{score.correct}</div>
              <div>Đúng</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <FaTimes size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{score.incorrect}</div>
              <div>Sai</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <FaFire size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{bestStreak}</div>
              <div>Streak tốt nhất</div>
            </div>
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '20px' }}>Kết quả chi tiết:</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cards.map((card, index) => (
                <div key={card.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  padding: '10px',
                  background: cardHistory[index] ? '#e0f7fa' : '#fee2e2',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: '500' }}>{card.front}</span>
                  {cardHistory[index] ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {wrongCards.length > 0 && (
              <button
                onClick={handleContinueLearning}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '14px 32px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                Tiếp tục học từ chưa nhớ ({wrongCards.length})
              </button>
            )}
            <button
              onClick={handleStopLearning}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 32px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              Dừng học
            </button>
            <button
              onClick={handleRestart}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 32px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }
              }}
            >
              <FaRedo style={{ marginRight: '8px' }} /> Chơi lại
            </button>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes confettiFall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  if (isCompleted) {
    const totalCards = initialCards.length; // Số thẻ ban đầu
    const percentage = Math.round((score.correct / totalCards) * 100) || 0;
    const message = getPerformanceMessage(percentage);

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <button
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4f46e5'}
            onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          >
            <FaArrowLeft /> Quay lại
          </button>

          <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 1s ease-in-out' }}>{message.emoji}</div>
          <h2 style={{ color: message.color, marginBottom: '10px', fontSize: '32px' }}>
            {message.text}
          </h2>
          <p style={{ color: '#475569', fontSize: '18px', marginBottom: '30px' }}>
            Chúc mừng bạn đã hoàn thành {totalCards} thẻ!
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <FaCheck size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{score.correct}</div>
              <div>Đúng</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <FaTimes size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{score.incorrect}</div>
              <div>Sai</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <FaFire size={24} />
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{bestStreak}</div>
              <div>Streak tốt nhất</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRestart}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 32px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }
              }}
            >
              <FaRedo style={{ marginRight: '8px' }} /> Chơi lại
            </button>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes confettiFall {
            to {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flashcard-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <PageBreadcrumb 
        backgroundColor="transparent"
        textColor="rgba(255,255,255,0.8)"
        currentTextColor="white"
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Học tập', path: '#' },
          { label: 'Flashcard', path: '/flashcard' }
        ]}
      />
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999
        }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                top: '-10px',
                left: `${Math.random() * 100}%`,
                animation: `confettiFall ${Math.random() * 2 + 1}s linear forwards`
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#d1d5db'}
        onMouseLeave={(e) => e.target.style.color = '#fff'}
      >
        <FaArrowLeft /> Quay lại
      </button>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
            animation: streak >= 3 ? 'pulse 0.5s ease-in-out infinite' : 'none'
          }}>
            <FaFire /> {streak} Streak!
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#10b981',
          fontWeight: '700',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '8px 16px',
          borderRadius: '12px'
        }}>
          <FaCheck /> {score.correct}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#ef4444',
          fontWeight: '700',
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '8px 16px',
          borderRadius: '12px'
        }}>
          <FaTimes /> {score.incorrect}
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
        }}>
          {currentCardIndex + 1} / {cards.length || 0}
        </div>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        marginBottom: '30px',
        display: cards.length > 0 ? 'block' : 'none' // Ẩn nếu không có thẻ
      }}>
        {cards.length > 0 && (
          <Flashcard
            front={cards[currentCardIndex]?.front || ''}
            back={cards[currentCardIndex]?.back || ''}
            phonetic={cards[currentCardIndex]?.phonetic || ''}
            audioUrl={cards[currentCardIndex]?.audioUrl || ''}
            exampleEn={cards[currentCardIndex]?.exampleEn || ''}
            exampleVi={cards[currentCardIndex]?.exampleVi || ''}
            grammar={cards[currentCardIndex]?.grammar || ''}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
            onNext={handleNext}
            isLast={currentCardIndex === cards.length - 1}
            totalCards={cards.length}
            currentIndex={currentCardIndex}
          />
        )}
      </div>

      <div className="flashcard-progress-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '25px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaChartLine style={{ color: '#6366f1', fontSize: '20px' }} />
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Tiến độ học tập
            </span>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#6b7280'
          }}>
            {cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: '#e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
            borderRadius: '6px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)'
          }}></div>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 
                  index < currentCardIndex 
                    ? cardHistory[index] 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : index === currentCardIndex
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: index === currentCardIndex ? '0 0 15px rgba(99, 102, 241, 0.6)' : 'none'
              }}
            >
              {index < currentCardIndex && (
                cardHistory[index] ? <FaCheck size={14} /> : <FaTimes size={14} />
              )}
              {index === currentCardIndex && <FaStar size={14} />}
            </div>
          ))}
        </div>
      </div>
      
      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .flashcard-container {
            padding: 12px !important;
          }
          
          .flashcard-header {
            padding: 16px !important;
            margin-bottom: 12px !important;
          }
          
          .flashcard-title {
            font-size: 18px !important;
          }
          
          .flashcard-subtitle {
            font-size: 14px !important;
            margin-top: 6px !important;
          }
          
          .flashcard-stats {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          
          .flashcard-stat-item {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 8px 12px !important;
          }
          
          .flashcard-stat-label {
            font-size: 14px !important;
          }
          
          .flashcard-stat-value {
            font-size: 16px !important;
          }
          
          .flashcard-card-container {
            margin: 12px 0 !important;
          }
          
          .flashcard-progress-container {
            padding: 16px !important;
            margin-bottom: 12px !important;
          }
          
          .flashcard-progress-title {
            font-size: 16px !important;
          }
          
          .flashcard-progress-percentage {
            font-size: 14px !important;
          }
          
          .flashcard-progress-bar {
            height: 10px !important;
            margin-top: 12px !important;
          }
          
          .flashcard-progress-dots {
            gap: 6px !important;
            margin-top: 16px !important;
          }
          
          .flashcard-progress-dot {
            width: 28px !important;
            height: 28px !important;
            font-size: 14px !important;
          }
          
          .flashcard-summary-container {
            padding: 16px !important;
            margin-top: 12px !important;
          }
          
          .flashcard-summary-title {
            font-size: 18px !important;
            margin-bottom: 12px !important;
          }
          
          .flashcard-summary-stats {
            flex-direction: column !important;
            gap: 12px !important;
            margin-bottom: 16px !important;
          }
          
          .flashcard-summary-stat {
            padding: 12px !important;
            font-size: 14px !important;
          }
          
          .flashcard-summary-actions {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .flashcard-summary-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          
          .flashcard-wrong-words {
            margin-top: 16px !important;
          }
          
          .flashcard-wrong-title {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
          
          .flashcard-wrong-list {
            gap: 8px !important;
          }
          
          .flashcard-wrong-item {
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .flashcard-header {
            padding: 14px !important;
          }
          
          .flashcard-title {
            font-size: 16px !important;
          }
          
          .flashcard-subtitle {
            font-size: 13px !important;
          }
          
          .flashcard-stat-item {
            padding: 6px 10px !important;
          }
          
          .flashcard-stat-label {
            font-size: 13px !important;
          }
          
          .flashcard-stat-value {
            font-size: 15px !important;
          }
          
          .flashcard-progress-container {
            padding: 12px !important;
          }
          
          .flashcard-progress-title {
            font-size: 15px !important;
          }
          
          .flashcard-progress-dot {
            width: 24px !important;
            height: 24px !important;
            font-size: 12px !important;
          }
          
          .flashcard-summary-container {
            padding: 12px !important;
          }
          
          .flashcard-summary-title {
            font-size: 16px !important;
          }
          
          .flashcard-summary-stat {
            padding: 10px !important;
            font-size: 13px !important;
          }
          
          .flashcard-summary-btn {
            padding: 10px 12px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default FlashcardPage;
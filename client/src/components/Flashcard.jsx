import React, { useState, useEffect, useRef } from 'react';
import { FaRedo, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const Flashcard = ({ 
  front, 
  back, 
  phonetic,
  audioUrl,
  exampleEn,
  exampleVi,
  grammar,
  onCorrect, 
  onIncorrect, 
  onNext, 
  isLast,
  totalCards,
  currentIndex 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef(null);

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
  }, []);

  // Reset audio player khi card thay đổi
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    setIsPlaying(false);
  }, [currentIndex]);

  const playAudio = async (e) => {
    e.stopPropagation();
    
    if (isPlaying) return;
    
    setIsPlaying(true);
  
    // Nếu không có audioUrl, dùng TTS
    if (!audioUrl) {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(front);
        utterance.lang = 'en-US';
        utterance.rate = playbackSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // NEW: Timeout fallback để reset state (tránh kẹt)
        const timeoutId = setTimeout(() => {
          setIsPlaying(false);
        }, 2000); // 2s đủ cho từ TOEIC ngắn/dài
        
        utterance.onend = () => {
          clearTimeout(timeoutId); // Clear timeout nếu end sớm
          setIsPlaying(false);
        };
        utterance.onerror = () => {
          clearTimeout(timeoutId);
          setIsPlaying(false);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setIsPlaying(false);
      }
      return;
    }
  
    // Play file audio nếu có URL
    try {
      // Luôn tạo audio player mới mỗi lần click
      const player = new Audio(audioUrl);
      player.preload = 'auto';
      player.playbackRate = playbackSpeed;
      audioPlayerRef.current = player;
      
      // Event: khi audio kết thúc
      player.addEventListener('ended', () => {
        setIsPlaying(false);
        audioPlayerRef.current = null; // Reset để lần sau tạo mới
      });
      
      // Event: khi file audio lỗi (404, corrupt, etc.)
      player.addEventListener('error', () => {
        setIsPlaying(false);
        audioPlayerRef.current = null; // Reset
        // Fallback TTS CHỈ KHI file thật sự lỗi
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(front);
          utterance.lang = 'en-US';
          utterance.rate = playbackSpeed;
          utterance.onend = () => setIsPlaying(false);
          speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      });
      
      // Thử play
      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.warn('Autoplay blocked');
          setIsPlaying(false);
          audioPlayerRef.current = null; // Reset
        });
      }
    } catch (err) {
      console.error('Audio error:', err);
      setIsPlaying(false);
      audioPlayerRef.current = null; // Reset
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleCorrect = () => {
    onCorrect();
    // onNext();  // Gọi ngay lập tức, loại bỏ timeout để tránh spam
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handleIncorrect = () => {
    onIncorrect();
    // onNext();  // Gọi ngay lập tức
    setIsFlipped(false);
    setShowAnswer(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: 920, margin: '0 auto', padding: 16 }}>
      {/* Card (3D flip) */}
      <div style={{ perspective: '1200px' }}>
        <div
          onClick={handleFlip}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 320,
            borderRadius: 24,
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.5s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 28px 80px rgba(0,0,0,0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
          }}
        >
          {/* Front */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            borderRadius: 24,
            padding: '32px 24px',
            textAlign: 'center',
            backfaceVisibility: 'hidden'
          }}>
            <div style={{ color: '#6366f1', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
              ENGLISH
            </div>
            <div style={{
              fontSize: 'clamp(28px, 6vw, 56px)',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 8
            }}>
              {front}
            </div>
            
            {/* Audio Controls */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              {phonetic && <span style={{ color: '#64748b', fontWeight: 600 }}>{phonetic}</span>}
              
              <button
                onClick={playAudio}
                disabled={isPlaying}
                style={{ 
                  background: isPlaying ? '#d1d5db' : '#eef2ff', 
                  color: isPlaying ? '#6b7280' : '#4338ca', 
                  border: 'none', 
                  borderRadius: 12, 
                  padding: '6px 12px', 
                  fontWeight: 700,
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isPlaying ? '⏸️ Đang phát...' : `🔊 ${audioUrl ? 'Nghe' : 'Phát âm'}`}
              </button>
              
              {/* Speed Control */}
              <select
                value={playbackSpeed}
                onChange={(e) => {
                  e.stopPropagation();
                  setPlaybackSpeed(parseFloat(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '6px 10px',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
            
            {grammar && (
              <div style={{
                marginTop: 6,
                display: 'inline-block',
                background: '#f3f4f6',
                color: '#374151',
                padding: '6px 10px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600
              }}>
                Ngữ pháp: {grammar}
              </div>
            )}
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>(Click để xem answer)</div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            borderRadius: 24,
            padding: '32px 24px',
            textAlign: 'center',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden'
          }}>
            <div style={{ color: '#6366f1', fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>
              VIETNAMESE
            </div>
            <div style={{
              fontSize: 'clamp(28px, 6vw, 56px)',
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 8
            }}>
              {back}
            </div>
            {(exampleEn || exampleVi) && (
              <div style={{ color: '#475569', fontStyle: 'italic', marginTop: 8 }}>
                {exampleEn ? exampleEn : ''}{exampleVi ? ` (${exampleVi})` : ''}
              </div>
            )}
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>(Click để lật lại)</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginTop: 16, background: 'white', borderRadius: 16, padding: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99 }}>
          <div style={{ 
            width: `${((currentIndex + 1)/totalCards)*100}%`, 
            height: 8, 
            background: 'linear-gradient(90deg,#6366f1,#7c3aed)', 
            borderRadius: 99,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ marginTop: 8, color: '#64748b', fontWeight: 700 }}>{currentIndex + 1} / {totalCards}</div>
      </div>

      {/* Action Buttons */}
      {showAnswer && (
        <div style={{ 
          marginTop: 16, 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'center',
          flexWrap: 'wrap'  // Để button responsive
        }}>
          <button
            onClick={handleIncorrect}
            style={{
              flex: 1,
              maxWidth: 200,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              padding: '14px 24px',
              fontWeight: 700,
              fontSize: 16,
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
            ❌ Chưa nhớ
          </button>
          <button
            onClick={handleCorrect}
            style={{
              flex: 1,
              maxWidth: 200,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              padding: '14px 24px',
              fontWeight: 700,
              fontSize: 16,
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
            ✅ Đã nhớ
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
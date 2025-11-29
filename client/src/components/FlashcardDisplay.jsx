import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaVolumeUp, FaEdit, FaTrash, FaRandom, FaPlay, FaPause, FaStop } from 'react-icons/fa';

const FlashcardDisplay = ({ 
  cards, 
  currentIndex, 
  onBack, 
  onNext, 
  onPrevious, 
  onUpdate, 
  onDelete, 
  onPlayAudio 
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');

  const currentCard = cards[currentIndex];

  // Cleanup TTS when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text, type = 'word') => {
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on type
    if (type === 'word') {
      utterance.lang = 'en-US'; // English for words
    } else if (type === 'definition') {
      utterance.lang = 'vi-VN'; // Vietnamese for definitions
    } else {
      utterance.lang = 'en-US'; // English for examples
    }
    
    utterance.rate = 0.8; // Slightly slower for better understanding
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText('');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingText('');
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setIsFlipped(false);
    onNext();
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setIsFlipped(false);
    onPrevious();
  };

  const handlePlayAudio = () => {
    if (currentCard.audioUrl) {
      onPlayAudio(currentCard.audioUrl);
    }
  };

  const handleEdit = () => {
    const newWord = prompt('Nhập từ mới:', currentCard.word);
    const newDefinition = prompt('Nhập định nghĩa mới:', currentCard.definition);
    if (newWord && newDefinition) {
      onUpdate(currentCard.id, {
        word: newWord,
        definition: newDefinition
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa flashcard này?')) {
      onDelete(currentCard.id);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 15px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>

          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            {currentIndex + 1} / {cards.length}
          </div>

          {/* TTS Control Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 15px',
                borderRadius: '12px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              <FaStop size={14} /> Dừng TTS
            </button>
          )}
        </div>

        {/* Main Flashcard */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '60px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '30px',
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Card Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            {!showAnswer ? (
              // Front of card (Word)
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <h1 style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {currentCard.word}
                  </h1>
                  
                  {/* TTS Button for Word */}
                  <button
                    onClick={() => speakText(currentCard.word, 'word')}
                    style={{
                      background: isSpeaking && speakingText === currentCard.word 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isSpeaking && speakingText === currentCard.word 
                        ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                        : '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {isSpeaking && speakingText === currentCard.word ? (
                      <FaStop size={20} />
                    ) : (
                      <FaVolumeUp size={20} />
                    )}
                  </button>

                  {/* Audio URL Button (if exists) */}
                  {currentCard.audioUrl && (
                    <button
                      onClick={handlePlayAudio}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                      }}
                    >
                      <FaPlay size={20} />
                    </button>
                  )}
                </div>

                {currentCard.phonetic && (
                  <p style={{
                    color: '#6b7280',
                    fontSize: '18px',
                    fontStyle: 'italic',
                    marginBottom: '20px'
                  }}>
                    {currentCard.phonetic}
                  </p>
                )}
              </div>
            ) : (
              // Back of card (Definition)
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#374151',
                    margin: 0
                  }}>
                    Định nghĩa:
                  </h2>
                  
                  {/* TTS Button for Definition */}
                  <button
                    onClick={() => speakText(currentCard.definition, 'definition')}
                    style={{
                      background: isSpeaking && speakingText === currentCard.definition 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isSpeaking && speakingText === currentCard.definition 
                        ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                        : '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {isSpeaking && speakingText === currentCard.definition ? (
                      <FaStop size={16} />
                    ) : (
                      <FaVolumeUp size={16} />
                    )}
                  </button>
                </div>
                
                <p style={{
                  fontSize: '24px',
                  color: '#1f2937',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  {currentCard.definition}
                </p>

                {currentCard.example && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <p style={{
                        color: '#0369a1',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        Ví dụ:
                      </p>
                      
                      {/* TTS Button for Example */}
                      <button
                        onClick={() => speakText(currentCard.example, 'example')}
                        style={{
                          background: isSpeaking && speakingText === currentCard.example 
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                            : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          color: 'white',
                          border: 'none',
                          width: '35px',
                          height: '35px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isSpeaking && speakingText === currentCard.example 
                            ? '0 4px 15px rgba(239, 68, 68, 0.4)' 
                            : '0 4px 15px rgba(6, 182, 212, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {isSpeaking && speakingText === currentCard.example ? (
                          <FaStop size={14} />
                        ) : (
                          <FaVolumeUp size={14} />
                        )}
                      </button>
                    </div>
                    
                    <p style={{
                      color: '#0369a1',
                      fontSize: '16px',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      "{currentCard.example}"
                    </p>
                  </div>
                )}

                {currentCard.note && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    padding: '15px',
                    marginTop: '15px'
                  }}>
                    <p style={{
                      color: '#92400e',
                      fontSize: '14px',
                      margin: 0
                    }}>
                      <strong>Ghi chú:</strong> {currentCard.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '20px'
          }}>
            <button
              onClick={handleEdit}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
              }}
            >
              <FaEdit size={12} /> Chỉnh sửa
            </button>

            <button
              onClick={handleDelete}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
              }}
            >
              <FaTrash size={12} /> Xóa
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <button
            onClick={handlePrevious}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '15px 25px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <FaArrowLeft /> Trước
          </button>

          <button
            onClick={handleFlip}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '20px 40px',
              borderRadius: '16px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
            }}
          >
            {showAnswer ? 'Xem từ' : 'Xem định nghĩa'}
          </button>

          <button
            onClick={handleNext}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '15px 25px',
              borderRadius: '12px',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Sau <FaArrowRight />
          </button>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            {currentIndex + 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDisplay;

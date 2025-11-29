import React, { useState, useEffect, useContext } from 'react';
import { FaArrowLeft, FaEdit, FaPlus, FaLayerGroup, FaPlay, FaRandom, FaVolumeUp, FaTrash, FaStop } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateListModal from './CreateListModal';
import CreateFlashcardModal from './CreateFlashcardModal';
import BulkCreateModal from './BulkCreateModal';
import FlashcardDisplay from './FlashcardDisplay';

const ListManagement = ({ list, onBack, onUpdate, onDelete, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFlashcardDisplay, setShowFlashcardDisplay] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [speakingCard, setSpeakingCard] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [randomMode, setRandomMode] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set()); // Track cards that have been viewed
  const [sessionStartIndex, setSessionStartIndex] = useState(0); // Track starting index when session begins

  useEffect(() => {
    fetchCards();
  }, [list.id]);

  // Cleanup TTS when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flashcard/lists/${list.id}/cards`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (cardData) => {
    try {
      const response = await fetch(`/api/flashcard/lists/${list.id}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cardData)
      });

      if (response.ok) {
        const newCard = await response.json();
        setCards(prev => [...prev, newCard]);
        setShowCreateCardModal(false);
        // Notify parent to refresh list count
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleBulkCreate = async (cardsData) => {
    try {
      const response = await fetch(`/api/flashcard/lists/${list.id}/cards/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cards: cardsData })
      });

      if (response.ok) {
        const newCards = await response.json();
        setCards(prev => [...prev, ...newCards]);
        setShowBulkModal(false);
        // Notify parent to refresh list count
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error bulk creating cards:', error);
    }
  };

  const handleUpdateCard = async (cardId, updatedData) => {
    try {
      const response = await fetch(`/api/flashcard/cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setCards(prev => prev.map(card => 
          card.id === cardId ? updatedCard : card
        ));
      }
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setShowEditCardModal(true);
  };

  const handleEditCardSubmit = async (updatedData) => {
    try {
      await handleUpdateCard(editingCard.id, updatedData);
      setShowEditCardModal(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa flashcard này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flashcard/cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCards(prev => prev.filter(card => card.id !== cardId));
        // Notify parent to refresh list count
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleStartLearning = () => {
    if (cards.length === 0) {
      alert('List này chưa có flashcard nào. Vui lòng thêm từ trước khi học.');
      return;
    }
    setCurrentCardIndex(0);
    setSessionStartIndex(0);
    setViewedCards(new Set());
    setShowFlashcardDisplay(true);
  };

  const handleBackFromFlashcard = () => {
    // Calculate EXP when returning from flashcard display
    if (user?.id && viewedCards.size > 0 && cards.length > 0) {
      const totalCards = cards.length;
      const viewedCount = viewedCards.size;
      const percentage = Math.round((viewedCount / totalCards) * 100);
      
      // Calculate EXP: 10 EXP per card viewed + bonus for viewing all cards
      const baseExp = viewedCount * 10;
      let bonusExp = 0;
      
      if (percentage === 100) {
        bonusExp = 30; // Bonus for viewing all cards
      } else if (percentage >= 80) {
        bonusExp = 20; // Bonus for viewing most cards
      } else if (percentage >= 60) {
        bonusExp = 10; // Bonus for viewing majority
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
    
    setShowFlashcardDisplay(false);
    setViewedCards(new Set());
  };

  const handleFlashcardNext = () => {
    setCurrentCardIndex(prev => {
      const nextIndex = (prev + 1) % cards.length;
      return nextIndex;
    });
  };

  const handleFlashcardPrevious = () => {
    setCurrentCardIndex(prev => {
      const prevIndex = prev === 0 ? cards.length - 1 : prev - 1;
      return prevIndex;
    });
  };

  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const speakText = (text, cardId) => {
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // English pronunciation
    utterance.rate = 0.8; // Slightly slower for better understanding
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingCard(cardId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingCard(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingCard(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingCard(null);
  };

  // Track current card as viewed when flashcard display is shown or when navigating
  useEffect(() => {
    if (showFlashcardDisplay && cards.length > 0 && cards[currentCardIndex] && cards[currentCardIndex].id) {
      setViewedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(cards[currentCardIndex].id);
        return newSet;
      });
    }
  }, [showFlashcardDisplay, currentCardIndex, cards]);

  if (showFlashcardDisplay) {
    return (
      <FlashcardDisplay
        cards={randomMode ? [...cards].sort(() => Math.random() - 0.5) : cards}
        currentIndex={currentCardIndex}
        onBack={handleBackFromFlashcard}
        onNext={handleFlashcardNext}
        onPrevious={handleFlashcardPrevious}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        onPlayAudio={handlePlayAudio}
      />
    );
  }

  if (loading) {
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
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
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
          <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '600' }}>
            Đang tải flashcard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={onBack}
              style={{
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
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '10px'
          }}>
            Flashcards: {list.title}
          </h1>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '16px',
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
              <FaEdit /> Chỉnh sửa
            </button>

            <button
              onClick={() => setShowCreateCardModal(true)}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
              }}
            >
              <FaPlus /> Thêm từ mới
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.4)';
              }}
            >
              <FaLayerGroup /> Tạo hàng loạt
            </button>
          </div>

          {/* Language Notice */}
          <div style={{
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#0369a1',
              fontSize: '14px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              Chú ý: nếu như list từ vựng của bạn là tiếng Trung, Nhật, hay Hàn, click vào nút chỉnh sửa để thay đổi ngôn ngữ. Audio mặc định là tiếng Anh-Anh và Anh-Mỹ. Các ngôn ngữ khác chỉ hỗ trợ trên máy tính.
            </p>
          </div>

          {/* Learning Options */}
          {cards.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleStartLearning}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
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
                <FaPlay /> Luyện tập flashcards
              </button>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                <input
                  type="checkbox"
                  checked={randomMode}
                  onChange={(e) => setRandomMode(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#6366f1'
                  }}
                />
                <FaRandom />
                Xem ngẫu nhiên
              </label>

              <span style={{
                color: '#6b7280',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                List có {cards.length} từ
              </span>
            </div>
          )}
        </div>

        {/* Cards Display */}
        {cards.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '60px 40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px'
            }}>📚</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '10px'
            }}>
              Chưa có flashcard nào trong list từ này.
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '30px'
            }}>
              Hãy thêm từ mới để bắt đầu học!
            </p>
            <button
              onClick={() => setShowCreateCardModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
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
              Thêm từ đầu tiên
            </button>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '30px'
            }}>
              Danh sách flashcard ({cards.length} từ)
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '25px',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {/* Card Number */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#6366f1',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>

                  {/* Word */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {card.word}
                    </h4>
                    {/* TTS Button for word - positioned right next to the word */}
                    <button
                      onClick={() => {
                        if (speakingCard === card.id && isSpeaking) {
                          stopSpeaking();
                        } else {
                          speakText(card.word, card.id);
                        }
                      }}
                      style={{
                        background: speakingCard === card.id && isSpeaking 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        marginLeft: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {speakingCard === card.id && isSpeaking ? (
                        <FaStop size={12} />
                      ) : (
                        <FaVolumeUp size={12} />
                      )}
                    </button>
                    
                    {/* Original audio button if available */}
                    {card.audioUrl && (
                      <button
                        onClick={() => handlePlayAudio(card.audioUrl)}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <FaVolumeUp size={14} />
                      </button>
                    )}
                  </div>

                  {/* Definition */}
                  <div style={{
                    marginBottom: '15px'
                  }}>
                    <p style={{
                      color: '#374151',
                      fontSize: '16px',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {card.definition}
                    </p>
                  </div>

                  {/* Examples */}
                  {card.example && (
                    <div style={{
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <p style={{
                          color: '#0369a1',
                          fontSize: '14px',
                          margin: 0,
                          fontStyle: 'italic',
                          flex: 1
                        }}>
                          "{card.example}"
                        </p>
                        <button
                          onClick={() => {
                            if (speakingCard === `example-${card.id}` && isSpeaking) {
                              stopSpeaking();
                            } else {
                              speakText(card.example, `example-${card.id}`);
                            }
                          }}
                          style={{
                            background: speakingCard === `example-${card.id}` && isSpeaking 
                              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                              : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            marginLeft: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                          }}
                        >
                          {speakingCard === `example-${card.id}` && isSpeaking ? (
                            <FaStop size={12} />
                          ) : (
                            <FaVolumeUp size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => handleEditCard(card)}
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <FaEdit size={10} /> Sửa
                    </button>

                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      <FaTrash size={10} /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <CreateListModal
          editData={list}
          onClose={() => setShowEditModal(false)}
          onCreate={(formData) => onUpdate(list.id, formData)}
        />
      )}

      {showCreateCardModal && (
        <CreateFlashcardModal
          onClose={() => setShowCreateCardModal(false)}
          onCreate={handleCreateCard}
          listTitle={list?.title || ''}
        />
      )}

      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onCreate={handleBulkCreate}
        />
      )}

      {showEditCardModal && editingCard && (
        <CreateFlashcardModal
          editData={{ ...editingCard, listTitle: list?.title || '' }}
          onClose={() => {
            setShowEditCardModal(false);
            setEditingCard(null);
          }}
          onCreate={handleEditCardSubmit}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ListManagement;

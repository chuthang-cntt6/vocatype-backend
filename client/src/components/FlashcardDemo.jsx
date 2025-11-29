import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CreateListModal from './CreateListModal';
import ListManagement from './ListManagement';
import aiService from '../services/aiService';
import { FaPlus, FaBook, FaSearch, FaRandom, FaRobot, FaSpinner } from 'react-icons/fa';
import PageBreadcrumb from './PageBreadcrumb';

const FlashcardDemo = () => {
  const { user } = useContext(AuthContext);
  const [lists, setLists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLists, setFilteredLists] = useState([]);
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    fetchLists();
    // Kiểm tra xem AI service có available không
    setAiEnabled(aiService.isAvailable());
  }, []);

  // Effect để handle AI search
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setFilteredLists(lists);
        return;
      }

      if (aiEnabled) {
        setIsAISearching(true);
        try {
          const aiResults = await aiService.intelligentSearch(searchTerm, lists);
          setFilteredLists(aiResults);
        } catch (error) {
          console.error('AI Search failed, falling back to normal search:', error);
          // Fallback to normal search
          const normalResults = lists.filter(list => 
            list.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredLists(normalResults);
        } finally {
          setIsAISearching(false);
        }
      } else {
        // Normal search when AI is not available
        const normalResults = lists.filter(list => 
          list.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredLists(normalResults);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, lists, aiEnabled]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flashcard/lists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLists(data);
        setFilteredLists(data); // Initialize filtered lists
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (listData) => {
    try {
      const response = await fetch('/api/flashcard/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(listData)
      });

      if (response.ok) {
        const newList = await response.json();
        setLists(prev => [...prev, newList]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const response = await fetch(`/api/flashcard/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setLists(prev => prev.filter(list => list.id !== listId));
        if (selectedList && selectedList.id === listId) {
          setSelectedList(null);
        }
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleUpdateList = async (listId, updatedData) => {
    try {
      const response = await fetch(`/api/flashcard/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedList = await response.json();
        setLists(prev => prev.map(list => 
          list.id === listId ? updatedList : list
        ));
        if (selectedList && selectedList.id === listId) {
          setSelectedList(updatedList);
        }
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  // Removed old filteredLists logic - now handled in useEffect

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
       // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
            Đang tải danh sách flashcard...
          </p>
        </div>
      </div>
    );
  }

  if (selectedList) {
    return (
      <ListManagement 
        list={selectedList}
        onBack={() => setSelectedList(null)}
        onUpdate={handleUpdateList}
        onDelete={handleDeleteList}
        onRefresh={fetchLists}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
     // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 0 }}>
              <PageBreadcrumb 
                backgroundColor="transparent"
                textColor="#6b7280"
                currentTextColor="#6366f1"
                items={[
                  { label: 'Trang chủ', path: '/' },
                  { label: 'Flashcards', path: '/flashcard-demo' }
                ]}
              />
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Flashcards
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '18px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            Quản lý và học từ vựng hiệu quả
          </p>

          {/* Search Bar */}
          <div style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '18px'
              }} />
              <input
                type="text"
                placeholder={aiEnabled ? "Tìm kiếm thông minh với AI..." : "Tìm kiếm list từ..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 15px 15px 50px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  background: aiEnabled ? 'linear-gradient(135deg, #f8fafc, #f1f5f9)' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              
              {/* AI Search Indicator */}
              {isAISearching && (
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6366f1',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  <FaSpinner style={{
                    animation: 'spin 1s linear infinite',
                    fontSize: '16px'
                  }} />
                  <FaRobot style={{ fontSize: '16px' }} />
                  AI đang tìm kiếm...
                </div>
              )}
              
              {/* AI Status Indicator */}
              {!isAISearching && aiEnabled && searchTerm && (
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  <FaRobot style={{ fontSize: '14px' }} />
                  AI
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              <FaPlus /> Tạo list từ
            </button>
          </div>
        </div>

        {/* Learning Section */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaBook style={{ color: '#6366f1' }} />
            Đang học:
          </h2>
          
          {lists.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px'
              }}>📚</div>
              <p style={{
                fontSize: '18px',
                marginBottom: '20px'
              }}>
                Bạn chưa học list từ nào. Khám phá ngay hoặc bắt đầu tạo các list từ mới.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
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
                Tạo list từ
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {filteredLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '25px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '10px'
                  }}>
                    {list.title}
                  </h3>
                  
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}>
                    {list.description || 'Không có mô tả'}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {list.language}
                    </span>
                    <span style={{
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      {list.card_count || 0} từ
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6366f1',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaRandom />
                    Bắt đầu học
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Created Lists Section */}
        {lists.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              List từ đã tạo:
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {filteredLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  style={{
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '15px'
                  }}>📚</div>
                  
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '10px'
                  }}>
                    {list.title}
                  </h3>
                  
                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}>
                    {list.card_count || 0} từ
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#6366f1',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    <FaRandom />
                    Học ngay
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateListModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateList}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes aiPulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
        
        .ai-indicator {
          animation: aiPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FlashcardDemo;

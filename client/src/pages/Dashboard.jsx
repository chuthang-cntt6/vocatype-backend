// Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';

// CSS styles for dropdown animation
const dropdownStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }
  
  .dropdown-enter {
    animation: slideIn 0.3s ease forwards;
  }
  
  .dropdown-exit {
    animation: slideOut 0.3s ease forwards;
  }
  
  /* CSS đã được chuyển vào index.css để tránh xung đột */
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = dropdownStyles;
  document.head.appendChild(styleSheet);
}
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaMedal, FaBookOpen, FaUserFriends, FaTrophy, FaCheckCircle, FaChalkboardTeacher, FaCrown, FaHistory, FaKeyboard, FaFire, FaChartLine, FaStar, FaRocket } from 'react-icons/fa';
import ProgressBar from '../components/ProgressBar';
import BadgeList from '../components/BadgeList';
import PageBreadcrumb from '../components/PageBreadcrumb';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLearnDropdown, setShowLearnDropdown] = useState(false);
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    Promise.all([
      fetch(`/api/learner/${user.id}/dashboard`, {
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
      }).then(r => r.json()),
      fetch('/api/teacher/leaderboard').then(r => r.json())
    ]).then(([dashboardData, leaderboardData]) => {
      if (dashboardData && dashboardData.info && user.avatar_url) {
        dashboardData.info.avatar_url = user.avatar_url;
      }
      setDashboard(dashboardData);
      setLeaderboard(leaderboardData);
      setLoading(false);
    }).catch(err => {
      setError('Lỗi tải dữ liệu: ' + err.message);
      setLoading(false);
    });
  }, [user]);

  // Fetch today's learning summary to compute unique vocabulary learned (like Roadmap)
  useEffect(() => {
    const loadLearningSummary = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/learner/${user.id}/learning-summary`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        });
        if (res.ok) {
          const data = await res.json();
          setLearnSummary({ summary: data?.summary || [], vocabDetails: data?.vocabDetails || [] });
        }
      } catch (_) {}
    };
    loadLearningSummary();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLearnDropdown && !event.target.closest('[data-dropdown]')) {
        setShowLearnDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLearnDropdown]);

  // Handler functions for buttons
  const handleStartPractice = () => {
    navigate('/typing-practice');
  };

  const handleLearnMore = () => {
    navigate('/learn');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleFlashcard = () => {
    navigate('/flashcard-demo');
  };

  // Slideshow data
  const slides = [
    {
      id: 1,
      title: "Luyện gõ phím thông minh",
      description: "Hệ thống AI tự động điều chỉnh độ khó phù hợp với trình độ của bạn",
      image: "🎯",
      color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      id: 2,
      title: "Theo dõi tiến độ chi tiết",
      description: "Báo cáo WPM, độ chính xác và sự tiến bộ qua từng ngày",
      image: "📊",
      color: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      id: 3,
      title: "Cạnh tranh và học hỏi",
      description: "Tham gia bảng xếp hạng, nhận huy hiệu và cạnh tranh với bạn bè",
      image: "🏆",
      color: "linear-gradient(135deg, #4facfe, #00f2fe)"
    },
    {
      id: 4,
      title: "Kho từ vựng phong phú",
      description: "Hàng nghìn từ vựng Tiếng Anh, Tiếng Việt và chuyên ngành",
      image: "📚",
      color: "linear-gradient(135deg, #43e97b, #38f9d7)"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user, slides.length]);

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 0,
        margin: 0
      }}>
        {/* Hero Section */}
        <div className="hero-section" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderRadius: 0,
          padding: '80px 20px',
          marginBottom: 0,
          backdropFilter: 'blur(20px)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div className="hero-grid" style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Left Content */}
            <div>
              <div className="hero-title" style={{
                fontSize: 48,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #1e293b, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 24,
                lineHeight: 1.2,
                letterSpacing: '-1px'
              }}>
                LUYỆN ĐỀ THI ONLINE KHÔNG GIỚI HẠN
              </div>
              
              <div style={{
                fontSize: 20,
                color: '#64748b',
                marginBottom: 32,
                lineHeight: 1.6
              }}>
                Nâng cao trình độ tiếng Anh của bạn, 
                theo dõi tiến độ và cạnh tranh với bạn bè.
              </div>
              
              {/* Features List */}
              <div style={{ marginBottom: 40 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 18,
                  color: '#334155'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                    borderRadius: '50%',
                    marginRight: 16
                  }}></div>
                  Kho từ vựng phong phú: Tiếng Anh, Tiếng Việt, Chuyên ngành...
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 18,
                  color: '#334155'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                    borderRadius: '50%',
                    marginRight: 16
                  }}></div>
                  Giao diện thân thiện, giống thi thật
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 18,
                  color: '#334155'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                    borderRadius: '50%',
                    marginRight: 16
                  }}></div>
                  Tự chọn chế độ và thời gian luyện tập
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 18,
                  color: '#334155'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                    borderRadius: '50%',
                    marginRight: 16
                  }}></div>
                  Báo cáo chi tiết + đánh giá kỹ năng
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 16,
                  fontSize: 18,
                  color: '#334155'
                }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                    borderRadius: '50%',
                    marginRight: 16
                  }}></div>
                  Hệ thống huy hiệu và xếp hạng
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                gap: 20,
                alignItems: 'center'
              }}>
                <button 
                  onClick={handleStartPractice}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 16,
                    padding: '16px 32px',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.3)';
                  }}
                >
                  Bắt đầu luyện tập ngay
                </button>
                <button 
                  onClick={handleLearnMore}
                  style={{
                    background: 'transparent',
                    color: '#6366f1',
                    border: '2px solid #6366f1',
                    borderRadius: 16,
                    padding: '14px 30px',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#6366f1';
                    e.target.style.color = '#fff';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6366f1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            
            {/* Right Content - Slideshow */}
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400
            }}>
              {/* Slideshow Container */}
              <div style={{
                width: 450,
                height: 350,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
              }}>
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: slide.color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 40,
                      transform: `translateX(${(index - currentSlide) * 100}%)`,
                      transition: 'transform 0.8s ease-in-out',
                      opacity: index === currentSlide ? 1 : 0.7
                    }}
                  >
                    <div style={{
                      fontSize: 80,
                      marginBottom: 20,
                      animation: 'bounce 2s infinite'
                    }}>
                      {slide.image}
                    </div>
                    <div style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#fff',
                      marginBottom: 16,
                      textAlign: 'center'
                    }}>
                      {slide.title}
                    </div>
                    <div style={{
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: 'center',
                      lineHeight: 1.6
                    }}>
                      {slide.description}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Slide Indicators */}
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 8
              }}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: 'none',
                      background: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                style={{
                  position: 'absolute',
                  left: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.9)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <span style={{ fontSize: 18, color: '#6366f1' }}>‹</span>
              </button>
              
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                style={{
                  position: 'absolute',
                  right: -20,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.9)';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <span style={{ fontSize: 18, color: '#6366f1' }}>›</span>
              </button>
              
              {/* Floating Badges */}
              <div style={{
                position: 'absolute',
                top: 20,
                right: -20,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 800,
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                animation: 'float 3s ease-in-out infinite'
              }}>
                1000+ từ vựng
              </div>
              <div style={{
                position: 'absolute',
                bottom: 80,
                left: -30,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 800,
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                animation: 'float 3s ease-in-out infinite 1.5s'
              }}>
                10K+ users
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="features-section" style={{
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 16
            }}>
              Tại sao chọn VocaType?
            </div>
            <div style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 60
            }}>
              Hệ thống luyện gõ phím thông minh và hiệu quả nhất
            </div>
            
            <div className="responsive-grid" style={{
              gap: 40
            }}>
              <div 
                onClick={handleStartPractice}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 40,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 48,
                  marginBottom: 20
                }}>🎯</div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 16
                }}>
                  Luyện tập thông minh
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  Hệ thống AI tự động điều chỉnh độ khó và gợi ý từ vựng phù hợp với trình độ của bạn
                </div>
              </div>
              
              <div 
                onClick={() => navigate('/history')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 40,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 48,
                  marginBottom: 20
                }}>📊</div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 16
                }}>
                  Theo dõi tiến độ
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  Báo cáo chi tiết về tốc độ gõ, độ chính xác và sự tiến bộ qua từng ngày
                </div>
              </div>
              
              <div 
                onClick={() => navigate('/badges')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 40,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 48,
                  marginBottom: 20
                }}>🏆</div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 16
                }}>
                  Cạnh tranh vui vẻ
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  Tham gia bảng xếp hạng, nhận huy hiệu và cạnh tranh với bạn bè
                </div>
              </div>
              
              <div 
                onClick={handleFlashcard}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: 40,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: 48,
                  marginBottom: 20
                }}>🎴</div>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 16
                }}>
                  Học với Flashcard
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  Học từ vựng hiệu quả với hệ thống flashcard thông minh
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 16
            }}>
              Thành tựu của chúng tôi
            </div>
            <div style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 60
            }}>
              Những con số ấn tượng từ cộng đồng VocaType
            </div>
            
            <div className="responsive-grid" style={{
              gap: 40
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 40,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 8
                }}>
                  10,000+
                </div>
                <div style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600
                }}>
                  Người dùng tích cực
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 40,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 8
                }}>
                  1M+
                </div>
                <div style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600
                }}>
                  Từ đã luyện tập
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 40,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 8
                }}>
                  95%
                </div>
                <div style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600
                }}>
                  Tỷ lệ hài lòng
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 40,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: 8
                }}>
                  24/7
                </div>
                <div style={{
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600
                }}>
                  Hỗ trợ người dùng
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div style={{
          padding: '80px 20px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 16
            }}>
              Người dùng nói gì về VocaType?
            </div>
            <div style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 60
            }}>
              Những phản hồi tích cực từ cộng đồng
            </div>
            
            <div className="responsive-grid" style={{
              gap: 30
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 30,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 24,
                  color: '#facc15',
                  marginBottom: 16
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                  fontStyle: 'italic'
                }}>
                  "VocaType đã giúp tôi cải thiện tốc độ gõ phím từ 30 WPM lên 80 WPM chỉ trong 2 tháng. Giao diện đẹp và dễ sử dụng!"
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}>
                    A
                  </div>
                  <div>
                    <div style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      Anh Minh
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 14
                    }}>
                      Sinh viên IT
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 30,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 24,
                  color: '#facc15',
                  marginBottom: 16
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                  fontStyle: 'italic'
                }}>
                  "Hệ thống huy hiệu và xếp hạng rất thú vị, tạo động lực để tôi luyện tập mỗi ngày. Cảm ơn VocaType!"
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}>
                    L
                  </div>
                  <div>
                    <div style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      Linh Trang
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 14
                    }}>
                      Nhân viên văn phòng
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 30,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  fontSize: 24,
                  color: '#facc15',
                  marginBottom: 16
                }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                  fontStyle: 'italic'
                }}>
                  "Kho từ vựng phong phú và đa dạng, giúp tôi học thêm nhiều từ mới trong khi luyện gõ phím."
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}>
                    H
                  </div>
                  <div>
                    <div style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      Hoàng Nam
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 14
                    }}>
                      Giáo viên tiếng Anh
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="cta-section" style={{
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 800,
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 16
            }}>
              Sẵn sàng bắt đầu luyện tập?
            </div>
            <div style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 40
            }}>
              Tham gia cùng hàng nghìn người dùng đang cải thiện kỹ năng gõ phím mỗi ngày
            </div>
            <div style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={handleSignUp}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '16px 32px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
                }}
              >
                Đăng ký miễn phí
              </button>
              <button 
                onClick={handleLogin}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 16,
                  padding: '14px 30px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '60px 20px 20px',
          color: '#fff'
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto'
          }}>
            <div className="responsive-grid" style={{
              gap: 40,
              marginBottom: 40
            }}>
              {/* Company Info */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 20
                  }}>
                    V
                  </div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#fff'
                  }}>
                    VocaType
                  </div>
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.6,
                  marginBottom: 20
                }}>
                  Nền tảng học tiếng Anh thông minh và hiệu quả nhất Việt Nam. 
                  Giúp bạn cải thiện kỹ và hiệu quả.
                </div>
                <div style={{
                  display: 'flex',
                  gap: 16
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    📘
                  </div>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    📷
                  </div>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    🐦
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 20
                }}>
                  Liên kết nhanh
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setShowLearnDropdown(!showLearnDropdown)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 16,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'color 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#fff'}
                      onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                    >
                      Học tập
                      <span style={{
                        transform: showLearnDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        fontSize: '12px'
                      }}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div 
                      data-dropdown 
                      className={showLearnDropdown ? 'dropdown-enter' : 'dropdown-exit'}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden',
                        zIndex: 1000,
                        marginTop: '8px'
                      }}>
                      <button 
                        onClick={() => {
                          navigate('/learn');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📚 Học từ vựng
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/flashcard');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.15s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🃏 Flashcard
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/flashcard-demo');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.2s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🎯 Flashcard Demo
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/exam');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.2s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🎓 Thi thử (gõ phản xạ)
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/toeic-practice');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.25s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📝 Luyện đề TOEIC (trắc nghiệm)
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/dictation');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.3s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        🎧 Luyện Dictation TOEIC
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/question-bank');
                          setShowLearnDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: showLearnDropdown ? 1 : 0,
                          transform: showLearnDropdown ? 'translateX(0)' : 'translateX(-30px)',
                          transitionDelay: showLearnDropdown ? '0.35s' : '0s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        📋 Ngân hàng đề
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/typing-practice')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 16,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    Luyện gõ phím
                  </button>
                  <button 
                    onClick={() => navigate('/history')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 16,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    Lịch sử
                  </button>
                  <button 
                    onClick={() => navigate('/badges')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 16,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    Huy hiệu
                  </button>
                </div>
              </div>
              
              {/* Support */}
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 20
                }}>
                  Thông tin trang web
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 16
                  }}>
                    Email: chuthangzed@gmail.com
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 16
                  }}>
                    Điện thoại liên hệ/Hotline: 079 227 3898
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 16
                  }}>
                    Hỗ trợ: Chat trực tuyến 24/7
                  </div>
                  {/* <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 16
                  }}>
                    📖 Hướng dẫn sử dụng
                  </div> */}
                </div>
              </div>
              
              {/* Newsletter */}
              <div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 20
                }}>
                  Đăng ký nhận tin
                </div>
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 20
                }}>
                  Nhận thông báo về tính năng mới và mẹo luyện tập
                </div>
                <div style={{
                  display: 'flex',
                  gap: 8
                }}>
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: 14
                    }}
                  />
                  <button style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20
            }}>
              <div style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 14
              }}>
                © 2024 VocaType. Tất cả quyền được bảo lưu.
              </div>
              <div style={{
                display: 'flex',
                gap: 24
              }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}>
                  Điều khoản sử dụng
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}>
                  Chính sách bảo mật
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'color 0.3s ease'
                }}>
                  Cookie
                </button>
              </div>
            </div>
          </div>
        </footer>
        
        {/* CSS Animations */}
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .hero-section {
            animation: fadeInUp 0.8s ease-out;
          }
          
          .features-section {
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }
          
          .cta-section {
            animation: fadeInUp 0.8s ease-out 0.4s both;
          }
          
          @media (max-width: 768px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
              text-align: center !important;
            }
            
            .hero-title {
              font-size: 36px !important;
            }
            
            .features-grid {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
          }
        `}</style>
      </div>
    );
  }
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!dashboard) return <div>Không có dữ liệu dashboard.</div>;

  const { info, stats, badges, assignments, history } = dashboard;

  const getTypeLabel = (h) => {
    const t = (h?.type || '').toString();
    if (t === 'flashcard') return 'Flashcard';
    if (t === 'dictation') return 'Dictation';
    if (t === 'exam') return 'Đề thi';
    if (t === 'vocab') return 'Từ vựng';
    return 'Hoạt động';
  };

  const getMetric = (h) => {
    const t = (h?.type || '').toString();
    if (t === 'flashcard' && Number.isFinite(Number(h?.cards_reviewed))) {
      return { value: Number(h.cards_reviewed), label: 'Thẻ đã ôn' };
    }
    if (t === 'dictation') {
      if (Number.isFinite(Number(h?.sentences_correct)) && Number.isFinite(Number(h?.sentences_total))) {
        return { value: `${h.sentences_correct}/${h.sentences_total}`, label: 'Câu đúng' };
      }
      if (Number.isFinite(Number(h?.sentences_practiced))) {
        return { value: Number(h.sentences_practiced), label: 'Câu đã luyện' };
      }
    }
    if (t === 'exam') {
      if (Number.isFinite(Number(h?.score))) {
        return { value: Number(h.score), label: 'Điểm' };
      }
      if (Number.isFinite(Number(h?.correct)) && Number.isFinite(Number(h?.total))) {
        return { value: `${h.correct}/${h.total}`, label: 'Câu đúng' };
      }
    }
    if (Number.isFinite(Number(h?.words_typed))) {
      return { value: Number(h.words_typed), label: 'Từ đã học' };
    }
    return { value: '-', label: 'Hoạt động' };
  };

  return (
    <div className="dashboard-container" style={{ margin: '0 auto', padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Simple title for home page
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        Trang chủ
      </div> */}

      {/* Hero Section */}
      <div className="hero-section" style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)', 
        borderRadius: 32, 
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)', 
        padding: 48, 
        marginBottom: 32,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
          borderRadius: '50%',
          opacity: 0.1,
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: 'linear-gradient(45deg, #22d3ee, #06b6d4)',
          borderRadius: '50%',
          opacity: 0.1,
          zIndex: 0
        }}></div>
        
        {/* Header + Info */}
        <div className="hero-content" style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user?.avatar_url || info?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || info?.name || 'User')} 
              alt="avatar" 
              style={{ 
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '4px solid #fff', 
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
                transition: 'transform 0.3s ease'
              }} 
            />
            <div style={{
              position: 'absolute',
              bottom: 5,
              right: 5,
              background: 'linear-gradient(45deg, #22c55e, #16a34a)',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
            }}>
              <FaRocket style={{ color: '#fff', fontSize: 14 }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="hero-title" style={{ 
              fontSize: 36, 
              fontWeight: 900, 
              background: 'linear-gradient(135deg, #1e293b, #6366f1)', 
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 8,
              letterSpacing: '-0.5px'
            }}>
              Chào mừng trở lại, {user?.name || info?.name || 'Học viên'}! 👋
            </div>
            <div style={{ 
              color: '#6366f1', 
              fontWeight: 700, 
              fontSize: 18, 
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              {/* <FaUserFriends /> ID: user{info?.id || 'xxx'} */}
            </div>
            <div style={{ color: '#64748b', fontSize: 16, marginBottom: 12 }}>
              Vai trò: <span style={{ 
                background: 'linear-gradient(45deg, #6366f1, #8b5cf6)', 
                color: '#fff', 
                padding: '4px 12px', 
                borderRadius: 12, 
                fontWeight: 700,
                fontSize: 14,
                marginLeft: 8
              }}>{info?.role || 'learner'}</span>
            </div>
            {/* Level Badge */}
            <div className="hero-badges" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              marginTop: 8
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                padding: '8px 20px',
                borderRadius: 20,
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                fontWeight: 800,
                color: '#fff',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                letterSpacing: '0.5px'
              }}>
                <FaStar style={{ fontSize: 18 }} />
                Level {stats?.level || 1}
            </div>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '8px 20px',
                borderRadius: 20,
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                fontWeight: 800,
                color: '#fff',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <FaFire style={{ fontSize: 18 }} />
                {stats?.streak || 0} ngày streak
          </div>
        </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="stats-section responsive-grid" style={{ 
          gap: 20, 
          marginBottom: 40,
          position: 'relative',
          zIndex: 1
        }}>
          
          
          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 20,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <FaChartLine style={{ fontSize: 28, opacity: 0.8 }} />
              <div style={{ fontSize: 32, fontWeight: 900 }}>{stats?.learn_sessions_today || 0}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.9 }}>Phiên học từ mới</div>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>Đã hoàn thành hôm nay</div>
          </div>
          
          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: 20,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <FaBookOpen style={{ fontSize: 28, opacity: 0.8 }} />
              <div style={{ fontSize: 32, fontWeight: 900 }}>
              {(() => { const s=new Set(); (learnSummary?.vocabDetails||[]).forEach(v=>{ if(v?.word) s.add(v.word); }); return s.size; })()}
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.9 }}>Từ hôm nay</div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>Số từ duy nhất đã học hôm nay</div>
          </div>
        </div>

        {/* Progress Section */}
        <div style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: 24, 
            marginBottom: 16, 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FaTrophy style={{ color: '#f59e0b' }} />
            Tiến độ học tập
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          }}>
          {(() => {
            const uniqueTodayCount = (() => {
              const s = new Set();
              (learnSummary?.vocabDetails || []).forEach(v => { if (v?.word) s.add(v.word); });
              return s.size;
            })();
            return <ProgressBar current={uniqueTodayCount} total={20} />;
          })()}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: 16, 
              color: '#64748b', 
              fontSize: 16,
              fontWeight: 600
            }}>
              {(() => {
                const s = new Set();
                (learnSummary?.vocabDetails || []).forEach(v => { if (v?.word) s.add(v.word); });
                const n = s.size;
                return <span>Đã học: {n}/20 từ hôm nay</span>;
              })()}
          </div>
        </div>
        </div>
        {/* Badges Section */}
        <div className="badges-section" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: 24, 
            marginBottom: 20, 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FaMedal style={{ color: '#f59e0b' }} />
            Thành tích & Huy hiệu
          </div>
          <div className="responsive-grid" style={{ 
            gap: 20 
          }}>
            {badges && badges.map(b => (
              <div key={b.id} className="badge-card" style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: 20, 
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                padding: 24, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ 
                  fontSize: 48, 
                  marginBottom: 12,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                }}>
                  <FaMedal style={{ color: '#fff', fontSize: 36 }} />
                </div>
                <div style={{ 
                  fontWeight: 800, 
                  color: '#1e293b', 
                  fontSize: 18, 
                  marginBottom: 8,
                  textAlign: 'center'
                }}>{b.title}</div>
                <div style={{ 
                  color: '#64748b', 
                  fontSize: 14, 
                  textAlign: 'center',
                  lineHeight: 1.4
                }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="quick-actions-section" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: 24, 
            marginBottom: 20, 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FaRocket style={{ color: '#6366f1' }} />
            Chức năng nhanh
          </div>
          <div className="responsive-grid" style={{ 
            gap: 20 
          }}>
            <div 
              onClick={handleFlashcard}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: 20,
                padding: 30,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎴</div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#1e293b', 
                marginBottom: 8 
              }}>
                Học Flashcard
              </div>
              <div style={{ 
                fontSize: 14, 
                color: '#64748b', 
                lineHeight: 1.5 
              }}>
                Học từ vựng với flashcard 
              </div>
            </div>

            <div 
              onClick={() => navigate('/history')}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: 20,
                padding: 30,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#1e293b', 
                marginBottom: 8 
              }}>
                Xem lịch sử
              </div>
              <div style={{ 
                fontSize: 14, 
                color: '#64748b', 
                lineHeight: 1.5 
              }}>
                Theo dõi tiến độ học tập
              </div>
            </div>

            <div 
              onClick={() => navigate('/badges')}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
                borderRadius: 20,
                padding: 30,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 700, 
                color: '#1e293b', 
                marginBottom: 8 
              }}>
                Huy hiệu
              </div>
              <div style={{ 
                fontSize: 14, 
                color: '#64748b', 
                lineHeight: 1.5 
              }}>
                Xem thành tích và huy hiệu
              </div>
            </div>
          </div>
        </div>

        {/* Today's Activities Section */}
        <div className="assignments-section" style={{ marginBottom: 40, position: 'relative', zIndex: 1 }}>
          <div style={{ 
            fontWeight: 800, 
            fontSize: 24, 
            marginBottom: 20, 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <FaHistory style={{ color: '#6366f1' }} />
            Hoạt động hôm nay
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {history && history.filter(h => (new Date(h.created_at)).toDateString() === (new Date()).toDateString()).slice(0,6).map((h, idx) => (
                <div key={idx} className="assignment-card" style={{ 
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 16, 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                  padding: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 800
                      }}>{getTypeLabel(h)}</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>
                        {getMetric(h).value} {getMetric(h).label}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 14 }}>Lúc: {new Date(h.created_at).toLocaleTimeString()}</div>
                </div>
                  <div style={{ 
                    color: '#22c55e', 
                    fontWeight: 800, 
                    fontSize: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    background: 'rgba(34, 197, 94, 0.1)',
                    padding: '8px 16px',
                    borderRadius: 12,
                    border: '1px solid #22c55e20'
                  }}>
                    <FaCheckCircle color="#22c55e" /> {h.words_typed || 0} từ đã học
                  </div>
              </div>
            ))}
              {(!history || history.filter(h => (new Date(h.created_at)).toDateString() === (new Date()).toDateString()).length === 0) && (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#64748b', 
                  fontSize: 16, 
                  padding: '40px 20px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: 16
                }}>
                  <FaHistory style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                  <div>Hôm nay chưa có hoạt động</div>
          </div>
              )}
        </div>
          </div>
        </div>
        {/* Two Column Layout for Leaderboard and History */}
        <div className="two-column-layout" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 32, 
          marginBottom: 40,
          position: 'relative',
          zIndex: 1
        }}>
        {/* Leaderboard */}
          <div className="leaderboard-section">
            <div style={{ 
              fontWeight: 800, 
              fontSize: 24, 
              marginBottom: 20, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <FaCrown style={{ color: '#f59e0b' }} />
              Bảng xếp hạng
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
              borderRadius: 20, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              padding: 24,
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {leaderboard.map((u, i) => (
                  <div key={u.id} className="leaderboard-card" style={{ 
                    background: i === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'rgba(255,255,255,0.6)',
                    borderRadius: 16, 
                    padding: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    border: i === 0 ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.3)',
                    boxShadow: i === 0 ? '0 8px 25px rgba(245, 158, 11, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 18,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      {i + 1}
                    </div>
                    <img 
                      src={u.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name)} 
                      alt="avatar" 
                      style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '3px solid #fff', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: i === 0 ? 800 : 700, 
                        color: '#1e293b', 
                        fontSize: 16,
                        marginBottom: 2
                      }}>
                      {u.name}
                      </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: 14 
                      }}>
                        WPM: {u.best_wpm}
                      </div>
                    </div>
                    {i === 0 && (
                      <div style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <FaCrown style={{ fontSize: 14 }} />
                        #1
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>
          </div>

        {/* Typing History */}
          <div className="history-section">
            <div style={{ 
              fontWeight: 800, 
              fontSize: 24, 
              marginBottom: 20, 
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <FaHistory style={{ color: '#6366f1' }} />
              Lịch sử luyện tập
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
              borderRadius: 20, 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              padding: 24,
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history && history.length > 0 ? history.map((h, i) => (
                  <div key={i} className="history-card" style={{ 
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: 16, 
                    padding: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 700, 
                        color: '#1e293b', 
                        fontSize: 16,
                        marginBottom: 4
                      }}>
                        {new Date(h.created_at).toLocaleDateString()}
          </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: 14 
                      }}>
                        {new Date(h.created_at).toLocaleTimeString()}
        </div>
      </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                          fontWeight: 800, 
                          color: '#6366f1', 
                          fontSize: 18 
                        }}>
                          {getMetric(h).value}
                        </div>
                        <div style={{ 
                          color: '#64748b', 
                          fontSize: 12 
                        }}>
                          {getMetric(h).label}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#64748b', 
                    fontSize: 16, 
                    padding: '40px 20px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 16
                  }}>
                    <FaHistory style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                    <div>Chưa có lịch sử luyện tập</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .stats-card:hover {
          transform: translateY(-5px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
        
        .badge-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
        
        .assignment-card:hover {
          transform: translateX(5px) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .leaderboard-card:hover {
          transform: translateX(5px) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .history-card:hover {
          transform: translateX(5px) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .hero-section {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .stats-section {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .badges-section {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .quick-actions-section {
          animation: fadeInUp 0.8s ease-out 0.5s both;
        }
        
        .assignments-section {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .leaderboard-section {
          animation: fadeInUp 0.8s ease-out 0.8s both;
        }
        
        .history-section {
          animation: fadeInUp 0.8s ease-out 1s both;
        }
        
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .two-column-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .badges-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            gap: 16px !important;
          }
          
          .hero-content {
            flex-direction: column !important;
            text-align: center !important;
            gap: 20px !important;
          }
          
          .hero-title {
            font-size: 28px !important;
          }
          
          .hero-badges {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
        }
        
        @media (max-width: 480px) {
          .hero-title {
            font-size: 24px !important;
          }
          
          .hero-badges {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          .stats-card {
            padding: 16px !important;
          }
          
          .badge-card {
            padding: 16px !important;
          }
        }
      `}</style>
      <ScrollToTopButton />
    </div>
  );
}

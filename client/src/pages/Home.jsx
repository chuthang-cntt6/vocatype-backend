import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaRocket, FaChartLine, FaTrophy, FaUsers, FaStar, FaPlay, FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ users: 0, words: 0, accuracy: 0, speed: 0 });
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Don't render anything if user is logged in (to prevent flash)
  if (user) {
    return null;
  }

  // Particles animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      const animateCounter = (key, target) => {
        let current = 0;
        const increment = target / steps;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, stepDuration);
      };

      animateCounter('users', 10000);
      animateCounter('words', 5000);
      animateCounter('accuracy', 95);
      animateCounter('speed', 80);
    }
  }, [isVisible]);

  // Testimonials auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Sinh viên IT",
      content: "VocaType giúp tôi cải thiện tốc độ gõ từ 30 WPM lên 80 WPM chỉ trong 2 tháng!",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=6366f1&color=fff"
    },
    {
      name: "Trần Thị B",
      role: "Nhân viên văn phòng",
      content: "Giao diện đẹp, dễ sử dụng. Hệ thống AI thông minh giúp tôi học từ vựng hiệu quả.",
      avatar: "https://ui-avatars.com/api/?name=Tran+Thi+B&background=8b5cf6&color=fff"
    },
    {
      name: "Lê Văn C",
      role: "Giáo viên",
      content: "Tôi sử dụng VocaType để dạy học sinh. Các tính năng báo cáo rất chi tiết và hữu ích.",
      avatar: "https://ui-avatars.com/api/?name=Le+Van+C&background=22c55e&color=fff"
    }
  ];

  const features = [
    {
      icon: <FaRocket />,
      title: "Luyện tập thông minh",
      description: "Hệ thống AI tự động điều chỉnh độ khó phù hợp với trình độ của bạn",
      color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      icon: <FaChartLine />,
      title: "Theo dõi tiến độ",
      description: "Báo cáo chi tiết về tốc độ gõ, độ chính xác và sự tiến bộ qua từng ngày",
      color: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      icon: <FaTrophy />,
      title: "Cạnh tranh vui vẻ",
      description: "Tham gia bảng xếp hạng, nhận huy hiệu và cạnh tranh với bạn bè",
      color: "linear-gradient(135deg, #4facfe, #00f2fe)"
    },
    {
      icon: <FaUsers />,
      title: "Cộng đồng học tập",
      description: "Kết nối với hàng nghìn người dùng khác và chia sẻ kinh nghiệm học tập",
      color: "linear-gradient(135deg, #43e97b, #38f9d7)"
    }
  ];

  const handleRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Particles Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          animation: 'gradientShift 8s ease-in-out infinite'
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 3
        }}>
          <div className="animate-on-scroll" style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s ease-out'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: '24px',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #fff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              VocaType - Học Tiếng Anh và luyện thi TOEIC
            </h1>
            
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              {/* Hệ thống luyện gõ phím hiện đại với AI, giúp bạn cải thiện tốc độ và độ chính xác một cách hiệu quả */}
              Hệ thống giúp bạn nắm vững từ vựng, luyện nghe và thi thử TOEIC hiệu quả, cải thiện điểm số nhanh chóng
            </p>

            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '60px'
            }}>
              <button
                onClick={() => navigate('/login')}
                onMouseDown={handleRipple}
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.4)';
                }}
              >
                <FaPlay />
                Đăng nhập
              </button>
              
              <button
                onClick={() => navigate('/register')}
                onMouseDown={handleRipple}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.8)',
                  borderRadius: '50px',
                  padding: '14px 30px',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = '#fff';
                  e.target.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Đăng ký miễn phí
                <FaArrowRight />
              </button>
            </div>

            {/* Stats Counter */}
            <div className="animate-on-scroll" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '40px',
              marginTop: '80px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 1s ease-out 0.5s'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {counters.users.toLocaleString()}+
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Người dùng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {counters.words.toLocaleString()}+
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Từ vựng</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {counters.accuracy}%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>Độ chính xác</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#fff',
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {counters.speed}+
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>WPM trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '100px 20px',
        background: '#f8fafc',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 className="animate-on-scroll" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out'
          }}>
            Tại sao chọn VocaType?
          </h2>
          
          <p className="animate-on-scroll" style={{
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out 0.2s'
          }}>
            Học từ vựng vui như chơi game, nghe chuẩn như native!
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            marginTop: '60px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="animate-on-scroll"
                style={{
                  background: '#fff',
                  borderRadius: '20px',
                  padding: '40px 30px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                  transitionDelay: `${index * 0.1}s`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px) rotateX(5deg)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) rotateX(0deg)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onClick={() => navigate('/login')}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: feature.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#fff',
                  margin: '0 auto 24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  {feature.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '16px'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  color: '#64748b',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section style={{
        padding: '100px 20px',
        background: '#f8fafc',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 className="animate-on-scroll" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out'
          }}>
            Xem VocaType hoạt động như thế nào
          </h2>
          
          <p className="animate-on-scroll" style={{
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out 0.2s'
          }}>
            Khám phá cách học từ vựng thông minh, luyện nghe chuẩn và thi thử TOEIC hiệu quả
          </p>

          <div className="animate-on-scroll" style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'all 1s ease-out 0.4s'
          }}>
            <div style={{
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                fontSize: '4rem',
                color: '#94a3b8',
                animation: 'pulse 2s infinite'
              }}>
                📚
              </div>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                height: '60px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                fontSize: '1.2rem',
                color: '#1e293b',
                fontWeight: 600
              }}>
                Demo: Học từ vựng & Luyện thi TOEIC
              </div>
            </div>
            <p style={{
              marginTop: '20px',
              color: '#64748b',
              fontSize: '1rem'
            }}>
              Trải nghiệm học từ vựng, luyện nghe và thi thử TOEIC
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Thử ngay miễn phí
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 className="animate-on-scroll" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out'
          }}>
            Người dùng nói gì về VocaType?
          </h2>

          <div style={{
            position: 'relative',
            maxWidth: '800px',
            margin: '60px auto 0',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              transition: 'transform 0.5s ease-in-out',
              transform: `translateX(-${currentTestimonial * 100}%)`
            }}>
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  style={{
                    minWidth: '100%',
                    padding: '0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.2)',
                    position: 'relative'
                  }}>
                    <FaQuoteLeft style={{
                      fontSize: '2rem',
                      color: 'rgba(255,255,255,0.5)',
                      marginBottom: '20px'
                    }} />
                    
                    <p style={{
                      fontSize: '1.2rem',
                      color: '#fff',
                      lineHeight: 1.6,
                      marginBottom: '30px',
                      fontStyle: 'italic'
                    }}>
                      "{testimonial.content}"
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '15px'
                    }}>
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#fff',
                          marginBottom: '4px'
                        }}>
                          {testimonial.name}
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.9rem'
                        }}>
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              style={{
                position: 'absolute',
                left: '-60px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <FaChevronLeft />
            </button>

            <button
              onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length)}
              style={{
                position: 'absolute',
                right: '-60px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <FaChevronRight />
            </button>

            {/* Dots Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '40px'
            }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentTestimonial ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: '100px 20px',
        background: '#f8fafc',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 className="animate-on-scroll" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: '20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out'
          }}>
            Câu hỏi thường gặp
          </h2>
          
          <p className="animate-on-scroll" style={{
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '60px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out 0.2s'
          }}>
            Tìm hiểu thêm về VocaType
          </p>

          <div style={{ textAlign: 'left' }}>
            {[
              {
                q: "VocaType có miễn phí không?",
                a: "Có! VocaType hoàn toàn miễn phí với đầy đủ tính năng. Bạn có thể học từ vựng, luyện nghe, thi thử TOEIC và theo dõi tiến độ mà không cần trả phí."
              },
              {
                q: "Tôi có thể học offline không?",
                a: "Hiện tại VocaType cần kết nối internet để đồng bộ dữ liệu và cập nhật nội dung mới nhất. Chúng tôi đang phát triển tính năng offline."
              },
              {
                q: "Làm sao để cải thiện điểm TOEIC?",
                a: "VocaType cung cấp hệ thống học từ vựng thông minh, luyện nghe chuẩn và thi thử TOEIC. Luyện tập đều đặn 15-30 phút mỗi ngày sẽ giúp cải thiện điểm số đáng kể."
              },
              {
                q: "Có hỗ trợ thiết bị di động không?",
                a: "Có! VocaType được tối ưu cho cả desktop và mobile. Bạn có thể học mọi lúc, mọi nơi trên điện thoại hoặc máy tính."
              }
            ].map((faq, index) => (
              <div key={index} className="animate-on-scroll" style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 1s ease-out ${0.1 * index}s`
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '12px'
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 20px',
        background: '#1e293b',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 className="animate-on-scroll" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '20px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out'
          }}>
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          
          <p className="animate-on-scroll" style={{
            fontSize: '1.2rem',
            color: '#94a3b8',
            marginBottom: '40px',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out 0.2s'
          }}>
            Tham gia cùng hàng nghìn người dùng đang cải thiện kỹ năng mỗi ngày
          </p>

          <div className="animate-on-scroll" style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1s ease-out 0.4s'
          }}>
            <button
              onClick={() => navigate('/register')}
              onMouseDown={handleRipple}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                padding: '18px 36px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
              }}
            >
              <FaRocket />
              Đăng ký miễn phí ngay
            </button>
            
            <button
              onClick={() => navigate('/login')}
              onMouseDown={handleRipple}
              style={{
                background: 'transparent',
                color: '#6366f1',
                border: '2px solid #6366f1',
                borderRadius: '50px',
                padding: '16px 34px',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.color = '#fff';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6366f1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </div>
      </section>

              {/* Footer - Thêm ở cuối trang Home */}
{/* Footer - FIXED: Font khớp, layout đẹp hơn (gap rộng, responsive 2 columns mobile) */}
<footer style={{ 
  background: 'linear-gradient(135deg, #4c1d95 0%, #667eea 100%)',  // Khớp theme hero
  color: 'white', 
  padding: '50px 20px 20px',  // Tăng padding top cho thoáng
  // marginTop: '60px', 
  textAlign: 'center', 
  borderTop: '1px solid rgba(255,255,255,0.1)',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'  // FIXED: Font khớp trang chủ
}}>
  <div style={{ maxWidth: 1200, margin: '0 auto' }}>
    {/* Top: Columns links - FIXED: Gap rộng hơn, responsive 2 columns mobile */}
    <div className="footer-top-grid" style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 60,
      marginBottom: 30,
      justifyItems: 'center'
    }}>
      {/* Column 1: About */}
      <div>
        <h4 style={{ 
          margin: '0 0 15px 0', 
          color: '#e2e8f0', 
          fontSize: '18px', 
          fontWeight: 700,  // FIXED: Bold hơn
          textAlign: 'center'  // Center cho desktop
        }}>
          VocaType
        </h4>
        <p style={{ 
          color: '#cbd5e1', 
          fontSize: '14px', 
          lineHeight: 1.7,  // FIXED: Line-height rộng hơn cho mượt
          textAlign: 'center' 
        }}>
          Ứng dụng học Tiếng Anh & luyện TOEIC với flashcard AI thông minh.
        </p>
      </div>
      
      {/* Column 2: Sản phẩm */}
      <div>
        <h5 style={{ 
          margin: '0 0 15px 0', 
          color: '#e2e8f0', 
          fontSize: '16px', 
          fontWeight: 700  // FIXED: Bold
        }}>
          Sản phẩm
        </h5>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 10 }}><a href="/flashcard" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Flashcard</a></li>
          <li style={{ marginBottom: 10 }}><a href="/exam" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Thi thử TOEIC</a></li>
          <li style={{ marginBottom: 10 }}><a href="/learn" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Học từ vựng</a></li>
        </ul>
      </div>
      
      {/* Column 3: Hỗ trợ */}
      <div>
        <h5 style={{ 
          margin: '0 0 15px 0', 
          color: '#e2e8f0', 
          fontSize: '16px', 
          fontWeight: 700 
        }}>
          Hỗ trợ
        </h5>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: 10 }}><a href="/about" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Về chúng tôi</a></li>
          <li style={{ marginBottom: 10 }}><a href="/privacy" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Chính sách</a></li>
          <li style={{ marginBottom: 10 }}><a href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', lineHeight: 1.5, transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#a78bfa'} onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}>Liên hệ</a></li>
        </ul>
      </div>
      
      {/* Column 4: Social - FIXED: Center + gap lớn hơn */}
      <div>
        <h5 style={{ 
          margin: '0 0 15px 0', 
          color: '#e2e8f0', 
          fontSize: '16px', 
          fontWeight: 700 
        }}>
          Theo dõi
        </h5>
        <div style={{ 
          display: 'flex', 
          gap: 20,  // FIXED: Gap rộng hơn cho icons
          justifyContent: 'center',  // Center icons
          flexWrap: 'wrap' 
        }}>
          <a href="#" style={{ color: '#cbd5e1', fontSize: 22, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.color = '#a78bfa'; e.target.style.transform = 'scale(1.2) rotate(5deg)'; }} onMouseLeave={(e) => { e.target.style.color = '#cbd5e1'; e.target.style.transform = 'scale(1) rotate(0deg)'; }}><FaFacebook /></a>
          <a href="#" style={{ color: '#cbd5e1', fontSize: 22, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.color = '#a78bfa'; e.target.style.transform = 'scale(1.2) rotate(5deg)'; }} onMouseLeave={(e) => { e.target.style.color = '#cbd5e1'; e.target.style.transform = 'scale(1) rotate(0deg)'; }}><FaTwitter /></a>
          <a href="#" style={{ color: '#cbd5e1', fontSize: 22, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.color = '#a78bfa'; e.target.style.transform = 'scale(1.2) rotate(5deg)'; }} onMouseLeave={(e) => { e.target.style.color = '#cbd5e1'; e.target.style.transform = 'scale(1) rotate(0deg)'; }}><FaInstagram /></a>
          <a href="#" style={{ color: '#cbd5e1', fontSize: 22, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.target.style.color = '#a78bfa'; e.target.style.transform = 'scale(1.2) rotate(5deg)'; }} onMouseLeave={(e) => { e.target.style.color = '#cbd5e1'; e.target.style.transform = 'scale(1) rotate(0deg)'; }}><FaYoutube /></a>
        </div>
      </div>
    </div>
    
    {/* Bottom: Copyright - FIXED: Center, font mượt hơn */}
    <div style={{ 
      borderTop: '1px solid rgba(255,255,255,0.1)', 
      paddingTop: 20, 
      color: '#94a3b1', 
      fontSize: '14px', 
      lineHeight: 1.6,  // FIXED: Mượt hơn
      textAlign: 'center' 
    }}>
      <p>&copy; 2025 VocaType. Tất cả quyền được bảo lưu. | Đồ án tốt nghiệp - ĐH Công Nghệ Thông Tin</p>
    </div>
  </div>
</footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-10px) translateY(-10px); }
          50% { transform: translateX(10px) translateY(10px); }
          75% { transform: translateX(-5px) translateY(5px); }
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
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
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .animate-on-scroll {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
          .footer-top-grid { 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            text-align: left; 
          }
          
          /* Mobile Hero Section */
          .hero-section {
            padding: 40px 20px !important;
            min-height: 80vh !important;
          }
          
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center !important;
          }
          
          /* Mobile Features */
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          /* Mobile Demo */
          .demo-container {
            padding: 20px !important;
          }
          
          .demo-video {
            height: 250px !important;
          }
          
          /* Mobile FAQ */
          .faq-item {
            padding: 16px !important;
            margin-bottom: 12px !important;
          }
          
          /* Mobile CTA */
          .cta-buttons {
            flex-direction: column !important;
            gap: 16px !important;
          }
          
          .cta-button {
            width: 100% !important;
            padding: 16px 24px !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small screens */
          .hero-title {
            font-size: 2rem !important;
          }
          
          .hero-subtitle {
            font-size: 1rem !important;
          }
          
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
          
          .feature-card {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

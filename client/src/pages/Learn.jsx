// Learn.jsx
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FaArrowRight, FaCheckCircle, FaExpand, FaClock, FaKeyboard, FaStar, FaTrophy, FaFire, FaBullseye, FaChartLine, FaRocket, FaMedal, FaGem, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import './Learn.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { api } from '../services/api';

export default function Learn() {
  const { user } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [vocabList, setVocabList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(null);
  const inputRef = useRef();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const TOPICS_PER_PAGE = 5;
  const [topicVocabCounts, setTopicVocabCounts] = useState({});
  
  // Gamification states
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    fetch('/api/topics')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTopics(data);
        else setTopics([]);
      })
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      // Fetch chapters for the selected topic
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/chapters/topic/${selectedTopic}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setChapters(data.data);
            setSelectedChapter(null); // Reset selected chapter
          } else {
            setChapters([]);
          }
        })
        .catch(() => {
          setChapters([]);
        });
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedChapter) {
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/chapters/${selectedChapter}/vocabulary`)
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setVocabList(data.data);
          setCurrent(0);
          setInput('');
          setCorrect(false);
          setDone(false);
          setWpm(null);
            setScore(0);
            setStreak(0);
            setMaxStreak(0);
            setPerfectCount(0);
            setAchievements([]);
            setLevel(1);
            setXp(0);
          } else {
            setVocabList([]);
          }
        })
        .catch(() => {
          setVocabList([]);
        });
    }
  }, [selectedChapter]);

  // Add EXP when completing a lesson
  useEffect(() => {
    if (done && user?.id && vocabList.length > 0) {
      // Calculate EXP: 10 EXP per word + bonus for perfect score
      const baseExp = vocabList.length * 10;
      const bonusExp = perfectCount >= vocabList.length * 0.8 ? 20 : 0; // Bonus if 80%+ perfect
      const totalExp = baseExp + bonusExp;
      
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/add-exp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        },
        body: JSON.stringify({
          expAmount: totalExp,
          activityType: 'learn'
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
  }, [done, user?.id, vocabList.length, perfectCount]);

  useEffect(() => {
    if (topics.length > 0) {
      const fetchCounts = async () => {
        const counts = {};
        await Promise.all(topics.map(async (topic) => {
          try {
            // Lấy số từ vựng từ chapters thay vì từ topic trực tiếp
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/chapters/topic/${topic.id}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
              // Tính tổng số từ vựng từ tất cả chapters
              const totalVocab = data.data.reduce((sum, chapter) => {
                const vocabCount = parseInt(chapter.vocab_count) || 0;
                console.log(`Chapter "${chapter.title}": vocab_count="${chapter.vocab_count}" -> parsed: ${vocabCount}`);
                return sum + vocabCount;
              }, 0);
              console.log(`Topic "${topic.title}" (ID: ${topic.id}) total vocab: ${totalVocab}`);
              counts[topic.id] = totalVocab;
            } else {
              counts[topic.id] = 0;
            }
          } catch {
            counts[topic.id] = 0;
          }
        }));
        setTopicVocabCounts(counts);
      };
      fetchCounts();
    }
  }, [topics]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (!startTime) setStartTime(Date.now());
    
    if (vocabList[current] && e.target.value.trim().toLowerCase() === vocabList[current].word.toLowerCase()) {
      setCorrect(true);
      setScore(prev => prev + 10);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(prevMax => Math.max(prevMax, newStreak));
        return newStreak;
      });
      
      // Perfect bonus
      const perfectBonus = e.target.value.trim() === vocabList[current].word ? 5 : 0;
      if (perfectBonus > 0) {
        setPerfectCount(prev => prev + 1);
      }
      
      // Check for achievements
      checkAchievements();
      
      // Add XP and check level up
      setXp(prev => {
        const newXP = prev + 10 + perfectBonus;
        const newLevel = Math.floor(newXP / 100) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 3000);
        }
        return newXP;
      });
      
      // Celebration effect
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
      
      setTimeout(() => {
        if (current + 1 < vocabList.length) {
          setCurrent(current + 1);
          setInput('');
          setCorrect(false);
        } else {
          setDone(true);
          setEndTime(Date.now());
          const totalMinutes = (Date.now() - startTime) / 60000;
          const totalChars = vocabList.reduce((sum, v) => sum + v.word.length, 0);
          if (totalMinutes > 0) {
          const wpmValue = totalChars / 5 / totalMinutes;
          setWpm(Math.round(wpmValue));
          }
        }
      }, 600);
    } else if (e.target.value.trim() !== '' && !vocabList[current]?.word.toLowerCase().startsWith(e.target.value.toLowerCase())) {
      // Reset streak on wrong input
      setStreak(0);
    }
  };

  const checkAchievements = () => {
    const newAchievements = [];
    if (streak === 5 && !achievements.includes('streak_5')) {
      newAchievements.push({ id: 'streak_5', name: 'Hot Streak!', desc: '5 từ liên tiếp đúng', icon: '🔥' });
    }
    if (streak === 10 && !achievements.includes('streak_10')) {
      newAchievements.push({ id: 'streak_10', name: 'On Fire!', desc: '10 từ liên tiếp đúng', icon: '🚀' });
    }
    if (perfectCount === 5 && !achievements.includes('perfect_5')) {
      newAchievements.push({ id: 'perfect_5', name: 'Perfectionist', desc: '5 từ hoàn hảo', icon: '⭐' });
    }
    if (score >= 1000 && !achievements.includes('score_1000')) {
      newAchievements.push({ id: 'score_1000', name: 'High Scorer', desc: 'Đạt 1000 điểm', icon: '🏆' });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      toast.success(`🎉 Mở khóa thành tích: ${newAchievements[0].name}!`, { autoClose: 3000 });
    }
  };


  // Show chapters selection when topic is selected but no chapter chosen
  if (selectedTopic && !selectedChapter) {
    const selectedTopicData = topics.find(t => t.id === selectedTopic);
    
    return (
      <div className="learn-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: window.innerWidth <= 768 ? '20px 12px' : '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ vựng', path: '/learn' },
            { label: selectedTopicData?.title || 'Chọn chương', path: '#' }
          ]}
        />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setSelectedTopic(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              ← Quay lại chọn chủ đề
            </button>
          </div>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: window.innerWidth <= 768 ? '16px' : '24px',
            padding: window.innerWidth <= 768 ? '20px' : '30px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: window.innerWidth <= 768 ? '12px' : '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '16px',
                padding: window.innerWidth <= 768 ? '10px' : '12px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
              }}>
                📚
              </div>
              <div>
                <h1 style={{
                  fontSize: window.innerWidth <= 768 ? '24px' : '32px',
                  fontWeight: '900',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  {selectedTopicData?.title || 'Chọn chương học'}
                </h1>
                <p style={{
                  fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                  color: '#64748b',
                  margin: 0
                }}>
                  {selectedTopicData?.description || 'Chọn một chương để bắt đầu học từ vựng'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Chapters Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: window.innerWidth <= 768 ? '16px' : '24px',
            marginBottom: '32px'
          }}>
            {chapters.map(chapter => (
              <div
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter.id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  borderRadius: window.innerWidth <= 768 ? '16px' : '20px',
                  padding: window.innerWidth <= 768 ? '20px' : '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
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
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                  borderRadius: '50%',
                  opacity: '0.1'
                }}></div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: window.innerWidth <= 768 ? '12px' : '16px',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '16px',
                    padding: window.innerWidth <= 768 ? '10px' : '12px',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                  }}>
                    📖
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: window.innerWidth <= 768 ? '18px' : '20px',
                      fontWeight: '800',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      {chapter.title}
                    </h3>
                    <p style={{
                      fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                      color: '#64748b',
                      margin: 0
                    }}>
                      {chapter.description || 'Học từ vựng theo chương'}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                  gap: window.innerWidth <= 768 ? '8px' : '0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#22c55e',
                    fontWeight: '600',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>
                    <FaBullseye style={{ fontSize: '12px' }} />
                    {Number(chapter.vocab_count || 0).toLocaleString()} từ vựng
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#22c55e',
                    fontWeight: '600',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>
                    <FaBullseye style={{ fontSize: '12px' }} />
                    Bắt đầu
                  </div>
                </div>
                
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  color: '#6366f1',
                  fontSize: '20px',
                  opacity: '0.7'
                }}>
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>
          
          {chapters.length === 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              borderRadius: window.innerWidth <= 768 ? '16px' : '20px',
              padding: window.innerWidth <= 768 ? '40px 20px' : '60px 40px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{
                fontSize: window.innerWidth <= 768 ? '18px' : '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Chưa có chương nào
              </h3>
              <p style={{
                fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                color: '#64748b',
                margin: 0
              }}>
                Chủ đề này chưa có chương học nào. Vui lòng chọn chủ đề khác.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!selectedTopic) {
    const filteredTopics = topics.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredTopics.length / TOPICS_PER_PAGE) || 1;
    const pagedTopics = filteredTopics.slice(
      (page - 1) * TOPICS_PER_PAGE,
      page * TOPICS_PER_PAGE
    );
    
    return (
      <div className="learn-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: window.innerWidth <= 768 ? '20px 12px' : '40px 20px'
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ vựng', path: '/learn' }
          ]}
        />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header with Stats */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: window.innerWidth <= 768 ? '16px' : '24px',
            padding: window.innerWidth <= 768 ? '20px' : '30px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
              gap: window.innerWidth <= 768 ? '16px' : '0'
            }}>
              <div>
                <h1 style={{
                  fontSize: window.innerWidth <= 768 ? '24px' : '32px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #1e293b, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                  letterSpacing: '-0.5px',
                  textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                }}>
                  Học từ vựng
                </h1>
                <p style={{
                  fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                  color: '#64748b',
                  margin: 0,
                  textAlign: window.innerWidth <= 768 ? 'center' : 'left'
                }}>
                  Chọn chủ đề để bắt đầu học từ vựng
                </p>
              </div>
              
              {/* Live Stats */}
              {user && (
                <div style={{
                  display: 'flex',
                  gap: window.innerWidth <= 768 ? '12px' : '20px',
                  alignItems: 'center',
                  justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    padding: window.innerWidth <= 768 ? '10px 16px' : '12px 20px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
                  }}>
                    <div style={{ fontSize: window.innerWidth <= 768 ? '16px' : '20px', fontWeight: '800' }}>Level {level}</div>
                    <div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '14px', opacity: '0.9' }}>XP: {xp}</div>
                  </div>
          </div>
              )}
        </div>
            
            {/* Search and Join Class */}
            <div style={{
              display: 'flex',
              gap: window.innerWidth <= 768 ? '12px' : '16px',
              alignItems: 'center',
              marginBottom: '20px',
              flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '16px'
                }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: window.innerWidth <= 768 ? undefined  : '90%',
                    padding: window.innerWidth <= 768 ? '10px 14px 10px 44px' : '12px 16px 12px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                    background: '#f9fafb',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#f9fafb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
            </div>
          </div>
          
          {/* Topics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: window.innerWidth <= 768 ? '16px' : '24px',
            marginBottom: '32px'
          }}>
            {pagedTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                  borderRadius: window.innerWidth <= 768 ? '16px' : '20px',
                  padding: window.innerWidth <= 768 ? '20px' : '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
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
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                  borderRadius: '50%',
                  opacity: '0.1'
                }}></div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: window.innerWidth <= 768 ? '12px' : '16px',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '16px',
                    padding: window.innerWidth <= 768 ? '10px' : '12px',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                  }}>
                    📚
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: window.innerWidth <= 768 ? '18px' : '20px',
                      fontWeight: '800',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      {topic.title}
                    </h3>
                    <p style={{
                      fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                      color: '#64748b',
                      margin: 0
                    }}>
                      {topic.description || 'Học từ vựng theo chủ đề'}
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                  flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                  gap: window.innerWidth <= 768 ? '8px' : '0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#22c55e',
                    fontWeight: '600',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>
                    <FaBullseye style={{ fontSize: '12px' }} />
                    {(() => {
                      const count = topicVocabCounts[topic.id] || 0;
                      console.log(`Displaying vocab count for topic "${topic.title}" (ID: ${topic.id}): raw=${count}, formatted=${Number(count).toLocaleString()}`);
                      return Number(count).toLocaleString();
                    })()} từ vựng
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#22c55e',
                    fontWeight: '600',
                    fontSize: window.innerWidth <= 768 ? '13px' : '14px'
                  }}>
                    <FaBullseye style={{ fontSize: '12px' }} />
                    Bắt đầu
                  </div>
                </div>
                
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  color: '#6366f1',
                  fontSize: '20px',
                  opacity: '0.7'
                }}>
                  <FaArrowRight />
                </div>
              </div>
            ))}
        </div>
          
          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{
              padding: '6px 16px',
              marginRight: 8,
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              background: page === 1 ? '#e5e7eb' : '#fff',
              color: '#2563eb',
              fontWeight: 700,
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}>Trước</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setPage(num)} style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: '1.5px solid #cbd5e1',
                background: num === page ? '#2563eb' : '#fff',
                color: num === page ? '#fff' : '#2563eb',
                fontWeight: 700,
                cursor: 'pointer',
                disabled: num === page
              }}>{num}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{
              padding: '6px 16px',
              marginLeft: 8,
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              background: page === totalPages ? '#e5e7eb' : '#fff',
              color: '#2563eb',
              fontWeight: 700,
              cursor: page === totalPages ? 'not-allowed' : 'pointer'
            }}>Sau</button>
        </div>
          
        </div>
      </div>
    );
  }

  if (done) {
    // Hiển thị bảng kết quả hiện đại
    const totalTimeSec = endTime && startTime ? Math.round((endTime - startTime) / 1000) : 0;
    let suggestion = '';
    if (wpm !== null) {
      if (wpm < 20) suggestion = 'Bạn nên luyện tập thêm để tăng tốc độ gõ.';
      else if (wpm < 40) suggestion = 'Tốc độ khá, hãy cố gắng luyện tập để đạt trên 40 WPM!';
      else suggestion = 'Tuyệt vời! Tốc độ gõ của bạn rất tốt.';
    }
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #f0fdf4 60%, #bbf7d0 100%)',
        padding: window.innerWidth <= 768 ? '20px 12px' : '40px 20px',
        position: 'relative'
      }}>
        {/* Breadcrumb ở đầu trang */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '20px' }}>
          <PageBreadcrumb 
            backgroundColor="transparent"
            textColor="rgba(255,255,255,0.8)"
            currentTextColor="white"
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Học tập', path: '#' },
              { label: 'Học từ vựng', path: '/learn' }
            ]}
          />
        </div>
        
        {/* Container chính */}
        <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)',
          maxWidth: '1200px',
          margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            borderRadius: window.innerWidth <= 768 ? '16px' : '24px',
            padding: window.innerWidth <= 768 ? '32px 20px' : '48px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
            animation: 'fadeIn 0.7s'
        }}>
          {/* Success Icon */}
          <div style={{
            fontSize: window.innerWidth <= 768 ? '60px' : '80px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '24px',
            animation: 'bounce 2s infinite'
          }}>
            🎉
          </div>
          
          {/* Title */}
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            fontWeight: '900',
            color: '#22c55e',
            marginBottom: '16px',
            letterSpacing: '-0.5px'
          }}>
            Hoàn thành chủ đề!
          </h2>
          
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 480 ? 'repeat(2, 1fr)' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: window.innerWidth <= 480 ? '8px' : window.innerWidth <= 768 ? '12px' : '16px',
            marginBottom: window.innerWidth <= 768 ? '24px' : '32px',
            maxWidth: '100%'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
              padding: window.innerWidth <= 480 ? '12px 8px' : window.innerWidth <= 768 ? '14px 12px' : '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '22px' : '28px', fontWeight: '900', marginBottom: '4px' }}>
                {totalTimeSec}s
              </div>
              <div style={{ fontSize: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '11px' : '14px', opacity: '0.8' }}>Thời gian</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
              padding: window.innerWidth <= 480 ? '12px 8px' : window.innerWidth <= 768 ? '14px 12px' : '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '22px' : '28px', fontWeight: '900', marginBottom: '4px' }}>
                {wpm || 0}
              </div>
              <div style={{ fontSize: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '11px' : '14px', opacity: '0.8' }}>WPM</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
              padding: window.innerWidth <= 480 ? '12px 8px' : window.innerWidth <= 768 ? '14px 12px' : '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '22px' : '28px', fontWeight: '900', marginBottom: '4px' }}>
                {score}
              </div>
              <div style={{ fontSize: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '11px' : '14px', opacity: '0.8' }}>Điểm</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: window.innerWidth <= 480 ? '12px' : '16px',
              padding: window.innerWidth <= 480 ? '12px 8px' : window.innerWidth <= 768 ? '14px 12px' : '20px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '22px' : '28px', fontWeight: '900', marginBottom: '4px' }}>
                {maxStreak}
              </div>
              <div style={{ fontSize: window.innerWidth <= 480 ? '10px' : window.innerWidth <= 768 ? '11px' : '14px', opacity: '0.8' }}>Streak</div>
            </div>
          </div>
          
          {/* Suggestion */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: window.innerWidth <= 480 ? '10px' : '12px',
            padding: window.innerWidth <= 480 ? '10px 12px' : window.innerWidth <= 768 ? '12px 16px' : '16px 20px',
            marginBottom: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '24px' : '32px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            maxWidth: '100%'
          }}>
            <p style={{
              fontSize: window.innerWidth <= 480 ? '13px' : window.innerWidth <= 768 ? '14px' : '16px',
              color: '#16a34a',
              margin: 0,
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              💡 {suggestion}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: window.innerWidth <= 480 ? '8px' : window.innerWidth <= 768 ? '12px' : '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
            maxWidth: '100%'
          }}>
            <button
              onClick={() => {
                setDone(false);
                setCurrent(0);
                setInput('');
                setCorrect(false);
                setWpm(null);
                setScore(0);
                setStreak(0);
                setMaxStreak(0);
                setPerfectCount(0);
                setAchievements([]);
                setLevel(1);
                setXp(0);
                setStartTime(null);
                setEndTime(null);
              }}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: window.innerWidth <= 480 ? '10px' : '12px',
                padding: window.innerWidth <= 480 ? '12px 16px' : window.innerWidth <= 768 ? '12px 20px' : '12px 24px',
                fontSize: window.innerWidth <= 480 ? '13px' : window.innerWidth <= 768 ? '14px' : '16px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                width: window.innerWidth <= 480 ? '100%' : 'auto',
                minWidth: window.innerWidth <= 480 ? 'auto' : '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
              }}
            >
              Học lại
            </button>
            
            <button
              onClick={() => setSelectedTopic(null)}
              style={{
                background: 'transparent',
                color: '#6366f1',
                border: '2px solid #6366f1',
                borderRadius: window.innerWidth <= 480 ? '10px' : '12px',
                padding: window.innerWidth <= 480 ? '10px 16px' : window.innerWidth <= 768 ? '10px 20px' : '10px 24px',
                fontSize: window.innerWidth <= 480 ? '13px' : window.innerWidth <= 768 ? '14px' : '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: window.innerWidth <= 480 ? '100%' : 'auto',
                minWidth: window.innerWidth <= 480 ? 'auto' : '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6366f1';
              }}
            >
              Chọn chủ đề khác
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Học từ vựng', path: '/learn' }
          ]}
        />
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        borderRadius: window.innerWidth <= 768 ? '16px' : '20px',
        padding: window.innerWidth <= 768 ? '20px' : '24px',
        marginBottom: window.innerWidth <= 768 ? '20px' : '32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{
        display: 'flex',
        alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          gap: window.innerWidth <= 768 ? '16px' : '0'
        }}>
          <div>
            <h1 style={{
              fontSize: window.innerWidth <= 768 ? '22px' : '28px',
              fontWeight: '900',
              color: '#1e293b',
              margin: '0 0 8px 0',
              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
            }}>
              {topics.find(t => t.id === selectedTopic)?.title || 'Học từ vựng'}
            </h1>
            <p style={{
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              color: '#64748b',
              margin: 0,
              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
            }}>
              Từ {current + 1} / {vocabList.length}
            </p>
          </div>
          
          {/* Live Stats */}
          <div style={{
            display: 'flex',
            gap: window.innerWidth <= 768 ? '12px' : '16px',
            alignItems: 'center',
            justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
            }}>
              <div style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px', fontWeight: '800' }}>{score}</div>
              <div style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px', opacity: '0.9' }}>Điểm</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
              borderRadius: '12px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}>
              <div style={{ fontSize: window.innerWidth <= 768 ? '14px' : '16px', fontWeight: '800' }}>{streak}</div>
              <div style={{ fontSize: window.innerWidth <= 768 ? '10px' : '12px', opacity: '0.9' }}>Streak</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            height: '100%',
            width: `${((current + 1) / vocabList.length) * 100}%`,
            transition: 'width 0.3s ease',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        borderRadius: window.innerWidth <= 768 ? '16px' : '24px',
        padding: window.innerWidth <= 768 ? '24px' : '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Celebration Effects */}
        {showCelebration && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '60px',
            zIndex: 10,
            animation: 'bounce 1s ease-out'
          }}>
            🎉
          </div>
        )}
        
        {/* Level Up Notification */}
        {showLevelUp && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '800',
            zIndex: 10,
            animation: 'slideDown 0.5s ease-out',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
          }}>
            🚀 Level Up! Level {level}
          </div>
        )}
        
        {/* Word Display - Only show when correct */}
        {correct && (
        <div style={{
            fontSize: window.innerWidth <= 768 ? '32px' : '48px',
          fontWeight: '900',
            color: '#22c55e',
            marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
            letterSpacing: window.innerWidth <= 768 ? '1px' : '2px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            ✅ {vocabList[current]?.word || ''}
        </div>
        )}
        
        {/* Hint for English word */}
        {!correct && (
          <div style={{
            fontSize: window.innerWidth <= 768 ? '18px' : '24px',
            color: '#f59e0b',
            marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
            textAlign: 'center',
            fontWeight: '600',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '2px dashed rgba(245, 158, 11, 0.3)'
          }}>
            💡 Nhập từ tiếng Anh tương ứng với nghĩa bên dưới
          </div>
        )}
        
        {/* Meaning */}
        <div style={{
          fontSize: window.innerWidth <= 768 ? '18px' : '24px',
          color: '#64748b',
          marginBottom: window.innerWidth <= 768 ? '16px' : '20px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          {vocabList[current]?.meaning || ''}
        </div>
        
        {/* Pronunciation Section */}
        {vocabList[current]?.phonetic && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '16px' : '20px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            {/* <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>🔊</span>
              <h4 style={{
                fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                fontWeight: '700',
                color: '#6366f1',
                margin: 0
              }}>
                Phiên âm
              </h4>
            </div> */}
            <div style={{
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              color: '#4b5563',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              fontWeight: '500'
            }}>
              /{vocabList[current].phonetic}/
            </div>
          </div>
        )}
        
        {/* Example Sentences */}
        {vocabList[current]?.example && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '16px' : '20px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '24px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <h4 style={{
                fontSize: window.innerWidth <= 768 ? '16px' : '18px',
                fontWeight: '700',
                color: '#22c55e',
                margin: 0
              }}>
                Ví dụ
              </h4>
            </div>
            <div style={{
              fontSize: window.innerWidth <= 768 ? '14px' : '16px',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>
              {vocabList[current].example}
            </div>
          </div>
        )}
        
        {/* Image */}
          {vocabList[current]?.image_url && (
          <div style={{
            marginBottom: window.innerWidth <= 768 ? '24px' : '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
              <img
                src={vocabList[current].image_url}
                alt={vocabList[current].word}
                onClick={() => setShowImage(true)}
              style={{
                maxWidth: window.innerWidth <= 768 ? '250px' : '300px',
                maxHeight: window.innerWidth <= 768 ? '150px' : '200px',
                borderRadius: '16px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                objectFit: 'cover'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
            </div>
          )}
        
        {/* Audio Button */}
          {vocabList[current]?.audio_url && (
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                const audio = new Audio(vocabList[current].audio_url);
                audio.play();
              }}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 12px 35px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
              }}
            >
              🔊
            </button>
          </div>
        )}
        
        {/* Input Field */}
        <div style={{
          marginBottom: window.innerWidth <= 768 ? '24px' : '32px'
        }}>
        <input
            ref={inputRef}
          value={input}
          onChange={handleInput}
            placeholder={correct ? "Tuyệt vời! ✅" : "Nhập từ tiếng Anh..."}
            style={{
              // width: '100%',
              maxWidth: window.innerWidth <= 768 ? '100%' : '400px',
              padding: window.innerWidth <= 768 ? '12px 20px' : '16px 24px',
              border: correct ? '3px solid #22c55e' : '2px solid #e5e7eb',
              borderRadius: '16px',
              fontSize: window.innerWidth <= 768 ? '16px' : '20px',
              textAlign: 'center',
              background: correct ? '#f0fdf4' : '#f9fafb',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: correct ? '0 0 0 3px rgba(34, 197, 94, 0.1)' : 'none'
            }}
            onFocus={(e) => {
              if (!correct) {
                e.target.style.borderColor = '#6366f1';
                e.target.style.background = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
              }
            }}
            onBlur={(e) => {
              if (!correct) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }
            }}
          />
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedTopic(null)}
          style={{
            background: 'transparent',
            color: '#64748b',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: window.innerWidth <= 768 ? '10px 20px' : '12px 24px',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            width: window.innerWidth <= 768 ? '100%' : 'auto'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#6366f1';
            e.target.style.color = '#6366f1';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#64748b';
          }}
        >
          Quay lại chủ đề
        </button>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-20px); }
          60% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
      
      {/* Image Modal */}
      {showImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(30,41,59,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} onClick={() => setShowImage(false)}>
          <img
            src={vocabList[current]?.image_url}
            alt={vocabList[current]?.word}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 24,
              boxShadow: '0 8px 40px #0008',
              background: '#fff',
              padding: 12,
              objectFit: 'contain',
              cursor: 'zoom-out',
              border: '4px solid #fff',
            }}
          />
        </div>
      )}
      </div>
      
      <ToastContainer position="top-center" />
    </div>
  );
}
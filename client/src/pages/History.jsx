import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaChartLine, FaTrophy, FaClock, FaSearch, FaCalendarAlt, FaKeyboard, FaBullseye, FaFire, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function History() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/learner/${user.id}/history`, {
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
    })
      .then(r => r.json())
      .then(data => { 
        setHistory(data || []); 
        setLoading(false); 
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, [user]);

  // Load dashboard stats (active_days_30d, streak)
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/learner/${user.id}/dashboard`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        });
        if (res.ok) {
          const data = await res.json();
          setDashStats(data?.stats || null);
        }
      } catch (_) {}
    };
    loadDashboard();
  }, [user]);

  // Load today's learning summary for vocab-based stats
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

  const filteredHistory = history
    .filter(h => {
      const date = new Date(h.created_at);
      const now = new Date();
      const filterDate = new Date();
      
      switch (filter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return true;
      }
      
      return filter === 'all' || date >= filterDate;
    })
    .filter(h => 
      searchTerm === '' || 
      h.wpm.toString().includes(searchTerm) ||
      h.accuracy.toString().includes(searchTerm) ||
      new Date(h.created_at).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'wpm':
          aVal = a.wpm;
          bVal = b.wpm;
          break;
        case 'accuracy':
          aVal = a.accuracy;
          bVal = b.accuracy;
          break;
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const validAccuracies = history
    .map(h => Number(h?.accuracy))
    .filter(v => Number.isFinite(v));
  const uniqueActiveDays = new Set(
    history.map(h => {
      const d = new Date(h.created_at);
      d.setHours(0,0,0,0);
      return d.toISOString();
    })
  ).size;

  // Compute today metrics from learning-summary
  const sessionsToday = (() => {
    const set = new Set();
    (learnSummary?.vocabDetails || []).forEach(v => {
      const key = `${v?.topic_name || ''}|${v?.chapter_id || ''}`;
      set.add(key);
    });
    return set.size;
  })();
  const uniqueTodayCount = (() => {
    const set = new Set();
    (learnSummary?.vocabDetails || []).forEach(v => { if (v?.word) set.add(v.word); });
    return set.size;
  })();

  const stats = {
    totalSessions: sessionsToday, // show sessions today instead of typingrecord count
    avgAccuracy: uniqueTodayCount, // repurpose card to show words learned today
    totalWords: history.reduce((sum, h) => sum + (Number(h?.words_typed) || 0), 0),
    activeDays: dashStats?.active_days_30d ?? uniqueActiveDays,
    streak: dashStats?.streak ?? calculateStreak(history)
  };

  // Build today's session list grouped by topic · chapter
  const sessionList = (() => {
    const map = new Map();
    (learnSummary?.vocabDetails || []).forEach(v => {
      const key = `${v?.topic_name || 'Chủ đề'}|${v?.chapter_id || ''}|${v?.chapter_name || ''}`;
      const prev = map.get(key) || { topic: v?.topic_name || 'Chủ đề', chapter: v?.chapter_name || '', count: 0, last: null };
      prev.count += 1;
      const t = new Date(v?.learned_at);
      if (!prev.last || t > prev.last) prev.last = t;
      map.set(key, prev);
    });
    return Array.from(map.values()).sort((a,b) => b.last - a.last);
  })();

  function calculateStreak(history) {
    if (history.length === 0) return 0;
    
    const sortedHistory = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const sessionDate = new Date(sortedHistory[i].created_at);
      sessionDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate - sessionDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak + 1) {
        break;
      }
    }
    
    return streak;
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Đang tải lịch sử...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="history-container" style={{
      minHeight: '100vh',
      //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 0 }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Thống kê', path: '/progress' },
            { label: 'Lịch sử', path: '/history' }
          ]}
        />
        
        {/* Header */}
        <div className="history-header" style={{
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
                Lịch sử luyện tập
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#64748b',
                margin: 0
              }}>
                Theo dõi tiến độ và thành tích của bạn
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <FaFire style={{ color: '#f59e0b', fontSize: '20px' }} />
              <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '16px' }}>
                {stats.streak} ngày streak
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="history-stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              <FaKeyboard style={{ fontSize: '32px', marginBottom: '12px', opacity: '0.9' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>{stats.totalSessions}</div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>Phiên học từ mới hôm nay</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
            }}>
              <FaCalendarAlt style={{ fontSize: '32px', marginBottom: '12px', opacity: '0.9' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>{stats.activeDays}</div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>Số ngày hoạt động</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(251, 146, 60, 0.3)'
            }}>
              <FaFire style={{ fontSize: '32px', marginBottom: '12px', opacity: '0.9' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>{stats.streak}</div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>Chuỗi ngày học</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(67, 233, 123, 0.3)'
            }}>
              <FaChartLine style={{ fontSize: '32px', marginBottom: '12px', opacity: '0.9' }} />
              <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '4px' }}>{stats.avgAccuracy}</div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>Từ duy nhất đã học hôm nay</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="history-filters" style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '16px'
              }} />
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="year">1 năm qua</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '16px',
                background: '#f8fafc',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="date">Sắp xếp theo ngày</option>
              <option value="wpm">Sắp xếp theo WPM</option>
              <option value="accuracy">Sắp xếp theo độ chính xác</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#6366f1',
                transition: 'all 0.3s ease'
              }}
            >
              {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
              {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </button>
          </div>
        </div>

        {/* History Table */}
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
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaCalendarAlt style={{ color: '#6366f1' }} />
            Chi tiết lịch sử ({sessionList.length} phiên)
          </h3>
          
          {sessionList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <FaClock style={{ fontSize: '48px', marginBottom: '16px', opacity: '0.5' }} />
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {'Chưa có hoạt động học tập hôm nay'}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.8' }}>
                {'Hãy bắt đầu học từ mới để xem tổng kết ở đây!'}
              </div>
            </div>
          ) : (
            <div className="history-list" style={{
              background: '#f8fafc',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 120px',
                gap: '0',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px'
              }}>
                <div style={{ padding: '16px 20px' }}>Thời gian</div>
                <div style={{ padding: '16px 20px' }}>Chủ đề · Chương</div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>Số từ</div>
              </div>
              
              {sessionList.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 120px',
                    gap: '0',
                    background: i % 2 === 0 ? '#fff' : '#f8fafc',
                    borderBottom: i < filteredHistory.length - 1 ? '1px solid #e2e8f0' : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e7ff';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f8fafc';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ padding: '16px 20px', color: '#374151' }}>
                    {s.last ? s.last.toLocaleString('vi-VN') : ''}
                  </div>
                  <div style={{ padding: '16px 20px', color: '#374151' }}>
                    {s.topic}{s.chapter ? ` · ${s.chapter}` : ''}
                  </div>
                  <div style={{
                    padding: '16px 20px',
                    textAlign: 'center',
                    color: '#6366f1',
                    fontWeight: '600'
                  }}>
                    {s.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Responsive CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .history-container {
            padding: 12px !important;
          }
          
          .history-header {
            padding: 20px !important;
            margin-bottom: 20px !important;
          }
          
          .history-header h1 {
            font-size: 24px !important;
            margin-bottom: 8px !important;
          }
          
          .history-header p {
            font-size: 14px !important;
            margin-bottom: 16px !important;
          }
          
          .history-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
          }
          
          .history-stats-grid > div {
            padding: 16px !important;
          }
          
          .history-stats-grid > div > div:first-of-type {
            font-size: 20px !important;
          }
          
          .history-stats-grid > div > div:last-of-type {
            font-size: 12px !important;
          }
          
          .history-filters {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: stretch !important;
          }
          
          .history-filters > div {
            min-width: unset !important;
            flex: unset !important;
          }
          
          .history-filters input,
          .history-filters select {
            width: 100% !important;
            padding: 12px !important;
            font-size: 14px !important;
          }
          
          .history-filters button {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
          
          /* History list responsive */
          .history-list {
            gap: 12px !important;
          }
          
          .history-item {
            padding: 16px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          
          .history-item-info {
            width: 100% !important;
          }
          
          .history-item-info h3 {
            font-size: 16px !important;
            margin-bottom: 4px !important;
          }
          
          .history-item-info p {
            font-size: 13px !important;
            margin-bottom: 8px !important;
          }
          
          .history-item-stats {
            width: 100% !important;
            justify-content: space-between !important;
          }
          
          .history-item-stats > div {
            text-align: center !important;
          }
          
          .history-item-stats > div > div:first-of-type {
            font-size: 18px !important;
          }
          
          .history-item-stats > div > div:last-of-type {
            font-size: 11px !important;
          }
          
          .history-item-badge {
            align-self: flex-end !important;
          }
        }
        
        @media (max-width: 480px) {
          .history-container {
            padding: 8px !important;
          }
          
          .history-header {
            padding: 16px !important;
          }
          
          .history-header h1 {
            font-size: 20px !important;
          }
          
          .history-header p {
            font-size: 13px !important;
          }
          
          .history-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          
          .history-stats-grid > div {
            padding: 12px !important;
          }
          
          .history-stats-grid > div > div:first-of-type {
            font-size: 18px !important;
          }
          
          .history-stats-grid > div > div:last-of-type {
            font-size: 11px !important;
          }
          
          .history-item {
            padding: 12px !important;
          }
          
          .history-item-info h3 {
            font-size: 15px !important;
          }
          
          .history-item-info p {
            font-size: 12px !important;
          }
          
          .history-item-stats > div > div:first-of-type {
            font-size: 16px !important;
          }
          
          .history-item-stats > div > div:last-of-type {
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

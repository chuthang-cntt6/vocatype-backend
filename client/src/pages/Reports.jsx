import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { 
  FaChartLine, 
  FaTrophy, 
  FaClock, 
  FaKeyboard, 
  FaFire, 
  FaArrowUp, 
  FaArrowDown,
  FaBook,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';

export default function Reports() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [filter, setFilter] = useState('all'); // all, week, month, year
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [stats, setStats] = useState({
    totalSessions: 0,
    daysActive: 0,
    totalTime: 0
  });
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user, filter]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyResponse, dashboardResponse, learnSummaryRes] = await Promise.all([
        fetch(`/api/learner/${user.id}/history`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        }),
        fetch(`/api/learner/${user.id}/dashboard`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        }),
        fetch(`/api/learner/${user.id}/learning-summary`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        })
      ]);
      
      const historyData = await historyResponse.json();
      const dashboardData = await dashboardResponse.json();
      const learnData = await learnSummaryRes.json();
      
      setHistory(historyData || []);
      setDashboard(dashboardData);
      setLearnSummary({ summary: learnData?.summary || [], vocabDetails: learnData?.vocabDetails || [] });
      
      // Tính toán thống kê dựa trên filter
      calculateStats(historyData || [], dashboardData, filter);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (historyData, dashboardData, timeFilter) => {
    // Use learning-based stats instead of WPM/accuracy
    const ds = dashboardData?.stats || {};
    const sessionsAll = ds.learn_sessions_total || 0;
    const sessionsToday = ds.learn_sessions_today || 0;
    const active30 = ds.active_days_30d || 0;
    // Fallbacks from learnSummary if dashboard stats missing
    const ls = learnSummary;
    const daysFromLearn = (() => {
      const set = new Set();
      (ls?.vocabDetails || []).forEach(v => {
        const d = new Date(v?.learned_at);
        d.setHours(0,0,0,0);
        set.add(d.toISOString().split('T')[0]);
      });
      return set.size;
    })();
    const sessionsFromLearn = (() => {
      const set = new Set();
      (ls?.vocabDetails || []).forEach(v => {
        const key = `${v?.topic_name || ''}|${v?.chapter_id || ''}`;
        set.add(key);
      });
      return set.size;
    })();

    let totalSessions = sessionsAll;
    let daysActive = active30;
    if (timeFilter === 'week' || timeFilter === 'month' || timeFilter === 'year') {
      // For now, show today's sessions for filtered views if no range API
      totalSessions = sessionsToday;
      if (timeFilter === 'week') daysActive = Math.min(active30, 7);
      if (timeFilter === 'month') daysActive = active30;
      if (timeFilter === 'year') daysActive = active30; // placeholder
    }
    // Apply fallbacks if stats are zero but we have learnSummary
    if (!totalSessions && sessionsFromLearn) totalSessions = sessionsFromLearn;
    if (!daysActive && daysFromLearn) daysActive = daysFromLearn;

    setStats({
      totalSessions,
      daysActive,
      totalTime: 0
    });
  };

  // Removed streak calculation (now computed on backend and not shown here)

  const formatTime = (seconds) => {
    if (!seconds) return '0 phút';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px'
        }}>
          <Icon />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280',
            fontSize: '14px',
            fontWeight: 600
          }}>
            {trend > 0 ? <FaArrowUp size={12} /> : trend < 0 ? <FaArrowDown size={12} /> : null}
            {trend !== 0 && `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
     // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: isMobile ? '12px' : '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PageBreadcrumb 
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Báo cáo', path: '/reports' },
            { label: 'Báo cáo học tập', path: '/reports' }
          ]}
          backgroundColor="rgba(255,255,255,0.9)"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          marginBottom={isMobile ? '12px' : '24px'}
        />

        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: isMobile ? '20px' : '32px', 
          marginBottom: isMobile ? '16px' : '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'start' : 'center', gap: isMobile ? '12px' : '0', flexDirection: isMobile ? 'column' : 'row', marginBottom: isMobile ? '16px' : '24px' }}>
            <div>
              <h1 style={{ 
                fontSize: isMobile ? '24px' : '32px', 
                fontWeight: 700, 
                color: '#1f2937', 
                margin: 0,
                marginBottom: '8px'
              }}>
                Báo cáo học tập
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
                Tổng hợp thống kê và báo cáo về quá trình học tập của bạn
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'week', 'month', 'year'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: filter === f ? '#6366f1' : '#f3f4f6',
                    color: filter === f ? 'white' : '#6b7280',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaFilter size={12} />
                  {f === 'all' ? 'Tất cả' : f === 'week' ? '7 ngày' : f === 'month' ? '30 ngày' : '1 năm'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '150px' : '250px'}, 1fr))`, 
            gap: isMobile ? '12px' : '20px',
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            <StatCard
              icon={FaClock}
              title="Tổng số phiên học"
              value={stats.totalSessions}
              subtitle={`${filter === 'all' ? 'Tất cả thời gian' : filter === 'week' ? '7 ngày qua' : filter === 'month' ? '30 ngày qua' : '1 năm qua'}`}
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <StatCard
              icon={FaCalendarAlt}
              title="Số ngày hoạt động"
              value={stats.daysActive}
              subtitle={filter === 'all' ? 'Tất cả thời gian' : filter === 'week' ? 'Trong 7 ngày' : filter === 'month' ? 'Trong 30 ngày' : 'Trong 1 năm'}
              color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            {/* Remove total time and streak for now */}
          </div>


          {/* Bảng chi tiết */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px' }}>
              Lịch sử học tập gần đây
            </h3>
            <div style={{ 
              overflowX: 'auto',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      <FaCalendarAlt style={{ marginRight: '8px' }} />
                      Thời gian
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Chủ đề · Chương
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Số từ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const map = new Map();
                    (learnSummary?.vocabDetails || []).forEach(v => {
                      const key = `${v?.topic_name || 'Chủ đề'}|${v?.chapter_id || ''}|${v?.chapter_name || ''}`;
                      const prev = map.get(key) || { topic: v?.topic_name || 'Chủ đề', chapter: v?.chapter_name || '', count: 0, last: null };
                      prev.count += 1;
                      const t = new Date(v?.learned_at);
                      if (!prev.last || t > prev.last) prev.last = t;
                      map.set(key, prev);
                    });
                    const list = Array.from(map.values()).sort((a,b) => b.last - a.last);
                    return list.length > 0 ? list.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{s.last ? s.last.toLocaleString('vi-VN') : ''}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{s.topic}{s.chapter ? ` · ${s.chapter}` : ''}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>{s.count}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                          Chưa có dữ liệu học tập hôm nay
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


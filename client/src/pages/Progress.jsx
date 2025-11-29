import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { 
  FaChartLine, 
  FaTrophy, 
  FaArrowUp, 
  FaArrowDown,
  FaLongArrowAltUp,
  FaLongArrowAltDown,
  FaCalendarAlt,
  FaBullseye,
  FaFire,
  FaClock
} from 'react-icons/fa';

export default function Progress() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [progressData, setProgressData] = useState({
    dailyActivity: [], // {date, words, sessions}
    daysActive: 0,
    totalTime: 0
  });
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user, timeRange]);

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
      
      // Tính toán dữ liệu tiến độ theo học từ mới
      calculateProgress(learnData?.vocabDetails || [], timeRange, dashboardData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (vocabDetails, range, dashData) => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (range) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Lọc theo ngày
    const filtered = (vocabDetails || []).filter(v => new Date(v.learned_at) >= filterDate);
    const dailyMap = new Map();
    filtered.forEach(v => {
      const d = new Date(v.learned_at);
      const key = d.toLocaleDateString('vi-VN');
      const rec = dailyMap.get(key) || { wordsSet: new Set(), sessionKeys: new Set() };
      if (v?.word) rec.wordsSet.add(v.word);
      const sKey = `${v?.topic_name || ''}|${v?.chapter_id || ''}`;
      rec.sessionKeys.add(sKey);
      dailyMap.set(key, rec);
    });
    const dailyActivity = Array.from(dailyMap.entries())
      .map(([date, rec]) => ({ date, words: rec.wordsSet.size, sessions: rec.sessionKeys.size }))
      .sort((a,b) => new Date(a.date) - new Date(b.date));
    // Prefer dashboard stats for active days within 30d
    const activeFromDash = (dashData?.stats?.active_days_30d) ?? (dashboard?.stats?.active_days_30d);
    let daysActive = activeFromDash || dailyActivity.length;
    if (range === 'week') daysActive = Math.min(daysActive, 7);
    if (range === 'year') daysActive = daysActive; // simple fallback
    setProgressData({ dailyActivity, daysActive, totalTime: 0 });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0 phút';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  const calculateTrend = (values) => {
    if (!values || values.length < 2) return 0;
    const first = values.slice(0, Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.max(1, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2)).reduce((a, b) => a + b, 0) / Math.max(1, Math.ceil(values.length / 2));
    return Math.round(((second - first) / (first || 1)) * 100);
  };
  const wordsTrendValue = calculateTrend(progressData.dailyActivity.map(d => d.words));

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div style={{
      background: bgColor || 'white',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500, marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>
            {value}
          </div>
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#6b7280',
            fontSize: '14px',
            fontWeight: 600
          }}>
            {trend > 0 ? <FaLongArrowAltUp size={16} /> : trend < 0 ? <FaLongArrowAltDown size={16} /> : null}
            {trend !== 0 && `${Math.abs(trend)}%`}
          </div>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
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

  const maxWords = Math.max(...progressData.dailyActivity.map(d => d.words), 1);

  return (
    <div style={{ 
      minHeight: '100vh', 
      // background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PageBreadcrumb 
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Báo cáo', path: '/reports' },
            { label: 'Thống kê tiến độ', path: '/progress' }
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
                Thống kê tiến độ
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
                Theo dõi sự tiến bộ của bạn theo thời gian
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['week', 'month', 'year'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: timeRange === r ? '#6366f1' : '#f3f4f6',
                    color: timeRange === r ? 'white' : '#6b7280',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  {r === 'week' ? '7 ngày' : r === 'month' ? '30 ngày' : '1 năm'}
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
              icon={FaBullseye}
              title="Xu hướng từ/ngày"
              value={progressData.dailyActivity.length > 0 ? `${progressData.dailyActivity[progressData.dailyActivity.length - 1].words} từ` : '0 từ'}
              subtitle="Số từ duy nhất mỗi ngày"
              trend={wordsTrendValue}
              color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            />
            <StatCard
              icon={FaFire}
              title="Tổng số phiên"
              value={(progressData.dailyActivity.reduce((sum, d) => sum + d.sessions, 0)) || (dashboard?.stats?.learn_sessions_total || 0)}
              subtitle="Phiên học trong kỳ"
              color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            />
            <StatCard
              icon={FaCalendarAlt}
              title="Số ngày hoạt động"
              value={progressData.daysActive}
              subtitle={timeRange === 'week' ? 'Trong 7 ngày' : timeRange === 'month' ? 'Trong 30 ngày' : 'Trong 1 năm'}
              color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            <StatCard
              icon={FaClock}
              title="Tổng thời gian học"
              value={formatTime(progressData.totalTime)}
              subtitle={timeRange === 'week' ? 'Trong 7 ngày' : timeRange === 'month' ? 'Trong 30 ngày' : 'Trong 1 năm'}
              color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            />
          </div>


          {/* Biểu đồ từ/ngày */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBullseye /> Số từ duy nhất theo ngày
            </h3>
            <div style={{ 
              height: '250px', 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '4px',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {progressData.dailyActivity.map((d, idx) => {
                const height = (d.words / maxWords) * 100;
                return (
                  <div key={idx} style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '100%',
                      height: `${height}%`,
                      background: 'linear-gradient(180deg, #43e97b 0%, #38f9d7 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                      e.currentTarget.style.transform = 'scaleY(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scaleY(1)';
                    }}
                    title={`${d.date}: ${d.words} từ (${d.sessions} phiên)`}
                    />
                    <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                      {new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              {progressData.dailyActivity.length === 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  color: '#9ca3af',
                  fontSize: '14px'
                }}>
                  Chưa có dữ liệu trong khoảng thời gian này
                </div>
              )}
            </div>
          </div>
          {/* Thống kê theo tuần: có thể bổ sung sau với dữ liệu học từ mới */}
        </div>
      </div>
    </div>
  );
}


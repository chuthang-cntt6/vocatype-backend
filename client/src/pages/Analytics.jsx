import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { 
  FaChartLine, 
  FaTrophy, 
  FaLightbulb,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFire,
  FaBullseye,
  FaBrain,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaStar
} from 'react-icons/fa';

export default function Analytics() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });
  const [analytics, setAnalytics] = useState({
    todayWords: 0,
    todaySessions: 0,
    activeDays30: 0,
    strengths: [],
    weaknesses: [],
    recommendations: []
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchData();
  }, [user]);

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
      
      analyzeData(historyData || [], dashboardData, learnData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (historyData, dashboardData, learnData) => {
    const ds = dashboardData?.stats || {};
    const vocabDetails = learnData?.vocabDetails || [];
    const todayWords = (() => { const s=new Set(); vocabDetails.forEach(v=>{ if(v?.word) s.add(v.word); }); return s.size; })();
    const todaySessions = ds.learn_sessions_today || 0;
    const activeDays30 = ds.active_days_30d || 0;

    // Điểm mạnh/yếu dựa trên thói quen học
    const strengths = [];
    if (todayWords >= 20) strengths.push({ text: 'Hoàn thành mục tiêu từ vựng ngày', icon: FaCheckCircle, color: '#10b981' });
    if ((historyData || []).length >= 20) strengths.push({ text: 'Luyện tập thường xuyên', icon: FaFire, color: '#ef4444' });

    const weaknesses = [];
    if (todayWords < 3) {
      weaknesses.push({ text: 'Hôm nay chưa khởi động từ vựng', icon: FaExclamationTriangle, color: '#ef4444' });
    }
    if ((historyData || []).length < 10) {
      weaknesses.push({ text: 'Cần luyện tập nhiều hơn', icon: FaBullseye, color: '#6366f1' });
    }

    // Đề xuất
    const recommendations = [];
    if (todayWords < 10) {
      recommendations.push('Hôm nay đặt mục tiêu 10–15 từ. Bắt đầu với 3 từ để khởi động.');
    }
    if ((historyData || []).length < 20) {
      recommendations.push('Luyện tập thường xuyên hơn để cải thiện kỹ năng. Mục tiêu: ít nhất 3-4 phiên mỗi tuần.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Bạn đang làm rất tốt! Tiếp tục duy trì và thử thách bản thân với các bài tập khó hơn.');
    }

    setAnalytics({
      todayWords,
      todaySessions,
      activeDays30,
      strengths,
      weaknesses,
      recommendations
    });

    // Tạo insights
    const newInsights = [];
    if (todayWords >= 20) {
      newInsights.push({ type: 'success', title: 'Hoàn thành mục tiêu ngày!', message: 'Bạn đã học ≥20 từ hôm nay.', icon: FaCheckCircle });
    }
    if ((historyData || []).length >= 50) {
      newInsights.push({
        type: 'info',
        title: 'Kiên trì!',
        message: `Bạn đã hoàn thành ${historyData.length} phiên luyện tập. Sự kiên trì sẽ đưa bạn đến thành công!`,
        icon: FaTrophy
      });
    }

    setInsights(newInsights);
  };

  const ScoreCard = ({ title, score, maxScore, color, icon: Icon }) => {
    const percentage = maxScore ? (score / maxScore) * 100 : 0;
    return (
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
            <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
              {title}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>
              {score}/{maxScore}
            </div>
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>
    );
  };

  const InsightCard = ({ insight }) => {
    const colors = {
      success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
    };
    const color = colors[insight.type] || colors.info;
    const Icon = insight.icon;

    return (
      <div style={{
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'start',
        gap: '12px'
      }}>
        <div style={{
          color: color.border,
          fontSize: '20px',
          flexShrink: 0
        }}>
          <Icon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: color.text, marginBottom: '4px' }}>
            {insight.title}
          </div>
          <div style={{ fontSize: '14px', color: color.text, opacity: 0.9 }}>
            {insight.message}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Đang phân tích dữ liệu...</div>
      </div>
    );
  }
  return (
    <div style={{ 
      minHeight: '100vh', 
      //background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: isMobile ? '12px' : '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <PageBreadcrumb 
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Báo cáo', path: '/reports' },
            { label: 'Phân tích kết quả', path: '/analytics' }
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
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 700, 
              color: '#1f2937', 
              margin: 0,
              marginBottom: '8px'
            }}>
              Phân tích kết quả
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Phân tích chi tiết và đánh giá hiệu suất học tập của bạn
            </p>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLightbulb /> Nhận xét nhanh
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Score Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '150px' : '250px'}, 1fr))`, 
            gap: isMobile ? '12px' : '20px',
            marginBottom: isMobile ? '20px' : '32px'
          }}>
            <ScoreCard title="Từ duy nhất hôm nay" score={analytics.todayWords} maxScore={20} color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" icon={FaChartBar} />
            <ScoreCard title="Phiên học hôm nay" score={analytics.todaySessions} maxScore={10} color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" icon={FaBullseye} />
            <ScoreCard title="Số ngày hoạt động (30d)" score={analytics.activeDays30} maxScore={30} color="linear-gradient(135deg, #10b981 0%, #059669 100%)" icon={FaArrowUp} />
          </div>

          {/* Strengths and Weaknesses */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Strengths */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheckCircle style={{ color: '#10b981' }} /> Điểm mạnh
              </h3>
              {analytics.strengths.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.strengths.map((strength, idx) => {
                    const Icon = strength.icon;
                    return (
                      <div key={idx} style={{
                        background: '#f0fdf4',
                        border: `2px solid ${strength.color}`,
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Icon style={{ color: strength.color, fontSize: '20px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#065f46' }}>
                          {strength.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  Tiếp tục luyện tập để phát hiện điểm mạnh!
                </div>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaExclamationTriangle style={{ color: '#f59e0b' }} /> Cần cải thiện
              </h3>
              {analytics.weaknesses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.weaknesses.map((weakness, idx) => {
                    const Icon = weakness.icon;
                    return (
                      <div key={idx} style={{
                        background: '#fffbeb',
                        border: `2px solid ${weakness.color}`,
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Icon style={{ color: weakness.color, fontSize: '20px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#92400e' }}>
                          {weakness.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  Tuyệt vời! Bạn không có điểm yếu nào cần cải thiện.
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBrain style={{ color: '#6366f1' }} /> Đề xuất cải thiện
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analytics.recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  border: '2px solid #6366f1',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'start',
                  gap: '12px'
                }}>
                  <FaLightbulb style={{ color: '#6366f1', fontSize: '20px', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


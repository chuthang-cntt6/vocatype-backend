import React, { useContext, useRef, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaTrophy, FaMedal, FaStar, FaChartLine, FaKeyboard, FaBullseye, FaFire, FaCrown, FaGem, FaRocket, FaAward, FaCog, FaUser, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import PageBreadcrumb from '../components/PageBreadcrumb';

const achievements = [
  { 
    id: 'first_session', 
    icon: '🎯', 
    label: 'Bắt đầu', 
    desc: 'Hoàn thành phiên luyện tập đầu tiên', 
    condition: (stats) => stats.totalSessions >= 1,
    color: '#3b82f6'
  },
  { 
    id: 'speed_demon', 
    icon: '⚡', 
    label: 'Tốc độ', 
    desc: 'Đạt 50 WPM', 
    condition: (stats) => stats.bestWpm >= 50,
    color: '#f59e0b'
  },
  { 
    id: 'accuracy_master', 
    icon: '🎯', 
    label: 'Chính xác', 
    desc: 'Đạt 95% độ chính xác', 
    condition: (stats) => stats.bestAccuracy >= 95,
    color: '#22c55e'
  },
  { 
    id: 'streak_king', 
    icon: '🔥', 
    label: 'Streak', 
    desc: 'Luyện tập 7 ngày liên tiếp', 
    condition: (stats) => stats.streak >= 7,
    color: '#ef4444'
  },
  { 
    id: 'word_master', 
    icon: '📚', 
    label: 'Từ vựng', 
    desc: 'Gõ 1000 từ', 
    condition: (stats) => stats.totalWords >= 1000,
    color: '#8b5cf6'
  },
  { 
    id: 'perfectionist', 
    icon: '⭐', 
    label: 'Hoàn hảo', 
    desc: 'Đạt 100% độ chính xác', 
    condition: (stats) => stats.bestAccuracy >= 100,
    color: '#f59e0b'
  },
  { 
    id: 'speed_legend', 
    icon: '🚀', 
    label: 'Huyền thoại', 
    desc: 'Đạt 100 WPM', 
    condition: (stats) => stats.bestWpm >= 100,
    color: '#06b6d4'
  },
  { 
    id: 'dedication', 
    icon: '💎', 
    label: 'Cống hiến', 
    desc: 'Luyện tập 30 ngày', 
    condition: (stats) => stats.totalSessions >= 30,
    color: '#84cc16'
  }
];

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const fileInputRef = useRef();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('profileActiveTab') || 'profile';
  });
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    totalWords: 0,
    activeDays: 0,
    streak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserHistory();
    }
  }, [user?.id]);

  // Lưu activeTab vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('profileActiveTab', activeTab);
  }, [activeTab]);

  const fetchUserHistory = async () => {
    try {
      // Fetch both history and dashboard data
      const [historyResponse, dashboardResponse] = await Promise.all([
        fetch(`/api/learner/${user.id}/history`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        }),
        fetch(`/api/learner/${user.id}/dashboard`, {
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
        })
      ]);
      
      const history = await historyResponse.json();
      const dashboard = await dashboardResponse.json();
      
      if (Array.isArray(history) && dashboard?.stats) {
        calculateStats(history, dashboard.stats);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const calculateStats = (history, dashboardStats) => {
    if (!history || history.length === 0) {
      // Reset stats về 0 nếu không có dữ liệu, nhưng lấy EXP và level từ backend
      setStats({
        totalSessions: 0,
        bestWpm: dashboardStats?.best_wpm || 0,
        bestAccuracy: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalWords: dashboardStats?.total_words || 0,
        activeDays: 0,
        streak: dashboardStats?.streak || 0,
        level: dashboardStats?.level || 1,
        xp: dashboardStats?.expProgress || 0,
        nextLevelXp: dashboardStats?.expNeeded || 100
      });
      return;
    }

    const totalSessions = history.length;
    const bestWpm = Math.max(...history.map(h => h.wpm || 0), dashboardStats?.best_wpm || 0);
    const bestAccuracy = Math.max(...history.map(h => h.accuracy || 0));
    const avgWpm = totalSessions > 0 ? history.reduce((sum, h) => sum + (h.wpm || 0), 0) / totalSessions : 0;
    const avgAccuracy = totalSessions > 0 ? history.reduce((sum, h) => sum + (h.accuracy || 0), 0) / totalSessions : 0;
    const totalWords = dashboardStats?.total_words || history.reduce((sum, h) => sum + (h.total_words || 0), 0);
    const streak = dashboardStats?.streak || calculateStreak(history);
    const activeDays = new Set(history.map(h => {
      const d = new Date(h.created_at);
      d.setHours(0,0,0,0);
      return d.toISOString();
    })).size;
    
    // Get EXP and level from backend
    const level = dashboardStats?.level || 1;
    const xp = dashboardStats?.expProgress || 0;
    const nextLevelXp = dashboardStats?.expNeeded || 100;

    setStats({
      totalSessions,
      bestWpm: Math.round(bestWpm),
      bestAccuracy: Math.round(bestAccuracy),
      avgWpm: Math.round(avgWpm),
      avgAccuracy: Math.round(avgAccuracy),
      totalWords,
      activeDays,
      streak,
      level,
      xp,
      nextLevelXp
    });
  };

  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;
    
    const sortedHistory = history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let streak = 0;
    let currentDate = new Date();
    
    for (const session of sortedHistory) {
      const sessionDate = new Date(session.created_at);
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // These functions are no longer needed as we get EXP/level from backend
  // Keeping for backward compatibility but they won't be used

  const handleNameEdit = () => {
    setEditingName(true);
  };

  const handleNameSave = async () => {
    if (displayName.trim()) {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Found' : 'Not found');
        console.log('Sending request to update profile...');
        const response = await fetch('/api/auth/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
          },
          body: JSON.stringify({
            name: displayName.trim(),
            email: user.email
          })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Update successful:', data);
          updateUser({ ...user, name: data.user.name, avatar_url: data.user.avatar_url });
          setEditingName(false);
          
          // Thông báo thành công với style đẹp
          const successDiv = document.createElement('div');
          successDiv.innerHTML = `
            <div style="
              position: fixed;
              top: 20px;
              right: 20px;
              background: linear-gradient(135deg, #22c55e, #16a34a);
              color: white;
              padding: 16px 24px;
              border-radius: 12px;
              box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
              z-index: 10000;
              font-weight: 600;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 8px;
              animation: slideIn 0.3s ease-out;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Cập nhật tên thành công!
            </div>
            <style>
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            </style>
          `;
          document.body.appendChild(successDiv);
          setTimeout(() => successDiv.remove(), 3000);
        } else {
          const contentType = response.headers.get('content-type');
          console.log('Content-Type:', contentType);

          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Error updating profile:', errorData);
            
            // Thông báo lỗi với style đẹp
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
              <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
                z-index: 10000;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideIn 0.3s ease-out;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Lỗi: ${errorData.error || 'Unknown error'}
              </div>
              <style>
                @keyframes slideIn {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
              </style>
            `;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 4000);
          } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
              <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
                z-index: 10000;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: slideIn 0.3s ease-out;
              ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Lỗi: Server trả về dữ liệu không đúng định dạng
              </div>
              <style>
                @keyframes slideIn {
                  from { transform: translateX(100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
                }
              </style>
            `;
            document.body.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 4000);
          }
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
            z-index: 10000;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease-out;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Lỗi: ${error.message}
          </div>
          <style>
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 4000);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    
    setUploading(true);
    setUploadMessage('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await fetch('/api/auth/users/avatar', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        updateUser({ ...user, avatar_url: data.avatar_url });
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Thông báo thành công với style đẹp
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
            z-index: 10000;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease-out;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Cập nhật ảnh đại diện thành công!
          </div>
          <style>
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Thông báo lỗi với style đẹp
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
            z-index: 10000;
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease-out;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Lỗi: ${errorData.error || 'Có lỗi xảy ra khi cập nhật ảnh đại diện'}
          </div>
          <style>
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          </style>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 4000);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      
      // Thông báo lỗi với style đẹp
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
          z-index: 10000;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideIn 0.3s ease-out;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Lỗi: ${error.message}
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 4000);
    } finally {
      setUploading(false);
    }
  };

  const unlockedAchievements = achievements.filter(achievement => 
    achievement.condition(stats)
  );
  
  const lockedAchievements = achievements.filter(achievement => 
    !achievement.condition(stats)
  );

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Vui lòng đăng nhập</h2>
          <p style={{ color: '#64748b' }}>Bạn cần đăng nhập để xem hồ sơ cá nhân</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 0 }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
        />
        
        {/* Header */}
        <div style={{
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
            alignItems: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                alt="Avatar"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '800',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
              }}>
                {stats.level}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#1e293b',
                margin: '0 0 8px 0',
                letterSpacing: '-0.5px'
              }}>
                Hồ sơ cá nhân
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: '0 0 12px 0'
              }}>
                Quản lý thông tin và theo dõi tiến độ học tập
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'inline-block',
                fontSize: '14px',
                fontWeight: '700',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}>
                Level {stats.level} • {stats.xp}/{stats.nextLevelXp} XP
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              height: '100%',
              width: `${(stats.xp / stats.nextLevelXp) * 100}%`,
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
            }}>
              <FaKeyboard style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>
                {stats.totalSessions}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Tổng phiên luyện</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
            }}>
              <FaBullseye style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>
                {stats.bestWpm}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>WPM cao nhất</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
            }}>
              <FaStar style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>
                {stats.bestAccuracy || 0}%
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Độ chính xác cao nhất</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
            }}>
              <FaFire style={{ fontSize: '24px', marginBottom: '8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>
                {stats.streak}
              </div>
              <div style={{ fontSize: '14px', opacity: '0.9' }}>Ngày streak</div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '8px',
          marginBottom: '30px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {[
              { id: 'profile', label: 'Thông tin cá nhân', icon: FaUser },
              { id: 'achievements', label: 'Thành tích', icon: FaTrophy },
              { id: 'settings', label: 'Cài đặt', icon: FaCog }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: activeTab === tab.id ? 'none' : '1px solid #e5e7eb',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                    : '#f1f5f9',
                  color: activeTab === tab.id ? '#fff' : '#374151',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <tab.icon style={{ fontSize: '18px' }} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaUser style={{ color: '#6366f1' }} />
                Thông tin cá nhân
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Thông tin cơ bản
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      Tên hiển thị
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {editingName ? (
                        <>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleNameSave();
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '2px solid #6366f1',
                              borderRadius: '8px',
                              fontSize: '16px',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={handleNameSave}
                            style={{
                              background: '#22c55e',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaSave />
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            fontSize: '16px',
                            color: '#1e293b'
                          }}>
                            {user.name}
                          </span>
                          <button
                            onClick={handleNameEdit}
                            style={{
                              background: '#6366f1',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaEdit />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      ID người dùng
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#1e293b',
                      fontFamily: 'monospace'
                    }}>
                      user{user.id}
                    </div>
                  </div> */}
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      Ngày tham gia
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#1e293b'
                    }}>
                      {new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Thống kê học tập
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#22c55e',
                        marginBottom: '4px'
                      }}>
                        {stats.activeDays}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        Số ngày hoạt động
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#f59e0b',
                        marginBottom: '4px'
                      }}>
                        {stats.avgAccuracy || 0}%
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        Độ chính xác TB
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#8b5cf6',
                        marginBottom: '4px'
                      }}>
                        {stats.streak}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        Chuỗi ngày học
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#ef4444',
                        marginBottom: '4px'
                      }}>
                        {stats.level}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        Level hiện tại
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'achievements' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaTrophy style={{ color: '#f59e0b' }} />
                Thành tích
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {/* Unlocked Achievements */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#22c55e',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaMedal />
                    Đã mở khóa ({unlockedAchievements.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {unlockedAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        style={{
                          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '2px solid #22c55e',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          fontSize: '24px',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '800'
                        }}>
                          {achievement.icon}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '4px'
                          }}>
                            {achievement.label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#64748b'
                          }}>
                            {achievement.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Locked Achievements */}
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#64748b',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaCrown />
                    Chưa mở khóa ({lockedAchievements.length})
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {lockedAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        style={{
                          background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.1), rgba(100, 116, 139, 0.05))',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '2px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          opacity: '0.6'
                        }}
                      >
                        <div style={{
                          fontSize: '24px',
                          background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '800'
                        }}>
                          🔒
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#64748b',
                            marginBottom: '4px'
                          }}>
                            {achievement.label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#9ca3af'
                          }}>
                            {achievement.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaCog style={{ color: '#6366f1' }} />
                Cài đặt
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '32px'
              }}>
                {/* Avatar Upload */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Ảnh đại diện
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={avatarPreview || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                      alt="Avatar Preview"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          marginBottom: '8px',
                          display: 'block'
                        }}
                      >
                        Chọn ảnh mới
                      </button>
                      {avatarFile && (
                        <button
                          onClick={handleAvatarUpload}
                          disabled={uploading}
                          style={{
                            background: uploading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            display: 'block'
                          }}
                        >
                          {uploading ? 'Đang tải...' : 'Cập nhật'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {uploadMessage && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: uploadMessage.includes('thành công') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: uploadMessage.includes('thành công') ? '#16a34a' : '#dc2626',
                      border: `1px solid ${uploadMessage.includes('thành công') ? '#22c55e' : '#ef4444'}`
                    }}>
                      {uploadMessage}
                    </div>
                  )}
                </div>
                
                {/* Account Info */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Thông tin tài khoản
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Tên người dùng
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#1e293b',
                        fontFamily: 'monospace'
                      }}>
                        {user.name || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Email
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#1e293b'
                      }}>
                        {user.email || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Vai trò
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#fff',
                        fontWeight: '700',
                        textTransform: 'capitalize'
                      }}>
                        {user.role || 'learner'}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Ngày tạo tài khoản
                      </label>
                      <div style={{
                        padding: '8px 12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#1e293b'
                      }}>
                        {new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div style={{
                marginTop: '32px',
                padding: '24px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '16px'
                }}>
                  Hành động tài khoản
                </h3>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaEdit />
                    Đổi mật khẩu
                  </button>
                  
                  <button style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaTimes />
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
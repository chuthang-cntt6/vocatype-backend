import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function BadgeCollection() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('Vui lòng đăng nhập để xem huy hiệu');
      return;
    }

    fetch(`/api/learner/${user.id}/dashboard`)
      .then(r => {
        if (!r.ok) throw new Error('Không thể tải dữ liệu huy hiệu');
        return r.json();
      })
      .then(data => {
        // Sắp xếp huy hiệu theo thời gian đạt được, mới nhất lên đầu
        const sortedBadges = (data.badges || []).sort((a, b) => 
          new Date(b.achieved_at) - new Date(a.achieved_at)
        );
        setBadges(sortedBadges);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching badges:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  // Kiểm tra xem huy hiệu có phải là mới nhất không (đạt được trong vòng 24h)
  const isNewBadge = (achievedAt) => {
    if (!achievedAt) return false;
    const achievedDate = new Date(achievedAt);
    const now = new Date();
    const hoursDiff = (now - achievedDate) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  if (loading) return <div style={{textAlign:'center', marginTop:40}}>Đang tải huy hiệu...</div>;
  if (error) return <div style={{textAlign:'center', marginTop:40, color:'#ef4444'}}>{error}</div>;
  
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
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Thống kê', path: '/badges' },
            { label: 'Huy hiệu', path: '/badges' }
          ]}
        />
        
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: 24, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', 
          padding: 32 
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Bộ sưu tập huy hiệu</h2>
      {badges.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '32px 0' }}>
          Bạn chưa có huy hiệu nào. Hãy tiếp tục luyện tập để nhận huy hiệu!
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {badges.map((b) => {
            const isNew = isNewBadge(b.achieved_at);
            return (
              <div key={b.id} style={{ 
                background: '#f0fdf4', 
                borderRadius: 18, 
                boxShadow: '0 2px 8px #22c55e22', 
                padding: 24, 
                minWidth: 180, 
                flex: '1 0 180px', 
                textAlign: 'center', 
                position: 'relative',
                border: isNew ? '2.5px solid #22c55e' : 'none',
                animation: isNew ? 'popIn 0.7s' : 'none'
              }}>
                <img 
                  src={b.icon_url || '/icons/trophy.png'} 
                  alt={b.title} 
                  style={{ 
                    width: 56, 
                    height: 56, 
                    marginBottom: 10,
                    filter: isNew ? 'drop-shadow(0 2px 8px #22c55e88)' : 'none'
                  }} 
                />
                <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 18 }}>{b.title}</div>
                <div style={{ color: '#64748b', fontSize: 15, marginTop: 6 }}>{b.desc || b.description}</div>
                {isNew && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    color: '#22c55e',
                    fontWeight: 700,
                    fontSize: 15
                  }}>Mới!</div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  color: '#64748b',
                  fontSize: 12
                }}>
                  {new Date(b.achieved_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      </div>
    </div>
  );
} 
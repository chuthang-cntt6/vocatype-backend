import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function TestHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Vui lòng đăng nhập');
          navigate('/login');
          return;
        }

        // Fetch test info
        const testRes = await fetch(`http://localhost:5050/api/question-bank/${id}`);
        if (testRes.ok) {
          setTest(await testRes.json());
        }

        // Fetch all attempts
        const attemptsRes = await fetch(`http://localhost:5050/api/question-bank/${id}/attempts?limit=100`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (attemptsRes.ok) {
          const arr = await attemptsRes.json();
          setAttempts(Array.isArray(arr) ? arr : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const viewAttempt = (attemptId) => {
    window.location.assign(`/tests/${id}/results/${attemptId}`);
  };

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2ff, #fafafa)', padding: '24px' }}>
      <PageBreadcrumb
        backgroundColor="transparent"
        textColor="#6b7280"
        currentTextColor="#4f46e5"
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Ngân hàng đề', path: '/question-bank' },
          { label: test?.title || 'Test', path: `/tests/${id}` },
          { label: 'Lịch sử làm bài', path: '#' }
        ]}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#111827' }}>Lịch sử làm bài</h1>
              <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{test?.title}</p>
            </div>
            <button onClick={() => navigate(`/tests/${id}`)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>
              ← Quay lại
            </button>
          </div>

          {attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
              Bạn chưa làm bài test này
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {attempts.map((a, idx) => (
                <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, background: idx === 0 ? '#f0fdf4' : '#fafafa', display: 'grid', gridTemplateColumns: '0.5fr 1.5fr 0.6fr 0.6fr 0.7fr', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Lần</div>
                    <div style={{ fontWeight: 900, fontSize: 20, color: '#4f46e5' }}>#{attempts.length - idx}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                      {new Date(a.created_at).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(() => {
                        if (!a.passages || a.passages.length === 0) {
                          return <span style={{ padding: '3px 10px', border: '1px solid #e5e7eb', borderRadius: 999, background: '#fff', fontSize: 12, fontWeight: 700 }}>Luyện tập</span>;
                        }
                        return a.passages.map(p => (
                          <span key={p} style={{ padding: '3px 10px', border: '1px solid #c7d2fe', borderRadius: 999, background: '#eef2ff', color: '#4338ca', fontSize: 12, fontWeight: 800 }}>
                            Passage {p}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Kết quả</div>
                    <div style={{ fontWeight: 900, fontSize: 18, color: a.score === a.total_questions ? '#16a34a' : '#111827' }}>
                      {a.score}/{a.total_questions}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Thời gian</div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>
                      {(() => {
                        const t = a.time_taken || 0;
                        const m = Math.floor(t / 60), s = t % 60;
                        return `${m}:${String(s).padStart(2, '0')}`;
                      })()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => viewAttempt(a.id)} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontSize: 13, width: '100%' }}>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaCheckCircle, FaSearch } from 'react-icons/fa';
import PageBreadcrumb from '../components/PageBreadcrumb';

const DictationExercises = () => {
  const navigate = useNavigate();
  const { topic } = useParams();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchExercises();
    loadCompletedExercises();
  }, [topic]);

  const fetchExercises = async () => {
    try {
      const res = await fetch(`/api/dictation/exercises/${encodeURIComponent(topic)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setExercises(data);
    } catch (err) {
      console.error('Load exercises error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedExercises = () => {
    const completed = JSON.parse(localStorage.getItem(`completed_${topic}`) || '[]');
    setCompletedExercises(completed);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}>Loading exercises...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 0 }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Luyện Dictation TOEIC', path: '/dictation' },
            { label: topic, path: '#' }
          ]}
        />
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 30,
          background: 'rgba(255,255,255,0.95)',
          padding: '20px 30px',
          borderRadius: 20
        }}>
          <button
            onClick={() => navigate('/dictation')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              marginRight: 16,
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: 28, color: '#0f172a' }}>
              {topic}
            </h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>
                {exercises.length} lessons • Click to start practice
              </span>
              <span style={{
                background: '#ecfeff',
                color: '#0891b2',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700
              }}>
                Đã hoàn thành: {completedExercises.length}
              </span>
              {/* <span style={{
                background: '#eef2ff',
                color: '#3730a3',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700
              }}>
                Còn lại: {Math.max(exercises.length - completedExercises.length, 0)}
              </span> */}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <FaSearch style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài theo tiêu đề..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              border: '2px solid #e5e7eb',
              borderRadius: 14,
              fontSize: 14,
              outline: 'none'
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* Exercises List */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: 30,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
        }}>
          {exercises
            .filter(ex => ex.title?.toLowerCase().includes(search.toLowerCase()))
            .map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            
            return (
              <div
                key={exercise.id}
                onClick={() => navigate(`/dictation/practice/${exercise.id}`)}
                style={{
                  padding: 20,
                  borderBottom: index < exercises.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: 12
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: isCompleted ? '#10b981' : '#6366f1',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {isCompleted ? <FaCheckCircle /> : index + 1}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: 18,
                      color: '#0f172a',
                      fontWeight: 700
                    }}>
                      {exercise.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      color: '#64748b'
                    }}>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontWeight: 600
                      }}>
                        {exercise.level}
                      </span>
                      <span>{exercise.transcript.split(' ').length} words</span>
                    </div>
                  </div>
                  
                  <FaPlay style={{ color: '#6366f1', fontSize: 24 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DictationExercises;
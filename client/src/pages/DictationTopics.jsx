import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { FaArrowLeft, FaBook, FaBriefcase, FaComments, FaNewspaper, FaGraduationCap, FaBuilding } from 'react-icons/fa';

const DictationTopics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/dictation/topics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error('Load topics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicIcon = (topic) => {
    const icons = {
      'Short Stories': <FaBook />,
      'TOEIC Listening': <FaBriefcase />,
      'Conversations': <FaComments />,
      'News': <FaNewspaper />,
      'Academic': <FaGraduationCap />,
      'Business': <FaBuilding />
    };
    return icons[topic] || <FaBook />;
  };

  const getTopicColor = (topic) => {
    const colors = {
      'Short Stories': 'linear-gradient(135deg, #667eea, #764ba2)',
      'TOEIC Listening': 'linear-gradient(135deg, #f093fb, #f5576c)',
      'Conversations': 'linear-gradient(135deg, #4facfe, #00f2fe)',
      'News': 'linear-gradient(135deg, #43e97b, #38f9d7)',
      'Academic': 'linear-gradient(135deg, #fa709a, #fee140)',
      'Business': 'linear-gradient(135deg, #30cfd0, #330867)'
    };
    return colors[topic] || 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
        <p style={{ color: '#64748b', fontSize: 16 }}>Loading topics...</p>
      </div>
    );
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
            { label: 'Dictation', path: '/dictation' }
          ]}
        />
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 40,
          background: 'rgba(255,255,255,0.95)',
          padding: '20px 30px',
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 20,
              marginRight: 16
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              color: '#0f172a',
              marginBottom: 8
            }}>
              🎧 TOEIC Dictation Practice
            </h1>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: 16
            }}>
              Choose a topic to start improving your listening skills
            </p>
          </div>
        </div>

        {/* Topics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {topics.map((topic, index) => (
            <div
              key={index}
              onClick={() => navigate(`/dictation/exercises/${encodeURIComponent(topic.topic)}`)}
              style={{
                background: getTopicColor(topic.topic),
                borderRadius: 20,
                padding: 30,
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {getTopicIcon(topic.topic)}
              </div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: 24,
                fontWeight: 800
              }}>
                {topic.topic}
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                fontSize: 16,
                opacity: 0.9
              }}>
                {topic.lesson_count} lessons available
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                opacity: 0.85
              }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 12
                }}>
                  Level: {topic.min_level}-{topic.max_level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DictationTopics;
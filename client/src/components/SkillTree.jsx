import React from 'react';
import { FaLock, FaStar, FaCheckCircle } from 'react-icons/fa';

export default function SkillTree({ userStats, onSkillClick }) {
  // Calculate skill levels based on user stats
  const calculateLevel = (activity, maxActivity) => {
    if (!activity) return 0;
    const percentage = (activity / maxActivity) * 100;
    if (percentage >= 80) return 5;
    if (percentage >= 60) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 20) return 2;
    if (percentage > 0) return 1;
    return 0;
  };

  const skills = {
    listening: {
      name: 'Listening',
      icon: '🎧',
      color: '#3b82f6',
      children: [
        {
          id: 'dictation',
          name: 'Dictation',
          level: calculateLevel(userStats?.dictation_count || 0, 50),
          maxLevel: 5,
          unlocked: true,
          description: 'Luyện nghe chép chính tả',
          requirement: null,
          path: '/dictation'
        },
        {
          id: 'toeic_listening',
          name: 'TOEIC Listening',
          level: calculateLevel(userStats?.toeic_listening || 0, 20),
          maxLevel: 5,
          unlocked: (userStats?.dictation_count || 0) >= 10,
          description: 'Luyện đề TOEIC Part 1-4',
          requirement: 'Hoàn thành 10 bài Dictation',
          path: '/toeic-practice'
        },
        {
          id: 'ielts_listening',
          name: 'IELTS Listening',
          level: 0,
          maxLevel: 5,
          unlocked: (userStats?.toeic_listening || 0) >= 5,
          description: 'Luyện đề IELTS Listening',
          requirement: 'Hoàn thành 5 bài TOEIC Listening',
          path: '/question-bank'
        }
      ]
    },
    reading: {
      name: 'Reading',
      icon: '📚',
      color: '#10b981',
      children: [
        {
          id: 'vocabulary',
          name: 'Vocabulary',
          level: calculateLevel(userStats?.total_words || 0, 500),
          maxLevel: 5,
          unlocked: true,
          description: 'Học từ vựng mới',
          requirement: null,
          path: '/learn-new'
        },
        {
          id: 'flashcard',
          name: 'Flashcard Review',
          level: calculateLevel(userStats?.flashcard_reviewed || 0, 100),
          maxLevel: 5,
          unlocked: (userStats?.total_words || 0) >= 50,
          description: 'Ôn tập với flashcard',
          requirement: 'Học 50 từ vựng',
          path: '/flashcard-demo'
        },
        {
          id: 'reading_tests',
          name: 'Reading Tests',
          level: calculateLevel(userStats?.reading_tests || 0, 20),
          maxLevel: 5,
          unlocked: (userStats?.total_words || 0) >= 200,
          description: 'Luyện đề Reading',
          requirement: 'Học 200 từ vựng',
          path: '/question-bank'
        }
      ]
    },
    // ❌ Ẩn Speaking - chưa có tính năng
    // speaking: {
    //   name: 'Speaking',
    //   icon: '🗣️',
    //   color: '#f59e0b',
    //   children: [
    //     {
    //       id: 'pronunciation',
    //       name: 'Pronunciation',
    //       level: 0,
    //       maxLevel: 5,
    //       unlocked: (userStats?.total_words || 0) >= 100,
    //       description: 'Luyện phát âm',
    //       requirement: 'Học 100 từ vựng',
    //       path: '/typing-practice'
    //     },
    //     {
    //       id: 'conversation',
    //       name: 'Conversation',
    //       level: 0,
    //       maxLevel: 5,
    //       unlocked: false,
    //       description: 'Luyện hội thoại',
    //       requirement: 'Hoàn thành Pronunciation Level 3',
    //       path: '#'
    //     }
    //   ]
    // },
    writing: {
      name: 'Writing',
      icon: '✍️',
      color: '#8b5cf6',
      children: [
        {
          id: 'grammar',
          name: 'Grammar',
          level: calculateLevel(userStats?.grammar_exercises || 0, 30),
          maxLevel: 5,
          unlocked: (userStats?.total_words || 0) >= 100,
          description: 'Luyện ngữ pháp',
          requirement: 'Học 100 từ vựng',
          path: '/typing-practice'
        },
        {
          id: 'essay_writing',
          name: 'Essay Writing',
          level: 0,
          maxLevel: 5,
          unlocked: false,
          description: 'Viết luận IELTS/TOEIC',
          requirement: 'Hoàn thành Grammar Level 3',
          path: '#'
        }
      ]
    }
  };

  const renderStars = (level, maxLevel) => {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: maxLevel }).map((_, i) => (
          <FaStar
            key={i}
            style={{
              color: i < level ? '#fbbf24' : '#d1d5db',
              fontSize: 12
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        {Object.entries(skills).map(([key, category]) => (
          <div key={key} style={{
            background: '#fff',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #f1f5f9'
          }}>
            {/* Category Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '2px solid #f1f5f9'
            }}>
              <span style={{ fontSize: 28 }}>{category.icon}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#111827' }}>
                  {category.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {category.children.filter(c => c.unlocked).length}/{category.children.length} unlocked
                </div>
              </div>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {category.children.map((skill, idx) => (
                <div
                  key={skill.id}
                  onClick={() => skill.unlocked && onSkillClick && onSkillClick(skill)}
                  style={{
                    position: 'relative',
                    background: skill.unlocked
                      ? `linear-gradient(135deg, ${category.color}15, ${category.color}08)`
                      : '#f9fafb',
                    border: skill.unlocked
                      ? `2px solid ${category.color}40`
                      : '2px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 14,
                    cursor: skill.unlocked ? 'pointer' : 'not-allowed',
                    opacity: skill.unlocked ? 1 : 0.6,
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    if (skill.unlocked) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Connection line to previous skill */}
                  {idx > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -14,
                      left: 20,
                      width: 2,
                      height: 14,
                      background: skill.unlocked ? category.color : '#d1d5db'
                    }} />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: skill.unlocked ? '#111827' : '#9ca3af',
                        marginBottom: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        {skill.name}
                        {skill.level >= skill.maxLevel && (
                          <FaCheckCircle style={{ color: '#10b981', fontSize: 14 }} />
                        )}
                        {!skill.unlocked && (
                          <FaLock style={{ color: '#9ca3af', fontSize: 12 }} />
                        )}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6
                      }}>
                        {skill.description}
                      </div>
                    </div>
                    {renderStars(skill.level, skill.maxLevel)}
                  </div>

                  {/* Progress bar */}
                  {skill.unlocked && (
                    <div style={{
                      height: 6,
                      background: '#e5e7eb',
                      borderRadius: 3,
                      overflow: 'hidden',
                      marginBottom: 6
                    }}>
                      <div style={{
                        width: `${(skill.level / skill.maxLevel) * 100}%`,
                        height: '100%',
                        background: category.color,
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  )}

                  {/* Level indicator */}
                  <div style={{
                    fontSize: 11,
                    color: skill.unlocked ? category.color : '#9ca3af',
                    fontWeight: 700
                  }}>
                    {skill.unlocked
                      ? `Level ${skill.level}/${skill.maxLevel}`
                      : `🔒 ${skill.requirement}`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

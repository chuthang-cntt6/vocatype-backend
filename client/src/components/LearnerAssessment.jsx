import React from 'react';
import { FaTrophy, FaChartLine, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

export default function LearnerAssessment({ userStats, userLevel, userExp, nextLevelExp }) {
  // Use level from backend (same as Profile page)
  const overallLevel = userLevel || userStats?.level || 1;

  // Calculate skill percentages
  const getSkillPercentage = (skill) => {
    const maxValues = {
      vocabulary: 500,
      listening: 50,
      reading: 100,  // ✅ Tăng từ 20 → 100 (khó đạt 100% hơn)
      speaking: 30,
      writing: 30
    };

    const currentValues = {
      vocabulary: userStats?.total_words || 0,
      listening: userStats?.dictation_count || 0,
      reading: userStats?.reading_tests || 0,
      speaking: userStats?.pronunciation_score || 0,
      writing: userStats?.grammar_exercises || 0
    };

    const current = currentValues[skill] || 0;
    const max = maxValues[skill] || 100;
    return Math.min(100, Math.round((current / max) * 100));
  };

  const levelName = overallLevel <= 3 ? 'Beginner' : overallLevel <= 6 ? 'Intermediate' : 'Advanced';
  
  // Calculate progress to next level (percentage)
  const currentExp = userExp || userStats?.expProgress || 0;
  const expToNextLevel = nextLevelExp || userStats?.expNeeded || 100;
  const progressToNextLevel = Math.min(100, Math.round((currentExp / expToNextLevel) * 100));

  const skills = [
    // { name: 'Vocabulary', key: 'vocabulary', icon: '📚', color: '#10b981' }, // ❌ Ẩn Vocabulary
    { name: 'Listening', key: 'listening', icon: '🎧', color: '#3b82f6' },
    { name: 'Reading', key: 'reading', icon: '📖', color: '#8b5cf6' },
    // { name: 'Speaking', key: 'speaking', icon: '🗣️', color: '#f59e0b' }, // ❌ Ẩn Speaking
    { name: 'Writing', key: 'writing', icon: '✍️', color: '#ef4444' }
  ];

  const skillScores = skills.map(s => ({
    ...s,
    percentage: getSkillPercentage(s.key)
  }));

  // Identify strengths and weaknesses
  const strengths = skillScores.filter(s => s.percentage >= 60).sort((a, b) => b.percentage - a.percentage);
  const weaknesses = skillScores.filter(s => s.percentage < 40).sort((a, b) => a.percentage - b.percentage);

  // Generate recommendations
  const getRecommendations = () => {
    const recs = [];
    
    if (weaknesses.length > 0) {
      const weakest = weaknesses[0];
      recs.push({
        type: 'focus',
        icon: <FaExclamationTriangle />,
        color: '#ef4444',
        title: 'Ưu tiên cải thiện',
        message: `${weakest.name} (${weakest.percentage}%) - Dành 30 phút/ngày cho kỹ năng này`
      });
    }

    if (strengths.length > 0) {
      const strongest = strengths[0];
      recs.push({
        type: 'maintain',
        icon: <FaTrophy />,
        color: '#10b981',
        title: 'Điểm mạnh',
        message: `${strongest.name} (${strongest.percentage}%) - Tiếp tục duy trì và nâng cao`
      });
    }

    if (overallLevel < 5) {
      recs.push({
        type: 'goal',
        icon: <FaChartLine />,
        color: '#3b82f6',
        title: 'Mục tiêu tiếp theo',
        message: `Đạt Level ${overallLevel + 1} bằng cách hoàn thành 50 từ vựng và 10 bài luyện tập`
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Overall Assessment Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 20,
        padding: 24,
        color: '#fff',
        marginBottom: 20,
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>Trình độ hiện tại</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
              Level {overallLevel} · {levelName}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              {currentExp}/{expToNextLevel} XP · {progressToNextLevel}% đến level tiếp theo
            </div>
          </div>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 900,
            border: '4px solid rgba(255,255,255,0.3)'
          }}>
            {overallLevel}
          </div>
        </div>

        {/* Progress to next level */}
        <div style={{
          marginTop: 16,
          height: 8,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressToNextLevel}%`,
            height: '100%',
            background: '#fff',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Skills Breakdown */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontWeight: 900,
          fontSize: 18,
          marginBottom: 16,
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <FaChartLine style={{ color: '#3b82f6' }} />
          Phân tích kỹ năng
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {skillScores.map(skill => (
            <div key={skill.key}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{skill.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>
                    {skill.name}
                  </span>
                </div>
                <span style={{
                  fontWeight: 900,
                  fontSize: 14,
                  color: skill.percentage >= 60 ? '#10b981' : skill.percentage >= 40 ? '#f59e0b' : '#ef4444'
                }}>
                  {skill.percentage}%
                </span>
              </div>
              <div style={{
                height: 10,
                background: '#f1f5f9',
                borderRadius: 5,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${skill.percentage}%`,
                  height: '100%',
                  background: skill.color,
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Strengths */}
        <div style={{
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          borderRadius: 16,
          padding: 18,
          border: '2px solid #6ee7b7'
        }}>
          <div style={{
            fontWeight: 900,
            fontSize: 16,
            marginBottom: 12,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <FaTrophy /> Điểm mạnh
          </div>
          {strengths.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {strengths.slice(0, 2).map(s => (
                <div key={s.key} style={{
                  fontSize: 13,
                  color: '#047857',
                  fontWeight: 600
                }}>
                  {s.icon} {s.name} ({s.percentage}%)
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#047857' }}>
              Tiếp tục luyện tập để phát triển điểm mạnh
            </div>
          )}
        </div>

        {/* Weaknesses */}
        <div style={{
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          borderRadius: 16,
          padding: 18,
          border: '2px solid #fca5a5'
        }}>
          <div style={{
            fontWeight: 900,
            fontSize: 16,
            marginBottom: 12,
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <FaExclamationTriangle /> Cần cải thiện
          </div>
          {weaknesses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {weaknesses.slice(0, 2).map(s => (
                <div key={s.key} style={{
                  fontSize: 13,
                  color: '#b91c1c',
                  fontWeight: 600
                }}>
                  {s.icon} {s.name} ({s.percentage}%)
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#b91c1c' }}>
              Tuyệt vời! Không có điểm yếu rõ rệt
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          fontWeight: 900,
          fontSize: 18,
          marginBottom: 16,
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <FaLightbulb style={{ color: '#f59e0b' }} />
          Đề xuất lộ trình
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((rec, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 14,
              background: `${rec.color}10`,
              borderRadius: 12,
              border: `2px solid ${rec.color}30`
            }}>
              <div style={{ color: rec.color, fontSize: 20, marginTop: 2 }}>
                {rec.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#111827',
                  marginBottom: 4
                }}>
                  {rec.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#6b7280',
                  lineHeight: 1.5
                }}>
                  {rec.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

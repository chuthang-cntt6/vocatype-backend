import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { useNavigate } from 'react-router-dom';
import { FaBookOpen, FaProjectDiagram, FaBolt, FaAngleRight } from 'react-icons/fa';
import SkillTree from '../components/SkillTree';
import LearnerAssessment from '../components/LearnerAssessment';

export default function Roadmap() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [flashcardTotal, setFlashcardTotal] = useState(0);
  const [dictationRecent, setDictationRecent] = useState(null);
  const [dictationList, setDictationList] = useState([]);
  const [learnSummary, setLearnSummary] = useState({ summary: [], vocabDetails: [] });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    fetch(`/api/learner/${user.id}/dashboard`, {
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
    })
      .then(r => r.json())
      .then(data => { setDashboard(data); setLoading(false); })
      .catch(err => { setError('Lỗi tải dữ liệu: ' + err.message); setLoading(false); });
  }, [user]);

  // Fetch learning summary for today's unique vocabulary learned
  useEffect(() => {
    const loadLearningSummary = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/learner/${user.id}/learning-summary`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLearnSummary({ summary: data?.summary || [], vocabDetails: data?.vocabDetails || [] });
        }
      } catch (_) {}
    };
    loadLearningSummary();
  }, [user]);

  // Fetch recent dictation activity (API first, then localStorage fallback)
  useEffect(() => {
    const loadDictationRecent = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/learner/${user.id}/dictation-recent`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            setDictationList(rows);
            setDictationRecent(rows[0]);
            return;
          }
        }
      } catch (_) {}
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem('dictation_last_activity');
        if (raw) {
          const item = JSON.parse(raw);
          setDictationRecent(item);
          setDictationList([item]);
        }
      } catch {}
    };
    loadDictationRecent();
  }, [user]);

  // Fetch flashcard lists to compute total cards for accurate progress/value
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const res = await fetch('/api/flashcard/lists', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const lists = await res.json();
          const total = Array.isArray(lists) ? lists.reduce((s,l)=> s + (Number(l?.card_count)||0), 0) : 0;
          setFlashcardTotal(total);
        }
      } catch (_) {
        // ignore
      }
    };
    if (user?.id) loadFlashcards();
  }, [user]);

  if (!user) return <div style={{padding:24}}>Vui lòng đăng nhập để xem lộ trình học.</div>;
  if (loading) return <div style={{padding:24}}>Đang tải lộ trình...</div>;
  if (error) return <div style={{padding:24,color:'red'}}>{error}</div>;

  const stats = dashboard?.stats || {};
  const history = dashboard?.history || [];

  const percent = (val, total) => {
    const v = Number(val)||0; const t = Number(total)||1; return Math.max(0, Math.min(100, Math.round(v/t*100)));
  };

  const lastActivityTime = (typeKey) => {
    const map = { vocab: 'vocab', flashcard: 'flashcard', dictation: 'dictation', exam: 'exam' };
    const t = map[typeKey];
    let list = history
      .filter(h => !t || (h?.type || '').toString() === t)
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    if (typeKey === 'vocab' && (learnSummary?.vocabDetails || []).length > 0) {
      const maxDate = (learnSummary.vocabDetails
        .map(x => new Date(x.learned_at))
        .sort((a,b) => b - a)[0]);
      if (maxDate) return maxDate;
    }
    if (typeKey === 'dictation' && dictationRecent?.created_at) {
      return new Date(dictationRecent.created_at);
    }
    if (!list.length) return null;
    return new Date(list[0].created_at);
  };

  const pctColor = (p) => {
    if (p >= 75) return '#22c55e';
    if (p >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const ctaText = (key) => {
    if (key === 'vocab') return 'Tiếp tục học';
    if (key === 'flashcard') return 'Ôn tiếp';
    if (key === 'dictation') return 'Luyện dictation';
    if (key === 'exam') return 'Làm đề';
    return 'Bắt đầu';
  };

  const isToday = (d) => {
    if (!d) return false;
    const now = new Date();
    const dt = new Date(d);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
  };
  const dictationToday = Array.isArray(dictationList) ? dictationList.filter(i => isToday(i?.created_at)) : [];
  const dictationTodayTotal = dictationToday.reduce((s, i) => s + (Number(i?.sentences) || 0), 0);
  const dictationTopicBreakdown = (() => {
    const m = {};
    dictationToday.forEach(i => {
      const t = i?.topic || 'Khác';
      m[t] = (m[t] || 0) + (Number(i?.sentences) || 0);
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0,3);
  })();

  // Vocabulary today: unique words and breakdown by topic/chapter
  const vocabDetails = learnSummary?.vocabDetails || [];
  const uniqueTodayCount = (() => {
    const set = new Set();
    vocabDetails.forEach(v => { if (v?.word) set.add(v.word); });
    return set.size;
  })();
  const vocabTopicBreakdown = (() => {
    const m = {};
    vocabDetails.forEach(v => {
      const key = `${v?.topic_name || 'Chủ đề'}${v?.chapter_name ? ' · ' + v.chapter_name : ''}`;
      m[key] = (m[key] || 0) + 1;
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0,3);
  })();

  const cards = [
    {
      key: 'vocab',
      title: 'Từ vựng',
      desc: 'Học và ôn từ mới hiệu quả',
      progress: percent(uniqueTodayCount, 20),
      value: uniqueTodayCount,
      unit: 'từ',
      cta: () => navigate('/learn-new'),
      color: ['#22d3ee', '#06b6d4']
    },
    {
      key: 'flashcard',
      title: 'Flashcard',
      desc: 'Ôn tập với thẻ ghi nhớ',
      progress: flashcardTotal > 0 ? percent(0, flashcardTotal) : 0,
      value: flashcardTotal,
      unit: 'thẻ',
      cta: () => navigate('/flashcard-demo'),
      color: ['#a78bfa', '#7c3aed']
    },
    {
      key: 'dictation',
      title: 'Dictation',
      desc: 'Nghe - chép chính tả theo câu',
      progress: 0,
      value: dictationTodayTotal || 0,
      unit: 'câu',
      cta: () => navigate('/dictation'),
      color: ['#f472b6', '#ec4899']
    },
    {
      key: 'exam',
      title: 'Đề thi',
      desc: 'Luyện đề và đánh giá năng lực',
      progress: 0,
      value: 0,
      unit: 'điểm',
      cta: () => navigate('/question-bank'),
      color: ['#f59e0b', '#d97706']
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageBreadcrumb 
        backgroundColor="transparent"
        textColor="#6b7280"
        currentTextColor="#6366f1"
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Học tập', path: '/learn' },
          { label: 'Lộ trình học', path: '/roadmap' }
        ]}
      />

      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        borderRadius: 24,
        padding: 28,
        marginTop: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid rgba(99,102,241,0.12)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 8 }}>
          <FaProjectDiagram style={{ color:'#6366f1' }} />
          <div style={{ fontSize: 24, fontWeight: 800, color:'#1e293b' }}>Lộ trình học cá nhân</div>
        </div>
        <div style={{ color:'#64748b', marginBottom: 20 }}>Sơ đồ tư duy các kỹ năng và đề xuất bước tiếp theo.</div>

        {/* Learner Assessment */}
        <LearnerAssessment 
          userStats={stats} 
          userLevel={dashboard?.level || stats?.level || 1}
          userExp={dashboard?.expProgress || stats?.expProgress || 0}
          nextLevelExp={dashboard?.expNeeded || stats?.expNeeded || 100}
        />

        {/* Skill Tree */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 16, color: '#111827' }}>
            🗺️ Sơ đồ kỹ năng
          </div>
          <SkillTree 
            userStats={stats} 
            onSkillClick={(skill) => {
              if (skill.path && skill.path !== '#') {
                navigate(skill.path);
              }
            }}
          />
        </div>

        {/* Original cards section - now as "Quick Actions" */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 16, color: '#111827' }}>
            ⚡ Hoạt động hôm nay
          </div>
        </div>

        {/* Grid layout without decorative lines for clean look */}
        <div style={{ position:'relative' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 16 }}>
            {cards.slice(0,2).map(c => (
              <div key={c.key} style={{
                background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`,
                borderRadius: 18,
                padding: 18,
                color:'#fff',
                boxShadow:'0 10px 28px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.25)'
              }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{c.title}</div>
                <div style={{ opacity: 0.9, marginBottom: 8, fontSize: 14 }}>{c.desc}</div>
                <div style={{ color:'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 12 }}>
                  {(() => { const t=lastActivityTime(c.key); return t ? `Hoạt động gần nhất: ${t.toLocaleString('vi-VN')}` : 'Chưa có hoạt động gần đây'; })()}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{c.value}</div>
                  <div style={{ opacity:0.9 }}>{c.unit}</div>
                </div>
                {c.key === 'vocab' && vocabTopicBreakdown.length > 0 && (
                  <div style={{ marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                    {vocabTopicBreakdown.map(([t, n]) => (
                      <div key={t} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span>{t}</span>
                        <span>{n} từ</span>
                      </div>
                    ))}
                  </div>
                )}
                {c.key === 'dictation' && dictationTopicBreakdown.length > 0 && (
                  <div style={{ marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                    {dictationTopicBreakdown.map(([t, n]) => (
                      <div key={t} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span>{t}</span>
                        <span>{n} câu</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ position:'relative', height:25, borderRadius:10, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ width: `${c.progress}%`, height:'100%', background: pctColor(c.progress) }} />
                  {c.key === 'flashcard' && (
                    <div style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', fontSize:12, fontWeight:800, color:'#fff' }}>
                      {`Còn ${flashcardTotal} thẻ cần nhớ`}
                    </div>
                  )}
                </div>
                <button onClick={c.cta} style={{
                  background:'#fff', color:'#64748b', border:'1px solid rgba(100,116,139,0.25)', borderRadius:10, padding:'8px 12px',
                  fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8
                }}>
                  {ctaText(c.key)} <FaAngleRight />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 16, marginTop: 16 }}>
            {cards.slice(2).map(c => (
              <div key={c.key} style={{
                background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`,
                borderRadius: 18,
                padding: 18,
                color:'#fff',
                boxShadow:'0 10px 28px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.25)'
              }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{c.title}</div>
                <div style={{ opacity: 0.9, marginBottom: 8, fontSize: 14 }}>{c.desc}</div>
                <div style={{ color:'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 12 }}>
                  {(() => { const t=lastActivityTime(c.key); return t ? `Hoạt động gần nhất: ${t.toLocaleString('vi-VN')}` : 'Chưa có hoạt động gần đây'; })()}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{c.value}</div>
                  <div style={{ opacity:0.9 }}>{c.unit}</div>
                </div>
                {c.key === 'dictation' && dictationTopicBreakdown.length > 0 && (
                  <div style={{ marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                    {dictationTopicBreakdown.map(([t, n]) => (
                      <div key={t} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span>{t}</span>
                        <span>{n} câu</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ position:'relative', height:25, borderRadius:10, overflow:'hidden', marginBottom:12 }}>
                  <div style={{ width: `${c.progress}%`, height:'100%', background: pctColor(c.progress) }} />
                </div>
                <button onClick={c.cta} style={{
                  background:'#fff', color:'#64748b', border:'1px solid rgba(100,116,139,0.25)', borderRadius:10, padding:'8px 12px',
                  fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8
                }}>
                  {ctaText(c.key)} <FaAngleRight />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gợi ý tiếp theo */}
        <div style={{ marginTop: 24, background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <FaBolt style={{ color:'#f59e0b' }} />
            <div style={{ fontWeight: 800, color:'#1e293b' }}>Gợi ý tiếp theo</div>
          </div>
          <div style={{ color:'#64748b', fontSize:14 }}>
            {(() => {
              const hints = [];
              // Vocab-based hint (unique words learned today)
              if (typeof uniqueTodayCount === 'number') {
                const n = uniqueTodayCount || 0;
                if (n === 0) {
                  hints.push('Từ vựng: hôm nay chưa học từ nào — bắt đầu học 3 từ để khởi động.');
                } else if (n < 10) {
                  const target = Math.min(15, 10 + (5 - Math.min(5, n)));
                  hints.push(`Từ vựng: đã học ${n} từ — bổ sung ${Math.max(5, 10 - n)} từ nữa để đạt ${target} từ hôm nay.`);
                } else if (n < 20) {
                  hints.push(`Từ vựng: đã học ${n} từ — cố gắng chạm mục tiêu 20 từ/ngày.`);
                } else {
                  hints.push('Từ vựng: rất tốt! Dành 5 phút ôn lại các từ khó mới học.');
                }
              }
              // Dictation-based hint
              if (dictationRecent && (dictationRecent.sentences || dictationRecent.sentences === 0)) {
                const s = Number(dictationRecent.sentences) || 0;
                const avg = Number(dictationRecent.avg_score) || 0;
                if (s < 5) {
                  hints.push(`Dictation: phiên gần nhất ${s} câu. Hôm nay luyện đủ 5–8 câu để hình thành nhịp.`);
                } else if (s < 10) {
                  if (avg && avg < 80) {
                    hints.push(`Dictation: luyện ~8–12 câu và ôn lại câu sai (điểm TB ${avg}%).`);
                  } else {
                    hints.push('Dictation: tiếp tục 8–12 câu để duy trì tiến bộ.');
                  }
                } else {
                  hints.push('Dictation: rất tốt! Duy trì 10–15 câu/ngày.');
                }
              }

              // Flashcard-based hint
              if (flashcardTotal > 0) {
                if (flashcardTotal <= 5) {
                  hints.push(`Flashcard: còn ${flashcardTotal} thẻ cần nhớ — ôn nốt để hoàn thành.`);
                } else if (flashcardTotal <= 15) {
                  const half = Math.ceil(flashcardTotal / 2);
                  const n = Math.max(5, Math.min(10, half));
                  hints.push(`Flashcard: có ${flashcardTotal} thẻ — hôm nay ôn khoảng ${n} thẻ gần đây.`);
                } else {
                  hints.push('Flashcard: chia nhỏ ôn 15 thẻ/ngày trong 3–4 ngày.');
                }
              }

              // Fallback to vocabulary when no data
              if (hints.length === 0) {
                return stats?.total_words > 0
                  ? 'Tiếp tục ôn 15 từ gần đây để củng cố trí nhớ.'
                  : 'Bắt đầu học 20 từ đầu tiên để khởi động hành trình của bạn.';
              }

              return (
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {hints.map((h, idx) => (
                    <div key={idx} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                      <span style={{ color:'#94a3b8' }}>•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

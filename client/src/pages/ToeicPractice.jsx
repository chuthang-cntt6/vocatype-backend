import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '../components/PageBreadcrumb';

export default function ToeicPractice() {
  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    try {
      const res = await fetch('http://localhost:5050/api/question-bank/toeic/full-test');
      const data = await res.json();
      setTest(data);
    } catch (err) {
      console.error("Lỗi khi gọi API TOEIC:", err);
    }
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grade = async () => {
    const allQuestions = Object.values(test).flat();
    const payload = {
      answers: allQuestions.map(q => ({
        id: q.id,
        answer: answers[q.id] || ''
      }))
    };

    const res = await fetch('http://localhost:5050/api/question-bank/toeic/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setResult(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const countAnswered = () =>
    Object.keys(answers).filter(k => (answers[k] || '') !== '').length;

  const renderQuestions = (partKey, partName) => {
    const questions = test[partKey] || [];
    return (
      <div key={partKey} style={{ marginBottom: 32 }}>
        <h2 className="toeic-part-title" style={{ fontWeight: 900, fontSize: 20, marginBottom: 12, color: '#1e293b' }}>
          {partName} ({questions.length} câu)
        </h2>
        {questions.map((q, idx) => {
          // === Trường hợp Part 1: hiển thị ảnh + audio + 4 lựa chọn A/B/C/D ===
          if (q.part_number === 1) {
            return (
              <div key={q.id} className="toeic-question" style={{ marginBottom: 16, borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 8 }}>
                  <span className="toeic-question-number" style={{ background:'#eef2ff', color:'#6366f1', fontWeight:800, padding:'2px 10px', borderRadius: 999 }}>
                    Câu {idx+1}
                  </span>
                </div>
                {/* Ảnh */}
                {q.image_url && (
                  <div style={{ marginBottom: 8 }}>
                    <img src={q.image_url} alt="TOEIC Part 1" style={{ maxWidth: '100%', borderRadius: 8 }} />
                  </div>
                )}
                {/* Audio */}
                {q.audio_url && (
                  <div style={{ marginBottom: 8 }}>
                    <audio src={q.audio_url} controls />
                  </div>
                )}
                {/* 4 nút chọn A–D */}
                <div className="toeic-part1-options" style={{ display: 'flex', gap: 10 }}>
                  {['A','B','C','D'].map(opt => {
                    const active = (answers[q.id]||'') === opt;
                    return (
                      <button
                        key={opt}
                        className="toeic-part1-btn"
                        onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                        style={{
                          background: active ? '#6366f1' : '#fff',
                          color: active ? '#fff' : '#111827',
                          border: active ? '2px solid #6366f1' : '1px solid #e5e7eb',
                          borderRadius: 12,
                          padding: '10px 16px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }
  
          // === Các part khác (2–7): render theo options như cũ ===
          const opts = Array.isArray(q.options) ? q.options : [];
          return (
            <div key={q.id} style={{ marginBottom: 16, borderBottom: '1px dashed #e5e7eb', paddingBottom: 12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 8 }}>
                <span style={{ background:'#eef2ff', color:'#6366f1', fontWeight:800, padding:'2px 10px', borderRadius: 999 }}>
                  Câu {idx+1}
                </span>
                <div className="toeic-question-text" style={{ fontWeight: 700 }}>{q.question_text || q.prompt}</div>
              </div>
              <div className="toeic-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {opts.map((opt, i) => {
                  const label = typeof opt === "object" ? `${opt.key}. ${opt.text}` : opt;
                  const value = typeof opt === "object" ? opt.key : opt;
                  const active = (answers[q.id]||'') === value;
                  return (
                    <label key={i} className="toeic-option-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      border: active ? '2px solid #6366f1' : '1px solid #e5e7eb',
                      background: active ? '#eef2ff' : '#fff',
                      color: active ? '#4338ca' : '#111827',
                      borderRadius: 12, padding: '10px 12px', cursor: 'pointer', transition: 'all .15s'
                    }}>
                      <input
                        type="radio"
                        style={{ accentColor:'#6366f1' }}
                        name={`q_${q.id}`}
                        checked={active}
                        onChange={() => setAnswers(a => ({ ...a, [q.id]: value }))}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  

  const partNames = {
    part_1: "Part 1: Photographs",
    part_2: "Part 2: Question–Response",
    part_3: "Part 3: Conversations",
    part_4: "Part 4: Talks",
    part_5: "Part 5: Incomplete Sentences",
    part_6: "Part 6: Text Completion",
    part_7: "Part 7: Reading Comprehension"
  };

  return (
    <div className="toeic-container" style={{ 
      padding: 16,
      background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
      minHeight: '100vh'
    }}>
      <PageBreadcrumb 
        backgroundColor="transparent"
        textColor="rgba(255,255,255,0.8)"
        currentTextColor="white"
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Học tập', path: '#' },
          { label: 'Luyện TOEIC', path: '/toeic' }
        ]}
      />
      {/* Header */}
      <div className="toeic-header" style={{
        background: 'linear-gradient(135deg,#6366f1 0%,#7c3aed 100%)',
        borderRadius: 16,
        padding: '18px 20px',
        color: '#fff',
        marginBottom: 16,
        boxShadow: '0 8px 24px rgba(99,102,241,.25)'
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: .3 }}>Luyện đề TOEIC (200 câu chuẩn)</div>
        <div className="toeic-subtitle" style={{ opacity: .9, marginTop: 4 }}>Đề thi theo đúng cấu trúc 7 Part TOEIC và chấm điểm tự động</div>
      </div>

      {/* Toolbar */}
      <div className="toeic-toolbar" style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14,
        display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14,
        boxShadow: '0 4px 18px rgba(0,0,0,0.04)'
      }}>
        <button className="toeic-generate-btn" onClick={generate} disabled={loading} style={{
          background: 'linear-gradient(135deg,#22c55e,#16a34a)',
          color:'#fff', border:'none', borderRadius:10,
          padding: '10px 14px', fontWeight: 800, boxShadow:'0 6px 18px rgba(34,197,94,.3)'
        }}>
          {loading ? 'Đang sinh đề...' : 'Sinh đề TOEIC chuẩn (200 câu)'}
        </button>
        {test && (
          <div style={{ marginLeft: 'auto', fontWeight: 700 }}>
            Đã chọn {countAnswered()} / {Object.values(test).flat().length}
          </div>
        )}
      </div>

      {/* Questions */}
      {test && (
        <div className="toeic-questions-container" style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 16,
          boxShadow:'0 6px 18px rgba(0,0,0,.04)'
        }}>
          {Object.keys(partNames).map(partKey => renderQuestions(partKey, partNames[partKey]))}

          <div className="toeic-submit-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
            <div style={{ fontWeight: 700, color:'#6b7280' }}>
              Đã trả lời: {countAnswered()} / {Object.values(test).flat().length}
            </div>
            <button className="toeic-submit-btn" onClick={grade} disabled={countAnswered()===0} style={{
              background: countAnswered()>0 ? 'linear-gradient(135deg,#6366f1,#7c3aed)' : '#c7d2fe',
              color:'#fff', border:'none', borderRadius:12, padding:'10px 18px', fontWeight:800,
              boxShadow: countAnswered()>0 ? '0 8px 20px rgba(99,102,241,.35)' : 'none'
            }}>
              Nộp bài
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="toeic-result-container" style={{ marginTop: 16, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, boxShadow:'0 6px 18px rgba(0,0,0,.04)' }}>
          <div className="toeic-result-header" style={{ display:'flex', gap: 12, flexWrap:'wrap', alignItems:'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Kết quả</div>
            <span style={{ background:'#ecfeff', color:'#0891b2', border:'1px solid #a5f3fc', padding:'4px 10px', borderRadius: 999, fontWeight:800 }}>
              {result.score}/{result.total_questions}
            </span>
            <span style={{ background:'#eef2ff', color:'#6366f1', border:'1px solid #c7d2fe', padding:'4px 10px', borderRadius: 999, fontWeight:800 }}>
              {result.percentage}%
            </span>
          </div>
          {Array.isArray(result.results) && result.results.map((r, i) => (
            <div key={i} className="toeic-result-item" style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px dashed #e5e7eb', alignItems:'center' }}>
              <span>{r.is_correct ? '✅' : '❌'}</span>
              <span style={{ color:'#6b7280' }}>Bạn: <b style={{ color:'#111827' }}>{r.user_answer || '(bỏ trống)'}</b></span>
              <span style={{ color:'#6b7280' }}>Đúng: <b style={{ color:'#111827' }}>{r.correct_answer}</b></span>
            </div>
          ))}
        </div>
      )}
      
      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .toeic-container {
            padding: 12px !important;
          }
          
          .toeic-header {
            padding: 16px !important;
            font-size: 18px !important;
          }
          
          .toeic-subtitle {
            font-size: 14px !important;
            margin-top: 6px !important;
          }
          
          .toeic-toolbar {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
          }
          
          .toeic-generate-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          
          .toeic-questions-container {
            padding: 12px !important;
          }
          
          .toeic-part-title {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
          
          .toeic-question {
            margin-bottom: 20px !important;
            padding-bottom: 16px !important;
          }
          
          .toeic-question-number {
            font-size: 14px !important;
            padding: 4px 8px !important;
          }
          
          .toeic-question-text {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }
          
          .toeic-options-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          
          .toeic-option-btn {
            padding: 12px 16px !important;
            font-size: 16px !important;
            text-align: left !important;
          }
          
          .toeic-part1-options {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .toeic-part1-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 18px !important;
          }
          
          .toeic-submit-section {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: stretch !important;
          }
          
          .toeic-submit-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
          
          .toeic-result-container {
            padding: 12px !important;
            margin-top: 12px !important;
          }
          
          .toeic-result-header {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          
          .toeic-result-item {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-start !important;
            padding: 12px 0 !important;
          }
        }
        
        @media (max-width: 480px) {
          .toeic-header {
            font-size: 16px !important;
            padding: 14px !important;
          }
          
          .toeic-subtitle {
            font-size: 13px !important;
          }
          
          .toeic-question-text {
            font-size: 15px !important;
          }
          
          .toeic-option-btn {
            padding: 10px 12px !important;
            font-size: 15px !important;
          }
          
          .toeic-part1-btn {
            padding: 10px 12px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

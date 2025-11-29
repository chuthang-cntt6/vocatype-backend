import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function TestResult() {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // Modal state

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setError('Vui lòng đăng nhập'); return; }
        const res = await fetch(`http://localhost:5050/api/question-bank/attempts/${attemptId}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Không tải được chi tiết lần làm bài');
        setDetail(data);
      } catch (e) {
        setError(e.message || 'Lỗi');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [attemptId]);

  const formatTime = (t) => {
    const m = Math.floor((t||0)/60); const s=(t||0)%60; return `${m}:${String(s).padStart(2,'0')}`;
  };

  const total = (detail?.results && detail.results.length>0) ? detail.results.length : (detail?.total_questions || 0);
  const parts = Array.from(new Set(((detail?.results)||[]).map(r=>r.part_id).filter(Boolean)));
  const correct = (typeof detail?.score === 'number') ? detail.score : (((detail?.results)||[]).filter(r=>r.is_correct).length);
  const skipped = (detail?.results && detail.results.length>0) ? ((detail.results)||[]).filter(r=>!r.user_answer).length : (detail?.summary?.skipped || 0);
  const wrong = Math.max(0, total - correct - skipped);
  const [tab, setTab] = useState('passage'); // passage | overall
  const byType = (() => {
    const map = new Map();
    ((detail?.results)||[]).forEach(r => {
      const k = (r.type||'').toLowerCase();
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return map;
  })();

  if (loading) return <div style={{padding:24}}>Đang tải...</div>;
  if (error) return <div style={{padding:24,color:'red'}}>{error}</div>;
  if (!detail) return null;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #eef2ff, #fafafa)', padding:'24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 12px 32px rgba(0,0,0,0.06)', marginBottom:16 }}>
          {/* <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Link to={`/tests/${id}`} style={{textDecoration:'none',fontWeight:800,color:'#2563eb'}}>← Quay về đề thi</Link>
          </div> */}
          <h2 style={{ margin:'8px 0 12px', fontWeight:900 }}>Kết quả luyện tập: {detail.bank_title} {parts.length===1?`| Passage ${parts[0]}`:''}</h2>
          {/* Actions */}
          <div style={{ display:'flex', gap:10, marginTop:8, marginBottom:10 }}>
            <button style={{ background:'#2563eb', color:'#fff', border:'1px solid #93c5fd', padding:'8px 12px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>Xem đáp án</button>
            <button onClick={()=>navigate(`/tests/${id}`)} style={{ border:'1px solid #e5e7eb', background:'#fff', padding:'8px 12px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>Quay về trang đề thi</button>
          </div>

          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14 }}>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:14 }}>
              <div style={{ fontWeight:800, marginBottom:6 }}>Kết quả làm bài</div>
              <div style={{ fontSize:22, fontWeight:900 }}>{correct}/{total}</div>
              <div style={{ marginTop:8, color:'#6b7280' }}>Độ chính xác: <b>{detail.percentage}%</b></div>
              <div style={{ marginTop:4, color:'#6b7280' }}>Thời gian: <b>{formatTime(detail.time_taken)}</b></div>
            </div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:14, textAlign:'center' }}>
              <div style={{ color:'#16a34a', fontWeight:900, marginBottom:4 }}>Trả lời đúng</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#16a34a' }}>{correct}</div>
              <div style={{ color:'#6b7280' }}>câu hỏi</div>
            </div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:14, textAlign:'center' }}>
              <div style={{ color:'#dc2626', fontWeight:900, marginBottom:4 }}>Trả lời sai</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#dc2626' }}>{wrong}</div>
              <div style={{ color:'#6b7280' }}>câu hỏi</div>
            </div>
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:14, textAlign:'center' }}>
              <div style={{ color:'#475569', fontWeight:900, marginBottom:4 }}>Bỏ qua</div>
              <div style={{ fontSize:28, fontWeight:900, color:'#475569' }}>{skipped}</div>
              <div style={{ color:'#6b7280' }}>câu hỏi</div>
            </div>
          </div>

          {/* Analysis tabs */}
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {['passage','overall'].map(t => (
                <button key={t} onClick={()=>setTab(t)} style={{ border:'1px solid #e5e7eb', padding:'6px 12px', borderRadius:999, background: tab===t?'#2563eb':'#fff', color: tab===t?'#fff':'#111827', fontWeight:800 }}>{t==='passage'?'Passage':'Tổng quát'}</button>
              ))}
            </div>

            {/* Table by type */}
            <div style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2.2fr 0.7fr 0.7fr 0.7fr 1fr 1.8fr', padding:'10px 12px', background:'#f8fafc', color:'#475569', fontWeight:800 }}>
                <div>Phân loại câu hỏi</div>
                <div>Số câu đúng</div>
                <div>Số câu sai</div>
                <div>Số câu bỏ qua</div>
                <div>Độ chính xác</div>
                <div>Danh sách câu hỏi</div>
              </div>
              {((detail.results||[]).length>0) && [...byType.entries()].map(([k, arr], idx) => {
                const c = arr.filter(r=>r.is_correct).length;
                const s = arr.filter(r=>!r.is_correct && r.user_answer).length;
                const sk = arr.filter(r=>!r.user_answer).length;
                const acc = arr.length>0 ? ((c/arr.length)*100).toFixed(2)+'%' : '0%';
                const label = (k==='tfng')
                  ? '[Reading] True/False/Not Given'
                  : (k==='mcq') ? '[Reading] Matching/Headings'
                  : '[Reading] Short Answer';
                return (
                  <div key={idx} style={{ display:'grid', gridTemplateColumns:'2.2fr 0.7fr 0.7fr 0.7fr 1fr 1.8fr', padding:'10px 12px', borderTop:'1px solid #e5e7eb', alignItems:'center' }}>
                    <div>{label}</div>
                    <div>{c}</div>
                    <div>{s}</div>
                    <div>{sk}</div>
                    <div>{acc}</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {arr
                        .sort((a,b)=> (a.question_number||a.order_index||0) - (b.question_number||b.order_index||0))
                        .map((r,i)=> (
                          <div 
                            key={i} 
                            title={`Câu ${(r.question_number||r.order_index||i+1)}`} 
                            onClick={() => setSelectedQuestion(r)}
                            style={{ 
                              width:28, height:28, borderRadius:'50%', 
                              border:'2px solid '+(r.is_correct?'#16a34a':'#dc2626'), 
                              color:(r.is_correct?'#16a34a':'#dc2626'), 
                              display:'flex', alignItems:'center', justifyContent:'center', 
                              fontWeight:900, fontSize:12, cursor:'pointer',
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          >
                            {r.question_number || r.order_index || (i+1)}
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display:'grid', gridTemplateColumns:'2.2fr 0.7fr 0.7fr 0.7fr 1fr 1.8fr', padding:'10px 12px', borderTop:'1px solid #e5e7eb', background:'#f8fafc', fontWeight:900 }}>
                <div>Total</div>
                <div>{correct}</div>
                <div>{wrong}</div>
                <div>{skipped}</div>
                <div>{detail?.percentage ?? (total>0?Math.round((correct/total)*100):0)+'%'}</div>
                <div></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop:16 }}>
            <div style={{ fontWeight:900, marginBottom:8 }}>Đáp án</div>
            {(detail.results||[]).length>0 && parts.length>0 ? parts.map(p => (
              <div key={p} style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12, marginBottom:12 }}>
                <div style={{ fontWeight:800, marginBottom:10 }}>Passage {p}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 }}>
                  {(detail.results||[]).filter(r=>r.part_id===p).map((r, i) => {
                    // Lấy nội dung đáp án từ options nếu có
                    const getUserAnswerText = () => {
                      if (!r.user_answer) return '';
                      if (r.options && Array.isArray(r.options)) {
                        const index = r.user_answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                        return r.options[index] || r.user_answer;
                      }
                      return r.user_answer;
                    };
                    
                    const getCorrectAnswerText = () => {
                      if (!r.correct_answer) return '';
                      if (r.options && Array.isArray(r.options)) {
                        const index = r.correct_answer.charCodeAt(0) - 65;
                        return r.options[index] || r.correct_answer;
                      }
                      return r.correct_answer;
                    };
                    
                    return (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'36px 1fr', gap:10, alignItems:'start', padding:'8px 10px', borderRadius:8, background:'#f8fafc', border:'1px solid #e5e7eb' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'#e0e7ff', color:'#4338ca', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>{r.question_number || r.order_index || (i+1)}</div>
                        <div>
                          <div style={{ fontSize:13, color:'#374151', marginBottom:4 }}>
                            Câu mình chọn: <b style={{ color: r.is_correct?'#16a34a':'#dc2626' }}>{getUserAnswerText()}</b>
                          </div>
                          <div style={{ fontSize:13, color:'#6b7280' }}>
                            Đáp án đúng: <b>{getCorrectAnswerText()}</b> {r.is_correct ? '✓' : '✗'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )) : (
              <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12, color:'#475569' }}>
                Không có dữ liệu chi tiết câu hỏi cho lần làm này.
              </div>
            )}
          </div>

          {/* <div style={{ marginTop:12, display:'flex', gap:8 }}>
            <button onClick={()=>navigate(`/tests/${id}`)} style={{ border:'1px solid #e5e7eb', padding:'8px 12px', borderRadius:8, background:'#fff', fontWeight:800, cursor:'pointer' }}>Quay về trang đề thi</button>
          </div> */}
        </div>
      </div>

      {/* Modal xem chi tiết câu hỏi */}
      {selectedQuestion && (
        <div 
          onClick={() => setSelectedQuestion(null)}
          style={{ 
            position:'fixed', top:0, left:0, right:0, bottom:0, 
            background:'rgba(0,0,0,0.5)', display:'flex', 
            alignItems:'center', justifyContent:'center', zIndex:9999 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background:'#fff', borderRadius:16, padding:24, 
              maxWidth:800, width:'90%', maxHeight:'80vh', overflow:'auto',
              boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:20, fontWeight:900 }}>
                Câu {selectedQuestion.question_number || selectedQuestion.order_index || '?'}
              </h3>
              <button 
                onClick={() => setSelectedQuestion(null)}
                style={{ 
                  background:'#f3f4f6', border:'none', borderRadius:8, 
                  padding:'8px 12px', cursor:'pointer', fontWeight:800 
                }}
              >
                ✕ Đóng
              </button>
            </div>

            {/* Passage */}
            {selectedQuestion.part_id && (() => {
              const passage = (detail.passages || []).find(p => p.part_id === selectedQuestion.part_id);
              if (!passage) return null;
              return (
                <div style={{ 
                  background:'#f8fafc', border:'1px solid #e5e7eb', 
                  borderRadius:10, padding:16, marginBottom:16 
                }}>
                  <div style={{ 
                    display:'inline-block', padding:'4px 10px', 
                    borderRadius:999, background:'#e0e7ff', 
                    color:'#4338ca', fontWeight:800, fontSize:12, marginBottom:10 
                  }}>
                    Passage {passage.part_id}
                  </div>
                  <div style={{ whiteSpace:'pre-wrap', lineHeight:1.7, fontSize:15 }}>
                    {passage.passage_text}
                  </div>
                </div>
              );
            })()}

            {/* Question */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontWeight:800, marginBottom:8, fontSize:16 }}>
                {selectedQuestion.question_text}
              </div>
              
              {/* Options */}
              {selectedQuestion.options && Array.isArray(selectedQuestion.options) && (
                <div style={{ display:'grid', gap:10 }}>
                  {selectedQuestion.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    const isUserAnswer = selectedQuestion.user_answer === letter;
                    const isCorrect = selectedQuestion.correct_answer === letter;
                    
                    return (
                      <div 
                        key={idx}
                        style={{ 
                          padding:'12px 14px', borderRadius:8,
                          border: isCorrect ? '2px solid #16a34a' : (isUserAnswer ? '2px solid #dc2626' : '1px solid #e5e7eb'),
                          background: isCorrect ? '#f0fdf4' : (isUserAnswer ? '#fef2f2' : '#fff'),
                          display:'flex', alignItems:'center', gap:10
                        }}
                      >
                        <div style={{ 
                          width:28, height:28, borderRadius:'50%',
                          background: isCorrect ? '#16a34a' : (isUserAnswer ? '#dc2626' : '#e5e7eb'),
                          color: (isCorrect || isUserAnswer) ? '#fff' : '#374151',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:900, fontSize:14
                        }}>
                          {letter}
                        </div>
                        <div style={{ flex:1, fontSize:15 }}>{opt}</div>
                        {isUserAnswer && !isCorrect && <span style={{ color:'#dc2626', fontWeight:800 }}>✗ Bạn chọn</span>}
                        {isCorrect && <span style={{ color:'#16a34a', fontWeight:800 }}>✓ Đúng</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ 
              background: selectedQuestion.is_correct ? '#f0fdf4' : '#fef2f2',
              border: selectedQuestion.is_correct ? '1px solid #16a34a' : '1px solid #dc2626',
              borderRadius:10, padding:12, fontSize:14
            }}>
              <div style={{ fontWeight:800, marginBottom:6 }}>
                {selectedQuestion.is_correct ? '✓ Chính xác!' : '✗ Chưa đúng'}
              </div>
              <div>
                <strong>Câu bạn chọn:</strong> {selectedQuestion.user_answer || '(Bỏ qua)'}
              </div>
              <div>
                <strong>Đáp án đúng:</strong> {selectedQuestion.correct_answer}
              </div>
            </div>

            {/* Phần giải thích chi tiết */}
            {(selectedQuestion.answer_location || selectedQuestion.keywords || selectedQuestion.explanation) && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontWeight:900, fontSize:16, marginBottom:12, color:'#1e40af' }}>
                  📚 Giải thích chi tiết
                </div>
                
                {/* Trích đoạn chứa đáp án */}
                {selectedQuestion.answer_location && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:6, color:'#374151' }}>
                      📍 Trích đoạn chứa đáp án:
                    </div>
                    <div style={{ 
                      background:'#fffbeb', 
                      border:'1px solid #fbbf24', 
                      borderRadius:8, 
                      padding:12, 
                      fontStyle:'italic',
                      lineHeight:1.6
                    }}>
                      "{selectedQuestion.answer_location}"
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {selectedQuestion.keywords && selectedQuestion.keywords.length > 0 && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:6, color:'#374151' }}>
                      🔑 Từ khóa quan trọng:
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {selectedQuestion.keywords.map((keyword, idx) => (
                        <span 
                          key={idx}
                          style={{ 
                            background:'#dbeafe', 
                            color:'#1e40af', 
                            padding:'4px 10px', 
                            borderRadius:999, 
                            fontSize:13, 
                            fontWeight:700 
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {selectedQuestion.explanation && (
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:6, color:'#374151' }}>
                      💡 Giải thích:
                    </div>
                    <div style={{ 
                      background:'#f0f9ff', 
                      border:'1px solid #0ea5e9', 
                      borderRadius:8, 
                      padding:12,
                      lineHeight:1.7,
                      whiteSpace:'pre-wrap'
                    }}>
                      {selectedQuestion.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

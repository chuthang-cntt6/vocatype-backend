import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../components/PageBreadcrumb';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export default function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [activeTab, setActiveTab] = useState('practice'); // practice | full | discuss
  const [taking, setTaking] = useState(false);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState(null); // submit result
  const [startedAt, setStartedAt] = useState(null); // timestamp ms
  const [attempts, setAttempts] = useState([]);
  const [latestAttemptDetail, setLatestAttemptDetail] = useState(null);
  // Practice grouping state
  const [groupSize] = useState(10);
  const [selectedGroups, setSelectedGroups] = useState(new Set([0])); // For passages: holds part_id values
  const [customTimeMin, setCustomTimeMin] = useState('');
  const [timeLeft, setTimeLeft] = useState(null); // seconds, null for unlimited
  const [highlight, setHighlight] = useState(false);

  const truncate = (text, maxLen = 220) => {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  };
  const isLongPassage = (text) => !!text && (text.length > 400 || /\n\s*\n/.test(text));
  const isReadingSinglePassage = () => isLongPassage(test?.description || '');
  const firstHeading = (text) => {
    if (!text) return '';
    const lines = String(text).split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    return lines[0] || '';
  };

  const fetchAttemptsAndLatest = async (token, preferredId=null) => {
    try {
      const a = await fetch(`${API_BASE_URL}/api/question-bank/${id}/attempts`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (a.ok) {
        const arr = await a.json();
        console.log('📋 Attempts from API:', arr);
        setAttempts(Array.isArray(arr) ? arr : []);
        const pickId = preferredId || (Array.isArray(arr) && arr[0]?.id);
        if (pickId) {
          try {
            const d = await fetch(`${API_BASE_URL}/api/question-bank/attempts/${pickId}`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (d.ok) setLatestAttemptDetail(await d.json());
          } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/question-bank/${id}`);
        if (!res.ok) throw new Error('Không tải được dữ liệu đề thi');
        const data = await res.json();
        setTest(data);
        // Default selection: if có passages thì chọn passage đầu tiên
        if (Array.isArray(data.passages) && data.passages.length > 0) {
          setSelectedGroups(new Set([data.passages[0].part_id]));
        } else {
          setSelectedGroups(new Set([0]));
        }
        // Fetch attempts (nếu đã đăng nhập)
        const token = localStorage.getItem('token');
        if (token) await fetchAttemptsAndLatest(token);
      } catch (e) {
        setError(e.message || 'Lỗi');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const viewAttempt = async (attemptId) => {
    // Điều hướng sang trang kết quả riêng
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Vui lòng đăng nhập'); return; }
      // Không fetch và render inline nữa; chuyển trang
      window.location.assign(`/tests/${id}/results/${attemptId}`);
    } catch (e) {
      alert('Không mở được trang kết quả');
    }
  };

  const startTake = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập');
        return;
      }
      setTaking(true);
      setResult(null);
      const res = await fetch(`${API_BASE_URL}/api/question-bank/${id}/take`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Không thể bắt đầu bài thi');
      const data = await res.json();
      let sessionData = { ...data };
      // Gắn passages để dùng khi render
      sessionData.passages = data.passages || [];
      
      // Nếu backend có passages và đang luyện tập: lọc theo part_id được chọn
      if (activeTab === 'practice' && Array.isArray(data.questions) && data.passages && data.passages.length > 0) {
        const allowed = new Set(Array.from(selectedGroups)); // selected part_id
        const filtered = data.questions.filter(q => !q.part_id || allowed.has(q.part_id));
        sessionData.questions = filtered.length ? filtered : data.questions;
      } else if (!(isReadingSinglePassage())) {
        // Không có passages: dùng grouping 10 câu như cũ
        if (activeTab === 'practice' && selectedGroups.size > 0 && Array.isArray(data.questions)) {
          const total = data.questions.length;
          const selectedIndexes = [];
          selectedGroups.forEach(g => {
            const start = g * groupSize;
            const end = Math.min(start + groupSize, total);
            for (let i = start; i < end; i++) selectedIndexes.push(i);
          });
          const filteredQuestions = selectedIndexes
            .filter(i => i >= 0 && i < total)
            .map(i => data.questions[i]);
          sessionData.questions = filteredQuestions;
        }
      }
      // If no questions returned, build mock questions so user can practice immediately
      if (!Array.isArray(sessionData.questions) || sessionData.questions.length === 0) {
        const mockCount = Math.max(10, groupSize);
        const buildMock = (i) => {
          if (i >= 10 && i < 16) {
            // TFNG sample
            return { id:`mock-${i+1}`, prompt:`Câu ${i+1}: Đánh dấu TRUE/FALSE/NOT GIVEN theo đoạn văn`, type:'tfng' };
          }
          if (i >= 16 && i < 20) {
            // MCQ sample
            return { id:`mock-${i+1}`, prompt:`Câu ${i+1}: Chọn đáp án đúng`, type:'mcq', options:['A','B','C','D'] };
          }
          // Short text default
          return { id:`mock-${i+1}`, prompt:`Câu ${i+1}: NO MORE THAN TWO WORDS`, type:'short' };
        };
        sessionData = {
          ...sessionData,
          questions: Array.from({ length: mockCount }, (_, i) => buildMock(i))
        };
      }
      setSession(sessionData);
      setAnswers(new Array(sessionData.questions.length).fill(''));
      setIdx(0);
      const seconds = customTimeMin ? (parseInt(customTimeMin,10)||0)*60 : (data.time_limit || 0);
      setTimeLeft(seconds > 0 ? seconds : null);
      setStartedAt(Date.now());
    } catch (e) {
      alert(e.message || 'Lỗi');
    } finally {
      setTaking(false);
    }
  };

  const submit = async () => {
    try {
      const token = localStorage.getItem('token');
      // Tính thời gian làm bài (giây)
      let used = 0;
      if (startedAt) {
        used = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      }
      // Gửi theo dạng [{question_id, answer}] để backend chỉ chấm các câu đã chọn
      const payloadAnswers = (session?.questions || []).map((q, i) => ({ question_id: q.id, answer: answers[i] || '' }));
      const res = await fetch(`${API_BASE_URL}/api/question-bank/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || '')
        },
        body: JSON.stringify({ answers: payloadAnswers, time_taken: used })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Nộp bài thất bại');
      // Điều hướng sang trang kết quả nếu có attempt_id
      if (data.attempt_id) {
        const token2 = localStorage.getItem('token');
        if (token2) await fetchAttemptsAndLatest(token2, data.attempt_id);
        window.location.assign(`/tests/${id}/results/${data.attempt_id}`);
        return;
      }
      // Cập nhật box lịch sử ngay, không cần reload
      if (token) {
        await fetchAttemptsAndLatest(token, data.attempt_id);
      }
    } catch (e) {
      alert(e.message || 'Lỗi nộp bài');
    }
  };

  // Countdown effect for practice/custom time
  useEffect(() => {
    if (!session || timeLeft == null) return;
    if (timeLeft <= 0) { submit(); return; }
    const t = setInterval(() => {
      setTimeLeft(v => (v == null ? null : v - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [session, timeLeft]);

  // Render question by type (reading-like)
  const renderQuestion = (q, i) => {
    const value = answers[i] || '';
    const setVal = (v) => { const a=[...answers]; a[i]=v; setAnswers(a); };
    // Support backend-provided types if exist, else fallback
    switch ((q.type||'').toLowerCase()) {
      case 'tfng': // TRUE/FALSE/NOT GIVEN
        return (
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
            {['TRUE','FALSE','NOT GIVEN'].map(opt => (
              <label key={opt} style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8 }}>
                <input type="radio" name={`q-${i}`} checked={value===opt} onChange={()=>setVal(opt)} />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'mcq': // multiple choice with options
        return (
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8 }}>
            {(q.options||[]).map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // 0->A, 1->B, 2->C, 3->D
              return (
                <label key={idx} style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8 }}>
                  <input type="radio" name={`q-${i}`} checked={value===letter} onChange={()=>setVal(letter)} />
                  <strong style={{ marginRight: 8 }}>{letter}.</strong> {String(opt)}
                </label>
              );
            })}
          </div>
        );
      case 'short':
      case 'text':
      default:
        return (
          <input
            value={value}
            onChange={(e)=> setVal(e.target.value)}
            placeholder="Nhập câu trả lời"
            style={{ width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8 }}
          />
        );
    }
  };

  if (loading) return <div style={{padding:24}}>Đang tải...</div>;
  if (error) return <div style={{padding:24,color:'red'}}>{error}</div>;
  if (!test) return null;

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #eef2ff, #fafafa)', padding:'24px' }}>
      <PageBreadcrumb
        backgroundColor="transparent"
        textColor="#6b7280"
        currentTextColor="#4f46e5"
        items={[
          { label:'Trang chủ', path:'/' },
          { label:'Ngân hàng đề', path:'/question-bank' },
          { label:test.title, path:'#' }
        ]}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ background:'#fff', borderRadius:16, padding:24, boxShadow:'0 12px 32px rgba(0,0,0,0.06)', marginBottom:16 }}>
          <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:'#111827' }}>{test.title}</h1>
          <p style={{ margin:'8px 0 0', color:'#6b7280' }}>
            {isLongPassage(test.description)
              ? 'Đoạn văn Reading. Nhấn Luyện tập để đọc và làm bài'
              : (test.description || 'Không có mô tả')}
          </p>
          <div style={{ display:'flex', gap:16, marginTop:16, color:'#374151', fontWeight:600 }}>
            <span>⏱️ {Math.max(1, Math.floor((test.time_limit||0)/60))} phút</span>
            <span>🧩 {test.total_questions || (test.questions?.length || 0)} câu</span>
            <span>🏷️ {test.difficulty_level}</span>
          </div>

          {/* Attempts merged inside header card */}
          {attempts && attempts.length > 0 && (
            <div style={{ marginTop:16, borderTop:'1px solid #e5e7eb', paddingTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontWeight:900, fontSize:18 }}>Kết quả làm bài của bạn</div>
                {attempts.length > 5 && (
                  <button onClick={() => navigate(`/tests/${id}/history`)} style={{ border:'1px solid #4f46e5', color:'#4f46e5', background:'#fff', padding:'6px 12px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13 }}>Xem tất cả ({attempts.length})</button>
                )}
              </div>
              <div style={{ display:'grid', gap:10 }}>
                {attempts.slice(0, 5).map((a)=> (
                  <div key={a.id} style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12, background:'#fafafa', display:'grid', gridTemplateColumns:'1.5fr 0.6fr 0.6fr 0.7fr', gap:12, alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, color:'#6b7280', marginBottom:4 }}>{new Date(a.created_at).toLocaleString('vi-VN', { dateStyle:'short', timeStyle:'short' })}</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {(() => {
                          // Backend đã trả về passages array cho mỗi attempt
                          if (!a.passages || a.passages.length === 0) {
                            return <span style={{ padding:'3px 10px', border:'1px solid #e5e7eb', borderRadius:999, background:'#fff', fontSize:12, fontWeight:700 }}>Luyện tập</span>;
                          }
                          return a.passages.map(p => (
                            <span key={p} style={{ padding:'3px 10px', border:'1px solid #c7d2fe', borderRadius:999, background:'#eef2ff', color:'#4338ca', fontSize:12, fontWeight:800 }}>
                              Passage {p}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>Kết quả</div>
                      <div style={{ fontWeight:900, fontSize:18, color: a.score === a.total_questions ? '#16a34a' : '#111827' }}>
                        {a.score}/{a.total_questions}
                      </div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>Thời gian</div>
                      <div style={{ fontWeight:800, fontSize:15 }}>{(() => { const t=a.time_taken||0; const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,'0')}`; })()}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <button onClick={()=>viewAttempt(a.id)} style={{ border:'1px solid #e5e7eb', background:'#fff', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontWeight:800, fontSize:13, width:'100%' }}>Xem chi tiết</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Tabs (merged into the same card) */}
          <div style={{ display:'flex', gap:12, borderTop:'1px solid #e5e7eb', marginTop:16, paddingTop:10, borderBottom:'1px solid #e5e7eb', paddingBottom:8, marginBottom:16 }}>
            {['practice','full'].map(key => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{
                  border:'none', background:'transparent', padding:'10px 16px',
                  borderBottom: activeTab===key?'3px solid #4f46e5':'3px solid transparent',
                  color: activeTab===key?'#111827':'#6b7280', fontWeight:800, cursor:'pointer'
                }}>
                {key==='practice'?'Luyện tập':'Làm full test'}
              </button>
            ))}
          </div>

          {activeTab==='practice' && (
            <div>
              {/* Tip box */}
              <div style={{
                background:'linear-gradient(135deg, #ecfdf5, #d1fae5)', border:'1px solid #6ee7b7', color:'#065f46',
                padding:'14px 16px', borderRadius:12, fontWeight:600, marginBottom:20, display:'flex', alignItems:'center', gap:10
              }}>
                <span style={{ fontSize:20 }}>💡</span>
                <span>Pro tips: Luyện tập theo từng phần và chọn thời gian phù hợp giúp bạn tập trung mà không áp lực hoàn thành toàn bộ bài.</span>
              </div>

              <div style={{ fontWeight:900, fontSize:16, margin:'0 0 14px', color:'#111827' }}>Chọn phần thi bạn muốn làm</div>

              {/* Checkbox list of parts */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                {Array.isArray(test.passages) && test.passages.length > 0 ? (
                  test.passages.map(p => {
                    const checked = selectedGroups.has(p.part_id);
                    return (
                      <label key={p.part_id} style={{ 
                        display:'block', 
                        border: checked ? '2px solid #4f46e5' : '2px solid #e5e7eb', 
                        borderRadius:12, 
                        padding:'14px 16px',
                        background: checked ? '#f5f3ff' : '#fff',
                        cursor:'pointer',
                        transition:'all 0.2s'
                      }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <input 
                            type="checkbox" 
                            checked={checked} 
                            onChange={() => {
                              setSelectedGroups(prev => {
                                const next = new Set(prev);
                                if (next.has(p.part_id)) next.delete(p.part_id); else next.add(p.part_id);
                                return next;
                              });
                            }}
                            style={{ width:18, height:18, cursor:'pointer' }}
                          />
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:900, fontSize:15, color:'#111827', marginBottom:4 }}>
                              {p.title || (`Passage ${p.part_id}`)}
                            </div>
                            <div style={{ fontSize:13, color:'#6b7280' }}>
                              {p.count || 0} câu hỏi
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  (() => {
                    const totalQ = (test.questions?.length || test.total_questions || 0);
                    const groupsCount = isReadingSinglePassage() ? 1 : Math.max(1, Math.ceil(totalQ / groupSize));
                    return Array.from({ length: groupsCount }).map((_, gIdx) => {
                      const start = isReadingSinglePassage() ? 1 : (gIdx * groupSize + 1);
                      const end = isReadingSinglePassage() ? totalQ : Math.min(start + groupSize - 1, totalQ);
                      const countInThisGroup = Math.max(0, end - start + 1);
                      const checked = selectedGroups.has(gIdx);
                      return (
                        <label key={gIdx} style={{ 
                          display:'block', 
                          border: checked ? '2px solid #4f46e5' : '2px solid #e5e7eb', 
                          borderRadius:12, 
                          padding:'14px 16px',
                          background: checked ? '#f5f3ff' : '#fff',
                          cursor:'pointer',
                          transition:'all 0.2s'
                        }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <input 
                              type="checkbox" 
                              checked={checked} 
                              onChange={() => {
                                setSelectedGroups(prev => {
                                  const next = new Set(prev);
                                  if (next.has(gIdx)) next.delete(gIdx); else next.add(gIdx);
                                  return next;
                                });
                              }}
                              style={{ width:18, height:18, cursor:'pointer' }}
                            />
                            <div style={{ fontWeight:900, fontSize:15, color:'#111827' }}>
                              {isReadingSinglePassage() ? 'Passage' : 'Phần'} {gIdx+1} ({countInThisGroup} câu hỏi)
                            </div>
                          </div>
                        </label>
                      );
                    });
                  })()
                )}
              </div>

              <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                <button onClick={() => {
                  if (Array.isArray(test.passages) && test.passages.length > 0) {
                    setSelectedGroups(new Set(test.passages.map(p => p.part_id)));
                  } else {
                    const total = Math.ceil((test.questions?.length || test.total_questions || 0) / groupSize);
                    setSelectedGroups(new Set(Array.from({length: total}, (_,i)=>i)));
                  }
                }} style={{ border:'1px solid #4f46e5', background:'#fff', color:'#4f46e5', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontWeight:800, fontSize:13 }}>Chọn tất cả</button>
                <button onClick={() => setSelectedGroups(new Set())} style={{ border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontWeight:800, fontSize:13 }}>Bỏ chọn</button>
              </div>

              {/* Time limit select */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:900, fontSize:16, marginBottom:10, color:'#111827' }}>Giới hạn thời gian</div>
                <select value={customTimeMin} onChange={e=>setCustomTimeMin(e.target.value)}
                  style={{ 
                    width:'100%', 
                    padding:'12px 14px', 
                    border:'2px solid #e5e7eb', 
                    borderRadius:10, 
                    outline:'none',
                    fontSize:14,
                    fontWeight:600,
                    cursor:'pointer',
                    background:'#fff'
                  }}>
                  <option value="">-- Chọn thời gian --</option>
                  <option value="10">10 phút</option>
                  <option value="20">20 phút</option>
                  <option value="30">30 phút</option>
                  <option value="40">40 phút</option>
                  <option value="60">60 phút</option>
                </select>
              </div>

              <div>
                <button onClick={startTake} disabled={taking || selectedGroups.size===0}
                  style={{ 
                    background: selectedGroups.size===0 ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                    color:'#fff', 
                    border:'none', 
                    padding:'14px 24px', 
                    borderRadius:10, 
                    fontWeight:900, 
                    fontSize:15,
                    cursor: selectedGroups.size===0 ? 'not-allowed' : 'pointer',
                    width:'100%',
                    boxShadow: selectedGroups.size===0 ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition:'all 0.2s'
                  }}>
                  {taking ? 'Đang chuẩn bị...' : 'LUYỆN TẬP'}
                </button>
              </div>
            </div>
          )}

          {activeTab==='full' && (
            <div>
              <p style={{ color:'#6b7280', marginTop:0 }}>Làm toàn bộ đề theo thời gian quy định.</p>
              <button onClick={() => {
                // Chọn tất cả passages khi làm full test
                if (Array.isArray(test.passages) && test.passages.length > 0) {
                  setSelectedGroups(new Set(test.passages.map(p => p.part_id)));
                } else {
                  const total = Math.ceil((test.questions?.length || test.total_questions || 0) / groupSize);
                  setSelectedGroups(new Set(Array.from({length: total}, (_,i)=>i)));
                }
                startTake();
              }} disabled={taking} style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'10px 16px', borderRadius:10, fontWeight:800, cursor:'pointer' }}>
                {taking ? 'Đang chuẩn bị...' : 'Bắt đầu làm full test'}
              </button>
            </div>
          )}

          {/* Results view (Study4-like) */}
          {result && (
            <div style={{ marginTop:16 }}>
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <h2 style={{ margin:0 }}>Kết quả luyện tập: {test.title} {(() => {
                    const onlyOne = selectedGroups && selectedGroups.size===1; if (!onlyOne) return '';
                    const p = Array.from(selectedGroups)[0]; return p?` | Passage ${p}`:'';
                  })()}</h2>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12 }}>
                    <div style={{ fontWeight:800 }}>Kết quả làm bài</div>
                    <div style={{ fontSize:20, fontWeight:900 }}>{result.score}/{result.total_questions}</div>
                  </div>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12 }}>
                    <div style={{ fontWeight:800 }}>Độ chính xác</div>
                    <div style={{ fontSize:20, fontWeight:900 }}>{result.percentage}%</div>
                  </div>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12 }}>
                    <div style={{ fontWeight:800 }}>Thời gian hoàn thành</div>
                    <div style={{ fontSize:20, fontWeight:900 }}>{(() => {
                      const t = (result.time_taken ?? 0); const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,'0')}`;
                    })()}</div>
                  </div>
                </div>

                {/* Detailed answers */}
                <div style={{ marginTop:16 }}>
                  <div style={{ fontWeight:900, marginBottom:8 }}>Đáp án</div>
                  <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:12 }}>
                    <div style={{ fontWeight:800, marginBottom:10 }}>Passage {(() => {
                      // best effort: show first part_id in results
                      const p = (result.results||[]).find(r=>r.part_id)?.part_id; return p || 1;
                    })()}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
                      {(result.results||[]).map((r, i) => (
                        <div key={i} style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                            <div style={{ fontWeight:800 }}>{i+1}</div>
                            <div style={{ fontWeight:800, color: r.is_correct ? '#16a34a' : '#dc2626' }}>
                              {r.is_correct ? '✓' : '✗'}
                            </div>
                          </div>
                          <div style={{ fontSize:13, color:'#374151' }}>Trả lời: <b>{String(r.user_answer||'')}</b></div>
                          <div style={{ fontSize:13, color:'#6b7280' }}>Đúng: <b>{Array.isArray(r.correct_answer)? r.correct_answer.join(' / ') : String(r.correct_answer||'')}</b></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop:12, display:'flex', gap:8 }}>
                  <button onClick={()=>setResult(null)} style={{ border:'1px solid #e5e7eb', padding:'8px 12px', borderRadius:8, background:'#fff', fontWeight:800, cursor:'pointer' }}>Quay về trang đề thi</button>
                  <button onClick={startTake} style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'8px 12px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>Làm lại các câu sai</button>
                </div>
              </div>
            </div>
          )}

          {/* Take view */}
          {!result && session && (
            <div style={{ marginTop:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 320px', gap:18 }}>
                {/* Left: Main area with Passage + Question side-by-side */}
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
                  {/* Title + Exit */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', position:'relative', marginBottom:10 }}>
                    <div style={{ fontWeight:900, fontSize:18 }}>{test.title}</div>
                    <button onClick={()=>{ setSession(null); setAnswers([]); setIdx(0); }}
                      style={{ position:'absolute', right:0, top:0, border:'1px solid #e5e7eb', background:'#fff', padding:'6px 10px', borderRadius:8, cursor:'pointer', fontWeight:800 }}>Thoát</button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:700, color:'#334155' }}>
                      <input type="checkbox" checked={highlight} onChange={()=>setHighlight(v=>!v)} />
                      Highlight nội dung
                    </label>
                    <span style={{ marginLeft:'auto', fontWeight:800, color: timeLeft!=null && timeLeft<=30 ? '#dc2626' : '#111827' }}>
                      {timeLeft==null ? 'Không giới hạn' : `${Math.floor(timeLeft/60)}:${String(Math.max(0,timeLeft)%60).padStart(2,'0')}`}
                    </span>
                  </div>
                  {/* Two columns: Passage | Question */}
                  <div style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:14 }}>
                    {/* Passage */}
                    <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:16, maxHeight:560, overflow:'auto', background: highlight? '#fffbeb':'#fafafa' }}>
                      {(() => {
                        const q = session.questions[idx] || {};
                        const part = q.part_id;
                        const p = (session.passages || []).find(x => x.part_id === part);
                        const passageText = (p && p.passage_text) || (test.description || '');
                        const heading = firstHeading(passageText) || (p?.title || test.title);
                        return (
                          <>
                            <div style={{ display:'inline-block', padding:'6px 12px', borderRadius:999, background:'#e0e7ff', color:'#4338ca', fontWeight:800, marginBottom:10, fontSize:13 }}>
                              {p ? `Passage ${p.part_id}` : 'Passage'}
                            </div>
                            <div style={{ whiteSpace:'pre-wrap', marginBottom:0, lineHeight:1.65, fontSize:15 }}>
                              {passageText}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    {/* Question panel */}
                    <div style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:16 }}>
                      <div style={{ fontWeight:800, marginBottom:8, fontSize:16 }}>Câu {idx+1}</div>
                      <div style={{ color:'#374151', marginBottom:12, fontSize:15 }}>{session.questions[idx]?.prompt || `Điền từ đúng cho nghĩa: ${session.questions[idx]?.meaning || ''}`}</div>
                      {renderQuestion(session.questions[idx]||{}, idx)}
                      <div style={{ display:'flex', gap:10, marginTop:14 }}>
                        <button disabled={idx===0} onClick={()=>setIdx(i=>Math.max(0,i-1))} style={{ padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', cursor:'pointer', fontWeight:700 }}>Trước</button>
                        <button disabled={idx===session.questions.length-1} onClick={()=>setIdx(i=>Math.min(session.questions.length-1,i+1))} style={{ padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', cursor:'pointer', fontWeight:700 }}>Sau</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Sidebar */}
                <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontWeight:900 }}>Thời gian làm bài</div>
                    <button onClick={submit} style={{ background:'#ef4444', color:'#fff', border:'1px solid #fecaca', padding:'6px 12px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>NỘP BÀI</button>
                  </div>
                  <div style={{ border:'1px solid #cbd5e1', borderRadius:10, padding:'10px 12px', marginBottom:12, textAlign:'center', fontWeight:900, fontSize:18 }}>
                    {timeLeft==null ? '∞' : `${Math.floor(timeLeft/60)}:${String(Math.max(0,timeLeft)%60).padStart(2,'0')}`}
                  </div>
                  <div style={{ color:'#ef4444', fontSize:12, marginBottom:12 }}>
                    Chú ý: bạn có thể click vào số thứ tự câu hỏi trong bảng để đánh dấu review
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:6 }}>
                    {session.questions.map((_, i) => {
                      const answered = answers[i] && String(answers[i]).trim() !== '';
                      return (
                        <button key={i} onClick={()=>setIdx(i)}
                          style={{
                            padding:'8px 0', border:'1px solid #cbd5e1', borderRadius:6,
                            background: i===idx ? '#dbeafe' : (answered ? '#86efac' : '#fff'),
                            color:'#111827', fontWeight:800
                          }}
                        >{i+1}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

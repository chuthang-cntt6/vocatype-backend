import React, { useEffect, useState, useContext } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from '../components/PageBreadcrumb';
import { AuthContext } from '../context/AuthContext';
import { FaBook, FaCheckCircle, FaTimesCircle, FaChartBar, FaTrophy } from 'react-icons/fa';

export default function Review() {
  const { user } = useContext(AuthContext);
  const [reviewWords, setReviewWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [tomorrowWords, setTomorrowWords] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [shake, setShake] = useState(false);
  
  // New states for learning summary
  const [learningSummary, setLearningSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch learning summary for today
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/learning-summary`)
      .then(r => r.json())
      .then(data => {
        setLearningSummary(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching learning summary:', err);
        setLoading(false);
      });

    // Fetch review words
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/review-schedule/today`)
      .then(r => r.json())
      .then(data => {
        setReviewWords(data);
      });
    
    // Gợi ý ôn tập ngày mai
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5050'}/api/learner/${user.id}/review-schedule?tomorrow=1`)
      .then(r => r.json())
      .then(data => setTomorrowWords(data));
  }, [user]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (
      reviewWords[current] &&
      e.target.value.trim().toLowerCase() === reviewWords[current].word.toLowerCase()
    ) {
      setCorrect(true);
      setCorrectCount(c => c + 1);
      // Phát âm thanh đúng
      const audio = new Audio('/audio/notification.mp3');
      audio.play();
      // Gửi kết quả đúng lên backend (nếu muốn)
      // fetch(`/api/learner/${userId}/typingrecord`, { ... })
      setTimeout(() => {
        if (current + 1 < reviewWords.length) {
          setCurrent(current + 1);
          setInput('');
          setCorrect(false);
        } else {
          setDone(true);
          confetti();
          toast.success('Đã hoàn thành ôn tập!', { autoClose: 2000 });
        }
      }, 600);
    } else if (e.target.value.length >= reviewWords[current]?.word.length) {
      setWrongCount(w => w + 1);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  // Render learning summary
  const renderLearningSummary = () => {
    if (!learningSummary || !learningSummary.summary || learningSummary.summary.length === 0) {
      return (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Chưa có hoạt động học tập hôm nay
          </h3>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Hãy bắt đầu học từ mới để xem tổng kết ở đây!
          </p>
        </div>
      );
    }

    return (
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <FaChartBar style={{ color: '#6366f1', fontSize: '24px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
            📊 Tổng kết học tập hôm nay
          </h2>
        </div>

        {learningSummary.summary.map((item, index) => (
          <div key={index} style={{
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            border: '1px solid rgba(99, 102, 241, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  📚 {item.topic_name}
                </h3>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
                  {item.chapter_name || `Chương ${item.chapter_id}`}
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'white',
                fontWeight: '700',
                fontSize: '18px'
              }}>
                {Math.round(item.remember_rate)}%
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}>
                  {item.total_words}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Tổng từ</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#22c55e' }}>
                  {item.remembered_words}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Nhớ</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>
                  {item.forgotten_words}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Quên</div>
              </div>
            </div>

            {/* Chi tiết từ vựng */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '12px',
              padding: '16px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                Chi tiết từ vựng:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(() => {
                  const filteredVocab = learningSummary.vocabDetails
                    .filter(v => v.topic_name === item.topic_name && v.chapter_id === item.chapter_id);
                  console.log(`🔍 Debug for ${item.topic_name} - ${item.chapter_name || `Chương ${item.chapter_id}`}:`, {
                    allVocabDetails: learningSummary.vocabDetails,
                    filteredVocab: filteredVocab,
                    item: item
                  });
                  return filteredVocab.map((vocab, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: vocab.remembered ? '#dcfce7' : '#fef2f2',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '14px'
                    }}>
                      {vocab.remembered ? (
                        <FaCheckCircle style={{ color: '#22c55e', fontSize: '12px' }} />
                      ) : (
                        <FaTimesCircle style={{ color: '#ef4444', fontSize: '12px' }} />
                      )}
                      <span style={{ fontWeight: '600' }}>{vocab.word}</span>
                      <span style={{ color: '#64748b' }}>- {vocab.meaning}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div style={{textAlign:'center',marginTop:40}}>Đang tải dữ liệu...</div>;

    if (showSummary) {
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {renderLearningSummary()}
          
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              🎯 Bắt đầu ôn tập
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px' }}>
              Ôn tập lại những từ bạn đã học để củng cố kiến thức
            </p>
            <button
              onClick={() => setShowSummary(false)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Bắt đầu ôn tập
            </button>
          </div>
        </div>
      );
    }

    if (done || reviewWords.length === 0) {
      return (
        <div style={{textAlign:'center',marginTop:40}}>
          <h2 style={{color:'#22c55e'}}>Đã hoàn thành ôn tập hôm nay!</h2>
          {tomorrowWords.length > 0 && (
            <div style={{marginTop:24}}>
              <b>Gợi ý ôn tập ngày mai:</b>
              <ul style={{marginTop:8}}>
                {tomorrowWords.map(w => (
                  <li key={w.id}>{w.word} - {w.meaning}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => setShowSummary(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Xem lại tổng kết
          </button>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: 420, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color:'#2563eb', margin: 0 }}>Ôn tập từ cần nhớ</h2>
          <button
            onClick={() => setShowSummary(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            📊 Tổng kết
          </button>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:'#2563eb',marginBottom:8}}>{reviewWords[current]?.meaning}</div>
        <input
          value={input}
          onChange={handleInput}
          placeholder="Nhập từ tiếng Anh..."
          autoFocus
          className={`learn-input${correct ? ' correct' : ''}${shake ? ' shake' : ''}`}
          style={{width:'100%',marginBottom:16,padding:12,borderRadius:8,border:'1.5px solid #cbd5e1',fontSize:18,boxShadow: correct ? '0 0 0 2px #22c55e55' : 'none',transition: 'box-shadow 0.2s'}}
        />
        <div style={{marginTop:12, color:'#64748b'}}>Từ {current+1} / {reviewWords.length}</div>
        <div style={{marginTop:8, color:'#22c55e'}}>Đúng: {correctCount} | Sai: {wrongCount}</div>
        <div style={{marginTop:8, color:'#2563eb'}}>Tỷ lệ đúng: {reviewWords.length ? Math.round((correctCount/(correctCount+wrongCount||1))*100) : 0}%</div>
        <toast.Container position="top-center" />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
     // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 0 }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="#6b7280"
          currentTextColor="#6366f1"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Thống kê', path: '/review' },
            { label: 'Ôn tập', path: '/review' }
          ]}
        />
        {renderContent()}
      </div>
    </div>
  );
}

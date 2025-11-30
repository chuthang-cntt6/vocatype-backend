import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from '../components/PageBreadcrumb';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export default function QuestionBank() {
  const { user } = useContext(AuthContext);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [vocabularies, setVocabularies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Removed activeTab state - no longer needed

  // Form data for creating question bank
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'medium',
    time_limit: 60,
    total_questions: 10,
    selected_vocabs: []
  });

  // Filters
  const [filters, setFilters] = useState({
    difficulty: '',
    search: ''
  });

  const truncate = (text, maxLen = 200) => {
    if (!text) return '';
    const t = String(text).replace(/\s+/g, ' ').trim();
    return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
  };

  const isLongPassage = (text) => {
    if (!text) return false;
    // Heuristics: multi-paragraph or very long length
    return text.length > 400 || /\n\s*\n/.test(text);
  };

  // Load data ban đầu và exam history khi component mount
  useEffect(() => {
    loadData();
    if (user) {
      loadExamHistory();
    }
  }, []);

  // Debounce search để tránh gọi API quá nhiều
  useEffect(() => {
    // Chỉ hiển thị searching indicator khi có từ khóa
    if (filters.search && filters.search.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
    
    // Chỉ gọi loadData khi có thay đổi search (không phải lần đầu mount)
    if (filters.search !== undefined) {
      const timeoutId = setTimeout(() => {
        loadData();
      }, 500); // Chờ 500ms sau khi người dùng ngừng gõ

      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  // Gọi loadData khi thay đổi difficulty (không debounce)
  useEffect(() => {
    if (filters.difficulty !== undefined) {
      loadData();
    }
  }, [filters.difficulty]);

  const loadData = async () => {
    try {
      // Không hiển thị loading spinner khi search, chỉ dùng 🔍 indicator
      let banks;
      
      // Chỉ gọi API khi có từ khóa tìm kiếm
      if (filters.search && filters.search.trim()) {
        console.log('Searching for:', filters.search.trim()); // Debug log
        const aiParams = new URLSearchParams();
        aiParams.append('q', filters.search.trim());
        aiParams.append('status', 'approved'); // Chỉ tìm đề thi đã duyệt
        if (filters.difficulty) aiParams.append('difficulty', filters.difficulty);
        
        const aiRes = await fetch(`${API_BASE_URL}/api/question-bank/search/ai?${aiParams.toString()}`);
        if (!aiRes.ok) {
          throw new Error(`Search API error: ${aiRes.status}`);
        }
        const aiData = await aiRes.json();
        banks = aiData.results || [];
        
        console.log('Search results:', banks); // Debug log
        
        if (aiData.expanded && aiData.expanded !== filters.search.trim()) {
          console.log('AI expanded query:', aiData.expanded);
        }
        
        setQuestionBanks(banks);
      } else {
        // Load data thông thường khi không có search
        const params = new URLSearchParams();
        params.append('status', 'approved'); // Chỉ lấy đề thi đã duyệt
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        
        const banksRes = await fetch(`${API_BASE_URL}/api/question-bank?${params.toString()}`);
        if (!banksRes.ok) {
          throw new Error(`Question bank API error: ${banksRes.status}`);
        }
        const banksData = await banksRes.json();
        banks = banksData.results || banksData; // Support both formats
        
        // Load topics và vocab khi không có search (luôn load lại để đảm bảo data fresh)
        const topicsRes = await fetch(`${API_BASE_URL}/api/topics`);
        if (!topicsRes.ok) {
          throw new Error(`Topics API error: ${topicsRes.status}`);
        }
        const topicsData = await topicsRes.json();
        setTopics(topicsData);
        const vocabPromises = topicsData.map(topic => 
          fetch(`${API_BASE_URL}/api/topics/${topic.id}/vocab`).then(r => r.json())
        );
        const vocabResults = await Promise.all(vocabPromises);
        const allVocabs = vocabResults.flat();
        setVocabularies(allVocabs);
        
        setQuestionBanks(banks);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Lỗi tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false); // 设置loading为false以隐藏加载状态
      setIsSearching(false); // Ẩn 🔍 indicator khi tải xong
    }
  };

  const loadExamHistory = async () => {
    try {
      const token = localStorage.getItem('token'); // Sửa: Đọc từ localStorage
      if (!token) {
        console.log('No token found, skipping exam history load');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/question-bank/history/attempts`, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const history = await response.json();
        setExamHistory(history);
      } else if (response.status === 403) {
        console.log('Token expired or invalid, clearing tokens and redirecting to login');
        localStorage.clear(); // Sửa: Xóa localStorage
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        console.error('Failed to load exam history:', response.status);
        toast.error('Lỗi tải lịch sử thi');
      }
    } catch (error) {
      console.error('Error loading exam history:', error);
      toast.error('Lỗi tải lịch sử thi');
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/question-bank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') // Sửa: Đọc từ localStorage
        },
        body: JSON.stringify({
          ...formData,
          vocab_ids: formData.selected_vocabs
        })
      });

      if (response.ok) {
        toast.success('Tạo bộ đề thi thành công!');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          difficulty_level: 'medium',
          time_limit: 60,
          total_questions: 10,
          selected_vocabs: []
        });
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Lỗi tạo bộ đề thi');
      }
    } catch (error) {
      console.error('Error creating bank:', error);
      toast.error('Lỗi tạo bộ đề thi');
    }
  };

  const handleStartExam = async (bankId) => {
    try {
      const token = localStorage.getItem('token'); // Sửa: Đọc từ localStorage
      if (!token) {
        toast.error('Vui lòng đăng nhập để làm bài thi');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/question-bank/${bankId}/take`, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExamData(data);
        setTimeLeft(data.time_limit);
        setAnswers(new Array(data.questions.length).fill(''));
        setCurrentQuestion(0);
        setExamStarted(true);
        setExamCompleted(false);
        setExamResult(null);
        setShowExamModal(true);
      } else if (response.status === 403) {
        console.log('Token expired or invalid, clearing tokens and redirecting to login');
        localStorage.clear(); // Sửa: Xóa localStorage
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (response.status === 404) {
        toast.error('Bộ đề thi không tồn tại hoặc không có quyền truy cập');
      } else {
        console.error('Failed to start exam:', response.status);
        toast.error('Không thể bắt đầu bài thi');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Lỗi bắt đầu bài thi');
    }
  };

  const handleSubmitExam = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/question-bank/${examData.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') // Sửa: Đọc từ localStorage
        },
        body: JSON.stringify({
          answers,
          time_taken: examData.time_limit - timeLeft
        })
      });

      if (response.ok) {
        const result = await response.json();
        setExamResult(result);
        setExamCompleted(true);
        toast.success('Nộp bài thành công!');
      } else {
        toast.error('Lỗi nộp bài');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Lỗi nộp bài');
    }
  };

  // Exit exam without submitting
  const handleExitExam = () => {
    const confirmExit = window.confirm('Thoát bài thi? Tiến độ hiện tại sẽ bị mất.');
    if (!confirmExit) return;
    setShowExamModal(false);
    setExamStarted(false);
    setExamCompleted(false);
    setExamResult(null);
    setExamData(null);
    setAnswers([]);
    setCurrentQuestion(0);
    setTimeLeft(0);
  };

  // Stop exam and submit current answers
  const handleStopExam = async () => {
    const confirmStop = window.confirm('Dừng thi và nộp bài ngay bây giờ?');
    if (!confirmStop) return;
    await handleSubmitExam();
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0 && !examCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examCompleted]);

  const filteredBanks = questionBanks.filter(bank => {
    if (filters.difficulty && bank.difficulty_level !== filters.difficulty) return false;
    // Không filter theo search nữa vì server đã xử lý search
    return true;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="questionbank-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <PageBreadcrumb 
          backgroundColor="transparent"
          textColor="rgba(255,255,255,0.8)"
          currentTextColor="white"
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Học tập', path: '#' },
            { label: 'Ngân hàng đề', path: '/question-bank' }
          ]}
        />
        
        <div style={{
          background: 'rgba(255,255,255,0.95)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header Section */}
        <div className="questionbank-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '24px',
          borderBottom: '2px solid #f1f5f9'
        }}>
          <div>
          <h1 style={{
            margin: 0,
            color: '#1e293b',
              fontSize: '3rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              // WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
          }}>
            📚 Ngân hàng đề thi
          </h1>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              Tạo và quản lý các bộ đề thi từ vựng tiếng Anh
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Removed "Tạo bộ đề mới" button - Teacher can create tests in "Quản lý đề thi" page */}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="questionbank-filters" style={{
          background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            color: '#1e293b',
            fontSize: '1.2rem',
            fontWeight: '700'
          }}>
            🔍 Bộ lọc tìm kiếm
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                Tìm kiếm
              </label>
          <div style={{ position: 'relative', width: '90%' }}>
            <input
              type="text"
              placeholder="🤖 Tìm kiếm thông minh với AI..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '16px',
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                Độ khó
              </label>
          <select
            value={filters.difficulty}
            onChange={e => setFilters({...filters, difficulty: e.target.value})}
            style={{
                  width: '100%',
                  padding: '12px 16px',
              border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer'
            }}
          >
            <option value="">Tất cả độ khó</option>
                <option value="easy">🟢 Dễ</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="hard">🔴 Khó</option>
          </select>
            </div>
            <div>
              <button
                onClick={() => setFilters({ difficulty: '', search: '' })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔄 Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Removed exam history section - users can view history on individual test pages */}

        {/* Removed tabs - showing all tests by default */}

        {/* Enhanced Question Banks Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredBanks.map(bank => (
            <div key={bank.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
            >
              {/* Difficulty Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: bank.difficulty_level === 'easy' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                           bank.difficulty_level === 'medium' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                           'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {bank.difficulty_level === 'easy' ? '🟢 Dễ' : 
                 bank.difficulty_level === 'medium' ? '🟡 Trung bình' : '🔴 Khó'}
              </div>

              {/* Header */}
              <div style={{
                marginBottom: '20px',
                paddingRight: '80px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#1e293b',
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  lineHeight: '1.3',
                  marginBottom: '8px'
                }}>
                  {bank.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {isLongPassage(bank.description)
                    ? 'Đoạn văn Reading nhấn chi tiết để xem'
                    : (truncate(bank.description, 220) || 'Không có mô tả')}
                </p>
              </div>

              {/* Meta row (Study4-like) */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                color: '#475569',
                fontSize: '14px',
                fontWeight: 600
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span>⏱️</span>
                  <span>{Math.max(1, Math.floor((bank.time_limit || 0) / 60))} phút</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span>📝</span>
                  <span>{bank.rb_questions || bank.actual_questions || bank.total_questions || 0} câu hỏi</span>
                </div>
              </div>

              {/* Parts and questions line */}
              <div style={{ color:'#334155', fontSize:13, fontWeight:700, marginBottom:12 }}>
                {(() => { const q = bank.rb_questions || bank.actual_questions || bank.total_questions || 0; return Math.max(1, Math.ceil(q/10)); })()} phần thi | {(bank.rb_questions || bank.actual_questions || bank.total_questions || 0)} câu hỏi
              </div>

              {/* Hashtag tags */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                <span style={{ border:'1px solid #dbeafe', color:'#2563eb', background:'#eff6ff', padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:700 }}>#Vocabulary</span>
                <span style={{ border:'1px solid #e2e8f0', color:'#475569', background:'#f8fafc', padding:'4px 10px', borderRadius:999, fontSize:12, fontWeight:700 }}>#{(bank.difficulty_level==='easy'?'Easy':bank.difficulty_level==='medium'?'Medium':'Hard')}</span>
              </div>

              {/* Footer (Study4-like) */}
              <div style={{ paddingTop:12, borderTop:'1px solid #e2e8f0', display:'flex', justifyContent:'center' }}>
                <button
                  onClick={() => { window.location.href = `/tests/${bank.id}`; }}
                  style={{
                    width:'70%',
                    background: '#ffffff',
                    color: '#2563eb',
                    border: '1.5px solid #bfdbfe',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBanks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            borderRadius: '20px',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '24px'
            }}>
              📚
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 12px 0'
            }}>
              Chưa có bộ đề thi nào
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: '0 0 24px 0',
              maxWidth: '400px',
              margin: '0 auto 24px auto'
            }}>
              {filters.search || filters.difficulty
                ? 'Không tìm thấy bộ đề thi phù hợp với bộ lọc của bạn'
                : 'Chưa có bộ đề thi nào. Vui lòng quay lại sau!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              paddingBottom: '20px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  ✨ Tạo bộ đề thi mới
                </h2>
                <p style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '16px'
                }}>
                  Tạo bộ đề thi từ vựng tiếng Anh cho học viên
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.color = '#64748b';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#9ca3af';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBank}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  📝 Tên bộ đề:
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Nhập tên bộ đề thi..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    background: '#f8fafc'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  📄 Mô tả:
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về bộ đề thi..."
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    fontSize: '16px',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                    background: '#f8fafc',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f8fafc';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: '700',
                    color: '#374151',
                    fontSize: '16px'
                  }}>
                    🎯 Độ khó:
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={e => setFormData({...formData, difficulty_level: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="easy">🟢 Dễ</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="hard">🔴 Khó</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    fontWeight: '700',
                    color: '#374151',
                    fontSize: '16px'
                  }}>
                    ⏱️ Thời gian (giây):
                  </label>
                  <input
                    type="number"
                    value={formData.time_limit}
                    onChange={e => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                    min="10"
                    max="600"
                    placeholder="60"
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      background: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.background = 'white';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '16px'
                }}>
                  📚 Chọn từ vựng:
                </label>
                <div style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = 'white';
                }}
                >
                  {vocabularies.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '8px'
                }}>
                  {vocabularies.map(vocab => (
                    <label key={vocab.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          background: formData.selected_vocabs.includes(vocab.id) ? '#dbeafe' : 'transparent'
                        }}
                        onMouseOver={(e) => {
                          if (!formData.selected_vocabs.includes(vocab.id)) {
                            e.target.style.background = '#f1f5f9';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!formData.selected_vocabs.includes(vocab.id)) {
                            e.target.style.background = 'transparent';
                          }
                        }}
                        >
                      <input
                        type="checkbox"
                        checked={formData.selected_vocabs.includes(vocab.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selected_vocabs: [...formData.selected_vocabs, vocab.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selected_vocabs: formData.selected_vocabs.filter(id => id !== vocab.id)
                            });
                          }
                        }}
                            style={{ 
                              marginRight: '12px',
                              transform: 'scale(1.2)',
                              accentColor: '#3b82f6'
                            }}
                          />
                          <span style={{ 
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151'
                          }}>
                            <strong>{vocab.word}</strong> - {vocab.meaning}
                      </span>
                    </label>
                  ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#6b7280'
                    }}>
                      <p>Không có từ vựng nào để chọn</p>
                    </div>
                  )}
                </div>
                <div style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>
                  Đã chọn: <strong>{formData.selected_vocabs.length}</strong> từ vựng
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'flex-end',
                paddingTop: '20px',
                borderTop: '2px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '16px 32px',
                    border: '2px solid #d1d5db',
                    background: 'white',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#6b7280',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#9ca3af';
                    e.target.style.color = '#374151';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.color = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <span>✨</span>
                  Tạo bộ đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Exam Modal */}
      {showExamModal && examData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '900px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0'
          }}>
            {!examCompleted ? (
              <>
                {/* Exam Header */
                }
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '32px',
                  paddingBottom: '20px',
                  borderBottom: '2px solid #f1f5f9'
                }}>
                  <div>
                    <h2 style={{ 
                      margin: 0, 
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      📝 {examData.title}
                    </h2>
                    <p style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '16px'
                    }}>
                      Bộ đề thi từ vựng tiếng Anh
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: timeLeft < 30 ? 
                        'linear-gradient(135deg, #ef4444, #dc2626)' : 
                        timeLeft < 60 ? 
                        'linear-gradient(135deg, #f59e0b, #d97706)' :
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      padding: '16px 24px',
                      borderRadius: '16px',
                      fontWeight: '700',
                      fontSize: '18px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '20px' }}>⏱️</span>
                      {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                    <button
                      onClick={handleStopExam}
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      ⏸️ Dừng thi
                    </button>
                    <button
                      onClick={handleExitExam}
                      style={{
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        background: 'white',
                        color: '#374151',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      ← Quay lại
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  marginBottom: '32px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Tiến độ: {currentQuestion + 1} / {examData.questions.length}
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      {Math.round(((currentQuestion + 1) / examData.questions.length) * 100)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${((currentQuestion + 1) / examData.questions.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Question Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  padding: '32px',
                  borderRadius: '20px',
                  marginBottom: '32px',
                  border: '2px solid #e2e8f0',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    Câu {currentQuestion + 1}
                  </div>
                  
                  <div style={{
                    marginTop: '20px',
                  marginBottom: '24px'
                }}>
                    <h3 style={{
                      margin: '0 0 16px 0',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#374151'
                    }}>
                      Nhập từ tiếng Anh có nghĩa là:
                  </h3>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#1e293b',
                      textAlign: 'center',
                      padding: '20px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #d1d5db'
                    }}>
                    {examData.questions[currentQuestion]?.meaning}
                    </div>
                </div>

                  <div>
                  <input
                    type="text"
                    value={answers[currentQuestion] || ''}
                    onChange={e => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestion] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    placeholder="Nhập từ tiếng Anh..."
                    style={{
                      width: '100%',
                        padding: '20px',
                        border: '3px solid #d1d5db',
                        borderRadius: '16px',
                        fontSize: '20px',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        background: 'white'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                    }}
                    autoFocus
                  />
                  </div>
                </div>

                {/* Navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    style={{
                      padding: '16px 32px',
                      border: '2px solid #d1d5db',
                      background: currentQuestion === 0 ? '#f9fafb' : 'white',
                      borderRadius: '12px',
                      cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentQuestion === 0 ? 0.5 : 1,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      if (currentQuestion !== 0) {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentQuestion !== 0) {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <span>←</span>
                    Trước
                  </button>

                  {/* Question Navigation */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    maxWidth: '400px'
                  }}>
                    {examData.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        style={{
                          width: '45px',
                          height: '45px',
                          border: '2px solid #d1d5db',
                          background: answers[index] ? 
                            'linear-gradient(135deg, #10b981, #059669)' : 
                            index === currentQuestion ? 
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'white',
                          color: answers[index] || index === currentQuestion ? 'white' : '#374151',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          boxShadow: answers[index] ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                        onMouseOver={(e) => {
                          if (!answers[index] && index !== currentQuestion) {
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!answers[index] && index !== currentQuestion) {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (currentQuestion === examData.questions.length - 1) {
                        handleSubmitExam();
                      } else {
                        setCurrentQuestion(Math.min(examData.questions.length - 1, currentQuestion + 1));
                      }
                    }}
                    style={{
                      padding: '16px 32px',
                      background: currentQuestion === examData.questions.length - 1 ? 
                        'linear-gradient(135deg, #ef4444, #dc2626)' :
                        'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                  >
                    {currentQuestion === examData.questions.length - 1 ? (
                      <>
                        <span>🚀</span>
                        Nộp bài
                      </>
                    ) : (
                      <>
                        Tiếp theo
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '24px'
                }}>
                  {examResult.percentage >= 80 ? '🎉' : 
                   examResult.percentage >= 60 ? '😊' : '😔'}
                </div>
                <h2 style={{ 
                  marginBottom: '24px',
                  fontSize: '32px',
                    fontWeight: '800',
                  color: '#1e293b'
                }}>
                  Kết quả bài thi
                </h2>
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  padding: '32px',
                  borderRadius: '20px',
                  marginBottom: '32px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '64px',
                    fontWeight: '900',
                    color: examResult.percentage >= 70 ? '#10b981' : '#ef4444',
                    marginBottom: '16px',
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    {examResult.percentage}%
                  </div>
                  <p style={{ 
                    fontSize: '20px', 
                    margin: '0 0 8px 0',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {examResult.score} / {examResult.total_questions} câu đúng
                  </p>
                  <p style={{
                    fontSize: '16px',
                    margin: 0,
                    color: '#6b7280'
                  }}>
                    {examResult.percentage >= 80 ? 'Xuất sắc! 🏆' :
                     examResult.percentage >= 60 ? 'Tốt! 👍' : 'Cần cố gắng thêm! 💪'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => setShowExamModal(false)}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <span>✅</span>
                    Hoàn thành
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer />
      </div>
      
      {/* Responsive CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .questionbank-container {
            padding: 12px !important;
          }
          
          .questionbank-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          
          .questionbank-header h1 {
            font-size: 20px !important;
            margin-bottom: 8px !important;
          }
          
          .questionbank-header p {
            font-size: 14px !important;
            margin-bottom: 16px !important;
          }
          
          .questionbank-header button {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
          
          /* Filter section responsive */
          .questionbank-filters {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .questionbank-filters > div {
            width: 100% !important;
          }
          
          .questionbank-filters input,
          .questionbank-filters select {
            width: 100% !important;
            padding: 12px !important;
            font-size: 14px !important;
          }
          
          /* Question bank cards responsive */
          .questionbank-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .questionbank-card {
            padding: 16px !important;
          }
          
          .questionbank-card h3 {
            font-size: 16px !important;
          }
          
          .questionbank-card p {
            font-size: 13px !important;
          }
          
          .questionbank-card-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .questionbank-card-actions button {
            width: 100% !important;
            padding: 10px 16px !important;
            font-size: 14px !important;
          }
          
          /* Modal responsive */
          .questionbank-modal {
            padding: 16px !important;
            margin: 16px !important;
            max-width: calc(100vw - 32px) !important;
          }
          
          .questionbank-modal h2 {
            font-size: 18px !important;
          }
          
          .questionbank-modal-content {
            padding: 16px !important;
          }
          
          .questionbank-modal-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .questionbank-modal-actions button {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
          
          /* Form responsive */
          .questionbank-form {
            padding: 16px !important;
          }
          
          .questionbank-form-group {
            margin-bottom: 16px !important;
          }
          
          .questionbank-form-group label {
            font-size: 14px !important;
            margin-bottom: 6px !important;
          }
          
          .questionbank-form-group input,
          .questionbank-form-group select,
          .questionbank-form-group textarea {
            padding: 10px !important;
            font-size: 14px !important;
          }
          
          .questionbank-form-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .questionbank-form-actions button {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          .questionbank-container {
            padding: 8px !important;
          }
          
          .questionbank-header h1 {
            font-size: 18px !important;
          }
          
          .questionbank-header p {
            font-size: 13px !important;
          }
          
          .questionbank-card {
            padding: 12px !important;
          }
          
          .questionbank-card h3 {
            font-size: 15px !important;
          }
          
          .questionbank-card p {
            font-size: 12px !important;
          }
          
          .questionbank-modal {
            padding: 12px !important;
            margin: 8px !important;
            max-width: calc(100vw - 16px) !important;
          }
          
          .questionbank-modal h2 {
            font-size: 16px !important;
          }
          
          .questionbank-form {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}


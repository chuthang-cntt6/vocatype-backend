import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const formatWord = (text) => {
  if (!text) return '';
  // Loại bỏ khoảng trắng thừa và viết hoa chữ cái đầu
  return text.trim().replace(/\s+/g, ' ').replace(/^\w/, c => c.toUpperCase());
};

const formatSentence = (text) => {
  if (!text) return '';
  // Chuẩn hóa khoảng trắng và dấu câu
  let formatted = text.trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([.,!?])\s*/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
  // Viết hoa chữ cái đầu câu
  formatted = formatted.replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  formatted = formatted.replace(/^[a-z]/, c => c.toUpperCase());
  // Đảm bảo có dấu chấm cuối câu
  if (!/[.!?]$/.test(formatted)) {
    formatted += '.';
  }
  return formatted;
};

export default function CreateSet() {
  const { user } = useContext(AuthContext);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [sentence, setSentence] = useState('');
  const [sentenceAudio, setSentenceAudio] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  // Fetch topics on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error('Không thể tải danh sách chủ đề');
      const data = await res.json();
      console.log('Fetched topics:', data); // Debug log
      setTopics(data);
      setIsLoadingTopics(false);
    } catch (err) {
      console.error('Error fetching topics:', err); // Debug log
      setError('Không thể tải danh sách chủ đề: ' + err.message);
      setIsLoadingTopics(false);
    }
  };

  const handleCreateTopic = async () => {
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add token for auth
        },
        body: JSON.stringify({ 
          title: formatWord(newTopicName),
          description: newTopicDesc.trim(),
          is_public: isPublic
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Không thể tạo chủ đề mới');
      }
      
      const newTopic = await res.json();
      setTopics(prevTopics => [...prevTopics, newTopic]);
      setSelectedTopic(newTopic.id.toString());
      setNewTopicName('');
      setNewTopicDesc('');
      setShowNewTopicModal(false);
      setSuccess('Đã tạo chủ đề mới thành công!');
      setIsPublic(true);
    } catch (err) {
      console.error('Error creating topic:', err); // Debug log
      setError('Không thể tạo chủ đề: ' + err.message);
    }
  };

  const handleTopicChange = (e) => {
    const value = e.target.value;
    if (value === 'new' && user?.role === 'teacher') {
      setShowNewTopicModal(true);
    } else {
      setSelectedTopic(value);
    }
  };

  const validateInputs = () => {
    if (word.length < 2) {
      setError('Từ mới phải có ít nhất 2 ký tự');
      return false;
    }
    if (meaning.length < 2) {
      setError('Nghĩa của từ phải có ít nhất 2 ký tự');
      return false;
    }
    if (!selectedTopic) {
      setError('Vui lòng chọn chủ đề');
      return false;
    }
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      setError('Link hình phải bắt đầu bằng http:// hoặc https://');
      return false;
    }
    if (audioUrl && !/^https?:\/\/.+/.test(audioUrl)) {
      setError('Link audio phải bắt đầu bằng http:// hoặc https://');
      return false;
    }
    if (sentence && sentence.length < 5) {
      setError('Câu ví dụ phải có ít nhất 5 ký tự');
      return false;
    }
    if (sentenceAudio && !/^https?:\/\/.+/.test(sentenceAudio)) {
      setError('Link audio câu ví dụ phải bắt đầu bằng http:// hoặc https://');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!validateInputs()) return;

    try {
      // Thêm từ vựng
      const vocabRes = await fetch('/api/vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word: formatWord(word), 
          meaning: meaning.trim(), 
          topic_id: parseInt(selectedTopic), 
          image_url: imageUrl.trim(), 
          audio_url: audioUrl.trim() 
        })
      });

      if (!vocabRes.ok) {
        const error = await vocabRes.json();
        throw new Error(error.message || 'Lỗi khi thêm từ');
      }

      const vocab = await vocabRes.json();

      // Thêm câu ví dụ nếu có
      if (sentence.trim()) {
        const sentenceRes = await fetch('/api/sentence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            vocab_id: vocab.id, 
            content: formatSentence(sentence), 
            audio_url: sentenceAudio.trim() 
          })
        });

        if (!sentenceRes.ok) {
          const error = await sentenceRes.json();
          throw new Error(error.message || 'Lỗi khi thêm câu ví dụ');
        }
      }

      setSuccess('Đã thêm thành công!');
      // Reset form
      setWord('');
      setMeaning('');
      setSelectedTopic('');
      setImageUrl('');
      setAudioUrl('');
      setSentence('');
      setSentenceAudio('');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const inputStyle = {
    width: '100%',
    marginBottom: 12,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 15,
    transition: 'all 0.2s',
    outline: 'none',
    '&:focus': {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 3px #93c5fd44'
    }
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px top 50%',
    backgroundSize: '12px auto',
    paddingRight: '30px'
  };

  if (user?.role !== 'teacher') {
    return <div style={{textAlign:'center',marginTop:60,fontSize:22,color:'#ef4444',fontWeight:700}}>Chức năng này chỉ dành cho giáo viên.</div>;
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0002', padding: 32 }}>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 18, color:'#2563eb', letterSpacing:1 }}>Tạo bộ từ/câu mới</h2>
      <form onSubmit={handleSubmit}>
        <input 
          value={word}
          onChange={e => setWord(formatWord(e.target.value))}
          placeholder="Từ mới"
          required
          style={inputStyle}
        />
        <textarea 
          value={meaning}
          onChange={e => setMeaning(e.target.value)}
          placeholder="Nghĩa (mỗi nghĩa cách nhau bằng dấu phẩy)"
          required
          style={{...inputStyle, minHeight: 80, resize: 'vertical'}}
        />
        
        {isLoadingTopics ? (
          <div style={{...inputStyle, background: '#f1f5f9', color: '#64748b'}}>
            Đang tải danh sách chủ đề...
          </div>
        ) : (
          <div style={{ marginBottom: 18 }}>
            <select value={selectedTopic} onChange={handleTopicChange} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #cbd5e1', fontSize: 17, background:'#f1f5f9', fontWeight:600 }}>
              <option value="">Chọn chủ đề</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        )}

        {user?.role === 'teacher' && (
          <button type="button" onClick={()=>setShowNewTopicModal(true)} style={{ display:'block', width:'100%', margin:'-10px 0 18px 0', background:'linear-gradient(90deg,#2563eb,#22c55e)', color:'#fff', border:'none', borderRadius:10, padding:'10px 0', fontWeight:700, fontSize:16, boxShadow:'0 2px 8px #2563eb22', cursor:'pointer', letterSpacing:1, transition:'background 0.2s' }}>+ Chủ đề mới</button>
        )}

        <input 
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value.trim())}
          placeholder="Link hình (nếu có)"
          style={inputStyle}
        />
        <input 
          value={audioUrl}
          onChange={e => setAudioUrl(e.target.value.trim())}
          placeholder="Link audio (nếu có)"
          style={inputStyle}
        />
        <textarea
          value={sentence}
          onChange={e => setSentence(formatSentence(e.target.value))}
          placeholder="Câu ví dụ (nếu có)"
          style={{...inputStyle, minHeight: 80, resize: 'vertical'}}
        />
        <input 
          value={sentenceAudio}
          onChange={e => setSentenceAudio(e.target.value.trim())}
          placeholder="Audio câu ví dụ (nếu có)"
          style={inputStyle}
        />
        <button 
          type="submit" 
          style={{
            width: '100%',
            background: '#2563eb',
            color: '#fff',
            padding: 12,
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 18,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              background: '#1d4ed8'
            }
          }}
        >
          Thêm
        </button>
      </form>
      {error && (
        <div style={{
          color: '#ef4444',
          marginTop: 16,
          fontWeight: 500,
          padding: '12px',
          background: '#fef2f2',
          borderRadius: 8,
          border: '1px solid #fee2e2'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          color: '#22c55e',
          marginTop: 16,
          fontWeight: 500,
          padding: '12px',
          background: '#f0fdf4',
          borderRadius: 8,
          border: '1px solid #dcfce7'
        }}>
          {success}
        </div>
      )}

      {/* Modal tạo chủ đề mới */}
      {showNewTopicModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px #2563eb22', padding: 32, minWidth: 320, maxWidth: 380, width: '100%', position: 'relative', animation: 'popIn 0.5s' }}>
            <h3 style={{ color: '#2563eb', fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Tạo chủ đề mới</h3>
            <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Tên chủ đề" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #cbd5e1', marginBottom: 12, fontSize: 16 }} maxLength={50} />
            <textarea value={newTopicDesc} onChange={e => setNewTopicDesc(e.target.value)} placeholder="Mô tả chủ đề (tuỳ chọn)" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #cbd5e1', marginBottom: 12, fontSize: 15, minHeight: 60 }} maxLength={200} />
            <div style={{ marginBottom: 12, display:'flex',alignItems:'center',gap:8 }}>
              <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} id="isPublic" style={{width:18,height:18}} />
              <label htmlFor="isPublic" style={{fontWeight:600,fontSize:16,color:'#2563eb',cursor:'pointer'}}>Công khai/Public</label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={handleCreateTopic} disabled={!newTopicName.trim()} style={{ background: newTopicName.trim() ? 'linear-gradient(90deg,#2563eb,#22c55e)' : '#cbd5e1', color: '#fff', fontWeight: 700, padding: '10px 28px', borderRadius: 10, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #2563eb22', cursor: newTopicName.trim() ? 'pointer' : 'not-allowed', letterSpacing: 1 }}>Tạo</button>
              <button onClick={()=>{setShowNewTopicModal(false);setNewTopicName('');setNewTopicDesc('');}} style={{ background: '#f1f5f9', color: '#2563eb', fontWeight: 600, padding: '10px 18px', borderRadius: 10, border: 'none', fontSize: 16, boxShadow: '0 2px 8px #2563eb11', cursor: 'pointer' }}>Huỷ</button>
            </div>
            {success && <div style={{color:'#22c55e',marginTop:10,fontWeight:600}}>{success}</div>}
            {error && <div style={{color:'#ef4444',marginTop:10,fontWeight:600}}>{error}</div>}
            <style>{`@keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
          </div>
        </div>
      )}
    </div>
  );
} 
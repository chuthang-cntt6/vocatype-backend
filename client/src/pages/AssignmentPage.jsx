import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AssignmentPage() {
  const { user } = useContext(AuthContext);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [filterTopic, setFilterTopic] = useState('');

  const filteredAssignments = assignments.filter(a =>
    (filterTopic ? a.topic_id == filterTopic : true)
  );
  const paginatedAssignments = filteredAssignments.slice((page-1)*rowsPerPage, page*rowsPerPage);

  // Lọc assignment: chỉ lấy assignment mới nhất cho mỗi học sinh/chủ đề
  const uniqueAssignments = paginatedAssignments.reduce((acc, cur) => {
    const key = cur.student_id + '-' + cur.topic_id;
    if (!acc[key] || new Date(cur.deadline) > new Date(acc[key].deadline)) {
      acc[key] = cur;
    }
    return acc;
  }, {});
  const assignmentCards = Object.values(uniqueAssignments);

  useEffect(() => {
    if (user?.role !== 'teacher') return;
    // Load topics
    fetch('/api/topics')
      .then(r => r.json())
      .then(setTopics);
    // Load students
    fetch('/api/teacher/students', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
      .then(r => r.json())
      .then(setStudents);
    // Load assignments
    fetch('/api/teacher/assignments', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
      .then(r => r.json())
      .then(setAssignments);
    // Load stats
    fetch('/api/teacher/stats', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
      .then(r => r.json())
      .then(setStats);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') },
        body: JSON.stringify({ 
          student_id: selectedStudent, 
          topic_id: selectedTopic, 
          deadline: deadline 
        })
      });
      if (!res.ok) throw new Error('Không thể giao bài tập');
      toast.success('Đã giao bài tập thành công!', { autoClose: 2000 });
      setSuccess('Đã giao bài tập thành công!');
      setSelectedStudent(''); setSelectedTopic(''); setDeadline('');
      // Reload assignments
      fetch('/api/teacher/assignments', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
        .then(r => r.json())
        .then(setAssignments);
    } catch (err) {
      toast.error('Không thể giao bài tập!', { autoClose: 2500 });
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Bạn có chắc muốn xoá bài tập này?')) return;
    await fetch(`/api/teacher/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
    });
    // Reload assignments
    fetch('/api/teacher/assignments', { headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') } })
      .then(r => r.json())
      .then(setAssignments);
  };

  if (user?.role !== 'teacher') {
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
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Không có quyền truy cập</h2>
          <p style={{ color: '#64748b' }}>Chỉ giáo viên mới có thể truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '32px', 
          color: '#1e293b',
          fontSize: '2.5rem',
          fontWeight: '800'
        }}>
          📚 Quản lý bài tập
        </h1>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{stats.totalAssignments}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Tổng bài tập</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{stats.totalStudents}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Học sinh</p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{stats.completedAssignments}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Đã hoàn thành</p>
            </div>
          </div>
        )}

        {/* Create Assignment Form */}
        <div style={{
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px',
          border: '2px solid #e2e8f0'
        }}>
          <h2 style={{ marginTop: 0, color: '#374151', marginBottom: '20px' }}>Giao bài tập mới</h2>
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Chọn học sinh:
                </label>
                <select
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">-- Chọn học sinh --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Chọn chủ đề:
                </label>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Hạn nộp:
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Giao bài tập
            </button>
          </form>
          {success && <p style={{ color: '#10b981', marginTop: '12px' }}>{success}</p>}
          {error && <p style={{ color: '#ef4444', marginTop: '12px' }}>{error}</p>}
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '20px' }}>
          <select
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Assignments List */}
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {assignmentCards.map(assignment => (
            <div key={assignment.id} style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
                    {assignment.student_name} - {assignment.topic_name}
                  </h3>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>
                    Hạn nộp: {new Date(assignment.deadline).toLocaleString('vi-VN')}
                  </p>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    Trạng thái: {assignment.completed ? '✅ Đã hoàn thành' : '⏳ Chưa hoàn thành'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredAssignments.length > rowsPerPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px',
            gap: '8px'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                border: '2px solid #d1d5db',
                background: 'white',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1
              }}
            >
              Trước
            </button>
            <span style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px'
            }}>
              {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * rowsPerPage >= filteredAssignments.length}
              style={{
                padding: '8px 16px',
                border: '2px solid #d1d5db',
                background: 'white',
                borderRadius: '6px',
                cursor: page * rowsPerPage >= filteredAssignments.length ? 'not-allowed' : 'pointer',
                opacity: page * rowsPerPage >= filteredAssignments.length ? 0.5 : 1
              }}
            >
              Sau
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
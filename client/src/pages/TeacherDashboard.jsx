import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateTestModal from '../components/CreateTestModal';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Grid,
  Chip,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [myTests, setMyTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [viewExpanded, setViewExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/');
      return;
    }
    fetchMyTests();
  }, [user, navigate]);

  const fetchMyTests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      
      // Fetch all tests (approved, pending, rejected) created by this teacher
      const res = await fetch('/api/question-bank/my-tests', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        console.log('✅ My tests data:', data);
        setMyTests(Array.isArray(data) ? data : []);
      } else {
        console.log('❌ API /my-tests failed, using fallback');
        // Fallback to old method if new endpoint doesn't exist
        const fallbackRes = await fetch('/api/question-bank', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          // Filter by creator_id on client side
          const myData = Array.isArray(data) ? data.filter(t => t.creator_id === user.id) : [];
          setMyTests(myData);
        }
      }
    } catch (err) {
      setError('Không thể tải danh sách đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (testData) => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch('/api/question-bank', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || 'Đã gửi đề thi để admin duyệt!');
        setModalOpen(false);
        fetchMyTests();
      } else {
        const error = await res.json();
        setError(error.error || 'Không thể tạo đề thi');
      }
    } catch (err) {
      setError('Lỗi: ' + err.message);
    }
  };

  const fetchTestDetails = async (testId) => {
    try {
      const res = await fetch(`/api/question-bank/${testId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Group questions by passage_id
        if (data.passages && data.questions) {
          data.passages = data.passages.map(passage => {
            const passageQuestions = data.questions.filter(q => q.passage_id === passage.id);
            return { ...passage, questions: passageQuestions };
          });
        }
        
        setTestDetails(data);
      } else {
        setError('Không thể tải chi tiết đề thi');
      }
    } catch (err) {
      setError('Lỗi: ' + err.message);
    }
  };

  const handleViewTest = (test) => {
    setSelectedTest(test);
    setViewModal(true);
  };

  const getStatusChip = (status) => {
    if (status === 'approved') {
      return <Chip icon={<CheckCircleIcon />} label="Đã duyệt" color="success" size="small" />;
    } else if (status === 'rejected') {
      return <Chip icon={<CancelIcon />} label="Bị từ chối" color="error" size="small" />;
    } else {
      return <Chip icon={<PendingIcon />} label="Chờ duyệt" color="warning" size="small" />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tests Grid */}
      {loading ? (
        <Typography>Đang tải...</Typography>
      ) : myTests.length === 0 ? (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center',
          border: '2px dashed #d1d5db',
          background: '#f9fafb'
        }}>
          <QuizIcon sx={{ fontSize: 80, color: '#9ca3af', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
            Chưa có đề thi nào
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Tạo đề thi đầu tiên của bạn ngay bây giờ!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 700
            }}
          >
            Tạo đề thi mới
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: { xs: 'none', md: 'block' },
              overflow: 'hidden'
            }}
          >
            {/* Header inside table */}
            <Box sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Quản lý đề thi
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tạo và quản lý các bộ đề thi của bạn
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Tạo đề thi mới
              </Button>
            </Box>

            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f8fafc' }}>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QuizIcon />
                      Tên đề thi
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="center">Trạng thái</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="center">Số câu</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="center">Độ khó</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="center">Thời gian</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="center">Ngày tạo</TableCell>
                  <TableCell sx={{ color: '#475569', fontWeight: 700 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myTests.map((test) => (
                  <TableRow 
                    key={test.id}
                    sx={{ 
                      '&:hover': { background: '#f8fafc' },
                      transition: 'background 0.2s'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 40, 
                          borderRadius: 1, 
                          background: 'linear-gradient(135deg, #667eea, #764ba2)' 
                        }} />
                        <Box sx={{ maxWidth: 300 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {test.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {test.description || 'Không có mô tả'}
                          </Typography>
                          {test.status === 'rejected' && test.rejection_reason && (
                            <Typography variant="caption" sx={{ color: '#dc2626', display: 'block', mt: 0.5 }}>
                              ❌ {test.rejection_reason}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(test.status)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${test.total_questions || 0} câu`} 
                        size="small"
                        sx={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={test.difficulty_level === 'easy' ? 'Dễ' : test.difficulty_level === 'hard' ? 'Khó' : 'Trung bình'}
                        size="small"
                        color={test.difficulty_level === 'easy' ? 'success' : test.difficulty_level === 'hard' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{test.time_limit || 60} phút</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {new Date(test.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewTest(test)}
                          sx={{ color: '#3b82f6' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {/* Mobile Header */}
            <Card sx={{ 
              mb: 2,
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff'
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
                  Quản lý đề thi
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Tạo và quản lý các bộ đề thi của bạn
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                fullWidth
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Tạo đề thi mới
              </Button>
            </Card>

            {myTests.map((test) => (
              <Card 
                key={test.id} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderLeftColor: test.status === 'approved' ? '#22c55e' : test.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', flex: 1, pr: 1 }}>
                      {test.title}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={() => handleViewTest(test)}
                      sx={{ color: '#3b82f6', flexShrink: 0 }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {test.description && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                      {test.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {getStatusChip(test.status)}
                    <Chip 
                      label={`${test.total_questions || 0} câu`} 
                      size="small"
                      sx={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                    />
                    <Chip 
                      label={test.difficulty_level === 'easy' ? 'Dễ' : test.difficulty_level === 'hard' ? 'Khó' : 'Trung bình'}
                      size="small"
                      color={test.difficulty_level === 'easy' ? 'success' : test.difficulty_level === 'hard' ? 'error' : 'warning'}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      ⏱️ {test.time_limit || 60} phút
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      📅 {new Date(test.created_at).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>

                  {test.status === 'rejected' && test.rejection_reason && (
                    <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
                      <Typography variant="caption">
                        {test.rejection_reason}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Create Test Modal */}
      <CreateTestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTest}
      />

      {/* View Test Details Modal */}
      <Dialog
        open={viewModal}
        onClose={() => {
          setViewModal(false);
          setViewExpanded(false);
          setSelectedTest(null);
          setTestDetails(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <QuizIcon />
          Chi tiết đề thi
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          {selectedTest && (
            <Box>
              {/* Test Info */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedTest.title}
              </Typography>
              {selectedTest.description && (
                <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                  {selectedTest.description}
                </Typography>
              )}

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Trạng thái:</Typography>
                  {getStatusChip(selectedTest.status)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Độ khó:</Typography>
                  <Chip 
                    label={selectedTest.difficulty_level === 'easy' ? 'Dễ' : selectedTest.difficulty_level === 'hard' ? 'Khó' : 'Trung bình'}
                    color={selectedTest.difficulty_level === 'easy' ? 'success' : selectedTest.difficulty_level === 'hard' ? 'error' : 'warning'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Thời gian:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedTest.time_limit || 60} phút
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Tổng câu hỏi:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedTest.total_questions || 0} câu
                  </Typography>
                </Grid>
                {selectedTest.status === 'rejected' && selectedTest.rejection_reason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Lý do từ chối:</Typography>
                      <Typography variant="body2">{selectedTest.rejection_reason}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>

              {/* Expanded View - Passages & Questions */}
              {viewExpanded && testDetails && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Passages */}
                  {testDetails.passages && testDetails.passages.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        📖 Đoạn văn
                      </Typography>
                      {testDetails.passages.map((passage, idx) => (
                        <Card key={passage.id} sx={{ p: 3, mb: 2, background: 'rgba(139, 92, 246, 0.03)' }}>
                          <Chip label={`Part ${passage.part_id}`} size="small" color="secondary" sx={{ mb: 2 }} />
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                            {passage.passage_text}
                          </Typography>
                        </Card>
                      ))}
                    </Box>
                  )}
                  
                  {/* Questions */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    📝 Danh sách câu hỏi
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Hiển thị {testDetails.questions?.length || 0} câu hỏi trong bộ đề này
                    </Typography>
                  </Alert>
                  
                  {/* Real Questions Display */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {testDetails.questions && testDetails.questions.map((q, idx) => (
                      <Card key={q.id} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip label={`Câu ${q.question_number || idx + 1}`} size="small" color="primary" sx={{ mr: 1 }} />
                          {q.part_id && (
                            <Chip label={`Part ${q.part_id}`} size="small" variant="outlined" />
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {q.question_text}
                        </Typography>
                        {q.options && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
                            {Array.isArray(q.options) ? (
                              // Options là mảng [text1, text2, text3, text4]
                              q.options.map((opt, optIdx) => {
                                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                                const isCorrect = q.correct_answer === letter;
                                return (
                                  <Typography 
                                    key={optIdx} 
                                    variant="body2"
                                    sx={{ 
                                      color: isCorrect ? 'success.main' : 'inherit',
                                      fontWeight: isCorrect ? 600 : 400
                                    }}
                                  >
                                    {letter}. {opt} {isCorrect && '✓ (Đáp án đúng)'}
                                  </Typography>
                                );
                              })
                            ) : (
                              // Options là object {A: text1, B: text2, C: text3, D: text4}
                              Object.entries(q.options).map(([letter, text]) => {
                                const isCorrect = q.correct_answer === letter;
                                return (
                                  <Typography 
                                    key={letter} 
                                    variant="body2"
                                    sx={{ 
                                      color: isCorrect ? 'success.main' : 'inherit',
                                      fontWeight: isCorrect ? 600 : 400
                                    }}
                                  >
                                    {letter}. {text} {isCorrect && '✓ (Đáp án đúng)'}
                                  </Typography>
                                );
                              })
                            )}
                          </Box>
                        )}
                        {/* Additional Info */}
                        {q.answer_location && (
                          <Box sx={{ mt: 2, p: 1.5, background: '#fef3c7', borderRadius: 1, borderLeft: '3px solid #f59e0b' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#92400e', display: 'block', mb: 0.5 }}>
                              📍 Trích đoạn chứa đáp án:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#78350f', fontStyle: 'italic' }}>
                              "{q.answer_location}"
                            </Typography>
                          </Box>
                        )}
                        {q.keywords && (
                          <Box sx={{ mt: 1.5, p: 1.5, background: '#dbeafe', borderRadius: 1, borderLeft: '3px solid #3b82f6' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e40af', display: 'block', mb: 0.5 }}>
                              🔑 Từ khóa quan trọng:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#1e3a8a' }}>
                              {q.keywords}
                            </Typography>
                          </Box>
                        )}
                        {q.explanation && (
                          <Box sx={{ mt: 1.5, p: 1.5, background: '#dcfce7', borderRadius: 1, borderLeft: '3px solid #22c55e' }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534', display: 'block', mb: 0.5 }}>
                              💡 Giải thích chi tiết:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#14532d' }}>
                              {q.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setViewModal(false);
              setViewExpanded(false);
              setSelectedTest(null);
              setTestDetails(null);
            }}
            variant="outlined"
          >
            Đóng
          </Button>
          {!viewExpanded && (
            <Button 
              onClick={async () => {
                setLoadingDetails(true);
                await fetchTestDetails(selectedTest.id);
                setViewExpanded(true);
                setLoadingDetails(false);
              }}
              variant="contained"
              startIcon={<VisibilityIcon />}
              disabled={loadingDetails}
            >
              {loadingDetails ? 'Đang tải...' : 'Xem đầy đủ'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

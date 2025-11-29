import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Drawer,
  Fade,
  Slide,
  Zoom,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import Pagination from '@mui/material/Pagination';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import MenuIcon from '@mui/icons-material/Menu';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import AdminSidebar from '../components/AdminSidebar';
import './Admin.css';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }} className="fade-in">{children}</Box>}
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, icon, color, subtitle, trend, loading = false }) {
  return (
    <Zoom in={true} timeout={800}>
    <Card sx={{ 
      height: '100%',
        background: `linear-gradient(135deg, ${color}12, ${color}08)`,
        border: `1px solid ${color}25`,
        borderRadius: 4,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
        },
      '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${color}20`,
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(5deg)'
          }
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ 
                fontSize: '0.8rem', 
                fontWeight: 600,
                fontFamily: "'Poppins', 'Inter', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
              {title}
            </Typography>
              <Typography variant="h3" component="div" sx={{ 
                fontWeight: 800, 
                fontFamily: "'Poppins', 'Inter', sans-serif",
                color: color,
                lineHeight: 1,
                mb: 1
              }}>
                {loading ? '...' : value}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="textSecondary" sx={{ 
                  mt: 1,
                  opacity: 0.8,
                  fontSize: '0.85rem',
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 500
                }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
              p: 2.5, 
              borderRadius: 3, 
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              className: 'stat-icon'
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <TrendingUpIcon sx={{ color: '#22c55e', fontSize: 16, mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600, fontSize: '0.8rem' }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
    </Zoom>
  );
}

export default function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topics, setTopics] = useState([]);
  const [banks, setBanks] = useState([]);
  const [rejectedBanks, setRejectedBanks] = useState([]);
  const [pendingTests, setPendingTests] = useState([]);
  const [bankTab, setBankTab] = useState(0); // 0: Đã duyệt, 1: Từ chối, 2: Đang chờ
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [viewBankModal, setViewBankModal] = useState(false);
  const [viewBankExpanded, setViewBankExpanded] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [createBankModal, setCreateBankModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newBankForm, setNewBankForm] = useState({
    title: '',
    description: '',
    total_questions: 10,
    time_limit: 60,
    difficulty_level: 'medium'
  });
  const [passages, setPassages] = useState([
    { part_id: 1, passage_text: '' }
  ]);
  const [questions, setQuestions] = useState([
    { 
      passage_index: 0, 
      question_number: 1, 
      question_text: '', 
      options: { A: '', B: '', C: '', D: '' }, 
      correct_answer: 'A' 
    }
  ]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [testToReject, setTestToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [users, setUsers] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [userSort, setUserSort] = useState('name');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Statistics data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    totalAssignments: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Bật lại kiểm tra quyền admin
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  const resetCreateBankForm = () => {
    setActiveStep(0);
    setNewBankForm({
      title: '',
      description: '',
      total_questions: 10,
      time_limit: 60,
      difficulty_level: 'medium'
    });
    setPassages([{ part_id: 1, passage_text: '' }]);
    setQuestions([{ 
      passage_index: 0, 
      question_number: 1, 
      question_text: '', 
      options: { A: '', B: '', C: '', D: '' }, 
      correct_answer: 'A' 
    }]);
  };

  const fetchAllData = async () => {
      try {
        setLoading(true);
      setError('');
      const token = localStorage.getItem('token') || '';
        const [topicsRes, banksRes, usersRes, summaryRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/question-bank'),
        fetch('/api/admin/users?limit=200', { headers: { Authorization: 'Bearer ' + token } }),
        fetch('/api/admin/summary', { headers: { Authorization: 'Bearer ' + token } })
      ]);

      // Topics
      let topicsJson = [];
      if (topicsRes.ok) {
        const t = await topicsRes.json();
        topicsJson = Array.isArray(t) ? t : (t.topics || []);
      } else if (topicsRes.status === 401) {
        throw new Error('Bạn không có quyền truy cập danh sách chủ đề (401)');
      } else if (topicsRes.status !== 404) {
        throw new Error('Không tải được chủ đề (' + topicsRes.status + ')');
      }

      // Banks - only show approved tests
      let banksJson = [];
      if (banksRes.ok) {
        const b = await banksRes.json();
        console.log('📦 Raw banks data:', b);
        // API returns { results: [...], count: ... }
        let allBanks = Array.isArray(b) ? b : (b.results || b.banks || []);
        console.log('📦 All banks array:', allBanks);
        // Ensure allBanks is an array
        if (!Array.isArray(allBanks)) {
          allBanks = [];
        }
        // Filter by status
        banksJson = allBanks.filter(bank => bank.status === 'approved');
        const rejectedJson = allBanks.filter(bank => bank.status === 'rejected');
        const pendingJson = allBanks.filter(bank => bank.status === 'pending');
        console.log('✅ Approved banks:', banksJson);
        console.log('❌ Rejected banks:', rejectedJson);
        console.log('⏳ Pending banks:', pendingJson);
        console.log('🔍 All statuses:', allBanks.map(b => ({ id: b.id, title: b.title, status: b.status })));
        setRejectedBanks(rejectedJson);
        setPendingTests(pendingJson);
      } else if (banksRes.status === 401) {
        throw new Error('Bạn không có quyền truy cập ngân hàng đề (401)');
      } else if (banksRes.status === 404) {
        banksJson = []; // nếu API chưa có, để mảng rỗng
      } else {
        throw new Error('Không tải được ngân hàng đề (' + banksRes.status + ')');
      }

      // Users (admin protected)
      let usersJson = [];
      if (usersRes.ok) {
        const uj = await usersRes.json();
        usersJson = Array.isArray(uj.items) ? uj.items : (Array.isArray(uj) ? uj : []);
      } else if (usersRes.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (usersRes.status === 403) {
        throw new Error('Bạn không có quyền truy cập tài nguyên này.');
      } else {
        throw new Error('Không tải được danh sách người dùng (' + usersRes.status + ')');
      }

      setTopics(topicsJson);
      setBanks(banksJson);
      // pendingTests đã được set ở trên (dòng 333)
        setUsers(Array.isArray(usersJson) ? usersJson : []);

      if (summaryRes.ok) {
        const s = await summaryRes.json();
        setStats({
          totalUsers: s.totalUsers,
          totalTopics: s.totalTopics,
          totalAssignments: s.totalBanks || 0,
          activeUsers: s.activeUsers
        });
      } else {
        setStats({
          totalUsers: (Array.isArray(usersJson) ? usersJson.length : 0),
          totalTopics: (Array.isArray(topicsJson) ? topicsJson.length : 0),
          totalAssignments: 0,
          activeUsers: (Array.isArray(usersJson) ? usersJson.filter(u => u.role === 'learner').length : 0)
        });
      }
      } catch (e) {
      setError(e.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    };

  // Approve test
  const handleApproveTest = async (testId) => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/question-bank/${testId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        // Hiển thị success message
        setSuccessMessage('✅ Đã duyệt đề thi thành công!');
        
        // Cập nhật state local thay vì fetch lại toàn bộ
        setPendingTests(prev => prev.filter(t => t.id !== testId));
        setBanks(prev => {
          const approvedTest = pendingTests.find(t => t.id === testId);
          if (approvedTest) {
            return [...prev, { ...approvedTest, status: 'approved' }];
          }
          return prev;
        });
      } else {
        const error = await res.json();
        setError(error.error || 'Không thể duyệt đề thi');
      }
    } catch (err) {
      setError('Lỗi: ' + err.message);
    }
  };

  // Fetch bank details with passages and questions
  const fetchBankDetails = async (bankId) => {
    try {
      const res = await fetch(`/api/question-bank/${bankId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Bank details:', data);
        console.log('📝 Questions:', data.questions);
        console.log('📖 Passages:', data.passages);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching bank details:', err);
      return null;
    }
  };

  // Reject test - Open modal
  const handleRejectTest = (testId) => {
    setTestToReject(testId);
    setRejectionReason('');
    setRejectModal(true);
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/question-bank/${testToReject}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (res.ok) {
        // Đóng modal ngay lập tức
        setRejectModal(false);
        setTestToReject(null);
        setRejectionReason('');
        
        // Hiển thị success message
        setSuccessMessage('✅ Đã từ chối đề thi');
        
        // Cập nhật state local thay vì fetch lại toàn bộ
        setPendingTests(prev => prev.filter(t => t.id !== testToReject));
        setRejectedBanks(prev => {
          const rejectedTest = pendingTests.find(t => t.id === testToReject);
          if (rejectedTest) {
            return [...prev, { ...rejectedTest, status: 'rejected', rejection_reason: rejectionReason }];
          }
          return prev;
        });
      } else {
        const error = await res.json();
        setError(error.error || 'Không thể từ chối đề thi');
      }
    } catch (err) {
      setError('Lỗi: ' + err.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    // Auto scroll to top on section change for mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      paddingBottom: { xs: '100px', sm: 0 }, // Thêm padding bottom cho mobile
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0.05,
        zIndex: 0
      }
    }}>
      {/* Main content wrapper with sidebar */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Sidebar riêng cho Admin */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, p: 2, position: 'relative', zIndex: 1 }}>
          <AdminSidebar currentTab={currentTab} onTabChange={handleTabChange} user={user} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(prev => !prev)} />
        </Box>

        {/* Nội dung chính */}
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4, flex: 1, position: 'relative', zIndex: 1 }}>
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert 
            severity="success" 
            onClose={() => setSuccessMessage('')}
            sx={{ mb: 3, fontWeight: 600 }}
          >
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{ mb: 3, fontWeight: 600 }}
          >
            {error}
          </Alert>
        )}

      {/* Enhanced Header */}
      <Fade in={true} timeout={1000}>
        <Paper elevation={0} sx={{ 
          mb: 4, 
          p: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea, #764ba2)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={() => setMobileOpen(true)} 
                sx={{ 
                  display: { xs: 'inline-flex', md: 'none' },
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
                    transform: 'scale(1.05)'
                  }
                }} 
                aria-label="open admin menu"
              >
                <MenuIcon />
              </IconButton>
              
              {/* Logo */}
              <Box sx={{ 
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                <Typography sx={{ fontSize: 32, fontWeight: 900, color: 'white' }}>
                  V
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="h3" component="h1" sx={{ 
                  fontWeight: 800, 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  fontSize: { xs: '1.5rem', md: '2.2rem' }
                }}>
                  Bảng điều khiển quản trị
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ 
                  opacity: 0.8,
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}>
                  Quản lý toàn bộ hệ thống VocaType
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton 
                  onClick={fetchAllData}
                  sx={{ 
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    '&:hover': {
                      background: 'rgba(34, 197, 94, 0.2)',
                      transform: 'rotate(180deg)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Hệ thống hoạt động bình thường" 
                color="success" 
                variant="outlined"
                sx={{ fontWeight: 600, display: { xs: 'none', md: 'flex' } }}
              />
              
              {/* Admin Avatar */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                ml: 2,
                pl: 2,
                borderLeft: '2px solid rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {user?.name || 'Admin'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Quản trị viên
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    width: 48, 
                    height: 48,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    fontWeight: 700,
                    fontSize: 20,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Thông báo lỗi nếu có */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Enhanced Statistics Cards */}
      <Slide direction="up" in={true} timeout={1200}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng người dùng"
            value={stats.totalUsers}
              icon={<PeopleIcon sx={{ color: '#3b82f6', fontSize: 36 }} />}
            color="#3b82f6"
            subtitle="Tất cả tài khoản"
            trend="+12% so với tháng trước"
              loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chủ đề học tập"
            value={stats.totalTopics}
              icon={<BookIcon sx={{ color: '#22c55e', fontSize: 36 }} />}
            color="#22c55e"
            subtitle="Topics có sẵn"
            trend="+3 mới tuần này"
              loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Học viên hoạt động"
            value={stats.activeUsers}
              icon={<SchoolIcon sx={{ color: '#8b5cf6', fontSize: 36 }} />}
            color="#8b5cf6"
            subtitle="Đang học tập"
            trend="+8% tuần này"
              loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bài tập"
            value={stats.totalAssignments}
              icon={<AssignmentIcon sx={{ color: '#f59e0b', fontSize: 36 }} />}
            color="#f59e0b"
            subtitle="Đã giao"
            trend="+15% tháng này"
              loading={loading}
          />
        </Grid>
      </Grid>
      </Slide>

      {/* Enhanced Main Content */}
      <Fade in={true} timeout={1500}>
        <Card sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>

        {/* Enhanced Dashboard Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Zoom in={currentTab === 0} timeout={800}>
                <Card sx={{ 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <NotificationsIcon sx={{ color: '#3b82f6', mr: 2, fontSize: 28 }} />
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: '#1e293b',
                        fontFamily: "'Poppins', 'Inter', sans-serif"
                      }}>
                    Hoạt động gần đây
                  </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 3,
                        background: 'rgba(34, 197, 94, 0.05)',
                        border: '1px solid rgba(34, 197, 94, 0.1)'
                      }}>
                        <CheckCircleIcon sx={{ color: '#22c55e', mr: 2 }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>
                          Người dùng mới đăng ký
                    </Typography>
                        <Chip label="5 phút trước" size="small" sx={{ ml: 'auto' }} />
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 3,
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}>
                        <InfoIcon sx={{ color: '#3b82f6', mr: 2 }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>
                          Chủ đề mới được tạo
                    </Typography>
                        <Chip label="1 giờ trước" size="small" sx={{ ml: 'auto' }} />
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 2, 
                        borderRadius: 3,
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.1)'
                      }}>
                        <AssignmentIcon sx={{ color: '#f59e0b', mr: 2 }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>
                          Bài tập được giao
                    </Typography>
                        <Chip label="2 giờ trước" size="small" sx={{ ml: 'auto' }} />
                  </Box>
                    </Stack>
                </CardContent>
              </Card>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={4}>
              <Zoom in={currentTab === 0} timeout={1000}>
                <Card sx={{ 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SpeedIcon sx={{ color: '#22c55e', mr: 2, fontSize: 28 }} />
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: '#1e293b',
                        fontFamily: "'Poppins', 'Inter', sans-serif"
                      }}>
                    Thống kê nhanh
                  </Typography>
                    </Box>
                    <Stack spacing={3}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(59, 130, 246, 0.05)'
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                        fontWeight: 500,
                        fontFamily: "'Poppins', 'Inter', sans-serif"
                      }}>Học viên online</Typography>
                        <Badge badgeContent="24" color="success">
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: "#3b82f6",
                            fontFamily: "'Poppins', 'Inter', sans-serif"
                          }}>24</Typography>
                        </Badge>
                    </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(245, 158, 11, 0.05)'
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>Bài tập hôm nay</Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: "#f59e0b",
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>12</Typography>
                    </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(139, 92, 246, 0.05)'
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>Từ vựng mới</Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: "#8b5cf6",
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>156</Typography>
                    </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(34, 197, 94, 0.05)'
                      }}>
                        <Typography variant="body2" color="textSecondary" sx={{ 
                          fontWeight: 500,
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>Tỷ lệ hoàn thành</Typography>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: "#22c55e",
                          fontFamily: "'Poppins', 'Inter', sans-serif"
                        }}>87%</Typography>
                  </Box>
                    </Stack>
                </CardContent>
              </Card>
              </Zoom>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mr: 'auto',
              fontFamily: "'Poppins', 'Inter', sans-serif"
            }}>Quản lý người dùng</Typography>
            <TextField 
              size="small"
              placeholder="Tìm kiếm người dùng..."
              value={userQuery}
              onChange={(e)=> setUserQuery(e.target.value)}
              InputProps={{ startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              )}}
            />
            <Select size="small" value={userRoleFilter} onChange={(e)=> { setUserRoleFilter(e.target.value); setUserPage(1); }}>
              <MenuItem value="all">Tất cả vai trò</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="learner">Learner</MenuItem>
            </Select>
            <Select size="small" value={userSort} onChange={(e)=> setUserSort(e.target.value)}>
              <MenuItem value="name">Tên</MenuItem>
              <MenuItem value="role">Vai trò</MenuItem>
            </Select>
          </Box>

          {(() => {
            const filtered = users
              .filter(u => !userQuery || (u.name||'').toLowerCase().includes(userQuery.toLowerCase()) || (u.email||'').toLowerCase().includes(userQuery.toLowerCase()))
              .filter(u => userRoleFilter==='all' ? true : String(u.role||'').toLowerCase()===userRoleFilter);
            const sorted = [...filtered].sort((a,b)=> userSort==='role' ? String(a.role||'').localeCompare(String(b.role||'')) : String(a.name||'').localeCompare(String(b.name||'')));
            const totalPages = Math.max(1, Math.ceil(sorted.length / userPageSize));
            const currentPage = Math.min(userPage, totalPages);
            const start = (currentPage - 1) * userPageSize;
            const pageItems = sorted.slice(start, start + userPageSize);
            return (
              <>
                <Box sx={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(280px, 1fr))' },
                    gap: { xs: 2.5, sm: 3, md: 4 }
                  }}>
                    {pageItems.map((user) => (
                      <Card key={user.id} sx={{ 
                        p: 3, 
                        // height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: 3,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        transition: 'transform .2s ease, box-shadow .2s ease',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }
                      }}>
                      <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    fontFamily: "'Poppins', 'Inter', sans-serif"
                  }}>{user.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={user.role || 'learner'} size="small" color={user.role==='admin' ? 'error' : user.role==='teacher' ? 'primary' : 'success'} />
                      </Box>
                      <CardActions sx={{ mt: 'auto', pt: 2 }}>
                        <Button size="small">Xem</Button>
                        <Button size="small" color="secondary">Sửa</Button>
                      </CardActions>
                      </Card>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Select size="small" value={userPageSize} onChange={(e)=> { setUserPageSize(Number(e.target.value)); setUserPage(1); }}>
                    <MenuItem value={6}>6 / trang</MenuItem>
                    <MenuItem value={12}>12 / trang</MenuItem>
                    <MenuItem value={24}>24 / trang</MenuItem>
                  </Select>
                  <Pagination color="primary" count={totalPages} page={currentPage} onChange={(e, p)=> setUserPage(p)} sx={{ ml: 'auto' }} />
                </Box>
              </>
            );
          })()}
        </TabPanel>

        {/* Content Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mr: 'auto',
              fontFamily: "'Poppins', 'Inter', sans-serif"
            }}>Quản lý nội dung học tập</Typography>
            <Button size="small" variant="contained">Tạo chủ đề</Button>
          </Box>
          <Grid container spacing={2}>
            {topics.map((topic) => (
              <Grid item xs={12} sm={6} md={4} key={topic.id}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    fontFamily: "'Poppins', 'Inter', sans-serif"
                  }}>{topic.name || topic.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Chủ đề học tập từ vựng
                  </Typography>
                  <CardActions sx={{ mt: 1 }}>
                    <Button size="small">Xem chi tiết</Button>
                    <Button size="small" color="secondary">Chỉnh sửa</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Enhanced Question Banks Tab */}
        <TabPanel value={currentTab} index={3}>
          <Fade in={currentTab === 3} timeout={800}>
            <Box>
              {/* Pending Tests Section */}
              {pendingTests.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
                    borderRadius: 4,
                    border: '2px solid rgba(251, 191, 36, 0.3)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
                      <WarningIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#92400e' }}>
                        Đề thi chờ duyệt
                      </Typography>
                      <Badge badgeContent={pendingTests.length} color="warning" sx={{ ml: 2 }}>
                        <Chip label={`${pendingTests.length} đề`} size="small" color="warning" variant="outlined" />
                      </Badge>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    {pendingTests.map((test, index) => (
                      <Grid item xs={12} md={6} key={test.id}>
                        <Zoom in={true} timeout={600 + index * 100}>
                          <Card sx={{ 
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,252,232,0.95) 100%)',
                            border: '2px solid rgba(251, 191, 36, 0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            },
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 32px rgba(245, 158, 11, 0.2)'
                            }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                              <QuizIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 32, mt: 0.5 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                                  {test.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                  {test.description || 'Không có mô tả'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                  <Chip 
                                    label={`Tạo bởi: ${test.creator_name || 'Unknown'}`} 
                                    size="small" 
                                    sx={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', fontWeight: 600 }}
                                  />
                                  <Chip 
                                    label={`${test.total_questions || 0} câu hỏi`} 
                                    size="small" 
                                    sx={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 600 }}
                                  />
                                  <Chip 
                                    label={new Date(test.created_at).toLocaleDateString('vi-VN')} 
                                    size="small" 
                                    sx={{ background: 'rgba(100, 116, 139, 0.1)', color: '#475569', fontWeight: 600 }}
                                  />
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                startIcon={<VisibilityIcon />}
                                onClick={() => {
                                  setSelectedBank(test);
                                  setViewBankModal(true);
                                }}
                                sx={{ 
                                  flex: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2,
                                    transform: 'scale(1.02)'
                                  }
                                }}
                              >
                                Xem
                              </Button>
                              <Button 
                                size="small" 
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApproveTest(test.id)}
                                sx={{ 
                                  flex: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                    transform: 'scale(1.02)'
                                  }
                                }}
                              >
                                Duyệt
                              </Button>
                              <Button 
                                size="small" 
                                variant="outlined"
                                color="error"
                                startIcon={<ErrorIcon />}
                                onClick={() => handleRejectTest(test.id)}
                                sx={{ 
                                  flex: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderWidth: 2,
                                  '&:hover': {
                                    borderWidth: 2,
                                    transform: 'scale(1.02)'
                                  }
                                }}
                              >
                                Từ chối
                              </Button>
                            </Box>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 4 }} />
                </Box>
              )}

              {/* Bank Tests Section with Tabs */}
              <Box sx={{ 
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QuizIcon sx={{ color: '#8b5cf6', mr: 2, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Ngân hàng đề thi
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => setCreateBankModal(true)}
                    sx={{ 
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    Tạo bộ đề
                  </Button>
                </Box>
                
                {/* Tabs */}
                <Tabs 
                  value={bankTab} 
                  onChange={(e, v) => setBankTab(v)}
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }
                  }}
                >
                  <Tab 
                    label={`Đã duyệt (${banks.length})`} 
                    icon={<CheckCircleIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label={`Từ chối (${rejectedBanks.length})`} 
                    icon={<ErrorIcon />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label={`Đang chờ (${pendingTests.length})`} 
                    icon={<WarningIcon />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              {/* Tab Content - Table View */}
              {bankTab === 0 && Array.isArray(banks) && banks.length > 0 ? (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <QuizIcon />
                            Tên đề thi
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Số câu</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Độ khó</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Thời gian</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Người tạo</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {banks.map((bank, index) => (
                        <TableRow 
                          key={bank.id}
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
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' 
                              }} />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                  {bank.title || bank.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Bộ câu hỏi kiểm tra
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${bank.total_questions || 0} câu`} 
                              size="small"
                              sx={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={bank.difficulty_level === 'easy' ? 'Dễ' : bank.difficulty_level === 'hard' ? 'Khó' : 'Trung bình'}
                              size="small"
                              color={bank.difficulty_level === 'easy' ? 'success' : bank.difficulty_level === 'hard' ? 'error' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{bank.time_limit || 60} phút</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {bank.creator_name || 'Admin'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                              <Tooltip title="Xem chi tiết">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setSelectedBank(bank);
                                    setViewBankModal(true);
                                  }}
                                  sx={{ color: '#3b82f6' }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa">
                                <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setBankToDelete(bank);
                                    setDeleteConfirmModal(true);
                                  }}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : bankTab === 0 ? (
                <Card sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  border: '2px dashed rgba(139, 92, 246, 0.3)'
                }}>
                  <QuizIcon sx={{ fontSize: 64, color: '#8b5cf6', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Chưa có bộ đề đã duyệt
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, opacity: 0.7 }}>
                    Các bộ đề đã được duyệt sẽ hiển thị ở đây
                  </Typography>
                </Card>
              ) : null}
                
                {/* Rejected Banks Tab */}
                <Grid container spacing={3}>
                {bankTab === 1 && Array.isArray(rejectedBanks) && rejectedBanks.length > 0 ? rejectedBanks.map((bank, index) => (
                  <Grid item xs={12} sm={6} md={4} key={bank.id}>
                    <Zoom in={true} timeout={600 + index * 100}>
                      <Card sx={{ 
                        p: 3,
                        height: '100%',
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #ef4444, #dc2626)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ErrorIcon sx={{ color: '#ef4444', mr: 2, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {bank.title || bank.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {bank.rejection_reason || 'Không có lý do'}
                        </Typography>
                        <CardActions sx={{ mt: 'auto', pt: 2, gap: 1 }}>
                          <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSelectedBank(bank);
                              setViewBankModal(true);
                            }}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            Xem
                          </Button>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                )) : bankTab === 1 && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '2px dashed rgba(239, 68, 68, 0.3)' }}>
                      <ErrorIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="textSecondary">Chưa có bộ đề bị từ chối</Typography>
                    </Card>
                  </Grid>
                )}
                
                {/* Pending Banks Tab */}
                {bankTab === 2 && Array.isArray(pendingTests) && pendingTests.length > 0 ? pendingTests.map((test, index) => (
                  <Grid item xs={12} sm={6} md={4} key={test.id}>
                    <Zoom in={true} timeout={600 + index * 100}>
                      <Card sx={{ 
                        p: 3,
                        height: '100%',
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <WarningIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {test.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {test.description || 'Không có mô tả'}
                        </Typography>
                        <Chip label={`Tạo bởi: ${test.creator_name}`} size="small" sx={{ mb: 2 }} />
                        <CardActions sx={{ mt: 'auto', pt: 2, gap: 1, flexDirection: 'column' }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              setSelectedBank(test);
                              setViewBankModal(true);
                            }}
                            fullWidth
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                          >
                            Xem chi tiết
                          </Button>
                          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            <Button 
                              size="small" 
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleApproveTest(test.id)}
                              sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                              Duyệt
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectTest(test.id)}
                              sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                              Từ chối
                            </Button>
                          </Box>
                        </CardActions>
                      </Card>
                    </Zoom>
                  </Grid>
                )) : bankTab === 2 && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '2px dashed rgba(245, 158, 11, 0.3)' }}>
                      <WarningIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="textSecondary">Không có bộ đề đang chờ duyệt</Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Fade>
        </TabPanel>

        {/* Enhanced Analytics Tab */}
        <TabPanel value={currentTab} index={4}>
          <Fade in={currentTab === 4} timeout={800}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
                  <AnalyticsIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Báo cáo và phân tích
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<BookIcon />}
                    label={`${stats.totalTopics} chủ đề`} 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip 
                    icon={<PeopleIcon />}
                    label={`${stats.totalUsers} người dùng`} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                  <Zoom in={currentTab === 4} timeout={1000}>
                    <Card sx={{ 
                      p: 4, 
                      height: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <TrendingUpIcon sx={{ color: '#3b82f6', mr: 2, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          Tăng trưởng người dùng
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, opacity: 0.8 }}>
                        Thống kê theo tháng (giả lập)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={[{m:'T1',u:12},{m:'T2',u:18},{m:'T3',u:25},{m:'T4',u:28},{m:'T5',u:34},{m:'T6',u:stats.totalUsers}]}> 
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis 
                            dataKey="m" 
                            stroke="#6b7280" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <RTooltip 
                            contentStyle={{ 
                              background: 'rgba(255,255,255,0.95)', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 8
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="u" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                          />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
                  </Zoom>
            </Grid>
            <Grid item xs={12} md={6}>
                  <Zoom in={currentTab === 4} timeout={1200}>
                    <Card sx={{ 
                      p: 4, 
                      height: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <PeopleIcon sx={{ color: '#22c55e', mr: 2, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Cơ cấu vai trò người dùng
                </Typography>
                      </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                          <Pie 
                            dataKey="value" 
                            data={[
                      { name: 'Học viên', value: stats.activeUsers },
                      { name: 'Giáo viên', value: users.filter(u=>u.role==='teacher').length },
                      { name: 'Khác', value: Math.max(0, stats.totalUsers - stats.activeUsers - users.filter(u=>u.role==='teacher').length) }
                            ]} 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={80} 
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                      <Cell fill="#22c55e" />
                      <Cell fill="#3b82f6" />
                            <Cell fill="#8b5cf6" />
                    </Pie>
                    <Legend />
                          <RTooltip 
                            contentStyle={{ 
                              background: 'rgba(255,255,255,0.95)', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 8
                            }} 
                          />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
                  </Zoom>
            </Grid>
            <Grid item xs={12}>
                  <Zoom in={currentTab === 4} timeout={1400}>
                    <Card sx={{ 
                      p: 4, 
                      height: 400,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <StorageIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Nội dung hệ thống
                </Typography>
                      </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: 'Chủ đề', value: stats.totalTopics },
                    { name: 'Ngân hàng đề', value: banks.length }
                  ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#6b7280" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                          />
                          <RTooltip 
                            contentStyle={{ 
                              background: 'rgba(255,255,255,0.95)', 
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 8
                            }} 
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#f59e0b" 
                            radius={[8,8,0,0]} 
                            stroke="#d97706"
                            strokeWidth={2}
                          />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
                  </Zoom>
            </Grid>
          </Grid>
            </Box>
          </Fade>
        </TabPanel>

        {/* Enhanced Settings Tab */}
        <TabPanel value={currentTab} index={5}>
          <Fade in={currentTab === 5} timeout={800}>
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                p: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
                  <SettingsIcon sx={{ color: '#6b7280', mr: 2, fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Cài đặt hệ thống
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  startIcon={<CloudUploadIcon />}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4b5563, #374151)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  Lưu tất cả
                </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                  <Zoom in={currentTab === 5} timeout={1000}>
                    <Card sx={{ 
                      p: 4,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SettingsIcon sx={{ color: '#3b82f6', mr: 2, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Cài đặt chung
                </Typography>
                      </Box>
                      <Stack spacing={3}>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            Tên hệ thống
                </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            VocaType
                </Typography>
                        </Box>
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 3,
                          background: 'rgba(34, 197, 94, 0.05)',
                          border: '1px solid rgba(34, 197, 94, 0.1)'
                        }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            Mô tả
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            Hệ thống học từ vựng tiếng Anh thông minh
                          </Typography>
                        </Box>
                        <Button 
                          variant="contained" 
                          fullWidth 
                          startIcon={<CloudUploadIcon />}
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                  Lưu cài đặt
                </Button>
                      </Stack>
              </Card>
                  </Zoom>
            </Grid>
            <Grid item xs={12} md={6}>
                  <Zoom in={currentTab === 5} timeout={1200}>
                    <Card sx={{ 
                      p: 4,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SecurityIcon sx={{ color: '#f59e0b', mr: 2, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Bảo trì hệ thống
                </Typography>
                      </Box>
                      <Stack spacing={2}>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          startIcon={<DownloadIcon />}
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            color: '#22c55e',
                            '&:hover': {
                              borderColor: '#22c55e',
                              background: 'rgba(34, 197, 94, 0.05)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                    Sao lưu dữ liệu
                  </Button>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          startIcon={<SpeedIcon />}
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6',
                            '&:hover': {
                              borderColor: '#3b82f6',
                              background: 'rgba(59, 130, 246, 0.05)',
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                    Làm sạch cache
                  </Button>
                        <Button 
                          variant="outlined" 
                          fullWidth 
                          color="warning" 
                          startIcon={<WarningIcon />}
                          sx={{ 
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                    Khởi động lại hệ thống
                  </Button>
                      </Stack>
              </Card>
                  </Zoom>
            </Grid>
          </Grid>
            </Box>
          </Fade>
        </TabPanel>
      </Card>
      </Fade>
      </Container>
      </Box>

      {/* Footer - Full Width */}
      <Box sx={{ 
        width: '100%',
        mt: 'auto',
        pt: 6,
        pb: 4,
        px: { xs: 3, md: 6 },
        borderTop: '2px solid rgba(0,0,0,0.05)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              VocaType Admin
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Hệ thống quản lý toàn diện cho nền tảng học tập VocaType
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="v2.0" size="small" color="primary" />
              <Chip label="Stable" size="small" color="success" />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Liên kết nhanh
            </Typography>
            <Stack spacing={1}>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                📊 Dashboard
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                👥 Quản lý người dùng
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                📚 Ngân hàng đề
              </Button>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="textSecondary">
                📧 Email: admin@vocatype.com
              </Typography>
              <Typography variant="body2" color="textSecondary">
                📞 Hotline: 1900-xxxx
              </Typography>
              <Typography variant="body2" color="textSecondary">
                🕐 Thứ 2 - Thứ 6: 8:00 - 17:00
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative' }}>
          {/* Text nằm giữa */}
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            © 2025 VocaType. All rights reserved.
          </Typography>

          {/* Các nút nằm bên phải */}
          <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
            <Button size="small" sx={{ textTransform: 'none' }}>Điều khoản</Button>
            <Button size="small" sx={{ textTransform: 'none' }}>Bảo mật</Button>
            <Button size="small" sx={{ textTransform: 'none' }}>Trợ giúp</Button>
          </Box>
        </Box>

      </Box>

      {/* Enhanced Drawer Sidebar cho Mobile */}
      <Drawer 
        anchor="left" 
        open={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }
        }}
      >
        <Box sx={{ width: 280, p: 2 }} role="presentation">
          <AdminSidebar currentTab={currentTab} onTabChange={(e, v) => { setCurrentTab(v); setMobileOpen(false); }} user={user} collapsed={false} />
        </Box>
      </Drawer>

      {/* View Bank Modal */}
      <Dialog 
        open={viewBankModal} 
        onClose={() => {
          setViewBankModal(false);
          setViewBankExpanded(false);
          setBankDetails(null);
        }}
        maxWidth={viewBankExpanded ? "lg" : "md"}
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          fontWeight: 700
        }}>
          Chi tiết bộ đề
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedBank && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedBank.title || selectedBank.name}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Người tạo:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedBank.creator_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Trạng thái:</Typography>
                  <Chip 
                    label={selectedBank.status === 'approved' ? 'Đã duyệt' : selectedBank.status === 'rejected' ? 'Từ chối' : 'Đang chờ'}
                    color={selectedBank.status === 'approved' ? 'success' : selectedBank.status === 'rejected' ? 'error' : 'warning'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Số câu hỏi:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedBank.total_questions || selectedBank.rb_questions || 0} câu
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">Thời gian:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedBank.time_limit || 60} phút
                  </Typography>
                </Grid>
                {selectedBank.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Mô tả:</Typography>
                    <Typography variant="body1">{selectedBank.description}</Typography>
                  </Grid>
                )}
                {selectedBank.rejection_reason && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Lý do từ chối:</Typography>
                      <Typography variant="body2">{selectedBank.rejection_reason}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
              
              {/* Expanded View - Passages & Questions */}
              {viewBankExpanded && bankDetails && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Passages */}
                  {bankDetails.passages && bankDetails.passages.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        📖 Đoạn văn
                      </Typography>
                      {bankDetails.passages.map((passage, idx) => (
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
                      Hiển thị {bankDetails.questions?.length || 0} câu hỏi trong bộ đề này
                    </Typography>
                  </Alert>
                  
                  {/* Real Questions Display */}
                  <Stack spacing={2}>
                    {bankDetails.questions && bankDetails.questions.map((q, idx) => (
                      <Card key={q.id} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip label={`Câu ${q.question_number || idx + 1}`} size="small" color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {q.type === 'mcq' || (q.options && q.options.length > 0) ? 'Trắc nghiệm' : 'Tự luận'}
                          </Typography>
                          {q.part_id && (
                            <Chip label={`Part ${q.part_id}`} size="small" variant="outlined" sx={{ ml: 1 }} />
                          )}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {q.question_text || q.prompt}
                        </Typography>
                        {q.options && q.options.length > 0 && (
                          <Stack spacing={0.5} sx={{ mb: 2 }}>
                            {q.options.map((opt, optIdx) => {
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
                            })}
                          </Stack>
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
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setViewBankModal(false);
            setViewBankExpanded(false);
            setBankDetails(null);
          }} variant="outlined">
            Đóng
          </Button>
          {!viewBankExpanded && (
            <Button 
              onClick={async () => {
                setLoadingDetails(true);
                const details = await fetchBankDetails(selectedBank?.id);
                setBankDetails(details);
                setViewBankExpanded(true);
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

      {/* Create Bank Modal - Multi-step Form */}
      <Dialog 
        open={createBankModal} 
        onClose={() => {
          setCreateBankModal(false);
          resetCreateBankForm();
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: 'white',
          fontWeight: 700
        }}>
          Tạo bộ đề mới
        </DialogTitle>
        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={activeStep}>
            <Step>
              <StepLabel>Thông tin cơ bản</StepLabel>
            </Step>
            <Step>
              <StepLabel>Thêm đoạn văn</StepLabel>
            </Step>
            <Step>
              <StepLabel>Thêm câu hỏi</StepLabel>
            </Step>
          </Stepper>
        </Box>
        <DialogContent sx={{ mt: 2, minHeight: '400px' }}>
          {/* Bước 1: Thông tin cơ bản */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <TextField
                label="Tên bộ đề"
                fullWidth
                required
                placeholder="VD: IELTS Reading Test 1"
                value={newBankForm.title}
                onChange={(e) => setNewBankForm({...newBankForm, title: e.target.value})}
              />
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                placeholder="Mô tả ngắn về bộ đề..."
                value={newBankForm.description}
                onChange={(e) => setNewBankForm({...newBankForm, description: e.target.value})}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số câu hỏi"
                    type="number"
                    fullWidth
                    value={newBankForm.total_questions}
                    onChange={(e) => setNewBankForm({...newBankForm, total_questions: parseInt(e.target.value) || 1})}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Thời gian (phút)"
                    type="number"
                    fullWidth
                    value={newBankForm.time_limit}
                    onChange={(e) => setNewBankForm({...newBankForm, time_limit: parseInt(e.target.value) || 1})}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
              </Grid>
              <Select
                fullWidth
                value={newBankForm.difficulty_level}
                onChange={(e) => setNewBankForm({...newBankForm, difficulty_level: e.target.value})}
              >
                <MenuItem value="easy">Dễ</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="hard">Khó</MenuItem>
              </Select>
            </Stack>
          )}

          {/* Bước 2: Thêm đoạn văn */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  📝 Thêm các đoạn văn Reading cho bộ đề. Mỗi đoạn văn sẽ có các câu hỏi riêng.
                </Typography>
              </Alert>
              {passages.map((passage, index) => (
                <Paper key={index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Đoạn văn {index + 1}</Typography>
                      {passages.length > 1 && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setPassages(passages.filter((_, i) => i !== index))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      label={`Part ${index + 1}`}
                      type="number"
                      value={passage.part_id}
                      onChange={(e) => {
                        const newPassages = [...passages];
                        newPassages[index].part_id = parseInt(e.target.value) || 1;
                        setPassages(newPassages);
                      }}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                    <TextField
                      label="Nội dung đoạn văn"
                      multiline
                      rows={6}
                      fullWidth
                      required
                      placeholder="Nhập nội dung đoạn văn Reading..."
                      value={passage.passage_text}
                      onChange={(e) => {
                        const newPassages = [...passages];
                        newPassages[index].passage_text = e.target.value;
                        setPassages(newPassages);
                      }}
                    />
                  </Stack>
                </Paper>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setPassages([...passages, { part_id: passages.length + 1, passage_text: '' }])}
              >
                Thêm đoạn văn
              </Button>
            </Stack>
          )}

          {/* Bước 3: Thêm câu hỏi */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Alert severity="info">
                <Typography variant="body2">
                  ❓ Thêm câu hỏi trắc nghiệm cho từng đoạn văn.
                </Typography>
              </Alert>
              {questions.map((question, index) => (
                <Paper key={index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Câu hỏi {index + 1}</Typography>
                      {questions.length > 1 && (
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Select
                          fullWidth
                          value={question.passage_index}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].passage_index = e.target.value;
                            setQuestions(newQuestions);
                          }}
                        >
                          {passages.map((_, i) => (
                            <MenuItem key={i} value={i}>Đoạn văn {i + 1}</MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Số thứ tự"
                          type="number"
                          fullWidth
                          value={question.question_number}
                          onChange={(e) => {
                            const newQuestions = [...questions];
                            newQuestions[index].question_number = parseInt(e.target.value) || 1;
                            setQuestions(newQuestions);
                          }}
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      label="Nội dung câu hỏi"
                      fullWidth
                      required
                      value={question.question_text}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].question_text = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    />
                    <Grid container spacing={2}>
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <Grid item xs={12} sm={6} key={opt}>
                          <TextField
                            label={`Đáp án ${opt}`}
                            fullWidth
                            value={question.options[opt]}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[index].options[opt] = e.target.value;
                              setQuestions(newQuestions);
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Select
                      fullWidth
                      value={question.correct_answer}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].correct_answer = e.target.value;
                        setQuestions(newQuestions);
                      }}
                    >
                      <MenuItem value="A">Đáp án đúng: A</MenuItem>
                      <MenuItem value="B">Đáp án đúng: B</MenuItem>
                      <MenuItem value="C">Đáp án đúng: C</MenuItem>
                      <MenuItem value="D">Đáp án đúng: D</MenuItem>
                    </Select>
                    
                    {/* Phần giải thích chi tiết */}
                    <TextField
                      label="Trích đoạn chứa đáp án (từ passage)"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Ví dụ: However, users must first download the updated printer driver..."
                      value={question.answer_location || ''}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].answer_location = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      helperText="Copy đoạn văn bản từ passage chứa đáp án"
                    />
                    
                    <TextField
                      label="Từ khóa quan trọng (cách nhau bởi dấu phẩy)"
                      fullWidth
                      placeholder="Ví dụ: printer driver, download, intranet"
                      value={question.keywords || ''}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].keywords = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      helperText="Các từ khóa giúp tìm đáp án"
                    />
                    
                    <TextField
                      label="Giải thích chi tiết"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Giải thích tại sao đáp án này đúng..."
                      value={question.explanation || ''}
                      onChange={(e) => {
                        const newQuestions = [...questions];
                        newQuestions[index].explanation = e.target.value;
                        setQuestions(newQuestions);
                      }}
                      helperText="Giải thích logic để chọn đáp án đúng"
                    />
                  </Stack>
                </Paper>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setQuestions([...questions, { 
                  passage_index: 0, 
                  question_number: questions.length + 1, 
                  question_text: '', 
                  options: { A: '', B: '', C: '', D: '' }, 
                  correct_answer: 'A' 
                }])}
              >
                Thêm câu hỏi
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => {
              setCreateBankModal(false);
              resetCreateBankForm();
            }} 
            variant="outlined"
          >
            Hủy
          </Button>
          <Box>
            {activeStep > 0 && (
              <Button 
                onClick={() => setActiveStep(activeStep - 1)}
                startIcon={<ArrowBackIcon />}
                sx={{ mr: 1 }}
              >
                Quay lại
              </Button>
            )}
            {activeStep < 2 ? (
              <Button 
                onClick={() => {
                  if (activeStep === 0 && !newBankForm.title.trim()) {
                    setError('Vui lòng nhập tên bộ đề');
                    return;
                  }
                  if (activeStep === 1 && passages.some(p => !p.passage_text.trim())) {
                    setError('Vui lòng nhập nội dung cho tất cả đoạn văn');
                    return;
                  }
                  
                  // Khi chuyển từ Bước 2 sang Bước 3, tự động tạo số câu hỏi theo total_questions
                  if (activeStep === 1) {
                    const totalQuestions = newBankForm.total_questions || 1;
                    const newQuestions = [];
                    for (let i = 0; i < totalQuestions; i++) {
                      newQuestions.push({
                        passage_index: 0,
                        question_number: i + 1,
                        question_text: '',
                        options: { A: '', B: '', C: '', D: '' },
                        correct_answer: 'A'
                      });
                    }
                    setQuestions(newQuestions);
                  }
                  
                  setActiveStep(activeStep + 1);
                }}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={activeStep === 0 && !newBankForm.title.trim()}
              >
                Tiếp tục
              </Button>
            ) : (
              <Button 
                onClick={async () => {
                  // Validate questions
                  if (questions.some(q => !q.question_text.trim() || Object.values(q.options).some(opt => !opt.trim()))) {
                    setError('Vui lòng điền đầy đủ câu hỏi và đáp án');
                    return;
                  }
                  
                  try {
                    // Transform data to match Teacher's format (nested passages + questions)
                    const passagesWithQuestions = passages.map((passage, pIndex) => ({
                      part_id: passage.part_id,
                      passage_text: passage.passage_text,
                      questions: questions
                        .filter(q => q.passage_index === pIndex)
                        .map(q => ({
                          question_number: q.question_number,
                          question_text: q.question_text,
                          options: [q.options.A, q.options.B, q.options.C, q.options.D],
                          correct_answer: q.correct_answer,
                          explanation: q.explanation || null,
                          keywords: q.keywords || null,
                          answer_location: q.answer_location || null
                        }))
                    }));

                    // Single API call with nested data (like Teacher does)
                    const response = await fetch('/api/question-bank', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        ...newBankForm,
                        is_public: true,
                        passages: passagesWithQuestions
                      })
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Không thể tạo bộ đề');
                    }

                    const result = await response.json();
                    setSuccessMessage(result.message || 'Tạo bộ đề thành công!');
                    setCreateBankModal(false);
                    resetCreateBankForm();
                    fetchAllData();
                  } catch (err) {
                    setError(err.message || 'Lỗi khi tạo bộ đề');
                  }
                }}
                variant="contained"
                startIcon={<AddIcon />}
              >
                Hoàn thành
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Enhanced Mobile quick nav */}
      <Box 
        className="admin-bottom-nav" 
        sx={{ 
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '8px',
          gap: '4px'
        }}
      >
        {[
          {id:0, icon:<DashboardIcon fontSize="small"/>, label:'Tổng quan', color:'#3b82f6'},
          {id:1, icon:<PeopleIcon fontSize="small"/>, label:'Người dùng', color:'#22c55e'},
          {id:2, icon:<BookIcon fontSize="small"/>, label:'Nội dung', color:'#8b5cf6'},
          {id:3, icon:<QuizIcon fontSize="small"/>, label:'Ngân hàng', color:'#f59e0b'}
        ].map(i => (
          <button 
            key={i.id} 
            className={currentTab===i.id? 'active': ''} 
            onClick={()=> setCurrentTab(i.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px',
              borderRadius: '12px',
              border: 'none',
              background: currentTab===i.id ? `linear-gradient(135deg, ${i.color}20, ${i.color}10)` : 'transparent',
              color: currentTab===i.id ? i.color : '#6b7280',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: currentTab===i.id ? 600 : 500
            }}
            onMouseEnter={(e) => {
              if (currentTab !== i.id) {
                e.target.style.background = `linear-gradient(135deg, ${i.color}10, ${i.color}05)`;
                e.target.style.color = i.color;
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab !== i.id) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6b7280';
              }
            }}
          >
            {i.icon}
            <span style={{fontSize:11, marginTop: '2px'}}>{i.label}</span>
          </button>
        ))}
      </Box>

      {/* Modal xác nhận xóa đề thi */}
      <Dialog
        open={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon />
          Xác nhận xóa đề thi
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: '#fee2e2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <DeleteIcon sx={{ fontSize: 40, color: '#dc2626' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Bạn có chắc chắn muốn xóa?
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
              Đề thi <strong>"{bankToDelete?.title}"</strong> sẽ bị xóa vĩnh viễn
            </Typography>
            <Box sx={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: 2, 
              padding: 2,
              textAlign: 'left'
            }}>
              <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 600, mb: 1 }}>
                ⚠️ Cảnh báo:
              </Typography>
              <Typography variant="body2" sx={{ color: '#7f1d1d' }}>
                • Tất cả câu hỏi và đáp án sẽ bị xóa<br/>
                • Lịch sử làm bài của học viên sẽ bị ảnh hưởng<br/>
                • Hành động này không thể hoàn tác
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setDeleteConfirmModal(false);
              setBankToDelete(null);
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Hủy
          </Button>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch(`/api/question-bank/${bankToDelete.id}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                if (response.ok) {
                  setSuccessMessage('Đã xóa đề thi thành công!');
                  fetchAllData();
                  setDeleteConfirmModal(false);
                  setBankToDelete(null);
                } else {
                  const errorData = await response.json();
                  setError(errorData.error || 'Không thể xóa đề thi');
                }
              } catch (err) {
                setError('Lỗi khi xóa đề thi: ' + err.message);
              }
            }}
            variant="contained"
            color="error"
            sx={{ flex: 1 }}
          >
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal từ chối đề thi */}
      <Dialog
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ErrorIcon />
          Từ chối đề thi
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: '#fee2e2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ErrorIcon sx={{ fontSize: 40, color: '#dc2626' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Vui lòng nhập lý do từ chối
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Lý do này sẽ được gửi đến giáo viên để họ có thể chỉnh sửa
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Lý do từ chối *"
            placeholder="Ví dụ: Câu hỏi số 3 chưa rõ ràng, đáp án B và C quá giống nhau..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Hãy cung cấp lý do cụ thể để giáo viên có thể cải thiện đề thi"
          />

          <Box sx={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: 2, 
            padding: 2
          }}>
            <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 600, mb: 1 }}>
              💡 Gợi ý:
            </Typography>
            <Typography variant="body2" sx={{ color: '#7f1d1d', fontSize: 13 }}>
              • Chỉ rõ câu hỏi nào có vấn đề<br/>
              • Giải thích vấn đề cụ thể (sai chính tả, đáp án không chính xác, v.v.)<br/>
              • Đề xuất cách sửa nếu có thể
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setRejectModal(false);
              setTestToReject(null);
              setRejectionReason('');
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Hủy
          </Button>
          <Button 
            onClick={submitRejection}
            variant="contained"
            color="error"
            sx={{ flex: 1 }}
            disabled={!rejectionReason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
import React, { useContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './index.css';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Learn from './pages/Learn';
import LearnNew from './pages/LearnNew';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Review from './pages/Review';
import CreateSet from './pages/CreateSet';
import ExamMode from './pages/ExamMode';
import ToeicPractice from './pages/ToeicPractice';
import History from './pages/History';
import BadgeCollection from './pages/BadgeCollection';
import AssignmentPage from './pages/AssignmentPage';
import NotificationDetail from './pages/NotificationDetail';
import TypingPractice from './pages/TypingPractice';
import FlashcardPage from './pages/Flashcard';
import FlashcardDemo from './components/FlashcardDemo';
import FlashcardNew from './pages/FlashcardNew';
import QuestionBank from './pages/QuestionBank';
import TestDetail from './pages/TestDetail';
import TestResult from './pages/TestResult';
import TestHistory from './pages/TestHistory';
import Blog from './pages/ModernBlog';
import BlogPost from './pages/BlogPost';
import ScrollToTopButton from './components/ScrollToTopButton';
import Breadcrumbs from './components/Breadcrumbs';
import Admin from './pages/Admin';
import TeacherDashboard from './pages/TeacherDashboard';
import DictationTopics from './pages/DictationTopics';
import DictationExercises from './pages/DictationExercises';
import Dictation from './pages/Dictation';
import Reports from './pages/Reports';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import Roadmap from './pages/Roadmap';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaBookOpen, FaRedo, FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlus } from 'react-icons/fa';
import Navbar from './components/Navbar';

function AppBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quản lý body scroll khi menu mở/đóng
  React.useEffect(() => {
    if (isMobile && menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobile, menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const menuLinks = (
    <>
      {/* Các chức năng cơ bản - hiển thị cho tất cả */}
      <Link to={user ? "/dashboard" : "/"} onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Trang chủ</Link>
      <Link to="/blog" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Blog</Link>
      
      {/* Các chức năng chỉ hiển thị khi đã đăng nhập */}
      {user && (
        <>
          <Link to="/learn" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Học tập</Link>
          <Link to="/exam" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Thi thử</Link>
          <Link to="/question-bank" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Ngân hàng đề</Link>
          <Link to="/typing-practice" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Luyện gõ</Link>
          <Link to="/dictation" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Dictation</Link>
          <Link to="/history" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Lịch sử</Link>
          <Link to="/badges" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Huy hiệu</Link>
          <Link to="/review" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Ôn tập</Link>
          <Link to="/flashcard-new" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Flashcard</Link>
          <Link to="/flashcard-demo" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Flashcard Demo</Link>
        </>
      )}
      
      {/* Chức năng dành cho giáo viên */}
      {user && user.role === 'teacher' && (
        <Link to="/assignment" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline', background:'#22c55e',borderRadius:8,padding:'6px 14px',boxShadow:'0 2px 8px #22c55e22',transition:'all 0.18s' }}>Giao bài</Link>
      )}
      
      {/* Chức năng đăng nhập/đăng ký */}
      {!user && (
        <>
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0 12px 0 0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Đăng nhập</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: isMobile ? '16px 0' : '0', fontWeight: 600, fontSize: isMobile ? 22 : 18, display: isMobile ? 'block' : 'inline' }}>Đăng ký</Link>
        </>
      )}
    </>
  );
  return (
    <div style={{
      width: '100vw',
      left: 0,
      top: 0,
      position: 'relative',
      zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      boxShadow: '0 4px 24px #6366f122',
      borderBottom: '1.5px solid #e0e7ff',
      animation: 'fadeIn 0.7s',
    }}>
      <nav style={{
        width: '100%',
        background: 'linear-gradient(90deg,#6366f1 0%,#2563eb 100%)',
        borderRadius: 0,
        boxShadow: '0 4px 24px #6366f122',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 600,
        fontSize: 18,
        color: '#fff',
        position: 'relative',
        margin: 0,
        padding: isMobile ? '10px 10px' : '18px 32px',
        justifyContent: 'space-between',
        minHeight: 60,
        boxSizing: 'border-box',
        overflowX: 'auto',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={user ? "/dashboard" : "/"} style={{ color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 26, letterSpacing: 1, marginRight: 16, display:'flex',alignItems:'center',gap:8 }}>
            <span style={{display:'inline-block',background:'linear-gradient(135deg,#22d3ee,#6366f1)',borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #22d3ee33',marginRight:6}}>
              <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#22d3ee"/><text x="11" y="16" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">V</text></svg>
            </span>
            VocaType
          </Link>
          {!isMobile && <div style={{display:'flex',alignItems:'center',gap:2}}>{React.Children.map(menuLinks.props.children, child => child && React.cloneElement(child, {style: {...child.props.style,transition:'all 0.18s',borderRadius:8,padding:'6px 10px',margin:'0 2px',background:'transparent'},onMouseEnter:e=>e.currentTarget.style.background='#2563eb33',onMouseLeave:e=>e.currentTarget.style.background='transparent'}))}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && (
            <>
              <span style={{ fontWeight: 600, fontSize: 17, marginRight: 6, color:'#2563eb',background:'#fff',padding:'4px 14px',borderRadius:12,boxShadow:'0 2px 8px #2563eb22',letterSpacing:1 }}>{user.name}</span>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)} 
                  alt="avatar" 
                  style={{ 
                    width: 38, 
                    height: 38, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '3px solid #22d3ee', 
                    boxShadow: '0 2px 8px #22d3ee44', 
                    transition:'border 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => setMenuOpen(!menuOpen)}
                />
                {menuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    minWidth: '160px',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #e5e7eb',
                      fontWeight: 600,
                      color: '#1e293b',
                      fontSize: '14px'
                    }}>
                      {user.name}
                    </div>
                    <div 
                      style={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        color: '#374151',
                        fontWeight: 500,
                        padding: '12px 16px',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => {
                        navigate('/profile');
                        setMenuOpen(false);
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <FaUser style={{ marginRight: '8px' }} />
                      Profile
                    </div>
                    <div 
                      style={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontWeight: 600,
                        padding: '12px 16px',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={handleLogout}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <FaSignOutAlt style={{ marginRight: '8px' }} />
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, marginLeft: 10, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
              <FaBars />
            </button>
          )}
        </div>
        {isMobile && menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.25)', zIndex: 2000 }} />
            <div 
              className="mobile-menu"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 270,
                height: '100vh',
                background: 'linear-gradient(120deg,#6366f1 60%,#2563eb 100%)',
                boxShadow: '-4px 0 24px #6366f144',
                borderRadius: '32px 0 0 32px',
                zIndex: 2100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '32px 24px 24px 24px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, alignSelf: 'flex-end', marginBottom: 18, cursor: 'pointer' }}><FaTimes /></button>
              {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, width: '100%' }}>
                  <img src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 8px #6366f122' }} />
                  <span style={{ fontWeight: 600, fontSize: 18, color: '#fff', flex: 1 }}>{user.name}</span>
                  <button onClick={handleLogout} style={{ background: '#fff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #2563eb22', transition: 'all 0.2s', marginLeft: 6 }}><FaSignOutAlt style={{marginRight:4}}/>Logout</button>
                </div>
              )}
              {/* Các chức năng cơ bản - hiển thị cho tất cả */}
              <Link to={user ? "/dashboard" : "/"} onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaTachometerAlt />Trang chủ</Link>
              <Link to="/blog" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaBookOpen />Blog</Link>
              
              {/* Các chức năng chỉ hiển thị khi đã đăng nhập */}
              {user && (
                <>
                  <Link to="/learn" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaBookOpen />Học tập</Link>
                  <Link to="/exam" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaTachometerAlt />Thi thử</Link>
                  <Link to="/question-bank" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaBookOpen />Ngân hàng đề</Link>
                  <Link to="/typing-practice" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaKeyboard />Luyện gõ</Link>
                  <Link to="/dictation" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}>🎧 Dictation</Link>
                  <Link to="/history" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaRedo />Lịch sử</Link>
                  <Link to="/badges" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaUser />Huy hiệu</Link>
                  <Link to="/review" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaRedo />Ôn tập</Link>
                  <Link to="/flashcard-new" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}>📚 Flashcard</Link>
                  <Link to="/flashcard-demo" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}>🎯 Flashcard Demo</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaUser />Profile</Link>
                </>
              )}
              {user && user.role === 'teacher' && (
                <Link to="/assignment" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', background:'#22c55e',boxShadow:'0 2px 8px #22c55e22',transition:'background 0.2s', minHeight: '48px' }}>Assignment</Link>
              )}
              {!user && <>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaSignInAlt />Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', margin: '16px 0', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 12, width: '100%', borderRadius: 8, padding: '12px 16px', transition: 'background 0.2s', minHeight: '48px' }}><FaUserPlus />Register</Link>
              </>}
            </div>
            <style>{`
              @keyframes slideInRight {
                from { 
                  opacity: 0; 
                  transform: translateX(100%); 
                }
                to { 
                  opacity: 1; 
                  transform: translateX(0); 
                }
              }
              
              .mobile-menu {
                transform: translateX(100%);
                animation: slideInRight 0.3s ease-out forwards;
              }
              
              /* Fix dropdown animation từ trái qua phải */
              .dropdown-enter {
                animation: slideInLeft 0.3s ease forwards !important;
              }
              
              .dropdown-exit {
                animation: slideOutLeft 0.3s ease forwards !important;
              }
              
              @keyframes slideInLeft {
                from {
                  opacity: 0;
                  transform: translateX(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              
              @keyframes slideOutLeft {
                from {
                  opacity: 1;
                  transform: translateX(0);
                }
                to {
                  opacity: 0;
                  transform: translateX(-20px);
                }
              }
            `}</style>
          </>
        )}
      </nav>
      <style>{`
        /* CSS đã được chuyển vào index.css để tránh xung đột */
        @media (max-width: 700px) {
          nav {
            border-radius: 0 !important;
            font-size: 16px !important;
            padding: 10px 10px !important;
          }
          
          /* Đảm bảo menu mobile không bị di chuyển */
          .mobile-menu {
            position: fixed !important;
            top: 0 !important;
            right: 0 !important;
            transform: translateX(0) !important;
            z-index: 9999 !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
          }
          
          /* Đảm bảo menu items không bị cắt */
          .mobile-menu a {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          /* Hover effect cho menu items */
          .mobile-menu a:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateX(4px) !important;
          }
          
          /* Đảm bảo body không scroll khi menu mở */
          body.menu-open {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ConditionalNavbar() {
  const location = useLocation();
  const hideOnAdmin = location.pathname.startsWith('/admin');
  return hideOnAdmin ? null : <Navbar />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ConditionalNavbar />
        <ScrollToTopButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn-new" element={<LearnNew />} />
          <Route path="/exam" element={<ExamMode />} />
          <Route path="/toeic" element={<ToeicPractice />} />
          <Route path="/history" element={<History />} />
          <Route path="/badges" element={<BadgeCollection />} />
          <Route path="/createset" element={<CreateSet />} />
          <Route path="/review" element={<Review />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/assignment" element={<AssignmentPage />} />
          <Route path="/notification" element={<NotificationDetail />} />
          <Route path="/notification/:id" element={<NotificationDetail />} />
          <Route path="/typing-practice" element={<TypingPractice />} />
          <Route path="/flashcard" element={<FlashcardPage />} />
          <Route path="/flashcard-demo" element={<FlashcardDemo />} />
          <Route path="/flashcard-new" element={<FlashcardNew />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/tests/:id" element={<TestDetail />} />
          <Route path="/tests/:id/history" element={<TestHistory />} />
          <Route path="/tests/:id/results/:attemptId" element={<TestResult />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/dictation" element={<DictationTopics />} />                      {/* Chọn topic */}
          <Route path="/dictation/exercises/:topic" element={<DictationExercises />} />  {/* Danh sách bài */}
          <Route path="/dictation/practice/:id" element={<Dictation />} />
          {/* Thêm các route còn thiếu cho menu dropdown */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/settings" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Cài đặt tài khoản</h1><p>Trang này đang được phát triển</p></div>} />
          <Route path="/notifications" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Thông báo</h1><p>Trang này đang được phát triển</p></div>} />
          <Route path="/security" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Bảo mật</h1><p>Trang này đang được phát triển</p></div>} />
          <Route path="/help" element={<div style={{padding: '2rem', textAlign: 'center'}}><h1>Trợ giúp</h1><p>Trang này đang được phát triển</p></div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 
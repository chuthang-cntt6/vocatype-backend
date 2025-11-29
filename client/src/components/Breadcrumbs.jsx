import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getPostById } from '../pages/blogData';
import { 
  FaHome, 
  FaBookOpen, 
  FaGraduationCap, 
  FaClipboardCheck, 
  FaTrophy, 
  FaHistory, 
  FaMedal, 
  FaPlus, 
  FaRedo, 
  FaUser, 
  FaSignInAlt, 
  FaUserPlus, 
  FaTasks, 
  FaBell, 
  FaKeyboard, 
  FaLayerGroup, 
  FaQuestionCircle, 
  FaBlog, 
  FaMicrophone,
  FaChevronRight
} from 'react-icons/fa';

const TITLES = {
  '/': 'Trang chủ',
  '/learn': 'Học tập',
  '/exam': 'Thi thử',
  '/toeic': 'Luyện TOEIC',
  '/history': 'Lịch sử',
  '/badges': 'Huy hiệu',
  '/createset': 'Tạo bộ thẻ',
  '/review': 'Ôn tập',
  '/profile': 'Hồ sơ',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/assignment': 'Giao bài',
  '/notification': 'Thông báo',
  '/typing-practice': 'Luyện gõ',
  '/flashcard': 'Flashcard',
  '/question-bank': 'Ngân hàng đề',
  '/blog': 'Blog',
  '/dictation': 'Dictation',
};

const ICONS = {
  '/': FaHome,
  '/learn': FaBookOpen,
  '/exam': FaClipboardCheck,
  '/toeic': FaGraduationCap,
  '/history': FaHistory,
  '/badges': FaMedal,
  '/createset': FaPlus,
  '/review': FaRedo,
  '/profile': FaUser,
  '/login': FaSignInAlt,
  '/register': FaUserPlus,
  '/assignment': FaTasks,
  '/notification': FaBell,
  '/typing-practice': FaKeyboard,
  '/flashcard': FaLayerGroup,
  '/question-bank': FaQuestionCircle,
  '/blog': FaBlog,
  '/dictation': FaMicrophone,
};

export default function Breadcrumbs() {
  const location = useLocation();

  // Ẩn trên trang admin và blog (để tích hợp vào trang)
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/blog')) return null;

  const segments = location.pathname.split('/').filter(Boolean);
  const paths = segments.map((_, idx) => '/' + segments.slice(0, idx + 1).join('/'));

  // Xử lý tiêu đề động cho blog/:id
  const lastPath = '/' + segments.join('/');
  let dynamicTitle = null;
  if (/^\/blog\/.+/.test(lastPath)) {
    const id = segments[1];
    const post = getPostById(id);
    if (post) dynamicTitle = post.title;
  }

  const items = [{ path: '/', title: TITLES['/'] }];
  paths.forEach((p, idx) => {
    if (p === '/') return;
    if (p.startsWith('/blog/') && dynamicTitle && idx === paths.length - 1) {
      // Chỉ thêm tiêu đề động cho cấp cuối cùng, thay vì thêm cả /blog lần nữa
      items.push({ path: p, title: dynamicTitle });
    } else if (TITLES[p] && !p.startsWith('/blog/') || p === '/blog') {
      // Chỉ thêm /blog một lần và các đường dẫn khác
      items.push({ path: p, title: TITLES[p] });
    }
  });

  // Không hiển thị khi chỉ có Trang chủ
  if (items.length <= 1) return null;

  return (
    <nav aria-label="breadcrumbs" className="breadcrumb-nav" style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '0',
      margin: '0',
      background: 'transparent',
      pointerEvents: 'auto'
    }}>
      <div className="breadcrumb-container" style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 24px'
      }}>
        <div className="breadcrumb-items" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          overflowX: 'auto',
          paddingBottom: '0',
          pointerEvents: 'auto'
        }}>
          {items.map((it, idx) => {
            const isLast = idx === items.length - 1;
            const IconComponent = ICONS[it.path] || FaHome;
            
            return (
              <React.Fragment key={it.path + idx}>
                <div className="breadcrumb-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isLast 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'transparent',
                  border: isLast 
                    ? '1px solid rgba(99, 102, 241, 0.3)' 
                    : 'none',
                  transition: 'all 0.2s ease',
                  cursor: isLast ? 'default' : 'pointer',
                  minWidth: 'fit-content'
                }}
                onMouseEnter={(e) => {
                  if (!isLast) {
                    e.target.style.background = 'rgba(99, 102, 241, 0.08)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLast) {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}>
                  
                  <IconComponent style={{
                    fontSize: '14px',
                    color: isLast ? '#6366f1' : '#94a3b8',
                    transition: 'color 0.2s ease'
                  }} />
                  
                  {isLast ? (
                    <span style={{ 
                      color: '#6366f1', 
                      fontWeight: 600, 
                      fontSize: '14px',
                      whiteSpace: 'nowrap'
                    }}>
                      {it.title}
                    </span>
                  ) : (
                    <Link 
                      to={it.path} 
                      style={{ 
                        color: '#94a3b8', 
                        textDecoration: 'none', 
                        fontWeight: 500, 
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#6366f1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#94a3b8';
                      }}
                    >
                      {it.title}
                    </Link>
                  )}
                </div>
                
                {!isLast && (
                  <FaChevronRight style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    margin: '0 2px'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .breadcrumb-nav {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            pointer-events: auto !important;
          }
          
          .breadcrumb-container {
            padding: 0 24px !important;
            margin: 0 !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          .breadcrumb-items {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            pointer-events: auto !important;
          }
          
          .breadcrumb-item {
            margin: 0 !important;
            padding: 6px 10px !important;
          }
          
          @media (max-width: 768px) {
            .breadcrumb-nav {
              padding: 0 !important;
            }
            
            .breadcrumb-container {
              padding: 0 16px !important;
            }
            
            .breadcrumb-items {
              gap: 4px !important;
            }
            
            .breadcrumb-item {
              padding: 4px 8px !important;
              font-size: 13px !important;
            }
          }
        `
      }} />
    </nav>
  );
}
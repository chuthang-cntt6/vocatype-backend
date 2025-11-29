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
  FaChevronRight,
  FaChartBar,
  FaChartLine,
  FaBrain
} from 'react-icons/fa';

const TITLES = {
  '/': 'Trang chủ',
  '/dashboard': 'Dashboard',
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
  '/reports': 'Báo cáo học tập',
  '/progress': 'Thống kê tiến độ',
  '/analytics': 'Phân tích kết quả',
};

const ICONS = {
  '/': FaHome,
  '/dashboard': FaHome,
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
  '/reports': FaChartBar,
  '/progress': FaChartLine,
  '/analytics': FaBrain,
};

export default function PageBreadcrumb({ 
  backgroundColor = 'transparent', 
  textColor = 'rgba(255,255,255,0.8)',
  currentTextColor = 'white',
  marginBottom = '16px',
  padding = '12px 16px',
  borderRadius = '8px',
  items = null
}) {
  const location = useLocation();
  const params = useParams();

  // Ẩn trên trang admin và trang chủ thực sự (/)
  if (location.pathname.startsWith('/admin') || location.pathname === '/') return null;

  // Nếu có items được truyền vào, sử dụng items đó
  if (items && items.length > 0) {
    return (
      <nav style={{ marginBottom }}>
        <div style={{ 
          background: backgroundColor,
          padding,
          borderRadius,
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          color: textColor,
          fontSize: '14px'
        }}>
          {items.map((item, idx) => {
            const Icon = ICONS[item.path] || FaHome;
            const isLast = idx === items.length - 1;
            
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <FaChevronRight size={12} />}
                {isLast ? (
                  <span style={{ 
                    color: currentTextColor, 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Icon size={14} />
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    to={item.path}
                    style={{ 
                      color: textColor, 
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = currentTextColor}
                    onMouseLeave={(e) => e.target.style.color = textColor}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    );
  }

  // Logic cũ cho auto breadcrumb
  const segments = location.pathname.split('/').filter(Boolean);
  const paths = segments.map((_, idx) => '/' + segments.slice(0, idx + 1).join('/'));

  // Xử lý tiêu đề động cho blog/:id
  let titles = paths.map(p => TITLES[p] || p);
  if (location.pathname.startsWith('/blog/') && params.id) {
    try {
      const post = getPostById(parseInt(params.id));
      if (post) {
        titles[titles.length - 1] = post.title;
      }
    } catch (e) {
      // Fallback nếu không tìm thấy bài viết
    }
  }

  return (
    <nav style={{ marginBottom }}>
      <div style={{ 
        background: backgroundColor,
        padding,
        borderRadius,
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        color: textColor,
        fontSize: '14px'
      }}>
        <Link 
          to="/" 
          style={{ 
            color: textColor, 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = currentTextColor}
          onMouseLeave={(e) => e.target.style.color = textColor}
        >
          <FaHome size={14} />
          Trang chủ
        </Link>
        
        {paths.map((path, idx) => {
          const Icon = ICONS[path];
          const isLast = idx === paths.length - 1;
          
          return (
            <React.Fragment key={path}>
              <FaChevronRight size={12} />
              {isLast ? (
                <span style={{ 
                  color: currentTextColor, 
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {Icon && <Icon size={14} />}
                  {titles[idx]}
                </span>
              ) : (
                <Link 
                  to={path}
                  style={{ 
                    color: textColor, 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = currentTextColor}
                  onMouseLeave={(e) => e.target.style.color = textColor}
                >
                  {Icon && <Icon size={14} />}
                  {titles[idx]}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

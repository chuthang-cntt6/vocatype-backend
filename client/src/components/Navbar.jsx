import React, { useContext, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import Slide from '@mui/material/Slide';

import { 
  FaHome, 
  FaBook, 
  FaGraduationCap, 
  FaKeyboard, 
  FaHistory, 
  FaTrophy, 
  FaRedo, 
  FaUser,
  FaTools,
  FaPlus,
  FaClipboardList,
  FaSignInAlt,
  FaUserPlus,
  FaVolumeUp,
  FaChartBar,
  FaCog,
  FaProjectDiagram
} from 'react-icons/fa';

// Menu items cơ bản cho tất cả người dùng
const basicMenuItems = [
  { label: 'Trang chủ', path: '/', icon: FaHome },
];

// Menu dropdown cho người dùng đã đăng nhập
const authenticatedDropdownMenus = [
  {
    label: 'Học tập',
    icon: FaBook,
    items: [
      { label: 'Học từ mới', path: '/learn-new', icon: FaBook },
      // { label: 'Học từ vựng', path: '/learn', icon: FaBook },

      // { label: 'Flashcard', path: '/flashcard', icon: FaBook },
      { label: 'Flashcard', path: '/flashcard-demo', icon: FaBook },
      { label: 'Lộ trình học', path: '/roadmap', icon: FaProjectDiagram },
      { label: 'Thi thử (gõ phản xạ)', path: '/exam', icon: FaGraduationCap },
      { label: 'Luyện đề TOEIC (trắc nghiệm)', path: '/toeic', icon: FaGraduationCap },
      // Trong menu dropdown "Học tập"
      { label: 'Luyện Dictation TOEIC', path: '/dictation', icon: FaVolumeUp },
      { label: 'Ngân hàng đề', path: '/question-bank', icon: FaClipboardList },
    ]
  },
  {
    label: 'Thống kê',
    icon: FaTrophy,
    items: [
      { label: 'Lịch sử', path: '/history', icon: FaHistory },
      { label: 'Huy hiệu', path: '/badges', icon: FaTrophy },
      { label: 'Ôn tập', path: '/review', icon: FaRedo },
    ]
  },
  {
    label: 'Báo cáo',
    icon: FaChartBar,
    items: [
      { label: 'Báo cáo học tập', path: '/reports', icon: FaChartBar },
      { label: 'Thống kê tiến độ', path: '/progress', icon: FaChartBar },
      { label: 'Phân tích kết quả', path: '/analytics', icon: FaChartBar },
    ]
  },
  // {
  //   label: 'Cài đặt',
  //   icon: FaCog,
  //   items: [
  //     { label: 'Cài đặt tài khoản', path: '/settings', icon: FaCog },
  //     { label: 'Thông báo', path: '/notifications', icon: FaCog },
  //     { label: 'Bảo mật', path: '/security', icon: FaCog },
  //     { label: 'Trợ giúp', path: '/help', icon: FaCog },
  //   ]
  // },

  { label: 'Blog', path: '/blog', icon: FaBook, items: [], hideOnDesktop: true },
];


export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownAnchors, setDropdownAnchors] = useState({});
  const isTransitioningRef = React.useRef(false);
  const dropdownStateRef = React.useRef({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  // Detect mobile screen size
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDropdownOpen = React.useCallback((event, menuLabel) => {
    console.log(`🔥 handleDropdownOpen được gọi cho ${menuLabel}`);
    console.log(`🔥 Event type: ${event.type}`);
    console.log(`🔥 Current dropdowns:`, dropdownAnchors);
    console.log(`🔥 isTransitioning:`, isTransitioningRef.current);
    console.log(`🔥 isMobile:`, isMobile);
    
    // Cho phép dropdown menu trên mobile
    if (isMobile) {
      console.log(`🔥 Mobile detected - cho phép dropdown menu`);
    }
    
    // Không ngăn chặn event bubbling để cho phép handleClickOutside hoạt động
    // event.stopPropagation(); // Bỏ comment để cho phép event bubbling
    // Không preventDefault để cho phép dropdown hoạt động bình thường
    
    // Nếu đang trong quá trình chuyển đổi, bỏ qua
    if (isTransitioningRef.current) {
      console.log(`🔥 Đang chuyển đổi - bỏ qua`);
      return;
    }
    
    // LOGIC MỚI: Chuyển đổi trực tiếp như mobile
    // Kiểm tra nếu có menu khác đang mở - CHUYỂN ĐỔI TRỰC TIẾP
    const currentOpenMenu = Object.keys(dropdownAnchors).find(key => dropdownAnchors[key]);
    console.log(`🔥 Current open menu: ${currentOpenMenu}, Target menu: ${menuLabel}`);
    console.log(`🔥 All dropdown anchors:`, dropdownAnchors);
    
    // Kiểm tra nếu có menu khác đang mở (kể cả khi đã bị đóng bởi onClose)
    const hasOtherMenuOpen = Object.keys(dropdownAnchors).some(key => 
      key !== menuLabel && dropdownAnchors[key] !== null
    );
    
    // Cập nhật dropdownStateRef
    dropdownStateRef.current = { ...dropdownAnchors };
    
    if (hasOtherMenuOpen || (currentOpenMenu && currentOpenMenu !== menuLabel)) {
      // Chuyển đổi trực tiếp - đóng menu cũ và mở menu mới ngay lập tức
      console.log(`🔥 CHUYỂN ĐỔI TRỰC TIẾP từ ${currentOpenMenu || 'menu khác'} sang ${menuLabel}`);
      
      // Đặt flag để ngăn onClose đóng menu
      isTransitioningRef.current = true;
      
      // Chuyển đổi ngay lập tức - chỉ mở menu mới
      setDropdownAnchors({
        [menuLabel]: event.currentTarget
      });
      
      // Thêm class để ngăn chặn layout shift
      document.body.classList.add('dropdown-open');
      
      // Ngăn chặn scroll ngang khi dropdown mở, nhưng vẫn cho phép scroll dọc
      document.body.style.overflowX = 'hidden';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.overflowY = 'auto';
      
      // Reset flag sau khi chuyển đổi xong
      setTimeout(() => {
        isTransitioningRef.current = false;
        console.log(`🔥 Chuyển đổi hoàn thành`);
      }, 100);
      
      return;
    }
    
    // Kiểm tra nếu menu này đã mở rồi thì đóng nó
    if (dropdownAnchors[menuLabel]) {
      console.log(`🔥 Đóng menu ${menuLabel}`);
      handleDropdownClose(menuLabel);
      return;
    }
    
    console.log(`🔥 Mở menu mới ${menuLabel} với anchor:`, event.currentTarget);
    
    // Mở dropdown mới bình thường (không có dropdown nào khác đang mở)
    console.log(`🔥 Mở menu mới ${menuLabel}`);
    setDropdownAnchors(prev => ({
      ...prev,
      [menuLabel]: event.currentTarget
    }));
    
    // Thêm class để ngăn chặn layout shift
    document.body.classList.add('dropdown-open');
    
    // Ngăn chặn scroll ngang khi dropdown mở, nhưng vẫn cho phép scroll dọc
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'auto';
  }, [dropdownAnchors]);

  const handleDropdownClose = (menuLabel) => {
    console.log(`🔥 handleDropdownClose được gọi cho ${menuLabel}`);
    // Thêm class để ngăn layout shift khi đóng
    document.body.classList.add('dropdown-closing');
    
    setDropdownAnchors(prev => ({
      ...prev,
      [menuLabel]: null
    }));
    
    // Xóa class khi đóng dropdown
    document.body.classList.remove('dropdown-open');
    
    // Khôi phục scroll khi đóng dropdown
    document.body.style.overflowX = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflowX = '';
    document.documentElement.style.overflowY = '';
    
    // Xóa class dropdown-closing sau khi animation hoàn thành
    setTimeout(() => {
      document.body.classList.remove('dropdown-closing');
    }, 200);
  };

  // Đóng tất cả dropdown khi click ra ngoài
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      console.log(`🔥 handleClickOutside được gọi`);
      const target = event.target;
      
      // Kiểm tra nếu click vào button dropdown khác - KHÔNG ĐÓNG
      // Cho phép chuyển đổi trực tiếp giữa các dropdown
      const isClickOnDropdownButton = target.closest('[data-dropdown-trigger]');
      if (isClickOnDropdownButton) {
        console.log('🔥 Click vào dropdown button khác - KHÔNG ĐÓNG, CHO PHÉP CHUYỂN ĐỔI');
        // KHÔNG đóng dropdown, để handleDropdownOpen xử lý chuyển đổi trực tiếp
        return;
      }
      
      // Kiểm tra nếu click trong dropdown menu hiện tại
      const isClickInsideDropdown = target.closest('.MuiMenu-root') || 
                                   target.closest('[data-dropdown]') ||
                                   target.closest('[data-dropdown-trigger]');
      
      if (isClickInsideDropdown) {
        console.log('🔥 Click trong dropdown - không đóng');
        return; // Không đóng nếu click trong dropdown hiện tại
      }
      
      console.log('🔥 Click ra ngoài - đóng tất cả dropdown');
      
      // Đóng ngay lập tức khi click ra ngoài
      setDropdownAnchors({});
      
      // Thêm class để ngăn layout shift khi đóng
      document.body.classList.add('dropdown-closing');
      
      // Xóa class khi đóng tất cả dropdown
      document.body.classList.remove('dropdown-open');
      // Khôi phục scroll khi đóng tất cả dropdown
      document.body.style.overflowX = '';
      document.body.style.overflowY = '';
      document.documentElement.style.overflowX = '';
      document.documentElement.style.overflowY = '';
      
      // Xóa class dropdown-closing sau khi animation hoàn thành
      setTimeout(() => {
        document.body.classList.remove('dropdown-closing');
      }, 20);
    };

    if (Object.values(dropdownAnchors).some(anchor => anchor)) {
      console.log(`🔥 Thêm listener handleClickOutside`);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownAnchors]);
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };
  const drawer = (
    <Box sx={{ 
      width: 280, 
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      backdropFilter: 'none',
      opacity: 1
    }} role="presentation" onClick={() => setMobileOpen(false)}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 900, 
          letterSpacing: 1,
          background: 'linear-gradient(45deg, #fff, #f0f0f0)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          VocaType
        </Typography>
      </Box>
      
      <List sx={{ px: 2, py: 1 }}>
        {basicMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => {
                  console.log('Mobile main menu navigating to:', item.path);
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  sx={{ 
                    color: 'white',
                    fontWeight: isActive ? 700 : 500,
                    '& .MuiListItemText-primary': {
                      fontSize: '14px'
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        
        {/* Menu cho người dùng đã đăng nhập */}
        {user && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            {authenticatedDropdownMenus.map((menu) => (
              <div key={menu.label}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton 
                    data-dropdown-trigger
                    onClick={(e) => {
                      console.log(`🔥 Mobile sidebar click on ${menu.label}`);
                      console.log(`🔥 Menu has items:`, menu.items);
                      console.log(`🔥 Items length:`, menu.items?.length);
                      console.log(`🔥 Current dropdown state:`, dropdownAnchors);
                      
                      // Luôn mở dropdown nếu có items
                      if (menu.items && menu.items.length > 0) {
                        console.log(`🔥 Opening dropdown for ${menu.label}`);
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Đóng tất cả dropdown khác trước
                        const newDropdownAnchors = {};
                        Object.keys(dropdownAnchors).forEach(key => {
                          newDropdownAnchors[key] = false;
                        });
                        
                        // Mở dropdown hiện tại
                        newDropdownAnchors[menu.label] = true;
                        
                        console.log(`🔥 Setting new dropdown state:`, newDropdownAnchors);
                        setDropdownAnchors(newDropdownAnchors);
                        console.log(`🔥 After setting, dropdown state:`, newDropdownAnchors);
                      } else {
                        console.log(`🔥 No items, navigating to ${menu.path || '/'}`);
                        // Nếu không có dropdown, navigate trực tiếp
                        navigate(menu.path || '/');
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      background: (menu.items && menu.items.some(item => location.pathname === item.path)) || 
                                 (menu.path && location.pathname === menu.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      <menu.icon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={menu.label} 
                      sx={{ 
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiListItemText-primary': {
                          fontSize: '14px'
                        }
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
                
                {/* Dropdown items - hiển thị trên cả mobile và desktop */}
                {dropdownAnchors[menu.label] && (
                  <Box 
                    data-dropdown
                    sx={{ 
                      pl: 4, 
                      mb: 1,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 1,
                      border: '2px solid rgba(255,255,255,0.3)',
                      position: 'relative',
                      zIndex: 1000,
                      overflow: 'visible',
                      // Đảm bảo dropdown hiển thị trên mobile
                      display: 'block !important',
                      visibility: 'visible !important',
                      opacity: 1,
                      maxHeight: 'none',
                      transform: 'translateY(0)',
                      // Loại bỏ animation có thể gây conflict
                      animation: 'none !important',
                      transition: 'none !important',
                      // Thêm box shadow để dễ nhìn thấy
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      // Đảm bảo không bị ẩn
                      minHeight: '40px'
                    }}>
                    {console.log(`🔥 RENDERING DROPDOWN for ${menu.label} - Items:`, menu.items)}
                    {console.log(`🔥 Dropdown state:`, dropdownAnchors)}
                    {console.log(`🔥 Current menu label:`, menu.label)}
                    {console.log(`🔥 Should show:`, dropdownAnchors[menu.label])}
                    {menu.items?.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('🔥 Mobile dropdown item clicked:', item.label, 'path:', item.path);
                              handleDropdownClose(menu.label);
                              // Đóng sidebar trên mobile sau khi navigate
                              if (isMobile) {
                                setMobileOpen(false);
                              }
                              // Navigate đến trang ngay lập tức
                              console.log('🔥 Mobile navigating to:', item.path);
                              navigate(item.path);
                            }}
                            sx={{
                              borderRadius: 1,
                              background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.2)',
                                transform: 'translateX(4px)',
                                transition: 'all 0.3s ease'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                              <item.icon size={16} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.label} 
                              sx={{ 
                                color: 'white',
                                fontWeight: isActive ? 700 : 400,
                                '& .MuiListItemText-primary': {
                                  fontSize: '13px'
                                }
                              }} 
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </Box>
                )}
              </div>
            ))}
          </>
        )}
        
        {/* Removed Create Set and Assignment menu items for teacher */}
        
        {!user && (
          <>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => {
                  console.log('Mobile navigating to login');
                  navigate('/login');
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  background: location.pathname === '/login' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <FaSignInAlt />
                </ListItemIcon>
                <ListItemText 
                  primary="Login" 
                  sx={{ 
                    color: 'white',
                    fontWeight: location.pathname === '/login' ? 700 : 500,
                    '& .MuiListItemText-primary': {
                      fontSize: '14px'
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => {
                  console.log('Mobile navigating to register');
                  navigate('/register');
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  background: location.pathname === '/register' ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  <FaUserPlus />
                </ListItemIcon>
                <ListItemText 
                  primary="Register" 
                  sx={{ 
                    color: 'white',
                    fontWeight: location.pathname === '/register' ? 700 : 500,
                    '& .MuiListItemText-primary': {
                      fontSize: '14px'
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      
      {user && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: 2,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
              mb: 2
            }}>
              <Avatar 
                src={user.avatar_url || undefined} 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  mr: 2,
                  border: '2px solid rgba(255,255,255,0.3)'
                }} 
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px'
                }}>
                  {user.role || 'learner'}
                </Typography>
              </Box>
            </Box>
            <Button 
              fullWidth
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1
              }}
            >
              Logout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, mb: 0 }}>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
            opacity: 0.6
          }
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ 
              mr: 2, 
              display: { xs: 'flex', md: 'none' },
              background: 'rgba(255,255,255,0.2)',
              '&:hover': {
                background: 'rgba(255,255,255,0.2)',
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit', 
              fontWeight: 900, 
              letterSpacing: 1,
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
          >
            VocaType
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {basicMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button 
                  key={item.label} 
                  color="inherit" 
                  component={RouterLink} 
                  to={item.path} 
                  startIcon={<item.icon />}
                  sx={{ 
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
            
            {/* Menu cho người dùng đã đăng nhập */}
            {user && authenticatedDropdownMenus
            .filter(menu => !(menu.hideOnDesktop && !isMobile))
            .map((menu) => (
              <Box key={menu.label} sx={{ position: 'relative' }}>

                <Button 
                  color="inherit" 
                  startIcon={<menu.icon />}
                  data-dropdown-trigger
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDropdownOpen(e, menu.label);
                  }}
                  sx={{ 
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {menu.label}
                </Button>
                
                {/* Dropdown Menu - chỉ hiển thị trên desktop, ẩn trên mobile */}
                {!isMobile && (
                <Menu
                  anchorEl={dropdownAnchors[menu.label]}
                  open={Boolean(dropdownAnchors[menu.label])}
                  onClose={() => {
                    // Kiểm tra nếu đang chuyển đổi thì không đóng
                    if (isTransitioningRef.current) {
                      console.log('🔥 Đang chuyển đổi - không đóng menu');
                      return;
                    }
                    
                    // Kiểm tra nếu có dropdown khác đang mở thì không đóng
                    const hasOtherDropdownOpen = Object.keys(dropdownStateRef.current).some(key => 
                      key !== menu.label && dropdownStateRef.current[key] !== null
                    );
                    
                    if (hasOtherDropdownOpen) {
                      console.log('🔥 Có dropdown khác đang mở - không đóng menu này');
                      return;
                    }
                    
                    handleDropdownClose(menu.label);
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      // Cải thiện positioning cho mobile
                      position: 'fixed !important',
                      zIndex: 9999,
                      maxHeight: '80vh',
                      overflowY: 'auto',
                      // Loại bỏ animation conflict
                      transition: 'opacity 0.2s ease, transform 0.2s ease !important',
                      animation: 'none !important',
                      // Đảm bảo menu không bị cắt trên mobile
                      ...(isMobile && {
                        left: '10px !important',
                        right: '10px !important',
                        width: 'auto !important',
                        minWidth: '200px !important',
                        maxWidth: 'calc(100vw - 20px) !important',
                        top: '60px !important',
                        position: 'fixed !important'
                      })
                    }
                  }}
                  className="dropdown-menu"
                  transformOrigin={{ 
                    horizontal: isMobile ? 'right' : 'left', 
                    vertical: 'top' 
                  }}
                  anchorOrigin={{ 
                    horizontal: isMobile ? 'right' : 'left', 
                    vertical: 'bottom' 
                  }}
                  // Cải thiện positioning cho mobile
                  disableScrollLock={false}
                  disablePortal={false}
                >
                  {menu.items?.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <MenuItem 
                        key={item.label}
                        onClick={() => {
                          console.log('Desktop navigating to:', item.path);
                          handleDropdownClose(menu.label);
                          navigate(item.path);
                        }}
                        sx={{
                          px: 2,
                          py: 1,
                          color: isActive ? '#6366f1' : '#374151',
                          fontWeight: isActive ? 600 : 400,
                          '&:hover': {
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1'
                          },
                          '& .MuiListItemIcon-root': {
                            color: isActive ? '#6366f1' : '#6b7280',
                            minWidth: 36
                          }
                        }}
                      >
                        <ListItemIcon>
                          <item.icon size={16} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '14px'
                            }
                          }}
                        />
                      </MenuItem>
                    );
                  })}
                </Menu>
                )}
              </Box>
            ))}
            
            {/* Teacher Dashboard Button */}
            {user && user.role === 'teacher' && (
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/teacher" 
                startIcon={<FaPlus />}
                sx={{ 
                  ml: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Quản lý đề thi
              </Button>
            )}

            {/* Move Blog to the end after stats (separate button) */}
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/blog" 
              startIcon={<FaBook />}
              sx={{ 
                fontWeight: location.pathname === '/blog' ? 700 : 500,
                background: location.pathname === '/blog' ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Blog
            </Button>
            
            {!user && [
              <Button 
                key="login" 
                color="inherit" 
                component={RouterLink} 
                to="/login" 
                startIcon={<FaSignInAlt />}
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>,
              <Button 
                key="register" 
                variant="contained" 
                component={RouterLink} 
                to="/register" 
                startIcon={<FaUserPlus />}
                sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #6d28d9)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
            ]}
          </Box>
          
          {user && (
            <>
              <NotificationBell />
              <IconButton 
                onClick={handleMenu} 
                color="inherit" 
                sx={{ 
                  ml: 2,
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Avatar 
                  src={user.avatar_url || undefined} 
                  sx={{ 
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    minWidth: 240,
                    p: 1
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}>
                  <Avatar src={user.avatar_url || undefined} sx={{ width: 36, height: 36 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '14px', lineHeight: 1.1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user.name}
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user.email || (user.role || 'learner')}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <MenuItem 
                  onClick={() => {
                    navigate('/profile');
                    handleClose();
                  }}
                  sx={{
                    color: '#374151',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(59, 130, 246, 0.1)',
                      transition: 'all 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FaUser size={16} />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem 
                    onClick={() => {
                      navigate('/admin');
                      handleClose();
                    }}
                    sx={{
                      color: '#374151',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(59, 130, 246, 0.1)',
                        transition: 'all 0.3s ease'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FaTools size={16} />
                    </ListItemIcon>
                    Admin
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    color: '#ef4444',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'rgba(239, 68, 68, 0.1)',
                      transition: 'all 0.3s ease'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backdropFilter: 'none',
            opacity: 1
          }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* CSS Animation cho dropdown từ trái qua phải */}
      <style>{`
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
        
        /* Ghi đè animation mặc định của Material-UI */
        .MuiMenu-root .MuiPaper-root {
          animation: slideInLeft 0.3s ease forwards !important;
        }
        
        /* CSS đã được chuyển vào index.css để tránh xung đột */
      `}</style>
    </Box>
  );
} 
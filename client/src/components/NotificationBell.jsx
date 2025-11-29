import React, { useEffect, useState, useContext } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Fade } from '@mui/material';
import notificationSound from '../assets/audio/notification.mp3';
import { styled } from '@mui/material/styles';
import { fetchWithAuth } from '../utils/authUtils';

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [badgeKey, setBadgeKey] = useState(0);
  const navigate = useNavigate();

  const reloadNotifications = async () => {
    if (!user) return;
    
    try {
      const response = await fetchWithAuth('/api/notification');
      if (!response) return; // Token was invalid, page will reload
      
      const data = await response.json();
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.warn('Notifications API returned non-array data:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    reloadNotifications();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    window.addEventListener('focus', reloadNotifications);
    return () => window.removeEventListener('focus', reloadNotifications);
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5050', { transports: ['websocket'] });
    socket.on('notification', (data) => {
      if (data.user_id === user.id) {
        reloadNotifications();
        // Phát âm thanh
        const audio = new Audio(notificationSound);
        audio.play();
        // Hiện popup
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('VocaType', { body: 'Bạn có thông báo mới!' });
        } else if (window.Notification && Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('VocaType', { body: 'Bạn có thông báo mới!' });
            }
          });
        }
      }
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    setBadgeKey(k => k + 1);
  }, [Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.is_read).length : 0;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleMarkAllRead = async () => {
    await fetch('/api/notification/mark-all-read', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
    });
    reloadNotifications();
  };

  // Custom scrollable menu
  const StyledMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
      maxHeight: 340,
      minWidth: 320,
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: '#2563eb #e0e7ff',
    },
    '& .MuiMenuItem-root': {
      whiteSpace: 'normal',
      wordBreak: 'break-word',
    },
    '& .MuiMenuItem-root:hover': {
      background: '#e0e7ff',
    },
    '&::-webkit-scrollbar': {
      width: 8,
      background: '#e0e7ff',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#2563eb',
      borderRadius: 8,
    },
  }));

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge
          badgeContent={unreadCount > 0 ? (
            <Fade in={!!unreadCount} key={badgeKey} timeout={400}>
              <span>{unreadCount}</span>
            </Fade>
          ) : null}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <StyledMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleMarkAllRead} style={{ fontWeight: 700, color: '#2563eb' }}>Đánh dấu tất cả đã đọc</MenuItem>
        {!Array.isArray(notifications) || notifications.length === 0 ? (
          <MenuItem disabled>Không có thông báo</MenuItem>
        ) : (
          <>
            {notifications.slice(0, 5).map(n => (
              <MenuItem 
                key={n.id} 
                style={{ 
                  fontWeight: n.is_read ? 400 : 700,
                  backgroundColor: n.is_read ? 'transparent' : '#f0f9ff'
                }} 
                onClick={async () => { 
                  handleClose(); 
                  
                  // Đánh dấu đã đọc
                  if (!n.is_read) {
                    await fetch(`/api/notification/${n.id}/mark-read`, {
                      method: 'POST',
                      headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
                    });
                  }
                  
                  // Nếu là thông báo đề thi mới, chuyển đến trang ngân hàng đề thi
                  if (n.type === 'new_test_bank') {
                    navigate('/question-bank');
                  } else {
                    navigate(`/notification/${n.id}`);
                  }
                  
                  setTimeout(reloadNotifications, 500); 
                }}
              >
                {n.type === 'assignment' && n.content.includes('lớp:') ? (
                  <span>
                    Bạn có bài tập mới từ lớp:
                    <span style={{color:'#22c55e',fontWeight:700}}>
                      {n.content.split('lớp:')[1]?.replace('!','').trim()}
                    </span>!
                  </span>
                ) : n.type === 'new_test_bank' ? (
                  <span>
                    📚 <span style={{color:'#2563eb',fontWeight:700}}>Đề thi mới:</span> {n.message || n.content}
                  </span>
                ) : n.type === 'test_approved' ? (
                  <span>
                    ✅ <span style={{color:'#22c55e',fontWeight:700}}>Đã duyệt:</span> {n.message || n.content}
                  </span>
                ) : (
                  n.message || n.content
                )}
              </MenuItem>
            ))}
            {Array.isArray(notifications) && notifications.length > 5 && (
              <MenuItem onClick={() => { handleClose(); navigate('/notification'); }} style={{ color: '#2563eb', fontWeight: 700, textAlign: 'center', justifyContent: 'center' }}>
                Xem tất cả thông báo
              </MenuItem>
            )}
          </>
        )}
      </StyledMenu>
    </>
  );
} 
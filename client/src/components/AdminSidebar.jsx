import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Quiz as QuizIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  MenuOpen as MenuOpenIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

const menuItems = [
  { id: 0, label: 'Tổng quan', icon: DashboardIcon, color: '#3b82f6' },
  { id: 1, label: 'Người dùng', icon: PeopleIcon, color: '#22c55e' },
  { id: 2, label: 'Nội dung', icon: BookIcon, color: '#8b5cf6' },
  { id: 3, label: 'Ngân hàng đề', icon: QuizIcon, color: '#f59e0b' },
  { id: 4, label: 'Báo cáo', icon: AnalyticsIcon, color: '#ef4444' },
  { id: 5, label: 'Cài đặt', icon: SettingsIcon, color: '#6b7280' }
];

export default function AdminSidebar({ currentTab, onTabChange, user, collapsed = false, onToggleCollapse }) {
  return (
    <Box sx={{ 
      width: collapsed ? 80 : 280, 
      height: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'width 0.25s ease'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        px: collapsed ? 1 : 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {!collapsed && (
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 900, 
              letterSpacing: 1,
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'rgba(255,255,255,0.8)'
            }}>
              Quản trị hệ thống
            </Typography>
          </Box>
        )}
        {onToggleCollapse && (
          <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn'} placement="bottom">
            <IconButton 
              size="small" 
              onClick={onToggleCollapse}
              sx={{
                color: 'white',
                background: 'rgba(255,255,255,0.12)',
                '&:hover': { background: 'rgba(255,255,255,0.2)' }
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.1)',
            mb: 1,
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <Avatar 
              src={user.avatar_url || undefined} 
              sx={{ 
                width: 40, 
                height: 40, 
                mr: collapsed ? 0 : 2,
                border: '2px solid rgba(255,255,255,0.3)'
              }} 
            />
            {!collapsed && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {user.name}
                </Typography>
                <Chip 
                  label="Admin" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '10px',
                    height: 20
                  }} 
                />
              </Box>
            )}
          </Box>
        </Box>
      )}
      
      {/* Menu Items */}
      <List sx={{ px: collapsed ? 1 : 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => onTabChange(null, item.id)}
                sx={{
                  borderRadius: 2,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: isActive ? 6 : 0,
                    height: 24,
                    borderRadius: 3,
                    backgroundColor: item.color,
                    transition: 'width 0.2s ease',
                    display: collapsed ? 'none' : 'block'
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.3s ease'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: collapsed ? 0 : 40 }}>
                  <item.icon sx={{ color: isActive ? 'white' : item.color }} />
                </ListItemIcon>
                {collapsed ? (
                  <Tooltip title={item.label} placement="right">
                    <Box sx={{ width: 0, height: 0 }} />
                  </Tooltip>
                ) : (
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
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

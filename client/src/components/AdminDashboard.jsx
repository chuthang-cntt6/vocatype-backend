import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Stat Card Component
export function StatCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15, ${color}05)`,
      border: `1px solid ${color}20`,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${color}25`
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: '50%', 
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: '#22c55e', mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
export function RecentActivity() {
  const activities = [
    {
      icon: <PersonAddIcon />,
      title: "Người dùng mới đăng ký",
      time: "5 phút trước",
      color: "#22c55e"
    },
    {
      icon: <BookIcon />,
      title: "Chủ đề mới được tạo",
      time: "1 giờ trước",
      color: "#3b82f6"
    },
    {
      icon: <AssignmentIcon />,
      title: "Bài tập được giao",
      time: "2 giờ trước",
      color: "#f59e0b"
    }
  ];

  return (
    <Card sx={{ height: 400, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Hoạt động gần đây
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: activity.color }}>
                  {activity.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.title}
                secondary={activity.time}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// Quick Stats Component
export function QuickStats({ stats }) {
  const quickStats = [
    { label: "Học viên online", value: "24" },
    { label: "Bài tập hôm nay", value: "12" },
    { label: "Từ vựng mới", value: "156" },
    { label: "Tỷ lệ hoàn thành", value: "87%" }
  ];

  return (
    <Card sx={{ height: 400, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Thống kê nhanh
        </Typography>
        <Box sx={{ mt: 2 }}>
          {quickStats.map((stat, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function AdminDashboard({ stats }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <RecentActivity />
      </Grid>
      <Grid item xs={12} md={4}>
        <QuickStats stats={stats} />
      </Grid>
    </Grid>
  );
}

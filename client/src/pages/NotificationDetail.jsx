import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Nếu có id: xem chi tiết, không thì list
  useEffect(() => {
    setLoading(true);
    setError('');
    if (id) {
      fetch(`/api/notification/${id}`, {
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
      })
        .then(r => r.json())
        .then(data => {
          setDetail(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Không thể tải chi tiết thông báo');
          setLoading(false);
        });
    } else {
      fetch('/api/notification', {
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') }
      })
        .then(r => r.json())
        .then(data => {
          setNotifications(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Không thể tải danh sách thông báo');
          setLoading(false);
        });
    }
  }, [id, location.key]);

  if (loading) return <div style={{textAlign:'center',marginTop:60}}>Đang tải...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:60}}>{error}</div>;

  // Hiển thị danh sách
  if (!id) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', mt: 6 }}>
        <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
          Danh sách thông báo
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {notifications.length === 0 && (
            <Typography>Không có thông báo nào.</Typography>
          )}
          {notifications.map(n => (
            <Card key={n.id} sx={{ boxShadow: 4, borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 8, background: '#f1f5f9' } }} onClick={() => navigate(`/notification/${n.id}`)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={n.type} color="info" />
                <Typography variant="body1" fontWeight={n.is_read ? 400 : 700} sx={{ flex: 1 }}>{n.content}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(n.created_at).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Button variant="contained" color="primary" sx={{ mt: 4 }} onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </Box>
    );
  }

  // Hiển thị chi tiết
  if (!detail) return null;
  const { notification, assignment } = detail || {};
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Card sx={{ boxShadow: 6, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={800} color="primary" gutterBottom>
            Thông báo
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{notification?.content || 'Không có nội dung thông báo.'}</Typography>
          <Chip label={notification?.type || ''} color="info" sx={{ mb: 2 }} />
          {assignment && (
            <Box sx={{ mt: 3, p: 2, background: '#f1f5f9', borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} color="secondary" gutterBottom>
                Bài tập mới: {assignment?.title || 'Không có tiêu đề'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Chủ đề: <b>{assignment?.topic_title || '---'}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Lớp: <b>{assignment?.class_name || '---'}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Deadline: <b>{assignment?.deadline ? new Date(assignment.deadline).toLocaleString() : '---'}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Ngày giao: <b>{assignment?.created_at ? new Date(assignment.created_at).toLocaleString() : '---'}</b>
              </Typography>
            </Box>
          )}
          <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => navigate('/notification')}>
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
} 
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

export default function ContentManagement({ topics, onNavigate }) {
  return (
    <Box>
      {/* Header with Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quản lý nội dung học tập
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onNavigate('/createset')}
          sx={{
            background: 'linear-gradient(45deg, #22c55e, #16a34a)',
            '&:hover': {
              background: 'linear-gradient(45deg, #16a34a, #15803d)'
            }
          }}
        >
          Tạo chủ đề mới
        </Button>
      </Box>

      {/* Topics Grid */}
      <Grid container spacing={3}>
        {topics.map((topic) => (
          <Grid item xs={12} sm={6} md={4} key={topic.id}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {topic.name || topic.title || `Topic #${topic.id}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Chủ đề học tập từ vựng
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Từ vựng" size="small" color="primary" variant="outlined" />
                  <Chip label="Hoạt động" size="small" color="success" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onNavigate(`/topic/${topic.id}/edit`)}
                >
                  Sửa
                </Button>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onNavigate(`/topic/${topic.id}`)}
                >
                  Xem
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onNavigate(`/topic/${topic.id}/delete`)}
                >
                  Xóa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

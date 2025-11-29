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
  Visibility as VisibilityIcon
} from '@mui/icons-material';

export default function QuestionBankManagement({ banks, onNavigate }) {
  return (
    <Box>
      {/* Header with Add Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Ngân hàng câu hỏi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onNavigate('/question-bank')}
          sx={{
            background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)'
            }
          }}
        >
          Quản lý ngân hàng đề
        </Button>
      </Box>

      {/* Banks Grid */}
      <Grid container spacing={3}>
        {banks.map((bank) => (
          <Grid item xs={12} sm={6} md={4} key={bank.id}>
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
                  {bank.title || bank.name || `Bank #${bank.id}`}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Bộ câu hỏi kiểm tra
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Câu hỏi" size="small" color="primary" variant="outlined" />
                  <Chip label="Thi thử" size="small" color="warning" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => onNavigate(`/question-bank/${bank.id}`)}
                >
                  Xem
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onNavigate(`/question-bank/${bank.id}/edit`)}
                >
                  Sửa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

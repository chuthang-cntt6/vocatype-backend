import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField
} from '@mui/material';

export default function SystemSettings() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Cài đặt hệ thống
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Cài đặt chung
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Tên hệ thống
                </Typography>
                <TextField fullWidth defaultValue="VocaType" />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Mô tả hệ thống
                </Typography>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={3}
                  defaultValue="Hệ thống học từ vựng tiếng Anh thông minh"
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button variant="contained">Lưu cài đặt</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Bảo trì hệ thống
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                  Sao lưu dữ liệu
                </Button>
                <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                  Làm sạch cache
                </Button>
                <Button variant="outlined" fullWidth color="warning">
                  Khởi động lại hệ thống
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

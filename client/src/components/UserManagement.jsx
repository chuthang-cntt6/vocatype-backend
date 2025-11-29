import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function UserManagement({ 
  users, 
  search, 
  setSearch, 
  roleFilter, 
  setRoleFilter, 
  onRefresh, 
  onRoleChange, 
  onDeleteUser 
}) {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'teacher': return '#3b82f6';
      case 'learner': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'learner': return 'Học viên';
      default: return role;
    }
  };

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Tìm kiếm người dùng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Vai trò</InputLabel>
          <Select
            value={roleFilter}
            label="Vai trò"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="learner">Học viên</MenuItem>
            <MenuItem value="teacher">Giáo viên</MenuItem>
            <MenuItem value="admin">Quản trị viên</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Làm mới
        </Button>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(45deg, #f8fafc, #f1f5f9)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Người dùng</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    sx={{
                      backgroundColor: `${getRoleColor(user.role)}15`,
                      color: getRoleColor(user.role),
                      fontWeight: 600,
                      border: `1px solid ${getRoleColor(user.role)}30`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={user.role}
                        onChange={(e) => onRoleChange(user.id, e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="learner">Học viên</MenuItem>
                        <MenuItem value="teacher">Giáo viên</MenuItem>
                        <MenuItem value="admin">Quản trị viên</MenuItem>
                      </Select>
                    </FormControl>
                    <Tooltip title="Xóa người dùng">
                      <IconButton
                        color="error"
                        onClick={() => onDeleteUser(user.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

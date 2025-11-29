// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const api = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  validateToken: `${API_BASE_URL}/api/auth/validate-token`,
  googleAuth: `${API_BASE_URL}/api/auth/google`,
  facebookAuth: `${API_BASE_URL}/api/auth/facebook`,
  
  // User endpoints
  getCurrentUser: `${API_BASE_URL}/api/auth/users/me`,
  updateProfile: `${API_BASE_URL}/api/auth/users/profile`,
  
  // Vocabulary endpoints
  getVocab: `${API_BASE_URL}/api/vocab`,
  
  // Other endpoints
  notifications: `${API_BASE_URL}/api/notification`,
  learnerDashboard: `${API_BASE_URL}/api/learner`,
  teacherLeaderboard: `${API_BASE_URL}/api/teacher/leaderboard`,
};

export default api;

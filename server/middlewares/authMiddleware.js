// authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'supersecret123';
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// roleMiddleware.js
exports.only = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ error: 'Không có quyền truy cập' });
  next();
};

// roleMiddleware cho phép kiểm tra role động
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Middleware kiểm tra role của user
exports.roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Vui lòng đăng nhập' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - Bạn không có quyền thực hiện hành động này' });
    }

    next();
  };
};

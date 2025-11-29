// authController.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!user.rows.length) return res.status(404).json({ error: 'Email không tồn tại' });

  // Kiểm tra cả password_hash và password (để tương thích với database cũ)
  const passwordField = user.rows[0].password_hash || user.rows[0].password;
  const match = await bcrypt.compare(password, passwordField);
  if (!match) return res.status(401).json({ error: 'Sai mật khẩu' });

  const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET || 'supersecret123');
  res.json({ token, user: user.rows[0] });
}; 

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, school_name, specialty, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tạo user trước, chưa set avatar_url
    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, role',
      [name, email, hashedPassword, role]
    );
    const userId = userResult.rows[0].id;
    // Tạo avatar_url mặc định riêng biệt cho từng user
    const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&v=${userId}`;
    await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar_url, userId]);
    // Nếu là giáo viên, tự động thêm vào bảng teacher với thông tin chi tiết
    let teacherInfo = null;
    if (role === 'teacher') {
      await db.query(
        'INSERT INTO teacher (user_id, school_name, specialty, bio) VALUES ($1, $2, $3, $4)',
        [userId, school_name || '', specialty || '', bio || '']
      );
      // Lấy lại thông tin teacher vừa tạo
      const teacherRes = await db.query(
        'SELECT * FROM teacher WHERE user_id = $1',
        [userId]
      );
      teacherInfo = teacherRes.rows[0];
    }
    // Nếu là học viên, tự động thêm vào bảng learner
    if (role === 'learner') {
      await db.query(
        'INSERT INTO learner (user_id, level, exp, total_points, current_streak, last_login) VALUES ($1, 1, 0, 0, 0, NOW()) ON CONFLICT DO NOTHING',
        [userId]
      );
    }
    const user = userResult.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret123');

    // Gửi email chào mừng (không cần đợi)
    sendWelcomeEmail(email, name).catch(console.error);

    res.status(201).json({ token, user: { ...user, teacher: teacherInfo } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server hoặc email đã tồn tại', detail: err.message });
  }
};

// Cập nhật thông tin user
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Cập nhật tên và email
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Chỉ cập nhật avatar_url nếu user chưa có avatar tùy chỉnh (không phải từ ui-avatars.com)
    const currentUser = result.rows[0];
    if (!currentUser.avatar_url || currentUser.avatar_url.includes('ui-avatars.com')) {
      const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&v=${userId}`;
      await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar_url, userId]);
      currentUser.avatar_url = avatar_url;
    }

    res.json({ message: 'Profile updated successfully', user: currentUser });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// Forgot Password (cập nhật với JWT)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email là bắt buộc' });
    }

    // Kiểm tra user tồn tại (nhưng không lộ thông tin - luôn return success)
    const userQuery = await db.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(200).json({ message: 'Nếu email tồn tại, link reset đã được gửi.' });
    }

    const userId = userQuery.rows[0].id;

    // Tạo token JWT (expire 1h)
    const resetToken = jwt.sign(
      { userId, email },
      process.env.JWT_RESET_SECRET || 'your-reset-secret-key',
      { expiresIn: '1h' }
    );

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // Lưu token vào database (update nếu tồn tại)
    await db.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3) ' +
      'ON CONFLICT (email) DO UPDATE SET token = $2, expires_at = $3',
      [email, resetToken, expiresAt]
    );

    console.log(`Reset token generated for ${email}: ${resetToken.substring(0, 20)}...`); // Debug log

    // Gửi email nếu có config
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendPasswordResetEmail(email, resetToken);
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Không error cho user, nhưng log để debug
      }
    } else {
      console.warn('SMTP not configured - Token for debug:', resetToken);
    }

    res.json({ message: 'Nếu email tồn tại, link reset đã được gửi.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Lỗi server. Vui lòng thử lại.' });
  }
};

// Validate Reset Token (cập nhật với JWT)
exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token là bắt buộc' });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_RESET_SECRET || 'your-reset-secret-key');

    // Kiểm tra trong DB
    const resetRecord = await db.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (!resetRecord.rows.length) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    res.json({ message: 'Token hợp lệ' });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Reset Password (cập nhật với JWT verify)
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token và mật khẩu là bắt buộc' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'your-reset-secret-key');

    // Kiểm tra trong DB
    const resetRecord = await db.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW() AND email = $2',
      [token, decoded.email]
    );

    if (!resetRecord.rows.length) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, decoded.email]
    );

    // Xóa token đã sử dụng
    await db.query('DELETE FROM password_resets WHERE token = $1', [token]);

    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ error: 'Token không hợp lệ hoặc lỗi server' });
  }
};

// Google OAuth (giữ nguyên)
exports.googleAuth = (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
    `scope=profile email&` +
    `response_type=code&` +
    `access_type=offline`;
  
  res.redirect(googleAuthUrl);
};

exports.googleAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userResponse.json();

    // Check if user exists
    let user = await db.query('SELECT * FROM users WHERE email = $1', [googleUser.email]);
    
    if (!user.rows.length) {
      // Create new user
      const newUser = await db.query(
        'INSERT INTO users (name, email, avatar_url, role, oauth_provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [googleUser.name, googleUser.email, googleUser.picture, 'learner', 'google']
      );
      user = newUser;
      
      // Add to learner table
        await db.query(
        'INSERT INTO learner (user_id, level, exp, total_points, current_streak, last_login) VALUES ($1, 1, 0, 0, 0, NOW())',
        [user.rows[0].id]
      );
    }

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET || 'supersecret123');
    
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user.rows[0]))}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// Facebook OAuth (giữ nguyên)
exports.facebookAuth = (req, res) => {
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${process.env.FACEBOOK_APP_ID}&` +
    `redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&` +
    `scope=email&` +
    `response_type=code`;
  
  res.redirect(facebookAuthUrl);
};

exports.facebookAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=token_failed`);
    }

    // Get user info from Facebook
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
    const facebookUser = await userResponse.json();

    // Check if user exists
    let user = await db.query('SELECT * FROM users WHERE email = $1', [facebookUser.email]);
    
    if (!user.rows.length) {
      // Create new user
      const newUser = await db.query(
        'INSERT INTO users (name, email, avatar_url, role, oauth_provider) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [facebookUser.name, facebookUser.email, facebookUser.picture?.data?.url, 'learner', 'facebook']
      );
      user = newUser;
      
      // Add to learner table
        await db.query(
        'INSERT INTO learner (user_id, level, exp, total_points, current_streak, last_login) VALUES ($1, 1, 0, 0, 0, NOW())',
        [user.rows[0].id]
      );
    }

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET || 'supersecret123');
    
    res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user.rows[0]))}`);
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};
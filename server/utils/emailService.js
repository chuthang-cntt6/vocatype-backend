require('dotenv').config();
const nodemailer = require('nodemailer');

// Cấu hình email transporter
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true cho 465, false cho port khác
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Verify connection configuration
console.log('🔍 Checking email service configuration...');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Not set');

if (transporter) {
  console.log('📧 Verifying SMTP connection...');
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email service error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('⚠️ Email service not configured - missing SMTP credentials');
}

const sendPasswordResetEmail = async (email, resetToken) => {
  if (!transporter) {
    throw new Error('Email service not configured - missing SMTP credentials');
  }
  
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'VocaType',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Đặt Lại Mật Khẩu - VocaType',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt Lại Mật Khẩu</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; font-weight: 900; color: white;">V</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">VocaType</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Đặt Lại Mật Khẩu</h2>
              <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản VocaType. 
                <br />
                Nhấn nút bên dưới để tạo mật khẩu mới.
              </p>
              
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                Đặt Lại Mật Khẩu
              </a>
              
              <div style="margin-top: 32px; padding: 20px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #6366f1;">
                <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Lưu ý:</strong> Link này chỉ có hiệu lực trong 1 giờ.
                  <br />
                  Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">
                Nếu nút trên không hoạt động, copy link sau vào trình duyệt:
              </p>
              <p style="color: #6366f1; font-size: 14px; margin: 0 0 20px 0; word-break: break-all; background: #f1f5f9; padding: 12px; border-radius: 6px;">
                ${resetUrl}
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 VocaType. Hệ thống học từ vựng thông minh.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Không thể gửi email');
  }
};

const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    console.log('⚠️ Email service not configured - skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const mailOptions = {
      from: {
        name: 'VocaType',
        address: process.env.SMTP_USER
      },
      to: email,
      subject: 'Chào Mừng Đến Với VocaType!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Chào Mừng Đến Với VocaType</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px; font-weight: 900; color: white;">V</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800;">VocaType</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">Chào Mừng ${name}!</h2>
              <p style="color: #64748b; margin: 0 0 24px 0; line-height: 1.6; font-size: 16px;">
                Cảm ơn bạn đã đăng ký tài khoản VocaType. 
                <br />
                Bây giờ bạn có thể bắt đầu hành trình nâng cao từ vựng của mình.
              </p>
              
              <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #0284c7;">
                <h3 style="color: #0c4a6e; margin: 0 0 12px 0; font-size: 18px;">✨ Tính Năng Chính</h3>
                <div style="text-align: left; color: #0369a1;">
                  <p style="margin: 8px 0;">🎯 Học thông minh với flashcard</p>
                  <p style="margin: 8px 0;">📊 Theo dõi tiến độ học tập</p>
                  <p style="margin: 8px 0;">🏆 Thành tích và phần thưởng</p>
                  <p style="margin: 8px 0;">⚡ Luyện gõ nhanh</p>
                </div>
              </div>
              
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                Bắt Đầu Học Ngay
              </a>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © 2024 VocaType. Hệ thống học từ vựng thông minh.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to: ${email}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    // Không throw error vì đây không phải critical function
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  transporter
};

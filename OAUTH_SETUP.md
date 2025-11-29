# Hướng Dẫn Cấu Hình OAuth và Email

## 1. Cấu Hình Email (Gmail)

### Bước 1: Tạo App Password cho Gmail
1. Vào [Google Account Settings](https://myaccount.google.com/)
2. Chọn **Security** → **2-Step Verification** (bật nếu chưa có)
3. Chọn **App passwords**
4. Chọn **Mail** và **Other (Custom name)**
5. Nhập tên: "VocaType App"
6. Copy password được tạo (16 ký tự)

### Bước 2: Cấu hình .env
Tạo file `.env` trong thư mục `server/` với nội dung:

```env
# Database
DATABASE_URL=postgres://username:password@localhost:5432/vocatype_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=5050

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

## 2. Cấu Hình Google OAuth

### Bước 1: Tạo Google OAuth App
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Chọn **Web application**
6. Đặt tên: "VocaType OAuth"
7. Thêm **Authorized redirect URIs**:
   - `http://localhost:5050/api/auth/google/callback`
   - `http://localhost:3000` (cho development)

### Bước 2: Cập nhật .env
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5050/api/auth/google/callback
```

## 3. Cấu Hình Facebook OAuth

### Bước 1: Tạo Facebook App
1. Vào [Facebook Developers](https://developers.facebook.com/)
2. Click **Create App** → **Consumer** → **Next**
3. Điền thông tin:
   - App Name: "VocaType"
   - App Contact Email: your_email@gmail.com
4. Vào **Facebook Login** → **Settings**
5. Thêm **Valid OAuth Redirect URIs**:
   - `http://localhost:5050/api/auth/facebook/callback`

### Bước 2: Cập nhật .env
```env
# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:5050/api/auth/facebook/callback
```

## 4. Chạy Ứng Dụng

### Backend
```bash
cd server
npm install
node index.js
```

### Frontend
```bash
cd client
npm install
npm start
```

## 5. Kiểm Tra

1. Truy cập `http://localhost:3000/login`
2. Thấy nút "Đăng nhập với Google" và "Đăng nhập với Facebook"
3. Click "Quên mật khẩu?" để test chức năng reset password
4. Kiểm tra email có nhận được email reset không

## 6. Troubleshooting

### Lỗi Email
- Kiểm tra App Password đúng chưa
- Đảm bảo 2-Step Verification đã bật
- Kiểm tra SMTP settings

### Lỗi OAuth
- Kiểm tra redirect URI đúng chưa
- Đảm bảo Client ID/Secret đúng
- Kiểm tra domain được add vào authorized domains

### Lỗi Database
- Chạy migration: `node server/migrate.js`
- Kiểm tra DATABASE_URL đúng chưa
- Đảm bảo PostgreSQL đang chạy

## 7. Production

Khi deploy lên production, cần:
1. Thay đổi CLIENT_URL thành domain thật
2. Cập nhật redirect URIs trong Google/Facebook console
3. Sử dụng HTTPS
4. Cấu hình environment variables trên hosting platform

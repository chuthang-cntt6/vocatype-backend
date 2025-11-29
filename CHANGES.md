# CHANGES.md - Thay đổi từ SessionStorage sang LocalStorage

## Tổng quan
Đã thực hiện thay đổi từ `sessionStorage` sang `localStorage` để giải quyết vấn đề phải đăng nhập lại mỗi khi restart ứng dụng. Đồng thời thêm tính năng "Remember Me" để cải thiện trải nghiệm người dùng.

## Các file đã thay đổi

### 1. **client/src/context/AuthContext.jsx**
**Thay đổi:**
- `sessionStorage.getItem('user')` → `localStorage.getItem('user')`
- `sessionStorage.setItem('user', ...)` → `localStorage.setItem('user', ...)`
- `sessionStorage.removeItem('user')` → `localStorage.removeItem('user')`
- `sessionStorage.removeItem('token')` → `localStorage.removeItem('token')`

**Lý do:** Đây là file quản lý authentication context chính, cần thay đổi để sử dụng localStorage thay vì sessionStorage.

### 2. **client/src/utils/authUtils.js**
**Thay đổi:**
- `sessionStorage.removeItem('token')` → `localStorage.removeItem('token')`
- `sessionStorage.removeItem('user')` → `localStorage.removeItem('user')`
- `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

**Lý do:** File utility xử lý authentication, cần đồng bộ với AuthContext.

### 3. **client/src/pages/Login.jsx**
**Thay đổi:**
- Thêm state `rememberMe` và logic xử lý
- Thêm useEffect để load saved credentials
- `sessionStorage.setItem('token', token)` → `localStorage.setItem('token', token)`
- Thêm logic lưu/load email khi Remember Me được chọn
- Thêm checkbox "Ghi nhớ đăng nhập" trong UI

**Tính năng mới:**
- Checkbox "Ghi nhớ đăng nhập" 
- Tự động load email đã lưu khi Remember Me = true
- Lưu email vào localStorage khi Remember Me được chọn

### 4. **client/src/pages/Admin.jsx**
**Thay đổi:**
- `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

### 5. **client/src/pages/QuestionBank.jsx**
**Thay đổi:**
- Tất cả `sessionStorage.getItem('token')` → `localStorage.getItem('token')`
- Tất cả `sessionStorage.clear()` → `localStorage.clear()`

### 6. **client/src/pages/Profile.jsx**
**Thay đổi:**
- Tất cả `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

### 7. **client/src/pages/TypingPractice.jsx**
**Thay đổi:**
- `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

### 8. **client/src/components/NotificationBell.jsx**
**Thay đổi:**
- `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

### 9. **client/src/pages/AssignmentPage.jsx**
**Thay đổi:**
- Tất cả `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

### 10. **client/src/pages/NotificationDetail.jsx**
**Thay đổi:**
- Tất cả `sessionStorage.getItem('token')` → `localStorage.getItem('token')`

## Lợi ích của thay đổi

### 1. **Giải quyết vấn đề chính**
- ✅ Không cần đăng nhập lại mỗi khi restart ứng dụng
- ✅ Token và user data được lưu trữ lâu dài
- ✅ Trải nghiệm người dùng tốt hơn

### 2. **Tính năng Remember Me**
- ✅ Checkbox "Ghi nhớ đăng nhập" trong form login
- ✅ Tự động load email đã lưu
- ✅ Lưu email khi user chọn Remember Me

### 3. **Tương thích ngược**
- ✅ Không ảnh hưởng đến logic authentication hiện tại
- ✅ JWT token vẫn hoạt động bình thường
- ✅ OAuth login vẫn hoạt động

## Lưu ý bảo mật

### 1. **LocalStorage vs SessionStorage**
- **LocalStorage**: Dữ liệu tồn tại lâu dài, chỉ bị xóa khi user xóa thủ công
- **SessionStorage**: Dữ liệu chỉ tồn tại trong phiên làm việc hiện tại

### 2. **Token Security**
- JWT token vẫn có thời gian hết hạn (expire time)
- Token sẽ tự động invalid khi hết hạn
- User vẫn cần đăng nhập lại khi token hết hạn

### 3. **Remember Me Security**
- Chỉ lưu email, không lưu password
- User vẫn cần nhập password mỗi lần đăng nhập
- Có thể tắt Remember Me bất kỳ lúc nào

## Cách test

### 1. **Test cơ bản**
1. Đăng nhập với Remember Me = true
2. Đóng trình duyệt
3. Mở lại ứng dụng
4. Kiểm tra email đã được load tự động
5. Đăng nhập và kiểm tra không cần đăng nhập lại khi restart

### 2. **Test Remember Me**
1. Đăng nhập với Remember Me = true
2. Logout
3. Mở lại trang login
4. Kiểm tra email đã được điền sẵn
5. Đăng nhập với Remember Me = false
6. Logout và kiểm tra email không được lưu

### 3. **Test OAuth**
1. Đăng nhập bằng Google/Facebook
2. Kiểm tra token được lưu vào localStorage
3. Restart ứng dụng và kiểm tra vẫn đăng nhập

## Kết luận

Thay đổi này giải quyết hoàn toàn vấn đề phải đăng nhập lại mỗi khi restart ứng dụng, đồng thời cải thiện trải nghiệm người dùng với tính năng Remember Me. Tất cả các thay đổi đều tương thích ngược và không ảnh hưởng đến logic authentication hiện tại.

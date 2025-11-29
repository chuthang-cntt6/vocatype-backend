# Giao diện Quản trị Admin - VocaType

## Tổng quan
Giao diện quản trị admin được thiết kế hiện đại với Material-UI, cung cấp đầy đủ các tính năng quản lý hệ thống VocaType.

## Cấu trúc Components

### 1. Admin.jsx (Main Component)
- Component chính chứa logic và state management
- Quản lý tabs và navigation
- Xử lý API calls và data fetching

### 2. AdminDashboard.jsx
- **StatCard**: Hiển thị thống kê với icon và trend
- **RecentActivity**: Danh sách hoạt động gần đây
- **QuickStats**: Thống kê nhanh hệ thống
- **AdminDashboard**: Component chính kết hợp các phần trên

### 3. UserManagement.jsx
- Quản lý người dùng với tìm kiếm và lọc
- Thay đổi vai trò người dùng
- Xóa người dùng
- Hiển thị thông tin chi tiết

### 4. ContentManagement.jsx
- Quản lý chủ đề học tập (topics)
- Tạo, sửa, xóa topics
- Hiển thị dạng card grid

### 5. QuestionBankManagement.jsx
- Quản lý ngân hàng câu hỏi
- Tạo, sửa, xem question banks
- Interface thân thiện với người dùng

### 6. AnalyticsReports.jsx
- Báo cáo thống kê người dùng
- Thống kê hoạt động hệ thống
- Hiển thị dữ liệu dạng biểu đồ

### 7. SystemSettings.jsx
- Cài đặt hệ thống chung
- Bảo trì hệ thống
- Sao lưu dữ liệu

### 8. AdminSidebar.jsx
- Sidebar navigation cho admin
- Hiển thị thông tin user
- Menu items với icons

## Tính năng chính

### 📊 Dashboard
- Thống kê tổng quan hệ thống
- Hoạt động gần đây
- Metrics quan trọng

### 👥 Quản lý người dùng
- Xem danh sách tất cả người dùng
- Tìm kiếm theo tên/email
- Lọc theo vai trò (learner, teacher, admin)
- Thay đổi vai trò người dùng
- Xóa người dùng

### 📚 Quản lý nội dung
- Quản lý chủ đề học tập
- Tạo chủ đề mới
- Chỉnh sửa thông tin chủ đề
- Xóa chủ đề

### 📝 Ngân hàng đề
- Quản lý bộ câu hỏi
- Tạo câu hỏi mới
- Chỉnh sửa câu hỏi
- Xem chi tiết

### 📈 Báo cáo & Phân tích
- Thống kê người dùng theo vai trò
- Thống kê hoạt động hệ thống
- Báo cáo hiệu suất

### ⚙️ Cài đặt hệ thống
- Cài đặt tên hệ thống
- Cài đặt mô tả
- Bảo trì hệ thống
- Sao lưu dữ liệu

## Styling

### CSS Classes
- `.admin-container`: Container chính
- `.admin-header`: Header với gradient
- `.admin-stats-grid`: Grid thống kê
- `.admin-stat-card`: Card thống kê
- `.admin-tabs`: Tab container
- `.admin-table`: Bảng dữ liệu
- `.admin-card-grid`: Grid cards
- `.admin-content-card`: Card nội dung

### Color Scheme
- **Primary**: #3b82f6 (Blue)
- **Success**: #22c55e (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #ef4444 (Red)
- **Info**: #8b5cf6 (Purple)
- **Neutral**: #6b7280 (Gray)

## Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px, 1440px
- Flexible grid system
- Touch-friendly interface

## API Integration
- RESTful API calls
- Error handling
- Loading states
- Real-time updates

## Security
- Role-based access control
- Authentication required
- Admin-only features
- Secure API endpoints

## Performance
- Lazy loading components
- Optimized re-renders
- Efficient state management
- Minimal bundle size

## Usage

```jsx
import Admin from './pages/Admin';

// Sử dụng trong routing
<Route path="/admin" element={<Admin />} />
```

## Dependencies
- React 18+
- Material-UI 5+
- React Router 6+
- Axios (for API calls)

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

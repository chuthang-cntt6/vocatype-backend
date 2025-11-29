# Hệ thống Duyệt Đề Thi - Summary

## ✅ Đã hoàn thành:

### 1. **Xóa Create Set và Assignment**
- ✅ Xóa buttons khỏi navbar (desktop + mobile)
- ✅ Xóa menu items khỏi drawer

### 2. **Backend API**
- ✅ Thêm field `status` vào `question_bank` table
- ✅ API `createQuestionBank`: Teacher tạo đề → status = 'pending', gửi notification cho admin
- ✅ API `approveQuestionBank`: Admin duyệt đề → status = 'approved', notify teacher
- ✅ API `rejectQuestionBank`: Admin từ chối đề → status = 'rejected', notify teacher
- ✅ API `getPendingTests`: Admin xem danh sách đề chờ duyệt
- ✅ Update `getQuestionBanks`: Chỉ hiển thị đề đã duyệt

### 3. **Routes**
- ✅ `GET /api/question-bank/admin/pending` - Lấy danh sách đề chờ duyệt
- ✅ `POST /api/question-bank/:id/approve` - Duyệt đề
- ✅ `POST /api/question-bank/:id/reject` - Từ chối đề

### 4. **Database Schema**
```sql
ALTER TABLE question_bank ADD COLUMN:
- status VARCHAR(20) DEFAULT 'pending'
- approved_by INTEGER REFERENCES users(id)
- approved_at TIMESTAMP
- rejection_reason TEXT

CREATE TABLE notifications:
- id, user_id, type, title, message, data, is_read, created_at
```

## 🔄 Workflow:

### **Teacher tạo đề:**
1. Teacher tạo đề thi mới
2. Status = 'pending'
3. Admin nhận notification

### **Admin duyệt:**
1. Admin vào `/question-bank/admin/pending`
2. Xem danh sách đề chờ duyệt
3. Approve hoặc Reject
4. Teacher nhận notification

### **Hiển thị:**
- User thường: Chỉ thấy đề `status = 'approved'`
- Teacher: Thấy đề của mình (tất cả status)
- Admin: Thấy tất cả đề

## 📝 Cần làm tiếp:

### **Frontend:**
1. ✅ Xóa Create Set và Assignment buttons (DONE)
2. ⏳ Tạo UI cho teacher tạo đề thi (modal/page)
3. ⏳ Tạo UI cho admin duyệt đề (admin panel)
4. ⏳ Hiển thị notifications cho admin và teacher
5. ⏳ Badge hiển thị status đề thi (pending/approved/rejected)

### **Database:**
1. ⏳ Chạy migration SQL: `add_approval_system.sql`

## 🚀 Bước tiếp theo:

1. **Chạy SQL migration:**
   ```bash
   psql -U postgres -d vocatype -f add_approval_system.sql
   ```

2. **Restart backend:**
   ```bash
   node server/index.js
   ```

3. **Test APIs:**
   - Teacher tạo đề → check notification
   - Admin duyệt → check status update
   - User xem danh sách → chỉ thấy đề approved

4. **Tạo UI:**
   - Admin panel để duyệt đề
   - Teacher form để tạo đề
   - Notification bell icon

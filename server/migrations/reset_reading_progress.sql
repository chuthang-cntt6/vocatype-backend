-- Reset Reading progress (xóa tất cả bài thi cũ)
-- ⚠️ CẢNH BÁO: Lệnh này sẽ XÓA TOÀN BỘ lịch sử làm bài thi!
-- Chỉ chạy nếu bạn chắc chắn muốn reset

-- Xóa tất cả exam_attempts của user_id = 8 (hoặc thay bằng ID của bạn)
-- DELETE FROM exam_attempts WHERE user_id = 8;

-- Hoặc chỉ giữ lại 5 bài gần nhất:
-- DELETE FROM exam_attempts 
-- WHERE user_id = 8 
-- AND id NOT IN (
--   SELECT id FROM exam_attempts 
--   WHERE user_id = 8 
--   ORDER BY completed_at DESC 
--   LIMIT 5
-- );

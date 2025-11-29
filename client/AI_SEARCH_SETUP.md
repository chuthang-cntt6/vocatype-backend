# AI Search Setup Guide

## Cấu hình AI Search với Gemini 2.0

### 1. Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng Google account
3. Tạo API key mới
4. Copy API key

### 2. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `client/` với nội dung:

```env
REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Tính năng AI Search

#### Cách hoạt động:
- **Tìm kiếm thông minh**: AI sẽ tìm các từ liên quan, đồng nghĩa, và từ gần đúng
- **Fuzzy matching**: Tìm kiếm các từ có lỗi chính tả nhỏ
- **Contextual search**: Hiểu ngữ cảnh học tiếng Anh và flashcard

#### Ví dụ tìm kiếm:
- Gõ "english" → Tìm thấy "Tiếng Anh", "English", "Eng"
- Gõ "vocab" → Tìm thấy "Vocabulary", "Từ vựng", "Words"
- Gõ "toeic" → Tìm thấy "TOEIC", "Test", "Exam"
- Gõ "grammar" → Tìm thấy "Ngữ pháp", "Grammar"

#### Fallback:
- Nếu AI không hoạt động, hệ thống sẽ tự động chuyển về tìm kiếm thông thường
- Không cần cấu hình thêm gì, hệ thống sẽ hoạt động bình thường

### 4. UI Indicators

- **AI Enabled**: Search bar có background gradient và placeholder "Tìm kiếm thông minh với AI..."
- **AI Searching**: Hiển thị spinner và "AI đang tìm kiếm..."
- **AI Active**: Hiển thị icon robot và "AI" khi đang tìm kiếm
- **Normal Search**: Hoạt động như bình thường khi AI không available

### 5. Performance

- **Debounce**: 300ms delay để tránh gọi API quá nhiều
- **Caching**: Kết quả AI được cache trong session
- **Error Handling**: Tự động fallback khi có lỗi

### 6. Troubleshooting

#### AI không hoạt động:
1. Kiểm tra API key trong `.env`
2. Kiểm tra kết nối internet
3. Kiểm tra console log để xem lỗi

#### Performance chậm:
1. API Gemini có thể chậm tùy theo region
2. Hệ thống sẽ tự động fallback sau 5 giây timeout

### 7. Customization

Có thể tùy chỉnh trong `client/src/services/aiService.js`:
- `temperature`: Độ sáng tạo của AI (0.0 - 1.0)
- `maxOutputTokens`: Số từ tối đa AI trả về
- `timeout`: Thời gian timeout cho API call

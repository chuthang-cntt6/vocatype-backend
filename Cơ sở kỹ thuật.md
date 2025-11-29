# Cơ sở kỹ thuật

Trong hệ thống học tiếng Anh và luyện thi TOEIC, các công nghệ trí tuệ nhân tạo (AI) đóng vai trò quan trọng trong việc nâng cao trải nghiệm người học và tự động hóa các khâu xử lý phức tạp. Ở đây, hệ thống sử dụng Google Gemini 2.0 API, một mô hình AI đa ngôn ngữ và tốc độ cao, kết hợp với các công nghệ khác để hỗ trợ năm nhóm chức năng chính:

1. **Tìm kiếm đề thi thông minh**: Hệ thống sử dụng PostgreSQL Full-text Search với pg-trgm extension kết hợp AI-assisted query expansion (Google Gemini) để giúp người học dễ dàng tìm đề thi liên quan đến từ khóa hoặc chủ đề mong muốn. Không chỉ dựa trên khớp từ khóa đơn thuần, hệ thống còn xử lý được trường hợp viết sai chính tả, mở rộng truy vấn thông minh bằng AI để tìm các đề thi liên quan theo ngữ nghĩa, và sắp xếp kết quả theo mức độ liên quan.

2. **Chấm phát âm và phân tích chi tiết**: Hệ thống sử dụng Web Speech API (SpeechRecognition) để phân tích giọng đọc realtime của người học, kết hợp với AI (Google Gemini) để so sánh với mẫu chuẩn và đưa ra phản hồi chi tiết về phát âm, ngữ điệu, nhịp điệu, cùng gợi ý cải thiện cụ thể để nâng cao kỹ năng phát âm.

3. **Tìm kiếm từ vựng thông minh**: AI (Google Gemini) hỗ trợ fuzzy matching và semantic understanding để tìm từ vựng chính xác ngay cả khi người dùng gõ sai chính tả hoặc tìm kiếm theo ngữ nghĩa, không chỉ dựa trên từ khóa chính xác. Tính năng này giúp người học dễ dàng tìm được từ vựng mong muốn một cách nhanh chóng và chính xác.

4. **Tạo câu ví dụ tự động**: AI (Google Gemini) tự động tạo câu ví dụ phù hợp với ngữ cảnh cho từ vựng, giúp người học hiểu cách sử dụng từ trong thực tế và nâng cao khả năng ghi nhớ.

5. **Tự động sửa bài Dictation và giải thích chi tiết**: AI (Google Gemini 2.0) so sánh text người học với transcript gốc, phát hiện và phân loại lỗi (chính tả, từ vựng, ngữ pháp, thiếu từ), chỉ chỗ sai, highlight lỗi, và tạo giải thích chi tiết song ngữ Anh-Việt cho từng lỗi. Khi người học làm sai, hệ thống không chỉ chỉ ra chỗ sai mà còn đưa ra lời giải thích chi tiết và gợi ý cách sửa, giúp người học hiểu rõ lỗi và cải thiện kỹ năng nghe-viết hiệu quả.


# Cơ sở lý thuyết

Đề tài dựa trên các cơ sở lý thuyết từ các nghiên cứu trước đây và một số cải tiến mới để giải quyết vấn đề học tiếng Anh và luyện thi TOEIC:

- **Phân tích và thiết kế hệ thống thông tin**: Ứng dụng các phương pháp phân tích yêu cầu và thiết kế hệ thống với các công cụ như biểu đồ UML (Unified Modeling Language), bao gồm Use Case Diagram và Class Diagram, để mô hình hóa các chức năng như quản lý người dùng, ngân hàng câu hỏi, và theo dõi tiến độ học tập. Luồng dữ liệu được sử dụng để đảm bảo tính logic trong quản lý dữ liệu và tương tác giữa các thành phần hệ thống.

- **Xử lý ngôn ngữ tự nhiên và công nghệ hỗ trợ AI**: Các giải pháp công nghệ thực tiễn được áp dụng để xây dựng các tính năng thông minh:
  • **PostgreSQL Full-text Search với pg-trgm extension kết hợp AI-assisted query expansion**: Hỗ trợ tìm kiếm đề thi theo từ khóa, hệ thống không chỉ tìm kiếm chính xác theo từ khóa mà còn xử lý được trường hợp viết sai chính tả, mở rộng truy vấn thông minh bằng AI để tìm các đề thi liên quan, và sắp xếp kết quả theo mức độ liên quan.
  • **Web Speech API kết hợp AI (Gemini) phân tích chi tiết**: Dựa trên công nghệ nhận diện giọng nói tích hợp trình duyệt (Google Chrome/Edge), phân tích giọng đọc realtime, so sánh với mẫu chuẩn và đưa ra phản hồi chi tiết về phát âm, ngữ điệu dựa trên confidence score. AI (Gemini) được tích hợp để phân tích sâu hơn, cung cấp đánh giá chi tiết về độ chính xác phát âm, nhịp điệu, và gợi ý cải thiện cụ thể.
  • **Google Gemini 2.0 API cho tìm kiếm từ vựng thông minh**: Hỗ trợ fuzzy matching và semantic understanding để tìm từ vựng chính xác ngay cả khi người dùng gõ sai chính tả hoặc tìm kiếm theo ngữ nghĩa, không chỉ dựa trên từ khóa chính xác.
  • **Google Gemini API cho tạo câu ví dụ tự động**: Tạo câu ví dụ phù hợp với ngữ cảnh cho từ vựng, giúp người học hiểu cách sử dụng từ trong thực tế.
  • **Google Gemini 2.0 API cho tự động sửa bài Dictation**: So sánh text người học với transcript gốc, phát hiện và phân loại lỗi (chính tả, từ vựng, ngữ pháp, thiếu từ), chỉ chỗ sai, highlight lỗi, và tạo giải thích chi tiết cho từng lỗi, giúp người học hiểu rõ lỗi và cách sửa.

- **Thuật toán lặp lại ngắt quãng**: Dựa trên mô hình Ebbinghaus, đề tài áp dụng thuật toán nhắc nhở ôn tập từ vựng theo các khoảng thời gian tối ưu, giúp người học ghi nhớ lâu dài.

- **Thiết kế trải nghiệm người dùng**: Dựa trên nghiên cứu về hành vi người dùng, ứng dụng được thiết kế với giao diện trực quan, sử dụng màu sắc hài hòa, bố cục hợp lý, và tích hợp gamification (bảng xếp hạng, huy hiệu, điểm thưởng) để tăng động lực học tập.


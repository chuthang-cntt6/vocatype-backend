# CHƯƠNG II: PHƯƠNG PHÁP THỰC HIỆN

## 2.1. Các yêu cầu kỹ thuật

### 2.1.1. Yêu cầu chức năng

#### ✅ Quản lý người dùng
Hệ thống hỗ trợ đăng ký tài khoản mới (với email, mật khẩu, và xác thực cơ bản), đăng nhập (sử dụng JWT token để bảo mật), và quản lý hồ sơ cá nhân (cập nhật thông tin, thay đổi mật khẩu). Phân quyền rõ ràng:
- **Người học (User)**: Có quyền truy cập nội dung học tập
- **Giảng viên (Teacher)**: Có quyền tạo và quản lý đề thi
- **Quản trị hệ thống (Admin)**: Có quyền duyệt nội dung và quản lý người dùng

#### ✅ Học từ vựng
Cung cấp các topic (chủ đề) học từ vựng với các từ được tổ chức theo chương, kèm theo:
- Phiên âm, audio chuẩn
- Nghĩa tiếng Việt
- Câu ví dụ tiếng Anh và tiếng Việt
- Hình ảnh minh họa

#### ✅ Flashcards
Người dùng có thể:
- Học từ vựng theo chế độ flashcard (lật thẻ)
- Hệ thống theo dõi từ chưa nhớ để ôn lại
- Hiển thị điểm số, streak (chuỗi ngày học liên tục)
- Tự động phát âm audio khi lật thẻ
- Review mode để ôn tập lại từ chưa thuộc

#### ✅ Lộ trình học (Roadmap)
Hệ thống cung cấp sơ đồ tư duy kỹ năng và đánh giá năng lực cá nhân:

**Skill Tree (Sơ đồ kỹ năng):**
- **4 nhóm kỹ năng chính**: Listening, Reading, Speaking, Writing
- **11 skills con** với unlock requirements (điều kiện mở khóa):
  - **Listening**: Dictation → TOEIC Listening → IELTS Listening
  - **Reading**: Vocabulary → Flashcard Review → Reading Tests
  - **Speaking**: Pronunciation → Conversation
  - **Writing**: Grammar → Essay Writing
- Mỗi skill có **5 levels** (⭐⭐⭐⭐⭐)
- Progress bar màu sắc theo category
- Click vào skill → Chuyển đến trang luyện tập

**Learner Assessment (Đánh giá năng lực):**
- Hiển thị **Level tổng thể** (1-10+) và **XP progress**
- Phân tích **5 kỹ năng** với % hoàn thành:
  - **Vocabulary** 📚: `total_words / 500 × 100%`
  - **Listening** 🎧: `dictation_count / 50 × 100%`
  - **Reading** 📖: `reading_tests / 20 × 100%`
  - **Speaking** 🗣️: `pronunciation_score / 30 × 100%`
  - **Writing** ✍️: `grammar_exercises / 30 × 100%`
- **Điểm mạnh** (≥60%) và **Điểm yếu** (<40%) tự động xác định
- **Recommendations** (đề xuất lộ trình):
  - Ưu tiên cải thiện điểm yếu
  - Duy trì điểm mạnh
  - Mục tiêu tiếp theo rõ ràng

**Dashboard tiến độ hôm nay:**
- Số từ học hôm nay (unique words)
- Số bài Dictation đã hoàn thành
- Số flashcard đã review
- Hoạt động gần đây theo topic
- Gợi ý tiếp theo thông minh (AI-powered)

**Lưu ý kỹ thuật:**
- Backend API `/api/learner/:id/dashboard` đã được bổ sung các field:
  - `total_words`: Số từ vựng thực tế đã học (từ `learning_progress`)
  - `dictation_count`: Số bài Dictation hoàn thành
  - `flashcard_reviewed`: Số flashcard đã review
  - `reading_tests`: Số bài thi Reading đã làm
- Dữ liệu hiển thị phản ánh chính xác hoạt động học tập thực tế của người dùng

#### ✅ Thi thử (Gõ phản xạ - Typing Practice)
Người học có thể:
- **Luyện gõ tốc độ** với đoạn văn hoặc từ vựng ngẫu nhiên
- Tùy chỉnh thời gian: 30s, 60s, 120s
- Hiển thị realtime:
  - WPM (Words Per Minute)
  - Độ chính xác (Accuracy %)
  - Số từ đúng/sai
- **Lưu kết quả vào leaderboard** để xếp hạng
- Hiệu ứng đếm ngược hiện đại
- Hiển thị từng từ với màu sắc (đúng/sai/đang gõ)
- Tính điểm thưởng và badge

#### ✅ Luyện Dictation TOEIC
Tính năng nghe và điền từ theo chuẩn TOEIC Listening:
- **Chọn topic**: Short Stories, TOEIC Listening, Conversations, News, Academic, Business
- **Chọn bài tập** theo level và chủ đề
- **Nghe audio** và điền transcript (từng câu hoặc toàn bộ đoạn)
- Tùy chọn:
  - Tốc độ phát (0.5x - 2x)
  - Phát lại tự động
  - Hiển thị gợi ý
  - Xem đáp án
- **Chấm điểm tự động** với AI:
  - So sánh câu trả lời với transcript chuẩn
  - Tính điểm từng câu và tổng điểm
  - Hiển thị từ sai/đúng
- **Dịch tiếng Việt** cho từng câu
- **Tổng hợp kết quả** khi kết thúc:
  - Số câu đúng/sai
  - Điểm trung bình
  - Phân tích lỗi sai
- **Thưởng EXP** khi hoàn thành

#### ✅ Ôn tập (Review)
Hệ thống ôn tập thông minh theo lịch:
- **Lịch ôn tập tự động**: Hệ thống gợi ý từ cần ôn hôm nay
- **Spaced Repetition**: Ôn lại từ theo chu kỳ (1 ngày, 3 ngày, 7 ngày, 14 ngày)
- **Learning Summary**: Tóm tắt từ vựng đã học hôm nay
- **Review Schedule**: Xem trước từ cần ôn ngày mai
- Hiển thị điểm số (đúng/sai) sau mỗi phiên ôn tập
- Confetti effect khi hoàn thành

#### ✅ Quản lý ngân hàng đề thi
Giảng viên có thể:
- Tạo bộ đề thi của mình (bao gồm đề thi Reading với passages đa phần - multi-passage)
- Thêm, sửa, xóa câu hỏi theo cấu trúc bài thi đọc hiểu (Reading comprehension)
- Đăng lên ngân hàng đề thi để chờ admin duyệt
- Admin duyệt đề thi trước khi công khai cho người học

Hệ thống hỗ trợ tìm kiếm đề thi theo từ khóa với:
- **PostgreSQL Full-text Search** (tsquery, tsvector)
- **pg_trgm extension** (xử lý lỗi chính tả và tìm kiếm tương tự - similarity search)
- **Gemini AI** mở rộng từ khóa tìm kiếm thành các từ đồng nghĩa liên quan để cải thiện độ chính xác

#### ✅ Luyện thi TOEIC
Người học có thể:
- Chọn chế độ **thi thử TOEIC đầy đủ 200 câu theo chuẩn 7 Part**:
  - Part 1: 6 câu (Photographs)
  - Part 2: 25 câu (Question-Response)
  - Part 3: 39 câu (Conversations)
  - Part 4: 30 câu (Talks)
  - Part 5: 30 câu (Incomplete Sentences)
  - Part 6: 16 câu (Text Completion)
  - Part 7: 54 câu (Reading Comprehension)
- **Đồng hồ đếm giờ** tự động (có thể tùy chỉnh thời gian cho chế độ luyện tập)
- **Chấm điểm tự động** sau khi nộp bài
- Hiển thị **kết quả chi tiết**:
  - Điểm số (số câu đúng/tổng số câu)
  - Phần trăm đúng/sai
  - Phân tích theo loại câu hỏi (TFNG, MCQ, Short Answer)
  - Danh sách câu trả lời đúng/sai
- **Lưu lịch sử làm bài** (exam attempts) để người dùng xem lại
- **Chế độ luyện tập linh hoạt**:
  - Chọn phần muốn làm (theo passage hoặc theo nhóm câu)
  - Tùy chỉnh thời gian
  - Xem đáp án chi tiết sau khi nộp

#### ✅ Tính năng AI hỗ trợ
Hệ thống tích hợp AI để nâng cao trải nghiệm học tập:
- **Tìm kiếm thông minh trong ngân hàng đề thi**: Sử dụng Gemini AI để mở rộng từ khóa tìm kiếm thành các từ đồng nghĩa và liên quan, kết hợp với PostgreSQL Full-text Search và pg_trgm để tìm kiếm chính xác hơn ngay cả khi có lỗi chính tả.
- **Chấm điểm Dictation tự động**: AI so sánh câu trả lời của người dùng với transcript chuẩn, phân tích từ đúng/sai, tính điểm và đưa ra feedback chi tiết.

#### ✅ Thống kê (Menu "Thống kê")
Hệ thống cung cấp 3 trang thống kê chính:

**1. Lịch sử (History)**
- Xem lịch sử học tập của bản thân
- Lịch sử làm bài thi (exam attempts)
- Lịch sử flashcard sessions
- Timeline các hoạt động học tập

**2. Huy hiệu (Badge Collection)**
- Hiển thị tất cả huy hiệu đã đạt được
- Sắp xếp theo thời gian mới nhất
- Badge mới (trong 24h) được highlight
- Các mốc đạt được: 100 từ, 10 bài thi, streak 7 ngày, WPM > 60...

**3. Ôn tập (Review)**
- Lịch ôn tập hôm nay
- Gợi ý từ cần ôn theo Spaced Repetition
- Learning Summary: Tóm tắt từ học hôm nay
- Review Schedule: Xem trước từ ôn ngày mai

#### ✅ Báo cáo (Menu "Báo cáo")
Hệ thống cung cấp 3 loại báo cáo chi tiết:

**1. Báo cáo học tập (Analytics)**
- Dashboard phân tích toàn diện:
  - Số từ học hôm nay
  - Số buổi học (sessions)
  - Số ngày hoạt động trong 30 ngày
  - Strengths & Weaknesses (điểm mạnh/yếu)
  - AI Recommendations (đề xuất cải thiện)
- Biểu đồ xu hướng học tập qua thời gian

**2. Thống kê tiến độ (Progress)**
- Biểu đồ tiến bộ qua **Recharts** (line chart, bar chart)
- Chọn khoảng thời gian: tuần, tháng, năm
- Daily Activity: Số từ học & sessions mỗi ngày
- Total time spent (tổng thời gian học)
- Days active (số ngày hoạt động)
- Responsive charts for mobile & desktop

**3. Phân tích kết quả (Analytics - chi tiết)**
- Phần mạnh/yếu theo loại câu hỏi (TFNG, MCQ, Short Answer)
- Lịch sử điểm số theo thời gian
- Phân tích theo Part (TOEIC Part 1-7)
- Vocabulary details: Từ đã học, từ cần ôn
- Insights & Tips từ hệ thống

#### ✅ Gamification
- **Bảng xếp hạng (Leaderboard)**: Xếp hạng top 10 người dùng dựa trên tốc độ gõ (WPM - Words Per Minute) và độ chính xác trong bài tập typing
- **Huy hiệu (Badges)**: Tự động trao huy hiệu khi đạt được các mốc quan trọng (ví dụ: học đủ 100 từ, hoàn thành 10 bài thi, streak 7 ngày liên tục, WPM > 60)
- **Streak system**: Theo dõi chuỗi ngày học liên tục, khuyến khích người dùng học đều đặn
- **EXP Rewards**: Thưởng điểm kinh nghiệm khi hoàn thành Dictation, bài thi, flashcard sessions

#### ✅ Quản trị hệ thống
Admin có thể:
- **Duyệt đề thi**: Xem trước nội dung đề thi (passages, câu hỏi, đáp án) ngay trong admin panel trước khi duyệt
- Từ chối đề thi với lý do cụ thể
- Xem **báo cáo thống kê**:
  - Số lượng người dùng (theo role: learner, teacher, admin)
  - Số lượng đề thi (đã duyệt, đang chờ, bị từ chối)
  - Số lượng bài thi đã hoàn thành
  - Số lượng từ vựng trong hệ thống
- Quản lý người dùng (xem danh sách, tìm kiếm, phân quyền)

---

### 2.1.2. Yêu cầu phi chức năng

#### Bảo mật
- **Mã hóa mật khẩu**: Sử dụng bcrypt để hash password trước khi lưu database
- **JWT Authentication**: Bảo vệ các API endpoint với JWT token
- **Authorization middleware**: Kiểm tra role (user/teacher/admin) cho các chức năng nhạy cảm
- **Bảo vệ thông tin người dùng**: Không lộ thông tin nhạy cảm trong API response

#### Tính khả dụng (Availability & Responsiveness)
- **Responsive Design**: Giao diện tự động điều chỉnh cho điện thoại và máy tính
- **Cross-browser Support**: Hoạt động tốt trên Chrome, Firefox, Safari, Edge
- **Mobile-first UI**: Ưu tiên trải nghiệm trên thiết bị di động với bottom navigation, drawer menu
- **Performance**: Lazy loading cho hình ảnh, tối ưu bundle size

#### Tính mở rộng (Scalability & Maintainability)
- **Kiến trúc module hóa**: Frontend và Backend tách biệt rõ ràng
- **RESTful API**: Dễ dàng thêm endpoint mới
- **Database schema linh hoạt**: Hỗ trợ thêm cột, bảng mới mà không ảnh hưởng logic cũ
- **Component-based Architecture**: React components có thể tái sử dụng
- **Environment variables**: Cấu hình linh hoạt cho development/production

#### Giao diện người dùng (UI/UX)
- **Dễ sử dụng**: Navigation rõ ràng, breadcrumb, search bar
- **Trực quan**: Icon sinh động (React Icons, Lucide React)
- **Màu sắc hài hòa**: Sử dụng Material-UI theme với gradient tím-xanh hiện đại
- **Feedback tức thì**: Toast notifications (react-toastify), loading states, progress bars
- **Accessibility**: Contrast tốt, font size phù hợp, keyboard navigation

---

## 2.2. Công nghệ sử dụng

### Frontend
- **React 18** với React Router DOM v7
- **Material-UI (MUI) v7**: Components library hiện đại
- **Recharts**: Thư viện vẽ biểu đồ
- **React Icons & Lucide React**: Icons
- **React Toastify**: Thông báo
- **Socket.io Client**: Realtime communication (nếu cần)

### Backend
- **Node.js & Express**: Server framework
- **PostgreSQL**: Database chính
- **pg-trgm extension**: Tìm kiếm mờ (fuzzy search)
- **JWT (jsonwebtoken)**: Authentication
- **bcrypt**: Mã hóa mật khẩu
- **Gemini AI**: Mở rộng từ khóa tìm kiếm

### DevOps & Tools
- **CRACO**: Customize Create React App config
- **dotenv**: Environment variables
- **CORS**: Cross-origin resource sharing

---

## 📝 Ghi chú quan trọng

### ✅ Các tính năng ĐÃ TRIỂN KHAI:
1. ✅ Quản lý người dùng với JWT authentication & phân quyền (User/Teacher/Admin)
2. ✅ Học từ vựng theo topic (với audio, phiên âm, hình ảnh, ví dụ)
3. ✅ Flashcards với streak tracking và review mode
4. ✅ **Lộ trình học (Roadmap)** với Skill Tree và Learner Assessment
5. ✅ **Thi thử gõ phản xạ (Typing Practice)** - WPM, Accuracy, Leaderboard
6. ✅ **Luyện Dictation TOEIC** - Nghe và điền từ theo chuẩn TOEIC Listening
7. ✅ **Ôn tập (Review)** - Spaced Repetition với lịch ôn tập tự động
8. ✅ Ngân hàng đề thi với approval workflow (Teacher tạo → Admin duyệt)
9. ✅ **TOEIC Practice đầy đủ 200 câu theo 7 Part** (Part 1-7)
10. ✅ Tìm kiếm thông minh với Gemini AI + PostgreSQL FTS + pg_trgm
11. ✅ Theo dõi tiến độ với Recharts (biểu đồ, dashboard analytics)
12. ✅ Gamification (Badges, Leaderboard WPM, Streak, EXP rewards)
13. ✅ Admin panel với xem trước đề thi (passages, câu hỏi, đáp án) trước khi duyệt
14. ✅ **Báo cáo học tập** (Analytics, Progress, History)
15. ✅ **Huy hiệu** (Badge Collection) - Tự động trao khi đạt mốc

### ❌ Các tính năng CHƯA TRIỂN KHAI (có thể thêm sau):
1. ❌ Chấm phát âm realtime (speech recognition với confidence score)
2. ❌ Tạo câu ví dụ tự động bằng AI cho từ mới
3. ❌ Tìm kiếm Flashcard với nghĩa gần đúng (semantic search)
4. ❌ Chatbot AI hỗ trợ học tập

---

**Lưu ý**: Nội dung này đã được kiểm tra và so sánh với mã nguồn thực tế của dự án VocaType tại `d:/Users/MSI GF63/Documents/vocatype-backend/`.

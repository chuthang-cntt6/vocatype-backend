# Tìm kiếm thông minh với AI

Tìm kiếm sử dụng **Google Gemini 2.0 API** để hỗ trợ người học tìm kiếm một cách **chính xác và linh hoạt** trên toàn bộ *tài nguyên học tập* trong hệ thống
(bao gồm cả **flashcard list** và **ngân hàng đề thi**). Tính năng này **không chỉ** tìm kiếm dựa trên từ khóa chính xác
mà còn hiểu được **ngữ nghĩa**, hỗ trợ tìm kiếm **đa ngôn ngữ (tiếng Anh – tiếng Việt)** và xử lý các trường hợp **gõ sai chính tả / gần đúng**.

## Quy trình tìm kiếm

Khi người dùng nhập từ khóa tìm kiếm, hệ thống thực hiện các bước sau:

1. **Nhận prompt từ người dùng**  
   Người dùng nhập từ khóa tìm kiếm (có thể là tiếng Anh hoặc tiếng Việt) vào ô "tìm kiếm thông minh với AI" trên giao diện.

2. **Gửi yêu cầu đến AIService / Gemini API**  
   Frontend gửi prompt tới dịch vụ AI nội bộ (AIService), dịch vụ này tiếp tục gửi một prompt đã được thiết kế/chuẩn hóa
   đến **Google Gemini 2.0 Flash API**.

3. **Gemini sinh ra các từ/cụm từ liên quan**  
   Gemini phân tích truy vấn và trả về danh sách các từ/cụm từ liên quan, bao gồm:
   - Các từ đồng nghĩa.
   - Các từ/cụm từ có nghĩa tương tự hoặc liên quan ngữ cảnh.
   - Các cặp từ dịch giữa tiếng Việt và tiếng Anh.

4. **Tìm kiếm trong dữ liệu tài nguyên học tập**  
   Hệ thống duyệt qua tập dữ liệu nội bộ (các mục kết quả như flashcard list, bộ đề thi, …) và so khớp
   các từ/cụm từ liên quan với các trường văn bản chính, ví dụ:
   - `title` (tiêu đề).
   - `description` (mô tả).
   - Các tag/chủ đề liên quan (nếu có).

5. **Tính điểm relevance (aiScore) cho từng mục kết quả**  
   Mỗi mục kết quả được tính điểm dựa trên mức độ khớp, ví dụ:
   - `title` khớp chính xác với từ khóa: **+1.0 điểm**.
   - `description` khớp chính xác với từ khóa: **+0.8 điểm**.
   - Mỗi từ liên quan (từ Gemini) khớp trong `title`: **+0.6 điểm**.
   - Mỗi từ liên quan (từ Gemini) khớp trong `description`: **+0.4 điểm**.
   - Mỗi từ trong từ khóa gốc khớp trong `title`: **+0.3 điểm**.
   - Mỗi từ trong từ khóa gốc khớp trong `description`: **+0.2 điểm**.
   - Chỉ tính với từ có độ dài **> 2 ký tự**.
   - Tính **độ tương đồng (similarity)** giữa từ khóa và `title/description`:
     - Nếu `similarity > 60%` → cộng thêm `0.5 × similarity` điểm.
     - Giúp xử lý trường hợp **gõ sai chính tả / gần đúng**.
   - Tổng điểm cuối cùng được **giới hạn** ở mức tối đa khoảng **2.0 điểm** để tránh lệch quá lớn.

6. **Lọc và sắp xếp kết quả**  
   - Loại bỏ các mục có điểm quá thấp (nhiễu, không liên quan).
   - Sắp xếp các mục còn lại theo `aiScore` giảm dần.

7. **Trả kết quả về Frontend**  
   Frontend nhận danh sách đã sắp xếp và hiển thị cho người dùng dưới dạng:
   - Danh sách flashcard list phù hợp (nếu đang ở màn hình Flashcards).
   - Danh sách các bộ đề phù hợp (nếu đang ở màn hình Ngân hàng đề thi).

## Cách thức vận hành (tóm tắt)

- **Bước 1 – Nhận prompt từ người dùng:**  
  Người dùng nhập từ khóa vào ô tìm kiếm (tiếng Việt hoặc tiếng Anh).

- **Bước 2 – Gọi yêu cầu đến Gemini API để lấy các từ liên quan:**  
  Hệ thống gửi prompt đã thiết kế sẵn tới Google Gemini 2.0 Flash API để yêu cầu tìm các từ/cụm từ liên quan.

- **Bước 3 – Gemini sinh ra các từ liên quan:**  
  Gemini phân tích từ khóa và trả về danh sách các từ/cụm từ liên quan, bao gồm:
  - Từ gần nghĩa với từ khóa tìm kiếm.
  - Từ/cụm từ có nghĩa tương tự hoặc liên quan trong cùng ngữ cảnh.
  - Từ dịch tương đương between tiếng Việt và tiếng Anh (nếu từ khóa là tiếng Việt trả về từ tiếng Anh tương đương và ngược lại).

- **Bước 4 – Tìm kiếm trong tài nguyên học tập:**  
  Hệ thống duyệt qua tất cả các mục kết quả (flashcard list, bộ đề thi, …) và kiểm tra xem `title` hoặc `description` (và các trường liên quan khác nếu có)
  có khớp với các từ/cụm từ liên quan mà Gemini đã sinh ra hay không. Những mục có mức độ khớp đạt ngưỡng sẽ được giữ lại để chấm điểm.

- **Bước 5 – Tính điểm relevance (aiScore) cho từng mục:**  
  Để đảm bảo kết quả tìm kiếm chính xác và phù hợp nhất, hệ thống tính điểm cho từng mục dựa trên các tiêu chí:
  - Khớp chính xác từ khóa trong `title` / `description`.
  - Khớp các từ liên quan (từ Gemini) trong `title` / `description`.
  - Khớp từng từ trong từ khóa gốc.
  - Độ dài từ > 2 ký tự mới được tính.
  - Độ tương đồng (similarity) giữa từ khóa và `title/description` nếu > 60% sẽ cộng thêm điểm (giúp xử lý gõ sai chính tả).
  - Điểm tổng được giới hạn ở mức tối đa khoảng 2 điểm.

- **Bước 6 – Lọc và sắp xếp kết quả:**  
  Hệ thống loại bỏ các mục có điểm thấp, giữ lại các mục phù hợp và sắp xếp theo `aiScore` giảm dần trước khi trả về cho Frontend hiển thị.

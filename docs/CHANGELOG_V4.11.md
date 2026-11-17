# Việt Sử V4.11 — Bộ đề ôn Sử lớp 10, 11, 12

**Yêu cầu được duyệt:** thêm đúng một mục menu **Bộ đề ôn Sử** ngay trên **Sách giáo khoa**; không đổi giao diện timeline V4.6 đã khóa. Mục mới mở trang ôn thi riêng.

## Phạm vi
- Nguồn tài liệu người dùng cung cấp: `bdhsg-su-10.pdf` (39 trang), `he-thong-kien-thuc-lich-su-11-p1.pdf` (26 trang, có 1 trang trắng), `TAI-LIEU-ON-THI-LOP-12.pdf` (21 trang).
- 93 câu hỏi **mới biên soạn lại** dựa trên các mục có trong PDF: 33 câu lớp 10 / 7 chủ đề, 30 câu lớp 11 / 6 chủ đề, 30 câu lớp 12 / 3 chủ đề. Câu hỏi dạng A/B/C/D một đáp án, có giải thích và dẫn trang PDF.
- Tài liệu lớp 12 mới đề cập ba chủ đề đầu của chương trình; website không tự giới thiệu là đủ bộ kiến thức lớp 12.
- **Ôn tập:** phản hồi đúng/sai ngay sau mỗi câu.
- **Thi thử:** nộp bài rồi mới xem đáp án; có đồng hồ (tùy chọn), tự nộp khi hết giờ, xem điểm thang 10, câu đúng, sai, bỏ trống, lời giải.
- Lưu tối đa 20 lượt kết quả **chỉ trong localStorage của trình duyệt**. Không thu tên, tài khoản hay dữ liệu cá nhân; xóa lịch sử bằng nút trên trang.
- Trang mới nằm tại `/on-thi/`; mã nguồn trong `vietsu/static/on-thi/`. Chạy bằng `file://` khi xem thư mục ngoại tuyến, GitHub Pages và FastAPI.
- Không đăng bản PDF, không sao chép nội dung nguyên văn. Lưu ý tài liệu 12 ghi 'TÀI LIỆU ĐỘC QUYỀN'; cần thẩm định nguồn và quyền khai thác trước khi mở rộng việc tái sử dụng.

## Kiến trúc giữ giao diện
- `tools/build_v411.py` chạy V4.9 rồi **chèn đúng 1 thẻ script v411.js trước </body>**. V4.9 không bị ghi đè.
- `static/v411.js` tìm chính xác nút **Sách giáo khoa**, nhân bản lớp/style/icon của nút, đổi nhãn thành **Bộ đề ôn Sử** và chèn **trước**. Không sửa HTML/CSS cũ. Cả sidebar desktop/mobile đều được xử lý khi có cùng nhãn.
- Trang ôn tập riêng có CSS độc lập, không ảnh hưởng cấu trúc trang chủ và chức năng lịch sử.
- `main.py`: thêm StaticFiles mount `/on-thi` và thêm V4.11 vào đầu HOME_CANDIDATES; không sửa API/CMS khác.
- GitHub Pages: copy folder `on-thi` và `v411.js`; không chứa API nên học sinh dùng hoàn toàn trên trình duyệt.

## Vận hành / kiểm thử
Chạy `python3 vietsu/tools/check_v411_exam.py` và `python3 vietsu/tools/build_v411.py`. Trong CI: `node --check` tất cả JS và chạy kiểm tra 93 câu, nguồn, thẻ HTML.
Kiểm tra trực tiếp: xem giao diện V4.11 có chỉ thêm đúng một mục trên Sách giáo khoa; vào `/on-thi/`; làm ôn tập với lớp 10; thi thử lớp 11/12; nộp bài thiếu câu, hết giờ, xem lại đáp án, làm lại và kiểm tra mobile.

## Còn cần làm về sau
- Mở rộng câu hỏi cho toàn bộ tài liệu sau khi giáo viên/người biên tập thẩm định các câu và giải thích.
- Cân nhắc thêm dạng đúng/sai theo 4 nhận định và dạng trả lời ngắn nếu cần sát cấu trúc thi hiện hành.
- Phát triển CMS riêng để người quản trị duyệt, sửa, bổ sung đề; chưa triển khai vì chưa được yêu cầu.
- Bản 4.11 trên nhánh phát triển / PR dự thảo; **không tự merge vào main, không tự deploy**.

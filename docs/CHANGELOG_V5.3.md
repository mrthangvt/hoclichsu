# Việt Sử V5.3 — Logo Sử Việt, gom menu Sách giáo khoa, nút sa bàn 3D trên dòng thời gian

**Yêu cầu của chủ dự án (22/11/2026):**
1. Ẩn các mục con "Sách lịch sử lớp 6–12" vào trong "Sách giáo khoa Lịch sử"; khi chọn mục này thì chọn lớp ở phần nội dung.
2. Thay logo mới "Sử Việt — Dân ta phải biết sử ta" (phương án 3, bản giao diện tối và giao diện sáng).
3. Trong popup Khám phá của dòng thời gian, mục "Sa bàn tương tác" hiện nút vào sa bàn 3D với những mốc đã có sa bàn.

## Cách làm
- Giữ nguyên HTML V5.2 (và V4.6 khóa bên trong); `vietsu/tools/build_v53.py` chỉ chèn `static/v53.css` + `static/v53.js` và kiểm tra bỏ hai dòng này thì trùng V5.2.
- Logo: `vietsu/static/v53/logo-toi.webp`, `logo-sang.webp` (đầy đủ, thanh bên desktop) và `logo-chu-toi.webp`, `logo-chu-sang.webp` (chỉ chữ "Sử Việt", thanh trên mobile). Tách nền từ ảnh phác thảo anh gửi, nền trong suốt. Đổi theo `body.theme-light`. Bấm logo về Dòng thời gian sử Việt. Chữ cũ (越史 / VIỆT SỬ / BẢN ĐỒ THỜI GIAN) chỉ ẩn bằng CSS, không xoá khỏi HTML.
- Sách giáo khoa: ẩn `#v21Grades` và mũi tên ⌄ ở thanh bên; nút "Sách giáo khoa Lịch sử" vẫn gọi `showSchool()`, phần nội dung có sẵn các thẻ Lớp 6 … Lớp 12.
- Sa bàn 3D: bảng `SA_BAN_3D` trong `v53.js`, chỉ gồm trận có trang thật trong `vietsu/static/khong-gian/`:
  - `battle1785` → `khong-gian/rach-gam-xoai-mut/`
  - `battle1789` → `khong-gian/ngoc-hoi-dong-da/`
  - `war1954` → `khong-gian/dien-bien-phu/`
  - `war1972` → `khong-gian/thanh-co-quang-tri/`
  Bạch Đằng 938 (`battle938`) và Như Nguyệt 1077 (`battle1075`) đã có bản trên Claude nhưng chưa đưa vào repo nên chưa có nút; khi thêm thư mục sa bàn thì bổ sung một dòng vào bảng.
- GitHub Pages dựng bằng `build_v53.py` (cập nhật `.github/workflows/pages.yml`). Máy chủ Python (`main.py`) vẫn phục vụ bản V4.11 như trước, chưa đổi.

## Đã kiểm tra (Chromium, bản dựng như Pages)
- Desktop 1440 px: giao diện tối và sáng, logo đổi màu đúng; menu không còn danh sách lớp; Sách giáo khoa mở với thẻ Lớp 6–12.
- Popup Ngọc Hồi – Đống Đa 1789, Chiến sự 1972 có nút; Bạch Đằng 938 không có nút.
- Mobile 390 px: logo chữ ở thanh trên; popup Rạch Gầm – Xoài Mút 1785 nút rộng toàn khung. Không có lỗi JavaScript.

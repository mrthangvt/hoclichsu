# Việt Sử V5.8 — bài học SGK Lịch sử lớp 6, 7 (23/11/2026)

Theo yêu cầu chủ dự án: đưa nội dung bài học lớp 6, lớp 7 vào menu **Sách giáo khoa Lịch sử**.

## Thay đổi
- Mục lục lớp 6 (20 bài) và lớp 7 (18 bài + 2 chủ đề chung) theo đúng SGK **Lịch sử và Địa lí 6, 7, bộ Kết nối tri thức với cuộc sống** (NXB Giáo dục Việt Nam), phần Lịch sử: tên bài, chương, số trang. Thay cho đề cương minh họa cũ.
- Mỗi bài có: tóm tắt, các mục nội dung chính, ghi nhớ, câu hỏi ôn tập, số trang SGK để học sinh đối chiếu; nút đến năm tương ứng trên dòng thời gian (bài có mốc rõ). Bài 12 lớp 7 có nút vào sa bàn 3D Như Nguyệt (chạy sau khi PR khung sa bàn Như Nguyệt được merge).
- **Nội dung biên soạn lại bằng lời văn riêng**, không chép nguyên văn sách, không dùng hình ảnh, lược đồ của sách (SGK có bản quyền của NXB). Mỗi lớp ghi rõ nguồn và lưu ý này.
- Các lớp 8–12 giữ nguyên.

## Tệp
- Dữ liệu gốc: `vietsu/data/sgk_kntt_lop6.json`, `sgk_kntt_lop7.json` (sửa nội dung ở đây).
- `vietsu/tools/build_v58.py`: kiểm tra dữ liệu, sinh `vietsu/static/v58-sgk.js`, dựng `Viet_Su_Timeline_V5.8_Offline.html` từ V5.7 (chỉ thêm `v58.css`, `v58-sgk.js`, `v58.js`).
- `v58.js`: thay danh sách bài lớp 6, 7 trong `V21_LESSONS`, sửa nhãn trong mục lục V2.4 (`#v22Toc`), mở bài đầy đủ trong cửa sổ bài học.
- Pages dựng qua `build_v58.py`.

## Kiểm tra
- Desktop 1440 px và mobile 390 px, giao diện tối và sáng: lớp 6 hiện 20/20 bài, lớp 7 20/20, mở bài đầy đủ, nút timeline hoạt động, lớp 8 giữ nguyên; không có lỗi JavaScript.
- Nguồn đọc: bản PDF SGK chủ dự án cung cấp, nhận dạng chữ (OCR) để đối chiếu tên bài, trang, mốc thời gian.

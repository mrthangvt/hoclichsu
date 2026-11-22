# Việt Sử V5.7 — Bộ đề ôn Sử dàn hết trang

**Yêu cầu của chủ dự án (23/11/2026):** làm lại trang Bộ đề ôn Sử, bỏ khung bao để dàn hết trang giống các trang khác.

## Đã làm
- Lớp mới `v57.css` / `v57.js`; `vietsu/tools/build_v57.py` chèn vào HTML V5.6; Pages dựng bằng `build_v57.py`.
- Bỏ khung viền, bo góc và giới hạn bề rộng 1180 px quanh trang ôn thi; nội dung trải hết vùng nội dung như trang Sách giáo khoa.
- Khi nhúng trong Việt Sử, trang `on-thi/` ẩn thanh đầu "VIỆT SỬ · Trở về dòng thời gian" và phần giới thiệu trùng với tiêu đề "BỘ ĐỀ ÔN SỬ" bên ngoài; mô tả ngắn chuyển lên tiêu đề ngoài.
- Khung tự cao theo nội dung (thêm/bớt câu, xem kết quả), không còn thanh cuộn thứ hai bên trong; bấm Bắt đầu / Nộp bài / Thoát thì cuộn về đầu bài.
- Giao diện sáng/tối đồng bộ: nút Giao diện sáng đổi luôn màu bên trong bộ đề (thẻ lớp, đáp án đúng/sai, bảng số câu, thanh tiến độ).
- Trang `on-thi/` mở riêng (đường dẫn `/on-thi/`) giữ nguyên như cũ; không sửa tệp nào trong `on-thi/`.

## Đã kiểm tra
Chromium desktop 1440 px và mobile 390 px, giao diện tối và sáng: vào Bộ đề, bắt đầu bài, chọn đáp án, khung co giãn đúng chiều cao, không còn nền đặc phía sau. Không lỗi JavaScript.

# Việt Sử V4.4 — hoán đổi hai avatar Hồ Chí Minh
Ngày 16/11/2026.

## Yêu cầu đã thực hiện
- Đổi avatar tại **giai đoạn 4 (1941–1945, Lãnh đạo Tổng khởi nghĩa Tháng Tám)** sang hình vốn ở giai đoạn 5.
- Đổi avatar tại **giai đoạn 5 (1945–1954, Lãnh đạo kháng chiến chống Pháp)** sang hình vốn ở giai đoạn 4.
- Áp dụng cho Timeline **desktop lẫn mobile**.
- Giữ nguyên năm tháng, tiêu đề, nội dung, avatar của 5 giai đoạn còn lại.
- Không sửa các tệp GLB, sa bàn 3D hay cơ sở dữ liệu CMS.

## Kỹ thuật
- `static/v44.js`: lớp hoán đổi chạy sau V4.3 và an toàn khi Timeline được render lại.
- `tools/build_v44.py`: tạo HTML V4.4 từ V4.3, không ghi đè V4.1/V4.2/V4.3.
- `start_local.command` tự build V4.4; `main.py` ưu tiên V4.4; `vs_core.VERSION=4.4.0`.
- GitHub Pages lấy HTML V4.4 và chép `v44.js` ra `_site/static/`.

## Kiểm thử
- Bản xem thử offline V4.4: Chromium 1440px, 390px, 320px.
- Kiểm tra **hai avatar đổi đúng vị trí**, năm avatar còn lại không đổi, tiêu đề không đổi, không tràn ngang.
- Chạy lại `buildHCM()` không gây hoán đổi ngược.
- Chưa kiểm tra GitHub Pages và Local chạy thực sau merge.

## Phụ thuộc / thứ tự duyệt
- Nhánh V4.4 kế thừa V4.3, V4.3 kế thừa V4.2.
- **Không merge V4.4 lên main trước các PR V4.2 (#2) và V4.3 (#3).**
- PR V4.3 vẫn thiếu 17 ảnh WebP: cần đưa lên repo và kiểm thử trước khi merge.

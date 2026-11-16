# VIỆT SỬ V4.8 — BỔ SUNG ẢNH KẾ THỪA, KHÓA GIAO DIỆN

Ngày 17/11/2026. Nhánh `gpt/v4.8-restore-avatar-lock-ui`, dựa trực tiếp trên V4.7, trạng thái chờ bộ ảnh đầy đủ.

## Nội dung
- **Không sửa giao diện.** `tools/build_v48.py` build V4.7 rồi sao chép byte-for-byte sang V4.8, so SHA-256. Vì V4.7 đã khóa theo V4.6 nên V4.8 **đúng giao diện V4.6**.
- Giữ tính năng 19 thời đại × 13 chuyên mục ở dạng dữ liệu, CMS biên tập của V4.7; không tự chèn tab/panel mới.
- Bộ avatar V4.5 người dùng đã gửi: **24 ảnh WebP của 6 nhóm × 4 kích thước**, đã được kiểm tra ở file ZIP tải lên. **Bộ ZIP ở ngoài GitHub**; cần nhập vào nhánh V4.8 theo `vietsu/static/avatar-v45/`.
- Nhóm V4.3: 17 ảnh WebP ở `vietsu/static/v43/` vẫn chưa được cung cấp. File `v43.js` hiện tham chiếu trực tiếp 15 tên; hai ảnh còn lại cần xác minh từ file ZIP gốc, không tự đặt tên hoặc tạo tranh thay thế.
- `tools/check_v48_assets.py` kiểm tra đủ 24 ảnh V4.5, 15 đường dẫn V4.3 được sử dụng và ít nhất 17 ảnh V4.3. Chỉ khi đủ mới cho phép build/deploy chính thức.

## Hướng dẫn nhập ảnh và kiểm thử
1. Mở nhánh `gpt/v4.8-restore-avatar-lock-ui` trong GitHub Desktop hoặc giao diện web.
2. Giải nén `Viet_Su_V4.8_Bo_Sung_24_Avatar_GitHub.zip` tại **gốc repo**, tạo `vietsu/static/avatar-v45/*.webp`. Ảnh PNG gốc dùng để chỉnh sửa, không bắt buộc để website hoạt động.
3. Commit/push đúng nhánh V4.8, **không đẩy vào `main`**.
4. Tìm và cung cấp `Viet_Su_V4.3_GitHub_Patch.zip` để bổ sung đủ 17 ảnh tại `vietsu/static/v43/`.
5. Chạy `python3 vietsu/tools/check_v48_assets.py --strict` rồi `python3 vietsu/tools/build_v48.py`; đối chiếu SHA-256 của HTML V4.6 với V4.8.
6. Chỉ khi nội dung, ảnh, giao diện và CMS được kiểm thử đầy đủ mới duyệt các PR phụ thuộc theo thứ tự rồi merge `main`.

**Quan trọng:** bản ZIP xem thử V4.8 offline có 24 ảnh mới đã được tạo riêng cho chủ dự án, **không có nghĩa 24 ảnh đã được đẩy lên GitHub**. Còn thiếu nhóm V4.3 nên chưa deploy.

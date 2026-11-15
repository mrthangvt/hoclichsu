# VIỆT SỬ V3.5 – Icon trang phục lịch sử

## Điểm mới
- Cắt 32 minh họa trang phục/mũ tóc từ **ba ảnh người dùng cung cấp** thành PNG nền trong (không dùng AI tạo mới).
- Ghép vào dòng thời gian Việt Nam theo khoảng thời gian và triều đại; nút “Trang phục cùng thời” mở đúng trang triều đại.
- Popup triều đại có bộ sưu tập trang phục, ảnh phóng lớn và chú giải. Áp dụng cả sáng/tối và mobile.
- Ảnh được nhúng trong HTML offline; bản backend giữ file PNG riêng trong `static/assets/costumes/`.
- API `GET /api/v3.5/costumes`, `GET /media/costume/{id}` và `PUT /api/v3.5/costumes/{id}` với mã quản trị.
- CMS tại `/admin/trang-phuc`: thay ảnh, ghi nguồn, chú thích và thông tin bản quyền.

## Lưu ý sử liệu
Các bảng tranh được ghi theo nhiều **thế kỷ** thay vì năm chính xác. Việc ánh xạ vào triều đại chỉ mang tính gợi ý bối cảnh: ví dụ trang phục Lê Trung hưng của thế kỷ XVII có thể xuất hiện ở mốc Trịnh – Nguyễn; tranh thế kỷ XVIII không nhất thiết là bộ quân phục Tây Sơn. Không dùng tranh làm chân dung vua hoặc nhân vật có thật.

## Quyền sử dụng
Một số ảnh gốc có watermark/ghi công tác giả. **Chưa xác minh quyền tái sử dụng thương mại hoặc đăng công khai.** Tệp chứa ảnh do người dùng cung cấp nhằm làm thử giao diện. Trước khi lên website công khai cần xin phép hoặc dùng nguồn được cấp quyền; quản trị có trường ghi công và nguồn ảnh.

## Hướng dẫn
- Offline: mở `Viet_Su_Timeline_V3.5_Offline.html` trên Chrome/Edge/Safari; tìm mốc **Lý (1009), Trần (1225), Lê sơ (1428), Tây Sơn (1789), Nguyễn (1802)**.
- Popup: bấm **Trang phục cùng thời**, kéo xuống bộ sưu tập, bấm vào mỗi hình để phóng lớn.
- Backend: cấu hình `VIETSU_ADMIN_TOKEN`, chạy FastAPI theo README; mở `/admin/trang-phuc` để thay ảnh. Ảnh chỉ áp dụng ngay cho bản online, không tự thay vào HTML offline đã tải.
- `data/period_costumes.json` chứa niên đại, triều đại, loại trang phục, nguồn gốc và bản quyền.

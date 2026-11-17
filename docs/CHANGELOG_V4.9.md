# Việt Sử V4.9 — ảnh kế thừa và bản đồ véc-tơ

Theo yêu cầu trực tiếp của chủ dự án ngày 17/11/2026, lấy tài nguyên từ Viet_Su_V4.5_Preview_Offline.html. Chỉ cập nhật ảnh menu Hồ Chí Minh, thumbnail Không gian lịch sử, bản đồ và ảnh Nhân vật; giữ bố cục V4.6.

- Menu dùng ảnh nguồn thay mặt nạ đơn sắc.
- Giữ 4 thumbnail SVG như bản V4.5 và bản đồ véc-tơ cả khi lọc/đổi mục.
- Ánh xạ 80 hồ sơ đúng bộ chọn ảnh V4.5: 63 hồ sơ dùng 6 tranh mẫu vai trò, 17 hồ sơ giữ cách chọn ảnh cũ. Không coi tranh mẫu là chân dung xác thực. Danh sách và popup dùng cùng ảnh; ảnh riêng được duyệt qua CMS được ưu tiên.
- static/v49/reference.json ghi nguồn và SHA-256. Không tạo ảnh AI mới.
- tools/build_v49.py kế thừa V4.8, chỉ thêm hai script; cấu hình Local/Pages sử dụng V4.9 sau khi merge. Nhánh dựa trên V4.8, chờ duyệt các PR cha đúng thứ tự.

Kiểm tra: strict 41/41 ảnh V4.3/V4.5, build, cú pháp JS/Python, DOM menu/80 hồ sơ/tìm kiếm/popup/4 thumbnail/bộ lọc/vector. Chưa kiểm thử layout desktop/mobile bằng trình duyệt cho V4.9; chưa deploy main/Pages.

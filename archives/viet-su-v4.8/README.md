# Bản V4.8 Offline do chủ dự án cung cấp

Lưu toàn bộ byte của ZIP anh Thắng tải lên, chia thành 4 phần để truyền tải chính xác. Chạy `python3 archives/viet-su-v4.8/restore_zip.py` từ gốc repo để ghép lại ZIP và xác nhận SHA-256. Bản gốc do anh Thắng tải lên ngày 17/11/2026. SHA-256 và danh sách 24 avatar trong `manifest.json`. Giải nén để xem `Viet_Su_V4.8_Offline/index.html`.

24 avatar đã được nhập vào `vietsu/static/avatar-v45/` để mã dựng V4.8 sử dụng. Trang chủ trong ZIP có SHA-256 khớp tệp kiểm tra đi kèm. Chưa có bộ 17 ảnh V4.3 nên chưa xác nhận bản build/deploy đầy đủ.

ZIP chứa sa bàn cũ; chỉ dùng làm bản lưu tham chiếu, không chép sa bàn này đè lên GLB/mã web hiện tại. Bản GD10 được quản lý riêng trong PR #11.

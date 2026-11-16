# VIỆT SỬ V4.7 — hồ sơ thời đại / triều đại

- Kế thừa nhánh V4.6, không thay đổi bố cục timeline hoặc dữ liệu CMS cũ.
- 19 giai đoạn; 13 chuyên mục trong Popup triều đại (nằm trong tab Tổng quan), vẫn giữ Nhân vật, Sự kiện, Văn hóa, Trắc nghiệm.
- Bảy giai đoạn có bản thảo mở rộng và đầu mối nguồn: Văn Lang, Lý, Trần, Lê sơ, Lê Trung hưng, Tây Sơn, Nguyễn. Không suy diễn cho các ô thiếu chứng cứ: hiển thị **Đang biên tập**.
- Giữ link nhân vật có thật trong ứng dụng và sa bàn 3D Thành cổ Quảng Trị; không tạo link 3D giả cho Cổ Loa hay Rạch Gầm.
- CMS `/admin/periods` dùng cùng mã quản trị với website; PUT dữ liệu lưu vào `data/v47_period_overrides_local.json` (gitignore). Chỉ `approved=true` và có tên nguồn được công khai; bản nháp không rò rỉ qua API công khai.
- `tools/build_v47.py` nhúng JSON nội tuyến vào bản HTML để chạy chế độ file://, không cần kết nối API.

## Kiểm tra trước khi đưa lên

1. Cần bổ sung 41 ảnh WebP của V4.3/V4.5 theo ghi chú V4.6 trước khi build được toàn bộ trang; **không tạo ảnh giả để thay thế**.
2. Chạy `python3 vietsu/tools/build_v47.py`; mở `vietsu/static/Viet_Su_Timeline_V4.7_Offline.html` trên desktop/mobile, kiểm tra từng mục, ảnh, bản đồ, sa bàn.
3. Chạy Local `bash vietsu/start_local.command` (Mac), vào `http://127.0.0.1:8000/admin/periods` để kiểm tra nháp → duyệt → hiển thị.
4. Không hợp nhất PR V4.7 vào main trước khi kiểm thử xong, bổ sung đủ ảnh và duyệt các PR phụ thuộc V4.2–V4.6.

**Lưu ý biên tập**: các nội dung lịch sử hiện là bản thảo, nguồn dẫn mức tác phẩm chưa thay cho thẩm định trang/chương/bản dịch.

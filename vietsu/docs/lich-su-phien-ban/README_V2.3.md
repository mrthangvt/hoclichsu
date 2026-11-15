# VIỆT SỬ V2.3 – Bàn giao thử nghiệm

## 1. HTML Offline
- Tệp: Viet_Su_Timeline_V2.3_Offline.html
- Giao diện mới: nhận diện chữ Hán 越史; nền tối theo V1.4, trống đồng chìm lấy từ file anh cung cấp KHÔNG WATERMARK.
- Menu Không gian lịch sử đặt trước SGK. Bản đồ nền véc-tơ Natural Earth (public domain) tự hoạt động offline, có pan/zoom, lọc pin và mở Popup thuyết minh. Không có game 3D thực tế trong V2.3.
- Menu SGK có 7 dòng lớp 6–12; mobile thanh 4 icon, mặc định Timeline chính.
- Mục Hồ Chí Minh rút gọn phần mô tả đầu trang và câu thông báo dưới cùng.

## 2. Backend/CMS
- `GET /api/site-config` – cấu hình logo, tên, slogan công khai.
- `PUT /api/site-config` – cập nhật, yêu cầu `X-Admin-Token` trùng `VIETSU_ADMIN_TOKEN` hoặc mã reviewer.
- `/admin` > **Logo & slogan** để thay tên, slogan, chữ Hán.
- Chạy `uvicorn main:app --reload` theo tài liệu README gốc.
- Bản HTML offline chỉ hiện mặc định; bản chạy trên backend tải cấu hình qua `/api/site-config`.

## 3. Giới hạn và lưu ý
- Vị trí pin trên bản đồ là xấp xỉ cho mục đích trình diễn, cần kiểm tra bản đồ địa chính/di tích trước khi phát hành.
- SVG biên giới trích bản Natural Earth mức độ tổng quát, KHÔNG dùng để khẳng định ranh giới pháp lý.
- Tư liệu, hiện vật và mô hình chiến trận/NPC là ý tưởng cần thẩm định, chưa có dựng 3D.
- Backend hiện chỉ là nguyên mẫu nội bộ; chưa đủ an toàn để mở công khai lên Internet.
- Không sử dụng ảnh trống đồng thứ hai do có watermark bên thứ ba.

## 4. Vị trí pin cho Atlas
- `GET /api/v2.3/locations`: danh sách vị trí điểm pin.
- `PUT /api/v2.3/locations/{id}`: cập nhật tọa độ pin, cần mã quản trị.
- Vào `/admin` → Sa bàn / Tour 3D để thay tên, phân loại, vĩ độ, kinh độ và ghi chú nguồn.
- Bản chạy backend tải danh sách này; bản offline sử dụng dữ liệu nhúng mặc định.

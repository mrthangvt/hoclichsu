# VIỆT SỬ V3.4 – Bổ sung Việt Nam Sử Lược

## Bàn giao
- Giữ toàn bộ V3.3: timeline ba cột Việt Nam – Trung Quốc – phương Tây, Menu Hồ Chí Minh, không gian lịch sử, SGK, nhân vật, chuyển màu sáng/tối, popups, SEO/CMS.
- 34 chuyên đề triều đại/giai đoạn với nhiều đoạn diễn giải biên tập từ 2 bộ sử của người dùng (không chỉ liệt kê).
- 50 hồ sơ lịch sử, trong đó 15 hồ sơ mới so với 35 hồ sơ DVSKTT của V3.3; có liên kết trong popup và trên timeline.
- Nút nhân vật và các nút sơ đồ hiển thị chân dung minh họa SVG. KHÔNG phải chân dung xác thực. Có thể thay ảnh qua backend.
- 84 bản thảo bài viết trong SQLite cho biên tập/thẩm định; chưa tự xuất bản để tránh đăng tư liệu chưa kiểm chứng.
- Dưới bài ghi Nguồn: Đại Việt Sử Ký Toàn Thư và/hoặc Việt Nam Sử Lược – Trần Trọng Kim, không hiện số trang PDF.
- Thư mục data giữ bản chỉ dẫn nguồn nội bộ. Biên tập viên cần kiểm tra đối chiếu các giai đoạn tranh luận.

## Mở bản xem trước
Nhấp đúp `Viet_Su_Timeline_V3.4_Offline.html` (chạy không cần máy chủ). Phần mềm tự hiển thị chân dung dự phòng có sẵn khi offline.

## Chạy CMS
```
cd Viet_Su_V3.4_Backend
pip install -r requirements.txt
export VIETSU_ADMIN_TOKEN='tu-dat-token-bao-mat'
export VIETSU_REVIEW_TOKEN='tu-dat-token-tham-dinh-khac'
uvicorn main:app --host 127.0.0.1 --port 8000
```
Mở `http://127.0.0.1:8000/admin` quản lý bài, sửa ảnh; có thể lấy bài nháp từ SQLite hoặc nhập thêm. Ảnh tải lên được lưu vào static/uploads, có API riêng.

## Lưu ý nghiệp vụ và pháp lý
- Nội dung thời Hồng Bàng, Âu Lạc, nhà Triệu có các tầng truyền thuyết hoặc khác biệt quan điểm; tuyệt đối không đổi dữ liệu tranh luận thành xác nhận lịch sử.
- Bản dịch Toàn Thư 1993 có thể chịu bảo hộ; V3.4 chỉ viết lại tóm lược, không sao chép nguyên văn kéo dài.
- Ảnh SVG được dựng phong cách giả định theo vai trò để nhận diện, không được coi là chân dung khảo cứu về trang phục của từng đời.
- V3.3 chỉ có dữ liệu DVSKTT đến giữa 1656; các giai đoạn sau chủ yếu dựa vào Việt Nam Sử Lược.
- Backend vẫn chỉ là mẫu kỹ thuật. Cần audit bảo mật, tài khoản, chính sách upload, backups và thẩm định sử học trước khi công bố trên VPS.

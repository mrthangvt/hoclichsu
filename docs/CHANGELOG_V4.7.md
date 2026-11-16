# Việt Sử V4.7 — Hồ sơ lịch sử chuyên sâu và CMS biên tập
Ngày: 16/11/2026. Nhánh `gpt/v4.7-dynasty-library`, kế thừa V4.6. **Bản thử nghiệm chờ duyệt, chưa merge main.**

## 1. Phần đã hoàn thành
- Thêm tab **Hồ sơ chuyên sâu** vào Popup Thời đại/Triều đại, không xóa các tab Tổng quan, Sơ đồ, Nhân vật, Sự kiện, Văn hóa, Trắc nghiệm.
- 13 chuyên mục nhất quán: Tổng quan, Hình thành, Chính trị, Kinh tế, Quân sự, Văn hóa – Giáo dục, Tín ngưỡng, Trang phục, Nhân vật, Di tích, Diễn biến, Chuyển giao, Nguồn tư liệu.
- Chọn chuyên mục từng phần hoặc **Đọc toàn bộ hồ sơ**. Chế độ Full theo V4.6, bố cục hai cột desktop; mobile dùng mục lục cuộn ngang.
- Liên kết từ hồ sơ sang hồ sơ nhân vật/sự kiện và địa điểm có dữ liệu. Các liên kết giữ hành vi Popup lịch sử.
- Mẫu dữ liệu **19 thời kỳ/giai đoạn**; 7 giai đoạn có nội dung mở rộng (Lý, Trần, Lê sơ, Mạc, Lê Trung hưng, Tây Sơn, Nguyễn), các giai đoạn còn lại có bộ mục lục để tiếp tục biên soạn. Thông tin biên tập có chú thích, không tự nhận là tư liệu gốc.
- Nguồn tham khảo chính: Bảo tàng Lịch sử Quốc gia và Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Văn bản trong seed là tóm tắt do AI biên soạn từ tư liệu; **phải thẩm định từng mục trước khi coi là bản chính thức**.
- CMS: `/admin/thoi-dai` cho biên tập 13 chủ đề, thêm nguồn, xem trước, Lưu nháp/Gửi thẩm định/Duyệt & công bố.
- Backend: `dynasty_v47.py` xác thực mã quản trị; mã thẩm định mới xuất bản; nội dung công khai cần ít nhất 120 ký tự và 1 nguồn HTTPS. Chỉ section đã duyệt mới xuất hiện qua `GET /api/v4.7/dynasties`. Dữ liệu lưu `data/dynasty_v47_local.json`, được .gitignore, không sửa SQLite hay nguồn sẵn có.
- Local: start_local.command gọi build_v47.py; Backend ưu tiên HTML V4.7. GitHub Pages: xuất tĩnh JS/CSS và nội dung seed; **CMS không chạy trên Pages**.

## 2. Đã kiểm thử
- Chromium headless **1440px, 390px, 320px** với HTML Offline V4.7:
  - Tab hồ sơ có 13 chuyên mục và chế độ đọc toàn bộ.
  - Nhà Trần → Trần Thái Tông; Nhà Lý → hai liên kết nguồn bảo tàng.
  - Popup Thành cổ Quảng Trị → nút sa bàn 3D (trên bản xem Offline cần mở website để vào mô hình).
  - Không thấy lỗi JavaScript hoặc tràn ngang ở ba kích thước đã thử.
- TestClient FastAPI của API V4.7 với dữ liệu tạm: danh sách 19 giai đoạn, lưu nháp không công khai, quyền biên tập bị từ chối khi xuất bản, mã thẩm định xuất bản thành công, từ chối nguồn URL không an toàn.
- CI GitHub kiểm tra cú pháp Python và JS + dữ liệu 19 giai đoạn.

## 3. Giới hạn và điều kiện đưa lên
- **Các PR #2–#6 vẫn cần duyệt theo thứ tự.** V4.7 dựa trên nhánh V4.6; không merge thẳng main trước các bản phụ thuộc.
- **41 ảnh V4.3 + V4.5 hiện chưa có trong repository**: tải gói từ ChatGPT, chép vào `vietsu/static/v43/` và `vietsu/static/avatar-v45/`, commit vào nhánh V4.7 trước khi chạy build. Không merge khi thiếu ảnh.
- Bản HTML Offline đóng gói riêng để duyệt **giao diện**. Không chạy CMS, API hoặc sa bàn 3D trực tiếp khi mở file bằng `file://`. Sa bàn phải truy cập website/Local có thư mục 3D.
- 13 chuyên mục là cấu trúc biên tập, không có nghĩa tất cả 19 thời đại đã được nghiên cứu đầy đủ. Các đề tài còn thiếu ghi rõ đang biên tập.
- Nguồn tư liệu hiển thị dạng đường dẫn tham khảo, chưa thay thế trích dẫn trang sách/nghiên cứu chuyên sâu.

## 4. Chạy trên máy Mac sau khi nhánh được tải về và có đủ ảnh
```bash
git fetch origin
git switch gpt/v4.7-dynasty-library
cd vietsu
bash sao_luu_local.command
bash start_local.command
```

Mở website: `http://127.0.0.1:8000/`
Mở CMS chuyên mục: `http://127.0.0.1:8000/admin/thoi-dai`

Để review trước khi merge: tải file HTML Offline V4.7 và mở trên trình duyệt; thử Nhà Trần → Hồ sơ chuyên sâu → Đọc toàn bộ hồ sơ; mở Popup Thành cổ để kiểm tra nút sa bàn.

## 5. Ghi chú đồng bộ hai AI
Không tự ý sửa nội dung hoặc asset ở `static/khong-gian/`. Claude có thể tiếp tục xây sa bàn trong nhánh riêng. Công việc mở rộng dữ liệu sử học tiếp tục trong CMS với trạng thái duyệt riêng.

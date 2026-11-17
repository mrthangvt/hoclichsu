# Việt Sử V4.5 — chuẩn hóa ảnh đại diện nhân vật
Ngày 16/11/2026, nhánh chờ duyệt.

## Đã làm
- Bộ 6 mẫu chân dung bán hiện thực: hoàng đế, quan văn, võ tướng, nữ quý tộc, nữ võ tướng, phụ nữ thường dân.
- Chuẩn cắt 1:1, giữ trọn mũ và tóc, nền trong suốt; WebP 64/128/256/512.
- Dùng một bộ chọn ảnh cho danh sách Nhân vật và Popup. Ảnh riêng đã duyệt có ưu tiên cao hơn hình mặc định; nhân vật nước ngoài giữ ảnh cũ.
- Không sửa bài viết, sự kiện, model 3D, cơ sở dữ liệu hay hệ thống trang phục.
- Build V4.5 trên V4.4, giữ bản gốc dự phòng.

## Chưa hoàn tất / điều kiện merge
- Ảnh WebP cần chép từ ZIP ChatGPT vào vietsu/static/avatar-v45/ rồi commit lên nhánh.
- Chưa có phần crop/tách nền trực tiếp trong CMS; kế hoạch V4.6.
- Trang HTML nhân vật ở backend cần áp dụng cùng resolver khi làm đầy đủ hệ thống CMS.
- V4.5 là bản mẫu theo vai trò, chưa xác minh trang phục theo từng niên đại; không gán ảnh như chân dung có thật.
- Phải hoàn thiện PR V4.2, V4.3 (17 WebP) và V4.4 trước khi merge V4.5.

## QA
- Thử HTML offline trên Chromium 1440, 390, 320: 80 nhân vật; avatar nữ hiện; popup Ỷ Lan; không JS errors, không overflow ngang.
- Cần kiểm thử riêng việc deploy GitHub Pages và chạy Backend sau khi đưa ảnh lên.

## Cách tải ảnh lên GitHub
git fetch origin
git switch gpt/v4.5-avatar-standard
Giải nén ZIP và chép vietsu/static/avatar-v45/ vào repository.
git add vietsu/static/avatar-v45
git commit -m 'V4.5: bo sung 6 avatar mau'
git push origin gpt/v4.5-avatar-standard

Trước merge: chạy python3 vietsu/tools/build_v45.py và xác nhận không thiếu ảnh.
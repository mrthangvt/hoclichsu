# VIỆT SỬ V2.5 — Giao diện, danh mục nhân vật và tra cứu học liệu

## Các thay đổi
- Light/Dark được đồng bộ từ trục thời gian Việt Nam–Trung Quốc–Phương Tây, mốc năm, popup đến Hồ Chí Minh.
- Mặc định chọn OpenStreetMap khi có Internet; fallback véc-tơ offline nếu không có kết nối (tile ngoài KHÔNG đóng gói offline).
- Menu Nhân vật lịch sử: danh mục ở giao diện; API `/api/v2.5/characters`, `/api/v2.5/characters/{slug}` và trang SEO mẫu `/nhan-vat/{slug}`.
- Trong hồ sơ triều đại: tự gợi ý những bài SGK từ dữ liệu dùng chung. Có trạng thái chưa thẩm định rõ ràng.
- Bản demo cài app ở sidebar chỉ là hướng dẫn; CHƯA phát hành App Store / Google Play, QR sẽ tạo khi triển khai tên miền.
- Khối SGK là học liệu tham khảo, không phải bản tái bản được Bộ GD&ĐT chứng nhận.

## Chạy thử backend
1. `python -m venv .venv && . .venv/bin/activate`
2. `pip install -r requirements.txt`
3. Tạo `.env` bằng `.env.example`, thiết lập `VIETSU_ADMIN_TOKEN`, `VIETSU_REVIEW_TOKEN` và `SITE_URL`.
4. `uvicorn main:app --reload --host 127.0.0.1 --port 8000`
5. Truy cập `http://127.0.0.1:8000/` và `/nhan-vat/quang-trung-nguyen-hue`.

**Không triển khai public trước khi bổ sung**: đăng nhập và phân quyền thực, giới hạn truy cập, CSRF, sao lưu, bảo vệ dữ liệu, kiểm duyệt tư liệu và kiểm tra bản quyền.

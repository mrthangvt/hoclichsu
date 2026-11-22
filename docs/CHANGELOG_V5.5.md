# Việt Sử V5.5 — Các đời vua trong Sơ đồ triều đại

**Yêu cầu của chủ dự án (23/11/2026):** cập nhật sơ đồ các triều đại, mỗi triều đại bao nhiêu vị vua, đưa vào sơ đồ để khi học xem được hết.

## Đã làm
- Lớp mới `v55.js` / `v55.css`; `vietsu/tools/build_v55.py` chèn vào HTML V5.4; Pages dựng bằng `build_v55.py`.
- Trong popup triều đại, tab **Sơ đồ triều đại** có thêm khối **"Các đời vua"** ngay dưới khung đầu: số đời vua, khoảng thời gian, từng vua đánh số thứ tự với miếu hiệu/tôn hiệu, tên húy, năm trị vì và ghi chú ngắn.
- Cuối khối có dải **"Toàn cảnh các triều đại Việt Nam"** (18 triều, mỗi triều ghi số vua); bấm để chuyển sang triều khác, vẫn ở tab Sơ đồ.
- Số vua: Âu Lạc 1 · Nhà Triệu 5 · Trưng Vương 1 · Vạn Xuân 3 · Họ Khúc – Dương 4 người (tiết độ sứ) · Ngô 3 (+ Dương Tam Kha tiếm ngôi) · Đinh 2 · Tiền Lê 3 · Lý 9 · Trần 12 · Hồ 2 · Hậu Trần 2 · Lê sơ 10 (+ Lê Nghi Dân) · Mạc 5 (ở Thăng Long) · Lê trung hưng 16 · Tây Sơn 3 · Nguyễn 13. Hồng Bàng ghi là truyền thuyết (18 đời Hùng Vương).
- Người tiếm ngôi / không được sử cũ xếp vào chính thống (Dương Tam Kha, Lê Nghi Dân) hiển thị khung nét đứt; Dương Nhật Lễ ghi chú dưới Trần Dụ Tông.

## Nguồn
Đại Việt sử ký toàn thư (đến 1656) và Việt Nam sử lược (Tây Sơn, Nguyễn). Năm trị vì tính theo năm lên ngôi; một số sách chép lệch một năm. Nhà Triệu có ghi chú: sử cũ chép thành một kỷ, nhiều nhà sử học hiện đại không coi là triều đại của người Việt.

## Đã kiểm tra
Chromium desktop 1440 px và mobile 390 px: 26 mã triều đại (kể cả mã trùng như `ly`/`le-so`/`leso`) đều hiện đúng số vua; bấm chuyển triều trong dải toàn cảnh giữ nguyên tab Sơ đồ. Không lỗi JavaScript.

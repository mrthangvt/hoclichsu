# VIỆT SỬ V4.6 — CMS avatar và liên kết sa bàn 3D
Ngày cập nhật: 16/11/2026

## Những thay đổi đã lập trình

1. **Không gian lịch sử:** Khi mở một điểm địa lý có sa bàn 3D, Popup có thẻ nổi bật và nút `Vào trải nghiệm sa bàn 3D`. Hiện Thành cổ Quảng Trị 1972 có mô hình hoạt động tại `khong-gian/thanh-co-quang-tri/`. Các điểm chưa có asset không hiển thị nút rỗng. API `/api/v4.6/scene-assets` đọc bản ghi `experiences_seed.json` với asset_url nội bộ và trạng thái prototype/ready/published; GitHub Pages có bản dự phòng cho Thành cổ.
2. **Popup:** chế độ Full căn giữa, mở rộng chiều ngang tối đa 1560px và chiều dọc theo viewport, chừa lề; mobile tối ưu 12px; chế độ Rộng/Vừa vẫn có. Loại thông báo sai "chưa phải môi trường game 3D" trong Popup Thành cổ.
3. **Nhân vật – Hồ Chí Minh:** ảnh trong danh mục và Popup lấy cùng ảnh chương 7 trong Timeline Hồ Chí Minh hiện có, không vẽ hoặc tạo ảnh mới. Trang chi tiết trên Backend ưu tiên file `static/assets/hcm_stages/07_di_san.webp` nếu chưa có ảnh riêng đã duyệt.
4. **Nhân vật Trung Quốc:** dùng hình bóng người trung tính không mang trang phục một triều đại cụ thể, trừ khi đã có ảnh riêng qua CMS được duyệt. Không gán sai trang phục.
5. **CMS quản lý avatar:** menu `/admin/avatar`; cắt vuông, zoom/dịch ảnh, xem thử 64/96/160px, tùy chọn loại bỏ nền trắng đơn giản, nhập nguồn ảnh và thông tin quyền, lưu WebP qua API. Ảnh chưa duyệt giữ ở bản nháp. Có thể gỡ ảnh và quay về mặc định.
6. **Backend:** `avatar_v46.py` dùng xác thực mã quản trị hiện tại; chỉ xuất bản ảnh `approved: true`; ảnh tùy chỉnh ở `static/uploads/avatars/`, dữ liệu bản ghi ở `data/avatar_overrides_local.json`, đều được .gitignore; không ghi đè ảnh cũ, không đụng SQLite.
7. **Xuất bản:** `tools/build_v46.py` xây từ V4.5; `main.py` ưu tiên V4.6; `start_local.command` tự build V4.6; Pages tĩnh dùng V4.6 (không chứa CMS).

## Quan trọng: điều kiện xuất bản
- **V4.2–V4.5 chưa merge vào main**; nhánh V4.6 được tạo từ `gpt/v4.5-avatar-standard`, do đó phải điều phối các PR trước khi đưa lên website chính.
- **Thiếu 17 file WebP V4.3 và 24 file WebP V4.5 trên GitHub**. Gói `Viet_Su_V4.6_Assets_Cho_GitHub.zip` trong cuộc trò chuyện chứa đúng 41 file và hướng dẫn chép vào `vietsu/static/`. Đưa toàn bộ lên nhánh V4.6 trước khi kiểm thử build; không merge nhánh thiếu ảnh.
- GitHub Pages không chạy FastAPI. CMS quản lý avatar chạy Local qua `http://127.0.0.1:8000/admin/avatar`. Ảnh upload Local không tự đồng bộ lên GitHub Pages, phải xuất bản/đẩy lên máy chủ thật khi triển khai Backend.
- Tách nền trắng bằng thuật toán ngưỡng màu, **không phải tách nền AI chuyên sâu**; cần dùng PNG nguồn trong suốt nếu nền phức tạp.
- Ảnh phục dựng và hình đại diện trung tính không phải chân dung đã được sử học chứng thực.

## Cách xem và kiểm thử trên Mac
```bash
git fetch origin
git switch gpt/v4.6-avatar-cms-scenes
# Sau khi bổ sung đủ 41 ảnh:
cd vietsu
bash start_local.command
```

Mở `http://127.0.0.1:8000/`, vào Không gian lịch sử → Thành cổ Quảng Trị → nút 3D ở Popup. Mở quản trị tại `http://127.0.0.1:8000/admin/avatar`, nhập mã quản trị đã có, chọn ID nhân vật và tải ảnh.

## Kiểm thử
- Cú pháp `v46.js` và đoạn JS trong trang quản trị: đã được kiểm tra bằng bộ phân tích JavaScript.
- Tạo thêm workflow kiểm thử cú pháp Python, JavaScript và các đường dẫn sa bàn/HCM trong `.github/workflows/check-v46.yml`.
- Chưa kiểm thử đầy đủ Backend Local của người dùng hoặc GitHub Pages sau khi merge và đưa đủ ảnh; cần làm trước khi chuyển PR từ Draft sang Ready.

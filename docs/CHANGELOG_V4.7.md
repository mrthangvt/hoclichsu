# Việt Sử V4.7 — KHÓA GIAO DIỆN THEO V4.6

**Quyết định ngày 17/11/2026:** Chủ dự án yêu cầu giao diện V4.7 giữ nguyên **100%** giao diện đã thống nhất ở V4.6. Chỉ thay giao diện khi chủ dự án yêu cầu rõ ràng.

## Những gì được khóa
- Bố cục, vị trí và thứ tự các khối, header/menu, timeline, bản đồ, các tab, Popup kích thước Rộng/Vừa/Full.
- Font, màu sắc, khoảng cách, bo góc, hình ảnh, icon, hiệu ứng, điều khiển, hành vi responsive trên desktop/mobile.
- Không thêm một thanh 13 tab/chuyên mục, thẻ hồ sơ nổi, CSS mới hoặc JS ghi đè `renderModal` vào trang công khai.
- Không thay màn hình xem trước bằng **giao diện demo độc lập khác V4.6**; demo kiểu cũ của V4.7 đã bị gỡ.

## Tính năng V4.7 vẫn có
- 19 giai đoạn × 13 chuyên mục dữ liệu nằm trong `static/v47-periods.json` và API `/api/v4.7/period-profiles`.
- CMS `/admin/periods` để biên tập/duyệt. Dữ liệu lưu riêng, bản nháp không xuất bản.
- **Chưa hiện khối 13 chuyên mục lên trang công khai**: không có vùng UI đã được duyệt để gắn mà không làm đổi giao diện. Việc hiển thị phải được bố trí sau khi có yêu cầu cụ thể của chủ dự án.
- Nền tảng V4.6 (nút sa bàn 3D, Popup, avatar CMS) giữ nguyên.

## Quy tắc kỹ thuật / kiểm tra hồi quy
- `tools/build_v47.py` build V4.6 rồi **sao chép chính xác** HTML V4.6 sang V4.7, so SHA-256 byte-for-byte; sai là lỗi và không công bố.
- CI kiểm tra cơ chế khóa bằng tệp mẫu, đồng thời kiểm tra 19 × 13, mã Python và quyền riêng tư của CMS.
- Không đóng gói `v47.css`, `v47.js` hoặc `Preview_Viet_Su_V4.7_Offline.html` tự thiết kế.
- Khi cần tính năng mới, ưu tiên làm dữ liệu/backend; mọi thay đổi thành phần hiển thị cần sự chấp thuận riêng và có bản so sánh trước/sau.

## Điều kiện chưa hoàn thành từ V4.6
- GitHub đang thiếu 41 ảnh WebP bắt buộc của V4.3/V4.5 (theo PR #6); vì vậy chưa thể xác nhận build hoàn chỉnh V4.6 và V4.7.
- PR V4.7 giữ ở chế độ **Draft**, không merge main hoặc đưa lên VPS trước khi có đủ ảnh, chạy test thực tế và được duyệt.

# VIỆT SỬ V2.7 — Icon và nhập học liệu hàng loạt

- Submenu SGK: mũi tên ngoài khung được căn giữa; trong nút là SVG icon sách.
- Bộ icon gươm, khiên được xử lý từ ảnh do người dùng cung cấp và nhúng trong HTML offline.
- CMS có menu **Nhập bài hàng loạt**. Chọn 1–100 tiêu đề (mỗi dòng một bài), hoặc nhập JSON theo mẫu `Mau_nhap_bai_hang_loat.json` để lưu vào trạng thái `draft`.
- API: `POST /api/v2.7/articles/bulk-drafts` (cần `X-Admin-Token`, tối đa 100 bài/yêu cầu, slug trùng sẽ được báo bỏ qua).
- Dữ liệu từ nguồn bên ngoài phải được biên tập lại phù hợp với quyền sử dụng; không tự xuất bản bản nháp AI hoặc nội dung chưa được kiểm chứng.
- Trước khi mở công khai, cần triển khai đăng nhập RBAC, rate limit, CSRF, sao lưu dữ liệu và hàng đợi nền cho AI.

## Quy trình nhập nhanh
1. Tạo danh mục đề cương theo lớp/triều đại/nhân vật với các trường `title`, `category`, `entity_id`, `timeline_year`.
2. Nhập 100 đề cương/lượt, ưu tiên điền URL nguồn đã có quyền khai thác và/hoặc nội dung gốc tự biên soạn.
3. Dùng mục **AI tạo bản nháp** cho các đề cương cần viết; kiểm tra dữ kiện, ghi rõ nguồn, đối chiếu niên đại.
4. Chỉ biên tập viên thẩm định mới công bố. Sau công bố, bài sẽ có URL/SEO và gắn được với timeline qua `entity_id`.

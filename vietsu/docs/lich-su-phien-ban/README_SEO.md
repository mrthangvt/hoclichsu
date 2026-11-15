# Việt Sử V2.6 — bổ sung SEO kỹ thuật

## Đã cập nhật
- Trang chủ phục vụ qua FastAPI: tạo canonical tuyệt đối từ `SITE_URL`, meta description, Open Graph, JSON-LD `WebSite` và `WebPage` ngay trong mã HTML trả về từ máy chủ.
- Bài đã công bố: canonical + JSON-LD `Article` (giữ lại từ các bản trước).
- Hồ sơ nhân vật: canonical + JSON-LD `Person`; bản nháp gắn `noindex` và không có trong sitemap.
- `sitemap.xml`: có trang chủ, bài đã xuất bản, nhân vật đã được duyệt.
- `robots.txt`: chặn admin, API; môi trường mặc định localhost chặn lập chỉ mục toàn site.
- `/admin` trả về `X-Robots-Tag: noindex, nofollow`.
- File HTML xem offline có `noindex`, không gắn canonical vì chưa có tên miền công khai.

## Trước khi triển khai công khai
1. Cấu hình `SITE_URL=https://TEN-MIEN-THAT-CUA-ANH` (không có dấu / cuối).
2. Cấu hình HTTPS và chuyển hướng 301 từ HTTP sang HTTPS, đồng nhất www/non-www.
3. Chỉ phát hành website sau khi hoàn thiện tài khoản, bảo mật và thẩm định học liệu.
4. Kiểm tra mã HTML từ máy chủ tại trang chủ, các bài đã công bố, hồ sơ nhân vật; đảm bảo một canonical tuyệt đối duy nhất và Schema.org hợp lệ.
5. Kiểm tra sitemap/robots.txt thực tế trên tên miền, Google Search Console và Rich Results Test (không phải mọi schema đều đủ điều kiện hiển thị rich result).

**Lưu ý:** Hiện V2.6 vẫn là nguyên mẫu; đây là bổ sung SEO kỹ thuật, không phải xác nhận đã đạt chuẩn SEO toàn diện hoặc đã triển khai lên website thật.

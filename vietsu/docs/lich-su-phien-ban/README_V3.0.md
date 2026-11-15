# VIỆT SỬ V3.0

## Những thay đổi chính
- Sửa toàn bộ nền tối còn sót của các thẻ học liệu, bài viết liên quan và điểm pin trong Popup Hồ Chí Minh khi chọn giao diện sáng.
- Danh mục Nhân vật lịch sử chia thành hai cột **Việt Nam – Trung Quốc** trên desktop. Nhân vật ngoài hai nước có khu vực riêng, không bị gán nhầm quốc gia. Điện thoại tự xếp một cột.
- Ẩn phần tử logo rỗng sinh ô vuông thừa. Nếu nhập `logo_url` tại CMS, ảnh logo mới hiển thị; không nhập thì giữ biểu tượng 越史.
- Dùng mask alpha để hình Hồ Chí Minh lấy trực tiếp màu chữ hiện tại, đồng bộ trong cả giao diện sáng và tối.
- Đổi nhãn điều khiển thành **Giao diện sáng / Giao diện tối**.

## Phần triển khai
Chạy ứng dụng qua FastAPI theo README gốc để sử dụng CMS. File HTML offline không tự đồng bộ dữ liệu quản trị. Các chức năng SEO (canonical, JSON-LD, sitemap, robots/noindex) của V2.9 được giữ lại.

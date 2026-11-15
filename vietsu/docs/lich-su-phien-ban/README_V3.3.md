# VIỆT SỬ V3.3 – Đại Việt Sử Ký Toàn Thư

## Nội dung đã đưa vào
- Đối chiếu 25 kỷ / giai đoạn với bản PDF 739 trang do người dùng cung cấp.
- Bổ sung 20 mốc dọc theo dòng thời gian hiện có, giữ nguyên các dòng Trung Quốc và phương Tây.
- 35 hồ sơ nhân vật có 2 đoạn diễn giải, vai trò, nguồn và số trang PDF.
- 783 điểm tra năm / trang sách dùng cho nhóm biên tập, cùng chỉ mục 739 trang.
- Popup triều đại hiển thị ghi chú nguồn, loại tư liệu và các nhân vật liên quan.
- Các trang nhân vật SEO được bổ sung trên backend, bản nháp tiếp tục noindex.
- CMS có mục đổi ảnh nhân vật (tải PNG/JPEG/WebP hoặc dán URL).

## Nguyên tắc thẩm định
- Dữ liệu công khai là bản tóm lược, không sao chép bản dịch tiếng Việt năm 1993.
- Truyền thuyết được phân loại rõ; giai đoạn nhà Triệu phải hiển thị sự khác biệt giữa cách xếp kỷ sử cũ và nghiên cứu sau này.
- Một số niên đại trong sách khác quan điểm nghiên cứu đương đại; giữ song song cách ghi khi cần.
- File PDF đang có dừng giữa một câu năm 1656; không mặc định toàn bộ sách 1697 đã được nhập.
- Ảnh Wikimedia là liên kết thử nghiệm, cần xác minh giấy phép và tải về hợp lệ trước khi công bố.

## Chạy thử
`pip install -r requirements.txt`
`export VIETSU_ADMIN_TOKEN=...`
`export VIETSU_REVIEW_TOKEN=...`
`uvicorn main:app --host 127.0.0.1 --port 8000`

Mở `/admin` để thay ảnh nhân vật. Bản HTML offline hoạt động không cần server nhưng ảnh trực tuyến chỉ hiện khi có mạng.

**Lưu ý:** Backend là nguyên mẫu chưa được kiểm thử bảo mật để công bố trên VPS.

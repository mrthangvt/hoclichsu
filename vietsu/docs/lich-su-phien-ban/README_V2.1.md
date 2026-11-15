# VIỆT SỬ V2.1 — Web offline và CMS

## Bản offline
Mở `Viet_Su_Timeline_V2.1_Offline.html` trong trình duyệt. Menu mới **Sách giáo khoa Lịch sử** cho phép chọn lớp 6–12, đọc đề cương và chuyển đến timeline. Popup hồ sơ triều đại hiện bảng đối chiếu cùng thời và nguồn.

## Dữ liệu mới
- `data/dynasty_crosswalk.json`: đối chiếu theo bài nguồn kho đề cương; giữ nhãn cần thẩm định.
- `data/school_lessons.json`: danh mục đề cương cho lớp 6–12, mỗi bài liên kết niên đại và entity_id. Các đề cương **không phải SGK chính thức**, cần đối chiếu bộ sách hiện hành.
- Nội dung từ tư liệu nghiên cứu được định hướng làm nguồn nghiên cứu tham khảo, không sao chép và không tự động công bố.

## CMS và API
Từ thư mục backend cài `pip install -r requirements.txt`, đặt `VIETSU_ADMIN_TOKEN`, `VIETSU_REVIEW_TOKEN`, sau đó chạy `uvicorn main:app --reload`.
Các API mới:
- GET `/api/v2.1/dynasty-crosswalk`
- GET `/api/v2.1/school/grades`
- GET `/api/v2.1/school/grades/6` ... `/12`
- GET `/api/v2.1/school/related/{entity_id}`

Bài viết do CMS tạo dùng `timeline_year` và `entity_id` để liên kết. Để sau này có bài SGK chính thức cần thêm trường grade/chapter/lesson vào bảng articles và duyệt theo từng chương trình giáo dục. V2.1 chỉ triển khai catalog API và đường dẫn điều hướng.

## Nguồn tham khảo
- 
-  (các lớp thay số 6 thành 7–12)
- 
- 
- 

## Lưu ý
Một số mốc trong bảng nguồn không nhất quán (ví dụ niên đại Hồng Bàng và khoảng trị vì Lý Thần Tông); dữ liệu đối chiếu **không** được áp dụng như chân lý duy nhất. Cần hội đồng thẩm định trước khi xuất bản học liệu. Trang web kho đề cương đang giới thiệu tài liệu SGK có cách phân chia của bộ sách cũ ở nhiều lớp; không mặc định khớp SGK hiện hành.

Backend hiện là **prototype**, chưa được gia cố bảo mật để đưa lên Internet.

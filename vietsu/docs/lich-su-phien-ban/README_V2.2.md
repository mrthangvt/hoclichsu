# VIỆT SỬ V2.2 — Mục lục Sách giáo khoa Lịch sử lớp 6–12

Đã nhập **233 mục bài học** từ Mục lục tham khảo của kho đề cương. Các mục giữ đủ nhãn bài và những bài tách phần. Phân nhóm Phần / Chương / Bài. Phần đánh số bài có thể thiếu số do cấu trúc nguồn; không tự thêm bài không có trong nguồn.

## Số bài theo lớp
- Lớp 6: **26** mục bài học
- Lớp 7: **51** mục bài học
- Lớp 8: **31** mục bài học
- Lớp 9: **34** mục bài học
- Lớp 10: **40** mục bài học
- Lớp 11: **24** mục bài học
- Lớp 12: **27** mục bài học


## Bản chạy ngoại tuyến
- Mở `Viet_Su_Timeline_V2.2_Offline.html` trên máy.
- Menu **Sách giáo khoa Lịch sử**, chọn lớp, mở rộng chương, tìm bài và mở Popup.
- Có bài đã viết tóm tắt biên tập mẫu; đa số chỉ là mục lục và khung học liệu, có nhãn **Đang xây dựng học liệu**.
- Nút về năm trên timeline chỉ xuất hiện với mốc đủ căn cứ kết nối. Các năm được gắn sơ bộ chưa được thẩm định.

## Backend API mới
- `GET /api/v2.2/textbooks`: thống kê.
- `GET /api/v2.2/textbooks/grade/6`...`/12`: toàn bộ mục lục, tìm kiếm `keyword=`, lọc `entity_id=`.
- `GET /api/v2.2/textbooks/lesson/g7-b14-p1`: bài học cụ thể.
- `GET /api/v2.2/textbooks/related/tran`: bài liên quan một triều đại.

Tệp nguồn: `data/textbook_catalog.json`.

## Nguồn và phạm vi
- Mục lục:  ... /lop-12
- Lớp 6: người dùng cung cấp ảnh, so sánh với bảng mục lục trang lớp 6.
- Tên bài và thứ tự theo tài liệu được trang kho đề cương tổng hợp, **không tuyên bố là SGK thuộc một bộ sách phát hành năm 2026**.
- Không tự nhập toàn văn từ nguồn. Trích URL tham khảo để người dùng đọc. Nội dung học tập riêng phải được biên soạn, kiểm tra bản quyền, thẩm định.

Backend giữ nguyên tính chất thử nghiệm, chưa đủ cơ chế xác thực và bảo mật để triển khai công khai.

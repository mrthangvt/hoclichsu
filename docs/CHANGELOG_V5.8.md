# Việt Sử V5.8 — Sách giáo khoa Lịch sử lớp 6–12, chuyển bài, icon và ảnh Hồ Chí Minh (23/11/2026)

Theo yêu cầu chủ dự án: đưa nội dung bài học lớp 6, lớp 7 vào menu **Sách giáo khoa Lịch sử**; sắp xếp lại các bài lớp 6–12 đúng theo SGK; thêm nút chuyển bài; sửa icon và thay ảnh Hồ Chí Minh.

## Thay đổi
- Mục lục lớp 6 (20 bài) và lớp 7 (18 bài + 2 chủ đề chung) theo đúng SGK **Lịch sử và Địa lí 6, 7, bộ Kết nối tri thức với cuộc sống** (NXB Giáo dục Việt Nam), phần Lịch sử: tên bài, chương, số trang. Thay cho đề cương minh họa cũ.
- Mỗi bài có: tóm tắt, các mục nội dung chính, ghi nhớ, câu hỏi ôn tập, số trang SGK để học sinh đối chiếu; nút đến năm tương ứng trên dòng thời gian (bài có mốc rõ). Bài 12 lớp 7 có nút vào sa bàn 3D Như Nguyệt (chạy sau khi PR khung sa bàn Như Nguyệt được merge).
- **Nội dung biên soạn lại bằng lời văn riêng**, không chép nguyên văn sách, không dùng hình ảnh, lược đồ của sách (SGK có bản quyền của NXB). Mỗi lớp ghi rõ nguồn và lưu ý này.
- **Lớp 8–12: mục lục đúng theo SGK** bộ Kết nối tri thức (Lịch sử và Địa lí 8, 9; Lịch sử 10, 11, 12): lớp 8 có 19 bài + 2 chủ đề chung, lớp 9 có 21 bài + 3 chủ đề chung, lớp 10 có 13 bài, lớp 11 có 13 bài, lớp 12 có 17 bài; mỗi bài có tên, chủ đề/chương, trang, mốc năm (nếu rõ) và một câu tóm tắt. Nội dung chi tiết đang biên soạn (cửa sổ bài ghi rõ và chỉ số trang SGK).
- **Nút Bài trước / Bài tiếp theo** ở đầu và cuối cửa sổ bài học (kèm số thứ tự bài), dùng được cả phím mũi tên trái/phải.
- **Sửa lỗi mất icon Chủ tịch Hồ Chí Minh** trên menu khi chọn mục này (mã V2.9 vẽ lại menu bằng icon dạng mặt nạ, V5.2 bỏ mặt nạ nên còn ô trống): V5.8 luôn đặt lại ảnh icon `static/v49/hcm-menu.webp` cho menu desktop và mobile.
- **Ảnh chặng "Thơ ấu và trưởng thành" (1890–1911)** của Chủ tịch Hồ Chí Minh thay bằng ảnh minh họa chủ dự án gửi (`static/v58/hcm-tho-au.webp`, cắt khung chân dung).

## Tệp
- Dữ liệu gốc: `vietsu/data/sgk_kntt_lop6.json` … `sgk_kntt_lop12.json` (sửa nội dung ở đây; bài chưa có nội dung đánh dấu `"dang_bien_soan": true`).
- `vietsu/tools/build_v58.py`: kiểm tra dữ liệu, sinh `vietsu/static/v58-sgk.js`, dựng `Viet_Su_Timeline_V5.8_Offline.html` từ V5.7 (chỉ thêm `v58.css`, `v58-sgk.js`, `v58.js`).
- `v58.js`: thay danh sách bài lớp 6, 7 trong `V21_LESSONS`, sửa nhãn trong mục lục V2.4 (`#v22Toc`), mở bài đầy đủ trong cửa sổ bài học.
- Pages dựng qua `build_v58.py`.

## Kiểm tra
- Desktop 1440 px và mobile 390 px: lớp 6–12 hiện đủ 20, 20, 21, 24, 13, 13, 17 bài theo thứ tự SGK; mở bài, Bài tiếp theo / Bài trước (nút và phím mũi tên), nút timeline hoạt động; icon Hồ Chí Minh còn sau khi chọn menu; ảnh chặng 1 đã thay; không có lỗi JavaScript.
- Nguồn đọc: bản PDF SGK lớp 6–12 chủ dự án cung cấp; mục lục đọc trực tiếp từ trang mục lục, lớp 6, 7 nhận dạng chữ (OCR) để đối chiếu nội dung, mốc thời gian.

## Cập nhật dữ liệu 24/11/2026 (nhánh `claude/v59-sgk-lop8-12`)
- **Lớp 8–12 đủ nội dung từng bài** (88 bài): mục chính, ghi nhớ, câu hỏi ôn tập, biên soạn lại bằng lời văn riêng theo mạch bài của SGK; không còn bài "đang biên soạn". Lớp 10–12 chủ dự án chỉ có bản PDF trích (59/51/59 trang) nên các bài sau phần trích được viết theo chương trình Lịch sử 2018, đối chiếu tên bài và trang trong mục lục.
- **Liên kết sa bàn 3D** trong bài: lớp 9 bài 15 và lớp 12 bài 7 → Điện Biên Phủ; lớp 11 bài 7 → Như Nguyệt (cần merge PR #42); lớp 11 bài 8 → Bạch Đằng 938; lớp 12 bài 8 → Thành cổ Quảng Trị.
- Không đổi mã; chỉ sửa `vietsu/data/sgk_kntt_lop8..12.json` và sinh lại `v58-sgk.js`.

# Việt Sử V5.4 — Mobile: thẻ trang phục gọn, nhãn "Tóc & Mũ", menu dưới một hàng

**Yêu cầu của chủ dự án (22/11/2026):**
1. Trên mobile, thẻ trang phục trong dòng thời gian bị vỡ bố cục: chữ bị ép thành cột một ký tự, không đọc được và chiếm nhiều chỗ.
2. Đổi "Hair & Hat" thành "Tóc & Mũ".
3. Menu dưới trên mobile nằm gọn một hàng, không xuống hàng.

## Cách làm
- Lớp mới `v54.css` / `v54.js`; `vietsu/tools/build_v54.py` chỉ chèn hai dòng vào HTML V5.3. Pages dựng bằng `build_v54.py`.
- Thẻ "Trang phục" và "Tóc & Mũ" (≤ 700 px): hai thẻ cạnh nhau, ảnh 38 px ở trên, tên ở dưới, mô tả tối đa 2 dòng (đầy đủ khi bấm mở). Màn hẹp ≤ 360 px cho tên xuống dòng.
- Nhãn "Tóc & Mũ" đổi bằng `v54.js` (áp dụng cả desktop), tự cập nhật khi dòng thời gian vẽ lại.
- Menu dưới: 6 mục (Dòng thời gian, Hồ Chí Minh, Nhân vật, Không gian, Bộ đề, Sách giáo khoa) chia đều trên một hàng.
- Desktop giữ nguyên bố cục.

## Đã kiểm tra (Chromium, bản dựng như Pages)
- 390 px và 320 px: thẻ trang phục đọc được, menu một hàng (6 nút cùng hàng). Desktop 1440 px không đổi bố cục, nhãn đã là "Tóc & Mũ". Không lỗi JavaScript.

## V5.4.1 — Thanh chọn năm nhanh trên mobile (22/11/2026)
- Theo yêu cầu chủ dự án: mobile hiện lại thanh mốc năm (2879 TCN … 1975) ở đầu dòng thời gian, dính đầu màn hình khi cuộn, vuốt ngang để chọn; bấm một mốc thì nhảy tới đúng mốc đó và mốc được tô sáng. Thêm vào cuối `v54.css`, không cần đổi bản dựng.
- Đã thử 390 px: bấm 1789 → mốc 1789 nằm ngay dưới thanh, không bị che.

## V5.4.2 — Sửa lỗi mobile và điền nội dung hồ sơ thời kỳ (22/11/2026)
**Yêu cầu của chủ dự án:** (1) trên mobile, sau khi vào Bộ đề rồi chọn mục khác, nút Bộ đề vẫn sáng; (2) bấm Trợ lý Việt Sử thì khung chat bị phóng to chiếm hết màn hình; (3) điền nội dung các mục còn "Đang biên tập" từ thư mục tài liệu.

- `v54.js`: bấm bất kỳ mục menu nào khác thì nút Bộ đề tắt sáng.
- `v54.css`: ô nhập (Trợ lý Việt Sử, tìm kiếm) dùng chữ 16 px trên mobile. iPhone tự phóng to trang khi bấm vào ô nhập có chữ nhỏ hơn 16 px — đó là nguyên nhân khung chat bị phóng to.
- `v47-periods.json`: điền 87 mục còn trống (19 giai đoạn × 13 chuyên mục nay đủ 247/247) và cập nhật mục Di sản của Tây Sơn (đã có sa bàn 3D).
  - Nguồn: Đại Việt sử ký toàn thư (bản dịch 1993) và Việt Nam sử lược — PDF chủ dự án cung cấp trong thư mục "Tài liệu sử". Viết lại bằng lời mới, không chép nguyên văn; mỗi mục có chỉ dẫn trang trong trường mới `section_sources`.
  - Các mục mới nằm trong trường `draft_sections` của từng giai đoạn — là bản thảo chờ duyệt. Nơi sử liệu không chép (ví dụ luật lệ thời Xích Quỷ), nội dung ghi rõ là không có tư liệu thay vì suy đoán.
  - Giai đoạn 1945 – nay: thư mục chưa có sách chuyên về thời kỳ này (tài liệu ôn thi lớp 12 chủ yếu là lịch sử thế giới), nên 13 mục chỉ nêu các mốc phổ biến trong SGK Lịch sử 12, cần duyệt kỹ và bổ sung nguồn.
  - Không đưa PDF lên repo. `check_v410_sources.py` vẫn đạt.
- Lưu ý: dữ liệu 13 chuyên mục hiện chỉ hiện trong CMS `/admin/periods` (bản chạy máy chủ), chưa hiện trên trang công khai vì chưa có vị trí giao diện được duyệt.

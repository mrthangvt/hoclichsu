# Việt Sử V4.10 — BỔ SUNG TƯ LIỆU, KHÓA GIAO DIỆN V4.6

**Trạng thái:** bản thảo biên tập, không tự xuất bản, không đụng giao diện.
**Nhánh:** `gpt/v4.10-historical-source-enrichment` (kế thừa V4.9).

## Tài liệu do chủ dự án gửi
1. **Trần Trọng Kim, *Việt Nam sử lược*** — PDF 252 trang, bản chuyển điện tử người dùng cung cấp. Có mục lục 5 phần: Thượng cổ (PDF 8–16); Bắc thuộc (17–33); Tự chủ (34–106); Nam – Bắc phân tranh (107–168); Cận kim / nhà Nguyễn (169–237), cuối sách có bản đồ và bảng niên biểu. Những dải trang là định hướng tìm kiếm, không thay cho trích dẫn cụ thể tới chương/đoạn.
2. ***Đại Việt sử ký toàn thư*** — PDF 739 trang người dùng cung cấp, ghi chú Nội Các Quan Bản mộc bản năm 1697, phần dịch của Viện Khoa học Xã hội Việt Nam 1985–1992, xuất bản NXB Khoa học Xã hội 1993. **Bản PDF bị dừng giữa câu ở quyển XXII (tr. PDF 739)**; không coi là bộ đầy đủ, không công bố toàn văn bản dịch khi chưa làm rõ quyền tái bản trực tuyến.

## Phạm vi V4.10
- Bổ sung **79 chuyên mục** có nguồn vào 12 hồ sơ trong tập 19 thời đại (bao gồm Văn Lang và 11 thời kỳ khác). **Không ghi đè nội dung đã có**.
- Gắn danh mục trích dẫn `Việt Nam sử lược` đến **18/19** thời kỳ. *Việt Nam từ 1945 đến nay* không có nguồn đầy đủ từ hai cuốn trên, giữ nguyên `Đang biên tập`, cần nguồn hiện đại.
- Tệp duy nhất thay đổi dữ liệu CMS/API là `vietsu/static/v47-periods.json`. API FastAPI hiện có `/api/v4.7/period-profiles` tự đọc dữ liệu mới khi chạy từ nhánh này. Đây là **dữ liệu chờ duyệt**, chưa đưa ra các thẻ mới trong timeline tĩnh.
- Không thêm CSS, JS, HTML, không can thiệp `build_v49.py` hay GitHub Pages.
- Mọi đoạn mô tả đều **tự viết tóm lược**; không sao chép toàn văn sách.

## Các hồ sơ đã có nội dung được bổ sung
`xichquy`, `vanlang`, `aulac`, `bacthuoc`, `trungvuong`, `vanxuan`, `ngo`, `dinh`, `tienle`, `ho`, `hautran`, `mac`.

Những hồ sơ có sẵn (Lý, Trần, Lê sơ, Lê Trung hưng, Tây Sơn, Nguyễn) chỉ được **bổ sung nguồn sách**; chưa thay nội dung chuyên mục đã duyệt. Chuyên mục còn `Đang biên tập` không được tự điền lời văn chung chung cho đủ số lượng.

## Nguyên tắc kiểm chứng quan trọng
- **Xích Quỷ, Hồng Bàng, Lạc Long Quân – Âu Cơ, nỏ thần, Kim Quy:** trình bày như huyền sử / truyền thuyết, không dựng biên giới hoặc niên đại chắc chắn.
- **Âu Lạc:** giữa các sách và ngay trong các trang có sai khác/nhầm lẫn mốc năm (ví dụ tr. PDF 10 của *Việt Nam sử lược* có các số năm không thống nhất); **không tự động chuẩn hóa thành một niên biểu duy nhất**.
- **Nhà Triệu:** `Đại Việt sử ký toàn thư` (chú thích tại tr. PDF 10) nêu quan điểm chính thống xưa coi Triệu là một kỷ, đồng thời lưu ý quan điểm đó đã bị phê phán từ các sử gia đời sau. Không khẳng định đây là triều đại chính thống của Việt Nam hiện đại.
- **Sĩ Nhiếp:** `Đại Việt sử ký toàn thư` (chú thích tr. PDF 25) phân biệt việc ghi 'Sĩ Vương' với tư cách chính quyền độc lập; không mặc định đó là vua độc lập.
- **Cuộc khởi nghĩa Hai Bà Trưng:** con số 65 thành và các chi tiết tiểu sử là ghi chép sử cũ, không phải địa điểm / số lượng đã được định vị khảo cổ đầy đủ.
- **Nhà Mạc:** các nhận định mang tính phán xét đạo đức của tác giả *Việt Nam sử lược* phải được tách khỏi mô tả biến cố 1527–1592.
- **Không lấy phân loại về nguồn gốc, tính cách dân tộc và quan hệ văn minh trong sách đầu thế kỷ XX làm sự thật hiện đại**; đặc biệt phần 'Chủng loại', 'Gốc tích', 'Người Việt Nam' ở PDF tr. 5–7.
- **Từ 1945 đến nay:** hai tài liệu không trình bày có hệ thống; không được tự suy diễn điền đủ chuyên mục hiện đại.

## Kiểm tra và phê duyệt
1. Chạy `python3 vietsu/tools/check_v410_sources.py`.
2. Chạy build V4.9 để xác nhận giao diện V4.6 kế thừa như cũ; không cần build giao diện V4.10.
3. Review từng đoạn bản thảo và đối chiếu PDF tại các trang ghi trong `sources[]`.
4. Sau khi duyệt nội dung, quyết định có đưa 13 chuyên mục ra giao diện công khai hay không. **Chỉ chủ dự án được quyết định thay UI.**
5. Chưa merge vào `main`, chưa kích hoạt deploy GitHub Pages.

## Ranh giới kỹ thuật
GitHub Pages là trang tĩnh, chưa chạy FastAPI/CMS. Bổ sung `v47-periods.json` **không tự làm xuất hiện hồ sơ mới trên giao diện tĩnh V4.6**; nó sẽ có trong API khi chạy backend từ nhánh này. Muốn hiển thị bản thảo dưới dạng giao diện đọc mới phải có yêu cầu duyệt riêng.

# Việt Sử V5.6 — Hồ sơ vua và tướng lĩnh, sự kiện văn hóa, trắc nghiệm theo triều đại

**Yêu cầu của chủ dự án (23/11/2026):**
1. Bổ sung thông tin cho các nhân vật trong các triều đại, từ các vua đến tướng lĩnh nổi tiếng.
2. Các sự kiện văn hóa của các triều đại.
3. Bộ câu hỏi trắc nghiệm theo từng thời đại để người học chơi và nhớ đúng triều đại.
4. Nhà Trần có 12 vua nhưng sơ đồ triều đại chỉ có 3 vua — kiểm tra và cập nhật.

## Nguyên nhân lỗi sơ đồ nhà Trần
Sơ đồ nhà Trần (hàm `tranDeepBody` từ bản V1.x) có nhánh "Hoàng đế" viết tay chỉ gồm Thái Tông, Thánh Tông, Nhân Tông. Các triều khác thì sơ đồ không có nhánh vua.

## Đã làm
- Lớp mới `v56.css`, `v56-data.js` (dữ liệu), `v56.js`; `vietsu/tools/build_v56.py` chèn vào HTML V5.5; Pages dựng bằng `build_v56.py`. `v55.js` công khai danh sách vua (`window.VS55_DYN`) để dùng chung.
- **Sơ đồ triều đại:** nhánh "Hoàng đế · N vua" có đủ các đời vua cho mọi triều (Trần 12, Lý 9, Lê trung hưng 16, Nguyễn 13…), mỗi nút mở hồ sơ vua.
- **Hồ sơ nhân vật:** 99 hồ sơ vua (dùng lại hồ sơ có sẵn khi đã có; tạo mới cho vua còn thiếu, kèm vua trước – vua sau) và 35 tướng lĩnh, danh nhân mới (Trần Khánh Dư, Phạm Ngũ Lão, Trần Quốc Toản, Trần Bình Trọng, Chu Văn An, Lê Văn Hưu, Mạc Đĩnh Chi, Đặng Tất, Đặng Dung, Nguyễn Biểu, Lê Lai, Nguyễn Xí, Trần Nguyên Hãn, Ngô Sĩ Liên, Lương Thế Vinh, Mạc Kính Điển, Nguyễn Kim, Trịnh Kiểm, Nguyễn Hoàng, Đào Duy Từ, Nguyễn Thiếp, Lê Văn Duyệt, Nguyễn Công Trứ, Hoàng Diệu, Tôn Thất Thuyết, Phan Đình Phùng, Nguyễn Du…). Một số hồ sơ có sẵn (Vạn Hạnh, Ỷ Lan, Lê Văn Thịnh, Nguyễn Bỉnh Khiêm, Lê Quý Đôn…) được gắn thêm vào tab Nhân vật của triều tương ứng.
- **Tab Nhân vật:** khối "Các đời vua" (thẻ đánh số, chạm để mở hồ sơ) ngay đầu tab, tướng lĩnh – danh nhân trong lưới chân dung bên dưới.
- **Tab Văn hóa – xã hội:** khối "Sự kiện văn hóa" cho 17 triều (56 mốc: chiếu dời đô, Văn Miếu, khoa thi đầu tiên, Hịch tướng sĩ, Thiền phái Trúc Lâm, thành nhà Hồ, Bình Ngô đại cáo, bia tiến sĩ, Hội Tao đàn, từ điển Việt – Bồ – La, Truyện Kiều, Cửu đỉnh…).
- **Tab Trắc nghiệm:** trò chơi 8 câu/lượt cho mỗi triều, hỏi từng câu, chấm ngay và giải thích, có thanh tiến độ, điểm, điểm cao nhất trên máy, "Chơi lại" đổi câu hỏi. Câu hỏi sinh từ dữ liệu đã kiểm (số đời vua, vua đầu – vua cuối, năm trị vì, việc gắn với từng vua, sự kiện văn hóa, nhân vật), đáp án nhiễu lấy từ triều khác hoặc vua khác. Nhà Trần giữ thêm bộ 9 câu cũ.

## Nguồn
Đại Việt sử ký toàn thư, Việt Nam sử lược (PDF chủ dự án cung cấp); số trang PDF của từng tướng lĩnh, danh nhân được tìm và ghi trong hồ sơ. Viết lại bằng lời mới, không chép nguyên văn. Các chi tiết thuộc truyền tụng (Trần Quốc Toản bóp nát quả cam, Lê Lai cứu chúa, Yết Kiêu, "Lưỡng quốc trạng nguyên") được ghi rõ là truyền tụng. Tất cả là bản tóm lược chờ thẩm định.

## Đã kiểm tra
Chromium desktop 1440 px và mobile 390 px: 18 triều đều có nhánh vua đủ số, khối Các đời vua, sự kiện văn hóa (trừ Nhà Triệu) và trò chơi trắc nghiệm; chơi hết một lượt hiện kết quả. Không lỗi JavaScript.

# Thành cổ Quảng Trị 1972 — bản V2 → V2.3 (22–23/11/2026)

Làm trong phiên Claude từ gói ZIP anh Thắng gửi (bản artifact), nay đưa về repo. Mô hình 3D cũ (`static`, `qdnd`, `vnch`, `thuvien`, `thuyen`) giữ nguyên byte; thêm `qdvn_a.glb`, `qdvn_b.glb`.

## V2
- Màn tải xong có nút "▶ Xem sa bàn" (mở khoá âm thanh, vào thẳng phim).
- Mặt nước sông, hào kiểu Bạch Đằng (màu theo độ sâu, sóng, phản chiếu trời).
- Thêm động tác bơi (bơi, đạp nước, bơi vào bờ) và bè.
- Nhạc nền theo chương (`episodes.json › music`, nhiều đoạn mỗi chương, tự giảm khi có lời dẫn).
- VNCH tấn công vừa đi vừa bắn, bỏ lộn nhào.
- Nền đất hết lộ ô vuông (trộn 2 lớp texture xoay, làm mượt lưới địa hình — **xoá thuộc tính normal trước `computeVertexNormals`**), ngoài thành luôn phủ cỏ.
- Cảnh cuối: cờ VNCH kéo lên có gạch chéo đỏ.

## V2.1
- Voice mới (`Voice-ThanhCoQuangTri-Final`), cắt lại 61 câu bằng nhận dạng tiếng nói + dời chỗ cắt vào khoảng lặng thật (`tools/thanh_co_quang_tri/voice/can2.py`); hết mất đuôi câu. Voice tải sẵn thành blob, là đồng hồ chính của phim.
- Bấm "Xem sa bàn" chạy cả nhạc lẫn hiệu ứng âm thanh.
- Màn hình không tự tắt khi xem (Wake Lock + video câm lặp `media/giu-man-hinh.mp4`); mở lại màn hình thì âm thanh tự khôi phục.

## V2.2
- Hai mẫu lính QĐVN mới (đầu trần, mũ tai bèo, không ba lô) gắn vào khung xương `qdnd.glb` (`tools/thanh_co_quang_tri/nhan-vat/`); bỏ hẳn mẫu cũ vì khác màu. `qdnd.glb` chỉ còn để lấy động tác.
- Động tác mới `data/clips_moi.json` (Mixamo): ngồi ôm súng, ngồi trên thùng đạn, nằm bắn, đứng bắn, đứng ngắm.
- Nghỉ vẫn cầm súng; qua sông chạy khom vào thành qua cổng Tây.
- Âm thanh thu sẵn (tiengdong.com): máy bay ném bom khớp tiếng nổ theo đồng hồ âm thanh, tiếng nổ, tiếng súng, nền giao tranh.

## V2.3
- Thế cầm súng cả hai bên: báng tì vai phải, tay phải nắm tay cầm, tay trái đỡ ốp lót (IK hai đoạn `ik2` trong `aimGun`); đi khom/chạy cầm súng sẵn sàng.
- Phân cảnh 10 (`memorial`): Thành cổ hôm nay (`js/park.js`) — tường thành xây lại, cầu qua hào 4 cổng, mặt đất san phẳng, bãi cỏ, trục Bắc–Nam, đường dạo gạch đỏ, quảng trường + Đài tưởng niệm biểu tượng, hàng dừa, lùm cây, công trình mái ngói đỏ. Dạng biểu tượng, phỏng theo ảnh chụp trên cao (ảnh không đưa vào repo).

## Chưa đưa vào repo
- Nhạc nền `audio/nhac/*.mp3` (8 bản Epidemic Sound): chờ chủ dự án xác nhận giấy phép cho phép để tệp nhạc trong repo công khai / GitHub Pages. Thiếu nhạc thì sa bàn vẫn chạy, chỉ không có nhạc nền.

## V2.4 (27/11/2026)
- **Thuyền vượt sông:** thân thuyền dài ra (~6,6 m), người quỳ/chèo dời khỏi hai đầu cong lên — chân không còn thò qua đáy, mạn thuyền.
- **Kéo thuyền lên bờ:** 4 người quay mặt về mũi thuyền đi lùi kéo dây (động tác "Pull Heavy Object" như kéo pháo ở sa bàn Điện Biên Phủ), 2 người lội nước đẩy đuôi; thuyền trượt từ chỗ nước nổi lên bãi rồi lặp lại.
- **Xe tăng VNCH:** thay khối M41 cũ bằng mẫu M48A3 / M41A3 (gói HCM 1975), xác xe cháy cũng dùng mẫu mới.
- **Hồi 6 (0:22–0:42):** máy quay chuyển sang người lính nằm bắn trên mặt thành (tham số `clip` mới cho cú máy bám người), không còn quay người ném lựu đạn đeo súng sau lưng.
- **Đêm trong công sự:** người ngồi trên khối bê tông vỡ (thay thùng đạn nhỏ, nhìn nghiêng như ngồi trên không).
- **Thành cổ hôm nay:** tháp biểu tượng dựng theo ảnh (gò cỏ có bậc bốn phía, bồn tròn, tháp đồng hình nén hương, búp sen đỏ, lầu hương mái vàng); đường đỏ và trục đường đi xuyên cổng ngang mặt cỏ, không leo lên tường; cầu qua hào thấp, dốc nhẹ ra bờ ngoài; tường gạch cũ có mạch vữa, rêu lốm đốm (không phủ cỏ).
- **Bảo tàng ngoài trời (minh hoạ):** 9 khí tài hai bên đường dạo đỏ — phía Nam: T-54, PT-76, pháo M-46 130 mm, cao xạ 37 mm; phía Bắc: M48, M41, M113, lựu pháo M2A1 105 mm, trực thăng UH-1; mỗi hiện vật có bục và ghim thông tin.
- **Người dân** (áo sơ mi, váy, áo dài nhiều màu): đi dạo trên đường đỏ và trục đường, đứng xem khí tài, thắp hương vái ở sân tháp biểu tượng (khói hương bay từ lư đồng).
- **Thả hoa đăng:** 3 thuyền có người dân ngồi thả; hoa đăng có đế hoa sen phát sáng, ngọn nến, quầng sáng vẽ sau mặt nước (không còn ô sáng hình chữ nhật); máy quay mở đầu hồi 10 đặt gần thuyền.

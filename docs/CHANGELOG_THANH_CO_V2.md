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

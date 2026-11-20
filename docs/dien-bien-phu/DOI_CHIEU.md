# Đối chiếu hạng mục — Sa bàn Điện Biên Phủ 1954 (theo Kịch bản V1.0)

Cập nhật 17/11/2026. Ký hiệu: **FOUND** = đã có và dùng · **MISSING** = chưa có · **NEEDS_HISTORICAL_REVIEW** = có nhưng chưa thẩm định sử học · **ILLUSTRATIVE** = minh họa.

## Địa hình & vị trí
| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Địa hình lòng chảo (DEM Terrarium/SRTM ~20 m) | FOUND | Địa hình hiện đại, độ cao ×1,5 kiểu sa bàn |
| Sông Nậm Rốm, đường băng | FOUND / NEEDS_HISTORICAL_REVIEW | Theo OpenStreetMap hiện đại; đường băng 1954 dài 1.150 m dựng theo OSM |
| A1, C1, D1, E1, E2, F, Him Lam, Độc Lập, hầm Đờ Cát | FOUND / NEEDS_HISTORICAL_REVIEW | Toạ độ = vị trí di tích hiện nay (OSM), chưa đối chiếu bản đồ 1954 |
| Bản Kéo, C2, Huguette, Claudine, Junon, Hồng Cúm | ILLUSTRATIVE | Đặt theo sơ đồ minh họa, cần bản đồ gốc |
| Ranh giới từng cứ điểm, contour công sự | MISSING | Đang dùng vòng tròn bán kính ước lượng |
| Hệ thống đường hào theo từng mốc ngày | MISSING → ILLUSTRATIVE | Hào "mọc dần" theo khoảng cách tới cứ điểm, không theo sơ đồ ngày |
| Bản làng (11 bản, 143 nhà sàn) | ILLUSTRATIVE | Vị trí theo sơ đồ, hình dáng theo ảnh nhà sàn đã gửi |

## Sự kiện (data/events.json)
Toàn bộ 11 sự kiện đang ở `NEEDS_HISTORICAL_REVIEW`. Nguồn: kịch bản phim "Dấu ấn non sông" và Kịch bản V1 (đều là tài liệu thứ cấp của dự án).
Chưa có: thời điểm đổi chủ từng đồi E1, D1, C1, C2, F trong đợt 2 (đang gộp thành "giằng co" từ 30/3); thời điểm sân bay bị khống chế (đang để mốc minh họa); diễn biến riêng của Hồng Cúm.

## Tài sản 3D
| Hạng mục | Trạng thái |
|---|---|
| Hầm, hào bao cát, dây thép gai, lều, nhà tôn | FOUND (tự dựng, low-poly) |
| Pháo M101 105, sơn pháo 75, B-26, xe đạp thồ, bộ đội, lính Pháp, Đại tướng | FOUND (Tripo3D do anh Thắng tạo) — phục trang NEEDS_HISTORICAL_REVIEW |
| Xe tăng M24, C-47 Dakota, xe tải | FOUND (tự dựng, đơn giản) |
| Hoạt hình nhân vật (chạy, kéo nặng, đẩy, đẩy xe, đi bộ, kéo dây, đứng) | FOUND — Mixamo, gắn xương bằng chuyển trọng số từ dân công |
| Dù, máy bay vận tải, dù hàng | FOUND (đơn giản, tượng trưng) |
| Mặt cắt A1, đường hầm | ILLUSTRATIVE (nhãn MINH HỌA trên màn hình) |
| Lán Sở Chỉ huy Mường Phăng | ILLUSTRATIVE |
| Ảnh không ảnh 16/11/1953 | MISSING (chưa có quyền sử dụng) |
| Lồng tiếng thật | MISSING — đang dùng giọng đọc tiếng Việt của thiết bị; thả file vào `audio/voice/` theo tên `C05-02.mp3` và liệt kê trong `index.json` |
| Nhạc | MISSING — chưa có nhạc được phép dùng; âm thanh nền tổng hợp bằng WebAudio |

## Câu hỏi cần chốt (mục 11 Kịch bản V1)
1. Bản đồ gốc chuẩn để thay toạ độ OSM/ước lượng.
2. Bộ tài liệu sử học dùng cho mốc ngày giờ đổi chủ.
3. Ảnh tư liệu nào được phép công khai.
4. Bản lời bình cuối cùng và giọng đọc.
5. Máy trình chiếu mục tiêu (web công cộng, kiosk, RTX 5090 nội bộ).

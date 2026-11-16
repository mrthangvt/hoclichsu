# Chế độ kể chuyện — Thành cổ Quảng Trị 1972 (giai đoạn A)

Nhánh: `claude/quang-tri-1972-story-mode` (xếp chồng trên `claude/nhan-vat-qdnd-moi` → `claude/dia-hinh-osm`).
Yêu cầu gốc: `KICH_BAN_SA_BAN_THANH_CO_QUANG_TRI_1972_CLAUDE.md` (ChatGPT soạn, 16/11/2026).

## 1. Đã làm trong giai đoạn A

| Hạng mục | Trạng thái |
|---|---|
| 3 chế độ: Theo dòng lịch sử / Khám phá tự do / Góc nhìn nhân vật | ✅ chạy thật |
| `data/episodes.json`: 10 phân cảnh, nguồn, lời dẫn, khung camera, nhịp hiệu ứng, sự kiện | ✅ (3 cảnh `ready`, 7 cảnh có kế hoạch) |
| `js/story-director.js`: phát/tạm dừng/trước/tiếp/chọn cảnh/tua, camera khung khoá + bám đối tượng, "Quay lại máy quay dẫn chuyện" | ✅ |
| `js/story-ui.js`: mốc thời gian, nhãn TÁI DỰNG MÔ PHỎNG, phụ đề, thanh phân cảnh, bảng Tư liệu & Chú giải (4 mục), bản đồ nhỏ | ✅ |
| `js/story-audio.js`: 3 lớp âm thanh (gió/mưa · nước sông · nền chiến sự) theo phân cảnh | ✅ (tắt mặc định) |
| Trạng thái chiến trường trong `app.js`: `overview`, `night_river_supply`, `wall_fight`, `legacy` | ✅ |
| Đổi vai đúng lịch sử 81 ngày đêm: QĐND giữ thành, VNCH phản công từ phía Nam/Đông | ✅ |
| Cảnh 01 Toàn cảnh (56 s), Cảnh 05 Vượt sông tiếp viện (120 s, đêm), Cảnh 06 Giành giật từng đoạn tường (110 s) | ✅ chạy thật |
| Giảm chớp sáng (tự bật nếu hệ điều hành đặt "giảm chuyển động"), phụ đề bật/tắt, phím Space / PageUp / PageDown | ✅ |
| Kịch bản cũ "QĐND vượt sông đánh vào thành" | giữ lại trong Khám phá tự do, nhãn **Minh hoạ giả định** |

## 2. Bảng đối chiếu 10 phân cảnh

| # | Cảnh | Tái sử dụng được | Còn thiếu |
|---|---|---|---|
| 01 | Thành cổ trước cơn bão lửa | địa hình OSM, thành, hào, sông, nhà dân, camera | **thành tương đối nguyên vẹn** (hiện là trạng thái đã tàn phá; GD1–GD3 có tường nguyên) |
| 02 | Tiến công mùa xuân | bản đồ nhỏ, trạng thái `overview` | lớp bản đồ trước/sau, mũi tên chiến dịch, cờ theo khu vực |
| 03 | Phản công bắt đầu 28/6 | `wall_fight`, `vAtk`, `vRun`, xe tăng, máy bay | lớp bật/tắt hướng tiến công và khu vực kiểm soát trên cảnh 3D |
| 04 | Dưới hoả lực | nổ, khói, cháy, máy bay, góc công sự | trạng thái tường hư hại theo thời gian, thanh so sánh, ảnh tư liệu được phép dùng |
| 05 | Vượt sông Thạch Hãn | ✅ thuyền + chèo, bơi, đi khom, núp, pháo sáng, đêm | thuyền cập bờ, người xuống thuyền, **khiêng vác vật tư**, `BoiVaoBo`/`DapNuoc` gắn theo vị trí |
| 06 | Giành giật từng đoạn tường | ✅ quỳ bắn, đi ngắm, ném lựu đạn, chạy lom khom, nằm nạp đạn | trườn (Mixamo "Crawl"), nấp sau tường theo vật cản |
| 07 | Một đêm trong công sự | đêm, `NupQuanSat`, `NamNapDan` | **ngồi nghỉ, băng bó, uống nước, nói chuyện nhỏ**, mưa, đèn yếu, hiện vật bấm được |
| 08 | Mưa, nước dâng | nước, hố bom | mưa (hạt), nước đọng, bùn, tường hư hại hơn |
| 09 | Những ngày cuối | `wall_fight`, `vRun` | mũi tiến công cuối, QĐND rút khỏi thành, cờ trên tường thành (ngày 15–16/9 theo nguồn khác nhau) |
| 10 | Tưởng niệm | camera, âm thanh tắt dần | ảnh/mô hình hiện trạng có quyền sử dụng, phân biệt di tích – tái dựng |

Động tác Mixamo nên tải thêm (dùng mẫu QĐND mới trong `NhanVat_Mixamo`): *Sitting Idle, Kneeling Idle, Injured Idle, Drinking, Talking, Crawling / Crawl Backwards, Carrying (box), Pick Up, Dying (chỉ dùng tiết chế)*.

## 3. Kiến trúc

- `app.js` giữ động cơ. Mỗi nhân vật có `userData.grp`; `setState(tên)` bật nhóm (`ACT`), vị trí xe tăng, vùng nổ (`FX.zones`), máy bay (`PL`), ngày/đêm (`setNight`), dọn hiệu ứng tạm. **Không tạo thêm nhân vật khi đổi trạng thái** (tạo sẵn lúc tải: desktop ~450, mobile ~230; chỉ nhóm đang bật mới cập nhật/vẽ).
- Nhóm: `vWall vBunker vTank qSwim qMoat qFire qRun boats tanks` (kịch bản cũ) · `qWall qBunker vAtk vRun qSupply` (81 ngày đêm).
- `setEnv()` cho bộ dẫn chuyện đổi nhịp: `gap` (khoảng giữa hai tiếng nổ), `zones`, `fire` (tần suất bắn 0–1), `planes`, `tanks`, `night`.
- Camera phân cảnh tính theo **thời gian trong cảnh** (không dùng tween) nên tua/nhảy cảnh luôn đúng góc. Khung `follow` bám thuyền, người bơi hoặc nhân vật theo nhóm (`high: true` = chọn người đứng trên đoạn tường còn cao).
- `window.__QT` / `window.__STORY`: móc kiểm thử.

## 4. Kiểm thử (Chrome headless, WebGL phần mềm SwiftShader)

- 1440×810 và 390×844 (cảm ứng): 3 cảnh, Khám phá tự do (cả `legacy`), 3 góc nhìn nhân vật, bảng tư liệu dạng bottom sheet trên điện thoại — **không lỗi JavaScript** (chỉ 2 lỗi 404 font/favicon có sẵn khi chạy thư mục tĩnh).
- 3 vòng chuyển cảnh + đổi chế độ, **có bật âm thanh**: số mixer 474 và NPC 450 không đổi, geometry 111 không đổi, texture ổn định sau vòng 1 (texture xương của nhân vật lần đầu hiện), heap JS 127–138 MB. Không nhân đôi đối tượng.
- **FPS:** máy kiểm thử không có GPU (SwiftShader ~1 khung/giây) nên **chưa có số FPS thật**. Cần đo trên laptop và điện thoại thật.
- Âm thanh tắt mặc định; khi tắt, không có lỗi (đã có chặn `SND.boom` từ trước).

## 5. Tư liệu

Các mốc đã đối chiếu: 30/3/1972 mở màn chiến dịch Trị–Thiên; 1/5 VNCH rút khỏi thị xã (toàn tỉnh: 1/5 hoặc 2/5 tuỳ nguồn); 28/6 mở màn Lam Sơn 72; 28/6–16/9/1972: 81 ngày đêm; 16/9 đơn vị QĐND cuối cùng rời Thành cổ; nguồn Mỹ/VNCH ghi Thuỷ quân Lục chiến VNCH lên tường thành từ 11–15/9, kéo cờ 15–16/9. Danh sách nguồn: `data/episodes.json` → `sources`. Link USNI trong yêu cầu gốc chưa đối chiếu nên chưa đưa vào.

## 6. Giai đoạn B (đề xuất)

1. Tải thêm động tác Mixamo ở mục 2 → cảnh 07, cập bờ/khiêng vác (05).
2. Xuất tường thành nguyên vẹn (GD1–GD3) → cảnh 01, 04 (so sánh trước/sau).
3. Mưa, nước đọng → cảnh 08; lớp hướng tiến công/khu vực kiểm soát → cảnh 02, 03.
4. Cảnh 09 với nhãn thời gian mềm; cảnh 10 cần ảnh có quyền sử dụng.
5. Đo FPS thiết bị thật, LOD nhân vật xa nếu cần.

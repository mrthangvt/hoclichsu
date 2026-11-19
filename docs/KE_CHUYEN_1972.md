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


---
# Giai đoạn B (16/11/2026) — nhánh `claude/quang-tri-1972-giai-doan-b`

## Đã làm
- **Đủ 10 phân cảnh chạy thật** (~14 phút 51 giây): 01 Trước cơn bão lửa · 02 Tiến công mùa xuân · 03 Phản công 28/6 · 04 Dưới hoả lực · 05 Vượt sông tiếp viện · 06 Giành giật từng đoạn tường · 07 Một đêm trong công sự · 08 Mưa, nước dâng · 09 Những ngày cuối · 10 Nơi tưởng niệm.
- **Nút ⛈ Mưa giông** (mọi chế độ): mưa theo camera, sấm chớp ngẫu nhiên 5–13 s (tia sét, sáng trời, tiếng sấm trễ theo khoảng cách), trời tối và sương dày, mặt đất/tường ướt, mặt nước gợn mạnh. **Không đổi nhóm nhân vật** — thuyền, người bơi, tổ tiếp viện vẫn qua sông. "Giảm chớp" giảm còn ~22% độ sáng tia chớp.
- **Động tác mới** (từ `NhanVat_Mixamo` + Basic Shooter Pack): QĐND thêm 14 (TruonToi_TaiCho, BoThap_TaiCho, ThaXuong, NhatDo, VuonLay, QuyNghi, KeoVat, NgoiNghi, KhomChe, DungNgam, DungBan, DungNapDan, TrungDanNhe, NemLuuDanDung) → `qdnd.glb` 35 clip. VNCH thêm 9 (chuyển từ rig QĐND mới) → `vnch.glb` 19 clip.
- **Nhóm mới:** `vCrawl` (VNCH trườn), `vBreach` (VNCH lên góc Đông Nam mặt thành), `qShelter` (QĐND khom che dưới hoả lực), `qRest` (đêm trong công sự + đèn dầu + vật dụng), `qRepair` (gia cố công sự trong mưa), `qLand` (bến tiếp viện: kéo thuyền, nhặt/chuyển thùng; 2 thuyền cập bờ), `qBack` + `qSwimBack` (rút về bờ sông, bơi sang bờ Tây).
- **Trạng thái mới:** `spring`, `counter_start`, `under_fire`, `bunker_night`, `rain_ruins`, `final`, `memorial`.
- **Trước/Sau tàn phá (giản lược):** tường liền + ẩn đổ nát, hố bom, cây cháy, khói lửa. Nút Trước/Sau ở cảnh 01, 04; ô "Trước tàn phá" trong Khám phá tự do. Tường GD1–GD3 trong Blender đã đổ nát và lệch hình nên không dùng được.
- **Lớp hướng** (nút ➶): mũi tên nổi trên sa bàn — `spring` (đỏ: QĐND tiến công; vàng: VNCH rút), `counter` (vàng: hướng phản công; khung đỏ: khu QĐND giữ), `final`.
- **Cờ VNCH trên cổng Tây** (cảnh 09, theo chú thích ảnh USMC; ngày 15 hoặc 16/9 tuỳ nguồn). **Nước dâng** (`flood`) cảnh 08. **Hoa đăng** biểu tượng trên sông (cảnh 10) + chú thích Đài tưởng niệm (vị trí OSM).
- Màn hình dọc: tự mở rộng góc nhìn camera.
- File Blender `ThanhCoQuangTri_1972_GD8.blend`.

## Kiểm thử (SwiftShader, không GPU)
- 1440×810 và 390×844: 10 cảnh, Khám phá tự do, góc nhìn nhân vật — không lỗi JavaScript.
- 3 vòng qua 10 cảnh + đổi chế độ, **bật âm thanh và mưa giông**: mixer 598 / NPC 574 không đổi; texture ổn định sau vòng 1; heap 136–169 MB không tăng dần.
- Chưa có FPS thiết bị thật. Mưa: desktop 6.500 vệt, mobile 2.200.

## Còn lại (giai đoạn C)
- Đối chiếu lịch sử với người biên tập; ảnh tư liệu có quyền sử dụng cho bảng Tư liệu và cảnh 10.
- Động tác chưa có: vác trên vai, băng bó, uống nước, nói chuyện.
- Nước đọng trong từng hố bom, bùn; công trình bên trong thành ở trạng thái trước tàn phá.
- Đo FPS thật; LOD/gộp nhân vật xa nếu cần.

## Thị xã 1972 quanh Thành cổ (16/11/2026, theo ảnh tư liệu chụp từ trên cao)
- `js/app.js` khối `TOWN`: ~2.600 nhà (desktop; mobile ~45%) đặt theo đường OSM (`data/osm_roads.json`): **dãy nhà ống 2 tầng** sát nhau dọc trục chính (t, p), nhà mái ngói/mái tôn dọc đường dân sinh, thêm hàng sau và hẻm cho dày như ảnh; ~3.900 cây (vườn quanh nhà, lùm cây). Toàn bộ bằng InstancedMesh (≈10 lần vẽ).
- Chừa trống: thành + hào, sông (±128 m quanh trục), lối tiếp viện (|y|<70 từ sông vào thành), bãi trống phía Nam (|x|<240, y −585…−300) và phía Đông (x 300…465) cho các cảnh tiến công. Nhà được ghi vào lưới vật cản (đi bộ không xuyên tường, nhân vật không đứng trong nhà).
- **Hai trạng thái**: nguyên vẹn khi `INTACT` (cảnh 01, nút Trước) và ở `spring`, `memorial`; chiến tranh ở các trạng thái còn lại: ~2/3 nhà tốc mái, tường thấp, ám khói; 30% cây trụi lá; thêm **hào giao thông chữ chi + ụ bao cát** ngoài thành.
- Trạng thái trước tàn phá còn có **~40 dãy nhà dài trong thành** (doanh trại, công sở như ảnh) + cây.
- Còn thiếu: chợ, nhà thờ, công trình nhận diện riêng; mái nhà chưa có texture.

## Cập nhật nội dung (16/11/2026 tối, theo anh Thắng)
- Lời dẫn: "chiến tranh Việt Nam" → "cuộc kháng chiến chống Mỹ" (cảnh 01).
- Cảnh 06: thêm vai trò chính trị, ngoại giao của Thành cổ và liên hệ Hội nghị Paris (trích VnExpress do biên tập cung cấp; đối chiếu thêm Báo Pháp Luật về lệnh cắm cờ trước phiên họp 13/7, Tạp chí Quản lý nhà nước).
- Cảnh 10 dài 215 s: thêm đoạn trích Tạp chí Cộng sản (thị xã nhỏ → tâm điểm cả nước và thế giới; số liệu tổng kết); bảng Tư liệu ghi số liệu khác của Báo Nhân Dân để người đọc đối chiếu. **Cần bổ sung đường dẫn bài cụ thể của Tạp chí Cộng sản và VnExpress** (hiện để trang chủ).
- **Nhạc chương cuối:** "Dòng sông phẳng lặng" — từ 16/11 tối thay bằng **bản phối metal tạo bằng AI** (anh Thắng cung cấp), đã cắt bỏ dạo đầu, phát từ 0:35 (tệp 184 s); cảnh 10 dài 190 s. Khai báo trong `episodes.json` → `music` (bắt đầu giây 2, hiện/lặng dần, âm lượng 0,85). Tệp `audio/dong-song-phang-lang.mp3` **đã đưa vào repo theo quyết định của anh Thắng (16/11)**; bản phối vẫn dùng giai điệu và lời bài hát gốc nên lưu ý quyền tác giả khi phát hành rộng. `build_artifact.py` vẫn bỏ qua *.mp3 (bản xem thử Claude không kèm nhạc). Thiếu tệp → sa bàn tự bỏ qua. Nhạc chỉ phát khi người xem bật Âm thanh; nếu chưa bật, phụ đề nhắc. Máy chủ cần hỗ trợ tải theo đoạn (FastAPI, GitHub Pages có) để tua giữa bài.

## Cờ và chế độ xem phim (16/11/2026 tối)
- **Cờ giải phóng** (MTDTGP: đỏ trên, xanh dưới, sao vàng) trên **Cổng Tiền** ở mọi trạng thái QĐND kiểm soát Thành cổ (`flagQ` trong `STATES`): night_river_supply, wall_fight, counter_start, under_fire, bunker_night, rain_ruins, final. Cảnh 02 kéo cờ ở giây 50; cảnh 09 hạ cờ ở giây 56 (rút quân đêm 15/9). Căn cứ: ảnh tư liệu "rạng sáng 2/5/1972 cờ giải phóng … tung bay trên cổng Thành cổ" (Báo Lai Châu). Muốn dùng cờ đỏ sao vàng: đổi `FLAG_Q_KIEU='doSaoVang'` trong `app.js`.
- **Cờ VNCH** (cổng Tây, cảnh 09) hiển thị **mờ** (độ trong 0,38, làm nhoè).
- **🎬 Xem như phim** (nút trên thanh công cụ hoặc phím **H**): ẩn mọi nút, nhãn, bản đồ nhỏ; chỉ còn phụ đề + hai dải đen; khoá máy quay theo dẫn chuyện và tự phát. Thoát: **Esc**, phím H, hoặc nút "✕ Thoát xem phim" hiện ra khi di chuột/chạm màn hình. Space vẫn tạm dừng/tiếp tục.

## Chỉnh sửa 17/11/2026
- **Mái chèo:** dài hơn (×1,38), chúc xuống và chếch ra ngoài mạn; tự trượt theo tay để lưỡi chèo luôn ngập nước (`updBoats`).
- **Pháo sáng:** giảm cường độ đèn ~10 lần (mobile thấp hơn nữa), đốm sáng nhỏ hơn; mặt nước ban đêm nhám hơn để không phản chiếu trắng xoá.
- **Ngày ↔ đêm:** `setNight()` chỉ đặt đích, ánh sáng chuyển dần ~4 giây (`updWeather`). `API.snapNight()` dùng cho kiểm thử.
- **Nhãn trên mũi tên** (lớp hướng): bên nào, tiến công hay rút quân, từ/về hướng nào (`arrowLabel`). Bản đồ nhỏ có ký hiệu "B ↑" (Bắc của sa bàn, lệch 16,6° so với Bắc thật).
- **Chòi sắt:** thêm 3 chòi trong thành (`TW`); `towersDown` trong env làm gãy gập — cảnh 04 gãy lần lượt ở giây 23 và 45; các thời kỳ sau có 2 chòi gãy, 1 còn đứng; trước tàn phá đứng cả.
- **Người ngồi nghỉ** (cảnh 07 và nhóm trú ẩn): có tấm bê tông vỡ hoặc hòm gỗ để dựa lưng (`backrest`).
- **Cảnh 03:** xe tăng VNCH tiến cùng bộ binh từ phía Nam về sát hào (`TANK_RUN`, 2,3 m/s, tới nơi dừng bắn rồi lặp lại); máy bay bay thấp hơn, thả bom dày hơn (`PL.cool`, `PL.h`); máy quay bám theo xe tăng.
- **Lồng tiếng (lời dẫn V3, 61 tệp thu âm):** nút "🗣 Lời dẫn" bật sẵn; giọng thu âm tự phát khi người xem bật "Âm thanh" (bấm 🗣 khi chưa bật âm thanh thì vẫn đọc). Mỗi câu phát đúng giây bắt đầu trong `data/episodes.json`; tua hoặc bật âm thanh giữa câu thì đọc tiếp từ đúng chỗ. Tệp `audio/voice/<id>-<số câu>.mp3` (liệt kê trong `audio/voice/index.json`); câu chưa có tệp thì chỉ dùng giọng máy khi bấm 🗣. Khi đang đọc: nhạc chương cuối và tiếng nền chiến sự, gió, mưa, nước tự nhỏ lại. `python3 tools/xuat_loi_dan.py` xuất `docs/loi-dan/loi_dan.csv` và cập nhật `index.json`.
- **Điện thoại:** trình duyệt điện thoại chỉ cho phát âm thanh sau lần chạm đầu tiên, nên giọng đọc và nhạc dùng lại đúng một phần tử âm thanh, được mở khoá ở lần chạm đầu; câu bị chặn hoặc bị ngắt (mạng chậm, chuyển ứng dụng) được phát lại từ đúng chỗ. Câu sau được tải trước.
- **Tốc độ xem:** nút trên thanh phân cảnh (0,5× · 0,75× · 1× · 1,25× · 1,5× · 2×). Máy quay, phụ đề, giọng đọc và nhạc chạy theo cùng tốc độ (giọng giữ nguyên cao độ); chuyển động của lính vẫn ở tốc độ thường.
- **Tình trạng cắt giọng V3:** các đoạn cắt từ bản thu dài theo khoảng lặng, chưa kiểm bằng nhận dạng giọng nói; cần nghe lại 8 câu được đánh dấu `priority_review` trong manifest của gói thu âm và đuôi câu `s07-dem-cong-su-05` (cắt sát).

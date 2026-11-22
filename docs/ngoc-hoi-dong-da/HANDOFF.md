# Sa bàn Ngọc Hồi – Đống Đa 1789 — tài liệu bàn giao

Bàn giao ngày 20/11/2026. Gửi kèm cho phiên Claude tiếp theo. Đọc hết file này trước khi sửa.

Dự án thuộc chuỗi "Không gian lịch sử · Việt Sử", cùng hệ với **Thành cổ Quảng Trị 1972** và **Điện Biên Phủ 1954**. Giao diện bám theo bản Điện Biên Phủ.

Dòng nhãn bắt buộc theo kịch bản:
> Sa bàn tương tác tái dựng mô phỏng, chưa phải tư liệu hiện trường chính thống

---

## 1. Trạng thái hiện tại

**Bản web V6 đã chạy** (artifact trên Claude của anh, chỉ chủ sở hữu xem):
- Link: https://claude.ai/artifact/9Pv6VmbMc5iBycNYxLWvPg
- Slug: `43fc316a-42a6-453f-9b2f-aaeecbeab2ef`. Bản cuối: `1795096386-e59a`.
- Artifact có kho `db` (collections `pins`, `moves`) cho ghi chú review dùng chung. Phiên Claude khác chỉ sửa được artifact nếu cùng tài khoản; nếu không, publish thành artifact mới từ thư mục `web/`.

**Đã có trong bản web:**
- **Địa hình:**
  - Heightmap 20 m/ô; vùng chi tiết riêng cho đồn Ngọc Hồi (2 m), hồ Linh Đàm (4 m), Hồ Tây (8 m), Hồ Gươm (3 m).
  - Sông Hồng, Tô Lịch, Nhuệ, Kim Ngưu; đê, đầm, làng, đường.
  - Lõi Thăng Long: phố tự nhiên, không lưới ô bàn cờ; La Thành và Hoàng thành dựng hình khối.
  - Hồ Linh Đàm, Hoàn Kiếm, Hồ Tây lấy đúng hình hiện nay theo OSM, làm điểm nhận diện.
- **Không gian quanh sa bàn:**
  - Mặt đất ngoài khung trải tới chân trời khoảng 150 km; mép nối khít vào lưới địa hình.
  - Bầu trời có mây, sương xa; ngày/đêm đổi theo cảnh.
  - Núi xa làm phông: Ba Vì, Tam Đảo, Sóc Sơn, cụm núi đá vôi phía nam.
  - Sông Hồng, sông Nhuệ chảy tiếp ra ngoài khung.
- **Giao diện theo bản Điện Biên Phủ:**
  - 3 chế độ: 🎬 Phim tự động / 🧭 Khám phá / ◧ So sánh.
  - Hàng nút: Âm thanh, Lời bình, Lớp, Chú giải, Tư liệu, Ẩn menu.
- **Phim tự động:**
  - 14 cảnh, 17:45, lấy từ `web/story.json`.
  - Máy quay dẫn chuyện tự chạy, có phụ đề, ngày tháng, tư liệu từng cảnh, mũi tên hướng tiến công 3D (đỏ Tây Sơn, xanh nét đứt Thanh rút).
  - Âm thanh tổng hợp bằng WebAudio.
  - Lời bình hiện dùng giọng tiếng Việt có sẵn của trình duyệt (Web Speech).
- **Khám phá:**
  - Thanh trượt "Mốc lịch sử", 12 địa điểm bay tới, bấm vào bất kỳ đâu trên sa bàn để bay tới.
  - Đi bộ với 3 vai, 2 góc nhìn (sau vai / qua mắt).
  - Phím ảo (joystick) và nút Chạy; trên máy tính dùng W A S D.
  - Các nút review của nhóm: kéo mốc, thêm ghi chú, bảng review.
- **So sánh:** chia đôi màn hình, kéo vạch giữa để so hai mốc lịch sử.

**Blender** (trên máy Mac của anh):
- Thư mục: `/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/NgocHoiDongDa/`
  - Các file `NHDD_1789_DiaHinh_V1/V2/V3.blend`
  - `README_NHDD.md`, các thư mục `scripts/` và `data/`
- **Bản V4 chưa được áp vào Blender**, vì kết nối Blender bị ngắt giữa chừng. Xem mục 5.

---

## 2. Cấu trúc gói

```
web/                  bản web hoàn chỉnh — publish nguyên thư mục này
  index.html          trang duy nhất (three.js 0.160 lấy từ cdn.jsdelivr)
  sa_ban_data.json    nhà/cây/lều (instances), Hoàng thành, sông, đường, mốc, làng
  story.json          14 cảnh: lời bình, shots, góc máy, trạng thái mũi tên, tư liệu
  h_*.png             heightmap 16 bit (R = byte cao, G = byte thấp; B = phần sông Hồng)
  tex_*.jpg           texture màu mặt đất
source/               mã nguồn để dựng lại index.html
  build_v6.py         ghép: base/index_v4.html (lõi cảnh) + v6_body.html + CSS + js_env6.js + js_ui6.js
  js_env6.js          bầu trời, mây, nền chân trời, núi xa, sông kéo dài, mũi tên 3D
  js_ui6.js           âm thanh, lời bình, phim tự động, khám phá, đi bộ, phím ảo, so sánh, menu
  v6_body.html        HTML các thanh, nút, panel
  v6_css_add.css      CSS bố cục theo bản Điện Biên Phủ (nạp sau base/v6_css_base.css)
  base/               lõi V4: tải dữ liệu, dựng lưới, proxy nhà/cây, nhãn, mốc, review, minimap, pad
  build_story.py      sinh web/story.json từ scenes_parsed.json (kịch bản đã tách cảnh)
blender_scripts/      bộ sinh dữ liệu (chạy được không cần Blender)
  nhdd_gen.py         V4: địa hình, mặt nạ, sông, đường, làng, lõi Thăng Long, hồ OSM, mốc
  nhdd_khoi.py        hình khối: đồn Ngọc Hồi, doanh trại Khương Thượng, Linh Đàm, Thăng Long, hồ (V4)
  nhdd_build_blender.py  dựng cảnh trong Blender (step_terrain, step_water, step_roads, step_scatter, step_anchors)
  web_export.py       xuất web/ (h_*.png, tex_*.jpg, sa_ban_data.json) từ nhdd_gen + nhdd_khoi
  patch_gen3.py, patch_khoi3.py   bản vá V3→V4 cho các script cũ trên máy Mac (xem mục 5)
  old/                các phiên bản trước
data/                 OSM: hồ Linh Đàm, Hồ Tây, Trúc Bạch, Hoàn Kiếm (đã giản lược)
references/           kịch bản V1 (.md), toado.geojson (khung), ảnh bản đồ trận, ảnh Hoàng thành, ảnh giao diện mẫu DBP
tools/screenshot_test.py   chụp màn hình kiểm tra bằng Playwright + Chrome (swiftshader)
```

---

## 3. Cách dựng lại và kiểm tra

```bash
pip install numpy pillow
cd blender_scripts && python3 web_export.py      # → ../web (khoảng 1 phút, kết quả xác định, chạy lại ra y hệt)
cd ../source && python3 build_story.py           # → ../web/story.json
python3 build_v6.py                              # → ../web/index.html
```

Cả ba lệnh đã được chạy thử trong gói này và cho kết quả trùng từng byte với bản đang publish.

**Chạy và kiểm tra trên máy:**
- `cd web && python3 -m http.server 8765`, mở http://localhost:8765
- Chụp màn hình tự động bằng `tools/screenshot_test.py`. Script cần thư mục `three/` cạnh index.html và CDN trong importmap đổi thành `./three`.
- Hook kiểm tra trong trang (`window.NHDD`):
  - `pause()`, `once()`, `preset(view)`, `ex(1|2|4)`
  - `mode('film'|'explore'|'compare')`, `scene(i, t)`, `play(bool)`, `night(n)`
  - `walk(bool)`, `joy(x, y)`, `arrows()`
- Mở thẳng một chế độ bằng tham số URL: `?mode=explore` hoặc `?mode=compare`.

**Cách sửa:**
- Sửa giao diện hay tính năng: sửa trong `source/`, rồi chạy `build_v6.py`.
- `build_v6.py` thay chuỗi trong lõi V4 và kiểm tra bằng `assert` rằng mỗi chuỗi xuất hiện đúng 1 lần. Nếu sửa base, phải sửa cả các chuỗi thay thế tương ứng.

---

## 4. Quy ước kỹ thuật quan trọng

**Toạ độ và tỉ lệ:**
- Gốc toạ độ: 20.96609 N, 105.83550 E. Dùng mét cục bộ: X hướng Đông, Y hướng Bắc; KX = 103992 m/độ kinh, KY = 110716 m/độ vĩ.
- Khung: kinh độ 105.739581–105.928008, vĩ độ 20.856069–21.077986.
- Mực nước WATER_Z = 4.0 m. Cao độ zmin −2, zmax 30.
- Sang three.js: `(X, Z·EX, −Y)`. EX là hệ số phóng đại chiều cao (1, 2 hoặc 4); nhóm `world` có `scale.y = EX`.

**Kết xuất:**
- Bật `logarithmicDepthBuffer`. Vì vậy shader tự viết phải có các chunk `logdepthbuf`, hoặc dùng `onBeforeCompile` trên material Lambert như mặt đất ngoài khung (`groundMaterial`).
- Màu sương (fog) = màu chân trời của bầu trời. `applyEnv(n)` điều khiển ngày/đêm. Fog near/far co giãn theo khoảng cách camera.

**Dữ liệu cảnh (`story.json`):**
- Mỗi cảnh có `keys` để dựng góc máy. Mỗi key có `t` (giây) và tâm nhìn là `at` (mã mốc) + `off` [dx, dy], hoặc `ll` [lat, lon]; cùng `d` (khoảng cách), `az` (hướng nhìn: 0 = từ Bắc, 180 = từ Nam), `el` (góc ngẩng).
- `state` của cảnh chọn nhóm mũi tên trong `states`; `arrows` định nghĩa mũi tên bằng toạ độ lat/lon.
- `night` / `night_end` là độ tối đầu và cuối cảnh.
- `outside` là ghi chú cho cảnh nằm ngoài khung sa bàn.

**Âm thanh, lời bình, phụ đề:**
- Lời bình: mỗi cảnh chia câu theo dấu câu; thời lượng mỗi câu chia theo độ dài chữ.
- Âm thanh tổng hợp và Web Speech chép từ bản Điện Biên Phủ: `createAudio`, `speak`.

**Không đổi khi chưa hỏi anh:**
- Không dựng thành phố theo lưới ô bàn cờ.
- Hình dạng 3 hồ theo hiện nay.
- Giao diện giữ đúng bố cục bản Điện Biên Phủ.
- Mọi diễn biến ở mức "chưa thẩm định sử học". Mũi tên là quy ước đồ hoạ.

---

## 5. Việc còn dở / đề xuất tiếp

1. **Áp V4 vào Blender trên máy Mac** (cần kết nối Blender MCP):
   - Chép `nhdd_gen.py`, `nhdd_khoi.py` trong gói đè vào `scripts/` trên Mac. Hai file này đã là bản V4; không cần chạy `patch_gen3.py` / `patch_khoi3.py` nếu đã chép đè.
   - Trong Blender, `importlib.reload`, rồi chạy `B.step_terrain`, `step_water`, `step_roads`, `step_scatter`, `step_anchors`, rồi `K.run_all()`.
   - Kiểm tra render, lưu thành `NHDD_1789_DiaHinh_V4.blend`, cập nhật README.
   - Lưu ý với Blender 5: đặt input modifier bằng `mod.properties.inputs.<Socket>.value`.
2. **Thuyết minh bằng giọng của anh:**
   - Anh có phần mềm nhân bản giọng chạy offline (chưa biết tên, chưa biết có CLI hay API không).
   - Việc cần làm: script đọc `story.json`, chia câu như phụ đề, chuẩn hoá cách đọc (năm, tên Hán Việt), gọi phần mềm, xuất `web/audio/voice/C01-01.mp3`…, kèm `index.json` danh sách file.
   - Trang web cần phát mp3 khi có file (như bản Điện Biên Phủ, `VO.files`), lùi về Web Speech khi không có, và căn phụ đề theo độ dài thật của audio.
3. **Model người thật** thay hình khối dựng bằng code (`makeAvatar` trong `js_ui6.js`). Mức đề xuất:
   - Nhân vật đi bộ: 8–15k tam giác, rig Mixamo.
   - Lính trong đội hình: LOD 1.5–3k / 400–800 / 100–300 tam giác, vẽ gộp (instancing) và chuyển động nướng sẵn (VAT).
   - Phóng to người khoảng 3–6 lần khi xem từ xa. Có thể viết script Blender tự tạo LOD và xuất glb nén Draco.
4. Có thể làm thêm: dựng khối Văn Miếu, chi tiết Hồ Gươm; diễn cảnh quân và voi chiến theo từng cảnh (hiện mới có mũi tên).

---

## 6. Liên quan

- Sa bàn Điện Biên Phủ (mẫu giao diện): https://claude.ai/artifact/KfX38qqZZiT9aiYyu8Efg5. Repo `mrthangvt/hoclichsu`, nhánh `claude/dien-bien-phu-1954`.
- Sa bàn Thành cổ Quảng Trị (slug `af9a0798-d297-4e3a-9935-744d73b3f999`): nguồn của các nút điều khiển camera và minimap.
- Anh làm việc bằng tiếng Việt. Trả lời ngắn, có ảnh chụp kiểm tra trước khi bàn giao.

---

## 7. V7 – nhân vật diễn theo cảnh (20/11/2026)

- Artifact mới: https://claude.ai/artifact/6Yr3y2XXAiKuZnkK2bfdXB (slug `2ceffaa0-3b27-40a2-b4c6-a10e394fe496`), có `db` + `user` cho ghi chú review. Kho ghi chú của V6 nằm ở artifact cũ, không chuyển sang.
- Dựng: `cd source && python3 build_quan.py && python3 build_v7.py` (build_v7 = build_v6 + `js_quan7.js` + 5 chỗ chèn có `assert`).
- Tệp mới trong `web/`:
  - `quan.json`: 24 đội, khoảng 2.300 thành viên, kịch bản theo cảnh, sinh từ `source/build_quan.py` + `source/the_tran_blender.json` (vị trí đặt trong Blender V4).
  - `nv_tayson.json` / `nv_thanh.json` (+ `.jpg`): lính nướng thành chuỗi khung hình (3k tam giác, Int16).
    - Tây Sơn: dung, chay, khom, khieng, buoc, ngam, duoc, thu, chem, danh, vapnga.
    - Thanh: dung, nghi, chay, ngam, vapnga, thu, danh. Động tác của Thanh mượn từ Tây Sơn (cùng bộ xương Mixamo).
  - `m_*.json`: GLB gói base64, vì artifact không phục vụ đuôi `.glb`.
    - Quang Trung: có xương, động tác Button Pushing (chỉ huy).
    - Tôn Sĩ Nghị, voi, ngựa: mô hình tĩnh.
    - Tấm mộc: 3 ván rơm, 3 × 2 m (kích thước giả định).
- Nguồn động tác: `NgocHoiDongDa/gan-xuong/*.fbx` (Mixamo). Nướng lại bằng Blender, xem `NgocHoiDongDa/web_v7/`.
- Kịch bản chuyển động theo cảnh:
  - C02: quân Thanh đứng nghỉ ở đồn Ngọc Hồi, Khương Thượng, Tây Long.
  - C08: Tây Sơn chờ sau mộc.
  - C09: voi tiến rồi tách hai sườn; kỵ binh Thanh ra nghênh đánh rồi lui; lính súng ngắm.
  - C10: 20 toán khiêng mộc tiến tới đai chông, hạ mộc, xông lũy, giáp lá cà, tràn vào; quân Thanh bắn, vấp, lui.
  - C11: Thanh chạy về Đầm Mực, đạo Bảo chặn.
  - C12: mũi Đống Đa từ bến Tô Lịch vào trại Tây, Thanh vỡ chạy.
  - C13: Tôn Sĩ Nghị và quân Thanh rút qua cầu phao; Tây Sơn qua Ô Cầu Dền.
  - C14: Tây Sơn trước Hoàng thành.
- Khám phá: diễn lại cảnh đang chọn theo vòng. So sánh: mỗi nửa màn hình hiện trạng thái cuối cảnh. Lớp "Quân lính, voi, ngựa, tấm mộc" bật/tắt được.
- Hook kiểm tra: `NHDD.nv()` (đã tải chưa), `NHDD.nvdbg()` (số người đang vẽ của từng đội).
- Hạn chế:
  - Kỵ binh Thanh dùng tạm ngựa Tây Sơn, chưa có người cưỡi.
  - Voi, ngựa chưa có xương, chỉ trượt và nhún.
  - Chưa có cờ, binh khí rời.
  - Lính Thanh chỉ có 1 động tác riêng.
  - Đội ở xa hơn 6 km bị ẩn; xa vừa thì phóng to tối đa ×2.

---

## 8. V8 (20/11/2026)

- Đăng đè lên artifact V7 (cùng link, giữ kho ghi chú). Dựng: `cd source && python3 build_quan.py && python3 build_v8.py`.
- **Voi, ngựa có xương:** dựng trong Blender trên đúng mẫu Tripo của anh, giữ hình và texture.
  - Voi 24 xương: lưng, 4 chân, vòi 3 đốt, 2 tai, đuôi. Ngựa 19 xương.
  - 4 động tác:
    - `dung`: thở, vẫy đuôi, vòi và tai đung đưa.
    - `di`: đi theo nhịp 4 chân so le.
    - `chay`: voi đi nhanh, ngựa phi kiệu chéo.
    - `roi`: ngựa chồm lên hoảng loạn, voi giơ vòi rống, tai xoè.
  - File nguồn trong `NgocHoiDongDa/gan-xuong/VoiNgua/`:
    - `NHDD_VoiNgua_Rig.blend`;
    - `Voi_Rig_4DongTac.fbx`, `Ngua_Rig_4DongTac.fbx` (NLA, 24 fps).
  - Trên web, voi và ngựa là chuỗi khung hình `nv_voi.json`, `nv_ngua.json`.
- **Tấm mộc:** dùng nguyên mẫu `khien-tam-moc-3D`, mặt rơm hướng về đồn, cao 2,2 m (giả định).
  - Gói `3-tam-moc-3D` là cùng một tấm nhìn từ 3 phía, không phải bức mộc 3 ván.
- **Đi bộ:** vai Tây Sơn và vai Thanh dùng lính thật (đứng, đi, chạy). Đã bỏ hình nhân khối `makeAvatar` của V6 và tạm ẩn vai "người dân" vì chưa có mẫu.
- **Âm thanh** (`js_amthanh8.js`, `web/am/*.mp3`) lấy từ thư mục `AmThanh` của anh:
  - Đã tắt chim, trống, giao tranh, nổ và tiếng chân tổng hợp; chỉ giữ gió và côn trùng ban đêm ở mức rất nhẹ.
  - Âm nền theo cảnh và tiến độ cảnh nằm trong `amPlan(i, u)`.
  - Tiếng đơn theo mốc nằm trong `AM_MOC`; tiếng lặp ngẫu nhiên (đại bác, chém kiếm) nằm trong `AM_LAP`.
  - Tiếng chim dẫn chuyện dùng ở các cảnh C01, C03, C05, C14 và cuối C13.
  - Không dùng 2 file có tiếng máu me và người trúng đao ngã.
- Hook kiểm tra thêm: `NHDD.am()` (trạng thái âm thanh), `NHDD.cam(x, y, z, tx, ty, tz)` (đặt máy quay, toạ độ Blender).

### 8b. Máy quay bám lời dẫn (20/11/2026)

- `source/build_camera8.py` viết lại `keys` của cả 14 cảnh trong `web/story.json`. Máy quay gốc V6 được lưu ở `source/story_v6_keys.json`, dùng cho các đoạn bản đồ.
  - Mỗi cảnh là một danh sách shot `(t0, t1, A, B)`, căn theo giây của từng câu phụ đề.
  - Góc máy có thể nhắm vào một đội (`g`, tính vị trí đội ở đúng giây đó nên máy bám theo được), vào Quang Trung (`qt`), vào mốc (`at`) hoặc vào toạ độ (`ll`, `xy`).
  - `azr` là hướng máy so với hướng mặt của đội (0 = đứng trước mặt). `h` là độ cao tâm nhìn. `lead` / `side` dời tâm nhìn dọc / ngang đội.
  - Shot sau cắt thẳng (`cut`), không bay vòng qua.
- Đã sửa bộ điều khiển máy quay:
  - Cận cảnh (khoảng cách dưới 200 m) được xuống sát đất.
  - Mặt phẳng gần co theo khoảng cách.
  - Khi phim tự chạy, OrbitControls không ép khoảng cách tối thiểu 25 m nữa.
  - Khi máy quay ở gần (dưới 260 m), nhãn địa danh và cột mốc được ẩn đi.
- Ngoài khung sa bàn (Hà Hồi), `heightAt` dùng mặt đất vành ngoài (`outerZ` = `apronZ` của V6).
- `quan.json` thêm 9 đội cho các cảnh trước đây chưa có quân:
  - `th_vao`, `th_vao_ky`: quân Thanh qua cầu phao sông Hồng (C01–C02).
  - `ts_hq`, `ts_hq_voi`, `ts_hq_ngua`: đoàn hành quân Tây Sơn (C02 cuối, C04, C06).
  - `ts_tapket`, `ts_tapket_voi`: tập hợp trước Quang Trung (C03, C05; minh hoạ ở mép nam sa bàn).
  - `ts_vay`, `th_hahoi`: vây đồn Hà Hồi (C07).
- Đã căn lại nhịp động tác theo lời dẫn: C09 ngựa hoảng loạn ở giây 23–34, C10 hạ mộc ở giây 83, C11 quân Thanh rối loạn ở giây 32, C12 tập kích ở giây 40, C13 Tôn Sĩ Nghị bỏ chạy ở giây 14.
- Mỗi đoạn kịch bản có thể thêm phần tử thứ 6 là `spd` (tốc độ động tác), ví dụ quân Thanh đi bộ ở 0,55.
- Dựng lại: `python3 build_quan.py && python3 build_camera8.py && python3 build_v8.py`.

## 9. V9 (20/11/2026)
- Build: `python3 build_quan9.py && python3 build_camera9.py && python3 build_v9.py` (source/). JS mới: js_quan9.js (flipbook có binh khí + điểm đầu súng/đuốc; ngựa/voi có người cưỡi dạng nhiều phần; QT đứng trên voi chỉ huy theo `quangtrung[i] = {"g","off"}`; hiệu ứng hạt: đuốc, khói súng, đại bác + đạn rơi, doanh trại cháy), js_amthanh9.js (chim chỉ ở C01, 0.33).
- Đội hình: 4 hàng quân hành quân dáng chạy; mix động tác đánh khi giáp lá cà (chem/kiem/bodao/danh); 1/4 lính cầm đuốc khi trời tối (nightCur > 0.35).
- Ngày–đêm: `scene.nights` = [[giây, độ tối]] trong story.json (build_camera9.py, NIGHTS).
- Mũi tên đỏ ẩn khi máy quay cận cảnh (trước đây che kín trời ở C04).
- Chưa có: file âm thanh "trống kèn tiến quân / hò reo / đánh nhau" chưa thấy trong AmThanh → đang dùng trong.mp3 / hetxung.mp3 / danhkiem.mp3; ngựa Thanh (ngua-trung-quoc.zip) không có texture; binh khí là hình khối đơn giản sinh tự động.

## 10. V10.0 (20/11/2026)
- Dựng: `cd source && python3 build_quan10.py && python3 build_camera10.py && python3 build_v10.py` → `web10/`. JS: js_quan10.js, js_amthanh10.js, js_v10_extra.js.
- Nhân vật nướng lại (script Blender: `NgocHoiDongDa/web_v10/bake10_blender.py`, dữ liệu nv_*.json v3/v4):
  - Người (v3): thân + khung bàn tay phải mỗi khung (mg), khung hai tay khi ngắm (mt). Binh khí dựng trong JS (NV_VK: 1 súng hỏa hồ, 2 giáo, 3 gươm, 4 đuốc) và gắn theo tay; đội chọn binh khí bằng `vk` trong quan.json.
  - Tây Sơn: dung, chay (Standing Run Forward), buoc, khieng (Wheelbarrow), ngam, chem, dam, bua, thu, trungdon, nga. "danh" tự chọn theo binh khí.
  - Thanh: tách hai ống chân (cắt mặt nối giữa háng, bỏ trọng số chân đối diện); dung (Briefcase Idle, bộ xương gốc), tuan, chay, ngam, chem, dam, thu, trungdon, nga, nga2, vap.
  - Ngựa (v4): sửa chiều gập gối (chân trước, chân sau lật dấu); người cưỡi + giáo gắn cứng vào xương `nguc` (ma trận m mỗi khung). Ngựa Thanh dùng mẫu ngựa có texture, người cưỡi lính Thanh.
  - LƯU Ý khi nướng: đối tượng bị ẩn (hide_viewport) thì Blender không tính động tác/modifier.
- Tấm mộc: 3 tấm khien-tam-moc ghép thành 1 bức + 4 đòn dọc cao 0,81 m; 10 người khiêng (2 hàng dọc × 5, tay nắm đòn), 20 người theo sau.
- Quân Thanh: tuần tra 4 góc đồn (th_tuantra0..3); `nga` {cảnh: [chia, u]} = người ngã nằm lại; `loan` = chạy toán loạn; rút 2–3 hàng.
- Cầu phao sông Hồng: vắt ngang dòng qua mốc Cầu phao (2420,6947)→(3092,7205); đội có `cau` đi trên mặt cầu.
- Mật độ: nhìn xa (>600 m) quân đứng yên nhân 3 lớp; cận (<260 m) đang chạy bớt 1/3.
- Bụi khi quân/ngựa/voi di chuyển (pool "bui"); khói súng chỉ khi lính súng ngắm bắn; đuốc khi trời tối.
- Âm thanh: bật sẵn (kích hoạt ở lần chạm đầu tiên), lời bình bật sẵn; tiếng chân chồng 7 lớp khi hành quân; hét xung trận + chiến trường tàn sát (thaochay.mp3) khi xông đồn.
- Tư liệu: chỉ còn Lời bình + Tư liệu đối chiếu.
- Nút So sánh → "Góc nhìn nhân vật": chọn vai (Quang Trung, lính khiêng mộc, xung kích, súng, kỵ binh, nài voi, lính Thanh, Tôn Sĩ Nghị…), máy quay đặt ở mắt nhân vật, kéo để quay đầu.

### 10.1 (20/11/2026)
- Mũi tên hướng tiến công tự ẩn khi máy quay cách tâm nhìn dưới 900 m và trong Góc nhìn nhân vật; nút "➤ Mũi tên" trên thanh trên cùng (đồng bộ ô Lớp → Mũi tên).
- C07 Hà Hồi: trại minh hoạ (46 lều, rào gỗ bán kính 92 m, cổng nam) trong `nvTraiHaHoi()`; 70 lính Thanh rải rác + 4 toán tuần quanh trại (th_hahoi_tuan0..3); từ u = .38 tháo chạy tứ phía (`tan` = [u0, u1, quãng, tâm x, y]), một phần ngã.
- Góc nhìn nhân vật: thêm nhóm "Đứng xem tại địa điểm" (POV_DD, 14 điểm: gò trước đồn, trên lũy, Đầm Mực, gò Đống Đa, cầu phao, Hà Hồi…); hướng nhìn ban đầu quay về đội quân gần nhất.

### 10.2 (20/11/2026)
- C03 lên ngôi: shot 6,4–18,9 s quay sát sau lưng Quang Trung (azr 180, d 3,2→6,5 m) nhìn về phía ba quân.
- Lời bình trên điện thoại: bỏ mẹo pause/resume 9 s trên máy di động; mở khoá speechSynthesis bằng một câu rỗng trong lần chạm đầu / bấm Lời bình / Phát (`voUnlock` trong js_v10_extra.js); tìm lại giọng vi nếu danh sách giọng nạp muộn.
- Ẩn menu (cinema) không còn ẩn `#labels` → giữ pin địa danh (riêng cận cảnh < 260 m vẫn tự ẩn nhãn như V8b).
- Cờ xí: ảnh co_tayson.jpg, co_thanh.jpg (anh gửi). Binh khí 5 = cờ Tây Sơn, 6 = cờ Thanh, cán 3,75 m, vải bay bằng shader (CO_T). `co` trong quan.json = cứ n người có 1 người cầm cờ (hành quân, tập kết, xung kích, Đống Đa, vào Thăng Long; quân Thanh khi vào Đại Việt, cận vệ Tôn Sĩ Nghị). Người cầm cờ không xông vào đánh.
- Cờ Thanh cắm ở doanh trại (`nvCoTrai`): Ngọc Hồi (đến C10), Hà Hồi (đến C07), Khương Thượng (C02–C12), Tây Long (C02–C13).

### 10.3 (21/11/2026)
- Lính Tây Sơn `chay` = `DT_Fast_Run` từ `_KHO-CHUNG/dong-tac.blend` (kho chung). Lưu ý: vị trí hông trong kho tính theo cm so với mẫu FBX gan-xuong → chia 100, bỏ trục tiến (z) để chạy tại chỗ.
- C03: Quang Trung đứng trên voi `ts_voi_qt` (quangtrung["2"] = {g, off}); mẫu `m_quangtrung.json` xuất lại từ `_KHO-CHUNG/nhan-vat/QuangTrung` (giảm còn ~23,5 nghìn tam giác, ảnh 1024) với động tác `QT_DangTay` (8 s: dang tay → chỉ tay phải → dang cao → chỉ tay trái).
- `ts_tuong`: 10 tướng cưỡi ngựa hai bên (5 + 5), `co=1` → bỏ giáo, cầm cờ dựng thẳng tại nắm tay (`nvGripNgua`).
- Mũi tên treo trên trời: arrowGroup.y = NV_MUITEN_CAO (200), chỉ hiện khi máy quay cao hơn 260 (nhìn toàn cảnh); xuống thấp thì ẩn. Hook `NHDD.arr()`.

### 10.4 (22/11/2026) – voice thu âm, bầu trời theo giờ
- Voice anh gửi (13:45, mono 44,1 kHz) → `web10/voice_ngochoi.mp3` (mono 32 kHz 48 kbps, 4,8 MB). Căn câu: `source/voice_ngochoi.py` (không có mạng tải mô hình nhận dạng → căn theo năng lượng âm: khoảng nghỉ + tỉ lệ số chữ trên thời gian có tiếng, kéo ranh giới câu về khoảng nghỉ gần nhất ±1,6 s). Kết quả `source/voice_ngochoi.json`.
- `source/apply_voice.py` ghi vào story.json: `dur` (theo voice), `dur_cu`, `ban_do` [[giây cũ, giây mới]], `subs` (phụ đề theo câu đọc), `S.voice`. Thứ tự dựng: build_quan10 → build_camera10 (tự khôi phục dur_cu) → apply_voice → build_v10.
- Web (`js_v10_voice.js`): voice tải qua blob, là đồng hồ phim (cảnh/giây lấy theo currentTime); máy quay, quân, ngày đêm, âm nền dùng `tCu/uCu` (nắn thời gian cũ). Có voice thì tắt giọng máy. Voice chưa mở khoá (chưa chạm) → phim tự đếm giờ.
- Bầu trời (`js_v10_troi.js` + shader): mặt trời đi theo độ tối – cảnh sáng dần mọc phía đông, cảnh tối dần lặn phía tây; vầng mặt trời rõ, chân trời ửng cam, mây nhuộm hồng lúc rạng đông / hoàng hôn, mây mỏng bớt khi mặt trời thấp.

### 10.5 (22/11/2026) – voice căn bằng nhận dạng tiếng nói, sửa theo sử
- Voice: nhận dạng sherpa-onnx `zipformer-vi-2025-04-20` (mô hình lưu ở `_KHO-CHUNG/cong-cu/asr-zipformer-vi-2025-04-20/`, chạy trên máy anh qua device_bash: `NgocHoiDongDa/voice/asr.py` → `voice/asr.json`). `source/can_nhdd.py` so chuỗi từ với lời dẫn story (story_goc.json) → khớp 94,4 % số từ, 172 câu; bỏ câu "Chi tiết này sẽ được tái dựng…" (không có trong bản thu). Ra `source/voice_ngochoi.json` → `apply_voice.py`.
- Thứ tự dựng: can_nhdd → build_quan10 → build_camera10 → apply_voice → build_v10. `source/moc_cu.py`: mốc câu trên dòng thời gian cũ (`U(cảnh, "đầu câu")`) cho sự kiện trong quan.json.
- Lính Thanh: thêm động tác `di` (DT_Standard_Walk trong kho, hông /100, tại chỗ) – đi bộ hành quân, tuần tra.
- Tôn Sĩ Nghị cưỡi ngựa (`nv_ngua_tsn.json`, kind `nguatsn`): đứng trước hàng quân ở Tây Long; C13 phi ngựa qua cầu phao.
- Chặt cầu phao: `quan.json.catcau` {i:12, u, gap:[860,902] m dọc P_CAU}; đội có `cat` (th_rut, th_canve): đã qua thì đi tiếp, ở nhịp bị chặt thì rơi xuống sông, còn lại kẹt lại ở đầu cầu. Nhịp cầu bị chặt trôi lệch theo dòng (`nvCauCat`). Shot 24–30,5 s (cũ) nhìn từ bờ Bồ Đề.
- Sầm Nghi Đống (`nv_samnghidong.json`, rig từ gan-xuong/Dying Backwards.fbx): đứng trước nhà chỉ huy gò Loa Sơn, ngã xuống ở câu "Sầm Nghi Đống tự sát" (C12); không dựng chi tiết.
- Tấm mộc: 3 tấm ghép một bức, nghiêng 60° (đỉnh ngả về người khiêng), không đòn; 10 người khiêng 2 hàng × 5 dưới bức mộc, giắt dao ngắn; 20 người theo sau 4 × 5; 20 bức hàng ngang.
- Giáo, đuốc giữ thẳng khi đi/chạy (nvGrip up). C11: `rai` (tản ra dọc/ngang theo thời gian) + `nhip` (chạy nhanh/chậm/vấp, tốc độ động tác khác nhau).

### 10.6 (22/11/2026) – điện thoại
- Nút "▶ Bắt đầu xem" (js_v10_voice.js): phim chờ ở giây 0; trong cú chạm: voice.play(), amEnable (AudioContext), bật lời bình rồi mới chạy phim. Bấm nút Phát cũng mở tiếng.
- Bỏ bộ tạo tiếng tổng hợp V6 (createAudio.build – tạo hàng chục giây tiếng bằng JS, gây treo khi bấm Âm thanh trên điện thoại); audio.enable chỉ còn là cờ.
- Âm nền nạp lười, giải mã lần lượt từng file khi cảnh cần (amNeed/amBed). am/*.mp3 cắt ≤ 32 s, mono 22 kHz (11 MB → 4,3 MB); bản gốc trong AmThanh.
- Máy quay: màn hình dọc (aspect < 1) tự lùi máy với shot gần (< 400 m). C03: thêm shot chính diện vua trên voi + tướng; thay shot "hàng ngũ tập hợp" bằng góc sau voi thấy cả ba quân và hai hàng tướng.

### 10.7 (22/11/2026)
- Dáng phi ngựa mới `Ngua_phi` (theo ảnh Muybridge "The Horse in Motion"): phi 4 nhịp chuyển chân (sau trái → sau phải → trước trái → trước phải), có pha bay gập chân dưới bụng, đầu cổ nhịp, đuôi. Dựng bằng công thức trong Blender (12 khung, 24 fps); nướng lại nv_ngua_ts / nv_ngua_th / nv_ngua_tsn (clip `chay`).
- C01: máy quay mở đầu lấy Hoàng thành làm tâm, lia ngang sang Phố chợ rồi sông Hồng.
- C02: Tôn Sĩ Nghị cưỡi ngựa đi đầu (`th_tsn_vao`); quân Thanh vào thành 600 người (3 hàng).
- Bức mộc: dựng gần thẳng (ngả 8°), cao che kín đầu; khung đòn gọn (2 đòn ngang ở tầm tay 2 hàng × 5 người + 3 đòn dọc). Khiêng tới gần hết bãi chông (A10a 162 m) mới bỏ. Trong đồn bắn ra: vệt lửa + khói bám trên mặt mộc (FX.vet, C09 cuối – C10).
- Voi chiến (`linh=1`): 2 lính đứng trên bành cầm giáo, đâm khi xông vào kỵ binh Thanh. Kỵ binh Thanh rối loạn rồi tán loạn tứ phía (`tan`).
- Bục bắn (`th_buc`, 57 người): bục gỗ sau lũy nam, đứng cao ngang mặt lũy, súng vươn ra ngoài; lính Thanh đứng trên 6 vọng gác (`th_gac`, `tren`).
- C10: cảnh toàn từ cuối đoàn quân nhìn về tường thành (thay shot 25,2–30,2 cũ). Từ 9:49 (u cũ .875) quân Tây Sơn tỏa ra đánh vào lều trại (`toa`).
- C11: đạo quân truy kích dàn 30 hàng ngang (300 người). Hành quân Bắc tiến (`ts_hq`) 960 người, 3 hàng dọc.
- Thẻ ghi chú khi bấm điểm pin: tự đặt giữa cụm nút trên và thanh phim dưới, ẩn bàn điều khiển khi thẻ mở.
- Hook kiểm tra: `NHDD.anc(id)`, `NHDD.camAt(id, dx, dy, z, tz)`, `NHDD.h(x, y)`, `NHDD.NV`.

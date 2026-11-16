# Việt Sử V4.1 + sa bàn 3D Thành cổ Quảng Trị 1972: tóm tắt dự án

Cập nhật: 16/11/2026. Đây là bản tóm tắt chính; mọi AI đọc trước khi làm.

## 1. Mục tiêu
Không gian 3D khám phá được trên web cho mục "Không gian lịch sử" của site Việt Sử: xem từng góc, chế độ đi bộ, lính hai bên chuyển động, xe tăng, máy bay, khói lửa, âm thanh. Gắn nhãn "Tái dựng mô phỏng — cần đối chiếu". Không cần video.

**Kịch bản sa bàn (anh Thắng chốt 16/11/2026):** Quân VNCH cố thủ trong thành (trên mặt thành, lô cốt), xe tăng và máy bay ở vòng sau; Quân đội Nhân dân Việt Nam bơi và chèo thuyền vượt sông Thạch Hãn, đánh vào chiếm thành.
Lưu ý lịch sử: kịch bản này khớp đợt giải phóng Quảng Trị (cuối 4 – 1/5/1972) hơn là 81 ngày đêm (28/6–16/9/1972, khi QĐND giữ thành). Phụ đề hiện ghi "Sa bàn mô phỏng · kịch bản: QĐND vượt sông đánh vào thành"; cách ghi mốc thời gian chưa chốt.

## 2. Cấu trúc repo
```
vietsu/                         website Việt Sử V4.1 (FastAPI). Trang chủ "/" = static/Viet_Su_Timeline_V4.1_Offline.html
  main.py                       có route /khong-gian (StaticFiles html=True) + CSP riêng cho sa bàn ('wasm-unsafe-eval', blob:)
  frontend/khong-gian-3d.js     thêm nút "Vào sa bàn 3D" vào popup scene:<id> (bảng KHONG_GIAN_3D); đã chèn vào V4.1_Offline.html và v39.js
  data/experiences_seed.json    quang-tri.asset_url = /khong-gian/thanh-co-quang-tri/
  start_local.command           chạy website đầy đủ trên Mac (tự tạo .env, .venv)
vietsu/static/khong-gian/thanh-co-quang-tri/    sa bàn (gọi tắt <SA_BAN>)
  index.html                    khung HTML, importmap → vendor/three (three.js 0.160 tự host, không dùng CDN)
  css/style.css, js/app.js      giao diện, toàn bộ logic three.js (một module)
  models/*.glb                  static, qdnd (+ toàn bộ clip), vnch, thuvien (35 mẫu đổ nát), thuyen — đã nén meshopt
  data/rai.json                 12.861 instance đổ nát: [chỉ số tên, x,y,z Blender, quat x,y,z,w Blender, scale]
  data/scene.json               chỉ còn dùng fx.smoke
  tex/*.webp                    texture đất, gạch
blender/xuat_web.py             xuất GLB/rai.json từ file .blend
tools/build_artifact.py         đóng gói <SA_BAN> thành bản base64 cho artifact Claude
```
Không có trong repo (gitignore): `vietsu/.env`, `vietsu/data/vietsucms.sqlite3`, `vietsu/static/uploads/`, `vietsu/.venv/`.
Đường dẫn trong giao diện dùng dạng tương đối (`khong-gian/...`, `../../`) để chạy được cả ở "/" (máy chủ Việt Sử) lẫn "/hoclichsu/" (GitHub Pages).


## 2b. Địa hình theo OpenStreetMap (16/11/2026, file GD6)
- Dữ liệu: `docs/du-lieu/thanh_co_quang_tri_osm.geojson` (kinh–vĩ độ gốc) và `docs/du-lieu/osm_local.json` (toạ độ sa bàn). © OpenStreetMap contributors (ODbL). Lấy bằng API openstreetmap.org (`/api/0.6/map`) qua trình duyệt trên máy anh Thắng; Overpass trả 406.
- Hệ toạ độ sa bàn: gốc = tâm Thành cổ (≈16.75376, 107.18941), **OSM xoay +16,6°** để các mặt thành thẳng trục X/Y (thành thật xoay 16,6° theo chiều kim đồng hồ). Vì vậy "Bắc" của sa bàn lệch 16,6° so với Bắc thật.
- Sông Thạch Hãn chạy gần Bắc–Nam ở **phía Tây** thành: bờ Đông x≈−480…−530, bờ Tây x≈−700…−740 (|y|<800), đáy −1,45…−4,6 m. Lòng sông cũ (Tây Nam) đã lấp. Trục web: `RIVER_A=[-668,746]` → `RIVER_B=[-606,-728]`.
- File `ThanhCoQuangTri_1972_GD6.blend`: địa hình sửa (bản trước lưu ở mesh `DiaHinh_ChienTruong_GD5_backup`), 214 mặt cây cháy rơi vào sông đã xoá, collection `11_GD6_NhaDan` với `NhaDan_1972`: 123 nhà dân thưa dọc các trục đường OSM (52 mái ngói, 32 mái tôn, 39 nhà đổ nát; bờ Tây gần thành chủ yếu nhà đổ nát; chừa dải trận địa x −350…−290). Vật liệu tường `M_TuongVoi`.
- Web: QĐND bơi/chèo từ bờ Tây sang, đổ bộ, trận địa ngoài hào **mặt Tây**; VNCH dồn mặt Tây (46 lính), xe tăng hướng Tây; máy bay quần trên sông phía Tây; nước sẫm `0x1b4560`.

## 2c. Nhân vật QĐND mẫu mới (16/11/2026, file GD7)
- Nguồn: các FBX "with skin" mới trong `NhanVat_Mixamo/` (Rifle Walk, Crouch Idle 03 Looking Over, Prone Reloading, Standing Run Forward, Walk Crouching Forward, Walk Forward Left, Walk Right). Lưới `QDND_TPose_Reference` (7.180 đỉnh): mũ cối, quân phục xanh, dây đeo, bao đạn, ba lô, texture chiếu ảnh trước/sau 1024×1536.
- FBX gốc có tư thế nghỉ **nằm ngửa** (hệ trục Z-up, đơn vị bị chia 100) và hệ trục xương khác rig cũ → không thay lưới trực tiếp được. Đã dựng `Rig_QDND_Moi` (đứng thẳng, quay 180° cho nhìn −Y, scale 0,876 để hông cao 0,93 m như rig cũ) + `QDND_Nguoi_Moi` + `Sung_AK47_Moi` (gắn xương RightHand).
- Chuyển động: text block `retarget_qdnd.py` trong .blend chuyển theo không gian thế giới (giữ độ lệch tư thế nghỉ). 14 clip cũ (QuyBan, ChevThuyen, Boi/BoiVaoBo/DapNuoc/ChayBan/ChayLonNhao/DiNgamBan/DiNgangBan/NemLuuDan/NgaXuong/NhaoRaTruoc/NhayTuongXuong/TrungDan `_TaiCho`) + 7 clip mới: `NupQuanSat`, `NamNapDan`, `DiCamSung_TaiCho`, `ChayToi_TaiCho`, `DiKhom_TaiCho`, `DiCheoTrai_TaiCho`, `DiNgangPhai_TaiCho` (đã bỏ trôi ngang của hông).
- Vật liệu: `QDND_Moi_Truoc`, `QDND_Moi_Sau`, `QDND_Moi_Suon` (mặt nghiêng sang hai bên gán màu ô liu đặc để không bị vệt sọc do ảnh chiếu). Đã bỏ nút normal map sai (dùng ảnh màu làm normal).
- **Mỗi phe một bộ clip:** `qdnd.glb` (21 clip, 966 KB) và `vnch.glb` (10 clip, 333 KB, NLA trên `Rig_VNCH`). `app.js`: `clips` (QĐND) và `clipsV` (VNCH); `spawn()` chọn theo phe.
- Rig cũ `Rig_QDND` vẫn giữ trong .blend làm nguồn chuyển động; các lính đặt sẵn trong .blend (render) vẫn dùng mẫu cũ.

## 3. Nội dung web hiện có (app.js)
- **Cảnh tĩnh (static.glb):** địa hình, sông/hào (nước xanh `0x2e78ae`), tường thành vỡ GD4 (dày 8,5 m, mặt trong ±245,5 m, mặt ngoài ±254,5 m), Cổng Tiền chi tiết, 3 cổng còn lại dạng khối, 237 hố bom có viền đất, 9 nhà đổ nát, tháp nước, 2 tháp sắt quan sát (140,120 đứng; 120,−140 gãy), dây thép gai, xác xe, 4 xe tăng M41, 2 máy bay A-37.
- **Vật liệu web** gán theo TÊN vật liệu glTF (bảng `BYMAT`) vì vật liệu procedural của Blender xuất ra bị trắng.
- **Đổ nát rải:** InstancedMesh từ `thuvien.glb` + `rai.json` (quat three = (qx, qz, −qy, qw)). Mobile bỏ gạch rời và cục đất.
- **Nhân vật** (hàm `spawn()`; desktop ~296, mobile ~một nửa qua hệ số `MUL`):
  - VNCH: ~102 trên mặt thành (Nam 46, Tây 36, Đông/Bắc 10), 18 lô cốt (`BUNKERS`) × 2 lính, 4 xe tăng (`TANKS`) chuyển vào trong thành × 3 lính.
  - QĐND: 36 bơi qua sông + 12 bơi qua hào; 6 thuyền × (1 quỳ bắn + 3 chèo, mái chèo đặt theo xương tay mỗi khung); 46 ở trận địa bắn ngoài hào; 30 tổ xung kích chạy từ bờ sông lên rồi quỳ bắn.
  - Ẩn nhân vật xa > 1150 m (mobile 650 m); chỉ đổ bóng nhân vật trong 170 m.
- **Hiệu ứng:** nổ ngẫu nhiên 0,5–1,8 s theo vùng (bãi đổ bộ, sông → cột nước, hào, mặt thành, trong thành); máy bay bay elip tâm (−130,−360), thả loạt 4 bom có tiếng rít; xe tăng bắn ra ngoài; 130 đường đạn lửa; 24 đám cháy; khói cột.
- **Âm thanh:** nút "Âm thanh" (mặc định tắt). Tổng hợp bằng WebAudio, không có file âm thanh: súng, liên thanh, nổ (trễ theo khoảng cách 340 m/s), nước bắn, bom rít, động cơ máy bay (âm thanh vị trí), nền chiến trường.
- **Góc nhìn:** Toàn cảnh, Cổng Tiền, Trong thành, Mũi tấn công QĐND, Bơi vượt sông, Thuyền vào thành, Tháp sắt, VNCH cố thủ, Xe tăng. Chế độ đi bộ (lưới độ cao 2 m, chặn bởi tường/nhà).
- **Hiệu năng:** cắt nhân vật ngoài khung nhìn (frustum), mixer xa cập nhật 4–10 lần/giây, địa hình/hố bom/đổ nát nhỏ không đổ bóng, 3 đèn lửa, biên dịch shader trước khi tắt màn tải, tự hạ chất lượng khi < 28 khung/giây (mức 3 → 0: độ phân giải, bóng, tầm nhìn nhân vật). Đo bằng phần mềm: ~750–1.400 draw call (trước đó ~2.700).
- **Lỗi đã sửa 16/11/2026:** khi tắt âm thanh, tiếng nổ đầu tiên đọc `SND.boom[...]` chưa có → lỗi trong vòng vẽ → trang đứng hình sau ~1 giây. Đã chặn bằng `(SND.boom||[])[...]`.

## 4. Quy ước kỹ thuật
- Toạ độ Blender→three: `B(x,y,z) = (x, z, -y)`; hướng Blender (dx,dy) → `rotation.y = atan2(dx, −dy)` (hàm `faceTo`). Lính Mixamo và xe tăng nhìn về −Y Blender.
- Sông: trục `RIVER_A=[-430,-420]`→`RIVER_B=[-80,-640]`, lòng sông ~±122 m; s>0 bờ Nam (xa), s<0 bờ phía thành (`crossPath(t,s0,s1)`). Hào d≈262–296 m. Mặt nước y = −1,1.
- Mixamo: xương `mixamorig:` (three bỏ dấu `:` → `mixamorigLeftHand`); action 30 fps, scene 24 fps → `timeScale = 30/24`.
- Clip: xem mục 2c (qdnd.glb 21 clip, vnch.glb 10 clip; mỗi phe dùng clip của chính file mình).
- Xuất glTF: nhân vật `export_animation_mode='NLA_TRACKS'`; cảnh tĩnh `export_vertex_color='ACTIVE'`, `export_image_format='NONE'`. Nén `gltf-transform meshopt` (KHÔNG dùng `optimize`).
- Shader khói Points cần `#include <common>` + chunk logdepthbuf (renderer dùng logarithmic depth buffer).

## 5. File Blender (ngoài repo)
- Ổ ngoài: `/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/Thành cổ Quảng Trị/3D_GiaiDoan1/` — `ThanhCoQuangTri_1972_GD7.blend` mới nhất (GD6 = địa hình OSM; GD5 = mặt đất đổ nát; GD4 = tường), `boat/`, `NhanVat_Mixamo/`.
- Tên thư mục "Thành cổ…" dạng Unicode NFD trên macOS: dùng `os.path.dirname(bpy.data.filepath)`.
- Collection chính: `08_GD4_TuongVo_CongTien`, `09_GD5_MatDatDoNat` (HoBom_VienDat_GD5, RaiDoNat_GD5 + Geometry Nodes, tháp sắt), `09_GD5_ThuVien` (mẫu đổ nát, exclude), `10_ThuyenVuotSong`, `00_ThuVien_NhanVat` (Rig_QDND_Moi = mẫu mới dùng cho web, Rig_QDND = mẫu cũ làm nguồn chuyển động, Rig_VNCH; NLA tracks).
- Địa hình đã bị hạ ở lòng hố bom; bản gốc ở mesh `DiaHinh_ChienTruong_GD4_backup`.
- Vị trí lính trong .blend vẫn theo kịch bản cũ; web tự sinh nhân vật theo kịch bản mới.

## 6. Việc tiếp theo
1. **Vật liệu (bước 3):** cháy sém/ám khói/bụi, bake vào texture cho tường, gạch, đá viền cổng, ngói, đống gạch, đất hố bom, sắt/tôn → xuất lại static.glb.
2. Kiểm tra hiệu năng trên laptop và điện thoại thật; nếu giật: giảm số lính xa, LOD, gộp nhân vật xa.
3. Cảnh cập bờ: bộ đội bơi tới bờ (BoiVaoBo), thuyền cập bờ rồi bộ đội lên bờ; lính trúng đạn ngã (TrungDan/NgaXuong).
4. Chốt cách ghi mốc thời gian lịch sử cho kịch bản.
5. Tuỳ chọn: Cổng Hậu/Tả/Hữu chi tiết như Cổng Tiền; cầu qua hào; chỉnh sông/thành theo dữ liệu bản đồ thật (tâm thành 16.7538404, 107.1895488).
6. ~~Ghép vào site Việt Sử~~ — đã gắn: popup Không gian lịch sử → Thành cổ Quảng Trị → "Vào sa bàn 3D". Lưu ý sẵn có của V4.1: CSP chặn Leaflet từ unpkg nên bản đồ OpenStreetMap không tải (rơi về bản đồ véc-tơ offline) — cần tự host Leaflet hoặc mở CSP cho unpkg.

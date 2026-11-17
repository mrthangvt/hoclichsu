> **17/11/2026 — đã đủ tài nguyên V4.8:** nhập 17 WebP V4.3 từ ZIP gốc chủ dự án cung cấp. Kiểm tra strict đạt 41/41; build V4.8 thành công, HTML khớp SHA-256 V4.6. Các ghi chú thiếu ảnh bên dưới là lịch sử. Chờ duyệt PR và các nhánh phụ thuộc trước khi đưa lên Pages.

> **17/11/2026 — đã nhập bản ZIP V4.8 của chủ dự án:** lưu nguyên gói tại `archives/viet-su-v4.8/`, đã đưa đủ 24 avatar V4.5 vào `vietsu/static/avatar-v45/`. Còn thiếu 17 ảnh V4.3; chưa triển khai GitHub Pages. Thông tin dưới đây nói 24 avatar chưa có trên GitHub là trạng thái trước lần nhập này.

> **V4.8 – bổ sung Avatar 24/41:** Chủ dự án đã gửi ZIP có đủ 24 WebP Avatar V4.5 (6 nhóm, kích thước 64/128/256/512). Nhánh `gpt/v4.8-restore-avatar-lock-ui` kế thừa V4.7, bản dựng khóa HTML y hệt V4.6; `tools/check_v48_assets.py` chặn build nếu thiếu ảnh. **Còn thiếu 17 WebP V4.3 và 24 WebP mới CHƯA có trên GitHub, cần người dùng bổ sung đúng đường dẫn.** Không merge/deploy cho đến khi đủ ảnh và duyệt. Xem `docs/CHANGELOG_V4.8.md`.

> **V4.7 – 17/11/2026: CHỐT KHÓA GIAO DIỆN THEO V4.6 (nhánh `gpt/v4.7-period-profiles`, PR #8 Draft).** Theo yêu cầu chủ dự án, trang V4.7 phải giống hệt HTML V4.6; bộ dựng sao chép byte-for-byte và so SHA-256. Đã gỡ bản demo HTML độc lập khác giao diện và CSS/JS tự thêm Popup. V4.7 giữ 19 giai đoạn × 13 chuyên mục trong dữ liệu, CMS `/admin/periods` nhưng **chưa đưa thanh chuyên mục mới lên giao diện công khai**. Chỉ thay UI khi chủ dự án yêu cầu. **41 WebP kế thừa vẫn thiếu trên GitHub; chưa đủ điều kiện xác nhận build full / merge.** Xem `docs/CHANGELOG_V4.7.md`.

> **V4.6 – nhánh gpt/v4.6-avatar-cms-scenes (chờ duyệt):** Popup Không gian lịch sử có nút vào sa bàn 3D nếu địa điểm có asset thật (Thành cổ Quảng Trị hiện có), Popup Full mở cân đối, Hồ Chí Minh lấy avatar chương 7, nhân vật Trung Quốc chưa có trang phục phù hợp dùng hình mặc định trung tính; có công cụ quản trị avatar tại `/admin/avatar` (cắt/zoom/khử nền trắng đơn giản/duyệt ảnh). Backend có API lưu avatar Local, không ảnh hưởng CMS cũ; GitHub Pages chỉ hiển thị tĩnh. **Ảnh V4.3/V4.5 (41 WebP) vẫn cần được upload lên nhánh trước merge.** Xem `docs/CHANGELOG_V4.6.md`. V4.6 kế thừa các nhánh V4.2–V4.5 chưa merge.

> **V4.5 đang chờ duyệt:** 6 avatar AI minh họa theo vai trò (hoàng đế, quan văn, võ tướng, quý nữ, nữ võ tướng, phụ nữ), nền WebP trong suốt; khung chuẩn 1:1 cho danh sách 80 nhân vật và Popup. Ảnh riêng đã duyệt có quyền ưu tiên. Đã kiểm tra desktop và mobile. **Bộ WebP cần được chép từ ZIP lên GitHub trước khi merge**. Phải merge PR V4.2–V4.4 trước. Xem docs/CHANGELOG_V4.5.md. Ảnh minh họa KHÔNG PHẢI chân dung lịch sử xác thực.

> **V4.4 (gpt/v4.4-hcm-avatar-4-5, chờ duyệt):** hoán đổi avatar hai giai đoạn 4 (1941–1945) và 5 (1945–1954) trên desktop + mobile, không sửa mốc/nội dung; đã kiểm tra Chromium 1440/390/320. Xem [CHANGELOG_V4.4.md](CHANGELOG_V4.4.md). V4.4 kế thừa V4.3 (và V4.2); cần duyệt đủ ảnh WebP của V4.3 trước khi merge các bản theo thứ tự.

> **Bổ sung V4.3 — đang chờ duyệt:** chuyển ba avatar Hồ Chí Minh giữa các chặng 1924–1941, 1941–1945, 1954–1969; bổ sung 17 ảnh WebP biểu tượng trang phục và Mũ & Tóc theo từng triều đại và quân phục năm 1972. CSS/JS, build, Backend và cấu hình Pages đã nằm trên nhánh `gpt/v4.3-icons-hcm`, **nhưng 17 tệp ảnh cần được anh chép từ ZIP lên GitHub trước khi merge**. Xem `docs/CHANGELOG_V4.3.md` và `HUONG_DAN_UPLOAD_MAC.md` trong gói ZIP. Nhánh V4.3 kế thừa V4.2, vì vậy cần nhập V4.2 trước. Các ảnh là tranh minh họa chưa được thẩm định sử học hoàn toàn.

> **Nâng cấp V4.2 (nhánh gpt/v4.2-timeline-khong-gian-ui, chờ duyệt):** bản đồ véc-tơ cố định, 2 nút lọc, thumbnail vector trong cột địa điểm, nút sa bàn Thành cổ Quảng Trị ngay trên Timeline 1972, cải thiện thư viện trang phục/Mũ & tóc và các liên kết nhân vật, nới chặng Hồ Chí Minh 1941–1945, tối ưu mobile, build tĩnh V4.2 và Backend. Xem [CHANGELOG_V4.2.md](CHANGELOG_V4.2.md). **Không thay đổi mô hình GLB hay kịch bản chiến đấu; ảnh đại diện chưa phải ảnh tư liệu.**

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
- Clip trong qdnd.glb: QuyBan, DiNgamBan_TaiCho, NemLuuDan_TaiCho, Boi_TaiCho, ChayLonNhao_TaiCho, NhayTuongXuong_TaiCho, DiNgangBan_TaiCho, ChevThuyen. Clip khác có trong .blend (chưa xuất): Boi, BoiVaoBo, DapNuoc, ChayBan, NhaoRaTruoc, TrungDan, NgaXuong (+ `_TaiCho`).
- Xuất glTF: nhân vật `export_animation_mode='NLA_TRACKS'`; cảnh tĩnh `export_vertex_color='ACTIVE'`, `export_image_format='NONE'`. Nén `gltf-transform meshopt` (KHÔNG dùng `optimize`).
- Shader khói Points cần `#include <common>` + chunk logdepthbuf (renderer dùng logarithmic depth buffer).

## 5. File Blender (ngoài repo)
- Ổ ngoài: `/Volumes/xMABUx/99_CA_NHAN/Hoc-lich-su/Thành cổ Quảng Trị/3D_GiaiDoan1/` — `ThanhCoQuangTri_1972_GD5.blend` mới nhất (GD4 = sau bước tường; GD3 trước đó), `boat/`, `NhanVat_Mixamo/`.
- Tên thư mục "Thành cổ…" dạng Unicode NFD trên macOS: dùng `os.path.dirname(bpy.data.filepath)`.
- Collection chính: `08_GD4_TuongVo_CongTien`, `09_GD5_MatDatDoNat` (HoBom_VienDat_GD5, RaiDoNat_GD5 + Geometry Nodes, tháp sắt), `09_GD5_ThuVien` (mẫu đổ nát, exclude), `10_ThuyenVuotSong`, `00_ThuVien_NhanVat` (Rig_QDND/Rig_VNCH, NLA tracks).
- Địa hình đã bị hạ ở lòng hố bom; bản gốc ở mesh `DiaHinh_ChienTruong_GD4_backup`.
- Vị trí lính trong .blend vẫn theo kịch bản cũ; web tự sinh nhân vật theo kịch bản mới.

## 6. Việc tiếp theo
1. **Vật liệu (bước 3):** cháy sém/ám khói/bụi, bake vào texture cho tường, gạch, đá viền cổng, ngói, đống gạch, đất hố bom, sắt/tôn → xuất lại static.glb.
2. Kiểm tra hiệu năng trên laptop và điện thoại thật; nếu giật: giảm số lính xa, LOD, gộp nhân vật xa.
3. Cảnh cập bờ: bộ đội bơi tới bờ (BoiVaoBo), thuyền cập bờ rồi bộ đội lên bờ; lính trúng đạn ngã (TrungDan/NgaXuong).
4. Chốt cách ghi mốc thời gian lịch sử cho kịch bản.
5. Tuỳ chọn: Cổng Hậu/Tả/Hữu chi tiết như Cổng Tiền; cầu qua hào; chỉnh sông/thành theo dữ liệu bản đồ thật (tâm thành 16.7538404, 107.1895488).
6. ~~Ghép vào site Việt Sử~~ — đã gắn: popup Không gian lịch sử → Thành cổ Quảng Trị → "Vào sa bàn 3D". Lưu ý sẵn có của V4.1: CSP chặn Leaflet từ unpkg nên bản đồ OpenStreetMap không tải (rơi về bản đồ véc-tơ offline) — cần tự host Leaflet hoặc mở CSP cho unpkg.

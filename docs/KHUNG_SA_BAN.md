# Khung sa bàn dùng chung — quy chuẩn bắt buộc cho mọi sa bàn, di tích 3D mới

Phiên bản quy chuẩn: 1.0 (23/11/2026). Bản trình bày đầy đủ cho chủ dự án: tài liệu "Khung sa bàn dùng chung — Việt Sử" (https://claude.ai/artifact/LSEoZWGe3ucnQGQGWtM7hM). File này là bản chính cho người và AI làm việc trong repo.

> **Trạng thái hiện tại:** khung mới được chốt thiết kế; **bộ máy `engine/1.0.0` chưa được viết**. Việc tiếp theo là Giai đoạn 1 (mục 9). Trước khi bộ máy có thật, không tạo sa bàn mới theo kiểu riêng lẻ như 4 sa bàn cũ; nếu buộc phải làm, vẫn tổ chức dữ liệu theo định dạng gói ở mục 3 để chuyển sang bộ máy không phải làm lại.

## 1. Nguyên tắc
- **Bộ máy viết một lần, mỗi trận / di tích là một gói dữ liệu.** Không chép mã bộ máy vào từng sa bàn; mọi khác biệt giữa các trận nằm trong gói.
- Mọi chuỗi hiển thị bằng tiếng Việt, nằm trong gói, không nằm trong mã.
- Mọi sa bàn có nhãn "Tái dựng mô phỏng — cần đối chiếu tư liệu"; không bịa số liệu, ngày tháng (như `AGENTS.md`).
- three.js tự chứa trong bộ máy (0.160), **không tải từ CDN ngoài** (jsdelivr, unpkg).
- Toạ độ lưu theo Blender; bộ máy đổi `B(x,y,z) → (x, z, −y)`.

## 2. Cấu trúc thư mục
```
vietsu/static/khong-gian/
  engine/1.0.0/          bộ máy chung (vendor/three, core, camera, story, fx, audio, ui, host) + sa-ban.html
  catalog.json           danh sách gói đang phát hành (website + app đọc từ đây)
  packs/
    _mau/                gói mẫu để sao chép khi bắt đầu trận mới (tạo ở Giai đoạn 1)
    <id-goi>/
      pack.json          khai báo gói (mục 3)
      terrain/           địa hình .glb, ảnh bề mặt .ktx2/.webp, nước
      units/             mỗi loại quân một .glb kèm động tác (NLA → glTF animations)
      props/             thành, lũy, nhà, cây, thuyền… .glb
      placement.json     vị trí quân / vật thể đặt hàng loạt
      story.json         kịch bản (battle) hoặc tour.json (site)
      audio/             voice-c01.mp3 … nhac-nen.mp3 (tách theo chặng)
      sources.json       nguồn tư liệu, giấy phép dữ liệu, mức độ phục dựng
      thumb.webp
```
`<id-goi>`: chữ thường không dấu, gạch nối, có năm nếu cần phân biệt (`bach-dang-938`, `bach-dang-1288`).

## 3. Định dạng gói
`pack.json` (bắt buộc): `id`, `version` (semver), `engine` (dải phiên bản, ví dụ `^1.0`), `kind` (`battle` | `site`), `title`, `period` (mã triều đại trong Việt Sử), `year`, `label`, `coords` (`system: "blender"`, `geo: {lat0, lon0, rotationDeg}`), `terrain`, `sides` (battle: phe, màu, danh sách unit), `placement`, `story` hoặc `tour`, `views` (góc nhìn có tên: `target`, `az`, `el`, `dist`), `quality` (`mobileUnitScale`, `maxShadowDistM`), `budget`, `sources`.

`story.json` (battle) — một định dạng chung, ghép từ 3 sa bàn cũ:
- `chapters[]`: `id`, `title`, `place`, `date_label`, `dur` (giây), `vo` (lời thuyết minh), `voice` (file mp3), `hist` (ngày lịch sử đầu – cuối, ánh xạ tuyến tính vào thời lượng).
- trong mỗi chặng: `shots[]` (`target`, `az`, `el`, `dist`, `dur` hoặc `follow` + `off`/`look`), `layers` (bật/tắt), `arrows` (mũi tên tiến quân), `moves` (nhóm quân, đường đi, động tác theo thời gian), `cues` (nổ, khói, cháy, tiếng trống, phụ đề — một lần tại giây `t`).

`tour.json` (site): `stops[]` (`id`, `title`, `view`, `vo`, `voice`, `images`, `layer: "hien-trang" | "phuc-dung"`).

`sources.json`: mỗi nguồn có `title`, `type` (sử liệu, chuyên khảo, bản đồ, OSM, DEM, ảnh quét…), `url` hoặc trang PDF, `license`, `used_for`. Dữ liệu OSM ghi "© OpenStreetMap contributors (ODbL)".

## 4. Bộ máy (engine) — mô-đun và API
Mô-đun: `core/loader`, `core/scene`, `core/units`, `core/quality`, `camera`, `story`, `fx`, `audio`, `ui`, `host`. Nguồn gộp: Quảng Trị (loader, units, quality, follow), Điện Biên Phủ (director, shots, hist), Ngọc Hồi / Rạch Gầm (ui, mũi tên, story). Chi tiết từng mô-đun: tài liệu khung.

Trang một sa bàn:
```html
<div id="sa-ban"></div>
<script type="module">
  import { SaBan } from '../engine/1.0.0/sa-ban.js';
  const sb = await SaBan.mount('#sa-ban', { pack: '../packs/ngoc-hoi-dong-da/' });
</script>
```
API: `play/pause/seek/goto`, `view`, `layer`, `quality`, `on('ready'|'scene')`, `stats()`. Thay đổi phá vỡ định dạng gói → tăng số chính của bộ máy (2.0).

## 5. Ngân sách (đề xuất ban đầu, chỉnh sau khi thử máy thật)
| Chỉ số | Máy tính | Điện thoại tầm trung |
|---|---|---|
| Tải lần đầu, đã nén, không tính âm thanh | ≤ 15 MB | ≤ 15 MB |
| Tam giác trên màn hình | ≤ 1,5 triệu | ≤ 400 nghìn |
| Draw call mỗi khung | ≤ 800 | ≤ 250 |
| Quân chuyển động cùng lúc | ~300 | ~120 |
| Khung hình | ≥ 50 fps | ≥ 30 fps |
| Âm thanh | MP3 96 kb/s, tách theo chặng, tải khi phát | như máy tính |

Định dạng: GLB nén `gltf-transform meshopt` (không dùng `optimize`), ảnh KTX2 hoặc WebP, quân giống nhau đặt hàng loạt từ `placement.json`, động tác dùng chung bộ xương Mixamo.

## 6. Quy trình làm một gói mới (6 bước)
1. **Tư liệu và kịch bản** — nguồn, chia chặng, lời thuyết minh, `sources.json`. *(chủ dự án duyệt)*
2. **Địa hình** — dữ liệu ở mục 7, dựng trong Blender.
3. **Quân và vật thể** — dùng lại thư viện chung trước, chỉ dựng mới điểm khác biệt.
4. **Xuất gói** — `blender/xuat_web.py` (mở rộng) → GLB, meshopt, `placement.json`, khung `pack.json`.
5. **Dựng cảnh và lồng tiếng** — `story.json`; giọng theo Project "Dự án làm sa bàn" › `quy-trinh-gan-voice-sa-ban.md`.
6. **Kiểm tra và duyệt** — `tools/kiem_tra_goi.py` (tạo ở Giai đoạn 4) đo ngân sách và định dạng; chạy thử máy tính + một Android phổ thông; nhánh `claude/<id-goi>` → Pull Request → chủ dự án duyệt. Thêm gói vào `catalog.json` trong cùng PR.

## 7. Dữ liệu đầu vào — ai lấy, lấy ở đâu
AI tự lấy được hầu hết dữ liệu mở; chủ dự án chỉ cần cung cấp tư liệu không có trên mạng và các quyết định.

| Dữ liệu | Nguồn | Ai lấy, bằng cách nào |
|---|---|---|
| Sông, đường, làng, khu dân cư hiện nay | OpenStreetMap (API `api.openstreetmap.org/api/0.6/map` hoặc Overpass) | AI tự lấy qua máy anh Thắng (`device_bash` / trình duyệt Chrome) vì máy chủ của Claude bị chặn mạng ra ngoài; lưu `docs/du-lieu/<id-goi>_osm.geojson` |
| Độ cao địa hình | Copernicus DEM GLO-30 (30 m), SRTM | AI tự lấy qua máy anh Thắng, cắt theo khung sa bàn |
| Toạ độ địa danh lịch sử | Sử liệu (Toàn thư, Việt Nam sử lược), chuyên khảo, khảo cổ | AI tra cứu, đưa ra phương án vị trí kèm nguồn; **chủ dự án chốt** khi có nhiều thuyết |
| Bản đồ cổ (Pháp thuộc, đầu thế kỷ XX) | Thư viện số công khai | AI tìm; nếu cần bản quét chất lượng cao không công khai thì chủ dự án cung cấp |
| Diễn biến, quân số, ngày tháng | Sách trong thư mục "Tài liệu sử", nguồn chính thống | AI đọc, viết lại, ghi trang |
| Mô hình nhân vật, quân phục | Blender trên máy anh Thắng (MCP for Blender), Tripo3D, Mixamo | AI dựng qua MCP; ảnh tham chiếu quân phục do AI tìm, chủ dự án duyệt |
| Ảnh quét di tích (site) | Chụp/quét tại chỗ | **Chủ dự án** (hoặc đơn vị được thuê) chụp, **xin phép ban quản lý di tích** |
| Lời thuyết minh | Theo quy trình gắn voice | AI soạn lời; chủ dự án duyệt giọng |

Lưu ý đã gặp: Overpass từng trả 406 khi gọi từ trình duyệt (xem `docs/TOM_TAT.md` mục 2b) — dùng API `/api/0.6/map` theo khung nhỏ, hoặc Overpass qua `curl` trên máy anh Thắng.

## 8. Lưu trữ, phiên bản, tích hợp
- Git: bộ máy, `pack.json`, `story.json`, `placement.json`, `sources.json`. File nặng (GLB, KTX2, MP3): Cloudflare R2 + CDN (hoặc VPS sau Cloudflare), tên file kèm mã nội dung. File `.blend`, ảnh quét gốc: ổ xMABUx, không lên repo.
- Website Việt Sử, app, PWA đọc `catalog.json`; không thêm bảng sa bàn viết tay mới (như `SCENES` trong `v46.js`, `SA_BAN_3D` trong `v53.js`) — khi có catalog, các bảng này đọc từ catalog.
- App: chỉ chứa bộ máy + catalog; từng gói tải về để xem offline.

## 9. Lộ trình
Quyết định của chủ dự án (23/11/2026): Ngọc Hồi – Đống Đa làm sa bàn mẫu; **Bạch Đằng 938 và Như Nguyệt 1077 đưa vào repo theo khung mới luôn** (không đưa bản cũ lên trước).

Nhận xét kỹ thuật: Ngọc Hồi V10, Rạch Gầm, Bạch Đằng V4 và Như Nguyệt V1.6 **cùng một dòng mã** (cùng giao diện 3 chế độ Phim / Khám phá / Góc nhìn nhân vật, nhân vật nướng sẵn dạng `nv_*.json`, `story.json`, `inst.json`, `height.png` + `color.jpg`, âm thanh `am/`). Bộ máy 1.0 vì vậy được tách từ dòng mã này; Quảng Trị và Điện Biên Phủ chuyển sau.

1. **Giai đoạn 1** — bộ máy 1.0 tách từ dòng Ngọc Hồi / Bạch Đằng + chuyển Ngọc Hồi – Đống Đa làm mẫu. Chuyển `nv_*.json` sang GLB nén. Xong khi: chạy như bản cũ, tải lần đầu ≤ 15 MB, ≥ 30 fps trên Android tầm trung. Tạo `packs/_mau/`.
2. **Giai đoạn 2** — ba gói cùng dòng: **Bạch Đằng 938** (`bach-dang-938`), **Như Nguyệt 1077** (`nhu-nguyet-1077`), Rạch Gầm – Xoài Mút. Dùng chung thư viện: dân binh, lính Nam Hán, thuyền Tây Sơn, ngựa, âm thanh nền.
3. **Giai đoạn 3** — Quảng Trị, Điện Biên Phủ.
4. **Giai đoạn 4** — `catalog.json`, R2 + CDN, `tools/kiem_tra_goi.py`, website đọc catalog. (Có thể làm `catalog.json` sớm cùng Giai đoạn 2 để Bạch Đằng, Như Nguyệt hiện trên Việt Sử ngay.)
5. Sau đó mỗi trận mới là một gói theo quy trình mục 6.

Các sa bàn cũ chạy song song tới khi bản theo khung được duyệt.

### Nguồn của hai sa bàn đang nằm ngoài repo
| Sa bàn | Bản đang chạy (đủ tệp) | Mã nguồn, script dựng | Ghi chú dung lượng |
|---|---|---|---|
| Bạch Đằng 938 V4 / V1.2 | Artifact slug `440c9fcf-5cee-4e56-8fa1-2cd73fe5c1a1` | Máy anh Thắng: `Hoc-lich-su/SabanBachDang/web_v2/` (`_nguon/`: build_geo, build_inst, build_story, bake_bd) | Nhân vật JSON ~26 MB, nhạc 11 MB |
| Như Nguyệt 1077 V1.6 | Artifact slug `3b92f7b7-e318-4ede-a7c0-8f0ff3c3ab7f` | Script dựng (build_geo, build_story, bake_nn, bake_ngua2, nhac) ở phiên Claude cũ, **chưa chép về máy** — lấy lại từ artifact và Project › `sa-ban-nhu-nguyet-1077-v1.md` | Nhân vật JSON ~64 MB (quan-ly 14,6 MB, dan-binh 13 MB) |

Ghi chép chi tiết từng sa bàn (quy ước, bài học nướng động tác, quy tắc phe): Project "Dự án làm sa bàn" › `sa-ban-bach-dang-938-v1.md`, `sa-ban-nhu-nguyet-1077-v1.md`. Các quy tắc chung trong đó (một bảng phe duy nhất, không để phe này mang cờ phe kia; chỉ quân chính quy giao chiến; chuyển động tác Mixamo theo xoay thế giới) **áp dụng cho mọi gói**.

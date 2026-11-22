# Khung sa bàn dùng chung — quy chuẩn bắt buộc cho mọi sa bàn, di tích 3D mới

Phiên bản quy chuẩn: 1.1 (23/11/2026, cập nhật sau Giai đoạn 1). Bản trình bày đầy đủ cho chủ dự án: tài liệu "Khung sa bàn dùng chung — Việt Sử" (https://claude.ai/artifact/LSEoZWGe3ucnQGQGWtM7hM). File này là bản chính cho người và AI làm việc trong repo.

> **Trạng thái hiện tại:** **bộ máy `engine/1.0.0` đã có** (Giai đoạn 1 xong, chờ chủ dự án duyệt). Gói mẫu `packs/ngoc-hoi-dong-da/` chạy tại `khong-gian/engine/1.0.0/sa-ban.html?goi=ngoc-hoi-dong-da`, song song với bản cũ `khong-gian/ngoc-hoi-dong-da/`. Gói để sao chép khi làm trận mới: `packs/_mau/`. Việc tiếp theo: Giai đoạn 2 (mục 9). Từ nay không tạo sa bàn mới theo kiểu riêng lẻ.

## 1. Nguyên tắc
- **Bộ máy viết một lần, mỗi trận / di tích là một gói dữ liệu.** Không chép mã bộ máy vào từng sa bàn; mọi khác biệt giữa các trận nằm trong gói.
- Mọi chuỗi hiển thị bằng tiếng Việt, nằm trong gói, không nằm trong mã.
- Mọi sa bàn có nhãn "Tái dựng mô phỏng — cần đối chiếu tư liệu"; không bịa số liệu, ngày tháng (như `AGENTS.md`).
- three.js tự chứa trong bộ máy (0.160), **không tải từ CDN ngoài** (jsdelivr, unpkg).
- Toạ độ lưu theo Blender; bộ máy đổi `B(x,y,z) → (x, z, −y)`.

## 2. Cấu trúc thư mục
```
vietsu/static/khong-gian/
  engine/1.0.0/
    sa-ban.html          trang xem chung: sa-ban.html?goi=<id-goi>
    sa-ban.js            bộ máy (export SaBan, VERSION)
    khung.js             khung giao diện (chữ riêng của trận lấy từ pack.json)
    sa-ban.css           giao diện
    vendor/three/        three.js 0.160 + OrbitControls, GLTFLoader, BufferGeometryUtils, meshopt decoder 1.3 (không cần importmap)
  catalog.json           danh sách gói đang phát hành (website + app đọc từ đây)
  packs/
    _mau/                gói mẫu để sao chép khi bắt đầu trận mới (có README)
    <id-goi>/
      pack.json          khai báo gói (mục 3)
      terrain/           dia-hinh.json (meta, sông, đường, mốc, làng, vật thể), h_*.png cao độ 16 bit, tex_*.jpg ảnh bề mặt
      units/             nhân vật nướng sẵn .nvz + ảnh màu .jpg; nhân vật chính .glb (meshopt)
      props/             cờ từng phe, vật dụng .glb (meshopt)
      placement.json     nhóm quân: loại, vị trí, đường đi, động tác theo cảnh
      story.json         kịch bản (battle) hoặc tour.json (site)
      audio/             voice.mp3 (lời dẫn), âm nền
      sources.json       nguồn tư liệu, giấy phép dữ liệu, mức độ phục dựng
      thumb.webp
```
`<id-goi>`: chữ thường không dấu, gạch nối, có năm nếu cần phân biệt (`bach-dang-938`, `bach-dang-1288`).

## 3. Định dạng gói
Gói tham chiếu đầy đủ: `packs/ngoc-hoi-dong-da/pack.json`. Gói trống để sao chép: `packs/_mau/`.

`pack.json` — các nhóm trường (bộ máy 1.0):
- **Định danh:** `id`, `version` (semver), `engine` (dải phiên bản, `^1.0`), `kind` (`battle` | `site`), `title`, `subtitle`, `period` (mã triều đại trong Việt Sử), `year`, `label` ("Tái dựng mô phỏng…"), `storyLabel`, `coords`.
- **Địa hình:** `terrain` (`data`, `height`, `image`, mảnh chi tiết `patchHeight`/`patchImage`, `riverExtend` sông kéo ra ngoài khung, `farMountains` núi xa làm phông).
- **Vật thể:** `props` (`instances` = nhà, cây, lều… đặt hàng loạt từ `dia-hinh.json › inst` bằng mẫu dựng sẵn của bộ máy; `outerCamps` trại ngoài khung; `pontoonBridge` cầu phao; `campFlags` cờ doanh trại theo cảnh; `crossMarks` dấu X đồn đã mất; `raiseCannons`), `frames` (khung toạ độ cục bộ của một đồn: `c0`, `eu`, `ev`).
- **Nhãn, góc nhìn, giao diện:** `labels` (tên mốc, mốc lớn, tên sông), `views` (góc nhìn có tên: `label`, `target` hoặc `X`/`Y`, `dist`, `az`, `el`, `off`), `ui` (tên lớp, chú giải, mốc so sánh mặc định, độ cao mũi tên).
- **Quân:** `sides` (phe: `id`, `name`, `flag`), `units` (mỗi loại: `file` .nvz hoặc `glb`, `image`, **`side` bắt buộc**, `dense`, `alias` động tác, `tint` màu áo, `rider`), `heroes` (nhân vật chính .glb, vị trí theo cảnh trong `placement.json`), `placement`, `groupFrames`.
- **Tương tác:** `roles` (vai đi bộ trong chế độ Khám phá), `pov` (`places` đứng xem, `people` nhìn qua mắt nhân vật).
- **Hiệu ứng, âm thanh:** `fx` (`cannons`, `shieldFire`, `campFire`), `audio` (`voice`, `beds`, `layers`, `march`, `plan` mức âm nền theo cảnh, `cues`, `repeats`).
- **Kỹ thuật:** `quality` (`maxPixelRatio`, `mobilePixelRatio`, `unitDrawDist`, `mobileUnitDrawDist`), `budget` (`firstLoadMB`), `sources`.

Mốc thời gian trong `fx`, `campFlags`, `crossMarks`, `units.*.rider.aim` viết dạng **chỉ số cảnh + tiến độ** (8.2 = cảnh thứ 9, đã chạy 20%).

`story.json` (battle) — định dạng 1.0 là định dạng của dòng Ngọc Hồi / Bạch Đằng / Như Nguyệt / Rạch Gầm:
- `scenes[]`: `id`, `title`, `place`, `date`, `dur` (giây theo voice), `dur_cu` + `ban_do` (nắn dòng thời gian dựng cảnh theo voice), `vo` (lời bình), `subs` (phụ đề `[t0, t1, chữ]`), `state` (bộ mũi tên đang hiện), `night` / `night_end` / `nights` (độ tối), `troi`, `keys[]` (góc máy: `t`, `at` mốc hoặc `ll`, `off`, `d`, `az`, `el`, `h`, `cut`), `outside`.
- `arrows` (mũi tên theo kinh – vĩ độ: `pts`, `c`, `w`), `states` (tên bộ → danh sách mũi tên), `legend`, `refs`.
- Các trường của Điện Biên Phủ (`shots`, `follow`, `hist`) sẽ thêm vào bộ máy 1.x khi chuyển gói đó (thêm trường mới không phá gói cũ).

`placement.json`: `groups[]` (mỗi nhóm: `id`, `kind`, `mode` `fixed` | `path`, `m` thành viên, `sc` động tác theo cảnh, các tuỳ chọn `vk` binh khí, `co` người cầm cờ, `ten` tên tướng, `toa`/`tan`/`rai`/`loan`/`nga` cách tản, chạy, ngã, `buc`, `tren`, `cau`, `cat`, `linh`), cộng vị trí nhân vật chính theo cảnh và `catcau` (cầu bị chặt).

Nhân vật nướng sẵn `.nvz` (`tools/sa_ban/nv_sang_nvz.py`): gzip của đầu JSON + khối nhị phân; vị trí đỉnh lượng tử 1 mm, lưu hiệu số giữa hai khung; pháp tuyến mã bát diện 2 byte. Nhỏ hơn khoảng 2 lần so với `nv_*.json` cũ (đã gzip), sai số vị trí ≤ 0,5 mm. Nhân vật có khung xương (nhân vật chính) dùng `.glb` nén meshopt.

`tour.json` (site): `stops[]` (`id`, `title`, `view`, `vo`, `voice`, `images`, `layer: "hien-trang" | "phuc-dung"`) — làm khi có gói di tích đầu tiên.

`sources.json`: `reconstruction` (mức độ phục dựng) và `sources[]`: `title`, `type` (sử liệu, chuyên khảo, bản đồ, OSM, DEM, ảnh quét…), `url` hoặc trang PDF, `license`, `used_for`. Dữ liệu OSM ghi "© OpenStreetMap contributors (ODbL)".

## 4. Bộ máy (engine) — mô-đun và API
Bộ máy 1.0.0 tách từ sa bàn Ngọc Hồi – Đống Đa V10 bằng `tools/sa_ban/tach_bo_may.py` (ghi lại từng chỗ sửa). Các phần trong `sa-ban.js`: tải gói; địa hình, nước, nền chân trời, núi xa; vật thể đặt hàng loạt; nhãn, mốc, bản đồ nhỏ; ghi chú review; trời, ngày đêm; mũi tên; phim tự động (máy quay theo `keys`, phụ đề, voice làm đồng hồ); khám phá, đi bộ; so sánh hai mốc; nhân vật (tải `.nvz` dần theo cảnh), binh khí, cờ theo phe; góc nhìn nhân vật; hiệu ứng; âm nền theo cảnh. Từ 1.1 sẽ tách thành tệp mô-đun riêng (`core/`, `story/`, `fx/`…) — không đổi định dạng gói. Phần của Quảng Trị (follow, units GLB có xương) và Điện Biên Phủ (director, shots, hist) gộp vào ở Giai đoạn 3.

Trang một sa bàn:
```html
<div id="sa-ban"></div>
<script type="module">
  import { SaBan } from '../engine/1.0.0/sa-ban.js';
  const sb = await SaBan.mount('#sa-ban', { pack: '../packs/ngoc-hoi-dong-da/' });
</script>
```
Hoặc mở thẳng trang chung: `engine/1.0.0/sa-ban.html?goi=ngoc-hoi-dong-da` (thêm `&chatluong=thap|cao` để ép mức chất lượng; điện thoại mặc định `thap`).

API (đối tượng trả về từ `mount`): `play()`, `pause()`, `seek(giây)`, `goto(cảnh, giây)`, `view(tên)`, `mode('film'|'explore'|'pov'|'compare')`, `layer(id, bật)`, `quality({pixelRatio})`, `on('ready'|'scene', hàm)`, `stats()` (fps, draw call, tam giác, số loại quân đã tải, cảnh, giây). Gói khai báo `engine: "^1.0"`; bộ máy từ chối gói của số chính khác. Thay đổi phá vỡ định dạng gói → tăng số chính (2.0).

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
6. **Kiểm tra và duyệt** — `python3 vietsu/tools/sa_ban/kiem_tra_goi.py <id-goi>` kiểm định dạng, tệp thiếu, quy tắc phe và đo tải lần đầu; chạy thử máy tính + một Android phổ thông; nhánh `claude/<id-goi>` → Pull Request → chủ dự án duyệt. Thêm gói vào `catalog.json` trong cùng PR.

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

1. **Giai đoạn 1 — xong (23/11/2026), chờ duyệt.** Bộ máy 1.0.0 tách từ Ngọc Hồi V10; gói `ngoc-hoi-dong-da`; `packs/_mau/`; công cụ `tools/sa_ban/` (`nv_sang_nvz.py`, `chuyen_ngoc_hoi.py`, `tach_bo_may.py`, `kiem_tra_goi.py`). Kết quả đo: hình ảnh từng cảnh trùng bản cũ (so ảnh chụp C09, C10, C13: lệch trung bình < 1,5 %, chỉ khác khói, pha động tác); **tải lần đầu 11,9 MB** (bản cũ ~29 MB); toàn gói 16,7 MB + âm thanh 9,4 MB. Nhân vật dùng `.nvz` thay vì GLB vì là hoạt hình nướng sẵn theo khung (GLB chỉ hợp với nhân vật có xương). **Chưa đo được fps trên Android thật** — cần anh mở trên điện thoại và đọc số fps góc dưới trái; điện thoại đã tự giảm chất lượng (`chatluong=thap`).
2. **Giai đoạn 2** — ba gói cùng dòng: **Bạch Đằng 938** (`bach-dang-938`), **Như Nguyệt 1077** (`nhu-nguyet-1077`), Rạch Gầm – Xoài Mút. Dùng chung thư viện: dân binh, lính Nam Hán, thuyền Tây Sơn, ngựa, âm thanh nền.
3. **Giai đoạn 3** — Quảng Trị, Điện Biên Phủ.
4. **Giai đoạn 4** — `catalog.json`, R2 + CDN, website đọc catalog. (`kiem_tra_goi.py` đã có từ Giai đoạn 1.) (Có thể làm `catalog.json` sớm cùng Giai đoạn 2 để Bạch Đằng, Như Nguyệt hiện trên Việt Sử ngay.)
5. Sau đó mỗi trận mới là một gói theo quy trình mục 6.

Các sa bàn cũ chạy song song tới khi bản theo khung được duyệt.

### Nguồn của hai sa bàn đang nằm ngoài repo
| Sa bàn | Bản đang chạy (đủ tệp) | Mã nguồn, script dựng | Ghi chú dung lượng |
|---|---|---|---|
| Bạch Đằng 938 V4 / V1.2 | Artifact slug `440c9fcf-5cee-4e56-8fa1-2cd73fe5c1a1` | Máy anh Thắng: `Hoc-lich-su/SabanBachDang/web_v2/` (`_nguon/`: build_geo, build_inst, build_story, bake_bd) | Nhân vật JSON ~26 MB, nhạc 11 MB |
| Như Nguyệt 1077 V1.6 | Artifact slug `3b92f7b7-e318-4ede-a7c0-8f0ff3c3ab7f` | Script dựng (build_geo, build_story, bake_nn, bake_ngua2, nhac) ở phiên Claude cũ, **chưa chép về máy** — lấy lại từ artifact và Project › `sa-ban-nhu-nguyet-1077-v1.md` | Nhân vật JSON ~64 MB (quan-ly 14,6 MB, dan-binh 13 MB) |

Ghi chép chi tiết từng sa bàn (quy ước, bài học nướng động tác, quy tắc phe): Project "Dự án làm sa bàn" › `sa-ban-bach-dang-938-v1.md`, `sa-ban-nhu-nguyet-1077-v1.md`. Các quy tắc chung trong đó (một bảng phe duy nhất, không để phe này mang cờ phe kia; chỉ quân chính quy giao chiến; chuyển động tác Mixamo theo xoay thế giới) **áp dụng cho mọi gói**.

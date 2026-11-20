# KỊCH BẢN & ĐẶC TẢ TRIỂN KHAI SA BÀN 3D ĐIỆN BIÊN PHỦ 1954 — V1.0

**Mục đích:** Tài liệu bàn giao trực tiếp cho Claude Code để phát triển sa bàn lịch sử 3D tương tác Điện Biên Phủ 1954, theo tinh thần dự án sa bàn Thành Cổ: **một địa hình gốc, nhiều trạng thái lịch sử, có chế độ phim tự động và tự do khám phá**.

**Trạng thái:** Đề xuất sản xuất, **không phải bản đồ hoặc hồ sơ sử học đã thẩm định**. Không tự phát minh tọa độ, thời điểm đổi chủ các vị trí, đơn vị chiến đấu hay mô hình quân phục.

**Bản V1 gồm:** 10 cảnh, tổng ~16 phút 40 giây; một bản đồ gốc; bộ điều khiển timeline; dữ liệu cảnh tách khỏi logic; đầu ra có thể mở trong Blender và web 3D.

---

## 0. LỆNH KHỞI ĐỘNG DÀNH CHO CLAUDE CODE

> Hãy đọc hết file này và kiểm tra repository hiện có trước khi viết mã. Nếu trong repository đã có engine sa bàn Thành Cổ, **tái sử dụng cấu trúc, camera controller, timeline, scene manager, asset loader và UI** của hệ thống đó; không viết lại chỉ vì muốn thay công nghệ. Nếu không có repository Thành Cổ, dựng nguyên mẫu mới theo đặc tả ở dưới. **Không giả định rằng file/asset lịch sử chưa tìm thấy là đã có.** Lập bảng đối chiếu hạng mục `FOUND / MISSING / NEEDS_HISTORICAL_REVIEW` trước. Tạo dữ liệu mẫu rõ nhãn `ILLUSTRATIVE` khi thiếu tư liệu, không gán là tái hiện chính xác lịch sử. Triển khai theo thứ tự: bản đồ nền → cảnh 01/02/05 → timeline và hotspot → các cảnh còn lại → tối ưu và nghiệm thu. Mỗi giai đoạn phải chạy được và có cách kiểm thử.

## 1. PHẠM VI VÀ TRIẾT LÝ THỂ HIỆN

1. **Sa bàn là trọng tâm:** góc birdview/high-oblique, có thể zoom xuống chiến hào, căn cứ, sân bay; không biến thành trò chơi bắn súng.
2. **Địa hình duy nhất:** mô hình lòng chảo Điện Biên, núi bao quanh, sông Nậm Rốm, đường, bản làng, sân bay, phân khu Bắc–Trung tâm–Nam. Thay đổi theo thời gian bằng layer và event chứ không nạp 10 sa bàn không liên quan.
3. **Nhiều cấp độ thông tin:** (a) tổng quan chiến dịch, (b) từng phân khu, (c) từng cứ điểm/hầm/hào.
4. **Chính xác có kiểm chứng:** không đặt nhầm sông, đường băng, A1, C1, D1, Him Lam, Độc Lập, Bản Kéo, Hồng Cúm. Chỉ công bố vị trí sau khi đối chiếu bản đồ lịch sử.
5. **Trải nghiệm:** `AUTO_FILM` (tự phát 10 cảnh), `EXPLORE` (khám phá), `COMPARE` (so sánh hai thời điểm).
6. **Tách lớp lịch sử:** những thay đổi trên mô hình theo ngày/giờ được lưu thành sự kiện, không hard-code trong camera hay shader.

## 2. TƯ LIỆU ĐẦU VÀO CỦA DỰ ÁN

Các hình người dùng gửi trong hội thoại, cần tập hợp vào thư mục `references/` khi có quyền truy cập file gốc:

| Nhóm | Tệp/ảnh tham chiếu | Mục đích | Lưu ý |
|---|---|---|---|
| Sa bàn cận cảnh | `Chien-Truong-Dien-Bi-01.jpg`, `-02.jpg`, `-03.jpg`, `-06.jpg`, `-07.jpg`, `Chien-Truong-Dien-Bi.jpg`, `cu-diem-dbp.jpg` | Hầm, hào, hàng rào, pháo, xe, lều, đất và texture | Ảnh sa bàn hiện đại, không thay thế chứng cứ địa lý |
| Tổng mặt bằng minh họa | `Chien-Truong-Dien-Bi-04.jpg`, `ban-do-2.png` | Xác định nhóm phân khu, tên điểm cần đối chiếu | Hình minh họa, không dùng tọa độ pixel như tọa độ lịch sử |
| Không ảnh tham khảo | `topview-dienbienphu.jpg` | Bối cảnh thung lũng trước chiến dịch | Cần hiệu chỉnh địa lý và thời gian |
| Ảnh đổ quân dù | `nhay-du-dien-bien-phu.jpg` và ảnh đi kèm | Không khí Chiến dịch Castor (20–22/11/1953) | Kiểm tra bản quyền trước khi đưa vào ứng dụng |
| Địa hình và dân cư | `nha-san-dien-bien-phu-1.jpg`, `nha-san-dien-bien-phu.jpg`, `nha-o-dien-bien-phu.jpg` | Nhà sàn, ruộng, thảm thực vật, tỷ lệ | Các ảnh không đủ để suy ra toàn bộ địa hình |
| Nhân vật | Ảnh Đại tướng Võ Nguyên Giáp đã gửi trong hội thoại | Tham chiếu nhân vật ở cảnh Sở Chỉ huy | Ảnh màu/ảnh phục dựng có thể không phản ánh đúng phục trang năm 1954 |

**Chưa có trong bộ tư liệu đã cung cấp:** DEM/tọa độ chuẩn và ranh giới từng cứ điểm; sơ đồ hệ thống đường hào theo từng mốc ngày; dữ liệu mô hình 3D chính xác; hồ sơ âm thanh/lồng tiếng. Các nguồn thiếu phải được đánh dấu `NEEDS_SOURCE`.

## 3. ĐỊNH HƯỚNG MỸ THUẬT & BỐ CỤC

- **Phong cách:** sa bàn bảo tàng chất lượng cao, địa hình điêu khắc thật, đất nâu/xám, chiến hào màu đất, cây xanh tiết chế, vật liệu vải bạt/bao cát/gỗ/kim loại cũ; không hiện đại hóa công trình 1954.
- **Camera chủ đạo:** trực giao hoặc phối cảnh tiêu cự dài ở high-oblique, góc birdview, cho phép hạ thấp ở cảnh cận; hạn chế góc làm đảo lộn phương hướng.
- **Lớp bản đồ:** đường đồng mức, tên cứ điểm, nhãn phân khu và trục Bắc; có công tắc bật/tắt.
- **Hiệu ứng:** đèn định vị sự kiện, đường tiến công, phạm vi kiểm soát, bụi/khói, ánh chớp pháo, độ mờ sương; dùng tiết chế, không biến sa bàn thành bản đồ game neon.
- **Trạng thái:** `neutral`, `french`, `contested`, `viet_minh`, `historical_unknown`. Màu sắc cần có chú giải và khả năng thay đổi.
- **Tránh:** xe/khí tài không đúng thời kỳ, số lượng binh lực tùy tiện, hầm chiến đấu trang trí ngẫu nhiên, quân hàm thời kỳ sau gán cho năm 1954.

## 4. PHÂN KHU VÀ HOTSPOT

| ID | Khu/điểm | Vai trò trên giao diện | Ghi chú xác thực |
|---|---|---|---|
| `NORTH` | Phân khu Bắc | Tổng quan các vị trí phòng ngự Bắc | Dựng ranh giới theo tài liệu đối chiếu |
| `HIM_LAM` | Him Lam / Béatrice | Điểm nóng đợt 1 | Xác minh contour, công sự |
| `DOC_LAP` | Độc Lập / Gabrielle | Điểm nóng đợt 1 | Xác minh contour, công sự |
| `BAN_KEO` | Bản Kéo / Anne-Marie | Điểm nóng đợt 1 | Xác minh cách đánh dấu chuyển trạng thái |
| `CENTER` | Phân khu Trung tâm | Hệ cứ điểm Mường Thanh | Phân nhóm A, C, D, E theo hồ sơ |
| `AIRFIELD` | Sân bay Mường Thanh | Đường băng, tiếp tế, bị khống chế | Đặt theo không ảnh/địa hình chuẩn |
| `A1` | Đồi A1 / Éliane 2 | Trận đánh kéo dài, bộc phá | Cần tư liệu riêng về hầm ngầm |
| `C1` | Đồi C1 / Éliane 1 | Giằng co đợt 2 | Cần timeline sở hữu nhiều bước |
| `D1` | Đồi D1 / Dominique 2 | Trận đánh đợt 2 | Cần đối chiếu chính xác tên đối ứng |
| `E1` | Đồi E1 / Dominique 1 | Trận đánh đợt 2 | Cần đối chiếu chính xác tên đối ứng |
| `HQ_DE_CASTRIES` | Sở chỉ huy Đờ Cát | Cao trào ngày 7/5 | Không tự đặt kiến trúc/hướng nếu chưa có tư liệu |
| `SOUTH` | Hồng Cúm / Isabelle | Phân khu Nam | Thể hiện tách biệt và diễn biến cuối chiến dịch |
| `NAM_ROM` | Sông Nậm Rốm | Mốc địa hình xuyên suốt | Không dựng theo hình AI suy đoán |
| `VIET_MINH_HQ` | Sở Chỉ huy chiến dịch | Cảnh 03 | Là bối cảnh riêng ngoài khung sa bàn trung tâm nếu cần |

**Tọa độ:** Để `null` cho tới khi người phụ trách tư liệu bàn giao file địa lý được xác minh. Không bịa tọa độ `x/z` chỉ để làm đẹp.

## 5. KỊCH BẢN 10 CẢNH — STORYBOARD & HÀNH VI

**Quy ước:** `T` = thời lượng đề xuất, có thể tinh chỉnh cùng voiceover; mọi mốc ngày/giờ chi tiết cần xác thực trong bảng sự kiện; hoạt cảnh không thể hiện điều chưa xác minh như sự kiện thực.

### C01 — LÒNG CHẢO TRƯỚC CHIẾN DỊCH (T 01:30)
- **Bối cảnh:** trước 20/11/1953.
- **Hình ảnh:** máy quay bay qua núi rừng Tây Bắc rồi hạ xuống lòng chảo, sông Nậm Rốm, đường mòn, ruộng đồng và các nhà sàn; nhẹ nhàng hiện hình ảnh không ảnh 16/11/1953 bên cạnh/overlay khi được cấp phép.
- **Camera:** `overview_north` → `valley_wide` → `muong_thanh_plain`.
- **Layer:** terrain, vegetation, villages, river, roads; **ẩn** fortifications tương lai.
- **UI:** chú giải Bắc/Nam, phạm vi lòng chảo và một mốc `TRƯỚC CHIẾN DỊCH`.
- **Lời bình gợi ý:** “Giữa núi rừng Tây Bắc, thung lũng Điện Biên chuẩn bị trở thành tâm điểm của một cuộc quyết chiến lịch sử.”
- **Nghiệm thu:** địa hình nhận biết được và hướng Bắc nhất quán.

### C02 — CUỘC ĐỔ QUÂN & XÂY DỰNG TẬP ĐOÀN CỨ ĐIỂM (T 01:30)
- **Mốc:** Chiến dịch Castor khởi đầu 20/11/1953; giai đoạn xây dựng phòng thủ kéo dài sau đó.
- **Hình ảnh:** máy bay vận tải bay trên thung lũng, các dù xuất hiện; chuyển cảnh thời gian với sân bay, công sự, lô cốt, hào, hàng rào dần được dựng. Làm nổi ba phân khu.
- **Camera:** `castor_sky` → `airfield` → `three_sectors_overview`.
- **Layer:** aircraft, parachutes, airfield, fortifications, camps, label hotspots.
- **Lời bình:** “Từ cuộc đổ quân đường không, quân Pháp củng cố Điện Biên Phủ thành một hệ thống phòng ngự gồm nhiều cứ điểm liên hoàn.”
- **Cảnh báo:** không xem hình ảnh lính dù là quân số thực trên sa bàn; chỉ mô phỏng tượng trưng.

### C03 — QUYẾT ĐỊNH CHUYỂN PHƯƠNG CHÂM TÁC CHIẾN (T 01:40)
- **Mốc:** giai đoạn chuẩn bị đầu năm 1954; ngày cụ thể đưa vào sau kiểm chứng.
- **Hình ảnh:** chuyển từ lòng chảo đến bối cảnh Sở Chỉ huy Việt Minh, bản đồ trải trên bàn, mô hình Đại tướng Võ Nguyên Giáp và cán bộ tham mưu (chưa chốt phục trang khi thiếu tư liệu); bản đồ chuyển từ “đánh nhanh, giải quyết nhanh” sang “đánh chắc, tiến chắc”.
- **Camera:** `hq_exterior` → `hq_map_table` → `map_closeup`.
- **Lời bình:** “Phương châm tác chiến được thay đổi: chuẩn bị kỹ hơn, bao vây và tiến công từng bước để bảo đảm thắng lợi.”
- **Nghiệm thu:** có thể render cảnh HQ riêng; không bắt buộc đặt HQ lên sa bàn lòng chảo.

### C04 — TRẬN ĐỊA PHÁO & VÒNG VÂY (T 01:30)
- **Bối cảnh:** giai đoạn chuẩn bị tiến công.
- **Hình ảnh:** đường vận chuyển, các vị trí pháo trên núi, tuyến hậu cần xuất hiện theo từng lớp; bộ đội kéo pháo trên đường núi; các đường hào tiến gần cứ điểm.
- **Camera:** `ridge_wide` → `artillery_position` → `encirclement_overhead`.
- **Layer:** supply_routes, artillery, troop_icons/character instances, trench_stages.
- **Lời bình:** “Hệ thống trận địa, đường vận tải và đường hào dần hình thành, biến việc bao vây thành một thế trận chặt chẽ.”
- **Nghiệm thu:** timeline điều khiển đường hào tăng trưởng theo nhiều giai đoạn, không chỉ bật/tắt.

### C05 — ĐỢT 1: CỬA NGÕ PHÍA BẮC (T 02:00)
- **Mốc:** 13–17/3/1954.
- **Điểm:** Him Lam → Độc Lập → Bản Kéo (theo mốc lịch sử xác minh).
- **Hình ảnh:** các vị trí Bắc nhấp sáng lần lượt; pháo kích mang tính tượng trưng; các hướng tiến công hiển thị, mỗi cứ điểm mở thẻ thông tin và đổi trạng thái theo event có nguồn. Trở về toàn cảnh vòng ngoài Bắc bị phá vỡ.
- **Camera:** `north_overview` → `him_lam_close` → `doc_lap_close` → `ban_keo_close` → `north_overview`.
- **Lời bình:** “Ngày 13 tháng 3, chiến dịch mở màn. Sau những trận đánh liên tiếp, tuyến phòng ngự vòng ngoài phía Bắc bị phá vỡ.”
- **Nghiệm thu:** cả ba điểm có trạng thái, ngày, lớp công sự và khả năng bật tắt hoạt cảnh độc lập.

### C06 — ĐỢT 2: TRANH ĐOẠT CÁC CAO ĐIỂM PHÍA ĐÔNG (T 02:00)
- **Mốc:** từ 30/3/1954, diễn biến kéo dài và phức tạp.
- **Điểm:** E1, D1, C1, C2, A1 và các vị trí phù hợp tài liệu thẩm định.
- **Hình ảnh:** camera dọc dãy đồi phía Đông; hiện đường phòng thủ, các mũi tiến công, trạng thái `contested`; C1/A1 có thể có nhiều lần đổi trạng thái, không gộp thành một sự kiện đơn giản.
- **Camera:** `east_ridge_wide` → `E1` → `D1` → `C1` → `A1`.
- **Lời bình:** “Trận đánh bước vào các cao điểm án ngữ phía Đông Mường Thanh, nơi chiến sự diễn ra quyết liệt và giằng co.”
- **Nghiệm thu:** hỗ trợ nhiều trạng thái trên cùng một cứ điểm ở các mốc khác nhau.

### C07 — ĐƯỜNG HÀO SIẾT CHẶT & SÂN BAY BỊ KHỐNG CHẾ (T 01:30)
- **Mốc:** xuyên suốt giai đoạn chiến dịch, cần chốt event theo nguồn.
- **Hình ảnh:** overhead cho thấy hệ thống hào vươn sâu vào lòng chảo, gần đường băng; hoạt động tiếp tế đường không giảm, vùng kiểm soát thu hẹp. Không được tự vẽ một thời điểm đóng sân bay khi chưa kiểm chứng.
- **Camera:** `trench_topdown` → `airfield_tracking` → `center_encirclement`.
- **Layer:** trenches, air_supply, airfield, supply_pressure_overlay.
- **Lời bình:** “Các đường hào tiến sát hệ thống phòng ngự, không gian phòng thủ thu hẹp và việc tiếp tế đường không ngày càng khó khăn.”
- **Nghiệm thu:** thanh thời gian so sánh được hai giai đoạn và sự thay đổi hệ thống hào.

### C08 — ĐỒI A1: GIAI ĐOẠN QUYẾT ĐỊNH (T 02:00)
- **Mốc:** đêm 6/5 rạng sáng 7/5/1954.
- **Hình ảnh:** zoom A1; cắt lớp địa hình và đường ngầm có nhãn **minh họa**, chưa biểu diễn chính xác hình học khi thiếu bản vẽ; mô phỏng vụ nổ khối bộc phá khoảng một tấn, sau đó diễn biến kiểm soát cao điểm theo nguồn thẩm định.
- **Camera:** `A1_wide` → `A1_cutaway` → `A1_topdown`.
- **Lời bình:** “Sau cuộc chiến kéo dài, đồi A1 bước vào giai đoạn quyết định, góp phần mở đường cho đợt tổng tiến công cuối cùng.”
- **Nghiệm thu:** cutaway bật/tắt được; hiệu ứng nổ không phá hủy mesh gốc vĩnh viễn và có thể tua lại.

### C09 — CHIỀU 7/5: TRUNG TÂM MƯỜNG THANH THẤT THỦ (T 01:40)
- **Mốc:** chiều 7/5/1954; mốc 17:30 thường được dùng cho việc đánh chiếm Sở Chỉ huy, cần xác minh theo nguồn chính thức mà dự án chọn.
- **Hình ảnh:** camera bao quát các hướng tiến công vào Mường Thanh, tiếp cận hầm Sở chỉ huy Đờ Cát; sa bàn giảm dần hiệu ứng giao tranh, trạng thái cứ điểm trung tâm cập nhật; cờ chiến thắng xuất hiện trong phân cảnh kết thúc.
- **Camera:** `center_wide` → `hq_de_castries` → `victory_rise`.
- **Lời bình:** “Chiều ngày 7 tháng 5 năm 1954, sở chỉ huy quân Pháp tại Điện Biên Phủ bị đánh chiếm. Tập đoàn cứ điểm đi đến thất bại.”
- **Nghiệm thu:** sự kiện diễn ra đúng thứ tự; cờ, người, công trình đều có thể ẩn khi quay lại giai đoạn trước.

### C10 — TOÀN CẢNH CHIẾN THẮNG VÀ DI SẢN (T 01:20)
- **Mốc:** 7/5/1954, kết nối bối cảnh lịch sử sau chiến dịch.
- **Hình ảnh:** camera bay lên birdview; tua lại ba đợt tiến công trên toàn chiến trường; bản đồ phủ chú giải; kết bằng mốc chiến thắng và liên hệ Hiệp định Genève 1954 (không tự thêm các số liệu chưa kiểm chứng).
- **Camera:** `victory_rise` → `grand_overview` → `end_title`.
- **Lời bình:** “Chiến thắng Điện Biên Phủ trở thành bước ngoặt quan trọng, góp phần kết thúc cuộc kháng chiến chống thực dân Pháp và mở ra một giai đoạn lịch sử mới.”
- **Nghiệm thu:** kết thúc có thể reset để chiếu lại từ cảnh 01 mà không reload trang.

## 6. CẤU TRÚC DỮ LIỆU: BẮT BUỘC DATA-DRIVEN

**Các thực thể:**

- `TerrainTile`: `id`, `meshUrl`, `lod`, `bounds`, `sourceId`, `confidence`.
- `Place`: `id`, `viName`, `frName`, `sector`, `coordinates | null`, `geoSourceId`, `confidence`, `hotspot`.
- `HistoricalEvent`: `id`, `dateStart`, `dateEnd`, `placeIds`, `type`, `newState`, `narrative`, `sourceIds`, `reviewStatus`.
- `Scene`: `id`, `title`, `durationSec`, `cameraShots[]`, `actions[]`, `voiceover`, `events[]`.
- `Asset`: `id`, `category`, `uri`, `license`, `sourceIds`, `accuracy`, `lods`.
- `CameraShot`: `id`, `targetPlace`, `preset`, `durationSec`, `easing`, `lookAt`, `collisionSafe`.

**Ví dụ dữ liệu (minh họa cấu trúc, không phải tọa độ lịch sử):**

```json
{
  "places": [
    {
      "id": "HIM_LAM",
      "viName": "Him Lam",
      "frName": "Béatrice",
      "sector": "NORTH",
      "coordinates": null,
      "geoSourceId": null,
      "confidence": "UNVERIFIED",
      "hotspot": true
    }
  ],
  "scenes": [
    {
      "id": "C05",
      "title": "Đợt 1: Cửa ngõ phía Bắc",
      "durationSec": 120,
      "cameraShots": ["north_overview", "him_lam_close", "doc_lap_close", "ban_keo_close"],
      "actions": ["show_attack_routes", "highlight_strongpoints"],
      "events": ["EV_C05_HIM_LAM", "EV_C05_DOC_LAP", "EV_C05_BAN_KEO"]
    }
  ]
}
```

### Quy tắc thời gian

- Thời gian lịch sử: ISO date/time với cờ `precision`: `DATE`, `HOUR`, `APPROXIMATE`, `UNKNOWN`.
- Thời gian phát phim: `playbackMs`; không đồng nhất 1 giây phim = 1 giờ lịch sử.
- Seek qua lại phải **idempotent**: cùng thời điểm lịch sử → cùng trạng thái bất kể phát tiến hay lùi.
- Không dùng hiệu ứng nổ để thay đổi mesh cố định; dùng trạng thái và animation tách biệt.
- Bất kỳ sự kiện chưa được xác minh phải mang `reviewStatus: NEEDS_HISTORICAL_REVIEW` và bị ẩn khỏi chế độ phát hành chuẩn nếu mang khẳng định cụ thể.

## 7. KIẾN TRÚC KỸ THUẬT ĐỀ NGHỊ

Nếu repository Thành Cổ có sẵn, giữ nguyên stack tương thích. Nếu bắt đầu mới:

- **Nguồn mô hình:** Blender với hệ tọa độ thống nhất, export `glTF/GLB`; asset nguồn `.blend` để riêng theo nhóm.
- **Web:** React + TypeScript; Three.js hoặc React Three Fiber; Zustand hoặc state manager đã có; animation bằng timeline có `seek()`.
- **Dữ liệu:** JSON/TypeScript schema (Zod hoặc JSON Schema), tách `places`, `events`, `scenes`, `assets`, `sources`.
- **Tài sản:** hỗ trợ Draco/Meshopt tùy pipeline, texture KTX2 nếu cần; LOD/instancing cho cây, lều, lính, bao cát, hàng rào.
- **UI:** chọn chế độ, play/pause, thanh timeline, danh sách cảnh, thanh tốc độ, bật/tắt layer, bật/tắt nhãn, nhấp hotspot, so sánh trước/sau, nút đặt lại góc camera.
- **Âm thanh:** music/ambience/SFX/voice riêng channel; cue theo thời gian cảnh, có mute riêng; không có âm thanh mặc định khi chưa có quyền sử dụng.
- **Lưu trữ:** dùng local hoặc máy chủ nội bộ GOKU trước; không bắt buộc hạ tầng thuê ngoài.

### Cấu trúc thư mục gợi ý

```text
dien-bien-phu-1954/
  docs/
    KICH_BAN_V1.md
    historical-review.md
    asset-register.csv
  references/               # người triển khai tự nạp, không đưa ảnh có bản quyền lên repo công khai
  blender/
    terrain_master.blend
    strongpoints/
    props/
    characters/
  public/assets/
    terrain/
    fortifications/
    units/
    environment/
    audio/
  src/
    data/
      places.json
      events.json
      scenes.json
      sources.json
    engine/
      SceneDirector.ts
      HistoricalTimeline.ts
      CameraDirector.ts
      LayerManager.ts
      AssetRegistry.ts
    components/
      DioramaCanvas.tsx
      Timeline.tsx
      SceneList.tsx
      HotspotPanel.tsx
      LayerControls.tsx
      ComparisonSlider.tsx
  tests/
```

## 8. ASSET REGISTER — TẠO MÔ HÌNH THEO NHÓM

| Ưu tiên | Nhóm | Mô hình | Cách làm |
|---|---|---|---|
| P0 | Địa hình | lòng chảo, đồi, sông, ruộng, đường | Dựng từ DEM/bản đồ xác minh; không suy đoán từ ảnh AI |
| P0 | Cứ điểm | hầm đất, mái vòm, chiến hào, bao cát, dây thép gai | Modular assets + curve/geometry nodes |
| P0 | Sân bay | đường băng, nhà kho, đường nội bộ | Cần đối chiếu mốc lịch sử |
| P0 | Điều khiển | camera presets, timeline, nhãn/hotspot | Nên làm trước khi đủ toàn bộ asset |
| P1 | Pháo/xe | pháo, xe tải, phương tiện, lều | Chỉ dùng mẫu có đối chiếu niên đại |
| P1 | Không quân | máy bay vận tải, dù, máy bay trên sân bay | Animation tuyến đường bay biểu tượng |
| P1 | Con người | bộ đội, lính Pháp, dân công, nhân vật chỉ huy | Đúng phục trang 1954; tối ưu instancing |
| P1 | Địa vật | nhà sàn, bản làng, cây, bụi, ruộng | Dựa theo ảnh lịch sử đã gửi |
| P2 | Chuyên sâu | A1 cutaway, đường ngầm, HQ riêng | Chỉ làm sau khi có tư liệu xác thực |

**AI image-to-3D:** Có thể dùng RTX 5090 để tạo base mesh cho từng đạo cụ/nhân vật. Không dùng image-to-3D để tạo **toàn bộ bản đồ chiến trường** từ một ảnh minh họa, vì dễ làm sai tỷ lệ và topology.

## 9. ROADMAP GIAO VIỆC CHO CLAUDE CODE

### Giai đoạn 0 — Kiểm tra hiện trạng
- Kiểm tra repo Thành Cổ, stack hiện tại, license và asset hiện hữu.
- Tạo báo cáo `FOUND/MISSING/NEEDS_REVIEW` + danh sách các nguồn người dùng cần bổ sung.
- Không chạm đến dữ liệu gốc/branch chính trước khi có backup.

### Giai đoạn 1 — Khung chạy được
- Web viewer với sa bàn placeholder rõ nhãn `ILLUSTRATIVE`.
- Orbit/zoom camera, layer toggles, hotspot, timeline giả lập, load GLB.
- Tạo schema JSON và test seek.

### Giai đoạn 2 — Cảnh mẫu có thể trình diễn
- Hoàn thành C01, C02 và C05.
- Có 3 camera sequences, một chuyển trạng thái theo mốc lịch sử, một sự kiện nhấn hotspot.
- Có chế độ full-screen, tạm dừng, tua tiến/lùi, chọn cảnh.

### Giai đoạn 3 — Tích hợp 10 cảnh
- Hoàn thành C03–C04 và C06–C10 theo dữ liệu thẩm định.
- Tích hợp voiceover, hiệu ứng, captions; `AUTO_FILM` và `EXPLORE`.

### Giai đoạn 4 — Tối ưu và kiểm thử
- Tối ưu LOD, instancing, streaming, texture, thời gian tải.
- Kiểm tra tính nhất quán địa hình khi chuyển cảnh và khi tua timeline.
- Sử dụng máy RTX 5090 để tạo asset; cấu hình trình diễn mục tiêu dựa trên máy người xem, không mặc định máy khách có RTX 5090.

## 10. TIÊU CHÍ NGHIỆM THU (DEFINITION OF DONE)

1. Một master terrain, mọi cảnh dùng cùng hệ tọa độ; không nhảy vị trí khi chuyển cảnh.
2. 10 cảnh có thể play/pause/skip/replay; không lỗi khi tua ngược bất kỳ thời điểm nào.
3. Ba chế độ `AUTO_FILM`, `EXPLORE`, `COMPARE` vận hành.
4. Nhấp hotspot mở thông tin gồm tên Việt/Pháp, phân khu, mốc lịch sử, hình/nguồn nếu có; chưa xác minh thì hiện thông báo thay vì tạo dữ kiện giả.
5. Hệ thống quản lý trạng thái từng cứ điểm bằng `events.json`, không nằm trong animation code.
6. Có tùy chọn ẩn/hiện chiến hào, pháo, xe, cây, nhãn, tuyến tấn công, khu vực kiểm soát.
7. Có log nguồn và mức độ chắc chắn cho dữ kiện quan trọng; danh sách `NEEDS_HISTORICAL_REVIEW` không rỗng khi chưa có đủ tư liệu.
8. Có ít nhất một file `.blend` nguồn, một `.glb` export, một hướng dẫn thay asset và tài liệu vận hành.
9. Giao diện tiếng Việt, có thể trình diễn kiosk hoặc màn hình lớn.
10. Mục tiêu hiệu năng, dung lượng tải và độ phân giải phải được đo trên thiết bị trình chiếu thực, không đoán trước.

## 11. CÁC CÂU HỎI CẦN KHÓA TRƯỚC KHI CHỐT PHỤC DỰNG

- Repo/source code chính xác của dự án Thành Cổ hiện nằm ở đâu? Các module nào tái sử dụng?
- Tài liệu nào là bản đồ gốc chuẩn để xác định vị trí và tỷ lệ địa hình?
- Mỗi mốc ngày/giờ đổi chủ các cứ điểm lấy theo bộ tài liệu lịch sử nào?
- Hình ảnh/ảnh tư liệu nào được phép dùng công khai? Ai kiểm bản quyền?
- Voiceover cuối cùng là bản nào? Thời lượng 10 cảnh có cần co giãn theo lời dẫn?
- Máy trình chiếu mục tiêu: RTX 5090 nội bộ, màn hình khách hay web công cộng?
- Dự án ưu tiên trải nghiệm web tương tác hay video render thuần, hoặc cả hai?

## 12. YÊU CẦU BÁO CÁO SAU MỖI GIAI ĐOẠN

Claude Code phải trả về: (1) danh sách file được tạo/sửa; (2) lệnh chạy và build; (3) ảnh/video demo hoặc mô tả test nếu không render được; (4) số lượng nguồn lịch sử đã đối chiếu, chưa đối chiếu; (5) lỗi còn tồn tại; (6) checklist nghiệm thu đạt/chưa đạt. Không được báo “hoàn thành” khi mới tạo UI mà chưa dựng/tải được sa bàn 3D thực.

---

**Ghi chú sử dụng:** Đây là **V1 để Claude triển khai bộ khung và thử nghiệm cảnh**. Khi người phụ trách tư liệu bàn giao bản đồ tọa độ/nguồn lịch sử đã xác minh, cập nhật `places.json` và `events.json` rồi mới đưa thông tin như vị trí chính xác, thời gian và mô phỏng chiến đấu vào bản phát hành công khai.

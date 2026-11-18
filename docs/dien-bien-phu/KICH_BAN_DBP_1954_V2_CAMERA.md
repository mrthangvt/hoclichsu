# ĐIỆN BIÊN PHỦ 1954 — KỊCH BẢN & CAMERA V2.0

> **Bàn giao cho Claude Code / Blender / Web 3D.** Phiên bản biên tập từ lời dẫn V2.0 trong cuộc trò chuyện, kế thừa 11 mã cảnh của file `Kich_ban_DBP_1954_ban_sua.xlsx`.

## 0. Phạm vi và nguyên tắc triển khai

- **Tổng 1005 giây = 16 phút 45 giây** theo bảng thời lượng đang cấu hình bên dưới. Đây là timeline dựng **đề xuất**, chưa đồng bộ giọng đọc thực tế. Nếu voice dài hơn, phải tăng thời lượng shot hoặc tách đoạn, tuyệt đối không tăng tốc voice một cách máy móc.
- **Không ghi đè sa bàn Thành cổ Quảng Trị hoặc giao diện Sử Việt**. Làm trong module Điện Biên Phủ riêng. Thêm camera/hoạt cảnh, chỉ dùng asset đã hiện hữu hoặc asset mới có giấy phép sử dụng.
- Tọa độ Blender `B(x,y,z)` sang three.js `(x,z,-y)` theo quy ước repo. Không tự bịa tọa độ camera; dùng `anchorId`, sau đó dò anchor có thật trong scene. Nếu chưa có: ghi `TODO_ASSET` và sử dụng camera fallback an toàn.
- `legacyShotId` và `legacyAnimationId` là **mã tham chiếu ở sheet Góc máy / Hoạt cảnh** của kịch bản gốc; không khẳng định các đối tượng đã tồn tại trong code. Phải kiểm tra khi tích hợp.
- Mọi mặt cắt, quân số nhân vật dựng và địa hình chi tiết chưa đối chiếu tư liệu được ghi nhãn **TÁI DỰNG MÔ PHỎNG**. Không biến họa tiết hoạt cảnh thành thông tin chiến thuật xác thực.
- **Lời dẫn** phía dưới là bản ghi âm V2.0; không tự đổi chữ khi lập trình camera. Gắn cue sau khi có WAV/MP3 thực để canh theo waveform và thời gian đọc.
- Không phát nhạc thương mại/chưa được cấp phép. Các tên nhạc trong bảng chỉ là gợi ý phong cách, cần thay bằng nguồn có quyền sử dụng.

## 1. Tổng hợp timeline

| Cảnh | Timecode | Dài | Tựa |
|---|---:|---:|---|
| C01 | 00:00–01:05 | 65s | Điện Biên Phủ – Vùng đất trước cơn bão |
| C02 | 01:05–02:35 | 90s | Pháo đài bất khả xâm phạm |
| C03 | 02:35–03:45 | 70s | Quyết định lịch sử – Đánh chắc, tiến chắc |
| C04 | 03:45–06:20 | 155s | Con đường của ý chí – Kéo pháo, xe thồ và hậu phương ra trận |
| C05 | 06:20–07:45 | 85s | Đợt tiến công thứ nhất – Phá vỡ cánh cửa thép |
| C06 | 07:45–09:15 | 90s | Đợt tiến công thứ hai – Cuộc chiến giành từng tấc đất |
| C06b | 09:15–10:15 | 60s | Một đêm trong chiến hào – Những con người làm nên lịch sử |
| C07 | 10:15–11:20 | 65s | Vòng vây khép chặt – Khi lòng chảo trở thành chiếc bẫy |
| C08 | 11:20–13:30 | 130s | Đồi A1 – Tiếng nổ làm rung chuyển chiến trường |
| C09 | 13:30–15:05 | 95s | Chiều 7 tháng 5 – Lá cờ chiến thắng trên nóc hầm Đờ Cát |
| C10 | 15:05–16:45 | 100s | Điện Biên Phủ – Một chiến thắng, một thời đại mới |

**Tổng:** 1005s = 16 phút 45 giây.

## 2. Kịch bản và danh sách shot chi tiết

### C01 — Điện Biên Phủ – Vùng đất trước cơn bão
**Thời đoạn lịch sử:** TRƯỚC 20/11/1953  
**Timecode:** 00:00 → 01:05  
**Nhạc & thiết kế âm:** Sáo, âm thanh núi rừng; mở chậm

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C01_S01` | 00:00–00:14 | 14s | Vùng núi Tây Bắc | drone flyover xuyên sương | `terrain_fog` · `mo_dau_cao` |
| `C01_S02` | 00:14–00:25 | 11s | Sườn núi phía Đông | crane/drone lướt đỉnh | `none` · `nui_cao_phia_dong` |
| `C01_S03` | 00:25–00:37 | 12s | Sông Nậm Rốm | low tracking dọc sông | `river` · `song_nam_rom` |
| `C01_S04` | 00:37–00:50 | 13s | Bản làng nhà sàn | slow dolly và pan | `village_idle` · `ban_tem` |
| `C01_S05` | 00:50–01:05 | 15s | Toàn lòng chảo | dolly out + ascension | `none` · `muong_thanh_plain` |

#### Lời thuyết minh – ghi âm trực tiếp

Giữa đại ngàn Tây Bắc, nơi những dãy núi nối tiếp nhau đến tận chân trời, có một thung lũng rộng lớn nằm lọt giữa bốn bề núi cao.

Đó là Điện Biên Phủ.

Dưới làn sương mỏng, dòng Nậm Rốm lặng lẽ chảy qua cánh đồng Mường Thanh. Những bản làng nép mình bên sườn núi. Cuộc sống của đồng bào các dân tộc vẫn tiếp diễn giữa một miền biên viễn xa xôi.

Ít ai có thể hình dung rằng, chỉ ít tháng sau, chính vùng đất này sẽ trở thành tâm điểm của một cuộc đối đầu làm rung chuyển lịch sử.

Tại đây, hai lực lượng với những điều kiện chiến tranh vô cùng khác biệt sẽ bước vào một trận quyết chiến chiến lược.

Một bên là quân đội viễn chinh Pháp, với máy bay, đại bác, xe tăng và hệ thống phòng ngự kiên cố.

Bên kia là quân đội của một dân tộc đã trải qua gần chín năm trường kỳ kháng chiến, mang theo khát vọng cháy bỏng về độc lập, tự do.

Và Điện Biên Phủ... sắp trở thành nơi thử thách ý chí của cả một dân tộc.

**Đạo diễn:** Sau câu “Đó là Điện Biên Phủ”, giữ nhịp thở; chuyển từ bình yên sang dự báo chiến trận.

### C02 — Pháo đài bất khả xâm phạm
**Thời đoạn lịch sử:** 20/11/1953 – đầu 1954  
**Timecode:** 01:05 → 02:35  
**Nhạc & thiết kế âm:** Trống quân sự căng thẳng, chuyển từ yên bình

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C02_S01` | 01:05–01:23 | 18s | Máy bay trên lòng chảo | tracking từ góc phía sau máy bay | `castor` · `castor_wide` |
| `C02_S02` | 01:23–01:35 | 12s | Sân bay Mường Thanh | glide đến mặt sân bay | `airfield` · `san_bay_may_bay` |
| `C02_S03` | 01:35–01:49 | 14s | Khu trung tâm | orbit rộng 35–50° | `reveal` · `trung_tam_muong_thanh` |
| `C02_S04` | 01:49–02:03 | 14s | Pháo, hàng rào và lô cốt | dolly cận lần lượt | `reveal` · `phao_155` |
| `C02_S05` | 02:03–02:17 | 14s | Cứ điểm Him Lam | pan + orbit | `reveal` · `cu_diem_him_lam` |
| `C02_S06` | 02:17–02:35 | 18s | Ba phân khu | ascend top-down | `sectors` · `three_sectors_overview` |

#### Lời thuyết minh – ghi âm trực tiếp

Ngày 20 tháng 11 năm 1953.

Bầu trời Điện Biên Phủ vang lên tiếng động cơ máy bay.

Từng tốp lính dù Pháp được thả xuống lòng chảo Mường Thanh, mở đầu cuộc hành quân Castor.

Một kế hoạch quân sự lớn bắt đầu được triển khai.

Người Pháp lựa chọn Điện Biên Phủ làm nơi xây dựng một tập đoàn cứ điểm hùng mạnh, với tham vọng biến thung lũng này thành một pháo đài có khả năng chống lại những cuộc tiến công lớn của Quân đội Nhân dân Việt Nam.

Từ trên cao nhìn xuống, một hệ thống phòng ngự dần hiện hình.

Những lô cốt bằng đất, gỗ và bê tông mọc lên. Hàng rào dây thép gai bao quanh từng cứ điểm. Chiến hào, bãi mìn và trận địa hỏa lực được bố trí để bảo vệ các vị trí trọng yếu.

Sân bay Mường Thanh trở thành tuyến tiếp tế đặc biệt quan trọng, kết nối tập đoàn cứ điểm với hậu phương bằng đường không.

Ba phân khu Bắc, Trung tâm và Nam tạo thành một hệ thống phòng ngự liên hoàn.

Trong tính toán của Bộ chỉ huy Pháp, địa hình lòng chảo cùng hỏa lực mạnh và khả năng tiếp tế từ trên không sẽ tạo cho họ những lợi thế quyết định.

Họ tin rằng, nếu quân đội Việt Nam tiến xuống thung lũng, những mũi tiến công sẽ bị nghiền nát trước hệ thống hỏa lực của tập đoàn cứ điểm.

Nhưng có một điều mà người Pháp đã đánh giá chưa đúng.

Đó là sức mạnh của những con người đang chuẩn bị chiến đấu trên chính những ngọn núi bao quanh họ.

### C03 — Quyết định lịch sử – Đánh chắc, tiến chắc
**Thời đoạn lịch sử:** ĐẦU NĂM 1954  
**Timecode:** 02:35 → 03:45  
**Nhạc & thiết kế âm:** Trang nghiêm, trầm, tiết chế

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C03_S01` | 02:35–02:50 | 15s | Sở chỉ huy trong rừng | dolly xuyên cây | `hq_ambient` · `hq_exterior` |
| `C03_S02` | 02:50–03:10 | 20s | Bàn sa bàn Bộ chỉ huy | dolly cận tay chỉ bản đồ | `hq_discussion` · `hq_map_table` |
| `C03_S03` | 03:10–03:26 | 16s | Bản đồ tác chiến | overhead push in | `maptext` · `map_closeup` |
| `C03_S04` | 03:26–03:45 | 19s | Dãy núi vây quanh Điện Biên | match cut từ bản đồ sang địa hình | `strategic_overlay` · `ridge_wide` |

#### Lời thuyết minh – ghi âm trực tiếp

Trong những cánh rừng Tây Bắc, Bộ chỉ huy Chiến dịch Điện Biên Phủ đang đứng trước một quyết định đặc biệt quan trọng.

Phía trước là một tập đoàn cứ điểm được xây dựng kiên cố, có hỏa lực mạnh và hệ thống phòng ngự phức tạp.

Một cuộc tiến công nóng vội có thể khiến bộ đội phải trả giá bằng những tổn thất vô cùng lớn.

Sau khi cân nhắc tương quan lực lượng và điều kiện chiến trường, Đại tướng Võ Nguyên Giáp đưa ra quyết định chuyển phương châm tác chiến.

Từ đánh nhanh, giải quyết nhanh sang đánh chắc, tiến chắc.

Đó không chỉ là thay đổi về thời gian tiến công.

Đó là sự lựa chọn đặt thắng lợi của chiến dịch, cùng sinh mạng của bộ đội, lên trên những sức ép về thời gian.

Quân ta sẽ chuẩn bị chu đáo hơn, xây dựng trận địa vững chắc hơn, từng bước bao vây, tiêu diệt những cứ điểm vòng ngoài, rồi tiến vào trung tâm.

Cuộc chiến giờ đây không chỉ được quyết định bởi những khẩu đại bác hay những mũi xung phong.

Nó còn được quyết định bởi khả năng tổ chức, sức bền và ý chí của cả một hậu phương đang hướng về mặt trận.

### C04 — Con đường của ý chí – Kéo pháo, xe thồ và hậu phương ra trận
**Thời đoạn lịch sử:** GIAI ĐOẠN CHUẨN BỊ  
**Timecode:** 03:45 → 06:20  
**Nhạc & thiết kế âm:** Cao trào cảm xúc đầu tiên; tiếng bánh xe, dây kéo, hô nhịp

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C04_S01` | 03:45–04:05 | 20s | Đường vận tải xuyên núi | aerial glide | `convoy` · `ridge_wide` |
| `C04_S02` | 04:05–04:25 | 20s | Bánh xe thồ và người đẩy | extreme close-up low tracking | `convoy` · `xe_tho_follow` |
| `C04_S03` | 04:25–04:41 | 16s | Đoàn xe thồ nối dài | side tracking + pull out | `convoy` · `xe_tho_side` |
| `C04_S04` | 04:41–05:01 | 20s | Bàn chân, bàn tay và dây kéo pháo | close tracking low | `keophao` · `keo_phao` |
| `C04_S05` | 05:01–05:26 | 25s | Khẩu đội kéo pháo lên dốc | wide tracking + orbit | `keophao` · `keo_phao` |
| `C04_S06` | 05:26–05:44 | 18s | Kéo pháo ra sau đổi phương châm | reverse slope tracking | `keophao_reverse` · `keo_phao` |
| `C04_S07` | 05:44–06:00 | 16s | Trận địa pháo trong núi | slow dolly close | `phao_nghi` · `phao_thu_nghi` |
| `C04_S08` | 06:00–06:20 | 20s | Các trận địa bao quanh lòng chảo | crane lift to topdown | `trench` · `encirclement_overhead` |

#### Lời thuyết minh – ghi âm trực tiếp

Để đánh bại một tập đoàn cứ điểm được trang bị hiện đại, quân đội Việt Nam phải vượt qua một thử thách tưởng chừng không thể.

Làm thế nào đưa hàng vạn con người, hàng nghìn tấn lương thực, đạn dược và những khẩu pháo nặng vào giữa núi rừng hiểm trở?

Ở một chiến trường mà đường sá vô cùng khó khăn, mỗi bao gạo, mỗi viên đạn đến được trận địa đều phải đánh đổi bằng biết bao mồ hôi và công sức.

Từ khắp các vùng quê, những đoàn dân công nối nhau lên đường.

Người gánh gạo, người tải đạn. Những chiếc xe đạp bình thường được gia cố thành phương tiện vận tải đặc biệt, chất đầy hàng hóa, vượt qua những con dốc quanh co.

Không động cơ. Không tiếng máy.

Chỉ có những đôi chân bước mãi, những bàn tay chai sạn và một niềm tin không gì lay chuyển.

Phía trước là chiến trường.

Phía sau là cả một dân tộc đang dồn sức cho ngày chiến thắng.

Và trên những sườn núi dựng đứng, một cuộc hành quân khác còn gian khổ hơn đang diễn ra.

Kéo pháo vào trận địa.

Những khẩu pháo nặng hàng tấn phải vượt qua đèo cao, vực sâu và những con đường được mở giữa núi rừng.

Từng sợi dây được căng hết sức.

Từng bước chân bám chặt vào đất đá.

Người phía trước kéo. Người phía sau giữ. Cả tập thể cùng dồn sức để đưa khẩu pháo tiến lên từng mét.

Có những thời điểm, chỉ một sơ suất cũng có thể đẩy khẩu pháo cùng những người lính xuống vực sâu.

Nhưng không ai buông tay.

Bởi tất cả đều hiểu rằng, mỗi khẩu pháo đến được trận địa sẽ góp thêm một phần sức mạnh cho trận quyết chiến đang tới gần.

Và rồi, khi phương châm tác chiến thay đổi, những khẩu pháo đã đưa vào lại phải được kéo ra để bố trí cho phương án mới.

Công sức tưởng như phải làm lại từ đầu.

Nhưng mệnh lệnh được chấp hành.

Và những người lính lại tiếp tục kéo pháo.

Ngày qua ngày, các trận địa được đào sâu vào lòng núi, che giấu dưới cây rừng.

Những khẩu pháo từng vượt hàng trăm khúc cua và dốc núi giờ đây đã có vị trí chiến đấu.

Bên dưới, quân Pháp vẫn tin tưởng vào sức mạnh của hệ thống phòng ngự.

Nhưng từ trên những đỉnh núi, một thế trận hoàn toàn khác đang dần hình thành.

Một thế trận được xây dựng không chỉ bằng vũ khí.

Mà bằng sức người, sức dân và ý chí quyết thắng của cả dân tộc Việt Nam.

**Đạo diễn:** Cận chân đạp bùn, bánh xe thồ, tay nắm dây; chuyển qua đại cảnh kéo pháo. Không chiếu các đoàn cùng lúc một cách vô cớ. Chuyển nhạc, dùng tiếng hô kéo pháo như xương sống nhịp hình.

### C05 — Đợt tiến công thứ nhất – Phá vỡ cánh cửa thép
**Thời đoạn lịch sử:** 13–17/03/1954  
**Timecode:** 06:20 → 07:45  
**Nhạc & thiết kế âm:** Pháo khai hỏa 17h 13/03; dồn dập, không quá phô trương

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C05_S01` | 06:20–06:33 | 13s | Him Lam, Độc Lập, Bản Kéo | aerial overview | `barrage` · `north_overview` |
| `C05_S02` | 06:33–06:48 | 15s | Pháo ta và Him Lam | telephoto push | `barrage` · `him_lam_close` |
| `C05_S03` | 06:48–07:02 | 14s | Đội hình xung phong Him Lam | follow cam | `assault` · `xung_phong_him_lam` |
| `C05_S04` | 07:02–07:15 | 13s | Độc Lập | orbit + tactical overlay | `barrage` · `doc_lap_close` |
| `C05_S05` | 07:15–07:28 | 13s | Xung phong Độc Lập | follow cam | `assault` · `xung_phong_doc_lap` |
| `C05_S06` | 07:28–07:37 | 9s | Bản Kéo | wide pan | `assault` · `ban_keo_close` |
| `C05_S07` | 07:37–07:45 | 8s | Phân khu Bắc thay đổi kiểm soát | rise topdown | `capture_overlays` · `north_overview2` |

#### Lời thuyết minh – ghi âm trực tiếp

17 giờ, ngày 13 tháng 3 năm 1954.

Tiếng pháo mở màn vang lên, làm rung chuyển lòng chảo Điện Biên.

Chiến dịch lịch sử chính thức bắt đầu.

Từ những trận địa bí mật trên núi cao, pháo binh Việt Nam đồng loạt khai hỏa.

Những loạt đạn dồn dập trút xuống Him Lam, một trong những cứ điểm quan trọng bảo vệ cửa ngõ phía Đông Bắc.

Đòn tiến công mạnh mẽ khiến quân Pháp bất ngờ trước sức mạnh hỏa lực mà quân ta đã đưa được vào chiến trường.

Dưới sự yểm trợ của pháo binh, các đơn vị bộ binh vượt qua những lớp hàng rào, tiến vào hệ thống công sự.

Trận đánh diễn ra quyết liệt.

Sau Him Lam là Độc Lập.

Rồi Bản Kéo.

Từng vị trí phòng ngự vòng ngoài lần lượt bị đánh chiếm hoặc buộc phải đầu hàng.

Chỉ sau năm ngày đêm, hệ thống phòng ngự phía Bắc của tập đoàn cứ điểm bị phá vỡ.

Đây không chỉ là thắng lợi quân sự đầu tiên của chiến dịch.

Nó còn làm lung lay niềm tin của quân Pháp vào một hệ thống phòng ngự mà họ từng cho là vững chắc.

Từ thời khắc ấy, Điện Biên Phủ không còn là chiến trường mà người Pháp có thể chủ động quyết định mọi điều.

### C06 — Đợt tiến công thứ hai – Cuộc chiến giành từng tấc đất
**Thời đoạn lịch sử:** TỪ 30/03/1954  
**Timecode:** 07:45 → 09:15  
**Nhạc & thiết kế âm:** Căng thẳng, chiến hào và các điểm cao phía Đông

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C06_S01` | 07:45–08:00 | 15s | Các cao điểm phía Đông | aerial ridge line | `barrage` · `east_ridge_wide` |
| `C06_S02` | 08:00–08:13 | 13s | Đồi E1 | descending orbit | `assault` · `E1` |
| `C06_S03` | 08:13–08:26 | 13s | Đồi D1 | descending orbit | `assault` · `D1` |
| `C06_S04` | 08:26–08:38 | 12s | Đồi C1 | mid tracking | `assault` · `C1` |
| `C06_S05` | 08:38–08:52 | 14s | Hào chiến đấu trên C1 | low follow + tight shot | `trench_fighting` · `xung_phong_C1` |
| `C06_S06` | 08:52–09:15 | 23s | Đồi A1 | slow dramatic orbit | `contested_overlay` · `A1` |

#### Lời thuyết minh – ghi âm trực tiếp

Ngày 30 tháng 3 năm 1954.

Chiến dịch bước vào đợt tiến công thứ hai.

Trọng tâm chiến sự chuyển sang những cao điểm phía Đông, nơi che chở trực tiếp cho khu trung tâm Mường Thanh.

E1. D1. C1. Và đặc biệt là A1.

Những ngọn đồi không lớn, nhưng trở thành các vị trí có ý nghĩa sống còn đối với cả hai bên.

Pháo nổ suốt ngày đêm.

Các đợt tiến công nối tiếp những cuộc phản kích.

Có những vị trí, quân ta phải giành giật từng đoạn chiến hào, từng công sự, từng mét đất.

Mưa rừng trút xuống làm đất đỏ hóa thành bùn lầy. Những chiến hào ngập nước. Quần áo ướt sũng, bữa ăn vội vàng giữa những giờ phút ngừng tiếng súng.

Nhưng người lính vẫn bám trận địa.

Bởi phía sau mỗi ngọn đồi là cả con đường tiến vào trung tâm tập đoàn cứ điểm.

Và từng vị trí giành được, dù phải trả bằng những hy sinh vô cùng lớn, đều góp phần thu hẹp không gian phòng ngự của quân Pháp.

Cuộc chiến không còn được tính bằng những cây số.

Mà bằng từng mét hào, từng ụ súng, từng tấc đất phải giữ bằng mọi giá.

### C06b — Một đêm trong chiến hào – Những con người làm nên lịch sử
**Thời đoạn lịch sử:** THÁNG 04/1954  
**Timecode:** 09:15 → 10:15  
**Nhạc & thiết kế âm:** Rất ít nhạc, tiếng thở, gió, bước chân

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C06b_S01` | 09:15–09:30 | 15s | Toàn đường hào ban đêm | slow dolly low | `hao_dem` · `hao_toan` |
| `C06b_S02` | 09:30–09:45 | 15s | Lính chia cơm, thư nhà, lau súng | slow close-ups | `hao_dem` · `hao_doc` |
| `C06b_S03` | 09:45–09:59 | 14s | Chiến sĩ đứng gác | dolly sau vai | `hao_dem` · `hao_gac` |
| `C06b_S04` | 09:59–10:15 | 16s | Hào nối về cao điểm địch | pull back to darkness | `hao_dem` · `hao_toan` |

#### Lời thuyết minh – ghi âm trực tiếp

Giữa những trận đánh dữ dội, có những khoảnh khắc chiến trường trở nên lặng lẽ.

Trong lòng những đường hào sâu, người lính tranh thủ từng phút nghỉ ngơi hiếm hoi.

Một nắm cơm vắt.

Một ngụm nước chia nhau.

Một lá thư nhà được đọc dưới ánh đèn mờ.

Họ là những người con từ bao miền quê đất Việt.

Có người từng cầm cuốc trên đồng ruộng. Có người vừa rời mái trường. Có người đã trải qua nhiều năm chiến đấu.

Giờ đây, tất cả cùng có mặt giữa chiến hào Điện Biên Phủ.

Họ cũng nhớ nhà. Cũng biết mệt mỏi. Cũng hiểu rằng ngày mai, có thể một người đồng đội sẽ không còn trở về.

Nhưng họ vẫn ở lại vị trí chiến đấu.

Vẫn tiếp tục đào hào.

Vẫn tiến về phía trước.

Bởi điều họ đang chiến đấu để giành lấy không chỉ là một ngọn đồi, hay một cứ điểm.

Mà là quyền được sống trong một đất nước độc lập, không còn bị đô hộ.

### C07 — Vòng vây khép chặt – Khi lòng chảo trở thành chiếc bẫy
**Thời đoạn lịch sử:** THÁNG 04/1954  
**Timecode:** 10:15 → 11:20  
**Nhạc & thiết kế âm:** Nhạc căng, vòng hào khép dần

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C07_S01` | 10:15–10:38 | 23s | Lưới hào bao vây | overhead orbit | `trench` · `trench_topdown` |
| `C07_S02` | 10:38–11:00 | 22s | Sân bay Mường Thanh | low track then rise | `airdrop` · `airfield_tracking` |
| `C07_S03` | 11:00–11:20 | 20s | Trung tâm vòng vây | topdown slow zoom | `control` · `center_encirclement` |

#### Lời thuyết minh – ghi âm trực tiếp

Trong khi những trận đánh trên các cao điểm tiếp diễn, một cuộc chiến âm thầm khác đang làm thay đổi toàn bộ cục diện chiến trường.

Đó là cuộc chiến của những đường hào.

Từ các trận địa vòng ngoài, hệ thống giao thông hào của quân ta liên tục được đào sâu, kéo dài, ngày càng tiến gần về trung tâm Mường Thanh.

Từng con hào mới được mở ra, cũng là từng bước làm thu hẹp vùng kiểm soát của quân Pháp.

Sân bay Mường Thanh dần bị khống chế.

Hoạt động tiếp tế bằng đường không ngày càng nguy hiểm và khó khăn. Những kiện hàng thả dù có lúc rơi ngoài tầm kiểm soát của quân Pháp.

Tập đoàn cứ điểm từng được kỳ vọng sẽ thu hút và tiêu hao lực lượng Việt Nam.

Giờ đây, chính quân Pháp lại bị siết chặt bên trong những tuyến công sự do họ xây dựng.

Những dãy núi bao quanh lòng chảo, từng được coi là một phần lợi thế phòng ngự, đã trở thành nơi đặt những trận địa pháo và hệ thống bao vây của quân ta.

Thế trận đang đổi chiều.

Và thời khắc quyết định ngày một đến gần.

### C08 — Đồi A1 – Tiếng nổ làm rung chuyển chiến trường
**Thời đoạn lịch sử:** ĐÊM 06 – SÁNG 07/05/1954  
**Timecode:** 11:20 → 13:30  
**Nhạc & thiết kế âm:** Đào hầm gần như im lặng, ngắt 2s trước nổ, cao trào

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C08_S01` | 11:20–11:39 | 19s | Đồi A1 | orbit chiến trường | `contested_overlay` · `A1_wide` |
| `C08_S02` | 11:39–12:01 | 22s | Công binh đào hầm | extreme close-up thấp | `daoham` · `dao_ham_A1` |
| `C08_S03` | 12:01–12:21 | 20s | Mặt cắt đường hầm | cutaway traveling through tunnel | `cutaway` · `A1_cutaway` |
| `C08_S04` | 12:21–12:38 | 17s | Khối bộc phá đặt vào vị trí | locked close-up | `charge_placement` · `A1_cutaway` |
| `C08_S05` | 12:38–12:45 | 7s | Mặt đất đồi A1 | hold + silence 2s then flash | `a1blast` · `A1_ho_boc_pha` |
| `C08_S06` | 12:45–13:09 | 24s | Quân ta tiến công sau nổ | tracking assault | `assault` · `xung_phong_A1` |
| `C08_S07` | 13:09–13:30 | 21s | A1 sau khi bị đánh chiếm | crane upward | `capture_overlay` · `A1_wide` |

#### Lời thuyết minh – ghi âm trực tiếp

Giữa những cao điểm phía Đông, có một ngọn đồi trở thành nơi diễn ra những trận đánh ác liệt nhất của chiến dịch.

Đồi A1.

Từ vị trí này, quân Pháp có thể bảo vệ khu trung tâm Mường Thanh bằng hệ thống công sự và hỏa lực mạnh.

Quân ta đã nhiều lần tiến công. Những trận đánh kéo dài, giằng co và gây ra tổn thất lớn.

Nhưng A1 vẫn là một trở ngại phải vượt qua.

Để phá vỡ hệ thống phòng ngự kiên cố ấy, một phương án đặc biệt được triển khai.

Đào một đường hầm vào lòng đồi, đưa khối bộc phá lớn đến bên dưới vị trí phòng thủ của đối phương.

Trong lòng đất chật hẹp, những người lính công binh bắt đầu một cuộc chiến mà kẻ thù không nhìn thấy.

Không có ánh mặt trời.

Không có những đội hình xung phong.

Chỉ có bóng tối, đất đá và từng nhát cuốc âm thầm.

Đất được đào lên, chuyển dần ra phía sau. Đường hầm nhích về phía trước từng chút một.

Không gian chật hẹp khiến công việc vô cùng gian khổ.

Nhưng từng mét hầm hoàn thành là thêm một bước tiến đến mục tiêu.

Phía trên đầu họ là hệ thống phòng ngự của quân Pháp.

Phía sau họ là những đồng đội đang chờ thời khắc tổng tiến công.

Và dưới lòng đồi A1, ý chí của những người lính Việt Nam đang mở một con đường mà không một hàng rào thép gai hay lô cốt nào có thể ngăn cản.

Sau những ngày đêm lao động và chiến đấu căng thẳng, đường hầm được hoàn thành.

Một khối bộc phá nặng khoảng 960 kilôgam được đặt vào vị trí.

20 giờ 30 phút, ngày 6 tháng 5 năm 1954.

Thời khắc quyết định đã đến.

Một tiếng nổ dữ dội vang lên!

Đất đá tung lên. Cả đồi A1 rung chuyển.

Tiếng nổ trở thành hiệu lệnh cho những đợt tiến công quyết liệt trong đêm.

Các chiến sĩ xung kích tiếp tục lao lên, đánh chiếm những công sự còn lại.

Trận chiến chưa kết thúc ngay sau tiếng nổ. Quân ta còn phải chiến đấu quyết liệt để làm chủ hoàn toàn cứ điểm.

Nhưng khi A1 thất thủ vào rạng sáng ngày 7 tháng 5, một vị trí phòng ngự then chốt của tập đoàn cứ điểm đã bị đánh sập.

Từ lòng đất Điện Biên, những người lính đã góp phần mở ra con đường đi tới chiến thắng cuối cùng.

**Đạo diễn đặc biệt:** Không phát tiếng nhạc dưới cảnh đào hầm. Trước `a1blast` chèn **2 giây im lặng**; sau tiếng nổ, không cắt thẳng sang cờ chiến thắng: phải có xung phong và giằng co để tránh sai diễn biến. Bộc phá / mặt cắt hiển thị nhãn “Minh họa”.

### C09 — Chiều 7 tháng 5 – Lá cờ chiến thắng trên nóc hầm Đờ Cát
**Thời đoạn lịch sử:** CHIỀU 07/05/1954  
**Timecode:** 13:30 → 15:05  
**Nhạc & thiết kế âm:** Nhạc giải phóng, vút cao ở cảnh cờ

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C09_S01` | 13:30–13:46 | 16s | Các mũi tiến công trung tâm | topdown to low | `assault` · `center_wide` |
| `C09_S02` | 13:46–14:04 | 18s | Cầu Mường Thanh | follow cam | `bridge_run` · `bridge` |
| `C09_S03` | 14:04–14:22 | 18s | Hầm sở chỉ huy Đờ Cát | dolly in | `hq_capture` · `hq_de_castries` |
| `C09_S04` | 14:22–14:42 | 20s | Lá cờ chiến thắng trên nóc hầm | low angle orbit + rise | `roof_flag` · `victory_rise` |
| `C09_S05` | 14:42–15:05 | 23s | Toàn thung lũng và lá cờ | slow crane up | `flag` · `victory_rise` |

#### Lời thuyết minh – ghi âm trực tiếp

Ngày 7 tháng 5 năm 1954.

Sau 55 ngày đêm chiến đấu, quân đội Việt Nam bước vào những giờ phút cuối cùng của trận quyết chiến lịch sử.

Các cứ điểm phòng ngự lần lượt bị đánh chiếm.

Từ nhiều hướng, những đơn vị bộ đội tiến về khu trung tâm Mường Thanh.

Tiếng súng vẫn vang lên giữa lòng chảo.

Nhưng lúc này, thế trận đã hoàn toàn thay đổi.

Những đơn vị từng được bố trí để bảo vệ tập đoàn cứ điểm đang mất dần khả năng chống đỡ.

Những mũi tiến công của quân ta tiếp tục áp sát sở chỉ huy của tướng Christian de Castries.

Những người lính vượt qua cầu, tiến về hầm chỉ huy.

Bao nhiêu ngày đêm gian khổ.

Bao nhiêu cuộc hành quân qua núi rừng.

Bao nhiêu người đã ngã xuống trên những sườn đồi, những con đường và trong những chiến hào.

Tất cả đang hướng về thời khắc này.

Chiều ngày 7 tháng 5 năm 1954, Bộ chỉ huy quân Pháp tại Điện Biên Phủ bị đánh chiếm. Tướng de Castries cùng các sĩ quan chỉ huy bị bắt.

Và rồi...

Lá cờ Quyết chiến Quyết thắng tung bay trên nóc hầm Đờ Cát.

Sau 56 ngày đêm chiến đấu, tập đoàn cứ điểm Điện Biên Phủ bị đánh bại.

Pháo đài mà người Pháp từng đặt biết bao kỳ vọng đã thất thủ.

Chiến thắng không chỉ thuộc về những người lính trực tiếp có mặt tại chiến trường.

Đó là chiến thắng của những đoàn dân công không quản ngày đêm, của những người mẹ ở hậu phương, của đồng bào các dân tộc Tây Bắc và của hàng triệu trái tim Việt Nam cùng hướng về Điện Biên.

Một dân tộc đã chiến thắng bằng sức mạnh đoàn kết, lòng quả cảm và khát vọng độc lập.

**Đạo diễn:** Cờ xuất hiện sau khi hầm chỉ huy đã bị chiếm; không để cờ bay trên hầm trong các cảnh trước.

### C10 — Điện Biên Phủ – Một chiến thắng, một thời đại mới
**Thời đoạn lịch sử:** 07/05 – 21/07/1954  
**Timecode:** 15:05 → 16:45  
**Nhạc & thiết kế âm:** Trang trọng, kết mạnh, ngân dài

#### Shot list

| Shot | Timeline tổng | Thời lượng | Anchor / mục tiêu | Chuyển động camera | Hoạt cảnh / mã gốc |
|---|---|---:|---|---|---|
| `C10_S01` | 15:05–15:23 | 18s | Lá cờ chiến thắng | slow pull back | `flag` · `victory_rise` |
| `C10_S02` | 15:23–15:49 | 26s | Chiến trường và ba đợt tiến công | aerial slow orbit + tactical overlays | `recap` · `grand_overview` |
| `C10_S03` | 15:49–16:07 | 18s | Bản đồ Việt Nam & Genève | crossfade map, archival imagery | `geneva_cards` · `grand_overview` |
| `C10_S04` | 16:07–16:28 | 21s | Điện Biên nhìn từ trên cao | ascend reveal mountains | `none` · `grand_overview` |
| `C10_S05` | 16:28–16:45 | 17s | Tựa kết phim | fade to black typography | `endtitle` · `end_title` |

#### Lời thuyết minh – ghi âm trực tiếp

56 ngày đêm.

Từ ngày 13 tháng 3 đến ngày 7 tháng 5 năm 1954.

Đó là 56 ngày đêm của những trận đánh khốc liệt, những cuộc hành quân gian khổ, những chiến hào đào sâu trong đất và những con người sẵn sàng hy sinh vì độc lập của Tổ quốc.

Từ những chiếc xe đạp thồ trên đường rừng.

Từ những khẩu pháo được kéo bằng sức người vượt qua đèo cao, vực sâu.

Từ những nhát cuốc âm thầm trong lòng đồi A1.

Cho đến lá cờ tung bay trên nóc hầm chỉ huy quân Pháp.

Tất cả đã làm nên một chiến thắng đi vào lịch sử.

Chiến thắng Điện Biên Phủ.

Chiến thắng ấy giáng một đòn quyết định vào nỗ lực quân sự cuối cùng của thực dân Pháp tại Đông Dương, làm thay đổi cục diện chiến tranh và tạo nên sức mạnh quan trọng trên bàn đàm phán quốc tế.

Ngày 21 tháng 7 năm 1954, các văn kiện của Hiệp định Genève về Đông Dương được hoàn tất, xác lập những thỏa thuận đình chỉ chiến sự, mở đường cho việc kết thúc cuộc kháng chiến chống thực dân Pháp.

Một chương lịch sử mới được mở ra.

Miền Bắc được giải phóng, bước vào thời kỳ xây dựng và trở thành hậu phương cho cuộc đấu tranh thống nhất đất nước sau này.

Nhưng Điện Biên Phủ không chỉ là một chiến thắng của Việt Nam.

Đó còn là lời khẳng định mạnh mẽ trước thế giới:

Một dân tộc dù phải đối mặt với những đội quân được trang bị hiện đại, vẫn có thể chiến thắng khi có đường lối đúng đắn, sức mạnh đoàn kết và ý chí kiên cường bảo vệ độc lập.

Những người lính năm ấy, nhiều người đã mãi mãi nằm lại giữa núi rừng Tây Bắc.

Nhưng tinh thần của họ vẫn sống cùng non sông.

Để hôm nay, khi nhìn lại lòng chảo Điện Biên, chúng ta không chỉ nhìn thấy một chiến trường của quá khứ.

Mà còn nhìn thấy sức mạnh của một dân tộc.

Một dân tộc đã viết nên lịch sử bằng chính máu xương, nghị lực và khát vọng tự do của mình.

Điện Biên Phủ – chiến thắng của ý chí Việt Nam.

**Đạo diễn:** Giữ nhạc trang trọng, chuyển bản đồ sang thẻ thông tin Genève và dòng chữ kết; không mô tả ký Hiệp định diễn ra ngay sau ngày 7/5.

## 3. Lớp asset, cue và trạng thái phải kiểm tra

| Nhóm | Cần có | Nếu chưa có |
|---|---|---|
| Địa hình | DEM / núi / lòng chảo / sông Nậm Rốm / bản làng | Dùng đại cảnh sơ đồ, gắn nhãn minh họa |
| Pháp | Máy bay, lính dù, công sự, sân bay, ba phân khu | Hiển thị dần bằng overlay 2D trên địa hình |
| Hậu cần | Xe đạp thồ, gánh hàng, dân công, đường núi | Proxy low-poly, giữ góc rộng; không giả cận cảnh chân thực |
| Pháo binh | Pháo, dây kéo, người kéo, trận địa núi | Tách lớp người / pháo, giữ khớp tư thế và thang tỉ lệ |
| Giao thông hào | Hào, bộ đội nghỉ, đèn, thư | Cảnh tượng trưng riêng, không gán địa danh xác thực |
| A1 | Đồi A1, cửa hầm, mặt cắt, khối bộc phá, crater, xung phong | Dùng cutaway sơ đồ và overlay ghi “minh họa” |
| Kết thúc | Hầm Đờ Cát, cờ, cầu Mường Thanh | Chỉ hiển thị khi anchor xác minh được |

## 4. Contract dữ liệu / đề nghị triển khai Claude Code

1. Đọc `camera_timeline_v2.json`, dùng `sceneId`, `shotId`, `startSec`, `durationSec`; dựng camera cutscene theo timeline. Không hardcode một lần nữa trong UI.
2. `anchorHint` chỉ là tên người đọc hiểu, `anchorId: null` yêu cầu ánh xạ tới tên node / waypoint thật trong scene. Nếu không tìm thấy, log cảnh báo và dùng fallback; không tạo tọa độ tùy ý.
3. Chỉ phát `animationId` khi actor/mesh tương ứng tồn tại. Tên hành động mang tính gợi ý và phải map vào animation registry thực tế.
4. Tạo các cue `VOICE_START`, `VOICE_PAUSE`, `VOICE_END` sau khi có file thu âm, căn theo câu; các mốc trong JSON hiện là **shot video**, không phải timestamp chuẩn của từng câu.
5. Khi đã có WAV/MP3, xuất báo cáo **voiceDuration vs durationSec** từng cảnh. Nếu VO dài hơn, cập nhật `durationSec`, không cắt bỏ lời dẫn.
6. Chế độ **Xem phim** chạy tuần tự C01→C10; chế độ **Khám phá** có thể tạm dừng, xoay, zoom và chọn hotspot nhưng không thay timeline mặc định.
7. Test Chrome / Safari desktop và mobile: không giật camera; không xuyên mesh; không lộ nền trống; không cờ xuất hiện sớm; nhạc/voice không chồng nhau.

## 5. Nội dung cần xác minh sử liệu / phần chưa khóa

- Giờ chiến thắng hầm De Castries và cách diễn đạt văn kiện Genève cần đối chiếu tư liệu chính thức trước khi xuất bản cuối.
- Những số lượng lính, xe, khẩu pháo trong kịch bản gốc là **tham số đồ họa minh họa**, không phải số liệu lịch sử xác nhận.
- Hầm và khối bộc phá A1 dùng số liệu “khoảng 960 kg” theo lời dẫn V2.0; mô hình đường hầm là mặt cắt minh họa, không phải bản đo địa chất.
- Độ dài 16:45 là đề xuất shot; lời dẫn khá dài. Khi có bản thu âm, **ưu tiên nhịp đọc thực tế** và xác nhận lại tổng thời lượng.

## 6. Prompt triển khai ngắn cho Claude Code

```text
Lấy repo hoclichsu làm nguồn chuẩn. Đọc toàn bộ KICH_BAN_DBP_1954_V2_CAMERA.md và camera_timeline_v2.json.
Không sửa giao diện website đã khóa, không ghi đè sa bàn Quảng Trị.
Khảo sát dữ liệu/asset Điện Biên hiện có trước, xuất danh sách anchor/animation đã tồn tại.
Tích hợp cinematic camera chạy theo các shot trong JSON, ánh xạ anchorId và actor thật.
Nếu thiếu asset, đánh dấu TODO_ASSET và dùng fallback an toàn; không bịa tọa độ.
Tạo giao diện xem phim / khám phá, cue voice và SFX theo thời gian.
Bảo đảm nội dung tái dựng mô phỏng luôn được ghi nhãn; sau đó kiểm thử và lập báo cáo thiếu asset.
```

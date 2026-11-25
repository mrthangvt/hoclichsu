# Sa bàn Hà Nội – Điện Biên Phủ trên không 1972 — tư liệu, kịch bản, tài sản (V0)

Gói: `vietsu/static/khong-gian/packs/dien-bien-phu-tren-khong-1972/` · bộ máy 2.2.0 · nhánh `claude/dien-bien-phu-tren-khong-1972` (chưa đẩy được lên GitHub từ phiên này — xem mục 8).
Trạng thái (26/11/2026, đêm): **V0 chạy đủ 12 cảnh theo voice thật** (14:43), hai tầng địa hình, khí tài của anh Thắng đã lắp; chờ anh duyệt.
Nhãn bắt buộc: "Tái dựng mô phỏng — cần đối chiếu tư liệu". Mã nguồn `S…` (Việt Nam), `M…` (Mỹ), `D…` (dữ liệu) ở `sources.json`.

## 1. Kịch bản, voice
- Kịch bản: `DienBienPhuTrenKhong1972/KICH_BAN_CLAUDE_12_CANH.md` (anh Thắng). Voice: `dienbienphutrenkhong-voice.mp3` (865 s).
- Nhận dạng: `tools/sa_ban/voice/asr_onnx.py` → `tools/sa_ban/voice/asr_dbpk1972.json`; khớp lời dẫn bằng `tools/sa_ban/dbpk/can_voice.py` → **98,5 % số từ**, không câu nào khớp dưới 50 %.
- `tools/sa_ban/dbpk/dung_story.py`: chèn 0,8 s lặng đầu phim và 1,2 s trước mỗi cảnh 2–12 (voice đọc liền ~0,3 s giữa các cảnh); `story.moc['Cxx.n']` = giây bắt đầu câu n của cảnh — mọi hoạt cảnh lấy mốc theo câu đọc. 100 cú máy, cỡ cảnh theo định hướng toàn – trung – cận của kịch bản.

| Cảnh | Tầng | Giây | Chính |
|---|---|---|---|
| C01 Hà Nội trước cơn bão lửa | Hà Nội | 0–58 | phố, tàu điện, xe đạp, nhà máy Xe lửa Gia Lâm, trận địa ban ngày; thẻ bản đồ hai mục tiêu |
| C02 B-52 – Những pháo đài bay | miền Bắc | 58–117 | thẻ bản đồ Guam / U-Tapao; B-52D cận; tốp 3 chiếc, F-4 hộ tống, nhiễu; mũi tên nhiều hướng |
| C03 Thế trận phòng không | Hà Nội | 117–185 | xe ra-đa, tiểu đoàn S-75 (6 bệ), cao xạ 37 mm bên cầu Long Biên, MiG-21 ở Nội Bài, tự vệ 12,7 mm trên mái nhà; màn hình ra-đa mô phỏng |
| C04 Đêm 18/12 | Hà Nội | 185–258 | dải nhiễu trên màn hình; tốp từ hướng Tam Đảo (S4); còi báo động, đèn phố tắt; bom Nội Bài, Đông Anh, Yên Viên, Gia Lâm (S1); Tiểu đoàn 59 phóng 2 quả, B-52 rơi cánh đồng Phù Lỗ (S1, S5) |
| C05 Đêm 20 rạng 21/12 | Hà Nội | 258–332 | xe chở đạn; đồng hồ 05:02 → 05:11; bốn chiếc trúng đạn ở bốn nơi khác nhau, một chiếc rơi ngoài khung (S6, S7) |
| C06 Màn nhiễu | Hà Nội | 332–403 | tốp B-52 trong nhiễu, sợi nhiễu; màn hình mô phỏng; xe điều khiển, hậu cần |
| C07 Hà Nội trong bom đạn | Hà Nội | 403–473 | Bạch Mai đổ nát (đêm 21 rạng 22/12, S12); vệt bom dọc Khâm Thiên đêm 26/12 (S10, S11); cứu nạn; vật dụng gia đình (cận); thẻ 287 người |
| C08 Đêm 26/12 | miền Bắc | 473–545 | mũi tên các hướng vào Hà Nội, Hải Phòng; 8 B-52 trúng đạn (S13), điểm rơi rải nhiều nơi (MINH HOẠ) |
| C09 MiG-21 | miền Bắc | 545–631 | Phạm Tuân cất cánh Yên Bái, hướng Mộc Châu (S14, S16); Vũ Xuân Thiều cất cánh **Cẩm Thủy** (S14, S16), không dựng va chạm; hai đường bay |
| C10 Đêm cuối | Hà Nội | 631–705 | Tiểu đoàn 79 bắn rơi B-52 (S17, S15), rạng sáng 30/12 |
| C11 Chiến thắng và mất mát | Hà Nội | 705–788 | xác B-52 hồ Hữu Tiệp (S15); thẻ số liệu hai phía (S5 / M2, M6) |
| C12 Bản hùng ca | Hà Nội | 788–883 | Cột cờ Hà Nội, cờ đỏ sao vàng bay; tựa đề "HÀ NỘI – ĐIỆN BIÊN PHỦ TRÊN KHÔNG" |

## 2. Chỗ lệch giữa kịch bản và nguồn (chờ anh chốt)
1. **Giờ chiếc B-52 đầu tiên:** voice đọc "khoảng 20 giờ 18 phút"; Nhân Dân, TTXVN, Thanh tra, Sở VHTT Hà Nội ghi **20 giờ 13**; Tiền Phong 20 giờ 16; SGGP 20 giờ 18 (Nhân Dân ghi 20h18 là lúc hết đợt bom). Thẻ chữ trên hình ghi 20 giờ 13 kèm chú thích. Đề xuất thu lại câu này.
2. **Vũ Xuân Thiều:** nguồn ghi cất cánh từ sân bay **Cẩm Thủy (Thanh Hóa)**, đánh trên vùng trời Sơn La; kịch bản để địa bàn C09 là "Sân bay Yên Bái" (đúng cho Phạm Tuân). Sa bàn dựng đúng nguồn; lời dẫn không nêu sân bay nên không cần sửa voice.
3. **Số liệu:** 81 máy bay / 34 B-52 (16 rơi tại chỗ) — Bộ Quốc phòng (S5); phía Mỹ 15 B-52 (AFHRA, M2), trong đó 10 rơi trên miền Bắc (M6). Thẻ số liệu ghi đủ nguồn.
4. **Vị trí trận địa:** chỉ Tiểu đoàn 77 ở Chèm có nguồn (S3). Tiểu đoàn 57 "phía bắc sông Hồng", 79 "phía nam sông Hồng" (S6), 59 gần Cổ Loa, 72 (Trung đoàn 285) — đặt ƯỚC LƯỢNG, nhãn ghi rõ. Cần sơ đồ bố trí của Quân chủng PK-KQ nếu anh có.
5. Điểm rơi các B-52 đêm 20–21/12, 26/12, 29/12: không có toạ độ — rải ở các nơi khác nhau, ghi MINH HOẠ (theo yêu cầu kịch bản "không xếp các vụ rơi cùng địa điểm").

## 3. Địa hình (dữ liệu lấy qua Chrome của anh, 26/11/2026)
- `dbpk1972_du-lieu-v2.json` (Downloads của anh): DEM Terrarium (giải sẵn trong Chrome ra lưới Int16) + OSM rút gọn. `tools/sa_ban/dia_hinh/dung_dia_hinh_dbpk.py`.
- **Tầng Hà Nội** (`terrain/`, mặc định): tâm 21,085 B · 105,845 Đ, R 18 km, lưới 1024 (37 m/ô); hạ 5 m để mặt sông Hồng mùa cạn ngang mặt nước chung (ước lượng). Bỏ hồ điều hoà, hồ đô thị mới; không vẽ đường cao tốc, vành đai, cầu sau 1972. Phố mái ngói chỉ trong **nội thành cũ vẽ tay (ước lượng)** + thị trấn Gia Lâm; ngoài là ruộng + làng.
- **Tầng miền Bắc** (`terrain/mien-bac/`): tâm 20,98 B · 105,65 Đ, R 125 km (Yên Bái, Mộc Châu, Cẩm Thủy, Hải Phòng), ×1,5. Bỏ 40 hồ chứa xây sau 1972 (Hòa Bình 202 km², Cửa Đạt, Hủa Na, Trung Sơn…), giữ Thác Bà (1971), Đại Lải, Suối Hai, Đồng Mô.
- `placement.json` (`tools/sa_ban/dbpk/dung_placement.py`): 31.645 nhà phố (MINH HOẠ, ô 900 m, ẩn theo khoảng cách), các tuyến phố (Khâm Thiên, Đinh Tiên Hoàng, Tràng Tiền…), cầu Long Biên, đường băng Nội Bài, Gia Lâm, Yên Bái, khuôn viên Bạch Mai, nhà máy Xe lửa Gia Lâm, hồ Hữu Tiệp.

## 4. Tài sản
| Khí tài | Tệp | Nguồn mẫu | Ghi chú |
|---|---|---|---|
| B-52D | `props/may-bay/b-52d.glb` | anh Thắng (Khe Sanh), em sơn rằn ri | Phía Mỹ còn dùng B-52G (xám) — chưa có mẫu |
| MiG-21 | `props/may-bay/mig-21.glb` | Tripo, anh Thắng 26/11 | dài 15,76 m; **phù hiệu sao đỏ kiểu Liên Xô chưa đúng phù hiệu Không quân nhân dân VN** — cần sửa ảnh màu |
| Tên lửa S-75 + bệ phóng | `props/phao/s-75-be-phong.glb` | Tripo, anh Thắng 26/11 | em tách tên lửa khỏi bệ theo màu (`tools/sa_ban/dbpk/tach_ten_lua.py`): nút `ten_lua` ẩn khi phóng, bản sao bay lên |
| Xe ra-đa | `props/xe/xe-ra-da.glb` | Tripo, anh Thắng 26/11 | dài 6,9 m (theo ZIL-157); dùng cho đài ra-đa và giữa mỗi trận địa — MINH HOẠ (xe điều khiển SNR-75 thật khác) |
| Súng máy phòng không 12,7 mm | `props/phao/dshk-12-7mm.glb` | Tripo, anh Thắng 26/11 | trên mái nhà (tự vệ) |
| Cao xạ 37 mm, xe tải | `props/phao/cao-xa-37-2-nong.glb`, `props/xe/xe-tai.glb` | gói HCM 1975 | Hà Nội 1972 có cả 57, 85, 100 mm — chưa có mẫu |
| F-4 | dựng bằng mã | hình khối | MINH HOẠ |
| Nhà phố, cầu Long Biên, Bạch Mai, nhà máy, Cột cờ, gạch đá Khâm Thiên, tàu điện, xe đạp | dựng bằng mã | — | MINH HOẠ |
| Bộ đội, dân | `units/linh-qgp-a/b`, `dan-sg-nam/nu` | gói Khe Sanh / HCM | quân phục, trang phục dân là MINH HOẠ — dân mặc kiểu Sài Gòn 1975 |

**Nhân vật anh vừa thêm (26/11, 1h20)** — em chưa lắp, chờ anh chọn: `nhan-vat/_moi/nguoi-di-xe-dap.zip` (thay xe đạp dựng bằng mã ở Cảnh 1), `taudien-ha-noi.webp` (chưa có tệp mẫu 3D), thư mục `Thành cổ Quảng Trị/3D_GiaiDoan1` (lính QĐND 1972), `ChienDichHoChiMinh1975`. Đề xuất cần thêm: trắc thủ ra-đa, phi công (mũ bay), dân Hà Nội 1972 (áo bông, mũ rơm), dân quân nữ, y tá, B-52G.

## 5. Mã
- `tools/sa_ban/dbpk/bien_dao_dbpk.js` — toàn bộ dàn cảnh: bầu trời đêm / chạng vạng / bình minh, tốp B-52, tên lửa (vệt khói, chớp nổ), máy bay rơi, vệt bom, đám cháy, đạn vạch cao xạ, đèn phố tắt, MiG-21 cất cánh, lớp phủ (màn hình ra-đa mô phỏng, thẻ bản đồ, đồng hồ, số liệu có nguồn, tựa đề), máy quay 100 cú, ghim, âm thanh theo sự kiện.
- `tools/sa_ban/dbpk/rieng_tu_ks.py` — dựng `rieng.js` từ `rieng.js` Khe Sanh V2.1 (giữ máy móc chung, thay ba khối biên đạo, mốc, tầng, góc nhìn, chữ ngày, nhạc).
- Thử nhanh: `engine/2.2.0/sa-ban.html?goi=dien-bien-phu-tren-khong-1972` (`&tang=mien-bac`).

## 6. Kiểm tra (26/11/2026, 1h40)
- `quet_phim.py … ha-noi 1`: 671 mốc, `out = []`, `slow = []`; `… mien-bac 1`: 218 mốc, `out = []`, `slow = []`.
- `kiem_tra_goi.py`: hợp lệ; tải lần đầu 3,7 MB (ngân sách 15 MB), tải sau 15,8 MB, âm thanh 12,5 MB.
- `soat_chu_thich.py rieng.js`: sạch. Bản đóng gói Artifact chạy thử cục bộ: bấm "Xem phim" → phim chạy.
- **Artifact xem trước:** https://claude.ai/artifact/BFJbwFLSiiksEBNDCbXouL (slug `52faa5af-15d0-46d3-a3d0-c5b091cdf683`).
- Chưa đo được fps trên máy thật (máy làm việc không có card đồ hoạ). 31.645 nhà phố vẽ bằng 70 ô InstancedMesh — nếu điện thoại chậm thì giảm.

## 7. Việc tiếp
1. Anh duyệt V0, chốt mục 2.
2. Lắp người đi xe đạp, tàu điện; nhân vật mới.
3. Sửa phù hiệu MiG-21; thêm B-52G; cao xạ 57/100 mm.
4. Sơ đồ bố trí trận địa thật (nếu có) → dời trận địa.
5. Cảnh trong xe điều khiển (nội thất) thay cho thẻ màn hình mô phỏng.
6. C12 "Hà Nội hôm nay": hiện là Hà Nội 1972 ban ngày + cờ — chưa có phố hiện đại.

## 8. Lưu ý phiên làm việc
Phiên này chỉ có quyền đọc repo `mrthangvt/vietsu` (không đẩy được nhánh): toàn bộ gói, công cụ, tài liệu được chép về máy anh trong `DienBienPhuTrenKhong1972/vietsu_dbpk1972/` (3 tệp zip: mã + địa hình + khí tài; âm thanh; nhân vật — giải nén thẳng vào gốc repo, đường dẫn giữ nguyên) để anh hoặc phiên sau đưa lên nhánh `claude/dien-bien-phu-tren-khong-1972` (tách từ `claude/sa-ban-khe-sanh-1968`, vì gói dùng `rieng.js` Khe Sanh V2.1 làm nền). Dữ liệu địa hình thô: `~/Downloads/dbpk1972_du-lieu-v2.json`.

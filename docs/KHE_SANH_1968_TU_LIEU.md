# Sa bàn Chiến dịch Đường 9 – Khe Sanh 1968 — tư liệu, kịch bản nháp, tài sản

Gói: `vietsu/static/khong-gian/packs/khe-sanh-1968/` · bộ máy 2.2.0 · nhánh `claude/sa-ban-khe-sanh-1968`.
Trạng thái (25/11/2026): **GĐ0 xong** (khung gói, tài sản tái dùng đã chép, `kiem_tra_goi.py` đạt) · **GĐ1 chờ anh duyệt**: bảng mốc (mục 2), đối chiếu kịch bản camera của anh (mục 3), đề xuất chia hồi (mục 4), tầng địa hình (mục 5), câu hỏi cần chốt (mục 8).
**Anh Thắng chốt (25/11/2026, 0h29):** 11 hồi (phương án B, ~13,5 phút) · sửa lời dẫn theo mục 3 · cờ Quân Giải phóng là **cờ đỏ sao vàng** (`props/co-qgp.png`), cờ Mỹ 50 sao (`props/co-my.png`) · em sửa mẫu lính Mỹ, PT-76 trong Blender; **anh tự làm B-52D** · em được chạy lệnh trên máy anh để lấy OSM, độ cao. Địa hình anh chưa chọn → làm theo đề xuất hai tầng (mục 5). Kịch bản 11 hồi: `story.json`, dựng bằng `vietsu/tools/sa_ban/voice/nhap_story_khe_sanh.py` (thời lượng ước theo số chữ, 824 s).
Nhãn bắt buộc: "Tái dựng mô phỏng". Mã nguồn `S…` (Việt Nam), `M…` (Mỹ) ở `sources.json`. Không đưa con số nào không có nguồn.

Kịch bản gốc của anh: `docs/du-lieu/khe-sanh-1968_camera_timeline_v1.json` (13 cảnh, 81 cú máy, 930 s, lời dẫn từng cảnh). `story.json` V0 chuyển nguyên từ tệp này, giữ thứ tự của anh; mọi đề xuất sửa nằm ở mục 3–4, chưa sửa vào lời dẫn.

Nguồn hiện là báo chí chính thống, niên giám TTXVN, Học viện Quốc phòng, và chuyên khảo của Cục Lịch sử TQLC Mỹ. Nên bổ sung sách: *Lịch sử Kháng chiến chống Mỹ cứu nước 1954–1975* tập 5 (Viện Lịch sử quân sự), *Chiến dịch tiến công Đường 9 – Khe Sanh xuân hè 1968* (Bộ Tổng Tham mưu), nếu anh có bản trong "Tài liệu sử".

## 1. Lực lượng hai bên
| Phe | Lực lượng | Chỉ huy | Nguồn |
|---|---|---|---|
| Quân Giải phóng (QĐND Việt Nam) | 4 sư đoàn bộ binh, 1 đoàn + 5 đại đội đặc công, 5 trung đoàn pháo binh, 3 trung đoàn cao xạ, 1 trung đoàn + 2 tiểu đoàn công binh, 4 đại đội xe tăng, 1 đội súng phun lửa. Sư đoàn nêu tên: 304, 325 (bao vây Khe Sanh), 320, 324 (Đường 9) | Tư lệnh Thiếu tướng Trần Quý Hai, Chính ủy Thiếu tướng Lê Quang Đạo | S3, S11, M1 |
| Mỹ | Trung đoàn 26 TQLC (Tiểu đoàn 1, 2, 3); Tiểu đoàn 1, Trung đoàn pháo 13 TQLC; tổng 6.806 quân (5.905 TQLC) | Đại tá David E. Lownds | M1, M5, M15, M25 |
| VNCH | Tiểu đoàn 37 Biệt động quân (trong căn cứ); Chiến đoàn 3 Dù (Pegasus) | — | M1, M2 |
| Làng Vây | VN: 4 đại đội biệt kích, thám báo quân đội Sài Gòn có cố vấn Mỹ. Mỹ: 24 lính Lực lượng Đặc biệt, ~500 dân vệ CIDG, ~350 lính Lào; Tiểu đoàn BV-33 Hoàng gia Lào (rút từ Bản Huội San) ở Làng Vây cũ | — | S1, M12, M24 (bách khoa, số người cần đối chiếu) |

Quân Mỹ ở các điểm cao (tháng 1/1968): 881 Nam (Đại đội I + 2 trung đội Đại đội M, Tiểu đoàn 3/26, có 3 khẩu 105 mm), 861 (Đại đội K), 861A (Đại đội E, Tiểu đoàn 2/26), 558 (Tiểu đoàn 2/26) (M5, M25). **881 Bắc không phải chốt của Mỹ trong thời gian vây**: ngày 20/1 Đại đội I còn đánh về phía 881 Bắc, và tới 14/4 TQLC mới đánh lên 881 Bắc (M5, M22).

Vũ khí nặng Quân Giải phóng: pháo 130 mm, 152 mm trên núi Co Roc (Lào, ~13 km tây nam căn cứ), cối 82/120 mm, rốc-két 122 mm (từ hướng 881 Bắc) (M12, M14, M16). Pháo 130 mm bắn xa gần gấp đôi pháo 155 mm của TQLC (M14).

## 2. Bảng mốc
| Thời điểm | Sự kiện | Đơn vị | Nguồn | Ghi chú, chỗ lệch |
|---|---|---|---|---|
| đêm 20/1/1968 | Chiến dịch mở màn, 10 ngày trước Tết; tiến công quận lỵ Hướng Hóa | các sư đoàn | S1, S3, S4 | |
| 20/1 | Đại đội I (3/26) đánh về phía 881 Bắc | TQLC | M5 | |
| 0h30 21/1 | Pháo kích, tiến công điểm cao 861 | | M7 | Nguồn Mỹ thống nhất ngày 21/1; giờ chính xác lệch nhau (0h30 theo M7, "rạng sáng" theo S7) → **đề xuất lời dẫn nói "đêm 20, rạng sáng 21/1"** như kịch bản anh |
| rạng sáng 21/1 | Pháo binh chiến dịch (Sư đoàn 304) bắn vào căn cứ, kho đạn 1.500 tấn nổ; hôm sau chỉ dùng được nửa đường băng | Sư đoàn 304 | S7, M7, M9 | M9: mất 98 % số đạn |
| 21 – 22/1 | Quân Mỹ rút khỏi quận lỵ Hướng Hóa (làng Khe Sanh) | | M15, M17 | |
| đêm 23 – 24/1 | Tiến công cụm cứ điểm Bản Huội San (Lào, sát biên giới); gần 400 quân rút về Làng Vây cũ | Trung đoàn 24, Sư đoàn 304; có PT-76 | S1, S17, M12, M13 | **Nguồn Mỹ: PT-76 được dùng lần đầu ở đây** (M13); nguồn VN gọi Làng Vây là "trận đầu đánh thắng" (S8). Xem mục 3, C05 |
| đêm 29 rạng 30/1 | Tổng tiến công Tết Mậu Thân nổ súng ở miền Trung, Tây Nguyên | | S16 | |
| đêm 30 rạng 31/1 | Nổ súng ở Sài Gòn (Đài phát thanh), Huế | | S16 | |
| 17h 6/2 | Pháo binh chiến dịch và Sư đoàn 304 bắn vào Làng Vây | | S2 | |
| 23h15 6/2 | Pháo chuyển làn vào trung tâm, các hướng mở cửa | Trung đoàn 24 (thiếu), Tiểu đoàn 3 (Trung đoàn 101, Sư đoàn 325), Tiểu đoàn xe tăng 198 | S2 | Một nguồn ghi bắt đầu 23h30 (blog, không dùng). Nguồn khác ghi tiểu đoàn bộ binh đi với Đại đội tăng 9 thuộc "Trung đoàn 1, Sư đoàn 325" (blog) — **dùng S2** |
| 0h50 7/2 | Phía Mỹ phát hiện xe tăng ở hàng rào | | M12 | |
| 3h 7/2 | Cơ bản làm chủ cứ điểm | | S8 | S9 ghi khoảng 4h; S10 "sau hai giờ" |
| 10h 7/2 | Hoàn toàn làm chủ Làng Vây | | S2 | **Chờ anh chốt:** đề xuất lời dẫn "rạng sáng 7/2 cơ bản làm chủ, đến 10 giờ hoàn toàn làm chủ" (S8 + S2, không mâu thuẫn) |
| — | Số xe: 16 PT-76 (VN) / ~12–14 (Mỹ) | Tiểu đoàn 198 (Đại đội 3, 9), Trung đoàn tăng 203 | S2, S8 / M12, M17 | Lời dẫn không cần nêu số. Xe số 555 (trưởng xe Lê Xuân Tấu) lập công; xe số 268 dựng làm tượng đài ở Làng Vây (S9, S10) |
| 8 hoặc 10/2 – 31/3 | Đợt 2: vây lấn Tà Cơn ~50 ngày đêm; quân Mỹ chiếm thêm điểm cao 550, 595, 573 | Sư đoàn 304 ở nam Tà Cơn, cắt Đường 9 | S1, S4, S5 | Ngày đầu đợt 2: 10/2 (S1, S5, S17) / 8/2 (Wikipedia tiếng Việt, Dân Việt) → **dùng 10/2** |
| 21/2 | Trận tiến công lớn cuối cùng vào chính căn cứ: tuyến Tiểu đoàn 37 BĐQ | | M17 | |
| 23/2 | Ngày pháo kích nặng nhất: 1.307 quả 130/152 mm, nổ thêm một kho đạn | | M1, S7 | |
| ~23/2 | Phía Mỹ thấy hệ thống hào vây lấn tiến sát căn cứ | | M21 | |
| 0h30 24/3 | Một trận tiến công trong vây lấn (Tiểu đoàn 3, Trung đoàn 9, Sư đoàn 304) | | S12 | chi tiết MINH HOẠ được |
| 21/1 – 8/4 | Niagara: mỗi ngày ~350 lượt cường kích, 60 B-52; B-52 tổng 2.548 lượt, 59.542 tấn; tổng Niagara 98.721 tấn | | M1, M9, M10 | Nguồn VN: riêng vây lấn Tà Cơn địch dùng ~100–110 nghìn tấn bom (S1, S17) — số khác cách tính |
| 21/1 – 8/4 | Không vận: trung bình 165 tấn mỗi ngày; C-130, C-123, trực thăng; thả dù | | M9, M6 | |
| 1/4 (7h) | Pegasus bắt đầu: 2 tiểu đoàn Trung đoàn 1 TQLC tiến từ Cà Lu theo Đường 9; Lữ đoàn 3 Kỵ binh bay đổ bộ | Sư đoàn 1 Kỵ binh bay, Sư đoàn 3 TQLC, Chiến đoàn 3 Dù | M2, M3, M4 | LZ Stud ở Cà Lu là bàn đạp |
| 1 – 2/4 | Dựng chốt Làng Khoai chặn Đường 9; 4 ngày đánh hai tiểu đoàn kỵ binh không vận | Tiểu đoàn 3, Trung đoàn 9, Sư đoàn 304 | S13 | |
| 1 – 30/4 | Đợt 3: đánh quân giải toả; giữ Làng Khoai, Cu Bốc, điểm cao 689, 622; mất một số trận địa phía nam, tây nam Tà Cơn | | S6 | |
| 8/4 | Tiểu đoàn 2, Trung đoàn Kỵ binh 7 tới căn cứ — Mỹ coi là kết thúc vây | | M4, M2 | M22 ghi 6/4 → **dùng 8/4** (nhiều nguồn hơn). "77 ngày" (M1) tính 21/1 – 8/4; M15 ghi 78 ngày |
| 11/4 | Đường 9 thông | | M2, M3 | |
| 15/4 | Pegasus kết thúc; Trung đoàn 1 TQLC thay Trung đoàn 26 | | M2, M4 | |
| 8/5 – 15/7 | Đợt 4: khôi phục thế vây lấn, đánh địch rút khỏi Khe Sanh | | S4, S17 | |
| 27/6 | Mỹ bắt đầu rút, phá căn cứ | | M8 | Một blog ghi 19/6 (không dùng) |
| 5/7 | Căn cứ Tà Cơn đã giải thể, tháo dỡ | | M8 | |
| 9/7 | Lá cờ chiến thắng tung bay trên sân bay Tà Cơn; Hướng Hóa giải phóng | | S14, S15 | Mỹ coi 9/7 là kết thúc trận (M6) |
| 15/7 | Chiến dịch Đường 9 – Khe Sanh kết thúc | | S1, S4 | **Lệch:** S15 (và VOV) ghi chiến dịch kết thúc 9/7. **Đề xuất:** lời dẫn nói "9/7 cờ tung bay trên Tà Cơn … 15/7 chiến dịch kết thúc" |

## 3. Đối chiếu kịch bản camera của anh (từng cảnh)
| Cảnh | Nhận xét | Đề xuất |
|---|---|---|
| C01 | Đúng ý. "Nối miền Đông với biên giới" dễ hiểu lầm | "nối đồng bằng ven biển (Đông Hà) với biên giới Việt – Lào" (M6) |
| C02 | **"Đồi 881 Bắc" không phải chốt của Mỹ** lúc bị vây (M5, M22). Chốt Mỹ: 881 Nam, 861, 861A, 558, 64 (M25, M23) | Thay "Đồi 881 Bắc" bằng "Đồi 861A"; 881 Bắc để ở C04/C06 như vị trí của Quân Giải phóng (nơi bắn rốc-két) |
| C03 | Đúng nguồn (S3, S4) | Có thể nêu tên Bộ Tư lệnh chiến dịch (S11) |
| C04 | Đúng: đêm 20 rạng 21/1, kho đạn (S7, M7) | Thêm một câu: cùng đêm tiến công quận lỵ Hướng Hóa (S3). Không nêu giờ |
| C05 | "Lần đầu tiên được sử dụng trong chiến đấu" — nguồn Mỹ ghi PT-76 đã ra trận ở Bản Huội San 23–24/1 (M13, M12). "Khoảng 10 giờ 7/2 làm chủ" đúng S2 nhưng lệch S8, S9 | Viết "trận đầu đánh thắng của bộ đội Tăng – Thiết giáp" (S8) thay "lần đầu tiên sử dụng"; giờ: xem bảng mốc 3h/10h |
| C06 | Đúng (S1, S4) | Có thể thêm "khoảng 50 ngày đêm" (S5) |
| C07 | Đúng (M1, M9). C-123 có nguồn (M9) | Không cần sửa |
| C08 | **Sai thứ tự thời gian:** Tết (30–31/1) xảy ra trước Làng Vây (7/2) và trước vây lấn, nhưng đang đứng sau C05–C07 | Đưa C08 lên ngay sau C04 (mục 4) |
| C09 | Cảnh cảm xúc, không có mốc — được, ghi MINH HOẠ | Giữ hoặc gộp vào C06 (mục 4) |
| C10 | Đúng (M2–M4). "Đầu tháng 4 nối liên lạc" | Nói rõ 8/4; thêm câu chốt Làng Khoai (S13) cho cân hai phía |
| C11 | Đúng nhưng chung chung, không có mốc | Gộp vào C12 hoặc thêm 14/4 TQLC đánh lên 881 Bắc (M22) / đợt 4 từ 8/5 (S17) |
| C12 | Đúng: rút cuối 6 – đầu 7 (M8), kết thúc giữa 7 (S1) | Thêm 9/7 cờ tung bay trên Tà Cơn (S14) |
| C13 | Đúng | Không cần sửa |

Cách gọi các phe trong lời dẫn của anh ("Quân Giải phóng", "quân đội Sài Gòn", "quân Mỹ") trung lập, giữ nguyên.

## 4. Đề xuất chia hồi
**Phương án A (giữ 13 hồi, chỉ đổi thứ tự — đề xuất):**
| Hồi | Cảnh của anh | Thời điểm | Tầng | Giây (theo kịch bản) |
|---|---|---|---|---|
| 1 | C01 Thung lũng Khe Sanh | 1968 | chiến dịch | 65 |
| 2 | C02 Những pháo đài trên Đường 9 | cuối 1967 | Tà Cơn | 70 |
| 3 | C03 Thế trận trước giờ nổ súng | cuối 1967 | chiến dịch | 70 |
| 4 | C04 21/1 Khe Sanh bùng cháy | 20–21/1 | Tà Cơn | 80 |
| 5 | **C08** Tết Mậu Thân — hai chiến trường | 30–31/1 | chiến dịch + thẻ bản đồ miền Nam | 70 |
| 6 | C05 Làng Vây – PT-76 | 6–7/2 | Tà Cơn | 100 |
| 7 | C06 Chiến hào siết chặt Tà Cơn | 10/2–31/3 | Tà Cơn | 80 |
| 8 | C07 Bầu trời: mưa bom và tiếp tế | 21/1–8/4 | Tà Cơn | 85 |
| 9 | C09 Cuộc chiến trong lòng đất | 2–3/1968 | Tà Cơn (cận) | 65 |
| 10 | C10 Pegasus | 1–15/4 | chiến dịch | 80 |
| 11 | C11 Chưa yên tiếng súng | 4–5/1968 | chiến dịch | 60 |
| 12 | C12 Quân Mỹ rời Tà Cơn | 27/6–15/7 | Tà Cơn | 65 |
| 13 | C13 Dấu ấn một chiến dịch | 1–7/1968 | chiến dịch | 40 |

**Phương án B (11 hồi, ~13,5 phút):** như A nhưng gộp C09 vào cuối C06 (cùng chiến hào, cùng tầng) và C11 vào đầu C12. Bớt hai lần đổi chủ đề, bớt 125 s.

Đổi tầng (tải lại trang) trong phương án A: 9 lần. Nếu anh chọn **một tầng** (mục 5), không phải tải lại.

## 5. Địa hình (GĐ2, đề xuất để anh chọn)
| Phương án | Tầng | Phạm vi | Ô lưới (1024) | Ưu, nhược |
|---|---|---|---|---|
| **Hai tầng (đề xuất)** | chiến dịch | Đường 9 từ Đông Hà tới Bản Huội San (Lào), gồm Cồn Tiên, Rockpile, Cà Lu, Co Roc; bán kính ~33 km | ~65 m | Kể được Pegasus từ Cà Lu, pháo Co Roc, Huội San, Tết (thẻ bản đồ). Phải đổi tầng 9 lần |
| | Tà Cơn | Căn cứ, đường băng, 881 Nam/Bắc, 861, 861A, 558, 64, núi Động Tri, làng Khe Sanh, Làng Vây; bán kính ~9 km | ~18 m | Đủ nét cho hào, bao cát, xe tăng ở Làng Vây |
| Một tầng | Khe Sanh – Cà Lu | Tâm giữa Tà Cơn và Cà Lu, bán kính ~18 km (từ Co Roc tới Cà Lu) | ~35 m | Không đổi tầng, nhẹ. Không có Đông Hà, Huội San; cận cảnh hào kém nét hơn |

Độ cao: Copernicus GLO-30, OSM (sông Rào Quán, Sê Pôn, Đường 9) lấy qua máy anh theo `docs/KHUNG_SA_BAN.md` mục 7. Đường 9 năm 1968 có thể khác QL9 hiện nay ở vài đoạn — đối chiếu ảnh chụp căn cứ (M6, Shore 1969) trước khi dựng. Đường Hồ Chí Minh nhánh Tây nằm dọc khu sân bay hiện nay (S15) — làm sau 1968, phải bỏ khi dựng.

## 6. Phe, cờ (quy tắc: một bảng phe, không để phe này mang cờ phe kia)
`pack.json › sides`: 0 Quân Giải phóng (QĐND Việt Nam) · 1 Quân đội Hoa Kỳ · 2 Quân lực VNCH.
- **Cờ Quân Giải phóng ở Khe Sanh 1968: chưa có nguồn.** Các bài chỉ nói "lá cờ chiến thắng" trên Tà Cơn 9/7 (S14, S15), không mô tả. Các đơn vị là sư đoàn chủ lực QĐNDVN (S3), khác Chiến dịch HCM 1975 (cờ Mặt trận). Cần anh chốt: cờ đỏ sao vàng, cờ "Quyết chiến quyết thắng", hay cờ khác — tốt nhất theo một ảnh tư liệu TTXVN.
- Cờ Mỹ (50 sao): chờ duyệt rồi vẽ. Cờ VNCH: dùng lại gói HCM.
- BV-33 Hoàng gia Lào, dân vệ CIDG ở Làng Vây: đề xuất không dựng riêng, chỉ ghi trong lời dẫn (tránh thêm phe thứ tư).

## 7. Tài sản
### 7.1 Đã chép từ gói HCM 1975 (gói tự đủ tệp)
| Tài sản | Tệp trong gói | Dùng cho |
|---|---|---|
| Bộ đội mũ tai bèo / đầu trần (đám đông, lưới thưa, bản cận có xương) | `units/linh-qgp-a|b(.nvz, -x.nvz, .jpg, -gan.glb)` | vây lấn, Làng Vây, Làng Khoai. **Cần xem lại quân phục 1968** (mũ cối/mũ tai bèo, ba lô) — chờ ảnh tư liệu anh duyệt |
| Lính lái tăng có xương | `units/linh-tang.glb` | kíp PT-76 |
| Lính VNCH | `units/linh-vnch(.nvz, -x.nvz, .jpg)` | Tiểu đoàn 37 BĐQ, Chiến đoàn 3 Dù (MINH HOẠ quân phục) |
| Xe tăng M48 | `props/xe/xe-tang-m48.glb` | xe tăng TQLC trong căn cứ (M20: có vài xe tăng); M48 đi cùng quân phản kích đồi 64 ngày 8/2 (M23) |
| Xe tải | `props/xe/xe-tai.glb` | vận tải Đường 9 (MINH HOẠ — chưa rõ loại xe) |
| C-130A, UH-1 | `props/may-bay/c-130a.glb`, `uh-1.glb` | tiếp tế, thương binh. Biến thể C-130 ở Khe Sanh chưa đối chiếu — mẫu C-130A ghi MINH HOẠ |
| Pháo M-46 130 mm | `props/phao/m-46-130mm.glb` | trận địa Co Roc (M12, M14) |
| Cao xạ 37 mm | `props/phao/cao-xa-37-2-nong.glb` | 3 trung đoàn cao xạ (S3). **Năm 1968 có thể là loại một nòng** — cần xác minh trước khi đặt |
| Cờ VNCH, tiếng động | `props/co-vnch.png`, `audio/*.mp3` (súng, nổ, pháo, xe tăng, gió, lửa) | |
| Mã `rieng.js` V1.9 | `rieng.js` (chép nguyên làm nền) | giữ giaoTranh, uNap, don, tranDia, banTao, LINH_XE, buiXe, MOC_NGAY, camCot, camVai, `__kiem`; thay biên đạo Sài Gòn ở GĐ3–4 |

**Không chép** (không có ở Khe Sanh 1968 theo nguồn đã đọc): T-54 (390, 843), K-63, M41, M113, A-37, AC-119K, D-74, dân Nam bộ, nhà phố, Dinh, tàu.

### 7.2 Tái dùng từ sa bàn khác trong repo (chép khi dựng cảnh, cần anh đồng ý)
| Mẫu | Ở đâu | Dùng cho |
|---|---|---|
| Bao cát công sự, dây thép gai, hố bom viền đất, tháp sắt quan sát, tháp nước thép | `thanh-co-quang-tri/models/static.glb` (BaoCat_CongSu, DayThepGai, HoBom_VienDat_GD5, ThapSat_QuanSat_GD5_SanGo, ThapNuoc_Thep) | căn cứ Tà Cơn, hố bom B-52 |
| Lựu pháo 105 mm M101, ụ pháo 105/155, hầm, hào, ụ cối, ụ bảo vệ máy bay | `dien-bien-phu/models/mau.glb` (Phao_M101_105), `static.glb` (Phao_105_TrungTam_155, Ung_*, Ham_*, Hao_Phap, UngCoi_*, U_BaoVe_MayBay) | trận địa pháo Tiểu đoàn 1/13 TQLC, 3 khẩu 105 trên 881 Nam (M5). Hầm, hào Pháp 1954 chỉ làm MINH HOẠ, phải sửa theo ảnh 1968 |
| Nhà sàn | `dien-bien-phu/models/static.glb` (NhaSan_Nho, NhaSan_Thai) | làng Bru – Vân Kiều quanh Khe Sanh (MINH HOẠ, cần ảnh nhà sàn Vân Kiều) |
| Xe tải GMC | `dien-bien-phu/models/static.glb` (XeTai_GMC) | xe trong căn cứ (MINH HOẠ, chưa đối chiếu loại xe TQLC dùng) |

### 7.3 Cần làm mới — hỏi anh trước khi dựng hay tải
Anh đã có mẫu thô Tripo trong `_KHO-CHUNG` cho ba thứ đầu (em đã xem ảnh, chưa mở FBX):
| Mẫu | Phe | Có trong nguồn | Tình trạng / việc | Ảnh tham chiếu đề xuất | Ưu tiên |
|---|---|---|---|---|---|
| **Lính thủy đánh bộ Mỹ** | Mỹ | M1, M5, M20 | **Đã sửa (25/11):** `nhan-vat/_moi/linh-my-ao-giap.fbx` — thêm áo giáp chống mảnh kiểu M1955 (phồng thân ~2 cm, tô ô liu sẫm, gân ngang ở vai, khoá kéo; MINH HOẠ) bằng `tools/sa_ban/nhan_vat_lai/them_ao_giap.py`. Mẫu 3D Tripo không có điếu thuốc, vòng tay (chỉ ảnh xem trước có). Súng M16 dính liền thân (đeo chéo) → động tác bắn cần súng rời ở tay như lính VNCH. **Còn:** gắn xương Mixamo (anh tải lên Mixamo, hoặc cho em dùng Chrome), nướng `.nvz` + bản cận | ảnh USMC trong M5, M6 (công khai) | 1 |
| **Xe tăng PT-76** | QGP | S2, S8, M12 | **Xong (25/11):** `props/xe/xe-tang-pt76.glb` 0,45 MB, 30 nghìn tam giác, số 555 hai bên tháp pháo (S9). Tỉ lệ theo bề rộng 3,15 m, cao ra 2,30 m (công bố 3,15 m; 2,255–2,325 m — PT-76, Wikipedia/inetres). Mẫu Tripo có vài khe hở trên nắp thân (giữ nguyên) | xe 268 tượng đài Làng Vây (S10), xe 555 (S9) | 1 |
| **B-52** | Mỹ | M1, M9, M18 | **Anh Thắng tự làm B-52D (25/11).** Bản cũ `vat-dung/_moi/MayBay-B52.zip` (+ .webp): **giống B-52H xám hiện đại**. Năm 1968 là **B-52D "Big Belly"**, mặt trên rằn ri Đông Nam Á, bụng đen bóng; B-52H không bay Arc Light (M18, M19). Cần sơn lại (và động cơ J57 thon hơn TF33 nếu làm kỹ) | ảnh NMUSAF (M19), M18 | 2 |
| Căn cứ Tà Cơn: đường băng tấm nhôm ~1.190 m, tháp điều khiển, hầm bao cát, lô cốt, hàng rào, kho đạn | Mỹ | M11, M20, S15 | Dựng bằng mã (dải đường băng, `uNap` bao cát) + vài GLB mới; ghép 7.2 | ảnh chụp từ trên cao trong M6 và Shore 1969 (UPI); C-130 và đường băng tái dựng tại di tích Tà Cơn | 1 |
| Các điểm cao | — | M5 | Từ DEM, không cần mẫu; ghim tên | — | 1 |
| Trực thăng vận tải CH-46 (TQLC, "Super Gaggle"), CH-47 (Kỵ binh bay, Pegasus) | Mỹ | M2, M6 | Làm mới | ảnh USMC / US Army | 2 |
| C-123 Provider | Mỹ | M9 | Làm mới (hoặc dùng C-130A, ghi MINH HOẠ) | NMUSAF | 3 |
| Pháo 155 mm M114 | Mỹ | M14 | Có thể dùng `Phao_105_TrungTam_155` của ĐBP nếu đúng loại | — | 3 |
| Pháo 152 mm (QGP, Co Roc) | QGP | M12, M16 | Làm mới hoặc dùng M-46 ghi MINH HOẠ | — | 3 |
| Cối 82/120 mm, giá rốc-két 122 mm | QGP | M12, M16 | Làm mới (nhỏ) | — | 3 |
| Xe Ontos M50 | Mỹ | M20 | Tuỳ chọn | — | 4 |
| Máy bay cường kích A-4 / F-4 | Mỹ | M1 (Niagara) | Tuỳ chọn; có thể chỉ dùng tiếng + vệt bom | — | 4 |

Mọi mẫu mới dựng trong Blender trên máy anh (MCP for Blender), không chạy việc nặng trong Blender anh đang mở; nướng bằng bpy làm thư viện như các gói trước.

## 8. Cần anh chốt trước GĐ2
1. Thứ tự, số hồi: phương án A (13 hồi, đưa Tết lên hồi 5) hay B (11 hồi)?
2. Sửa lời dẫn theo mục 3 (881 Bắc, "trận đầu đánh thắng", giờ Làng Vây, 8/4, 9/7 và 15/7)?
3. Giờ làm chủ Làng Vây: "rạng sáng cơ bản làm chủ, 10 giờ hoàn toàn làm chủ" (S8 + S2)?
4. Kết thúc chiến dịch: 15/7 (S1, S4) — kèm 9/7 cờ trên Tà Cơn?
5. Cờ Quân Giải phóng ở Khe Sanh 1968 (mục 6), cờ Mỹ.
6. Địa hình: hai tầng hay một tầng (mục 5)?
7. Mẫu mới: em sửa ba mẫu Tripo của anh (lính Mỹ thêm áo giáp, PT-76 số hiệu, B-52 sơn lại thành B-52D) hay anh làm lại trên Tripo? Ưu tiên mục 7.3 có đúng ý anh?
8. Lấy OSM, DEM qua máy anh cho GĐ2 (cần chạy `curl` trên máy anh).

## 9. Kiểm tra GĐ0 (25/11/2026)
- `kiem_tra_goi.py khe-sanh-1968`: hợp lệ; tải lần đầu 0,3 MB (chưa có địa hình), tải sau 11,0 MB.
- `soat_chu_thich.py rieng.js`: không có chú thích `//` nuốt mã.
- `quet_phim.py`: **chưa chạy được** — chưa có địa hình và cảnh dựng (GĐ2–4).
- Đối chiếu `KHUNG_SA_BAN.md` §10: chưa áp dụng (chưa có mã cảnh mới); `rieng.js` nền là bản V1.9 đã qua soát.

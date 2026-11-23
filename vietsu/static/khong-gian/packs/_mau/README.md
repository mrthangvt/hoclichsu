# Gói mẫu sa bàn (`_mau`)

Sao chép thư mục này thành `packs/<id-goi>/` khi bắt đầu một trận mới, rồi làm theo 6 bước trong `docs/KHUNG_SA_BAN.md` mục 6.
Gói tham chiếu đầy đủ: `packs/ngoc-hoi-dong-da/`.

| Tệp | Nội dung | Ai làm |
|---|---|---|
| `pack.json` | khai báo gói: tên, phe, loại quân, góc nhìn, âm nền theo cảnh, hiệu ứng | Claude |
| `story.json` | kịch bản: cảnh, góc máy (`keys`), lời bình (`vo`), mũi tên (`arrows`, `states`) | Claude, anh duyệt |
| `placement.json` | nhóm quân: loại, vị trí, đường đi, động tác theo cảnh | Claude (script `build_quan*.py`) |
| `terrain/` | `dia-hinh.json` (meta, sông, đường, mốc, làng, vật thể), `h_main.png` (cao độ 16 bit), `tex_main.jpg` | Claude, dữ liệu OSM + DEM lấy qua máy anh |
| `units/` | nhân vật nướng sẵn `.nvz` (`tools/sa_ban/nv_sang_nvz.py`), ảnh màu `.jpg`, nhân vật chính `.glb` nén meshopt | Claude + Blender |
| `props/` | cờ từng phe, mô hình vật dụng `.glb` | Claude + Blender |
| `audio/` | `voice.mp3` (lời dẫn), âm nền | anh + Claude |
| `sources.json` | nguồn tư liệu, giấy phép dữ liệu, mức độ phục dựng | Claude |

Quy tắc bắt buộc:
- Mỗi loại quân trong `units` phải có `side`; cờ, huy hiệu lấy theo phe — không để phe này mang cờ phe kia.
- Cảnh giao chiến chỉ dùng quân chính quy; dân binh làm hậu cần.
- Mốc thời gian trong `fx`, `campFlags`, `crossMarks` viết dạng *chỉ số cảnh + tiến độ* (8.2 = cảnh thứ 9, đã chạy 20%).

Kiểm tra trước khi mở PR: `python3 vietsu/tools/sa_ban/kiem_tra_goi.py <id-goi>`.
Xem thử: `khong-gian/engine/1.0.0/sa-ban.html?goi=<id-goi>`.

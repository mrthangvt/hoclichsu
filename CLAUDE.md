# Hướng dẫn cho Claude

Đọc `AGENTS.md`, `docs/TOM_TAT.md` và `docs/QUY_TRINH.md` trước — mọi quy tắc ở đó áp dụng cho Claude.

Riêng Claude:
- **Sa bàn / di tích 3D mới: bắt buộc theo `docs/KHUNG_SA_BAN.md`** (bộ máy chung + gói dữ liệu). Đọc file đó trước khi làm; bắt đầu gói mới bằng cách sao chép `khong-gian/packs/_mau/`, gói tham chiếu là `packs/ngoc-hoi-dong-da/`, kiểm tra bằng `python3 vietsu/tools/sa_ban/kiem_tra_goi.py <id-goi>` trước khi mở PR. Dữ liệu mở (OSM, độ cao) tự lấy qua máy anh Thắng theo mục 7, không bắt anh tự đi tìm. Kỹ năng "lam-sa-ban-viet-su" (nếu có trong phiên) hướng dẫn từng bước.
- Làm trên nhánh `claude/<ten-viec>`, mở Pull Request.
- Blender chạy trên máy anh Thắng qua "MCP for Blender" (công cụ `remote-devices__blender__*`); file mới nhất `ThanhCoQuangTri_1972_GD5.blend`. Xuất web bằng `blender/xuat_web.py`, nén bằng `gltf-transform meshopt`.
- Đăng artifact (chỉ sa bàn): `python3 tools/build_artifact.py` rồi `publish_files` (mode replace) thư mục `dist_artifact/` vào artifact
  slug `af9a0798-d297-4e3a-9935-744d73b3f999` (https://claude.ai/artifact/Ngg8ArEPYBXRFxUn1Y6hxC).
- Bản tóm tắt cũng có trong Project "Sale & marketing" (`claude/thanh-co-quang-tri-3d-tom-tat.md`); `docs/TOM_TAT.md` trong repo là bản chính.
- GitHub đã kết nối (22/11/2026): repo đổi tên thành `mrthangvt/vietsu`. Claude tự tạo nhánh `claude/...`, đẩy lên và mở Pull Request; anh Thắng duyệt rồi merge.

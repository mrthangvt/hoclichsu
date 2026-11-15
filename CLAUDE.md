# Hướng dẫn cho Claude

Đọc `AGENTS.md`, `docs/TOM_TAT.md` và `docs/QUY_TRINH.md` trước — mọi quy tắc ở đó áp dụng cho Claude.

Riêng Claude:
- Làm trên nhánh `claude/<ten-viec>`, mở Pull Request.
- Blender chạy trên máy anh Thắng qua "MCP for Blender" (công cụ `remote-devices__blender__*`); file mới nhất `ThanhCoQuangTri_1972_GD5.blend`. Xuất web bằng `blender/xuat_web.py`, nén bằng `gltf-transform meshopt`.
- Đăng artifact: `python3 tools/build_artifact.py` rồi `publish_files` thư mục `dist_artifact/` vào artifact
  slug `af9a0798-d297-4e3a-9935-744d73b3f999` (https://claude.ai/artifact/Ngg8ArEPYBXRFxUn1Y6hxC).
- Bản tóm tắt cũng có trong Project "Sale & marketing" (`claude/thanh-co-quang-tri-3d-tom-tat.md`); `docs/TOM_TAT.md` trong repo là bản chính.

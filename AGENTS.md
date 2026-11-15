# Hướng dẫn cho AI (ChatGPT / Codex và các agent khác)

Dự án: website học lịch sử **Việt Sử V4.1** (`vietsu/`, Python FastAPI) và các sa bàn 3D trong mục "Không gian lịch sử", trước hết là **Thành cổ Quảng Trị 1972** (`vietsu/static/khong-gian/thanh-co-quang-tri/`, three.js).
Làm việc chung với Claude qua repo này.

**Đọc trước khi làm:**
1. `docs/TOM_TAT.md` — trạng thái dự án, kịch bản sa bàn, quy ước toạ độ, tên clip, các việc còn lại.
2. `docs/QUY_TRINH.md` — quy trình nhánh / Pull Request, chia việc.

**Quy tắc bắt buộc**
- Làm trên nhánh `gpt/<ten-viec>`, mở Pull Request, không đẩy thẳng lên `main`.
- Không sửa file trong `vietsu/static/khong-gian/thanh-co-quang-tri/models/` bằng tay (đó là GLB xuất từ Blender).
- Giữ three.js đúng phiên bản 0.160 (importmap trong `vietsu/static/khong-gian/thanh-co-quang-tri/index.html`; three.js đã tự host trong `vendor/three/`).
- Toạ độ dữ liệu là của Blender; đổi sang three bằng `B(x,y,z) → (x, z, -y)`.
- Nội dung lịch sử phải trung lập, có nhãn "Tái dựng mô phỏng"; không bịa số liệu, ngày tháng.
- Viết chú thích code và nội dung hiển thị bằng tiếng Việt.
- Cập nhật `docs/TOM_TAT.md` trong cùng PR khi thay đổi trạng thái dự án.

**Chạy thử:** website đầy đủ `cd vietsu && bash start_local.command` → http://127.0.0.1:8000 · chỉ sa bàn: `cd vietsu/static/khong-gian/thanh-co-quang-tri && python3 -m http.server 8000`

**Bảo mật:** không commit `vietsu/.env`, `vietsu/data/*.sqlite3`, `vietsu/static/uploads/`. Không đưa khoá API, mã quản trị vào code hay tài liệu.

**Giao diện Việt Sử:** trang chủ phục vụ `vietsu/static/Viet_Su_Timeline_V4.1_Offline.html`. Sửa nhỏ thì sửa thẳng file đó và ghi vào `vietsu/frontend/` để bản build sau giữ được (ví dụ `frontend/khong-gian-3d.js` gắn nút "Vào sa bàn 3D").

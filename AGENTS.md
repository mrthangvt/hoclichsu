# Hướng dẫn cho AI (ChatGPT / Codex và các agent khác)

Dự án: sa bàn 3D web **Thành cổ Quảng Trị 1972** cho mục "Không gian lịch sử" của site Việt Sử.
Làm việc chung với Claude qua repo này.

**Đọc trước khi làm:**
1. `docs/TOM_TAT.md` — trạng thái dự án, kịch bản sa bàn, quy ước toạ độ, tên clip, các việc còn lại.
2. `docs/QUY_TRINH.md` — quy trình nhánh / Pull Request, chia việc.

**Quy tắc bắt buộc**
- Làm trên nhánh `gpt/<ten-viec>`, mở Pull Request, không đẩy thẳng lên `main`.
- Không sửa file trong `web/models/` bằng tay (đó là GLB xuất từ Blender).
- Giữ three.js đúng phiên bản 0.160 (importmap trong `web/index.html`).
- Toạ độ dữ liệu là của Blender; đổi sang three bằng `B(x,y,z) → (x, z, -y)`.
- Nội dung lịch sử phải trung lập, có nhãn "Tái dựng mô phỏng"; không bịa số liệu, ngày tháng.
- Viết chú thích code và nội dung hiển thị bằng tiếng Việt.
- Cập nhật `docs/TOM_TAT.md` trong cùng PR khi thay đổi trạng thái dự án.

**Chạy thử:** `cd web && python3 -m http.server 8000` → http://localhost:8000

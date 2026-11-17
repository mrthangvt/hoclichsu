# Hướng dẫn cho AI (ChatGPT / Codex và các agent khác)

Dự án: website học lịch sử **Việt Sử V4.1** (`vietsu/`, Python FastAPI) và các sa bàn 3D trong mục "Không gian lịch sử", trước hết là **Thành cổ Quảng Trị 1972** (`vietsu/static/khong-gian/thanh-co-quang-tri/`, three.js).
Làm việc chung với Claude qua repo này.

**Đọc trước khi làm:**
1. `docs/TOM_TAT.md` — trạng thái dự án, kịch bản sa bàn, quy ước toạ độ, tên clip, các việc còn lại.
2. `docs/QUY_TRINH.md` — quy trình nhánh / Pull Request, chia việc.

**KHÓA GIAO DIỆN VIỆT SỬ — CHỈ CHỦ DỰ ÁN ĐƯỢC YÊU CẦU MỞ KHÓA (17/11/2026)**
- Giao diện V4.6 là **chuẩn cố định**: KHÔNG tự đổi bố cục/trật tự khối, menu, tab, Timeline, Popup, font, màu, responsive, icon, ảnh hay hiệu ứng. Không tạo demo mới có giao diện khác rồi trình bày như bản nâng cấp.
- Với V4.7, V4.8 và các phiên bản tiếp theo, thay đổi dữ liệu/API/CMS là được; thay đổi UI phải có **yêu cầu cụ thể của chủ dự án**. Nếu một chức năng mới chưa có vị trí hiển thị được duyệt, giữ ở backend và báo rõ, tuyệt đối không tự chèn panel/tab.
- `vietsu/tools/build_v47.py` phải sao chép HTML V4.6 **byte-for-byte** và kiểm tra SHA-256; CI kiểm tra quy tắc. Bản offline độc lập khác layout V4.6 đã bị gỡ.
- Nếu cần cập nhật giao diện theo yêu cầu, đối chiếu trước/sau trên desktop & mobile và xác nhận thay đổi có chủ đích. Xem `docs/CHANGELOG_V4.7.md`.

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

**Giao diện Việt Sử:** V4.1 là nền dữ liệu lịch sử, các bản V4.2–V4.6 là các lớp giao diện kế thừa. Từ 17/11/2026, **V4.6 là mốc khóa giao diện**. Không chỉnh file HTML/CSS/JS hiển thị nếu anh chưa yêu cầu.

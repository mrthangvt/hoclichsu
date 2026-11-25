# Quy trình làm việc chung (Claude + ChatGPT + anh Thắng)

Repo này là **bản gốc duy nhất** của mã nguồn web. Artifact Claude và GitHub Pages chỉ là bản được dựng ra từ repo.

## Nguyên tắc
1. **Luôn bắt đầu từ `main` mới nhất**: `git pull origin main` trước khi làm bất cứ việc gì.
2. **Mỗi việc một nhánh**, đặt tên theo người làm:
   - Claude: `claude/<viec>` (ví dụ `claude/vat-lieu`)
   - ChatGPT: `gpt/<viec>` (ví dụ `gpt/am-thanh`)
3. **Không đẩy thẳng lên `main`.** Mở Pull Request, anh Thắng xem rồi merge.
4. **PR nhỏ, một chủ đề.** Ghi rõ trong mô tả PR: đã đổi gì, đã thử ra sao, còn thiếu gì.
5. **Cập nhật `docs/TOM_TAT.md`** trong cùng PR nếu thay đổi trạng thái dự án, toạ độ, tên clip, kịch bản…
6. **Chia vùng file để tránh xung đột.** Trước khi sửa một file đang có PR mở của bên kia, đọc PR đó trước.

## Ai thường làm phần nào (có thể đổi)
`<SA_BAN>` = `vietsu/static/khong-gian/thanh-co-quang-tri`

| Phần | File | Gợi ý |
|---|---|---|
| Mô hình, vật liệu, xuất GLB từ Blender | `blender/`, `<SA_BAN>/models/`, `<SA_BAN>/data/rai.json` | Claude (có kết nối Blender MCP trên máy anh) |
| Logic web, nhân vật, hiệu ứng, âm thanh | `<SA_BAN>/js/app.js` | Bên nào nhận việc thì ghi vào PR |
| Website Học Lịch Sử (FastAPI, CMS, SGK, giao diện dòng thời gian) | `vietsu/` (trừ `static/khong-gian/`) | Bên nào nhận việc thì ghi vào PR |
| Giao diện, chữ, chú thích lịch sử của sa bàn | `<SA_BAN>/index.html`, `<SA_BAN>/css/style.css`, phần `INFO` trong `app.js` | Bên nào nhận việc thì ghi vào PR |

## Xem kết quả
- **Website Học Lịch Sử đầy đủ trên Mac** (CMS, API, SGK, sa bàn): `cd vietsu && bash start_local.command` → http://127.0.0.1:8000 (sa bàn: http://127.0.0.1:8000/khong-gian/thanh-co-quang-tri/). Hướng dẫn: `vietsu/HUONG_DAN_LOCAL_MAC.md`.
- **Chỉ sa bàn**: `cd vietsu/static/khong-gian/thanh-co-quang-tri && python3 -m http.server 8000`.
- **GitHub Pages** (bản tĩnh, tự cập nhật sau khi merge vào `main`): trang chủ là giao diện Học Lịch Sử V4.1 (không có CMS/API), sa bàn ở `/khong-gian/thanh-co-quang-tri/`. Bật một lần: Settings → Pages → Source: "GitHub Actions".
- **Artifact Claude** (chỉ sa bàn): `python3 tools/build_artifact.py` rồi Claude đăng thư mục `dist_artifact/`.

## Tài nguyên nặng và dữ liệu riêng
- KHÔNG đưa lên repo: `vietsu/.env` (mã quản trị, khóa API), `vietsu/data/vietsucms.sqlite3` (dữ liệu CMS), `vietsu/static/uploads/`, `vietsu/.venv/`. Đã chặn trong `.gitignore`. Sao lưu dữ liệu bằng `vietsu/sao_luu_local.command`.
- File `.blend` không đưa lên repo (nằm ở ổ xMABUx, xem `docs/TOM_TAT.md`).
- GLB đã nén meshopt, mỗi file < 10 MB, để thẳng trong `<SA_BAN>/models/`. Nếu sau này file > 50 MB thì chuyển sang Git LFS.

## Sa bàn và di tích 3D mới
Làm theo `docs/KHUNG_SA_BAN.md`: mỗi trận một gói trong `vietsu/static/khong-gian/packs/<id-goi>/`, nhánh `claude/<id-goi>` hoặc `gpt/<id-goi>`, thêm vào `catalog.json` trong cùng PR, chạy kiểm tra gói trước khi mở PR.

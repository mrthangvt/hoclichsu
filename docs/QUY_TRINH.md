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
| Phần | File | Gợi ý |
|---|---|---|
| Mô hình, vật liệu, xuất GLB từ Blender | `blender/`, `web/models/`, `web/data/rai.json` | Claude (có kết nối Blender MCP trên máy anh) |
| Logic web, nhân vật, hiệu ứng, âm thanh | `web/js/app.js` | Bên nào nhận việc thì ghi vào PR |
| Giao diện, chữ, chú thích lịch sử | `web/index.html`, `web/css/style.css`, phần `INFO` trong `app.js` | Bên nào nhận việc thì ghi vào PR |

## Xem kết quả
- **GitHub Pages** (tự cập nhật sau mỗi lần merge vào `main`): bật một lần ở Settings → Pages → Source: "GitHub Actions".
- **Chạy trên máy**: `cd web && python3 -m http.server 8000` rồi mở http://localhost:8000
- **Artifact Claude**: `python3 tools/build_artifact.py` rồi Claude đăng thư mục `dist_artifact/`.

## Tài nguyên nặng
- File `.blend` không đưa lên repo (nằm ở ổ xMABUx, xem `docs/TOM_TAT.md`).
- GLB đã nén meshopt, mỗi file < 10 MB, để thẳng trong `web/models/`. Nếu sau này file > 50 MB thì chuyển sang Git LFS.

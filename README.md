# Học lịch sử — Học Lịch Sử V4.1 + sa bàn 3D Thành cổ Quảng Trị 1972

Website học lịch sử **Học Lịch Sử** (dòng thời gian Việt Nam – Trung Quốc – Phương Tây, hồ sơ nhân vật, Sách giáo khoa Lịch sử lớp 6–12, Không gian lịch sử) cùng các **sa bàn 3D** trong mục Không gian lịch sử. Nội dung tái dựng mô phỏng, cần đối chiếu tư liệu.

```
vietsu/                                   website Học Lịch Sử V4.1 (Python FastAPI + SQLite, CMS /admin)
vietsu/static/khong-gian/thanh-co-quang-tri/   sa bàn 3D Thành cổ Quảng Trị (three.js) → /khong-gian/thanh-co-quang-tri/
blender/                                  script xuất mô hình 3D từ Blender
tools/                                    công cụ đóng gói (artifact Claude)
docs/                                     tài liệu dự án và quy trình làm việc chung
```

- **Chạy trên Mac:** `cd vietsu && bash start_local.command` → http://127.0.0.1:8000 · CMS: http://127.0.0.1:8000/admin
- **VPS (aaPanel):** xem `vietsu/README_V3.8.md` mục Cài đặt và `vietsu/deploy/`.
- **Bản xem thử online:** GitHub Pages (tự cập nhật sau mỗi lần merge vào `main`).
- **Tài liệu:** [`docs/TOM_TAT.md`](docs/TOM_TAT.md) · [`docs/QUY_TRINH.md`](docs/QUY_TRINH.md) · [`vietsu/README_V4.1.md`](vietsu/README_V4.1.md)
- **Cho AI:** [`AGENTS.md`](AGENTS.md) (ChatGPT/Codex) · [`CLAUDE.md`](CLAUDE.md) (Claude)

Không đưa `.env`, cơ sở dữ liệu `vietsu/data/vietsucms.sqlite3` và ảnh tải lên lên GitHub (repo đang công khai).

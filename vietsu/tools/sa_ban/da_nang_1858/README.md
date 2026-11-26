# Mã nguồn sa bàn Đà Nẵng 1858 (trang độc lập)

Trang chạy: `vietsu/static/khong-gian/tran-da-nang-1858/` (three.js 0.160 tự chứa trong `vendor/three/`).
Đây là trang độc lập, **chưa chuyển sang bộ máy chung** (`docs/KHUNG_SA_BAN.md`) — giống `rach-gam-xoai-mut/` trước khi chuyển.

- `src/*.js`: mã trang, ghép theo thứ tự tên tệp thành `app.js` (`xay.sh`: `cat src/0*.js src/10_chay.js > app.js`).
  Kiểm tra cú pháp phải chạy dạng module: chép sang `.mjs` rồi `node --check`.
- `dung_story.py`: dựng `story.json` (12 hồi, 60 cú máy) theo voice; `can_voice.py`, `asr.py`: căn lời dẫn.
- `dia_hinh*.py`, `vitri.py`, `to_mau12.py`: địa hình, ảnh màu, vị trí.
- `nuong_xuong.py` (Blender bpy): nướng nhân vật có xương ra `nv/x_<tên>.json`; `nuong_ntp.py` (Nguyễn Tri Phương), `nuong_ngua.py`, `nuong_phao.py`, `nuong_tau.py`.
- `do_buoc.py`: đo tốc độ bàn chân trụ từ khung nướng → `src/04y_buoc.js` (chống lính "trôi").
- `chup_*.py`, `dbg_eval.py`: chụp kiểm tra bằng Chrome headless.

Đường dẫn trong các script trỏ tới thư mục làm việc của phiên Claude (`/home/claude/v13`) và kho `_KHO-CHUNG` trên máy anh Thắng; sửa lại khi chạy chỗ khác.
Ghi chép từng bản: Project "Dự án làm sa bàn" › `sa-ban-tran-da-nang-1858-v*.md`.

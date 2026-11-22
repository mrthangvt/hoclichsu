# Sa bàn Ngọc Hồi – Đống Đa 1789 (bản V10.7, 22/11/2026)

> Tái dựng mô phỏng, chưa thẩm định sử học. Mật độ quân là minh hoạ, không phải quân số sử liệu.

- **Trang web (chạy độc lập):** `vietsu/static/khong-gian/ngoc-hoi-dong-da/`. Chạy thử: `cd vietsu/static/khong-gian/ngoc-hoi-dong-da && python3 -m http.server 8000`.
- **Bản xem nhanh:** artifact trên claude.ai (https://claude.ai/artifact/6Yr3y2XXAiKuZnkK2bfdXB).
- **Chưa gắn vào giao diện Việt Sử:** giao diện V4.6 đang khóa, nên nút vào sa bàn trong mục "Không gian lịch sử" chờ chủ dự án yêu cầu cụ thể.
- three.js 0.160 qua importmap (CDN jsDelivr), giống các sa bàn khác.

## Nội dung chính
- 14 cảnh C01–C14, phim tự động theo **voice thu âm** (`voice_ngochoi.mp3`, 13:45) làm đồng hồ; phụ đề theo câu đọc.
- Chế độ: Phim tự động · Khám phá (đi bộ trên sa bàn) · Góc nhìn nhân vật (nhìn qua mắt nhân vật hoặc đứng tại địa điểm).
- Nhân vật: lính Tây Sơn, lính Thanh, Tôn Sĩ Nghị, Sầm Nghi Đống, Quang Trung (mẫu Tripo, gắn xương Mixamo), voi, ngựa (gắn xương trong Blender). Động tác nướng thành chuỗi khung hình (`nv_*.json`).
- Nút "▶ Bắt đầu xem": điện thoại chỉ cho phát tiếng sau một lần chạm.

## Tệp
| Thư mục | Nội dung |
|---|---|
| `vietsu/static/khong-gian/ngoc-hoi-dong-da/` | trang đã dựng: `index.html`, `story.json` (cảnh, máy quay, phụ đề), `quan.json` (đội hình), `sa_ban_data.json` (địa hình, nhà, cây, lều…), `nv_*.json` (nhân vật), `am/` (âm nền), `voice_ngochoi.mp3` |
| `docs/ngoc-hoi-dong-da/nguon/` | mã nguồn dựng trang (Python + JS) |
| `docs/ngoc-hoi-dong-da/HANDOFF.md` | nhật ký kỹ thuật từng phiên bản V6 → V10.7 |
| `docs/ngoc-hoi-dong-da/KHOI_DONG.md` | ghi chép khởi động dự án (19/11/2026) |

## Dựng lại trang
Các script trong `nguon/` ghi ra thư mục `../web10` (bố cục làm việc cũ). Để dựng lại trong repo: sao `vietsu/static/khong-gian/ngoc-hoi-dong-da/` thành `docs/ngoc-hoi-dong-da/web10/` rồi chạy trong `nguon/`:

```
python3 can_nhdd.py        # căn voice (cần asr.json từ NgocHoiDongDa/voice/ trên máy anh Thắng)
python3 build_quan10.py    # đội hình → quan.json
python3 build_camera10.py  # máy quay → story.json
python3 apply_voice.py     # nắn thời gian theo voice, phụ đề
python3 build_v10.py       # ghép index.html
```

Nhân vật (`nv_*.json`) nướng trong Blender bằng `NgocHoiDongDa/web_v10/bake10_blender.py` (trên máy anh Thắng, không nằm trong repo). File `.blend`, FBX, mô hình nhận dạng giọng nói để ngoài repo.

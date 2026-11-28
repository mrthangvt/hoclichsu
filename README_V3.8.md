# VIỆT SỬ V3.8 — Hướng dẫn

## 1. Có gì mới so với V3.7

| Hạng mục | V3.7 | V3.8 |
|---|---|---|
| Font chữ | CSS ghi “Be Vietnam Pro” nhưng **không tải font** → máy người xem hiện font hệ thống | Tự host Be Vietnam Pro (300–900, có tiếng Việt), bản offline nhúng sẵn font |
| Trang chủ | 1 file HTML 7,3 MB (ảnh base64), gzip vẫn 4,9 MB, đọc lại ổ đĩa mỗi lượt | HTML 173 KB (gzip ≈ 46 KB), ảnh tách file WebP, JS tách file cache 1 năm |
| Menu Sách giáo khoa | Dữ liệu cứng trong HTML, không sửa được | CMS trong `/admin`: soạn, lưu nháp, xuất bản, lịch sử phiên bản, ảnh, nhập/xuất JSON |
| Trang SEO bài học | Không có | `/sach-giao-khoa`, `/sach-giao-khoa/lop-7`, `/sach-giao-khoa/lop-7/ten-bai` + sitemap |
| Quảng cáo | Không có | 10 vị trí AdSense chừa sẵn, bật/tắt và nhập mã slot trong `/admin`, tự tạo `/ads.txt` |
| Bảo mật | Xem mục 2 | Đã vá |

## 2. Lỗi bảo mật & lỗi hiển thị đã vá

**Backend**
- So sánh mã quản trị bằng `==` (lộ thời gian) → `hmac.compare_digest`; mã phải ≥ 24 ký tự.
- Không giới hạn dò mã → khóa IP 15 phút sau 10 lần sai; giới hạn 240 request API/phút/IP; AI 10 lượt/giờ.
- Không có header bảo mật → thêm CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS (khi https).
- `/docs`, `/openapi.json` công khai → tắt mặc định.
- URL ảnh/logo chỉ kiểm tra tiền tố `https://` → có thể chèn dấu `"` phá thuộc tính HTML (XSS) → kiểm tra URL chặt, lọc cả dữ liệu cũ khi trả ra.
- Trường bài viết không giới hạn độ dài, `source_urls` không kiểm tra khi tạo/sửa, `reviewer_name` không lọc → đã giới hạn & kiểm tra.
- Ghi JSON không nguyên tử (`period_costumes.json`) và không khóa → ghi file tạm + khóa luồng.
- Trang quản trị chèn tên địa điểm/nhân vật bằng `innerHTML` không escape → đã escape.
- Leaflet tải từ unpkg không có SRI → bản online tự host `/static/vendor/leaflet/`, bản offline thêm `integrity`.
- Ảnh SVG/ảnh upload được phục vụ kèm CSP `sandbox`; không nhận SVG khi upload.
- Không giới hạn kích thước request → 8 MB.

**Giao diện** (đã kiểm tra 1440, 1024, 768, 390, 360 px)
- Năm “2879 TCN” trên trục giữa tràn đè lên thẻ ở điện thoại → tự xuống dòng, cỡ chữ theo màn hình.
- Ảnh đại diện triều đại đè lên tên (“Âu Lạc · An Dương Vương”) → ảnh lên góc phải, chữ chừa chỗ.
- Nhân vật “Sứ giả hỗ trợ” che nội dung, che cả cửa sổ bài học → thu nhỏ trên mobile, tự ẩn khi mở cửa sổ.
- Sidebar desktop bị cắt chữ khi màn hình thấp → cuộn được.
- Chặn tràn ngang toàn trang; bảng/đoạn mã dài cuộn trong khung.

## 3. Cài đặt

### Chạy thử trên máy
```bash
cp .env.example .env          # điền 2 mã, SITE_URL=http://127.0.0.1:8000
./start.sh                    # lần đầu tự tạo .venv và cài thư viện
# mở http://127.0.0.1:8000  và  http://127.0.0.1:8000/admin
```

### VPS (aaPanel)
1. Tải thư mục lên `/www/wwwroot/vietsu` (giữ nguyên thư mục `data/` cũ nếu đã có nội dung — xem mục 7).
2. Tạo file `.env` từ `.env.example`, điền mã ngẫu nhiên (`python3 -c "import secrets;print(secrets.token_urlsafe(32))"`) và `SITE_URL=https://ten-mien`.
3. aaPanel → **Website → Python Project → Add**: thư mục `/www/wwwroot/vietsu`, framework *Python*, lệnh chạy  
   `uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1 --proxy-headers --forwarded-allow-ips=127.0.0.1`  
   (hoặc dùng `deploy/vietsu.service` với systemd).
4. Website → tên miền → bật SSL + Force HTTPS → dán nội dung `deploy/nginx-vietsu.conf` vào Config.
5. Kiểm tra: `https://ten-mien/api/health` trả `"version":"3.8.0"`.

> Phải giữ `--proxy-headers` và Nginx gửi `X-Real-IP`. Nếu thiếu, mọi người dùng bị tính chung một IP → giới hạn tần suất áp lên cả website.

## 4. Cập nhật bài Sách giáo khoa (không cần sửa code)

1. Vào `/admin` → nhập mã → menu **Sách giáo khoa**.
2. Chọn lớp → chọn bài (hoặc **+ Bài mới**). Bài gốc đã có sẵn 233 đề cương lớp 6–12.
3. Soạn: tóm tắt, ảnh bìa (tải ảnh lên trực tiếp), nội dung (thanh công cụ định dạng + **Xem trước**), ý chính, câu hỏi ôn tập, nguồn (`Tên | https://…`), SEO.
4. **Lưu nháp** (Ctrl+S) — chưa hiện lên web. **Xuất bản** cần mã thẩm định.
   - Nội dung ≥ 150 ký tự + có ít nhất 1 nguồn → bài hiện nhãn “Đã có bài học”, mở bài đầy đủ trong menu và có trang SEO riêng.
   - Chỉ sửa tóm tắt/tên → cập nhật đề cương.
5. **Lịch sử phiên bản**: khôi phục bất kỳ bản cũ (giữ 50 bản/bài). **Gỡ xuất bản** đưa bài về đề cương.
6. Nhập nhiều bài cùng lúc: *Nhập / xuất hàng loạt (JSON)* — mẫu ở `Mau_nhap_bai_sgk.json`.

Định dạng nội dung: `## Tiêu đề`, `**đậm**`, `*nghiêng*`, `- danh sách`, `1. danh sách`, `> trích dẫn`, `[chữ](https://…)`, `![mô tả](https://…)`. HTML gõ vào bị vô hiệu hóa (chống XSS).

## 5. Gắn quảng cáo AdSense

1. Website chạy tên miền thật + HTTPS, đã có một số bài học đầy đủ (AdSense từ chối trang “ít nội dung”).
2. `/admin` → **Quảng cáo AdSense** → nhập `ca-pub-…` → bật → **Lưu**. Máy chủ tự chèn mã xác minh vào mọi trang và tạo `/ads.txt`.
3. Gửi duyệt trong AdSense. Sau khi duyệt, tạo *Đơn vị quảng cáo hiển thị* → dán số `data-ad-slot` vào từng vị trí.
4. Tích **Hiện khung giữ chỗ** để xem trước các vị trí trên giao diện mà chưa cần mã.

Vị trí có sẵn: dưới phần giới thiệu trang chủ, giữa & cuối dòng thời gian, cuối trang Hồ Chí Minh, đầu & cuối danh sách SGK, cuối trang Nhân vật, đầu/giữa/cuối trang bài học & bài viết. Quảng cáo **không** đặt trong cửa sổ bật lên (vi phạm chính sách AdSense), chỉ tải khi người xem cuộn tới, có khung giữ chỗ chống nhảy bố cục, tự ẩn nếu không có quảng cáo. CSP tự nới cho Google khi bật.

## 6. Sửa giao diện

- Giao diện gốc: `frontend/Viet_Su_Timeline_base_V3.7.html` (không cần sửa).
- Phần vá V3.8: `frontend/v38.css` (giao diện), `frontend/v38.js` (CMS SGK, quảng cáo), `frontend/v38-early.js`.
- Sau khi sửa: `python tools/build_frontend.py` → tạo lại `static/build/` (bản online) và `static/Viet_Su_Timeline_V3.8_Offline.html` (bản offline). Tên file có mã băm nên trình duyệt tự lấy bản mới.

## 7. Nâng cấp từ V3.7 đang chạy

- Sao lưu thư mục `data/` cũ. Chép đè mã mới nhưng **giữ `data/` của VPS** (có bài viết, ảnh nhân vật, cấu hình đã sửa).
- Lần chạy đầu, V3.8 tự tạo bảng `textbook_lessons` từ `data/textbook_catalog.json` — không ảnh hưởng dữ liệu cũ.
- Thư mục `static/uploads/` (ảnh nhân vật đã tải lên) cũng cần giữ lại.

## 8. Lưu ý nội dung

- Mục lục lớp 7 có 14 bài trùng tên (bài chia “phần 1/phần 2”) — đường dẫn đã tự thêm hậu tố `-phan-2`.
- Ảnh Hồ Chí Minh 7 chặng là tranh minh họa AI → nên ghi nhãn “Minh họa” trước khi public.
- Bản offline: ảnh trang phục dạng `/media/costume/...` chỉ hiển thị khi chạy qua máy chủ.
- Sao lưu định kỳ: `data/vietsucms.sqlite3`, `data/*.json`, `static/uploads/`.

# Đưa Học Lịch Sử lên hoclichsu.com (VPS aaPanel)

VPS: Ubuntu, 2 core, 2 GB RAM, 49 GB ổ, IP `150.95.115.180`, quản lý bằng **aaPanel** (Nginx 1.31, đang chạy 6 website khác).
Không cài Dokploy/Coolify vì chúng chiếm cổng 80/443 của Nginx aaPanel, sẽ làm hỏng các website đang chạy.

## Cách chạy
```
Merge PR trên GitHub ──► GitHub Actions dựng bản hoàn chỉnh (trang, 642 trang chia sẻ, ảnh 1200×630)
                         ├─► GitHub Pages (bản xem thử mrthangvt.github.io/hoclichsu)
                         └─► nhánh ban-may-chu (bản cho hoclichsu.com)
Cron aaPanel 5 phút/lần ─► tools/vps/cap_nhat_hoclichsu.sh tải phần thay đổi về /www/wwwroot/hoclichsu.com
```
VPS không phải dựng gì nên gần như không tốn RAM/CPU; trang là file tĩnh do Nginx của aaPanel phục vụ.
Sau khi merge, khoảng **3–8 phút** là hoclichsu.com có bản mới. Không cần Terminal.

## Cài đặt một lần
1. **Tên miền:** ở nơi mua tên miền, phần quản lý DNS, tạo 2 bản ghi:
   - `A` · tên `@` · giá trị `150.95.115.180`
   - `A` · tên `www` · giá trị `150.95.115.180`
   (Xóa bản ghi A/CNAME cũ của `@` và `www` nếu có.)
2. **Website:** aaPanel → *Website* → *Add site*
   - Domain: `hoclichsu.com` và dòng thứ hai `www.hoclichsu.com`
   - PHP version: **Static** (trang tĩnh) · Database: không · FTP: không
   - Thư mục gốc để mặc định `/www/wwwroot/hoclichsu.com`
3. **Tự cập nhật:**
   - aaPanel → *Terminal*, chạy một lần (tải script về và chạy thử, lần đầu tải ~320 MB, 1–3 phút):
     ```
     curl -fsSL https://raw.githubusercontent.com/mrthangvt/hoclichsu/main/tools/vps/cap_nhat_hoclichsu.sh -o /root/cap_nhat_hoclichsu.sh
     bash /root/cap_nhat_hoclichsu.sh
     ```
     Thấy “Đã cập nhật: Bản dựng cho hoclichsu.com…” là xong.
   - aaPanel → *Cron* → *Add Task*: Type **Shell Script**, Name `Cap nhat hoclichsu`, **N Minutes = 5**, Execute user **root**,
     Script content đúng một dòng: `bash /root/cap_nhat_hoclichsu.sh`
     (Không dán cả script vào ô này: thử 27/11/2026 thì aaPanel chạy không ra kết quả.)
   - Log có dòng `sudo: unable to resolve host …` là cảnh báo vô hại.
4. **SSL (https):** khi DNS đã trỏ về (thường 5–30 phút), aaPanel → *Website* → `hoclichsu.com` → *SSL* → *Let's Encrypt* → chọn cả hai tên miền → *Apply*; bật **Force HTTPS**.
5. **Kiểm tra:** mở `https://hoclichsu.com/nhan-vat-lich-su/tran-hung-dao/` → phải mở thẳng hồ sơ Trần Hưng Đạo. Dán link vào Facebook/Zalo → có ảnh riêng của bài.

## Ghi chú
- Kho git đặt ở `/www/hoclichsu.git`, ngoài thư mục web, nên không lộ `.git` ra Internet. Script giữ `.user.ini`, `.well-known` (chứng chỉ SSL), `.htaccess` của aaPanel.
- Địa chỉ lạ: aaPanel mặc định có `error_page 404 /404.html;` trong cấu hình site — `404.html` của Học Lịch Sử chuyển về trang chủ và mở đúng mục nếu có.
- Muốn quay về bản trước: trên GitHub *Revert* PR rồi merge; 5 phút sau VPS tự về bản cũ.
- Bản đầy đủ có CMS/`/admin` (máy chủ Python) là giai đoạn sau: chạy bằng Docker trong aaPanel, Nginx chuyển tiếp các đường dẫn `/admin`, `/api/` vào container.

## Trạng thái
- 27/11/2026: hoclichsu.com chạy trên VPS, có SSL Let's Encrypt; Cron 5 phút hoạt động.

## CMS /admin (container Docker)
Trang chính vẫn là file tĩnh do Nginx phục vụ. Phần quản trị chạy trong container **hoclichsu-api** (Python, `127.0.0.1:8010`,
giới hạn 450 MB RAM, mạng `host` để đọc đúng IP người dùng). Nginx chuyển tiếp vào container các đường dẫn:
`/admin…`, `/api/…`, `/media/…`, `/bai-viet/…`, `/nhan-vat/…`, `/ads.txt`, và file `/static/…` không có sẵn trong thư mục web
(ảnh tải lên `/static/uploads/…`, giao diện admin). Trang chính gọi `/api/…` để lấy nội dung sửa trong CMS (logo/slogan, ảnh nhân vật…).

- GitHub Actions đẩy mã máy chủ lên nhánh `ban-may-chu-api` (thư mục `vietsu/` bỏ sa bàn 3D và bản offline, kèm
  `docker-compose.yml`, `cap_nhat_hoclichsu.sh`). Script Cron tải về `/www/hoclichsu-api`, có thay đổi thì `docker compose up -d --build`,
  đồng thời tự cập nhật chính nó.
- **Dữ liệu bền** `/www/hoclichsu-du-lieu/` (không mất khi dựng lại): `.env` (mã quản trị), `vietsucms.sqlite3` (bài viết, bài học SGK),
  `data/` (logo & slogan, sa bàn, nhân vật, trang phục, ảnh đại diện, quảng cáo — biến `VIETSU_DU_LIEU`), `uploads/`, `trang-phuc/`.
  Lưu ý: các file trong `data/` chép từ repo **lần đầu**; sau đó sửa trong CMS, sửa file đó trong repo sẽ không còn tác dụng trên VPS.
- Sao lưu: aaPanel → Cron → *Backup Directory* thư mục `/www/hoclichsu-du-lieu` hằng ngày.

### Cài một lần
1. aaPanel → **Docker**: nếu chưa cài thì *Install*.
2. aaPanel → **Terminal**:
   ```
   curl -fsSL https://raw.githubusercontent.com/mrthangvt/hoclichsu/main/tools/vps/cai_admin.sh -o /root/cai_admin.sh && bash /root/cai_admin.sh
   ```
   Lần đầu dựng container 1–3 phút. Cuối cùng in ra **MÃ QUẢN TRỊ** — lưu lại (cũng nằm trong `/www/hoclichsu-du-lieu/.env`).
3. aaPanel → **Website** → `hoclichsu.com` → **Config**: dán nội dung `tools/vps/nginx-hoclichsu.conf` ngay **trên** dòng
   `#ERROR-PAGE-START` → *Save*.
4. Mở `https://hoclichsu.com/admin`, dán mã quản trị.

Kiểm tra trước khi giao (27/11/2026): chạy máy chủ đúng lệnh và biến môi trường của container + Nginx với cấu hình giống mặc định
aaPanel: `/admin`, `/admin/avatar`, giao diện admin, `/api/…` 200; Host lạ bị chặn (400); sửa logo/slogan ghi vào `data/` bền,
không đụng file trong mã nguồn; tải ảnh nhân vật lên → trang chính hiện ảnh mới qua `/static/uploads/…`; trang tĩnh, đường dẫn rõ ràng,
ảnh chia sẻ không đổi.

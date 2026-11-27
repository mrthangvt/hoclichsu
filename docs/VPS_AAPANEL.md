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
3. **Tự cập nhật:** aaPanel → *Cron* → *Add Task*
   - Type: **Shell Script** · Name: `Cập nhật hoclichsu.com`
   - Execution cycle: **N Minutes**, `5`
   - Script content: dán toàn bộ nội dung `tools/vps/cap_nhat_hoclichsu.sh`
   - Lưu, rồi bấm **Execute** một lần. Lần đầu tải khoảng 320 MB (sa bàn 3D) nên mất vài phút; bấm **Log** để xem, thấy dòng “Đã cập nhật: Bản dựng cho hoclichsu.com…” là xong.
4. **SSL (https):** khi DNS đã trỏ về (thường 5–30 phút), aaPanel → *Website* → `hoclichsu.com` → *SSL* → *Let's Encrypt* → chọn cả hai tên miền → *Apply*; bật **Force HTTPS**.
5. **Kiểm tra:** mở `https://hoclichsu.com/nhan-vat-lich-su/tran-hung-dao/` → phải mở thẳng hồ sơ Trần Hưng Đạo. Dán link vào Facebook/Zalo → có ảnh riêng của bài.

## Ghi chú
- Kho git đặt ở `/www/hoclichsu.git`, ngoài thư mục web, nên không lộ `.git` ra Internet. Script giữ `.user.ini`, `.well-known` (chứng chỉ SSL), `.htaccess` của aaPanel.
- Địa chỉ lạ: aaPanel mặc định có `error_page 404 /404.html;` trong cấu hình site — `404.html` của Học Lịch Sử chuyển về trang chủ và mở đúng mục nếu có.
- Muốn quay về bản trước: trên GitHub *Revert* PR rồi merge; 5 phút sau VPS tự về bản cũ.
- Bản đầy đủ có CMS/`/admin` (máy chủ Python) là giai đoạn sau: chạy bằng Docker trong aaPanel, Nginx chuyển tiếp các đường dẫn `/admin`, `/api/` vào container.

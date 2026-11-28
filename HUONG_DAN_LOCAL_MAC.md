# HỌC LỊCH SỬ V4.1 – CHẠY WEBSITE ĐẦY ĐỦ TRÊN MAC (LOCALHOST)

Đây là gói chạy thử nội bộ, dựa trên nguyên bộ backend V4.1, **không phải chỉ là HTML offline**.

## 1. Chạy lần đầu

1. Cài Python 3.10 trở lên (khuyến nghị Python 3.11–3.12) nếu máy chưa có. Kiểm tra trong Terminal: `python3 --version`.
2. Giải nén gói ZIP và mở thư mục `Viet_Su_V4.1_Backend`.
3. Mở Terminal, kéo thư mục `Viet_Su_V4.1_Backend` vào sau lệnh `cd ` rồi nhấn Enter.
4. Gõ `bash start_local.command`.
5. Lần đầu trình chạy sẽ tạo `.env` với hai mã mới, tạo `.venv`, cài thư viện (cần Internet) và khởi động website.
6. Mở `http://127.0.0.1:8000` hoặc `http://127.0.0.1:8000/admin`.

Đăng nhập CMS bằng **mã quản trị** đã hiển thị trong Terminal. Khi xuất bản bài học cần **mã thẩm định**. Hai mã cũng được lưu trong file `.env` tại chính thư mục backend trên máy của anh. Giữ kín file `.env`.

Để dừng website, trở về cửa sổ Terminal và nhấn `Ctrl+C`. Dữ liệu đã lưu không mất.

## 2. Xem trên iPhone / Android cùng Wi-Fi

- Dừng máy chủ cũ rồi chạy: `bash start_local_lan.command`.
- Terminal sẽ in ra URL mạng nội bộ, chẳng hạn `http://192.168.1.25:8000`.
- Mở URL đó từ điện thoại cùng Wi-Fi. Cần cấp quyền qua tường lửa macOS nếu được hỏi.
- Chế độ mạng LAN chỉ dùng với Wi-Fi đáng tin cậy; **không chuyển tiếp cổng router ra Internet**.

## 3. Sửa dữ liệu và hình ảnh

- Bài viết và SGK: `/admin` → quản trị bài viết và Sách giáo khoa.
- Trang phục: `/admin/trang-phuc` (nếu chức năng có trong bản build).
- Các tệp nguồn chính: `main.py`, `vs_core.py`, `frontend/`, `static/`, `data/`.
- SQLite: `data/vietsucms.sqlite3`.
- Ảnh quản trị đã tải lên: `static/uploads/`.
- Để tự sửa mã CSS/JS và xuất lại bản build: xem `README_V3.8.md`, dùng `python tools/build_frontend.py`. Bản V4.1 còn có thêm các thay đổi sau V3.8; cần kiểm tra để tránh ghi đè cải tiến mới.

Lưu ý: Không lưu dữ liệu quan trọng trong các file HTML đầu ra. Bài viết phải được lưu bằng CMS/API hoặc trong data source rồi được xuất lại khi build.

## 4. Sao lưu

Chạy `bash sao_luu_local.command` trước mỗi đợt sửa lớn. Lệnh này sao lưu SQLite theo cơ chế `sqlite3.Connection.backup`, JSON và ảnh upload, tạo tệp ZIP trong `backups/`.

Không dùng công cụ đồng bộ đè trực tiếp lên file SQLite đang chạy. Khi đưa website lên VPS, phải chuyển cả **dữ liệu** và **ảnh đã tải lên**, không chỉ HTML/CSS/JS.

## 5. AI / bản đồ / đăng nhập

- AI trực tuyến cần khóa API hợp lệ trong `.env` và có thể phát sinh chi phí.
- Bản đồ, ảnh/YouTube từ nguồn ngoài cần Internet.
- Trang đăng ký/đăng nhập có thể vẫn là giao diện mẫu nếu backend tài khoản chưa được xây dựng.
- Các sa bàn 3D chưa hoàn thành không thể sử dụng chỉ nhờ chạy localhost.
- AdSense và HTTPS công khai không cần bật khi thử trên máy.

## 6. Lỗi thường gặp

- **Port 8000 bị chiếm:** chạy `PORT=8001 bash start_local.command`, nhưng sửa `SITE_URL=http://127.0.0.1:8001` trong `.env` để đường dẫn SEO khớp.
- **Không vào được `/admin`:** kiểm tra mã lấy trong `.env`; phân biệt mã quản trị và mã thẩm định.
- **Mac báo thiếu thư viện:** đảm bảo kết nối Internet khi chạy lần đầu, kiểm tra lệnh `python3 --version`.
- **Bản mới chưa hiện:** tải lại trang không dùng cache hoặc tắt/chạy lại server; kiểm tra đường dẫn tài nguyên của frontend.
- **Ảnh/video/bản đồ không hiện:** có thể là tài nguyên từ bên thứ ba, không có Internet, hoặc quyền truy cập chưa phù hợp.

## 7. Trước khi đưa lên VPS

Sao lưu local → rà nội dung/SEO → kiểm thử desktop/mobile → triển khai lên staging → thử CMS, bảo mật, hiệu năng → đồng bộ dữ liệu lên production.
Không dùng các mã quản trị local hoặc file `.env` local làm mã production.

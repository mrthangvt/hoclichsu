# Học Lịch Sử V6 — CMS quản trị mới

## Đợt 1 (27/11/2026, nhánh `claude/cms-dot1`) — Tài khoản + sửa nội dung các mục Menu
Theo yêu cầu chủ dự án: CMS khoa học hơn, đăng nhập bằng tài khoản, có mục sửa/cập nhật nội dung các mục Menu.

**Tài khoản (`vietsu/vs_taikhoan.py`)**
- Đăng nhập email + mật khẩu (băm scrypt), phiên 30 ngày trong cookie `hls_phien` (HttpOnly, Secure khi https, SameSite=Lax);
  thao tác ghi bắt buộc header `X-HLS: 1` và cùng nguồn (chống CSRF); sai 10 lần / 15 phút bị khóa tạm theo IP.
- Vai trò: **Quản trị** (toàn quyền + quản lý tài khoản), **Biên tập** (sửa, xuất bản), **Thành viên** (đợt 2: gửi bài).
- Tài khoản quản trị đầu tiên: mở `/admin`, nhập **mã quản trị** (VIETSU_ADMIN_TOKEN) một lần để chứng minh là chủ máy chủ.
- Quản trị viên thêm tài khoản, đổi vai trò, khóa/mở, đặt lại mật khẩu; ai cũng tự đổi mật khẩu được (đăng xuất thiết bị khác).
- Nhật ký thao tác (đăng nhập, sửa nội dung, tài khoản).
- Các API cũ dùng mã quản trị vẫn chạy, và nhận luôn người đã đăng nhập vai trò Quản trị/Biên tập.

**Sửa nội dung (`vietsu/vs_noidung.py`, `static/v60-cms.js`)**
- Nội dung gốc vẫn nằm trong trang tĩnh; CMS chỉ lưu **bản vá** theo (loại, mã) → trang chính tải `/api/v6/noi-dung` và áp lên.
  Xóa bản vá = về bản gốc. Mỗi lần sửa lưu lịch sử, có nút “Dùng lại bản này”.
- Sửa được: **Triều đại** (tên, thời gian, giới thiệu, nguồn), **Sự kiện** (trận đánh + 44 sự kiện V5.9), **mốc Hồ Chí Minh**,
  **Nhân vật** (tên, niên đại, vai trò, tóm tắt, tiểu sử, nguồn) và **thêm nhân vật mới**, **bài SGK lớp 6–12** (tên, chương, tóm tắt, ghi nhớ, câu hỏi).
- **Thanh menu**: đổi tên, sắp thứ tự, ẩn/hiện 6 mục; **tên website, slogan, logo, tiêu đề và mô tả đầu từng mục** (dùng API site-config sẵn có).
- Đường dẫn rõ ràng tính theo tên **gốc** nên liên kết đã chia sẻ không đổi khi sửa tên. Nhân vật mới có đường dẫn `/nhan-vat-lich-su/<tên>/`
  (chưa có ảnh chia sẻ riêng cho tới khi chạy lại `tools/xuat_duong_dan.py`).
- Người biên tập đã đăng nhập thấy nút **“✎ Sửa”** trong cửa sổ hồ sơ/bài trên trang chính và chip “✎ Quản trị” góc dưới.
- Không có máy chủ (GitHub Pages, bản offline): bỏ qua, trang như cũ.

**Giao diện (`static/quan-tri/`)** — `/admin` là CMS mới: Tổng quan · Menu & trang chủ · Triều đại · Sự kiện · Hồ Chí Minh · Nhân vật · SGK ·
Tài khoản · Nhật ký · Công cụ khác. Danh sách có tìm kiếm, lọc “chỉ mục đã sửa”, lọc lớp; biểu mẫu hiện bản gốc bên dưới trường đã sửa;
dùng được trên điện thoại. CMS đọc dữ liệu gốc từ chính trang (khung ẩn `/?goc=1`, hàm `HLS_LAY_GOC`). Giao diện cũ chuyển sang `/admin/cu`.

**Kiểm tra** (máy chủ + Nginx cấu hình như aaPanel, Chromium 1366 px và 390 px): tạo tài khoản đầu tiên bằng mã quản trị; sửa nhân vật, mốc HCM,
triều đại, sự kiện, bài SGK, thanh menu, thêm nhân vật → trang chính hiện đúng (hồ sơ, thẻ v34, dòng thời gian, bảng HCM, menu, danh sách nhân vật,
đường dẫn cũ vẫn mở đúng); khôi phục gốc; thêm biên tập viên → không thấy mục Tài khoản, gọi API tài khoản bị 403; sai mật khẩu báo lỗi;
thiếu X-HLS bị 403; trang GitHub Pages không đổi, không lỗi JavaScript.

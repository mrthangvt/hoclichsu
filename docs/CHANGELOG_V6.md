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

## Đợt 1b (27/11/2026, nhánh `claude/cms-bai-viet`) — Trình biên tập bài viết, thư viện ảnh, bật/tắt Trợ lý AI
Theo yêu cầu chủ dự án: trình biên tập giống WordPress (menu bên trái, khung soạn ở giữa, cột tùy chọn bên phải: xuất bản,
chuyên mục, thẻ, ảnh đại diện; có SEO) và mục bật/tắt, đổi biểu tượng Trợ lý AI.

- **Bài viết** (`vs_baiviet.py`, `static/quan-tri/quan-tri-bai-viet.js`):
  - Danh sách: Tất cả / Đã xuất bản / Bản nháp / Thùng rác, tìm kiếm, lọc chuyên mục, ảnh nhỏ; Sửa · Xem · Bỏ vào thùng rác · Khôi phục · Xóa vĩnh viễn.
  - Trình biên tập: tiêu đề, đường dẫn tự tạo (sửa tay được), chế độ **Trực quan / Mã HTML**; thanh công cụ: kiểu đoạn (H2–H4, trích dẫn),
    đậm, nghiêng, gạch chân, gạch ngang, danh sách, căn lề, liên kết (Ctrl+K), **chèn ảnh từ thư viện** (kèm chú thích), bảng, đường kẻ,
    xóa định dạng, hoàn tác; dán từ Word/web được làm sạch; đếm từ; Ctrl+S lưu; cảnh báo khi rời trang chưa lưu.
  - Cột phải: **Xuất bản** (Lưu nháp, Xem trước, Xuất bản/Cập nhật, ngày đăng — đặt ngày tương lai để hẹn giờ, phiên bản cũ, thùng rác),
    **Chuyên mục** (thêm nhanh), **Thẻ** (gợi ý thẻ hay dùng), **Ảnh đại diện**.
  - **SEO**: xem trước kết quả Google, tiêu đề SEO và mô tả meta có đếm ký tự, từ khóa chính, chấm điểm 0–100 với 13 tiêu chí
    (từ khóa trong tiêu đề/mô tả/đường dẫn/đoạn đầu/tiêu đề phụ/alt ảnh, mật độ, độ dài tiêu đề/mô tả/nội dung, liên kết nội bộ/ngoài,
    ảnh đại diện); ảnh chia sẻ mạng xã hội riêng; bật/tắt cho Google lập chỉ mục.
  - Nội dung HTML được **làm sạch phía máy chủ** (`vs_lamsach.py`: chỉ giữ thẻ/thuộc tính an toàn, bỏ script, sự kiện, javascript:).
  - Lưu 30 phiên bản gần nhất mỗi bài.
  - **Trang công khai**: `/bai-viet/` (mới nhất), `/bai-viet/chuyen-muc/<đường dẫn>`, `/bai-viet/<đường dẫn>` (Open Graph + ảnh, schema Article,
    thẻ, bài liên quan), `/bai-viet/xem-truoc/<id>` cho người biên tập. Bài cũ (V3–V5) vẫn mở được nếu không trùng đường dẫn.
- **Chuyên mục**: thêm/sửa/xóa, chuyên mục cha, mô tả, số bài; tạo sẵn 5 chuyên mục.
- **Thư viện ảnh** (`vs_tep.py`): tải nhiều ảnh, kéo thả; trình duyệt thu nhỏ trước khi gửi (≤ 2400 px), máy chủ kiểm tra định dạng thật,
  lưu WebP ≤ 1920 px + ảnh nhỏ 480 px; sửa mô tả (alt), xóa, chép đường dẫn. Dùng chung hộp chọn ảnh cho bài viết, ảnh đại diện, biểu tượng trợ lý.
- **Trợ lý AI** (CMS → Trợ lý AI): bật/tắt nút trợ lý trên trang, đổi tên nút, lời chào, **biểu tượng** (ảnh từ thư viện) — có xem trước;
  trang chính áp dụng ngay qua `static/v60-cms.js` (bản vá `cai-dat/tro-ly`).

Kiểm tra (Nginx cấu hình như aaPanel, Chromium 1440 px và 390 px): tải ảnh; đổi tên/biểu tượng/lời chào trợ lý → trang chính đổi, tắt → nút ẩn;
viết bài có định dạng, ảnh, chuyên mục, thẻ, ảnh đại diện, SEO → xuất bản → trang công khai đúng, og:image đúng; chèn `<script>`, `onerror`,
`javascript:` ở chế độ Mã HTML → bị loại; bản nháp không công khai (404); chưa đăng nhập gọi API → 401; không lỗi JavaScript.

## V6.1 (27/11/2026, nhánh `claude/khong-gian-mobile`) — Không gian lịch sử, menu điện thoại, Đăng ký | Đăng nhập
Theo yêu cầu chủ dự án (`static/v61.css`, `static/v61.js`, nạp sau v60 trong build_v59.py):
- **Bản đồ Không gian lịch sử**: điện thoại — một ngón tay cuộn trang (trước đây bản đồ chặn cuộn), hai ngón tay phóng to/thu nhỏ và kéo;
  máy tính — **Ctrl (⌘) + cuộn** hoặc chụm bàn rê để phóng, cuộn thường thì cuộn trang (có gợi ý), kéo chuột để di chuyển;
  phóng/di chuyển mượt (gom theo khung hình, chuyển động dần), nút + − ⌖ và “bay tới” khi chọn thẻ cũng mượt; điểm dưới con trỏ đứng yên khi phóng.
- **Bộ lọc Di tích & văn hóa / Chiến dịch & chiến trận** thành nút nhỏ ngay dưới tiêu đề danh sách.
- **Danh sách sa bàn trên điện thoại** cuộn được hết (nguyên nhân: khung danh sách dính cao 100vh và ẩn phần thừa).
- **Menu điện thoại kiểu Map Tour** (tham khảo vietnamchuyenminh.com): biểu tượng 22 px + chữ, cùng kích thước; mục đang chọn đổi màu và có vạch trên,
  không còn ô nền; biểu tượng Bộ đề vẽ lại cùng kiểu; có bản giao diện sáng.
- **Biểu tượng Bác Hồ**: bỏ lớp phủ; dùng hình làm mặt nạ nên luôn cùng màu với các biểu tượng khác (xám khi ở trang khác, vàng khi đang chọn).
- **Breadcrumb viết HOA** (HỌC LỊCH SỬ / KHÔNG GIAN LỊCH SỬ).
- **Giao diện sáng**: 3 nút Việt Nam · Trung Quốc / Việt Nam · Phương Tây / Cả 3 dòng theo màu sáng.
- **CMS → Menu & trang chủ → Cột trái**: bật/tắt và sửa câu trích dẫn; bật/tắt khung “Học Lịch Sử trên điện thoại”, sửa tiêu đề, mô tả,
  nội dung hướng dẫn cài đặt (mỗi dòng một bước). Hướng dẫn mặc định mới cho iPhone/Android; **mã QR thật** tới https://hoclichsu.com (`static/v61/qr-hoclichsu.png`).
- **Đăng ký | Đăng nhập**: hai liên kết riêng (máy tính và điện thoại); hộp đăng ký (họ tên, email, mật khẩu) / đăng nhập; sau khi vào hiện tên,
  menu có Trang quản trị (nếu là biên tập), Bài viết, Đăng xuất. API mới `POST /api/v6/dang-ky` (vai trò Thành viên, 5 lần/giờ/IP, ô bẫy chống máy).
  Chưa gửi email xác nhận (cần máy chủ thư) — làm ở đợt 2 cùng chức năng gửi bài.

Kiểm tra (Chromium 1440 px, điện thoại 390 px có cảm ứng): cuộn thường không phóng bản đồ mà cuộn trang; Ctrl+cuộn phóng; kéo chuột; nút về giữa;
chụm hai ngón phóng bản đồ, trang không bị phóng; danh sách hiện đủ 9 sa bàn; menu, biểu tượng Bác ở chế độ tối/sáng; đăng ký → đăng xuất → sai mật khẩu
→ đăng nhập; thành viên gọi API quản trị bị 403; CMS sửa/ẩn câu trích dẫn và khung ứng dụng; không lỗi JavaScript.


## V6.2 (28/11/2026, nhánh `claude/ban-do-maplibre`) — Bản đồ Không gian lịch sử dạng bản đồ thật
Theo yêu cầu chủ dự án (học cách làm của 360batdongsan.net): thay bản đồ SVG bằng **MapLibre GL + nền OpenFreeMap** (dữ liệu OpenStreetMap, miễn phí, không cần khóa API).
- Thư viện tự host `static/v62/` (maplibre-gl 6.20.0, giấy phép BSD-3 kèm theo); mã `static/v62.js`, `static/v62.css`.
- Nền tối/sáng theo giao diện trang; tên địa danh tiếng Việt (`name:vi`); bóng địa hình (Mapzen/AWS Terrain Tiles).
- **Quần đảo Hoàng Sa (Việt Nam)**, **Quần đảo Trường Sa (Việt Nam)**: nhãn riêng; ẩn mọi nhãn nền trong vùng hai quần đảo và đường ranh "tranh chấp".
- Pin = ảnh tròn của sa bàn + tên (nhìn xa/màn hình hẹp chỉ hiện ảnh); pin gần nhau **gom cụm** có số, bấm cụm thì phóng tới.
- Bấm pin: bay tới và mở thẻ (ảnh, loại · năm, tên, mô tả, nút **Xem không gian 3D** → mở hồ sơ như cũ). Bộ lọc Di tích/Chiến dịch, nút + − ⌖ giữ nguyên.
- Cử chỉ: máy tính **Ctrl/⌘ + cuộn** để phóng (cuộn thường vẫn cuộn trang), điện thoại **2 ngón** để di chuyển/phóng (1 ngón cuộn trang), có lời nhắc tiếng Việt.
- Không có mạng, không WebGL, mở file offline hoặc nền lỗi → tự dùng lại bản đồ SVG cũ.
- CSP máy chủ: thêm `tiles.openfreemap.org`, `s3.amazonaws.com` vào connect-src và `worker-src 'self' blob:`.

## V6.3 (28/11/2026, nhánh `claude/ban-do-mobile-toan-man`) — Không gian lịch sử trên điện thoại kiểu Map Tour
Theo yêu cầu chủ dự án (tham khảo vietnamchuyenminh.com): `static/v63.js`, `static/v63.css`.
- Bản đồ phủ kín từ dưới thanh đầu trang tới thanh menu dưới; trang không cuộn nữa nên **1 ngón kéo bản đồ**, 2 ngón phóng to/thu nhỏ.
- Nút + − ⌖ và nhãn tiêu đề nổi trên bản đồ.
- Thanh **"Không gian lịch sử 3D · N địa điểm · Danh sách ↑"** ở đáy. Bấm hoặc vuốt lên để mở **ngăn danh sách** cố định trong khung điện thoại; trong ngăn, tiêu đề + bộ lọc đứng yên, các thẻ cuộn riêng. Nút "Bản đồ ↓", vuốt xuống hoặc Esc để đóng.
- Chọn một thẻ trong danh sách: ngăn đóng lại, bản đồ bay tới điểm và mở thẻ "Xem không gian 3D".
- Giao diện sáng/tối; trợ lý AI dời lên trên thanh đáy. Máy tính và bản đồ SVG dự phòng giữ như cũ (bản SVG: chọn thẻ mở hồ sơ như trước).
- **Sửa (28/11, nhánh `claude/sua-zoom-doi-giao-dien`):** trên máy tính, sau khi đổi giao diện sáng/tối thì Ctrl/⌘ + cuộn không phóng bản đồ nữa. Nguyên nhân: v63.js gọi `map.resize()` mỗi lần thẻ body đổi lớp. Giờ v63 chỉ đụng tới bản đồ khi thật sự đổi chế độ điện thoại ↔ máy tính; đổi kích thước do ResizeObserver của v62 lo.
- **Sửa (28/11, nhánh `claude/sua-cuon-mobile-khong-gian`):** trên iPhone, kéo vào thanh đầu trang/thanh đáy/menu ở Không gian lịch sử làm cả trang “nảy”, thanh menu dưới bị kéo nổi lên. Giờ ở chế độ toàn màn hình trang bị khóa (`body` cố định), chỉ cuộn được trong danh sách và kéo trên bản đồ; cuộn tới đầu/cuối danh sách không kéo cả trang theo.

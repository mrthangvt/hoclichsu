# VIỆT SỬ V4.2 — nhật ký cập nhật giao diện
Ngày: 16/11/2026 · Nhánh: `gpt/v4.2-timeline-khong-gian-ui`

## Hoàn thành
- Không gian lịch sử: ưu tiên bản đồ véc-tơ nội bộ, không tải thư viện bản đồ trực tuyến; giữ 4 điểm di tích/chiến trận.
- Cột địa điểm: 4 thumbnail SVG minh họa tự tạo, tạo ngay trong trình duyệt (không phải ảnh tư liệu), đặt cạnh tên và mô tả.
- Bộ lọc: thay nhãn và menu chọn bằng đúng hai nút **Di tích & văn hóa** / **Chiến dịch & chiến trận**; nhấn lần hai để bỏ lọc.
- Bỏ ghi chú lỗi thời `Một điểm pin sẽ dẫn đến...`.
- Timeline 1972: đặt nút **SA BÀN 3D · Thành cổ Quảng Trị**, dẫn đến sa bàn đang có sẵn. Chỉ hiển thị với trải nghiệm đã có đường dẫn thực tế.
- Hồ sơ triều đại: hỗ trợ xem bộ sưu tập trang phục, lọc **Trang phục** / **Mũ & tóc**, hiển thị mốc thời gian theo metadata nguồn; thêm các nút khám phá nhân vật khi dữ liệu đã có.
- Ảnh icon và thư viện trang phục: đảm bảo lazy loading/async decode, bố cục responsive, giữ nguyên ảnh V4.1 và cảnh báo ảnh minh họa.
- Timeline Hồ Chí Minh: nới **chặng 4 (1941–1945)** thêm 145px và dời các mốc tiếp theo, tránh tràn tiêu đề.
- Local/backend: `main.py` ưu tiên bản build V4.2; `start_local.command` tạo V4.2 trước khi khởi chạy; `vs_core.VERSION = 4.2.0`.
- GitHub Pages: dùng `tools/build_v42.py`, đóng gói CSS/JS và ảnh hỗ trợ, giữ nguyên đường dẫn sa bàn 3D.
- Toàn bộ thay đổi là **lớp bổ sung**, không sửa bản gốc V4.1, tệp GLB, .blend, dữ liệu CMS hoặc khóa API.

## Phạm vi và giới hạn
- Thumbnail hiện là **minh họa vector do chương trình tạo**, không phải ảnh chụp lịch sử, sẽ cần ảnh tư liệu có phép sử dụng cho bước tiếp theo.
- Bộ ảnh Hair & Hat dùng lại 40 bản ghi và ảnh hiện có từ V4.1; việc xác minh từng minh họa lịch sử/bản quyền vẫn cần biên tập.
- Kiểm tra nội dung sự kiện, triều đại và các hồ sơ ở đây là kiểm thử liên kết/UI, **không phải** thẩm định sử học toàn bộ dữ liệu.
- GitHub Pages là bản xem tĩnh; CMS/API hoạt động trên Local/Backend FastAPI.

## Kiểm thử trước PR
- Chạy trình duyệt Chromium với HTML V4.1 + module V4.2: desktop 1440px, mobile 390px và 320px.
- Không có lỗi JavaScript lúc khởi tạo; không tràn ngang toàn trang; map SVG hiện; hai nút lọc cho kết quả 2+2 và tất cả 4 điểm; thumbnail 4 điểm; mốc 1972 có đúng 1 liên kết; chặng 4 rộng khoảng 295px trên desktop.
- Kiểm tra cú pháp JavaScript bằng `node --check`.
- Cần kiểm tra thêm trên Mac của anh: Backend/CMS thật, GitHub Actions Pages sau merge, điện thoại thực và màn hình thư viện trang phục.

## Cách chạy Local
```bash
git switch main
git pull origin main
cd vietsu
bash sao_luu_local.command
bash start_local.command
```
Sau khi PR được anh duyệt và merge, website Local sẽ tự tạo `static/Viet_Su_Timeline_V4.2_Offline.html`. Muốn tự build thủ công: `python3 tools/build_v42.py`.

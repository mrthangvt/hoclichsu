# HỒ SƠ TIẾP NỐI — PROJECT SỬ VIỆT

Cập nhật kiểm tra: 18/11/2026.
Nguồn đối chiếu: kho GitHub `mrthangvt/hoclichsu` (nhánh `main`) và PR #19, không thay thế việc đọc mã nguồn, PR và CI mới nhất.

## 1. Nguồn dữ liệu chuẩn
- Repository: https://github.com/mrthangvt/hoclichsu
- Nhánh chính: `main` (không commit trực tiếp).
- Tài liệu AI: `AGENTS.md`; trạng thái: `docs/TOM_TAT.md`; quy trình: `docs/QUY_TRINH.md`.
- Mỗi thay đổi: nhánh `gpt/<ten-viec>` và PR; chủ dự án duyệt trước khi merge/deploy.

## 2. Phạm vi dự án
- Website Việt Sử: timeline Việt Nam/Trung Quốc/Phương Tây, hồ sơ nhân vật, sách giáo khoa lịch sử lớp 6–12, Không gian lịch sử.
- Backend: Python FastAPI, SQLite, CMS quản trị `/admin`; GitHub Pages chỉ là bản web tĩnh, không bao gồm API/CMS.
- Sa bàn Three.js Thành cổ Quảng Trị 1972: `vietsu/static/khong-gian/thanh-co-quang-tri/`; mô hình Blender/GLB, hoạt cảnh, chế độ kể chuyện.

## 3. Quyết định bắt buộc giữ
- Giao diện V4.6 là mốc khóa từ 17/11/2026: không tự đổi bố cục, menu, tab, popup, font, màu, ảnh, responsive hay hiệu ứng. Chỉ sửa vị trí được chủ dự án yêu cầu rõ.
- Tính trung lập và xác thực lịch sử; phân biệt tư liệu với “Tái dựng mô phỏng”. Tránh bịa số liệu/ngày tháng.
- Không can thiệp trực tiếp thủ công vào GLB xuất từ Blender.
- Giữ three.js 0.160; Blender → three.js: (x,y,z) → (x,z,-y).
- Không commit `.env`, SQLite, uploads, khóa bí mật.
- Dùng tiếng Việt trong giao diện và ghi chú code.

## 4. Việc đang phát triển được xác minh: V4.11
- PR: https://github.com/mrthangvt/hoclichsu/pull/19
- Tên: “Việt Sử V4.11 — Bộ đề ôn Sử lớp 10/11/12 và chức năng thi thử, chấm điểm”.
- Trạng thái lúc kiểm tra: OPEN, DRAFT, chưa MERGE; head `gpt/v4.11-bo-de-on-su`, base `gpt/v4.10-historical-source-enrichment`. Vì base không phải `main`, cần kiểm tra chuỗi phụ thuộc trước khi merge.
- Chức năng theo mô tả PR: menu “Bộ đề ôn Sử” trên “Sách giáo khoa”; lớp 10: 33 câu/7 chủ đề; lớp 11: 30 câu/6 chủ đề; lớp 12: 30 câu/3 chủ đề; tổng 93 câu; ôn tập phản hồi ngay, thi thử đếm giờ/chấm điểm, kết quả lưu localStorage; URL `/on-thi/`.
- Giữ nguyên layout cũ bằng cách chỉ chèn script menu trong bản build V4.11; có kiểm thử đối chiếu HTML V4.9.
- Tài liệu nguồn lớp 12 có lưu ý về quyền sử dụng; bộ câu hỏi cần được giáo viên/biên tập thẩm định trước khi mở rộng.
- Các chức năng PR là nội dung **đề xuất triển khai**, KHÔNG kết luận chúng đã lên production. Chưa kiểm tra trạng thái CI/runtime thực tế tại thời điểm lập hồ sơ.

## 5. Sa bàn 3D
- Thành cổ Quảng Trị 1972 đã có thư mục dựng web; các mô hình/hoạt cảnh được mô tả trong `docs/TOM_TAT.md` và `docs/KE_CHUYEN_1972.md`.
- Cần phân biệt hai kịch bản lịch sử: giai đoạn giải phóng thành 4–5/1972 và 81 ngày đêm 28/6–16/9/1972. Dự án mô tả chế độ kể chuyện 81 ngày đêm với QĐND giữ thành, VNCH phản công; kịch bản QĐND vượt sông đánh vào thành được đánh dấu minh họa giả định ở chế độ tự do.
- Mọi nâng cấp Blender hoặc scene cần đọc tài liệu tọa độ, danh sách clip và file model mới nhất trước khi sửa.

## 6. Thứ tự đọc đầu mỗi New Chat
1. `AGENTS.md`, `docs/QUY_TRINH.md`, `docs/TOM_TAT.md` ở `main` mới nhất.
2. PR đang mở và các nhánh liên quan đến công việc hiện hành; đọc trạng thái merge + CI, base/head SHA.
3. `PROJECT_CONTEXT_SU_VIET.md` (hồ sơ này), và tài liệu changelog của phiên bản liên quan.
4. Các file nguồn chính xác của chức năng trước khi đề xuất sửa.
5. Tóm tắt: đã xong / đang làm / chưa duyệt / rủi ro / bước kế tiếp. Không yêu cầu người dùng kể lại những gì đã đọc được.

## 7. Việc cần làm tiếp theo
- Kiểm tra các PR đang mở và chuỗi phụ thuộc, nhất là PR #19 trước khi sửa hay merge.
- Kiểm tra kết quả CI và bản xem thử thật, bao gồm desktop/mobile.
- Sau mỗi phiên làm việc: cập nhật phần “Trạng thái tại lần bàn giao”, PR, commit SHA, file bị sửa, lỗi, kiểm thử và bước tiếp.
- Không merge/deploy nếu chủ dự án chưa yêu cầu.

## 8. Trạng thái tại lần bàn giao (điền thêm mỗi phiên)
- Ngày/giờ:
- Cuộc trò chuyện nguồn:
- Việc vừa hoàn thành:
- PR/nhánh/commit:
- Kiểm thử đã chạy (bằng chứng):
- Quyết định đã duyệt:
- Vấn đề chưa xong:
- Bước đầu tiên cần làm khi vào New Chat:

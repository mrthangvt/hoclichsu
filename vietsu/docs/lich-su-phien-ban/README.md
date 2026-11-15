# VIỆT SỬ – TIMELINE V2.0 (bản phát triển nội bộ)

## 1. Cài đặt và khởi động backend

Yêu cầu Python 3.11+, mạng Internet nếu sử dụng AI, các thư viện trong `requirements.txt`.

```bash
cd Viet_Su_V2.0_Backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export VIETSU_ADMIN_TOKEN='THAY_BANG_CHUOI_BAO_MAT_DAI'
export VIETSU_REVIEW_TOKEN='CHUOI_RIENG_CHO_NGUOI_THAM_DINH'
# Chỉ khi muốn dùng AI viết bài:
export OPENAI_API_KEY='YOUR_API_KEY'
export OPENAI_MODEL='gpt-6-astra'
export SITE_URL='http://localhost:8000'
python seed.py
uvicorn main:app --host 127.0.0.1 --port 8000
```

Mở `http://localhost:8000/` để xem timeline, và `http://localhost:8000/admin` để thử CMS. Giao diện offline riêng `Viet_Su_Timeline_V2.0_Offline.html` vẫn mở được mà không cần backend. Chỉ bộ CMS và AI cần chạy server.

## 2. Chức năng đã có

- Quản lý bài viết: H1, slug, giới thiệu, thân bài, SEO title, meta description, từ khóa, category, tag, niên đại, ID triều đại/nhân vật/sự kiện, danh sách nguồn, người biên soạn.
- Phiên bản bài viết, trạng thái `draft / published`, quy trình công bố bằng mã thẩm định riêng.
- URL công khai `/bai-viet/{slug}`, canonical, Open Graph, JSON-LD Article, `/sitemap.xml`, `/robots.txt`.
- Truy vấn các bài đã xuất bản theo `entity_id` và `timeline_year` qua `/api/articles`.
- `POST /api/ai/draft`: tạo bản nháp từ tiêu đề. Khi **không nhập ghi chú nguồn**, AI được phép tra cứu web và dẫn nguồn; khi nhập ghi chú, nội dung dùng ghi chú người biên tập cung cấp. Không tự xuất bản.
- Lưu cấu trúc không gian 3D và hotspot để sau này nối với GLB/GLTF, Unreal/Unity Web runtime, hoặc dịch vụ phát trực tuyến.
- 9 đề cương bài viết và 4 không gian thử nghiệm trong file seed. Không tự đánh dấu đã kiểm chứng.

## 3. Chưa có / cần làm khi triển khai chính thức

- **Chưa hoàn thiện quản trị sản phẩm thật**: đăng nhập người dùng, SSO, RBAC nhiều vai trò, 2FA, CSRF, rate limit, audit log và tìm kiếm toàn văn.
- PostgreSQL thay SQLite khi mở rộng, migration và backup; S3/Object Storage/CDN cho ảnh/GLB, Redis khi cần.
- Giao diện người học bản offline chưa gọi API bài viết thực; frontend production cần lấy JSON từ `/api/articles?entity_id=tran`, mở link SEO và đồng bộ trạng thái.
- Không có mô hình 3D/NPC/giao tranh thực tế trong V2.0. Những cảnh demo chỉ là danh mục, hotspot, metadata.
- Nguồn dữ liệu sơ bộ; cần giảng viên/chuyên gia thẩm định, giấy phép ảnh và tư liệu, nhãn `Tư liệu`, `Tái dựng`, `Giả thuyết`.
- AI có thể sai dù có web search: người biên tập phải đối chiếu câu chữ, URL, ngày tháng, các vấn đề sử học còn tranh luận; giới hạn chi phí và giám sát việc gọi mô hình.

## 4. API cơ bản

- `GET /api/health`
- `GET /api/articles?status=published&entity_id=tran`
- `POST /api/articles` (cần `X-Admin-Token`)
- `PUT /api/articles/{id}`
- `POST /api/articles/{id}/publish` (cần mã reviewer riêng)
- `GET /api/articles/{id}/versions`
- `POST /api/ai/draft` (cần API key và token)
- `GET /api/experiences`
- `POST /api/experiences`
- `GET /bai-viet/{slug}`
- `/docs` của FastAPI khi server chạy

## 5. Thiết kế dài hạn cho sa bàn 3D

Mỗi thế giới gồm `experience_id`, `era_id`, `timeline_year`, `asset_url`, `reconstruction_level`, và `hotspots[]`. Mỗi hotspot có `position: [x,y,z]`, `kind`, `text`, `source_urls`, `entity_id`, `quiz_id` (đề xuất), và URL tài liệu liên quan. NPC có thể thêm dưới `actors[]`, `timeline_cues[]`, `animation` khi engine/gameplay đã xây xong.

Ví dụ **Làng Sen**: tour nhà quê nội, Hoàng Trù, trưng bày và hiện vật; **Rạch Gầm – Xoài Mút**: điểm chiến thuật, bản đồ sông Tiền, trích dẫn; **Thành cổ Quảng Trị**: mô hình kiến trúc, mốc chiến dịch và NPC tái hiện có thuyết minh. Không biến cảnh dàn dựng thành chứng cứ xác thực.


Xem README_V2.5.md cho phần bổ sung.


## Cập nhật V2.6

- Đồng bộ thêm giao diện sáng/tối ở timeline, popup và menu.
- Tinh chỉnh submenu Sách lịch sử lớp 6–12, thêm nhãn đầy đủ và mũi tên nằm ngoài khung.
- Đổi nút trạng thái phía trên thành **Đăng ký/Đăng nhập** (khung chờ triển khai bản online).
- Thống nhất font chữ ưu tiên **Be Vietnam Pro** trên toàn bộ giao diện.
- Ghi chú lộ trình biên tập: có thể tham khảo kho bài **zhonghua.5000yan.com** để chuyển ngữ, đối chiếu Việt – Trung và thẩm định trước khi xuất bản.


**Bổ sung SEO:** xem `README_SEO.md` về canonical, Schema.org, robots và sitemap.


Xem **README_V2.7.md** để nhập bài hàng loạt (JSON và danh sách tiêu đề).

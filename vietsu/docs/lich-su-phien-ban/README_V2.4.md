VIỆT SỬ — V2.4

Giao diện: Viet_Su_Timeline_V2.4_Offline.html (mở trực tiếp, không cần Internet).

Những cập nhật:
• Menu sách giáo khoa bỏ khung “Nguyên tắc học liệu”; submenu dùng biểu tượng sách.
• Tiêu đề/mô tả thay đổi theo mục menu; backend /admin sửa 4 nhóm.
• Không gian lịch sử học bố cục Atlas từ plugin do người dùng cung cấp: bản đồ SVG offline và nền địa lý Leaflet tùy chọn khi có mạng (CARTO/OSM/Esri).
• Hồ sơ nhân vật có tiêu đề, dữ kiện, mục lục và thuật ngữ chú giải bấm được.
• Popup có liên kết chia sẻ bằng fragment #ho-so=... và #bai-hoc=...; liên kết file:// chỉ chạy khi có cùng file HTML; URL công khai hoạt động sau khi triển khai lên domain.
• Giao diện sáng/tối ghi nhớ tùy chọn trình duyệt.
• Đã bỏ nhắc tên và liên kết hai website nguồn theo yêu cầu. Bộ bài học vẫn là đề cương cần thẩm định, chưa phải nội dung giáo khoa chính thức.

Hạ tầng: Backend FastAPI/Python SQLite nguyên mẫu. Không triển khai public trước khi bổ sung xác thực người dùng, phân quyền biên tập, bảo mật đầu vào, sao lưu và review bảo mật.
Lớp bản đồ online yêu cầu Internet và thư viện Leaflet tải động; offline luôn có bản đồ véc-tơ.

Cài backend: cd Viet_Su_V2.4_Backend && pip install -r requirements.txt && export VIETSU_ADMIN_TOKEN=... VIETSU_REVIEW_TOKEN=... && uvicorn main:app --reload.

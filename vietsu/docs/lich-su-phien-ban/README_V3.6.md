# Việt Sử V3.6

## Thay đổi

- Avatar mặc định theo vai trò: `static/assets/quan_van_512.png` và `static/assets/quan_vo_512.png` (đã cắt từ vai lên).
- Trợ lý AI Sử gia dùng GIF động `static/assets/su_gia_ho_tro.gif`.
- 17 hồ sơ nhân vật tham khảo **từ các nguồn công khai khác** được bổ sung dưới dạng bản nháp. Không gán nhãn nguồn Đông Lịch Sử.
- Phục vụ sửa ảnh từ CMS qua API hiện có `/api/v3.3/persons/{person_id}/image`.
- `/api/v3.6/curated-people` và `/api/v3.6/source-status` trả danh mục bổ sung và trạng thái đối chiếu nguồn.

## Giới hạn dữ liệu từ donglichsu.com

Ở thời điểm kiểm tra, `https://donglichsu.com/#section=people` không truy cập được qua công cụ duyệt web, vì vậy **chưa có mục nào được xác nhận là lấy từ trang này**. Tệp `data/v36_source_status.json` thể hiện minh bạch trạng thái nhập. Có thể nhập tiếp khi URL mở được hoặc khi có file xuất danh mục từ chủ website.

## Ảnh và tính xác thực

Hai ảnh quan văn và quan võ là minh họa tổng quát, không phải chân dung thực của nhân vật lịch sử. Không ghi nhận đây là chân dung của vua hay danh tướng cụ thể. Các ảnh tùy chỉnh do người quản trị tải lên không bị ghi đè.

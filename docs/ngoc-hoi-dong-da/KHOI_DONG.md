# Dự án sa bàn Ngọc Hồi – Đống Đa 1789 (khởi động)

Cập nhật: 19/11/2026. Tài liệu khởi đầu cho dự án mới, ghi lại hiện trạng file Blender để các lần làm sau nối tiếp.

> Nội dung tái dựng mô phỏng, cần đối chiếu tư liệu. Tài liệu này chỉ ghi dữ liệu kỹ thuật của file Blender, chưa đưa ra nhận định lịch sử.

## 1. File Blender hiện có
- Tên file: `NHDD_1789_DiaHinh_V3.blend` (không đưa lên repo, giống quy ước với các file `.blend` khác).
- Blender 5.3.0, engine EEVEE, độ phân giải 1920x1080, 30 fps.
- Timeline: frame 1–31950.
- Camera đang chọn: `Cam_ThangLong_HoangThanh`.

## 2. Nội dung cảnh (đọc từ Blender ngày 19/11/2026)
Tổng 119 đối tượng: 45 mesh, 15 curve, 28 font, 23 empty, 7 camera, 1 light.

| Nhóm | Ví dụ tên đối tượng |
|---|---|
| Địa hình, mặt nước | `DiaHinh_NHDD` (khoảng 19600 x 24580 đơn vị), `MatNuoc_NHDD` |
| Mesh đường | `Duong_ThienLy`, `Duong_KhuongThuong_HaDong`, `Duong_CauGiay_CauDien`, `Duong_VanDien_DamMuc_HaDong`, `Duong_NgocHoi_DaiAng`, `Duong_ThangLong_BenSong`, `Duong_KimLien_KhuongThuong`, `Duong_LaThanh` |
| Curve tuyến đường | `Tuyen_Duong_*` (tương ứng từng mesh đường ở trên) |
| Curve sông | `Tuyen_Song_Hong`, `Tuyen_Song_ToLich` |

Vật liệu đã thấy: `VL_DiaHinh`, `VL_Nuoc`, `VL_DuongDat`. Chưa có HDRI. 99 đối tượng còn lại chưa liệt kê chi tiết.

## 3. Việc cần làm tiếp
- [ ] Liệt kê đầy đủ 119 đối tượng, ghi quy ước đặt tên và hệ toạ độ.
- [x] Kịch bản 14 cảnh (KICH_BAN_NGOC_HOI_DONG_DA_1789_V1.md trên máy anh Thắng) – dựng thành phim V10.7, xem `README.md`.
- [x] Xuất dữ liệu web: `vietsu/static/khong-gian/ngoc-hoi-dong-da/` (22/11/2026).
- [x] Nút vào sa bàn trong mục Không gian lịch sử (22/11/2026). Giao diện Việt Sử V4.6 đang khóa, nên việc này cần yêu cầu cụ thể của chủ dự án.
- [ ] Đối chiếu tư liệu lịch sử, ghi nguồn, giữ nhãn "Tái dựng mô phỏng".

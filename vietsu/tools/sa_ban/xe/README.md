# Xe cơ giới cho sa bàn (bpy làm thư viện, không mở Blender của anh Thắng)

- `bake_xe.py <fbx Tripo> <ra.glb> tank|truck <số đo m> <số tam giác> [số hiệu]` — xoay mũi xe về −Y Blender, đặt bánh chạm đất, tỉ lệ theo số đo
  (tank: chiều dài thân xe phần thấp, không tính nòng; truck: chiều dài toàn xe), giảm lưới, ảnh màu 1024 jpg.
  Có `[số hiệu]`: xoá chữ trắng máy sinh trong ảnh màu (cv2.inpaint) rồi dán số hiệu thật hai bên tháp pháo, bám mặt cong (Shrinkwrap), đặt liền sau phù hiệu tròn.
  Xe tải: xoá chữ vô nghĩa và lốp viền trắng. Đầu xe tải đoán sai thì chạy lại với `LAT=1`.
  Sau đó: `gltf-transform meshopt <ra>.raw.glb packs/<gói>/props/xe/<tên>.glb`.
- `chup.py`, `chup_can.py` — ảnh 3 góc / cận hai bên (Cycles CPU) để duyệt.
- `bang_dt.py <glb có xương> <thư mục>` — bảng soát động tác (mỗi clip 3 thời điểm).

Đã làm (HCM 1975): xe tăng 390 (T-59), 843 (T-54B) — thân 6,04 m; xe tải 6,7 m (ước lượng).

# Xe cơ giới cho sa bàn (bpy làm thư viện, không mở Blender của anh Thắng)

- `bake_xe.py <fbx Tripo> <ra.glb> tank|truck <số đo m> <số tam giác> [số hiệu]` — xoay mũi xe về −Y Blender, đặt bánh chạm đất, tỉ lệ theo số đo
  (tank: chiều dài thân xe phần thấp, không tính nòng; truck: chiều dài toàn xe), giảm lưới, ảnh màu 1024 jpg.
  Có `[số hiệu]`: xoá chữ trắng máy sinh trong ảnh màu (cv2.inpaint) rồi dán số hiệu thật hai bên tháp pháo, bám mặt cong (Shrinkwrap), đặt liền sau phù hiệu tròn.
  Xe tải: xoá chữ vô nghĩa và lốp viền trắng. Đầu xe tải đoán sai thì chạy lại với `LAT=1`.
  Sau đó: `gltf-transform meshopt <ra>.raw.glb packs/<gói>/props/xe/<tên>.glb`.
- `bake_vat.py <fbx> <ra.raw.glb> dai|rong|cao <số đo m> <số tam giác>` — vật dụng không phải xe (pháo, máy bay, trực thăng): đo theo một cạnh, `XOAY=<độ>` xoay mũi về −Y, `XOA_TRANG=1` xoá chữ / phù hiệu trắng máy sinh.
- `chup.py`, `chup_can.py` — ảnh 3 góc / cận hai bên (Cycles CPU) để duyệt.
- `bang_dt.py <glb có xương> <thư mục>` — bảng soát động tác (mỗi clip 3 thời điểm).

Đã làm (HCM 1975): xe tăng 390 (T-59), 843 (T-54B) — thân 6,04 m; xe tải 6,7 m (ước lượng).

Đã làm (24/11): pháo cao xạ 37 mm hai nòng (Type 65) — rộng 1,80 m theo weaponsystems.net; trực thăng UH-1 — thân 12,77 m, đã xoá chữ ARMY và sao Mỹ máy sinh.
Đã làm (24/11 chiều): M41 (rộng 3,19 m), C-130A (dài 29,79 m, `XOA_TOI=1`), A-37 (dài 8,92 m, `XOAY=90 XOA_TRANG=1`), D-74 (rộng 2,35 m, `XOAY=-90`).

Đã làm (25/11, Khe Sanh 1968): PT-76 số 555 — `bake_xe.py <fbx> <ra.glb> tank 5.442 30000 555` (số đo 5,442 cho ra rộng 3,15 m, cao 2,30 m). Thêm: đọc Color.jpg khi Tripo không xuất png; xe không có chữ số cũ thì dán số giữa hai bên tháp pháo, chiếu thẳng theo trục X (tránh tay nắm, móc).

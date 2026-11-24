# Lính QĐVN 1972 (V2.2, 23/11/2026)

Hai mẫu Tripo trong `_KHO-CHUNG/nhan-vat/LinhQDVN1972` (đầu trần, mũ tai bèo; không ba lô) được gắn vào **đúng khung xương QĐND cũ** (`qdnd.glb`, 33 xương mixamorig) nên dùng lại mọi động tác cũ.

1. `fbx2glb.py` (bpy 5.3 trong máy làm việc): FBX → glb tĩnh.
2. `build.mjs <a|b> 1.70 45`: hạ hai tay khung xương cũ 45° cho khớp tư thế chữ A của mẫu mới, phóng mẫu mới lên 1,70 m, lấy trọng số da từ 8 đỉnh gần nhất của thân cũ (đỉnh thân không nhận trọng số tay), rồi "duỗi" mẫu mới về tư thế chữ T của khung xương cũ.
3. `write.mjs`: thay lưới trong `qdnd.glb` bằng lưới mới, IBM = nghịch đảo ma trận khớp lúc nghỉ, bỏ hoạt cảnh, giản lược còn ~21k đỉnh, nén meshopt → `models/qdvn_a.glb`, `qdvn_b.glb`.
4. `fbxanim.py` + `retarget.mjs`: chuyển động tác Mixamo (Sitting Idle, Male Sitting Pose, Prone Firing Rifle, Standing Aim Recoil) sang khung xương QĐND theo xoay thế giới → `data/clips_moi.json` (NgoiOmSung, NgoiGheSung, NgoiNghiSung, NamBan, DungBan, DungNgam). "Rifle Crouch Idle To Walk" chuyển ra sai (ngã ngửa) nên chưa dùng.

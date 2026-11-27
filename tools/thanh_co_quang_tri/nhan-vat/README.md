# Lính QĐVN 1972 (V2.2, 23/11/2026)

Hai mẫu Tripo trong `_KHO-CHUNG/nhan-vat/LinhQDVN1972` (đầu trần, mũ tai bèo; không ba lô) được gắn vào **đúng khung xương QĐND cũ** (`qdnd.glb`, 33 xương mixamorig) nên dùng lại mọi động tác cũ.

1. `fbx2glb.py` (bpy 5.3 trong máy làm việc): FBX → glb tĩnh.
2. `build.mjs <a|b> 1.70 45`: hạ hai tay khung xương cũ 45° cho khớp tư thế chữ A của mẫu mới, phóng mẫu mới lên 1,70 m, lấy trọng số da từ 8 đỉnh gần nhất của thân cũ (đỉnh thân không nhận trọng số tay), rồi "duỗi" mẫu mới về tư thế chữ T của khung xương cũ.
3. `write.mjs`: thay lưới trong `qdnd.glb` bằng lưới mới, IBM = nghịch đảo ma trận khớp lúc nghỉ, bỏ hoạt cảnh, giản lược còn ~21k đỉnh, nén meshopt → `models/qdvn_a.glb`, `qdvn_b.glb`.
4. `fbxanim.py` + `retarget.mjs`: chuyển động tác Mixamo (Sitting Idle, Male Sitting Pose, Prone Firing Rifle, Standing Aim Recoil) sang khung xương QĐND theo xoay thế giới → `data/clips_moi.json` (NgoiOmSung, NgoiGheSung, NgoiNghiSung, NamBan, DungBan, DungNgam). "Rifle Crouch Idle To Walk" chuyển ra sai (ngã ngửa) nên chưa dùng.

# V2.4 (27/11/2026): người dân, khí tài, động tác mới

5. **Người dân** (kho `_KHO-CHUNG/nhan-vat/_moi`: `nhan-vat-nam-sai-gon` áo sơ mi, `nhan-vat-nu-sai-gon` váy trắng, `nu-ao-dai-trang` áo dài): `fbx2glb.py` → `arm.mjs` đo góc tay chữ A (49°, 47°, 49°) → `build.mjs <nam|nu|aodai> 1.70 <góc>` (dựng ở 1,70 m cho khớp khung xương, khi chạy thu nhỏ nữ còn ~0,93) → `write_dan.mjs` (bỏ súng) → `models/dan_nam.glb`, `dan_nu.glb`, `dan_aodai.glb`. Màu áo dài / váy khác (`tex/aodai_*.webp`, `tex/vay_*.webp`): nhuộm lại vùng vải trắng (sáng, ít màu) của ảnh màu gốc, giữ sáng tối.
6. **Động tác người dân** (`data/clips_dan.json`, tải sau): Mixamo Walk (đi, làm tại chỗ, chạy chậm 0,7 lần cho khớp 1,07 m/s), Sad Idle (đứng, cũng làm nền cho tư thế thắp hương — hai tay bẻ bằng IK, thân cúi vái), Pointing, Happy Idle, Sitting Idle. **Lưu ý:** Walking.fbx và Standing Idle.fbx có khung Z-up; chuyển với `rx:-90` vẫn ra người nằm ngang → không dùng.
7. **Kéo thuyền, đẩy thuyền** (`KeoLui`, `DayThuyen` trong `data/clips_moi.json`): `glbanim.py` lấy thẳng clip `INPLACE_Pull Heavy Object`, `INPLACE_Pushing` từ `dien-bien-phu/models/linh.glb` (cùng khung xương Rig_QDND_V2, đã so tư thế nghỉ).
8. **Xe tăng, khí tài**: mẫu của gói HCM 1975 (`xe-tang-m48/m41`, `m113`, `843` → T-54 bỏ số) và Khe Sanh 1968 (`pt76`, `m-46-130mm`, `cao-xa-37-2-nong`, `m2a1-105mm`, `uh-1`), nén lại bằng `reenc.mjs` (meshopt mức medium). **Nạp lần lượt**, không `Promise.all` nhiều GLB meshopt cùng lúc: Chrome SwiftShader bị sập tab ("Target crashed").

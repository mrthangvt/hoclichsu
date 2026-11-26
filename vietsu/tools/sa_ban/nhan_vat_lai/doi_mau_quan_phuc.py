"""Đổi màu quân phục trong ảnh màu nhân vật đã nướng (vd. units/linh-my.jpg) về một màu đích, giữ vân, nếp vải, độ sáng tối.
python3 doi_mau_quan_phuc.py <vào.jpg> <ra.jpg> <H đích 0-180 (OpenCV)> <hệ số S> <hệ số V> [dòng cuối vùng nhân vật, mặc định 512]
Chỉ đổi điểm ảnh xanh lá / xanh ô liu (H 25–90, S, V > 30); da, giày đen, dải cờ ở cuối ảnh giữ nguyên.
V1.6 Khe Sanh (anh Thắng gửi ảnh quân phục ô liu): python3 doi_mau_quan_phuc.py linh-my.jpg linh-my.jpg 30 0.85 1.12"""
import sys, numpy as np, cv2
from PIL import Image
vao, ra, H, ks, kv = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
cuoi = int(sys.argv[6]) if len(sys.argv) > 6 else 512
t = np.array(Image.open(vao).convert('RGB')); a = t[:cuoi].copy()
hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV).astype(np.float32)
m = (hsv[..., 0] > 25) & (hsv[..., 0] < 90) & (hsv[..., 1] > 30) & (hsv[..., 2] > 30)
h0 = np.median(hsv[..., 0][m])
hsv[..., 0] = np.where(m, H + (hsv[..., 0] - h0) * 0.3, hsv[..., 0])        # dồn sắc về màu đích, giữ chút khác biệt giữa các mảng vải
hsv[..., 1] = np.where(m, np.clip(hsv[..., 1] * ks, 0, 255), hsv[..., 1])
hsv[..., 2] = np.where(m, np.clip(hsv[..., 2] * kv, 0, 255), hsv[..., 2])
t[:cuoi] = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
Image.fromarray(t).save(ra, quality=90)
print(f'xong: {ra} | đổi {m.mean() * 100:.0f} % điểm ảnh vùng nhân vật, sắc giữa {h0:.0f} → {H:.0f}')

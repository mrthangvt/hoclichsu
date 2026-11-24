"""Đổi màu áo trên ảnh màu nhân vật đám đông (giữ sáng tối của nếp vải) để có nhiều màu áo dài / sơ mi mà không thêm lưới.
python3 doi_mau_ao.py <ảnh.jpg> <nu|nam> <tiền tố ra>  → <tiền tố>-<màu>.jpg"""
import sys, colorsys
import numpy as np
from PIL import Image
src, loai, ra = sys.argv[1:4]
A = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
r, g, b = A[..., 0], A[..., 1], A[..., 2]; mx, mn = A.max(-1), A.min(-1); s = (mx - mn) / np.maximum(mx, 1e-3)
if loai == 'nu': m = (r > g * 1.25) & (g > b * 1.1) & (s > 0.45) & (mx > 0.35)          # áo dài cam
else: m = (b > r + 0.04) & (s < 0.45) & (mx > 0.3)                                        # sơ mi xanh xám
lum = (0.3 * r + 0.59 * g + 0.11 * b); k = lum / max(lum[m].mean(), 1e-3)
MAU = {'nu': {'trang': (0.95, 0.95, 0.93), 'xanh': (0.55, 0.72, 0.9), 'hong': (0.95, 0.6, 0.72), 'tim': (0.62, 0.5, 0.8), 'vang': (0.96, 0.85, 0.45), 'do': (0.8, 0.15, 0.15)},
       'nam': {'trang': (0.93, 0.93, 0.9), 'kem': (0.9, 0.86, 0.74), 'xanh': (0.62, 0.75, 0.9), 'ke': (0.75, 0.78, 0.8)}}[loai]
for ten, c in MAU.items():
    B = A.copy(); B[m] = np.clip(np.array(c)[None] * np.clip(k[m], 0.55, 1.25)[:, None], 0, 1)
    Image.fromarray((B * 255).astype(np.uint8)).save(f'{ra}-{ten}.jpg', quality=85); print(ra, ten, int(m.sum()))

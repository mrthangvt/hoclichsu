// ---------- người: V1.3 dùng nhân vật có xương nướng sẵn (04x_xnv.js) ----------
const ANIM = { dung: 0, di: 1, chay: 2, ngam: 3, dao: 4, cheo: 5, chet: 6, khieng: 7, chihuy: 8, napphao: 9, ngoi: 10, cang: 11, vaychao: 12, ban: 13, quy: 14, vac: 15, keo: 16, day: 17, dam: 18, sungngan: 19 };
const CLIPN = Object.keys(ANIM).sort((a, b) => ANIM[a] - ANIM[b]);
const b64 = (s, T) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); };
const hex = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const nguoiU = { uT: { value: 0 } };
// phe → mẫu nhân vật, binh khí, nhuộm màu (MINH HOẠ – quân phục theo ảnh mẫu anh gửi)
const PHE = {
  nguyen:   { kind: 'nguyen', vk: 'dieuthuong', tint: [[1, 1, 1], [0.94, 0.92, 0.9], [1, 0.97, 0.93]] },
  phaothu:  { kind: 'nguyen', vk: null, tint: [[1, 1, 1], [0.93, 0.9, 0.88]] },
  danbinh:  { kind: 'danbinh', vk: 'giao', tint: [[1, 1, 1], [0.9, 0.88, 0.84], [0.96, 0.92, 0.86]] },
  dan:      { kind: ['dannam', 'dannu'], vk: null, tint: [[1, 1, 1], [0.92, 0.9, 0.86], [0.85, 0.82, 0.78], [1, 0.96, 0.9]] },
  phap:     { kind: 'phap', vk: 'sungtruong', tint: [[1, 1, 1], [0.95, 0.95, 0.98]] },
  phapxanh: { kind: 'phap', vk: 'sungngan', tint: [[0.72, 0.74, 0.82]] },
  tbn:      { kind: 'phap', vk: 'sungtruong', tint: [[1.05, 1.0, 0.82], [1.0, 0.96, 0.8]] },
  thuy:     { kind: 'phap', vk: null, tint: [[0.86, 0.95, 1.12], [0.9, 0.98, 1.1]] },
};
const VK_CU = { khong: null, sung: undefined, giao: 'giao', guom: 'guom', xeng: 'xeng', bo: 'bo', co: 'giao' };

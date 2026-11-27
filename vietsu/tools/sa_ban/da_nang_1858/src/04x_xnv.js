// ---------- V1.3: nhân vật có xương nướng sẵn thành chuỗi khung hình (nv/x_<tên>.json) ----------
// Mỗi động tác = chuỗi khung; mỗi khung là một InstancedMesh (theo cách của sa bàn Bạch Đằng).
// Khung bàn tay phải (mg) và khung hai tay (mt) theo từng khung hình để gắn súng, gươm, mái chèo.
const XNV = {};
const XIMS = [];
async function napXNV(ten, cap) {
  const d = await (await fetch(URLG('nv/x_' + ten + '.json'))).json();
  const tex = new THREE.Texture(await loadImg('nv/' + d.tex)); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const vids = b64(d.vids, Uint16Array), idx = d.idx32 ? b64(d.idx, Uint32Array) : b64(d.idx, Uint16Array), uv = b64(d.uv, Float32Array);
  const nE = vids.length, nv = d.nv, q = d.q;
  const index = new THREE.BufferAttribute(idx, 1), uvA = new THREE.BufferAttribute(uv, 2);
  const wi = new Uint32Array(idx.length); for (let i = 0; i < idx.length; i++) wi[i] = vids[idx[i]];
  const mat = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, emissiveMap: tex, emissive: 0x3a3a3a });   // tự sáng nhẹ để không tối đen khi ngược sáng
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3);
  const clips = {};
  for (const [name, c] of Object.entries(d.clips)) {
    const frames = c.pos.map((pb) => {
      const qa = b64(pb, Int16Array); for (let i = 0; i < qa.length; i++) P[i] = qa[i] * q;
      N.fill(0);
      for (let t = 0; t < wi.length; t += 3) {        // pháp tuyến trên lưới đã hàn (không lộ đường may uv)
        const a = wi[t] * 3, b = wi[t + 1] * 3, cc = wi[t + 2] * 3;
        const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[cc] - P[a], vy = P[cc + 1] - P[a + 1], vz = P[cc + 2] - P[a + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        N[a] += nx; N[a + 1] += ny; N[a + 2] += nz; N[b] += nx; N[b + 1] += ny; N[b + 2] += nz; N[cc] += nx; N[cc + 1] += ny; N[cc + 2] += nz;
      }
      const pos = new Float32Array(nE * 3), nor = new Int8Array(nE * 3);
      for (let i = 0; i < nE; i++) {
        const s = vids[i] * 3; pos[i * 3] = P[s]; pos[i * 3 + 1] = P[s + 1]; pos[i * 3 + 2] = P[s + 2];
        const l = Math.hypot(N[s], N[s + 1], N[s + 2]) || 1; nor[i * 3] = N[s] / l * 127; nor[i * 3 + 1] = N[s + 1] / l * 127; nor[i * 3 + 2] = N[s + 2] / l * 127;
      }
      const g = new THREE.BufferGeometry(); g.setIndex(index); g.setAttribute('uv', uvA);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3, true));
      g.boundingSphere = new THREE.Sphere(new V3(0, 1, 0), 3); return g;
    });
    clips[name] = { fps: c.fps, once: !!c.once, frames, mg: Float32Array.from(c.mg), mt: Float32Array.from(c.mt), ims: [] };
  }
  XNV[ten] = { clips, mat, cap: cap || 400, h: d.h };
}
function xIM(K, C, f) {
  let im = C.ims[f];
  if (!im) {
    im = new THREE.InstancedMesh(C.frames[f], K.mat, K.cap); im.frustumCulled = false; im.count = 0; im.visible = false;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.setColorAt(0, new THREE.Color(1, 1, 1)); scene.add(im); C.ims[f] = im; XIMS.push(im);
  }
  return im;
}
function xFrame(C, t, ph, tSeg) {
  const n = C.frames.length; if (n === 1) return 0;
  if (C.once) return Math.min(n - 1, Math.floor(Math.max(0, tSeg) * C.fps));
  return mod(Math.floor(t * C.fps + ph * n), n);
}
// --- binh khí, đồ cầm tay (toạ độ: +Y về phía mũi/đầu, gốc ở nắm tay) ---
const GO = 0x5c3a22, GO2 = 0x7a5232, SAT = 0x2d2f33, DONG = 0xb08a3e, SATG = 0x6e6458;
const XWGEO = {};
function dungBinhKhi() {
  let g;
  // súng trường Pháp (ảnh 1: nòng bát giác sẫm, báng gỗ, đai đồng) — báng về −Y, nòng về +Y
  g = new Ghep();
  g.hop(0.03, 0.98, 0.03, 0, 0.5, 0, SAT); g.tru(0.007, 0.007, 0.06, 0, 1.0, -0.018, SAT, 5);
  g.hop(0.045, 0.62, 0.05, 0, 0.18, 0.025, GO2); g.hop(0.045, 0.36, 0.1, 0, -0.2, 0.075, GO2, 0, -0.2);   // báng trễ xuống (bụng súng quay xuống đất)
  g.hop(0.05, 0.03, 0.12, 0, -0.38, 0.11, DONG, 0, -0.2);
  for (const y of [0.42, 0.72]) g.hop(0.05, 0.022, 0.055, 0, y, 0.012, DONG);
  g.hop(0.012, 0.09, 0.03, 0, 0.02, 0.07, DONG); g.hop(0.02, 0.04, 0.03, 0, 0.06, -0.03, SAT);
  XWGEO.sungtruong = g.geo();
  // điểu thương nhà Nguyễn (ảnh 3: súng dài, nòng xỉn, báng cong gỗ sẫm)
  g = new Ghep();
  g.hop(0.032, 1.12, 0.032, 0, 0.56, 0, SATG); g.hop(0.05, 0.78, 0.045, 0, 0.22, 0.026, GO);
  g.hop(0.05, 0.38, 0.11, 0, -0.22, 0.085, GO, 0, -0.28); g.hop(0.014, 0.1, 0.035, 0, 0.02, 0.07, SATG);   // báng cong trễ xuống
  for (const y of [0.35, 0.6, 0.9]) g.hop(0.05, 0.02, 0.055, 0, y, 0.012, SATG);
  g.hop(0.03, 0.06, 0.04, 0, 0.08, -0.035, SATG);
  XWGEO.dieuthuong = g.geo();
  // súng ngắn ổ quay (ảnh 2): báng theo ±Y qua nắm tay, nòng về −X (hướng ngón tay trỏ)
  g = new Ghep();
  g.hop(0.03, 0.11, 0.035, 0, -0.01, 0, 0x2a2420); g.tru(0.024, 0.024, 0.05, -0.035, 0.07, 0, SAT, 8, 0, 0, Math.PI / 2);
  g.tru(0.009, 0.009, 0.15, -0.13, 0.08, 0, SAT, 6, 0, 0, Math.PI / 2); g.hop(0.04, 0.03, 0.03, 0.005, 0.07, 0, SAT);
  XWGEO.sungngan = g.geo();
  g = new Ghep(); g.tru(0.016, 0.016, 0.22, 0, -0.04, 0, 0x2a1d16, 5); g.hop(0.12, 0.025, 0.04, 0, 0.08, 0, DONG); g.hop(0.04, 0.78, 0.008, 0, 0.48, 0, 0xb8b8bc);
  XWGEO.guom = g.geo();
  g = new Ghep(); g.tru(0.017, 0.017, 2.5, 0, 0.55, 0, GO2, 5); g.them(new THREE.ConeGeometry(0.035, 0.28, 5), M4(0, 1.92, 0), 0x9a9a9e); g.hop(0.07, 0.1, 0.07, 0, 1.73, 0, 0x8a2018);
  XWGEO.giao = g.geo();
  g = new Ghep(); g.tru(0.018, 0.018, 1.2, 0, 0.1, 0, GO2, 5); g.hop(0.2, 0.26, 0.02, 0, -0.62, 0.02, 0x6a6a6a);
  XWGEO.xeng = g.geo();
  g = new Ghep(); g.tru(0.02, 0.022, 0.8, 0, 0.26, 0, GO2, 5); g.hop(0.18, 0.13, 0.025, 0.08, 0.6, 0, 0x7a7a7e);
  XWGEO.riu = g.geo();
  g = new Ghep(); g.tru(0.018, 0.02, 0.6, 0, 0.18, 0, GO2, 5); g.hop(0.18, 0.09, 0.09, 0, 0.47, 0, 0x3a3028);
  XWGEO.bua = g.geo();
  g = new Ghep(); g.tru(0.022, 0.022, 1.6, 0, -0.25, 0, GO2, 5); g.hop(0.15, 0.48, 0.025, 0, -1.2, 0, GO2);
  XWGEO.cheo = g.geo();
  g = new Ghep(); for (let k = 0; k < 5; k++) g.tru(0.035, 0.035, 3.2, (k % 3 - 1) * 0.06, 0.6, (k > 2 ? 0.06 : -0.02), k % 2 ? 0x8ea24e : 0x9caf58, 5);
  XWGEO.bo = g.geo();
  for (const k in XWGEO) XWGEO[k].computeBoundingSphere();
}
const XW = {};
const XWMAT = new THREE.MeshLambertMaterial({ vertexColors: true });
function xwIM(k) {
  if (!XW[k]) { const im = new THREE.InstancedMesh(XWGEO[k], XWMAT, k === 'bo' ? 200 : 1600); im.frustumCulled = false; im.count = 0; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(im); XW[k] = im; }
  return XW[k];
}
// động tác nào thì cầm súng bằng hai tay (theo đường nối hai bàn tay)
const HAI_TAY = { dung: 1, di: 1, ngam: 1, ban: 1, quy: 1, napphao: 1 };
const KHONG_CAM = { chet: 1, cang: 1, ngoi: 1, vac: 1, khieng: 1, keo: 1, day: 1, vaychao: 1 };
const _xm = new THREE.Matrix4(), _xb = new THREE.Matrix4(), _xq = new THREE.Quaternion(), _xs = new V3(), _xp = new V3(), _xe = new THREE.Euler();
const _gx = new V3(), _gy = new V3(), _gz = new V3(), _xc = new THREE.Color();
function xGrip(A, f) {
  const o = f * 9;
  _gy.set(A[o], A[o + 1], A[o + 2]).normalize(); _gz.set(A[o + 3], A[o + 4], A[o + 5]);
  _gz.addScaledVector(_gy, -_gz.dot(_gy)).normalize(); _gx.crossVectors(_gy, _gz);
  return _xb.makeBasis(_gx, _gy, _gz).setPosition(A[o + 6], A[o + 7], A[o + 8]);
}
const XMUZ = new V3();   // đầu nòng của người vừa vẽ (toạ độ thế giới) — để đặt chớp lửa
// vẽ một người: kiểu, động tác, giây động tác, pha, vị trí, hướng (rad), tỉ lệ, màu nhuộm [r,g,b], binh khí, giây trong đoạn (động tác một lần)
function xPut(ten, clip, t, ph, x, y, z, yaw, sc, tint, vk, tSeg = 0, nghieng = 0) {
  const K = XNV[ten]; if (!K) return false;
  const C = K.clips[clip] || K.clips.dung; const f = xFrame(C, t, ph, tSeg); const im = xIM(K, C, f);
  if (im.count >= K.cap) return false;
  _xe.set(nghieng, yaw, 0, 'YXZ'); _xq.setFromEuler(_xe); _xs.set(sc, sc, sc);
  _xm.compose(_xp.set(x, y, z), _xq, _xs);
  im.setMatrixAt(im.count, _xm); im.setColorAt(im.count, _xc.setRGB(tint[0], tint[1], tint[2])); im.count++;
  if (vk && !KHONG_CAM[clip] && XWGEO[vk]) {
    const cl = K.clips[clip] ? clip : 'dung';
    const sung = vk === 'sungtruong' || vk === 'dieuthuong';
    const W2 = _xb; xGrip(sung && HAI_TAY[cl] ? C.mt : C.mg, f);
    const wim = xwIM(vk);
    if (wim.count < wim.instanceMatrix.count) { const M = W2.premultiply(_xm); wim.setMatrixAt(wim.count++, M); if (sung) XMUZ.set(0, 1.05, 0).applyMatrix4(M); }
  }
  return true;
}
function xBegin() { for (const im of XIMS) im.count = 0; for (const k in XW) XW[k].count = 0; }
function xEnd() {
  for (const im of XIMS) { im.visible = im.count > 0; if (im.count) { im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; } }
  for (const k in XW) XW[k].instanceMatrix.needsUpdate = true;
}
const _hY = new V3(0, 1, 0);
// vị trí bàn tay phải (thế giới) của người vẽ bằng xPut cùng tham số
function xHand(ten, clip, t, ph, x, y, z, yaw, sc = 1, trai = false) {
  const K = XNV[ten]; if (!K) return new V3(x, y + 1.4, z);
  const C = K.clips[clip] || K.clips.dung, f = xFrame(C, t, ph, 0), o = f * 9;
  let hx = C.mg[o + 6], hy = C.mg[o + 7], hz = C.mg[o + 8];
  if (trai) { const A = C.mt; hx = A[o + 6]; hy = A[o + 7]; hz = A[o + 8]; }
  return new V3(hx, hy, hz).multiplyScalar(sc).applyAxisAngle(_hY, yaw).add(new V3(x, y, z));
}

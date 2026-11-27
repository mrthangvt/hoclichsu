// ---------- dàn cảnh: tàu, nhóm người, sự kiện bắn, theo giây voice ----------
let ST = null;                    // story.json
const SC = {};                    // id hồi -> hồi
const SH = {};                    // id cú máy -> cú máy
const TC = (id, k = 0) => { const s = SC[id]; return k <= 0 ? s.t0 : (s.moc[Math.min(k, s.moc.length - 1)] ?? s.t0); };   // mốc câu k (0 = đầu hồi)
const TS = (id) => SH[id].t0, TE = (id) => SH[id].t1;

// ---------- hạm đội (12 chiếc theo Châu bản: thuyền buồm + tàu máy) · tên MINH HOẠ ----------
const TAU = [];
const TAU_DEF = [
  { ten: 'Kỳ hạm (khinh hạm hơi nước)', L: 72, B: 14.5, cot: 3, ong: 1, soCua: 14, ban: 1 },
  { ten: 'Hộ tống hạm', L: 60, B: 12, cot: 3, ong: 1 },
  { ten: 'Hộ tống hạm', L: 58, B: 11.5, cot: 3, ong: 1 },
  { ten: 'Pháo hạm', L: 42, B: 8.5, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 42, B: 8.5, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Pháo hạm', L: 40, B: 8, cot: 2, ong: 1, soCua: 5 },
  { ten: 'Tàu Tây Ban Nha', L: 50, B: 9.5, cot: 2, ong: 1, banhGuong: 1, coKieu: 'tbn', soCua: 6 },
  { ten: 'Tàu vận tải', L: 66, B: 12.5, cot: 3, ong: 1, banhGuong: 1, soCua: 6 },
  { ten: 'Tàu vận tải', L: 64, B: 12, cot: 3, ong: 1, banhGuong: 1, soCua: 6 },
  { ten: 'Tàu thông tin', L: 46, B: 8.5, cot: 2, ong: 1, banhGuong: 1, soCua: 4 },
];
// vị trí: biển xa → vào vịnh → trận bắn phá 1/9 → áp sát cửa sông 2/9 → neo vịnh → rời đi
const VT_XA = (i) => [-2600 + (i % 4) * 380 + Math.floor(i / 4) * 120, 23000 + Math.floor(i / 4) * 900 + (i % 2) * 200];
const VT_VAO = (i) => [-1900 + (i % 4) * 330, 9800 + Math.floor(i / 4) * 650];
const VT_CHO = (i) => [-2600 + (i % 4) * 420, 5200 + Math.floor(i / 4) * 520];
const VT_BAN1 = [[-1800, 3400], [-1450, 2950], [-1150, 2520], [-850, 2100], [-560, 1700], [-280, 1300], [-2500, 3900], [-2150, 3550], [-2000, 4300], [-2700, 4700], [-3100, 4200], [-1600, 3900]];
const VT_BAN2 = [[-300, 1250], [0, 900], [250, 600], [-650, 1050], [-450, 650], [-150, 350], [-2400, 3200], [-1900, 2700], [-2100, 3800], [-2800, 4400], [-3200, 3700], [-1200, 2300]];
const VT_NEO = (i) => [-2700 + (i % 4) * 520, 2500 + Math.floor(i / 4) * 620 + (i % 2) * 150];
const RA_DI = [0, 3, 4, 5, 8, 9, 10, 11];      // rời đi tháng 2/1859 (phần lớn lực lượng)
function lichTau(i) {
  const K = [];
  const a = VT_XA(i), b = VT_VAO(i), c = VT_CHO(i), d = VT_BAN1[i], e = VT_BAN2[i], f = VT_NEO(i);
  K.push([0, a[0], a[1] + 6000, 180, 0], [TS('C01-05') - 0.01, a[0], a[1] + 6000, 180, 0], [TS('C01-05'), a[0] + 800, a[1] - 13200, 180, 1], [TE('C01-05'), a[0] + 800, a[1] - 13800, 180, 1]);
  K.push([TS('C02-01'), a[0] + 300, a[1] + 2000, 180, 1], [TE('C02-05'), a[0] + 300, a[1] - 1800, 180, 1]);
  K.push([TS('C03-01'), b[0], b[1] + 1500, 185, 1], [TE('C03-03'), b[0], b[1] - 600, 185, 1]);
  K.push([TS('C03-04'), c[0] + 250, c[1] + 1400, 190, 1], [TE('C03-04') + 2, c[0], c[1], 200, 0]);
  K.push([TS('C04-01'), d[0] - 150, d[1] + 260, 150, 0], [TS('C04-01') + 10, d[0], d[1], 150, 0]);
  K.push([TS('C05-01'), e[0], e[1] + 300, 160, 0], [TC('C05', 3) + 4, e[0], e[1], 160, 0]);
  K.push([TS('C06-01'), f[0], f[1], 210, 0]);
  if (RA_DI.includes(i)) {
    K.push([TS('C11-03'), f[0], f[1], 20, 0], [TE('C11-03'), f[0] + 300, f[1] + 2200, 10, 1], [TE('C11-03') + 6, f[0] + 400, f[1] + 30000, 10, 1]);
  } else {
    K.push([TS('C12-02'), f[0], f[1], 20, 0], [TE('C12-02'), f[0] + 250, f[1] + 2400, 15, 1], [TE('C12-02') + 6, f[0] + 400, f[1] + 30000, 15, 1]);
  }
  return K;
}
function viTriTau(K, t) {
  if (t <= K[0][0]) return { x: K[0][1], n: K[0][2], h: K[0][3], buom: K[0][4], v: 0 };
  for (let k = 0; k < K.length - 1; k++) {
    const A = K[k], B = K[k + 1];
    if (t >= A[0] && t < B[0]) {
      const u = (t - A[0]) / Math.max(B[0] - A[0], 1e-3), x = lerp(A[1], B[1], u), n = lerp(A[2], B[2], u);
      const dx = B[1] - A[1], dn = B[2] - A[2], L = Math.hypot(dx, dn), v = L / Math.max(B[0] - A[0], 1e-3);
      const h = (L > 30 && v < 400) ? Math.atan2(dx, dn) / D2R : lerp(A[3], B[3], u);
      return { x, n, h: v > 400 ? A[3] : h, buom: A[4], v: v > 400 ? 0 : v };
    }
  }
  const L = K[K.length - 1]; return { x: L[1], n: L[2], h: L[3], buom: L[4], v: 0 };
}
function dungHamDoi() {
  TAU_DEF.forEach((o, i) => { const g = taoTau(o); g.userData.K = lichTau(i); g.userData.i = i; TAU.push(g); });
}
const _v = new V3();
function tauCapNhat(t) {
  for (const g of TAU) {
    const s = viTriTau(g.userData.K, t), u = g.userData;
    const xa = Math.hypot(s.x, s.n) > 40000;
    g.visible = !xa;
    g.position.set(s.x, 4 * u.L / 66 + 0.05 + Math.sin(t * 0.7 + u.i) * 0.08, -s.n);   // V1.3: đáy tàu (y = −4 trong mẫu) bằng mặt nước
    g.rotation.set(Math.sin(t * 0.5 + u.i * 2) * 0.012, -s.h * D2R, Math.sin(t * 0.63 + u.i) * 0.02, 'YXZ');
    u.x = s.x; u.n = s.n; u.h = s.h; u.v = s.v;
    u.buom.visible = !!s.buom; u.cuon.visible = !s.buom;
  }
}
function tauKhoi(t, dt) {
  for (const g of TAU) {
    const u = g.userData; if (!g.visible || u.ongZ == null) continue;
    const dang = (t < TS('C06-01')) || u.v > 0.5;
    if (!dang || R_FX() > dt * 5) continue;
    _v.set(0, u.ongY || u.F + 7.3, u.ongZ); g.localToWorld(_v);
    KHOI.them(_v.x, _v.y, _v.z, 0, 3, 0, 14, 4, 26, 0.16, 0.16, 0.17, 0.5, 0, 0.5, 0.25);
  }
}
const tauDiem = (i, lx = 0, ly = 0, lz = 0) => { _v.set(lx, ly, lz); return TAU[i].localToWorld(_v.clone()); };

// ---------- sự kiện bắn ----------
const BAN = [];   // {t, loai:'tau'|'phao'|'sung', i, tx, tn, ...}
function lichBan() {
  const R = rng(2025);
  // 1/9: hạm đội bắn Sơn Trà và cửa sông
  const muc1 = [[VT['son-tra-tay'].x, VT['son-tra-tay'].n], [VT['trai-phap'].x, VT['trai-phap'].n], [900, -350], [VT['nghia-dia'].x, VT['nghia-dia'].n]];
  for (let i = 0; i < 12; i++) {
    let t = TC('C04', 3) + R() * 3; const end = TC('C04', 13);
    while (t < end) { const m = muc1[Math.floor(R() * muc1.length)]; BAN.push({ t, loai: 'tau', i, tx: m[0] + (R() - 0.5) * 160, tn: m[1] + (R() - 0.5) * 160 }); t += (i === 2 ? 2.2 : 4) + R() * 5; }
  }
  // quân Nguyễn bắn trả
  for (const p of PHAO.filter(p => p.ten === 'son-tra-tay' || p.ten === 'dinh-hai')) {
    let t = TC('C04', 8) + R() * 2; while (t < TC('C04', 11)) { const i = Math.floor(R() * 7); BAN.push({ t, loai: 'phao', p, i }); t += 5 + R() * 6; }
  }
  // 2/9: An Hải rồi Điện Hải
  for (let i = 0; i < 12; i++) {
    let t = TS('C05-01') + R() * 3; const end = TC('C05', 7);
    while (t < end) {
      const dh = t > TC('C05', 3) || R() < 0.3; const v = dh ? VT['dien-hai'] : VT['an-hai'];
      BAN.push({ t, loai: 'tau', i, tx: v.x + (R() - 0.5) * 220, tn: v.n + (R() - 0.5) * 200 }); t += (i < 6 ? 3 : 7) + R() * 5;
    }
  }
  const phaoDH = PHAO.filter(p => p.ten === 'dien-hai');
  for (const p of phaoDH) { let t = TS('C05-01') + R() * 4; while (t < TC('C05', 6)) { BAN.push({ t, loai: 'phao', p, i: Math.floor(R() * 6) }); t += 6 + R() * 7; } }
  BAN.push({ t: TS('C05-02') + 1.5, loai: 'phao', p: PHAO_DH(), i: 0 }); BAN.push({ t: TS('C05-02') + 6.5, loai: 'phao', p: PHAO_DH(), i: 3 });
  BAN.push({ t: TS('C04-03') + 3, loai: 'phao', p: PHAO.find(p => p.ten === 'son-tra-tay'), i: 1 }); BAN.push({ t: TS('C04-03') + 9, loai: 'phao', p: PHAO.filter(p => p.ten === 'son-tra-tay')[2], i: 2 });
  BAN.sort((a, b) => a.t - b.t);
}
const PHAO_DH = () => PHAO.filter(p => p.ten === 'dien-hai')[2];
let tTruoc = -1;
function banCapNhat(t, dt, nhay) {
  const t0 = nhay ? t - 12 : tTruoc, cam = camera.position;
  if (nhay) { KHOI.xoa(); LUA.xoa(); }
  for (const e of BAN) {
    if (e.t <= t0) continue; if (e.t > t) break;
    const age = t - e.t;
    if (e.loai === 'tau') {
      const g = TAU[e.i]; if (!g.visible) continue; const u = g.userData;
      // mạn hướng về mục tiêu
      const tx = e.tx - u.x, tn = e.tn - u.n, hx = Math.sin(u.h * D2R), hn = Math.cos(u.h * D2R);
      const ben = (hx * tn - hn * tx) > 0 ? -1 : 1;
      const cua = u.cua.filter(c => c[3] === ben);
      for (let k = 0; k < 3; k++) {
        const c = cua[Math.floor(R_FX() * cua.length)]; if (!c) break;
        const p = g.localToWorld(new V3(c[0], c[1], c[2])), d = g.localToWorld(new V3(c[0] + ben, c[1], c[2])).sub(p).setY(0).normalize();
        khoiSung(p, d, 1.1, age + k * 0.15);
        if (!nhay) amNo(p.distanceTo(cam), 0.8);
      }
      const ay = hAt(e.tx, e.tn), dich = new V3(e.tx, Math.max(ay, 0), -e.tn), tr = 2.2;
      if (age > tr || !nhay) DAN.push({ t: e.t + tr, p: dich, nuoc: ay < 0.3 });
    } else if (e.loai === 'phao') {
      if (!e.p) continue; khoiSung(e.p.pos.clone().add(new V3(0, 1, 0)), e.p.dir, 1, age);
      if (!nhay) amNo(e.p.pos.distanceTo(cam), 1);
      const g = TAU[e.i]; if (g && g.visible) { const m = new V3(g.userData.x + (R_FX() - 0.5) * 140, 0, -(g.userData.n + (R_FX() - 0.5) * 140)); DAN.push({ t: e.t + 2.5, p: m, nuoc: true }); }
    } else if (e.loai === 'sung') {
      const p = new V3(e.x, gAt(e.x, e.n) + 1.4, -e.n); KHOI.them(p.x, p.y, p.z, e.dx * 3, 0.3, -e.dn * 3, 6, 0.6, 5, 0.9, 0.9, 0.88, 0.55, age, 0.9, 0.15);
      LUA.them(p.x + e.dx * 0.8, p.y, p.z - e.dn * 0.8, 0, 0, 0, 0.12, 0.8, 1.6, 1, 0.8, 0.4, 1, age);
    }
  }
  // đạn rơi
  for (let k = DAN.length - 1; k >= 0; k--) {
    const d = DAN[k]; if (d.t > t) continue; DAN.splice(k, 1); if (t - d.t > 14) continue;
    if (d.nuoc) toeNuoc(d.p, 1.2, t - d.t); else { no(d.p, 1.2, t - d.t); if (!nhay) amNo(d.p.distanceTo(cam), 1); }
  }
  tTruoc = t;
}
const DAN = [];

// ---------- nhóm người ----------
const NHOM = [];
// o: {id, phe, so, hinh:'khoi'|'hang'|'tan', cot, kc, r, lich:[[t,x,n,anim]], huong:[x,n]|deg, hien:[t0,t1], tren:'tau:i', y, mu, vk, chet:[t, tile], ten, to}
function nhom(o) {
  const M = PHE[o.phe], R = rng(o.id.length * 131 + o.so * 7 + (o.seed || 0));
  const kinds = o.kind ? [o.kind] : Array.isArray(M.kind) ? M.kind : [M.kind];
  o.vkX = o.vk !== undefined ? (VK_CU[o.vk] === undefined ? M.vk : VK_CU[o.vk]) : M.vk;
  o.hien = o.hien || [-1, 1e9]; o.cot = o.cot || Math.ceil(Math.sqrt(o.so)); o.kc = o.kc || 1.6;
  o.m = [];
  for (let k = 0; k < o.so; k++) {
    let lx, lz;
    if (o.hinh === 'tan') { const a = R() * 6.28, d = Math.sqrt(R()) * (o.r || 10); lx = Math.cos(a) * d; lz = Math.sin(a) * d; }
    else if (o.hinh === 'hang') { lx = (k - (o.so - 1) / 2) * o.kc + (R() - 0.5) * 0.4; lz = (R() - 0.5) * 0.8 + (k % 2) * (o.hai ? 1.4 : 0); }
    else { const c = k % o.cot, r = Math.floor(k / o.cot); lx = (c - (o.cot - 1) / 2) * o.kc + (R() - 0.5) * 0.3; lz = r * o.kc * 1.1 + (R() - 0.5) * 0.3; }
    if (o.vitri) [lx, lz] = o.vitri[k];
    const tint = o.tint || M.tint[Math.floor(R() * M.tint.length)];
    o.m.push({ kind: kinds[k % kinds.length], lx, lz, tint, ph: R(), sp: 0.92 + R() * 0.16, chet: R(), yaw: (R() - 0.5) * 0.25, quy: R() < 0.35, sq: (o.phe === 'phap' || o.phe === 'tbn') && o.so > 8 && k % 12 === 5 });
  }
  NHOM.push(o); return o;
}
// ---- V1.4: chống "trôi" — giới hạn tốc độ đi/chạy theo sải chân thật, nhảy vị trí đúng lúc cắt cảnh ----
const DONG_DI = { di: 1, chay: 1, khieng: 1, vac: 1, keo: 1 };
let CAT = null;     // mốc cắt cảnh (đầu mỗi cảnh quay)
function vNat(kind, clip) { const v = VNAT[kind] && VNAT[kind][clip]; return v || (clip === 'chay' ? 4.4 : 1.0); }
function chuanHoaLich(o) {
  if (!CAT) CAT = Object.values(SH).map(s => s.t0).sort((a, b) => a - b);
  const kinds = [...new Set(o.m.map(m => m.kind))];
  const cap = (an) => Math.min(...kinds.map(k => vNat(k, an))) * (an === 'chay' ? 1.15 : 1.3);
  const L0 = o.lich.map((a, i) => [...a, i]).sort((a, b) => a[0] - b[0] || a[4] - b[4]).map(a => a.slice(0, 4));
  const cuts = CAT.concat([o.hien[0], o.hien[1]]);
  const R = [L0[0]];
  for (let k = 1; k < L0.length; k++) {
    const A = R[R.length - 1], B = L0[k].slice(), dt = B[0] - A[0], d = Math.hypot(B[1] - A[1], B[2] - A[2]);
    if (d <= 2) { R.push(B); continue; }
    let an = B[3] || 'di'; if (!DONG_DI[an]) an = 'di';
    if (dt > 0 && an === 'di' && d / dt > cap('di') * 1.6) an = 'chay';      // phải vội thì chạy
    B[3] = an;
    const vc = cap(an);
    const goc = L0[k][3], them = () => { if (goc && !DONG_DI[goc]) R.push([B[0], B[1], B[2], goc]); };
    if (dt > 0.05 && d / dt <= vc) { R.push(B); them(); continue; }
    // quá nhanh: chạy vc, nhảy cóc ở một mốc cắt cảnh
    const ux = (B[1] - A[1]) / d, un = (B[2] - A[2]) / d;
    let tc = null, best = 1e9;
    for (const c of cuts) if (c > A[0] + 0.05 && c < B[0] - 0.05) { const w = Math.abs(c - (A[0] + B[0]) / 2); if (w < best) { best = w; tc = c; } }
    if (tc == null) {
      const gan = (t) => Math.min(...cuts.map(c => Math.abs(c - t)));
      tc = gan(A[0]) <= gan(B[0]) ? A[0] : B[0];
    }
    const s1 = vc * Math.max(0, tc - A[0]), s2 = vc * Math.max(0, B[0] - tc);
    if (tc > A[0]) R.push([tc, A[1] + ux * s1, A[2] + un * s1, an]);
    R.push([tc, B[1] - ux * s2, B[2] - un * s2, an]);
    if (B[0] > tc) R.push(B); them();
  }
  // quãng đường cộng dồn (để nhịp bước khớp với quãng đi)
  o.lichQ = [0]; for (let k = 1; k < R.length; k++) o.lichQ.push(o.lichQ[k - 1] + Math.hypot(R[k][1] - R[k - 1][1], R[k][2] - R[k - 1][2]));
  o.lich = R; o._chuan = true;
}
function viTriNhom(o, t) {
  if (!o._chuan) chuanHoaLich(o);
  const L = o.lich; let x, n, an, dx = 0, dn = 0, mv = false, q = 0;
  if (t <= L[0][0]) { [, x, n, an] = L[0]; }
  else if (t >= L[L.length - 1][0]) { [, x, n, an] = L[L.length - 1]; }
  else for (let k = 0; k < L.length - 1; k++) {
    const A = L[k], B = L[k + 1];
    if (t >= A[0] && t < B[0]) {
      const u = (t - A[0]) / (B[0] - A[0]); x = lerp(A[1], B[1], u); n = lerp(A[2], B[2], u); dx = B[1] - A[1]; dn = B[2] - A[2];
      mv = Math.hypot(dx, dn) > 2; an = mv ? B[3] : A[3]; q = lerp(o.lichQ[k], o.lichQ[k + 1], u); break;
    }
  }
  if (!mv && DONG_DI[an]) an = 'dung';   // đứng yên thì không bước tại chỗ
  let h;
  if (mv) h = Math.atan2(dx, dn);
  else if (Array.isArray(o.huong)) h = Math.atan2(o.huong[0] - x, o.huong[1] - n);
  else h = (o.huong || 0) * D2R;
  return { x, n, h, an, mv, q };
}
let NHOM_DT = 0, NHOM_NHAY = false;
const BAN_SUNG = { nguyen: 1, phap: 1, tbn: 1, danbinh: 0.4, phapxanh: 1 };
function nhomCapNhat(t) {
  xBegin();
  const cam = camera.position;
  for (const o of NHOM) {
    if (t < o.hien[0] || t > o.hien[1]) continue;
    const s = viTriNhom(o, t);
    let tau = null; if (o.tren) { const [k, i] = o.tren.split(':'); tau = k === 'tau' ? TAU[+i] : (XUONG[+i] && XUONG[+i].obj); }
    if (tau && !tau.visible) continue;
    let cx = s.x, cz = -s.n; if (tau) { const w = tau.localToWorld(new V3(s.x, 0, -s.n)); cx = w.x; cz = w.z; }
    const dd = Math.hypot(cx - cam.x, cz - cam.z); if (dd > (o.xa || 4200) + cam.y * 1.5) continue;
    const ch = Math.cos(s.h), sh = Math.sin(s.h), an0 = ANIM[s.an] ?? 0;
    for (const m of o.m) {
      const ex = m.lx * ch - m.lz * sh, en = -m.lx * sh - m.lz * ch;
      let x = s.x + ex, n = s.n + en, y, yaw = -s.h + m.yaw + Math.PI, an = an0, tSeg = 0;
      if (o.chet) { const tc = o.chet[0] + m.chet * (o.chet[2] || 4); if (t > tc && m.chet < o.chet[1]) { an = ANIM.chet; tSeg = t - tc; } }
      if (o.anRieng) an = o.anRieng(m, t, an);
      if (an === ANIM.chet && !tSeg) tSeg = 99;
      if (an === ANIM.ngam && m.quy && o.phe !== 'phaothu' && !o.tren) an = ANIM.quy;
      let clip = CLIPN[an] || 'dung', vkM = o.vkX; const ta = s.mv && an === an0 ? s.q / vNat(m.kind, clip) : t * m.sp;
      if (m.sq) { vkM = 'sungngan'; if (an === ANIM.ngam || an === ANIM.quy || an === ANIM.ban) clip = 'sungngan'; else if (an === ANIM.dung) clip = 'chihuy'; }   // sĩ quan cầm súng ngắn ổ quay
      if (tau) {
        const w = tau.localToWorld(new V3(x, o.y != null ? o.y : tau.userData.F + 0.02, -n));
        xPut(m.kind, clip, ta, m.ph, w.x, w.y, w.z, yaw + tau.rotation.y, o.to || 1, m.tint, vkM, tSeg);
      } else {
        if (o.y == null && hAt(x, n) < 0.3) continue;
        y = o.y != null ? o.y : gAt(x, n);
        const ve = xPut(m.kind, clip, ta, m.ph, x, y, -n, yaw, o.to || 1, m.tint, vkM, tSeg);
        if (ve && (an === ANIM.ngam || an === ANIM.quy) && !NHOM_NHAY && BAN_SUNG[o.phe] && dd < 2500 && R_FX() < NHOM_DT * 0.22 * BAN_SUNG[o.phe] && (o.vkX === 'sungtruong' || o.vkX === 'dieuthuong')) {
          const px = XMUZ.x, py = XMUZ.y, pz = XMUZ.z;
          LUA.them(px, py, pz, 0, 0, 0, 0.1, 0.7, 1.4, 1, 0.8, 0.45, 1);
          for (let q = 0; q < 3; q++) KHOI.them(px, py, pz, Math.sin(s.h) * 2.5 + (R_FX() - 0.5), 0.3, -Math.cos(s.h) * 2.5 + (R_FX() - 0.5), 6 + R_FX() * 4, 0.6, 4 + R_FX() * 3, 0.92, 0.92, 0.9, 0.5, 0, 0.9, 0.15);
          if (dd < 220) amMot('bandan', 0.12 * clamp(1 - dd / 220, 0, 1));
        }
      }
    }
    o._pos = new V3(cx, (o.y != null ? o.y : gAt(s.x, s.n)) + 1.6, cz);
  }
  langCapNhat(t); baoTangCapNhat(t);
  if (NGUA && NGUA.visible) xPut('ngua', 'chay', NGUA.userData.q || t, 0, NGUA.position.x, NGUA.position.y, NGUA.position.z, NGUA.rotation.y + Math.PI, 1, [1, 1, 1], null);
  xEnd();
}


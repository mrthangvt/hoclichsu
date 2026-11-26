// ---------- chiến hạm hơi nước – buồm (giữa thế kỷ XIX) · mũi tàu hướng −z cục bộ ----------
function thanTau(L, B, D, F, mauThan = 0x1d1d20, mauSoc = 0xe8e2d0, soCua = 10, soc = true) {
  // L dài, B rộng, D mớn nước, F mạn khô
  const seg = 24, ring = 10, P = [], C = [], cT = new THREE.Color(mauThan), cS = new THREE.Color(mauSoc), cD = new THREE.Color(0x6a2a20);
  const wz = (u) => { const a = u < 0.25 ? Math.sin(u / 0.25 * Math.PI / 2) ** 0.8 : u > 0.85 ? 0.55 + 0.45 * Math.cos((u - 0.85) / 0.15 * Math.PI / 2) : 1; return a; };
  const sect = [];
  for (let i = 0; i <= seg; i++) {
    const u = i / seg, z = -L / 2 + u * L, w = B / 2 * wz(u), pts = [];
    for (let k = 0; k <= ring; k++) {
      const a = k / ring * Math.PI; // 0 = mạn phải trên, PI = mạn trái trên
      const s = Math.sin(a), c = Math.cos(a);
      const x = c * w, y = F - (F + D) * Math.pow(s, 0.6) * (u < 0.06 ? u / 0.06 : 1);
      pts.push([x, k === 0 || k === ring ? F + (u < 0.1 ? (0.1 - u) * 8 : 0) : y, z]);
    }
    sect.push(pts);
  }
  const col = (y) => y < -D * 0.3 ? cD : (soc && y > F * 0.45 && y < F * 0.75) ? cS : cT;
  for (let i = 0; i < seg; i++) for (let k = 0; k < ring; k++) {
    const a = sect[i][k], b = sect[i + 1][k], c = sect[i + 1][k + 1], d = sect[i][k + 1];
    P.push(...a, ...b, ...c, ...a, ...c, ...d); for (const q of [a, b, c, a, c, d]) { const cc = col(q[1]); C.push(cc.r, cc.g, cc.b); }
  }
  // đuôi phẳng
  const last = sect[seg]; for (let k = 0; k < ring; k++) { const a = last[k], b = last[k + 1]; P.push(...a, ...b, 0, F, L / 2); for (const q of [a, b, [0, F, 0]]) { const cc = col(q[1]); C.push(cc.r, cc.g, cc.b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  const G = new Ghep(); G.them(g, new THREE.Matrix4(), mauThan);
  // boong
  const dk = []; for (let i = 0; i <= seg; i++) { const u = i / seg; dk.push([B / 2 * wz(u) * 0.97, -L / 2 + u * L]); }
  for (let i = 0; i < seg; i++) quad2(G, [-dk[i][0], F - 0.3, dk[i][1]], [dk[i][0], F - 0.3, dk[i][1]], [dk[i + 1][0], F - 0.3, dk[i + 1][1]], [-dk[i + 1][0], F - 0.3, dk[i + 1][1]], 0x9a8466);
  // cửa pháo
  const cua = [];
  for (let k = 0; k < soCua; k++) {
    const z = -L * 0.3 + k * (L * 0.6 / (soCua - 1));
    for (const sx of [-1, 1]) { const x = sx * B / 2 * 1.005; G.hop(0.12, 0.6, 0.7, x, F * 0.6, z, 0x121212); cua.push([x, F * 0.6, z, sx]); }
  }
  return { G, cua };
}
let MAU_TAU = null;
async function napTau() {
  const d = await (await fetch(URLG('nv/tau-phap.json'))).json();
  const tex = new THREE.Texture(await loadImg('nv/tau-phap.jpg')); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(b64(d.pos, Float32Array), 3)); g.setAttribute('uv', new THREE.BufferAttribute(b64(d.uv, Float32Array), 2));
  g.setIndex(new THREE.BufferAttribute(d.i32 ? b64(d.idx, Uint32Array) : b64(d.idx, Uint16Array), 1)); g.computeVertexNormals();
  MAU_TAU = { d, g, mat: new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }) };
}
function taoTauMau(o) {
  const k = o.L / MAU_TAU.d.dai, F = 1.45 * k, B = MAU_TAU.d.rong * k * 2, L = o.L;   // V1.3: mặt boong đo lại theo mặt phẳng ngang của mẫu (y = 1,45)
  const grp = new THREE.Group(); const m = new THREE.Mesh(MAU_TAU.g, MAU_TAU.mat); m.scale.setScalar(k); grp.add(m);
  const cua = []; const n = o.soCua || 8;
  for (let i = 0; i < n; i++) { const z = -L * 0.3 + i * (L * 0.6 / (n - 1)); for (const sx of [-1, 1]) cua.push([sx * B / 2 * 1.02, F * 0.55, z, sx]); }
  const co = taoCo(o.coKieu || 'phap', 4, 2.2); co.position.set(0, F + 1, L / 2 - 1); co.rotation.y = Math.PI / 2; grp.add(co);
  if (o.ban) { const b = banBanDo(0, 0, 0, 0); scene.remove(b); b.position.set(0.8, F, -14); grp.add(b); }
  const rong = new THREE.Object3D(); grp.add(rong);
  grp.userData = { L, B, F, cua, buom: rong, cuon: rong, ongZ: -L * 0.08, ongY: 11 * k, ten: o.ten, ong: 1 };
  scene.add(grp); return grp;
}
function taoTau(o) {
  if (MAU_TAU) return taoTauMau(o);
  // o: {L, B, cot (số cột), ong (ống khói), banhGuong, kieu, coKieu}
  const { L, B } = o, D = o.D || 3.6, F = o.F || 3.2;
  const { G, cua } = thanTau(L, B, D, F, o.mauThan, o.mauSoc, o.soCua || Math.round(L / 6), o.soc !== false);
  // cột buồm, xà, buồm cuộn
  const cotZ = o.cot === 3 ? [-L * 0.28, -L * 0.02, L * 0.25] : o.cot === 2 ? [-L * 0.2, L * 0.15] : [0];
  const H = o.caoCot || L * 0.62;
  const buom = new Ghep(), buomCuon = new Ghep();
  cotZ.forEach((z, i) => {
    const h = H * (i === 1 || cotZ.length === 1 ? 1 : 0.88);
    G.tru(0.25, 0.42, h, 0, F + h / 2, z, 0x4a3828, 6);
    for (let k = 0; k < 3; k++) {
      const y = F + h * (0.42 + k * 0.2), w = B * (1.6 - k * 0.35);
      G.tru(0.12, 0.12, w, 0, y, z, 0x3a2a1c, 5, 0, 0, Math.PI / 2);
      buomCuon.tru(0.35, 0.35, w * 0.9, 0, y + 0.25, z, 0xd8d0b8, 6, 0, 0, Math.PI / 2);
      // buồm căng: tấm cong
      const sh = h * 0.19, g = new THREE.PlaneGeometry(w * 0.92, sh, 6, 3), p = g.attributes.position;
      for (let v = 0; v < p.count; v++) { const xx = p.getX(v) / (w * 0.46); p.setZ(v, -(1 - xx * xx) * sh * 0.18); }
      buom.them(g, M4(0, y - sh / 2, z - 0.3), 0xe8e0c8);
    }
    // dây chằng (đơn giản)
    G.them(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(h, B), 3), M4(B * 0.45, F + h * 0.5, z + 1, 0, 0, Math.atan2(B * 0.9, h)), 0x2a2018);
    G.them(new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(h, B), 3), M4(-B * 0.45, F + h * 0.5, z + 1, 0, 0, -Math.atan2(B * 0.9, h)), 0x2a2018);
  });
  // cần mũi
  G.tru(0.15, 0.3, L * 0.22, 0, F + 1.4, -L / 2 - L * 0.08, 0x4a3828, 5, 0, -1.25);
  // ống khói, hộp bánh guồng
  if (o.ong) { G.tru(1.1, 1.1, 7, 0, F + 3.5, cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : L * 0.1, 0x1a1a1a, 12); }
  if (o.banhGuong) for (const sx of [-1, 1]) { G.them(new THREE.CylinderGeometry(3.2, 3.2, 2.2, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), M4(sx * (B / 2 + 1.1), F - 0.6, cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : 0, Math.PI / 2), 0x1d1d20); }
  // lan can đuôi, buồng lái
  G.hop(B * 0.6, 1.4, 4, 0, F + 0.4, L * 0.42, 0x6a5038);
  for (const c of cua) daiBac(G, c[0] - c[3] * 1.6, F - 0.3, c[2], c[3] > 0 ? -Math.PI / 2 : Math.PI / 2, 0.8, 0x4a3a2a);
  const grp = new THREE.Group();
  const than = G.luoi(); grp.add(than);
  const mB = buom.luoi(MATV2); grp.add(mB); const mC = buomCuon.luoi(); grp.add(mC);
  const co = taoCo(o.coKieu || 'phap', 4, 2.2); co.position.set(0, F + 1, L / 2 + 0.5); co.rotation.y = Math.PI / 2; grp.add(co);
  const co2 = taoCo(o.coKieu || 'phap', 2.5, 1.2); co2.position.set(0, F + H * 0.95, cotZ[cotZ.length > 1 ? 1 : 0]); grp.add(co2);
  grp.userData = { L, B, F, cua, buom: mB, cuon: mC, ongZ: o.ong ? (cotZ.length > 1 ? (cotZ[0] + cotZ[1]) / 2 : L * 0.1) : null, ten: o.ten, ong: o.ong };
  if (o.ban) { const b = banBanDo(0, 0, 0, 0); scene.remove(b); b.position.set(0.8, F - 0.3, -14); b.rotation.y = 0; grp.add(b); }
  scene.add(grp); return grp;
}
// thuyền đổ bộ (xuồng chèo) · thuyền đánh cá có buồm
function xuongGeo(L = 9, mau = 0x5b4632) { const { G } = thanTau(L, 2.3, 0.5, 0.6, mau, mau, 0, false); for (let k = 0; k < 4; k++) G.hop(2.1, 0.08, 0.3, 0, 0.35, -L * 0.3 + k * L * 0.2, 0x7a6448); return G.geo(); }
function thuyenChaiGeo() {
  const { G } = thanTau(8, 2.0, 0.6, 0.7, 0x4b3a2a, 0x4b3a2a, 0, false);
  G.tru(0.07, 0.09, 5.5, 0, 3.2, -1, 0x3a2a1c, 5);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 1.2, -2.6, 0, 5.6, -0.9, 0, 1.2, 1.6], 3));
  G.them(g, new THREE.Matrix4(), 0x8a5a3a);
  return G.geo();
}
// ngựa đơn giản (người đưa tin) – chân đong đưa bằng CPU
function taoNgua() {
  const grp = new THREE.Group(), mt = new THREE.MeshLambertMaterial({ color: 0x5a3b26 }), mt2 = new THREE.MeshLambertMaterial({ color: 0x2a1c14 });
  const than = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 1.8), mt); than.position.y = 1.35; grp.add(than);
  const co = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.4), mt); co.position.set(0, 1.85, -0.95); co.rotation.x = 0.6; grp.add(co);
  const dau = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.7), mt); dau.position.set(0, 2.15, -1.35); dau.rotation.x = 0.3; grp.add(dau);
  const bom = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.12), mt2); bom.position.set(0, 1.4, 0.95); bom.rotation.x = -0.5; grp.add(bom);
  const chan = [];
  for (const [x, z] of [[-0.2, -0.7], [0.2, -0.7], [-0.2, 0.7], [0.2, 0.7]]) {
    const piv = new THREE.Group(); piv.position.set(x, 1.15, z); const c = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.1, 0.14), mt); c.position.y = -0.55; piv.add(c); grp.add(piv); chan.push(piv);
  }
  grp.userData.chan = chan; scene.add(grp); return grp;
}

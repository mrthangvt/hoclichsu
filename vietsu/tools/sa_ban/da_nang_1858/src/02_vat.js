// ---------- bộ ghép hình khối (màu theo đỉnh) ----------
class Ghep {
  constructor() { this.p = []; this.n = []; this.c = []; }
  them(geo, mat, col) {
    const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(mat); g.computeVertexNormals();
    const P = g.attributes.position.array, N = g.attributes.normal.array, cc = new THREE.Color(col);
    for (let i = 0; i < P.length; i++) { this.p.push(P[i]); this.n.push(N[i]); }
    const C = g.attributes.color;
    for (let i = 0; i < P.length / 3; i++) { if (C) this.c.push(C.getX(i), C.getY(i), C.getZ(i)); else this.c.push(cc.r, cc.g, cc.b); }
    return this;
  }
  hop(sx, sy, sz, x, y, z, col, ry = 0, rx = 0, rz = 0) { return this.them(new THREE.BoxGeometry(sx, sy, sz), M4(x, y, z, ry, rx, rz), col); }
  tru(r1, r2, h, x, y, z, col, seg = 8, ry = 0, rx = 0, rz = 0) { return this.them(new THREE.CylinderGeometry(r1, r2, h, seg), M4(x, y, z, ry, rx, rz), col); }
  // mái hai dốc: dài L (trục x), rộng B, cao H, chìa mái e
  mai(L, B, H, x, y, z, col, ry = 0, e = 0.5) {
    const g = new THREE.BufferGeometry(), a = L / 2 + e, b = B / 2 + e;
    const v = [-a, 0, -b, a, 0, -b, a, H, 0, -a, 0, -b, a, H, 0, -a, H, 0, a, 0, b, -a, 0, b, -a, H, 0, a, 0, b, -a, H, 0, a, H, 0,
      -a, 0, -b, -a, H, 0, -a, 0, b, a, 0, b, a, H, 0, a, 0, -b];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return this.them(g, M4(x, y, z, ry), col);
  }
  // mái chóp (tứ giác)
  maiChop(L, B, H, x, y, z, col, ry = 0, e = 0.6) {
    const a = L / 2 + e, b = B / 2 + e, r = Math.max(0, a - b);
    const g = new THREE.BufferGeometry();
    const v = [-a, 0, -b, a, 0, -b, r, H, 0, -a, 0, -b, r, H, 0, -r, H, 0, a, 0, b, -a, 0, b, -r, H, 0, a, 0, b, -r, H, 0, r, H, 0,
      -a, 0, b, -a, 0, -b, -r, H, 0, a, 0, -b, a, 0, b, r, H, 0];
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    return this.them(g, M4(x, y, z, ry), col);
  }
  luoi(mat) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    return new THREE.Mesh(g, mat || MATV);
  }
  geo() { return this.luoi().geometry; }
}
const MATV = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
const MATV2 = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
function M4(x, y, z, ry = 0, rx = 0, rz = 0, s = 1) {
  const m = new THREE.Matrix4(); m.compose(new V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new V3(s, s, s)); return m;
}
// dải (tường, lũy) theo đường gấp khúc kín/hở trong toạ độ cục bộ (x, z)
function dai(g, pts, w0, w1, h0, h1, col, kin = true, colTop, csMin = 0.6) {
  // w0: lệch mép ngoài, w1: lệch mép trong (theo pháp tuyến trái), h0 đáy, h1 đỉnh
  const n = pts.length, L = kin ? n : n - 1, nor = [];
  for (let i = 0; i < n; i++) {
    const a = pts[kin ? (i - 1 + n) % n : Math.max(i - 1, 0)], b = pts[i], c = pts[kin ? (i + 1) % n : Math.min(i + 1, n - 1)];
    let d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = c[0] - b[0], d2z = c[1] - b[1];
    const l1 = Math.hypot(d1x, d1z) || 1, l2 = Math.hypot(d2x, d2z) || 1; d1x /= l1; d1z /= l1; d2x /= l2; d2z /= l2;
    let nx = -(d1z + d2z), nz = d1x + d2x; const ln = Math.hypot(nx, nz) || 1; nx /= ln; nz /= ln;
    const cs = Math.max(csMin, nx * -d2z + nz * d2x); nor.push([nx / cs, nz / cs]);
  }
  const v = [], cl = [], C1 = new THREE.Color(col), C2 = new THREE.Color(colTop || col);
  const P = (i, w, y) => [pts[i][0] + nor[i][0] * w, y, pts[i][1] + nor[i][1] * w];
  const quad = (A, B, Cc, Dd, cc) => { v.push(...A, ...B, ...Cc, ...A, ...Cc, ...Dd); for (let k = 0; k < 6; k++) cl.push(cc.r, cc.g, cc.b); };
  for (let s = 0; s < L; s++) {
    const i = s, j = (s + 1) % n;
    const yo0 = (typeof h0 === 'function') ? h0(i) : h0, yo1 = (typeof h0 === 'function') ? h0(j) : h0;
    const yt0 = (typeof h1 === 'function') ? h1(i) : h1, yt1 = (typeof h1 === 'function') ? h1(j) : h1;
    quad(P(i, w0, yo0), P(j, w0, yo1), P(j, w0 * 0.85 + w1 * 0.15, yt1), P(i, w0 * 0.85 + w1 * 0.15, yt0), C1);
    quad(P(i, w0 * 0.85 + w1 * 0.15, yt0), P(j, w0 * 0.85 + w1 * 0.15, yt1), P(j, w1, yt1), P(i, w1, yt0), C2);
    quad(P(i, w1, yt0), P(j, w1, yt1), P(j, w1, yo1), P(i, w1, yo0), C1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
  g.them(geo, new THREE.Matrix4(), col);
}
function quad2(g, A, B, C, D, col) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...C, ...A, ...C, ...D], 3)); g.them(geo, new THREE.Matrix4(), col); }

// ---------- cờ ----------
function coTex(kieu) {
  const c = document.createElement('canvas'); c.width = 96; c.height = 64; const g = c.getContext('2d');
  if (kieu === 'phap') { ['#1f3f9a', '#f4f4f4', '#d0262e'].forEach((k, i) => { g.fillStyle = k; g.fillRect(i * 32, 0, 32, 64); }); }
  else if (kieu === 'tbn') { g.fillStyle = '#c4202a'; g.fillRect(0, 0, 96, 64); g.fillStyle = '#f2c230'; g.fillRect(0, 16, 96, 32); }
  else { g.fillStyle = '#e8b81f'; g.fillRect(0, 0, 96, 64); g.strokeStyle = '#b8261f'; g.lineWidth = 6; g.strokeRect(3, 3, 90, 58); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const CO_TEX = {};
const coMat = (k) => (CO_TEX[k] ||= new THREE.MeshLambertMaterial({ map: coTex(k), side: THREE.DoubleSide }));
const CO_LIST = [];
const coGeo = () => { const g = new THREE.PlaneGeometry(1.5, 1, 8, 2); g.translate(0.75, 0, 0); return g; };
function taoCo(kieu, cao = 8, to = 1) {
  const grp = new THREE.Group();
  const cot = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * to, 0.09 * to, cao, 6), new THREE.MeshLambertMaterial({ color: 0x5a4632 }));
  cot.position.y = cao / 2; grp.add(cot);
  const la = new THREE.Mesh(coGeo(), coMat(kieu)); la.scale.set(to * 1.6, to * 1.6, 1); la.position.y = cao - to * 0.9; grp.add(la);
  grp.userData = { la, kieu, base: la.geometry.attributes.position.array.slice(), ph: Math.random() * 6 };
  CO_LIST.push(grp); return grp;
}
function doiCo(grp, kieu) { if (grp.userData.kieu !== kieu) { grp.userData.kieu = kieu; grp.userData.la.material = coMat(kieu); } }
function coBay(t) {
  for (const f of CO_LIST) {
    if (!f.visible) continue; const u = f.userData, p = u.la.geometry.attributes.position, b = u.base;
    for (let i = 0; i < p.count; i++) { const x = b[i * 3]; p.array[i * 3 + 2] = Math.sin(x * 3.2 - t * 6 + u.ph) * 0.16 * x; p.array[i * 3 + 1] = b[i * 3 + 1] - x * x * 0.05; }
    p.needsUpdate = true;
  }
}

// ---------- khẩu đại bác (thế kỷ XIX, bệ gỗ bánh xe) ----------
// ---------- V1.3: gạch thành kiểu Thành cổ Quảng Trị (vân gạch ám cũ, chiếu theo 3 trục) ----------
const GACH_TEX = new THREE.Texture(); GACH_TEX.wrapS = GACH_TEX.wrapT = THREE.RepeatWrapping; GACH_TEX.colorSpace = THREE.SRGBColorSpace; GACH_TEX.anisotropy = 8;
async function napGach() { try { GACH_TEX.image = await loadImg('tex/gach.webp'); GACH_TEX.needsUpdate = true; } catch (e) { console.warn('gach', e); } }
const MAT_GACH = new THREE.MeshLambertMaterial({ vertexColors: true, map: GACH_TEX, side: THREE.DoubleSide });
MAT_GACH.onBeforeCompile = (sh) => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
    .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
    .replace('#include <map_fragment>', `vec3 an=abs(vWN); vec2 tuv= an.y>.75 ? vWP.xz : (an.x>an.z ? vWP.zy : vWP.xy);
      vec3 tc=texture2D(map,tuv/1.7).rgb; float re=.82+.18*sin(vWP.x*.11+vWP.z*.07)*sin(vWP.y*.6+vWP.x*.03);
      float st=sin(vWP.x*.045+sin(vWP.z*.07)*2.)*sin(vWP.z*.05+vWP.y*.2)*.5+.5; float am=mix(1.,.62,st*st)*mix(.78,1.,smoothstep(.0,2.2,vWP.y-floor(vWP.y/40.)*0.));
      vec3 reu=mix(vec3(1.),vec3(.78,.86,.7),(1.-smoothstep(0.,1.8,fract(vWP.y*.0)+.0))*.0);
      diffuseColor.rgb*=tc*1.8*re*am*(an.y>.75?.85:1.);`);
};
// ---------- V1.3: đại bác theo mẫu súng thần công anh gửi (một InstancedMesh cho cả sa bàn) ----------
let MAU_PHAO = null, PHAO_GRP = null; const PHAO_INST = [];
async function napPhao() {
  try {
    const d = await (await fetch(URLG('nv/phao.json'))).json();
    const tex = new THREE.Texture(await loadImg('nv/phao.jpg')); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(b64(d.pos, Float32Array), 3)); g.setAttribute('uv', new THREE.BufferAttribute(b64(d.uv, Float32Array), 2));
    g.setIndex(new THREE.BufferAttribute(b64(d.idx, Uint16Array), 1)); g.computeVertexNormals();
    MAU_PHAO = { g, mat: new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), mieng: d.mieng };
  } catch (e) { console.warn('phao', e); }
}
function dungPhaoMau() {
  if (!MAU_PHAO || !PHAO_INST.length) return;
  const im = new THREE.InstancedMesh(MAU_PHAO.g, MAU_PHAO.mat, PHAO_INST.length), m = new THREE.Matrix4();
  PHAO_INST.forEach(([grp, L], i) => { grp.updateMatrixWorld(true); im.setMatrixAt(i, m.multiplyMatrices(grp.matrixWorld, L)); });
  im.instanceMatrix.needsUpdate = true; scene.add(im); CONG_PHAO = im;
}
let CONG_PHAO = null;
function daiBac(g, x, y, z, ry, s = 1, mauBe = 0x7a2f22) {
  if (MAU_PHAO && PHAO_GRP) { PHAO_INST.push([PHAO_GRP, M4(x, y, z, ry + Math.PI, 0, 0, 0.85 * s)]); return; }   // nòng mẫu hướng +Z
  const m = M4(x, y, z, ry), add = (geo, mm, col) => g.them(geo, m.clone().multiply(mm), col);
  add(new THREE.CylinderGeometry(0.13 * s, 0.2 * s, 2.5 * s, 10).rotateX(Math.PI / 2), M4(0, 0.95 * s, -0.25 * s, 0, 0.06), 0x24262a);
  add(new THREE.SphereGeometry(0.2 * s, 8, 6), M4(0, 0.95 * s, 0.95 * s), 0x24262a);
  add(new THREE.BoxGeometry(0.12 * s, 0.4 * s, 1.7 * s), M4(-0.3 * s, 0.68 * s, 0.25 * s, 0, -0.18), mauBe);
  add(new THREE.BoxGeometry(0.12 * s, 0.4 * s, 1.7 * s), M4(0.3 * s, 0.68 * s, 0.25 * s, 0, -0.18), mauBe);
  add(new THREE.BoxGeometry(0.72 * s, 0.12 * s, 0.5 * s), M4(0, 0.5 * s, 0.9 * s), mauBe);
  for (const sx of [-1, 1]) {
    add(new THREE.CylinderGeometry(0.55 * s, 0.55 * s, 0.1 * s, 14).rotateZ(Math.PI / 2), M4(sx * 0.45 * s, 0.55 * s, -0.25 * s), mauBe);
    add(new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.14 * s, 8).rotateZ(Math.PI / 2), M4(sx * 0.47 * s, 0.55 * s, -0.25 * s), 0x2c2c2c);
  }
}

// ---------- hiệu ứng: khói thuốc súng đen, chớp lửa, nổ, cháy, khói ống ----------
function texTron(soft = 1) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45 * soft, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
}
class HatBui {
  constructor(N, cong) {
    this.N = N; this.P = []; this.free = [];
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(N * 3); this.siz = new Float32Array(N); this.col = new Float32Array(N * 4);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.siz, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('col', new THREE.BufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    this.u = { map: { value: texTron() }, scale: { value: 800 }, fogC: { value: new THREE.Color() }, fogN: { value: 1 }, fogF: { value: 2 }, light: { value: 1 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthWrite: false, blending: cong ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: `attribute float size; attribute vec4 col; uniform float scale; varying vec4 vc; varying float vd;
        void main(){ vc=col; vec4 mv=modelViewMatrix*vec4(position,1.); vd=-mv.z; gl_PointSize=min(size*scale/max(-mv.z,1.),900.); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 fogC; uniform float fogN,fogF,light; varying vec4 vc; varying float vd;
        void main(){ vec4 t=texture2D(map,gl_PointCoord); vec3 c=vc.rgb*${cong ? '1.' : 'light'}; float f=smoothstep(fogN,fogF,vd); c=mix(c,fogC,f${cong ? '*0.' : ''}); gl_FragColor=vec4(c,t.a*vc.a*(1.-f*${cong ? '1.' : '.3'})); }`
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = cong ? 5 : 4; scene.add(this.pts);
    this.n = 0;
  }
  them(x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, age = 0, drag = 0.6, lift = 0) {
    if (this.P.length >= this.N) this.P.shift();
    this.P.push({ x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, age, drag, lift });
  }
  xoa() { this.P.length = 0; }
  capNhat(dt, gio) {
    const P = this.P; let w = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i]; p.age += dt; if (p.age >= p.life) continue;
      const k = Math.exp(-p.drag * dt); p.vx = p.vx * k + gio.x * (1 - k); p.vz = p.vz * k + gio.z * (1 - k); p.vy = p.vy * k + p.lift * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; P[w++] = p;
    }
    P.length = w;
    for (let i = 0; i < w; i++) {
      const p = P[i], u = p.age / p.life;
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.siz[i] = p.s0 + (p.s1 - p.s0) * Math.sqrt(u);
      this.col[i * 4] = p.r; this.col[i * 4 + 1] = p.g; this.col[i * 4 + 2] = p.b; this.col[i * 4 + 3] = p.a * Math.min(1, u * 8) * (1 - u) ** 1.3;
    }
    const g = this.pts.geometry; g.setDrawRange(0, w);
    g.attributes.position.needsUpdate = g.attributes.size.needsUpdate = g.attributes.col.needsUpdate = true;
  }
}
const KHOI = new HatBui(9000, false), LUA = new HatBui(2500, true);
const GIO = new V3(2.2, 0, -0.8);
const R_FX = rng(99);
function khoiSung(p, d, to = 1, age = 0) {
  LUA.them(p.x + d.x * 1.5, p.y + 0.3, p.z + d.z * 1.5, 0, 0, 0, 0.22, 4 * to, 9 * to, 1, 0.75, 0.35, 1, age);
  for (let k = 0; k < 9; k++) {
    const s = 3 + R_FX() * 9;
    KHOI.them(p.x + d.x * 2, p.y + 0.5, p.z + d.z * 2, d.x * s + (R_FX() - 0.5) * 2, 0.6 + R_FX() * 0.8, d.z * s + (R_FX() - 0.5) * 2, 9 + R_FX() * 7, 3 * to, (18 + R_FX() * 14) * to, 0.93, 0.92, 0.9, 0.75, age, 0.9, 0.2);
  }
}
function no(p, to = 1, age = 0, dat = true) {
  LUA.them(p.x, p.y + 2 * to, p.z, 0, 0, 0, 0.35, 10 * to, 26 * to, 1, 0.6, 0.25, 1, age);
  for (let k = 0; k < 14; k++) {
    const a = R_FX() * 6.28, s = 4 + R_FX() * 10;
    if (dat) KHOI.them(p.x, p.y + 1, p.z, Math.cos(a) * s * 0.5, 8 + R_FX() * 14, Math.sin(a) * s * 0.5, 2.5 + R_FX() * 2, 2 * to, 9 * to, 0.42, 0.33, 0.24, 0.9, age, 1.6, -9);
    KHOI.them(p.x, p.y + 2, p.z, Math.cos(a) * s * 0.4, 2 + R_FX() * 3, Math.sin(a) * s * 0.4, 10 + R_FX() * 8, 5 * to, (24 + R_FX() * 16) * to, 0.3, 0.29, 0.28, 0.65, age, 0.8, 0.4);
  }
}
function toeNuoc(p, to = 1, age = 0) {
  for (let k = 0; k < 12; k++) { const a = R_FX() * 6.28, s = R_FX() * 3; KHOI.them(p.x, 0.5, p.z, Math.cos(a) * s, 10 + R_FX() * 12, Math.sin(a) * s, 2 + R_FX(), 2 * to, 7 * to, 0.9, 0.95, 0.97, 0.85, age, 1.4, -10); }
}
// điểm cháy (liên tục)
const CHAY = [];   // {p, t0, t1, to}
function chayCapNhat(t, dt) {
  for (const c of CHAY) {
    if (t < c.t0 || t > c.t1) continue;
    const n = dt * 14 * c.to; let k = Math.floor(n) + (R_FX() < n % 1 ? 1 : 0);
    while (k--) {
      LUA.them(c.p.x + (R_FX() - 0.5) * 6 * c.to, c.p.y + R_FX() * 2, c.p.z + (R_FX() - 0.5) * 6 * c.to, 0, 2 + R_FX() * 2, 0, 0.8 + R_FX() * 0.5, 3 * c.to, 1 * c.to, 1, 0.45 + R_FX() * 0.2, 0.12, 0.9);
      if (R_FX() < 0.5) KHOI.them(c.p.x, c.p.y + 3, c.p.z, 0, 3 + R_FX() * 2, 0, 12, 5 * c.to, 30 * c.to, 0.18, 0.17, 0.16, 0.55, 0, 0.3, 0.3);
    }
  }
}
// mưa quanh máy quay
const MUA = (() => {
  const N = 5000, g = new THREE.BufferGeometry(), p = new Float32Array(N * 6);
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xb8c4cc, transparent: true, opacity: 0.35 }));
  m.frustumCulled = false; m.visible = false; scene.add(m); const seeds = new Float32Array(N * 3); const R = rng(5);
  for (let i = 0; i < N * 3; i++) seeds[i] = R();
  return { m, p, seeds, N };
})();
function muaCapNhat(t, on) {
  MUA.m.visible = on > 0.01; if (!MUA.m.visible) return; MUA.m.material.opacity = 0.35 * on;
  const c = camera.position, R = 120, p = MUA.p;
  for (let i = 0; i < MUA.N; i++) {
    const x = c.x + (MUA.seeds[i * 3] - 0.5) * 2 * R, z = c.z + (MUA.seeds[i * 3 + 1] - 0.5) * 2 * R;
    const y = c.y + 60 - mod(t * 22 + MUA.seeds[i * 3 + 2] * 120, 120);
    p.set([x, y, z, x + 0.3, y - 1.6, z + 0.1], i * 6);
  }
  MUA.m.geometry.attributes.position.needsUpdate = true;
}
// ---------- âm thanh ----------
const AM = { ctx: null, buf: {}, loops: {}, master: null };
async function amNap() {
  try {
    AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.master = AM.ctx.createGain(); AM.master.connect(AM.ctx.destination);
    for (const k of ['daibac', 'daibac2', 'song', 'songbo', 'songtau', 'coitau', 'chientruong', 'trong', 'hanhquan', 'chim', 'bandan', 'songcuon']) {
      try { const ab = await (await fetch(URLG('audio/' + k + '.mp3'))).arrayBuffer(); AM.buf[k] = await AM.ctx.decodeAudioData(ab); } catch (e) { console.warn('am', k, e); }
    }
  } catch (e) { console.warn(e); }
}
function amLap(k, v) {
  if (!AM.ctx || !AM.buf[k]) return;
  let L = AM.loops[k];
  if (!L) { const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[k]; s.loop = true; const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g); g.connect(AM.master); s.start(); L = AM.loops[k] = { s, g }; }
  L.g.gain.setTargetAtTime(v, AM.ctx.currentTime, 0.6);
}
let amLanCuoi = 0;
function amNo(dist, to = 1) {
  if (!AM.ctx || !AM.buf.daibac || AM.ctx.state !== 'running') return;
  const v = clamp(1 - dist / 9000, 0, 1) ** 1.6 * 0.38 * to; if (v < 0.015) return;   // V1.3: tiếng nổ nhỏ lại, chỉ làm nền cho lời dẫn
  const now = AM.ctx.currentTime; if (now - amLanCuoi < 0.12) return; amLanCuoi = now;
  const s = AM.ctx.createBufferSource(); s.buffer = (dist < 2500 && AM.buf.daibac2 && Math.random() < 0.7) ? AM.buf.daibac2 : AM.buf.daibac; s.playbackRate.value = 0.85 + Math.random() * 0.3;
  const g = AM.ctx.createGain(); g.gain.value = v; s.connect(g); g.connect(AM.master); s.start(now + Math.min(dist / 340, 3) * 0.35);
}

function amMot(k, v) {
  if (!AM.ctx || !AM.buf[k] || AM.ctx.state !== 'running' || v < 0.02) return;
  const s = AM.ctx.createBufferSource(); s.buffer = AM.buf[k]; const g = AM.ctx.createGain(); g.gain.value = v; s.connect(g); g.connect(AM.master); s.start();
}

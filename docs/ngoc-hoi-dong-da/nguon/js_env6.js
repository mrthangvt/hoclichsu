
// ------------------------------------------------------------------ bầu trời, mây, nền chân trời, núi xa
const DAY = { hor: new THREE.Color(0xc9cbc0), top: new THREE.Color(0x7a9cbd), sun: new THREE.Color(0xffe8cc) };
const NIGHT = { hor: new THREE.Color(0x1c2230), top: new THREE.Color(0x060a14), sun: new THREE.Color(0x9fb4ff) };
const _c1 = new THREE.Color(), _c2 = new THREE.Color(), _rgb = { r: 0, g: 0, b: 0 };
const skyU = { uTop: { value: new THREE.Vector3() }, uHor: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(6000, 5200, 6000).normalize() },
  uTime: { value: 0 }, uNight: { value: 0 } };
const NOISE_GLSL = `
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 6; i++){ s += a * vn(p); p = p * 2.02 + vec2(1.7, 9.2); a *= .5; } return s; }`;
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform vec3 uTop, uHor, uSunDir; uniform float uTime, uNight; varying vec3 vDir;` + NOISE_GLSL + `
void main(){
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(uHor, uTop, pow(clamp(h, 0., 1.), .5));
  float sd = max(dot(d, uSunDir), 0.);
  col += (1. - uNight) * (vec3(1., .86, .62) * pow(sd, 48.) * .35 + vec3(1., .93, .8) * pow(sd, 6.) * .07);
  if (h > 0.) {
    vec2 uv = d.xz / (h + .08);
    vec2 q = uv * .9 + vec2(uTime * .006, uTime * .0025);
    float n = fbm(q), n2 = fbm(q * 2.7 + 3.1 + uTime * .004);
    float cov = smoothstep(.44, .76, n + .18 * n2);
    float thick = smoothstep(.55, .95, n + .25 * n2);
    vec3 lit = mix(vec3(1., .985, .955), vec3(1., .9, .75), pow(sd, 3.) * .5);
    vec3 cc = mix(lit, vec3(.70, .72, .76), thick * .75);
    cc = mix(cc, vec3(.12, .14, .20), uNight);
    col = mix(col, cc, cov * smoothstep(0., .07, h) * .95);
    if (uNight > .01) { vec2 sp = d.xz / (h + .3) * 260.; float st = step(.997, h21(floor(sp))); col += vec3(st) * uNight * (1. - cov) * smoothstep(.05, .3, h) * .8; }
  }
  col = mix(col, uHor, smoothstep(.035, -.01, h));
  gl_FragColor = vec4(col, 1.);
}` }));
sky.renderOrder = -10; sky.frustumCulled = false; sky.scale.setScalar(1000); scene.add(sky);

// mặt đất ngoài khung: cùng ánh sáng Lambert với địa hình, màu ruộng – làng biến thiên theo nhiễu
const GROUND_GLSL = `
varying vec2 vGP; varying float vGY;
float gh(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float gn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(gh(i), gh(i + vec2(1., 0.)), f.x), mix(gh(i + vec2(0., 1.)), gh(i + vec2(1., 1.)), f.x), f.y); }
float gf(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++){ s += a * gn(p); p = p * 2.03 + vec2(3.1, 7.7); a *= .5; } return s; }
vec3 groundCol(vec2 p, float y){
  float big = gf(p / 7000.), mid = gf(p / 1500. + 11.), vil = gf(p / 520. + 4.2), fine = gn(p / 90.);
  vec3 c = mix(vec3(.51, .49, .38), vec3(.63, .61, .48), big);
  c = mix(c, vec3(.47, .50, .33), smoothstep(.5, .72, mid) * .6);
  c = mix(c, vec3(.31, .35, .23), smoothstep(.66, .8, vil) * .85);
  c *= .93 + .14 * fine;
#ifdef FOREST
  vec3 f = mix(vec3(.33, .38, .27), vec3(.42, .45, .33), gf(p / 900.));
  c = mix(c, f, smoothstep(H0 + 12., H0 + 140., y));
#endif
  return pow(c, vec3(2.2));
}`;
function groundMaterial(forest, h0) {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  if (forest) m.defines = { FOREST: "", H0: h0.toFixed(2) };
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vGP; varying float vGY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvec4 gwp = modelMatrix * vec4(transformed, 1.0); vGP = gwp.xz; vGY = gwp.y;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + GROUND_GLSL)
      .replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= groundCol(vec2(vGP.x, -vGP.y), vGY);");
  };
  return m;
}
function hash2(i, j) { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm2(x, y, o = 5) { let s = 0, a = 0.5; for (let k = 0; k < o; k++) { s += a * vnoise(x, y); x = x * 2.03 + 1.7; y = y * 2.03 + 9.2; a *= 0.5; } return s; }
const smooth = (a, b, v) => { const t = Math.min(Math.max((v - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };

function buildSurroundings() {
  const { x0, y0, cell, nx, ny, h } = mainField, x1 = x0 + (nx - 1) * cell, y1 = y0 + (ny - 1) * cell;
  const bz = [];
  for (let i = 0; i < nx; i++) bz.push(h[i], h[(ny - 1) * nx + i]);
  for (let j = 0; j < ny; j++) bz.push(h[j * nx], h[j * nx + nx - 1]);
  bz.sort((a, b) => a - b);
  const h0 = Math.max(bz[bz.length >> 1], meta.water + 1.5);
  const cx = (X) => Math.min(Math.max(X, x0), x1), cy = (Y) => Math.min(Math.max(Y, y0), y1);
  const outD = (X, Y) => Math.hypot(X - cx(X), Y - cy(Y));
  const apronZ = (X, Y) => { const e = sampleField(mainField, cx(X), cy(Y)); return e + (h0 - e) * smooth(0, 2600, outD(X, Y)); };
  // lưới vành ngoài: cột/hàng trong khung trùng đúng lưới địa hình nên mép khớp tuyệt đối, ra xa thưa dần tới 150 km
  const OFF = [20, 50, 100, 180, 300, 480, 750, 1100, 1600, 2300, 3300, 4700, 6700, 9500, 13500, 19000, 27000, 38000, 54000, 76000, 110000, 150000];
  const xs = [...OFF.map((o) => x0 - o).reverse(), ...Array.from({ length: nx }, (_, i) => x0 + i * cell), ...OFF.map((o) => x1 + o)];
  const ys = [...OFF.map((o) => y0 - o).reverse(), ...Array.from({ length: ny }, (_, j) => y0 + j * cell), ...OFF.map((o) => y1 + o)];
  const NX = xs.length, a0 = OFF.length, ax1 = OFF.length + nx - 1, ay1 = OFF.length + ny - 1;
  const pos = [], idx = [], vmap = new Map();
  const vid = (i, j) => {
    const k = j * NX + i; let v = vmap.get(k);
    if (v === undefined) { v = pos.length / 3; vmap.set(k, v); pos.push(xs[i], apronZ(xs[i], ys[j]), -ys[j]); }
    return v;
  };
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < NX - 1; i++) {
    if (i >= a0 && i < ax1 && j >= a0 && j < ay1) continue;
    const a = vid(i, j), b = vid(i + 1, j), c = vid(i, j + 1), d = vid(i + 1, j + 1);
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1)); g.computeVertexNormals();
  const apron = new THREE.Mesh(g, groundMaterial(false, h0)); apron.name = "NenChanTroi"; world.add(apron);

  // sông kéo dài ra ngoài khung
  const inR = (X, Y) => X > x0 && X < x1 && Y > y0 && Y < y1;
  const riverZ = (X, Y) => Math.max(meta.water + (h0 + 0.6 - meta.water) * smooth(0, 2600, outD(X, Y)), apronZ(X, Y) + 0.6);
  const cross = (pin, pout) => { let lo = 0, hi = 1; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (inR(pin[0] + (pout[0] - pin[0]) * m, pin[1] + (pout[1] - pin[1]) * m)) lo = m; else hi = m; } return [pin[0] + (pout[0] - pin[0]) * hi, pin[1] + (pout[1] - pin[1]) * hi]; };
  const extend = (pts, seed) => {
    const E = pts[pts.length - 1]; let k = pts.length - 1;
    while (k > 0 && Math.hypot(pts[k][0] - E[0], pts[k][1] - E[1]) < 1500) k--;
    const hd0 = Math.atan2(E[1] - pts[k][1], E[0] - pts[k][0]), out = []; let X = E[0], Y = E[1];
    for (let s = 250; s <= 90000; s += 250) {
      const hd = hd0 + 0.5 * Math.sin(s / 5200 + seed) * Math.min(1, s / 6000) + 0.25 * Math.sin(s / 1900 + 2 * seed) * Math.min(1, s / 3000);
      X += Math.cos(hd) * 250; Y += Math.sin(hd) * 250; out.push([X, Y]);
    }
    return out;
  };
  const RIV = [["Song_Hong", [true, true], new THREE.Color(0.2, 0.135, 0.075)], ["Song_Nhue", [false, true], new THREE.Color(0.075, 0.1, 0.08)]];
  for (const [name, ext, col] of RIV) {
    const R = D.rivers && D.rivers[name]; if (!R) continue;
    let P = []; for (let i = 0; i < R.p.length; i += 2) P.push([R.p[i], R.p[i + 1]]);
    if (ext[0]) P = [...extend([...P].reverse(), 1.3).reverse(), ...P];
    if (ext[1]) P = [...P, ...extend(P, 4.1)];
    const runs = []; let run = null;
    for (let i = 0; i < P.length; i++) {
      const out = !inR(P[i][0], P[i][1]);
      if (out) { if (!run) { run = []; if (i > 0) run.push(cross(P[i - 1], P[i])); } run.push(P[i]); }
      else if (run) { run.push(cross(P[i], P[i - 1])); runs.push(run); run = null; }
    }
    if (run) runs.push(run);
    const rp = [], ri = [];
    for (const r of runs) {
      if (r.length < 2) continue;
      const base = rp.length / 3;
      for (let i = 0; i < r.length; i++) {
        const a = r[Math.max(0, i - 1)], b = r[Math.min(r.length - 1, i + 1)];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
        const far = outD(r[i][0], r[i][1]), w = R.w * (1 + 0.25 * smooth(3000, 40000, far)) / 2, Z = riverZ(r[i][0], r[i][1]);
        rp.push(r[i][0] - ty * w, Z, -(r[i][1] + tx * w), r[i][0] + ty * w, Z, -(r[i][1] - tx * w));
        if (i > 0) { const p = base + (i - 1) * 2; ri.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); }
      }
    }
    if (!ri.length) continue;
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ri);
    const nrm = new Float32Array(rp.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1; rg.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    world.add(new THREE.Mesh(rg, new THREE.MeshPhongMaterial({ color: col, shininess: 80, specular: 0x6a7a80, side: THREE.DoubleSide })));
  }

  // núi xa làm phông chiều sâu: Ba Vì (tây), Tam Đảo (bắc), Sóc Sơn, cụm núi đá vôi phía nam — vị trí tương đối, chỉ để định hướng
  const ridge = (X, Y, mx, my, ang, a, b, peak, seed) => {
    const dx = X - mx, dy = Y - my, c = Math.cos(ang), s = Math.sin(ang), u = (dx * c + dy * s) / a, v = (-dx * s + dy * c) / b;
    const gg = Math.exp(-(u * u + v * v) * 1.6), rr = 1 - Math.abs(vnoise(X / 2600 + seed, Y / 2600) * 2 - 1);
    return peak * gg * (0.55 + 0.45 * fbm2(X / 5200 + seed, Y / 5200 - seed, 4)) * (0.8 + 0.35 * rr);
  };
  const karst = []; for (let k = 0; k < 16; k++) karst.push([-9000 + (hash2(k, 3) - 0.5) * 18000, -40000 + (hash2(k, 7) - 0.5) * 16000, 150 + 230 * hash2(k, 11), 600 + 1000 * hash2(k, 13)]);
  const M = [
    [-48400, 11500, 22000, 350, (X, Y) => ridge(X, Y, -48400, 11500, 0.6, 9000, 6500, 1150, 2.1)],
    [-20300, 53600, 34000, 450, (X, Y) => ridge(X, Y, -20300, 53600, -0.78, 24000, 5500, 1300, 5.3)],
    [-3700, 31400, 9000, 250, (X, Y) => ridge(X, Y, -3700, 31400, 0.3, 5000, 3500, 280, 8.8)],
    [-9000, -40000, 14000, 200, (X, Y) => { let z = 0; for (const [kx, ky, pk, rad] of karst) { const r2 = ((X - kx) ** 2 + (Y - ky) ** 2) / (rad * rad); z = Math.max(z, pk * Math.exp(-r2 * 2) * (0.8 + 0.4 * vnoise(X / 300, Y / 300))); } return z; }],
  ];
  const fmat = groundMaterial(true, h0);
  for (const [mx, my, half, step, fn] of M) {
    const n = Math.round((2 * half) / step) + 1, mp = new Float32Array(n * n * 3), mi = [];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const X = mx - half + i * step, Y = my - half + j * step, k = (j * n + i) * 3;
      mp[k] = X; mp[k + 1] = h0 - 25 + fn(X, Y); mp[k + 2] = -Y;
      if (i < n - 1 && j < n - 1) { const a = j * n + i; mi.push(a, a + 1, a + n, a + 1, a + n + 1, a + n); }
    }
    const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.BufferAttribute(mp, 3)); mg.setIndex(mi); mg.computeVertexNormals();
    scene.add(new THREE.Mesh(mg, fmat));
  }
}

let nightCur = 0;
function envTick(dt, nightTarget) {
  nightCur += (nightTarget - nightCur) * Math.min(1, dt * 1.2);
  applyEnv(nightCur); skyU.uTime.value += dt;
  sky.position.copy(camera.position);
  const d = camera.position.distanceTo(controls.target);
  scene.fog.near = Math.max(W.on ? 400 : 4000, d * 0.9); scene.fog.far = scene.fog.near + Math.max(80000, d * 3);
}
function applyEnv(n) {
  _c1.copy(DAY.hor).lerp(NIGHT.hor, n); scene.fog.color.copy(_c1); scene.background.copy(_c1);
  _c1.getRGB(_rgb, THREE.SRGBColorSpace); skyU.uHor.value.set(_rgb.r, _rgb.g, _rgb.b);
  _c2.copy(DAY.top).lerp(NIGHT.top, n); _c2.getRGB(_rgb, THREE.SRGBColorSpace); skyU.uTop.value.set(_rgb.r, _rgb.g, _rgb.b);
  skyU.uNight.value = n;
  hemi.intensity = 1.35 + (0.42 - 1.35) * n; sun.intensity = 1.9 + (0.28 - 1.9) * n; sun.color.copy(DAY.sun).lerp(NIGHT.sun, n);
}

// ------------------------------------------------------------------ lớp hướng: mũi tên tiến công 3D theo bản đồ diễn biến
const arrowGroup = new THREE.Group(); scene.add(arrowGroup);
const ARR = new Map();
let S = null, arrowState = "none";
const llXY = (lat, lon) => [(lon - meta.lon0) * meta.kx, (lat - meta.lat0) * meta.ky];
function arrowTris(def, grow) {
  const w = def.w || 220, dashed = def.c !== "red";
  const curve = new THREE.CatmullRomCurve3(def.pts.map(([la, lo]) => { const [X, Y] = llXY(la, lo); return new THREE.Vector3(X, 0, Y); }), false, "centripetal");
  const L = curve.getLength(), n = Math.max(8, Math.round(L / 45)), P = curve.getSpacedPoints(n);
  const headL = Math.min(w * 2.2, L * 0.35), shaftEnd = L - headL, dash = w * 1.5, lift = 14 * Math.max(1, EX * 0.7);
  const zAt = (X, Y, half, nx, ny) => Math.max(heightAt(X, Y), heightAt(X + nx * half, Y + ny * half), heightAt(X - nx * half, Y - ny * half)) * EX + lift;
  const out = [];
  const edge = (p, t, half) => { const nx = -t.z, ny = t.x, Z = zAt(p.x, p.z, half, nx, ny); return [[p.x + nx * half, Z, -(p.z + ny * half)], [p.x - nx * half, Z, -(p.z - ny * half)]]; };
  for (let i = 0; i < n; i++) {
    const s0 = (i / n) * L, s1 = ((i + 1) / n) * L; if (s0 >= shaftEnd) break;
    if (dashed && Math.floor((s0 + s1) / 2 / dash) % 2 === 1) continue;
    const t0 = curve.getTangentAt(i / n), t1 = curve.getTangentAt(Math.min((i + 1) / n, shaftEnd / L));
    const pB = s1 > shaftEnd ? curve.getPointAt(shaftEnd / L) : P[i + 1];
    const hw0 = w * 0.42 * (0.6 + 0.4 * Math.min(1, s0 / (w * 4))) + grow, hw1 = w * 0.42 * (0.6 + 0.4 * Math.min(1, s1 / (w * 4))) + grow;
    const [a, b] = edge(P[i], t0, hw0), [c, d] = edge(pB, t1, hw1);
    out.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const tb = curve.getTangentAt(shaftEnd / L), pb = curve.getPointAt(shaftEnd / L), tip = curve.getPointAt(1), te = curve.getTangentAt(1);
  const hw = w * 0.95 + grow * 1.6, [l, r] = edge(pb.clone().addScaledVector(tb, -grow), tb, hw);
  const tp = tip.clone().addScaledVector(te, grow * 1.8), tz = zAt(tp.x, tp.z, 1, 0, 0);
  out.push(...l, ...r, tp.x, tz, -tp.z);
  return new Float32Array(out);
}
function buildArrows() {
  if (!S || !S.arrows) return;
  for (const A of ARR.values()) { arrowGroup.remove(A.g); A.g.traverse((o) => o.geometry && o.geometry.dispose()); }
  for (const id in S.arrows) {
    const def = S.arrows[id], red = def.c === "red", g = new THREE.Group(), old = ARR.get(id);
    const mk = (grow, color, op, ro) => {
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(arrowTris(def, grow), 3));
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      m.renderOrder = ro; m.frustumCulled = false; g.add(m); return m;
    };
    const w = def.w || 220;
    mk(w * 0.09, 0x140b06, 0.5, 5); mk(0, red ? 0xd8392b : 0x2f86e8, 0.9, 6);
    arrowGroup.add(g);
    ARR.set(id, { def, g, p: old ? old.p : 0 });
  }
  applyArrowProgress();
}
function applyArrowProgress() {
  const act = new Set((S && S.states && S.states[arrowState]) || []);
  for (const [id, A] of ARR) {
    if (!act.has(id)) A.p = 0;
    A.g.visible = act.has(id) && A.p > 0;
    for (const m of A.g.children) { const n = m.geometry.attributes.position.count / 3; m.geometry.setDrawRange(0, Math.floor(A.p * n) * 3); }
  }
}
function arrowTick(dt) {
  if (!ARR.size) return;
  const act = (S.states && S.states[arrowState]) || [];
  let ch = false;
  for (const id of act) { const A = ARR.get(id); if (A && A.p < 1) { A.p = reduceMotion ? 1 : Math.min(1, A.p + dt / 2.4); ch = true; } }
  if (ch) applyArrowProgress();
}
function setArrowState(st) {
  if (st === arrowState) return;
  arrowState = st; applyArrowProgress();
  const leg = $("mmLeg"); leg.replaceChildren();
  const txt = S && S.legend && S.legend[st];
  if (txt && st !== "none") {
    const ids = (S.states[st] || []).map((i) => S.arrows[i]);
    if (ids.some((d) => d && d.c === "red")) { const i = document.createElement("i"); i.className = "r"; leg.append(i); }
    if (ids.some((d) => d && d.c !== "red")) { const i = document.createElement("i"); i.className = "b"; leg.append(i); }
    leg.append(txt);
  } else leg.append("Bấm để bay tới · chấm vàng là vị trí đang xem");
  $("legNow").textContent = txt && st !== "none" ? "Đang hiển thị: " + txt : "";
}
$("ly-arr").addEventListener("change", (e) => { arrowGroup.visible = e.target.checked; });


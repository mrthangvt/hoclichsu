
// ------------------------------------------------------------------ âm thanh nền theo cảnh (V8): dùng file thật trong thư mục AmThanh của anh
// Thay cho tiếng chim, trống, giao tranh tổng hợp của V6 (đã tắt). Gió đêm, côn trùng tổng hợp vẫn giữ làm nền rất nhẹ.
// Không dùng hai file có tiếng chém máu me / người trúng đao ngã (kịch bản: không dựng cảnh phản cảm).
const AM = { ctx: null, out: null, buf: {}, beds: {}, ready: false, next: {}, fired: new Set(), key: "" };
const AM_BED = ["chim", "hanhquan", "trong", "chientruong", "danhkiem", "thaochay", "buoc_co", "hetxung", "bandan"];
const AM_ONE = ["ngua", "chem", "daibac"];
// mức âm nền theo cảnh i (0..13) và tiến độ u (0..1)
function amPlan(i, u) {
  switch (i) {
    case 0: return { chim: 0.55 };                                      // Thăng Long trước binh biến: dẫn chuyện
    case 1: return { chim: 0.25, trong: 0.16 };                         // quân Thanh vào Thăng Long
    case 2: return { chim: 0.5 };                                       // lên ngôi
    case 3: return { hanhquan: 0.6 };                                   // hành quân thần tốc
    case 4: return { chim: 0.45 };                                      // Tam Điệp: kế hoạch
    case 5: return { hanhquan: 0.32 };                                  // đêm giao thừa vượt sông
    case 6: return { hanhquan: 0.22 };                                  // Hà Hồi: vây lặng lẽ
    case 7: return { trong: 0.3 };                                      // Ngọc Hồi trước bình minh
    case 8: return { trong: 0.6, hetxung: u < 0.55 ? 0.42 : 0.2, bandan: u > 0.25 ? 0.35 : 0 };  // voi chiến, kỵ binh, hỏa lực
    case 9: return u < 0.62 ? { trong: 0.45, bandan: 0.42 }             // 20 tấm mộc tiến dưới làn đạn
                            : { chientruong: 0.55, danhkiem: 0.7, hetxung: u < 0.8 ? 0.5 : 0.18 };  // xông lũy, giáp lá cà
    case 10: return { thaochay: 0.45, buoc_co: 0.4 };                   // Đầm Mực: quân Thanh tháo chạy
    case 11: return u < 0.32 ? { hanhquan: 0.42 } : u < 0.75 ? { hetxung: 0.55, buoc_co: 0.35 } : { chientruong: 0.5, danhkiem: 0.6 };
    case 12: return u < 0.7 ? { buoc_co: 0.35, thaochay: 0.25 } : { chim: 0.3 };   // rút qua cầu phao, rồi dân ra đón
    case 13: return { chim: 0.55 };                                     // mùa xuân độc lập
  }
  return {};
}
// tiếng đơn theo mốc: [cảnh, u, tên, mức]
const AM_MOC = [[8, 0.1, "ngua", 0.7], [8, 0.4, "ngua", 0.6], [8, 0.5, "daibac", 0.45], [9, 0.04, "daibac", 0.5], [12, 0.1, "ngua", 0.45]];
// tiếng lặp ngẫu nhiên: [cảnh, u0, u1, tên, mức, giãn cách giây min, max]
const AM_LAP = [[8, 0.3, 1, "daibac", 0.38, 6, 12], [9, 0.0, 0.62, "daibac", 0.38, 7, 13], [9, 0.72, 0.9, "chem", 0.45, 0.6, 1.6], [11, 0.75, 1, "chem", 0.4, 0.7, 1.8]];
async function amLoad() {
  const ctx = AM.ctx, get = async (n) => {
    let r = await fetch("am/" + n + ".mp3").catch(() => null), ab;
    if (r && r.ok) ab = await r.arrayBuffer();
    else { const j = await (await fetch("am/" + n + ".json")).json(); ab = nvU8(j.b64).buffer; }
    AM.buf[n] = await ctx.decodeAudioData(ab);
  };
  await Promise.all([...AM_BED, ...AM_ONE].map((n) => get(n).catch((e) => console.warn("âm thanh", n, e))));
  for (const n of AM_BED) {
    if (!AM.buf[n]) continue;
    const s = ctx.createBufferSource(); s.buffer = AM.buf[n]; s.loop = true;
    const g = ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.out);
    s.start(0, Math.random() * AM.buf[n].duration); AM.beds[n] = g;
  }
  AM.ready = true;
}
function amEnable(on) {
  if (on && !AM.ctx) {
    AM.ctx = new (window.AudioContext || window.webkitAudioContext)(); AM.out = AM.ctx.createGain(); AM.out.gain.value = 0.9; AM.out.connect(AM.ctx.destination);
    amLoad();
  }
  if (AM.ctx) { if (on) AM.ctx.resume(); else AM.ctx.suspend(); }
}
function amShot(n, vol) {
  const b = AM.buf[n]; if (!b || !AM.ready) return;
  const s = AM.ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = 0.94 + Math.random() * 0.12;
  const g = AM.ctx.createGain(); g.gain.value = vol; s.connect(g).connect(AM.out); s.start();
}
function amTick(dt) {
  if (!AM.ready || !audio.on || !S) return;
  let i = 0, u = 0, live = true;
  if (appMode === "film") { i = cur; u = Math.min(1, st / S.scenes[cur].dur); live = playing; }
  else if (appMode === "explore") { i = exploreI; u = S.scenes[i] ? (NV.ex % S.scenes[i].dur) / S.scenes[i].dur : 0; }
  else { i = cmpA; u = 1; }
  const plan = amPlan(i, u), k = live ? 1 : 0.25, now = AM.ctx.currentTime;
  const buoc = W.on && W.moving ? (W.runNow ? 0.55 : 0.32) : 0;              // đi bộ trên sa bàn: tiếng chân thật
  for (const n in AM.beds) {
    let v = (plan[n] || 0) * k; if (W.on) v *= 0.5; if (n === "buoc_co") v = Math.max(v, buoc);
    AM.beds[n].gain.setTargetAtTime(v, now, 0.8);
  }
  if (!live) return;
  const key = appMode + ":" + i;
  if (key !== AM.key) { AM.key = key; AM.fired.clear(); AM.next = {}; }
  for (const [si, mu, n, v] of AM_MOC) if (si === i && u >= mu && u < mu + 0.08 && !AM.fired.has(si + n + mu)) { AM.fired.add(si + n + mu); amShot(n, v); }
  const t = performance.now() / 1000;
  AM_LAP.forEach(([si, u0, u1, n, v, a, b], j) => {
    if (si !== i || u < u0 || u > u1) return;
    if (!(j in AM.next)) AM.next[j] = t + Math.random() * a;
    if (t >= AM.next[j]) { amShot(n, v * (0.7 + Math.random() * 0.3)); AM.next[j] = t + a + Math.random() * (b - a); }
  });
}

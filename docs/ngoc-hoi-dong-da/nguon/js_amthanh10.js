
// ------------------------------------------------------------------ âm thanh nền theo cảnh (V10): dùng file thật trong thư mục AmThanh của anh
// Thay cho tiếng chim, trống, giao tranh tổng hợp của V6 (đã tắt). Gió đêm, côn trùng tổng hợp vẫn giữ làm nền rất nhẹ.
// V10: "thaochay" là file chiến trường tàn sát (dùng lúc xông đồn), "hetxung" là tiếng hét xung trận.
// Hành quân: nhiều lớp tiếng chân (hai file chân, mỗi file phát thêm một lớp lệch nhịp) chồng lên nhau cho dày.
const AM = { ctx: null, out: null, buf: {}, beds: {}, ready: false, next: {}, fired: new Set(), key: "" };
const AM_BED = ["chim", "hanhquan", "trong", "chientruong", "danhkiem", "thaochay", "buoc_co", "buoc_rung", "hetxung", "bandan"];
const AM_LOP = { hanhquan_b: ["hanhquan", 0.9], hanhquan_c: ["hanhquan", 1.12], buoc_co_b: ["buoc_co", 1.08], buoc_rung_b: ["buoc_rung", 0.93] };   // lớp chồng: [file gốc, tốc độ]
const HQ = (k) => ({ hanhquan: 0.5 * k, hanhquan_b: 0.4 * k, hanhquan_c: 0.3 * k, buoc_co: 0.4 * k, buoc_co_b: 0.3 * k, buoc_rung: 0.28 * k, buoc_rung_b: 0.22 * k });
const AM_ONE = ["ngua", "chem", "daibac"];
// mức âm nền theo cảnh i (0..13) và tiến độ u (0..1)
function amPlan(i, u) {
  switch (i) {
    case 0: return { chim: 0.33 };                                      // mở đầu: Thăng Long trước binh biến (chim nhẹ 60%)
    case 1: return { trong: 0.16, ...HQ(0.5) };                         // quân Thanh qua cầu phao vào Thăng Long
    case 2: return { trong: 0.32, hetxung: u > 0.28 && u < 0.4 ? 0.3 : 0, ...(u > 0.6 ? HQ(0.8) : {}) };   // lên ngôi, xuất quân
    case 3: return { trong: 0.22, ...HQ(1) };                           // hành quân thần tốc: chân chồng chân
    case 4: return { trong: 0.2 };                                      // Tam Điệp: kế hoạch
    case 5: return { trong: 0.12, ...HQ(0.85) };                        // đêm giao thừa vượt sông
    case 6: return { ...HQ(0.4), hetxung: u > 0.24 && u < 0.46 ? 0.32 : 0 };   // Hà Hồi: tiếng loa, hô vây
    case 7: return { trong: 0.3 };                                      // Ngọc Hồi trước bình minh
    case 8: return { trong: 0.6, hetxung: u < 0.3 ? 0.55 : 0.15, bandan: u > 0.25 ? 0.35 : 0 };   // voi lao tới, hỏa lực
    case 9: return u < 0.66 ? { trong: 0.45, bandan: 0.42, ...HQ(0.35) }                         // tuyến mộc tiến dưới làn đạn
                            : { hetxung: u < 0.86 ? 0.7 : 0.25, thaochay: 0.55, danhkiem: 0.7, chientruong: 0.45, trong: 0.25 };   // xông đồn, giáp lá cà
    case 10: return { thaochay: 0.4, chientruong: 0.3, hetxung: 0.3, ...HQ(0.3) };   // Đầm Mực
    case 11: return u < 0.36 ? { ...HQ(0.8) } : u < 0.6 ? { hetxung: 0.65, ...HQ(0.4) } : u < 0.85 ? { thaochay: 0.5, danhkiem: 0.65, chientruong: 0.4, hetxung: 0.3 } : { trong: 0.35 };
    case 12: return u < 0.6 ? { thaochay: 0.25, ...HQ(0.6) } : { trong: 0.38, ...HQ(0.5) };   // rút chạy qua cầu phao; Tây Sơn tiến vào kinh thành
    case 13: return { trong: 0.4 };                                     // mùa xuân độc lập
  }
  return {};
}
// tiếng đơn theo mốc: [cảnh, u, tên, mức]
const AM_MOC = [[8, 0.08, "ngua", 0.7], [8, 0.25, "ngua", 0.65], [8, 0.32, "ngua", 0.5], [12, 0.2, "ngua", 0.45], [11, 0.46, "ngua", 0.5]];
// tiếng lặp ngẫu nhiên: [cảnh, u0, u1, tên, mức, giãn cách giây min, max]
// đại bác phát cùng lúc với hiệu ứng khai hoả (fxTick); ở đây chỉ còn tiếng chém lặp lúc giáp lá cà
const AM_LAP = [[9, 0.74, 0.9, "chem", 0.45, 0.6, 1.6], [11, 0.6, 0.85, "chem", 0.4, 0.7, 1.8]];
// V10.6: nạp lười – chỉ giải mã file nào cảnh đang cần, lần lượt từng file (điện thoại không bị treo, không ngốn bộ nhớ)
AM.q = []; AM.busy = false; AM.req = new Set();
function amNeed(n) {
  const src = AM_LOP[n] ? AM_LOP[n][0] : n;
  if (AM.buf[src] || AM.req.has(src) || !AM.ctx) return; AM.req.add(src); AM.q.push(src); amPump();
}
async function amPump() {
  if (AM.busy || !AM.q.length) return; AM.busy = true;
  const n = AM.q.shift();
  try {
    const r = await fetch("am/" + n + ".mp3"); const ab = await r.arrayBuffer();
    AM.buf[n] = await new Promise((ok, no) => AM.ctx.decodeAudioData(ab, ok, no));
  } catch (e) { console.warn("âm thanh", n, e); }
  AM.busy = false; setTimeout(amPump, 30);
}
function amBed(n) {
  if (AM.beds[n]) return AM.beds[n];
  const src = AM_LOP[n] ? AM_LOP[n][0] : n, b = AM.buf[src]; if (!b) { amNeed(n); return null; }
  const s = AM.ctx.createBufferSource(); s.buffer = b; s.loop = true; if (AM_LOP[n]) s.playbackRate.value = AM_LOP[n][1];
  const g = AM.ctx.createGain(); g.gain.value = 0; s.connect(g).connect(AM.out); s.start(0, Math.random() * b.duration);
  return (AM.beds[n] = g);
}
async function amLoad() { AM.ready = true; for (const n of AM_ONE) amNeed(n); }
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
  if (buoc) plan.buoc_co = Math.max(plan.buoc_co || 0, buoc);
  for (const n in plan) if (plan[n] > 0) amBed(n);
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


// ------------------------------------------------------------------ âm thanh nền theo cảnh (V9): dùng file thật trong thư mục AmThanh của anh
// Thay cho tiếng chim, trống, giao tranh tổng hợp của V6 (đã tắt). Gió đêm, côn trùng tổng hợp vẫn giữ làm nền rất nhẹ.
// Không dùng hai file có tiếng chém máu me / người trúng đao ngã (kịch bản: không dựng cảnh phản cảm).
const AM = { ctx: null, out: null, buf: {}, beds: {}, ready: false, next: {}, fired: new Set(), key: "" };
const AM_BED = ["chim", "hanhquan", "trong", "chientruong", "danhkiem", "thaochay", "buoc_co", "hetxung", "bandan"];
const AM_ONE = ["ngua", "chem", "daibac"];
// mức âm nền theo cảnh i (0..13) và tiến độ u (0..1)
function amPlan(i, u) {
  // V9: tiếng chim chỉ ở phần mở đầu (60%); trống tiến quân, hò reo xông trận, đánh kiếm theo diễn biến
  switch (i) {
    case 0: return { chim: 0.33 };                                      // mở đầu: Thăng Long trước binh biến
    case 1: return { trong: 0.16 };                                     // quân Thanh vào Thăng Long
    case 2: return { trong: 0.32, hetxung: u > 0.28 && u < 0.4 ? 0.3 : 0 };   // lên ngôi, xuất quân
    case 3: return { hanhquan: 0.55, trong: 0.22 };                     // hành quân thần tốc
    case 4: return { trong: 0.2 };                                      // Tam Điệp: kế hoạch
    case 5: return { hanhquan: 0.32 };                                  // đêm giao thừa vượt sông
    case 6: return { hanhquan: 0.2, hetxung: u > 0.24 && u < 0.46 ? 0.32 : 0 };   // Hà Hồi: tiếng loa, hô vây
    case 7: return { trong: 0.3 };                                      // Ngọc Hồi trước bình minh
    case 8: return { trong: 0.6, hetxung: u < 0.3 ? 0.45 : 0.15, bandan: u > 0.25 ? 0.35 : 0 };   // voi lao tới, hỏa lực
    case 9: return u < 0.66 ? { trong: 0.45, bandan: 0.42 }             // tuyến mộc tiến dưới làn đạn
                            : { chientruong: 0.5, danhkiem: 0.75, hetxung: u < 0.82 ? 0.55 : 0.2, trong: 0.25 };   // xông lũy, giáp lá cà
    case 10: return { thaochay: 0.45, buoc_co: 0.35, hetxung: 0.2 };    // Đầm Mực
    case 11: return u < 0.36 ? { hanhquan: 0.4 } : u < 0.6 ? { hetxung: 0.55, buoc_co: 0.3 } : u < 0.85 ? { chientruong: 0.5, danhkiem: 0.7 } : { trong: 0.35 };
    case 12: return u < 0.6 ? { buoc_co: 0.35, thaochay: 0.25 } : { trong: 0.38 };   // rút chạy; trống tiến vào kinh thành
    case 13: return { trong: 0.4 };                                     // mùa xuân độc lập
  }
  return {};
}
// tiếng đơn theo mốc: [cảnh, u, tên, mức]
const AM_MOC = [[8, 0.08, "ngua", 0.7], [8, 0.25, "ngua", 0.65], [8, 0.32, "ngua", 0.5], [12, 0.2, "ngua", 0.45], [11, 0.46, "ngua", 0.5]];
// tiếng lặp ngẫu nhiên: [cảnh, u0, u1, tên, mức, giãn cách giây min, max]
// đại bác phát cùng lúc với hiệu ứng khai hoả (fxTick); ở đây chỉ còn tiếng chém lặp lúc giáp lá cà
const AM_LAP = [[9, 0.74, 0.9, "chem", 0.45, 0.6, 1.6], [11, 0.6, 0.85, "chem", 0.4, 0.7, 1.8]];
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

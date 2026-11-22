// ------------------------------------------------------------------ V10.4: voice thu âm làm đồng hồ chính của phim
// Thời gian cảnh theo voice (sc.dur); máy quay, đội hình, ngày đêm, hiệu ứng vẫn dựng trên dòng thời gian cũ (sc.dur_cu)
// và được "nắn" qua sc.ban_do = [[giây cũ, giây mới], …] (source/voice_ngochoi.py, apply_voice.py).
function tCu(i, t) {
  const sc = S && S.scenes[i], K = sc && sc.ban_do; if (!K) return t;
  for (let k = 0; k < K.length - 1; k++) if (t <= K[k + 1][1]) { const a = K[k], b = K[k + 1], e = (t - a[1]) / Math.max(1e-6, b[1] - a[1]); return a[0] + (b[0] - a[0]) * e; }
  return K[K.length - 1][0];
}
function uCu(i, t) { const sc = S.scenes[i]; return Math.min(1, Math.max(0, tCu(i, t) / (sc.dur_cu || sc.dur))); }
var VC = { el: null, ok: false, unlocked: false, jump: true };
(async () => {
  try {
    const r = await fetch("voice_ngochoi.mp3"); if (!r.ok) return;
    const url = URL.createObjectURL(await r.blob()), a = new Audio(); a.preload = "auto"; a.src = url;   // trang artifact chỉ phát media từ blob:
    a.addEventListener("canplaythrough", () => { VC.ok = true; }, { once: true }); a.addEventListener("loadedmetadata", () => { VC.ok = true; }, { once: true });
    VC.el = a;
  } catch (e) { console.warn("voice", e); }
})();
const vcDung = () => voiceOn && VC.ok && VC.unlocked && appMode === "film";
function vcGuard() { const a = VC.el; if (a && !a.paused && !(vcDung() && playing)) a.pause(); }
function vcTick() {                                      // true = giây phim lấy theo voice
  const a = VC.el; if (!a || !vcDung() || !S) return false;
  const g = starts[cur] + st;
  a.playbackRate = speed;
  if (VC.jump || (a.paused && Math.abs(a.currentTime - g) > 0.3)) { try { a.currentTime = Math.min(g, a.duration || g); } catch (e) {} VC.jump = false; }
  if (a.paused) { if (!a.ended) a.play().catch(() => { VC.unlocked = false; }); return false; }
  const t = a.currentTime; if (a.ended || t >= total - 0.05) return false;
  let i = cur; while (i < starts.length - 1 && t >= starts[i + 1]) i++; while (i > 0 && t < starts[i]) i--;
  if (i !== cur) { cur = i; onScene(); }
  st = t - starts[i]; return true;
}
{
  const g0 = goScene; goScene = function (...a) { VC.jump = true; return g0.apply(this, a); };
  $("seek").addEventListener("input", () => { VC.jump = true; });
  const mo = () => { VC.unlocked = true; VC.jump = true; };
  window.addEventListener("pointerdown", mo, true); window.addEventListener("keydown", mo, true);
}
window.__vc = () => [VC.ok, VC.unlocked, VC.el ? VC.el.paused : null, VC.el ? +VC.el.currentTime.toFixed(2) : null, +(starts[cur] + st).toFixed(2), voiceOn, playing];
// ------------------------------------------------------------------ V10.6: nút "Bắt đầu xem" – điện thoại chỉ cho phát tiếng trong một lần chạm,
// nên mọi thứ có tiếng (voice, âm nền) được mở ngay trong cú chạm này; phim chờ ở giây 0 tới khi người xem bấm.
{
  const box = document.createElement("div"); box.id = "batdau";
  box.innerHTML = '<button id="bbatdau" disabled>Đang tải lời dẫn…</button><small>Phim có lời dẫn thu âm và âm thanh – bấm để bắt đầu</small>';
  document.body.append(box);
  const st_ = document.createElement("style");
  st_.textContent = "#batdau{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(10,8,6,.45);backdrop-filter:blur(2px)}" +
    "#batdau button{font:700 18px var(--font,system-ui);padding:14px 26px;border-radius:99px;border:0;background:var(--gold,#e2b768);color:#23190d;box-shadow:0 6px 24px rgba(0,0,0,.4)}" +
    "#batdau button:disabled{opacity:.7}#batdau small{color:#f3ead9;text-shadow:0 1px 3px #000;font-size:13px;padding:0 20px;text-align:center}#batdau[hidden]{display:none}";
  document.head.append(st_);
  const san = () => { const b = $("bbatdau"); if (VC.ok && b.disabled) { b.disabled = false; b.textContent = "▶ Bắt đầu xem"; } };
  const iv = setInterval(() => { san(); if (!$("bbatdau").disabled) clearInterval(iv); }, 300);
  setTimeout(() => { const b = $("bbatdau"); if (b.disabled) { b.disabled = false; b.textContent = "▶ Bắt đầu xem"; } }, 15000);   // mạng chậm: vẫn cho xem
  $("bbatdau").addEventListener("click", () => {
    const a = VC.el;
    if (a) { try { a.currentTime = Math.min(starts[cur] + st, (a.duration || 1) - 0.1); } catch (e) {} const p = a.play(); if (p) p.catch(() => {}); }   // phát ngay trong cú chạm
    VC.unlocked = true; VC.jump = false; voiceOn = true; $("bvo").classList.add("on");
    if (!audio.on) audio.enable(true);
    amEnable(true);
    const b = $("bsnd"); b.classList.add("on"); b.classList.remove("hint"); b.textContent = "🔊 Âm thanh";
    box.hidden = true; setPlaying(true);
  });
  window.batDau = (hien) => { box.hidden = !hien; };
}
$("splay").addEventListener("click", () => {                 // bấm nút Phát cũng là một cú chạm: mở tiếng luôn
  if (!playing) return;
  const a = VC.el; if (a && a.paused) { const p = a.play(); if (p) p.catch(() => {}); }
  VC.unlocked = true; amEnable(audio.on || true); if (!audio.on) audio.enable(true); window.batDau(false);
});
$("modes").addEventListener("click", () => window.batDau(false));

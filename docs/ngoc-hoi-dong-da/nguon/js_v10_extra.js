// V10.2: điện thoại (iOS/Android) chỉ cho đọc giọng sau khi gọi speak() ngay trong một lần chạm → đọc một câu rỗng để mở khoá
function voUnlock() {
  if (!("speechSynthesis" in window) || voUnlock.done) return; voUnlock.done = true;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(" "); u.lang = "vi-VN"; u.volume = 0; speechSynthesis.speak(u); speechSynthesis.resume(); } catch (e) {}
  lastLine = "";
}
$("bvo").addEventListener("click", () => { voUnlock(); });
$("splay").addEventListener("click", () => { voUnlock(); lastLine = ""; });
// ------------------------------------------------------------------ V10: vào sa bàn là bật sẵn âm thanh và lời bình (trình duyệt chỉ cho phát sau lần chạm đầu tiên)
{
  const amFirst = (e) => {
    window.removeEventListener("pointerdown", amFirst, true); window.removeEventListener("keydown", amFirst, true);
    if (e && e.target && e.target.closest && e.target.closest("#bsnd")) return;          // bấm thẳng nút âm thanh: để nút tự xử lý
    voUnlock();
    if (!audio.on) { audio.enable(true); amEnable(true); }
    const b = $("bsnd"); b.classList.add("on"); b.classList.remove("hint"); b.textContent = "🔊 Âm thanh";
    lastLine = "";
  };
  window.addEventListener("pointerdown", amFirst, true); window.addEventListener("keydown", amFirst, true);
}

// V10.1: nút bật/tắt mũi tên trên thanh trên cùng, đồng bộ với ô "Mũi tên" trong Lớp
{
  const sync = () => $("barr").classList.toggle("on", $("ly-arr").checked);
  $("barr").onclick = () => { const c = $("ly-arr"); c.checked = !c.checked; c.dispatchEvent(new Event("change")); sync(); };
  $("ly-arr").addEventListener("change", sync);
}
// V10.7: thẻ ghi chú khi bấm vào điểm pin – đặt vào khoảng trống giữa cụm nút phía trên và thanh phim phía dưới, không đè lên nút
{
  const xep = () => {
    const el = $("info"); document.body.classList.toggle("info-mo", !!el && !el.hidden); if (!el || el.hidden) return;
    const top = document.querySelector(".hud.top .right"), bar = ["filmbar", "explorebar", "povbar"].map((id) => $(id)).find((b) => b && !b.hidden);
    const t = top && !document.body.classList.contains("cinema") ? top.getBoundingClientRect().bottom + 8 : 12;
    const b = bar && !document.body.classList.contains("cinema") ? innerHeight - bar.getBoundingClientRect().top + 8 : 12;
    Object.assign(el.style, { top: t + "px", bottom: b + "px", maxHeight: Math.max(120, innerHeight - t - b) + "px", height: "auto", overflowY: "auto", zIndex: 30 });
    if (innerWidth < 700) Object.assign(el.style, { left: "10px", right: "10px", width: "auto", borderRadius: "16px" });
    el.style.bottom = "auto";
  };
  new MutationObserver(xep).observe($("info"), { attributes: true, attributeFilter: ["hidden"] });
  addEventListener("resize", xep);
}
{ const st = document.createElement("style"); st.textContent = "body.info-mo #pad{visibility:hidden}"; document.head.append(st); }

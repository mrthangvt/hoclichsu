// ---------- thẻ bản đồ, thẻ chữ ----------
const BO_BIEN = {
  vn: [[22.5, 113.5], [21.6, 111.5], [21.4, 109.8], [21.5, 108.3], [20.9, 107.1], [20.3, 106.6], [19.8, 105.9], [18.7, 105.7], [18.0, 106.5], [17.0, 107.1], [16.4, 107.7], [16.1, 108.2], [15.5, 108.7], [14.1, 109.2], [12.9, 109.4], [11.6, 109.2], [10.9, 108.4], [10.4, 107.2], [10.3, 106.7], [9.6, 106.6], [8.6, 105.0], [10.0, 104.8], [10.6, 104.2], [11.5, 103.0], [12.5, 102.3], [13.4, 100.9], [12.7, 100.0], [10.5, 99.2], [8.5, 100.2], [6.9, 100.6], [5.3, 103.1], [3.0, 103.4], [1.4, 104.2], [1.3, 103.6], [2.5, 101.8], [4.0, 100.6], [6.5, 100.2], [8.0, 98.3], [12, 98.6], [16, 97.6], [17, 94.6]],
  tq: [[22.5, 113.5], [22.3, 114.2], [23.2, 116.5], [24.5, 118.2], [26.0, 119.6], [28, 121]],
  hn: [[20.0, 110.2], [19.6, 111.0], [18.6, 110.5], [18.2, 109.5], [18.7, 108.7], [19.6, 108.6], [20.1, 109.6], [20.0, 110.2]],
  lz: [[18.5, 120.8], [18.3, 122.2], [16.0, 121.8], [14.6, 121.4], [13.8, 120.6], [14.6, 120.0], [16.2, 119.8], [17.5, 120.4], [18.5, 120.8]],
  tw: [[25.2, 121.5], [24.0, 121.6], [22.0, 120.8], [23.0, 120.1], [24.5, 120.6], [25.2, 121.5]],
  bn: [[7.0, 116.8], [5.6, 115.5], [4.6, 114.2], [2.8, 111.5], [2.0, 109.6], [0.5, 109.0]],
};
function veBanDo(kieu) {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 900; const g = c.getContext('2d');
  const lo0 = 96, lo1 = 126, la0 = -1, la1 = 27;
  const P = (la, lo) => [(lo - lo0) / (lo1 - lo0) * 1400, (la1 - la) / (la1 - la0) * 900];
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#1d3a52'); gr.addColorStop(1, '#13283c'); g.fillStyle = gr; g.fillRect(0, 0, 1400, 900);
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1; for (let lo = 100; lo <= 125; lo += 5) { const [x] = P(0, lo); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 900); g.stroke(); } for (let la = 0; la <= 25; la += 5) { const [, y] = P(la, 0); g.beginPath(); g.moveTo(0, y); g.lineTo(1400, y); g.stroke(); }
  // đất liền: tô vùng phía Tây/Bắc đường bờ
  g.fillStyle = '#c8b68a'; g.strokeStyle = '#8a7650'; g.lineWidth = 3;
  const vn = BO_BIEN.vn.map(p => P(...p)), tq = BO_BIEN.tq.map(p => P(...p));
  g.beginPath(); g.moveTo(...P(28, 121)); [...tq].reverse().forEach(p => g.lineTo(...p)); vn.forEach(p => g.lineTo(...p)); g.lineTo(0, P(17, 94.6)[1]); g.lineTo(0, 0); g.lineTo(P(28, 121)[0], 0); g.closePath(); g.fill(); g.stroke();
  for (const k of ['hn', 'lz', 'tw']) { g.beginPath(); BO_BIEN[k].forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, ...P(...p))); g.closePath(); g.fill(); g.stroke(); }
  g.beginPath(); g.moveTo(1400, P(7.5, 117)[1]); BO_BIEN.bn.forEach(p => g.lineTo(...P(...p))); g.lineTo(P(0.5, 109)[0], 900); g.lineTo(1400, 900); g.closePath(); g.fill(); g.stroke();
  const diem = (la, lo, ten, mau = '#fff', dx = 14, dy = 6, to = 26) => { const [x, y] = P(la, lo); g.fillStyle = mau; g.beginPath(); g.arc(x, y, 9, 0, 6.3); g.fill(); g.font = `600 ${to}px system-ui, sans-serif`; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 5; g.strokeText(ten, x + dx, y + dy); g.fillText(ten, x + dx, y + dy); };
  const mui = (pts, mau) => {
    const Q = pts.map(p => P(...p)); g.strokeStyle = mau; g.lineWidth = 9; g.setLineDash([24, 14]); g.beginPath(); Q.forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, ...p)); g.stroke(); g.setLineDash([]);
    const [a, b] = [Q[Q.length - 2], Q[Q.length - 1]], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    g.fillStyle = mau; g.beginPath(); g.moveTo(b[0] + Math.cos(an) * 26, b[1] + Math.sin(an) * 26); g.lineTo(b[0] + Math.cos(an + 2.4) * 30, b[1] + Math.sin(an + 2.4) * 30); g.lineTo(b[0] + Math.cos(an - 2.4) * 30, b[1] + Math.sin(an - 2.4) * 30); g.fill();
  };
  g.font = '600 30px system-ui'; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillText('BIỂN ĐÔNG', ...P(14, 112.5)); g.fillText('ĐẠI NAM', ...P(15.2, 104.6));
  if (kieu === 'bando-chau-a') {
    mui([[22.2, 114.0], [19.5, 112.2], [17.2, 109.6], [16.25, 108.45]], '#ffffff');
    mui([[14.4, 120.6], [15.0, 115.5], [16.0, 110.5], [16.15, 108.5]], '#f2c230');
    mui([[3, 96.5], [5.5, 103.8], [10.0, 108.6], [15.6, 108.8]], 'rgba(255,255,255,.65)');
    diem(22.3, 114.17, 'Vùng biển Trung Hoa', '#fff', 14, -14); diem(14.6, 120.98, 'Manila (Tây Ban Nha)', '#f2c230', 14, 30); diem(1.29, 103.85, 'Singapore', '#fff', 14, 30, 22);
    g.font = '500 24px system-ui'; g.fillStyle = '#fff'; g.fillText('← từ châu Âu: Pháp, Tây Ban Nha', 20, P(2, 0)[1] + 60);
  } else {
    mui([[16.0, 108.6], [14.0, 109.7], [11.5, 109.6], [10.2, 107.6], [10.75, 106.8]], '#ffffff');
    diem(10.78, 106.69, 'Gia Định', '#ff5a4a', -150, 8, 30);
  }
  diem(16.07, 108.22, 'Đà Nẵng', '#ff5a4a', 16, 8, 32); diem(16.46, 107.59, 'Kinh đô Huế', '#f2c230', -200, -8, 26);
  g.font = '500 20px system-ui'; g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText('Sơ đồ MINH HOẠ · không theo tỉ lệ đo đạc', 20, 880);
  return c.toDataURL('image/jpeg', 0.9);
}
const THE = {};
function theHien(id, on) {
  const el = $('#the');
  if (!on) { if (el.dataset.id) { el.classList.remove('hien'); el.dataset.id = ''; } return; }
  if (el.dataset.id === id) return; el.dataset.id = id; el.classList.add('hien');
  if (id === 'bando-chau-a' || id === 'bando-gia-dinh') {
    THE[id] ||= veBanDo(id);
    el.innerHTML = `<img src="${THE[id]}"><div class="chu">${id === 'bando-chau-a' ? 'Liên quân Pháp – Tây Ban Nha hướng tới Đà Nẵng (1858)' : 'Tháng 2/1859: phần lớn hạm đội chuyển hướng vào Gia Định'}</div>`;
  } else if (id === 'trieu-dinh') {
    el.innerHTML = `<div class="chu-lon"><small>Kinh đô Huế</small>Triều đình nhận tin chiến sự Đà Nẵng<br><span>Vua Tự Đức điều Nguyễn Tri Phương ra mặt trận Quảng Nam</span></div>`;
  } else if (id === 'loi-binh') {
    el.innerHTML = `<div class="chu-lon loi"><small>Lời bình (sáng tác, không phải lời ghi lại của Nguyễn Tri Phương)</small>Không để địch mở rộng chiếm đóng.<br>Không cho địch dễ dàng tiếp tế trên bộ.<br>Buộc đối phương sa lầy.</div>`;
  } else if (id === 'hien-trang') {
    el.innerHTML = `<img src="${ANH_HT || ''}"><div class="chu">Thành Điện Hải hôm nay (ảnh tư liệu)</div>`;
  } else if (id === 'tua-de') {
    el.innerHTML = `<div class="tua"><small>Không gian lịch sử · Học Lịch Sử</small>ĐÀ NẴNG 1858<span>Nơi tiếng súng xâm lược đầu tiên vang lên<br>và ý chí kháng chiến của quân dân Đại Nam được thể hiện từ những ngày đầu tiên</span></div>`;
  }
}

// ---------- đồng hồ (voice), giao diện ----------
const UI = { t: 0, chay: false, che: 'phim', nhan: true, am: true, keo: false };
const voice = new Audio(); voice.preload = 'auto';
const nhac = new Audio(); nhac.loop = true; nhac.volume = 0;
let voiceSan = false, tDongHo = performance.now();
let ANH_HT = null;
async function napVoice() {
  try { ANH_HT = URL.createObjectURL(await (await fetch(URLG('anh/thanh-dien-hai-nay.jpg'))).blob()); } catch (e) { }
  try { const b = await (await fetch(URLG('audio/voice.mp3'))).blob(); voice.src = URL.createObjectURL(b); voiceSan = true; } catch (e) { console.warn('voice', e); }
  try { const b = await (await fetch(URLG('audio/nhacnen.mp3'))).blob(); nhac.src = URL.createObjectURL(b); } catch (e) { }
}
function phat() {
  UI.chay = true; $('#sbPlay').textContent = '⏸';
  if (AM.ctx && AM.ctx.state !== 'running') AM.ctx.resume();
  if (voiceSan && UI.am && UI.vo) { voice.currentTime = UI.t; voice.playbackRate = UI.toc; voice.play().catch(() => { }); }
  if (UI.am) nhac.play().catch(() => { });
  tDongHo = performance.now();
}
function dung() { UI.chay = false; $('#sbPlay').textContent = '▶'; voice.pause(); nhac.pause(); }
function tua(t) { UI.t = clamp(t, 0, ST.dur); if (voiceSan) voice.currentTime = UI.t; NHAY = true; }
let NHAY = true;
// ---------- giao diện kiểu Thành cổ Quảng Trị (V1.3) ----------
UI.toc = 1; UI.vo = true; UI.cc = true; UI.cine = false;
const TOC = [0.75, 1, 1.25, 1.5];
const esc = (x) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let NGUON = null;
function hoiHienTai() { return ST.scenes.find(s => UI.t >= s.t0 && UI.t < s.t1) || ST.scenes[ST.scenes.length - 1]; }
function chip(id, on) { const b = $('#' + id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
function dungGiaoDien() {
  $('#sbTicks').innerHTML = ST.scenes.map(s => `<i style="left:${(s.t0 / ST.dur * 100).toFixed(2)}%"></i>`).join('');
  const seek = $('#sbSeek');
  seek.addEventListener('input', () => { UI.keo = true; tua(seek.value / 1000 * ST.dur); });
  seek.addEventListener('change', () => { UI.keo = false; if (UI.chay) phat(); });
  $('#sbPlay').onclick = () => UI.chay ? dung() : phat();
  $('#sbPrev').onclick = () => { const i = ST.scenes.indexOf(hoiHienTai()); const s = UI.t - hoiHienTai().t0 > 3 ? hoiHienTai() : ST.scenes[Math.max(0, i - 1)]; tua(s.t0 + 0.01); if (UI.chay) phat(); };
  $('#sbNext').onclick = () => { const i = ST.scenes.indexOf(hoiHienTai()); tua(ST.scenes[Math.min(ST.scenes.length - 1, i + 1)].t0 + 0.01); if (UI.chay) phat(); };
  $('#sbSpeed').onclick = () => { UI.toc = TOC[(TOC.indexOf(UI.toc) + 1) % TOC.length]; $('#sbSpeed').textContent = String(UI.toc).replace('.', ',') + '×'; $('#sbSpeed').classList.toggle('on', UI.toc !== 1); voice.playbackRate = UI.toc; };
  $('#pickList').innerHTML = ST.scenes.map((s, i) => `<li><button data-i="${i}"><b>${String(i + 1).padStart(2, '0')}</b> ${esc(s.title)}<small>${esc(s.date)} · ${fmt(s.t1 - s.t0)}</small></button></li>`).join('');
  $('#sbPick').onclick = () => { $('#picker').hidden = !$('#picker').hidden; };
  $('#picker').onclick = (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; $('#picker').hidden = true; cheDo('phim'); tua(ST.scenes[+b.dataset.i].t0 + 0.01); if (!UI.chay) phat(); else phat(); };
  $('#sbDocs').onclick = () => moTuLieu();
  $('#cc').onclick = () => { UI.cc = !UI.cc; chip('cc', UI.cc); };
  $('#vo').onclick = () => { UI.vo = !UI.vo; chip('vo', UI.vo); voice.muted = !UI.vo || !UI.am; if (UI.vo && UI.chay) phat(); };
  $('#bnhan').onclick = () => { UI.nhan = !UI.nhan; chip('bnhan', UI.nhan); };
  $('#bam').onclick = () => { UI.am = !UI.am; chip('bam', UI.am); $('#bam').textContent = UI.am ? '🔊 Âm thanh' : '🔇 Âm thanh'; voice.muted = !UI.am || !UI.vo; nhac.muted = !UI.am; if (AM.master) AM.master.gain.value = UI.am ? 1 : 0; };
  const setCine = (v) => { UI.cine = v; document.body.classList.toggle('cine', v); if (v) { $('#picker').hidden = true; $('#docs').hidden = true; } };
  $('#cine').onclick = () => setCine(true); $('#cineExit').onclick = () => setCine(false);
  let cineT = null; const peek = () => { if (!UI.cine) return; $('#cineExit').classList.add('show'); clearTimeout(cineT); cineT = setTimeout(() => $('#cineExit').classList.remove('show'), 2500); };
  addEventListener('pointermove', peek); addEventListener('pointerdown', peek);
  document.querySelector('.modes').onclick = (e) => { const b = e.target.closest('button[data-m]'); if (b) cheDo(b.dataset.m); };
  document.addEventListener('keydown', (e) => {
    if (UI.che === 'baotang') return;
    if (e.code === 'Space') { e.preventDefault(); UI.chay ? dung() : phat(); }
    if (e.code === 'ArrowRight') tua(UI.t + 5); if (e.code === 'ArrowLeft') tua(UI.t - 5);
    if (e.code === 'KeyH') setCine(!UI.cine); if (e.code === 'Escape' && UI.cine) setCine(false);
  });
  // nút về trang chủ Học Lịch Sử — chỉ hiện khi sa bàn chạy trong website (đường dẫn có /khong-gian/)
  { const i = location.pathname.indexOf('/khong-gian/'); if (i >= 0) { const b = $('#veTrang'); b.href = location.pathname.slice(0, i) + '/'; b.hidden = false; } }
  $('#go').onclick = () => { $('#load').classList.add('done'); cheDo('phim'); tua(0); phat(); };
  fetch(URLG('sources.json')).then(r => r.json()).then(j => NGUON = j).catch(() => { });
  // bản đồ nhỏ
  MM.img = new Image(); MM.img.src = URLG('anh/bando-nho.jpg');
}
function moTuLieu(dong) {
  const d = $('#docs'); if (dong || !d.hidden) { d.hidden = true; $('#sbDocs').classList.remove('on'); return; }
  const sc = hoiHienTai(), i = ST.scenes.indexOf(sc);
  const ng = (NGUON && NGUON.sources) || [];
  d.innerHTML = `<button class="x" id="docsX" aria-label="Đóng">×</button>
    <div class="eyebrow">Hồi ${String(i + 1).padStart(2, '0')} · ${esc(sc.date)}</div><h2>${esc(sc.title)}</h2>
    <h4>1 · Điều đang thấy</h4><ul>${sc.shots.map(h => `<li>${esc(h.mo)}</li>`).join('')}</ul>
    <h4>2 · Phần tái dựng mô phỏng</h4><p>${esc(NGUON ? NGUON.reconstruction : '')}</p>
    <h4>3 · Tham khảo</h4><ul class="refs">${ng.map(s => `<li><b>[${esc(s.id)}]</b> ${/^https?:/.test(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}${s.used_for ? ' — <span class="muted">' + esc(s.used_for) + '</span>' : ''}</li>`).join('')}</ul>
    <p class="muted small">Sa bàn là tái dựng mô phỏng phục vụ học tập; nhân vật, vị trí và hiệu ứng là minh hoạ trừ khi ghi có nguồn.</p>`;
  d.hidden = false; $('#sbDocs').classList.add('on'); $('#docsX').onclick = () => moTuLieu(true);
}
let OC = null;
function cheDo(c) {
  const cu = UI.che; UI.che = c;
  document.querySelectorAll('.modes button').forEach(b => { const on = b.dataset.m === c; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  $('#storybar').hidden = c !== 'phim'; $('#picker').hidden = true; if (c !== 'phim') { $('#docs').hidden = true; $('#sub').hidden = true; }
  $('#bt').hidden = c !== 'baotang';
  $('#tieuDe').textContent = c === 'phim' ? 'Theo dòng lịch sử · tái dựng có dẫn chuyện' : c === 'kham' ? 'Khám phá tự do' : 'Bảo tàng vật dụng, binh khí 1858';
  $('#help').textContent = c === 'phim' ? 'Kéo để nhìn quanh · ⏸ để dừng · Tư liệu để đọc nguồn' : c === 'kham' ? 'Kéo để xoay · cuộn/chụm để phóng to · bấm nút hồi để đổi thời điểm' : 'Kéo để xoay quanh hiện vật · chạm tên hiện vật để đọc thẻ · bấm “Đi bộ tham quan” để dạo trong bảo tàng';
  if (c === 'kham' || c === 'baotang') {
    if (!OC) { OC = new OrbitControls(camera, cv); OC.enableDamping = true; OC.maxPolarAngle = Math.PI * 0.495; OC.minDistance = 3; OC.maxDistance = 40000; }
    OC.enabled = true; theHien(null, false);
    if (c === 'kham') { const v = VT['dien-hai']; OC.target.set(v.x, gAt(v.x, v.n), -v.n); camera.position.set(v.x - 1200, 900, -v.n + 1600); OC.minDistance = 8; }
    else { baoTangVao(); }
    if (UI.chay && c === 'baotang') dung();
  } else if (OC) OC.enabled = false;
  if (cu === 'baotang' && c !== 'baotang') baoTangRa();
}
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let hoiCu = null;
const MM = { img: null, t: 0 };
function veBanDoNho(dt) {
  MM.t += dt; if (MM.t < 0.25) return; MM.t = 0;
  const cvm = $('#minimap canvas'), g = cvm.getContext('2d'), S = 300, R = 10200;
  const P = (x, n) => [((x - TAM[0]) + R) / (2 * R) * S, (R - (n - TAM[1])) / (2 * R) * S];
  if (MM.img && MM.img.complete) g.drawImage(MM.img, 0, 0, S, S); else { g.fillStyle = '#2a2119'; g.fillRect(0, 0, S, S); }
  g.strokeStyle = 'rgba(226,183,104,.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(S / 2, S / 2, RSB / R * S / 2, 0, 6.3); g.stroke();
  for (const [k, ten] of [['dien-hai', 'Điện Hải'], ['an-hai', 'An Hải'], ['son-tra-tay', 'Sơn Trà']]) { const [x, y] = P(VT[k].x, VT[k].n); g.fillStyle = '#c44838'; g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#fff3d6'; g.font = '600 11px sans-serif'; g.fillText(ten, x + 5, y + 4); }
  for (const t of TAU) if (t.visible) { const [x, y] = P(t.userData.x, t.userData.n); if (x > 0 && x < S && y > 0 && y < S) { g.fillStyle = '#9ecbff'; g.beginPath(); g.arc(x, y, 2.2, 0, 6.3); g.fill(); } }
  const c = camera.position, d = new V3(); camera.getWorldDirection(d); const [x, y] = P(c.x, -c.z), an = Math.atan2(d.z, d.x);
  g.fillStyle = 'rgba(255,240,200,.28)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 30, an - 0.45, an + 0.45); g.closePath(); g.fill();
  g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(clamp(x, 4, S - 4), clamp(y, 4, S - 4), 4, 0, 7); g.fill();
  g.fillStyle = '#fff3d6'; g.font = '600 14px sans-serif'; g.fillText('B ↑', S - 32, 18);
}
function giaoDienCapNhat(t, sc, sh) {
  const i = ST.scenes.indexOf(sc);
  if (!UI.keo) $('#sbSeek').value = Math.round(t / ST.dur * 1000);
  $('#sbTime').textContent = ' ' + fmt(t) + ' / ' + fmt(ST.dur);
  if (sc !== hoiCu) {
    hoiCu = sc; $('#sbNum').textContent = String(i + 1).padStart(2, '0') + '/' + String(ST.scenes.length).padStart(2, '0'); $('#sbName').textContent = sc.title;
    $('#dateLbl').textContent = sc.date; $('#hoiChu').textContent = 'Hồi ' + (i + 1) + ' · ' + sc.title; $('#hoiChu').classList.remove('moi'); void $('#hoiChu').offsetWidth; $('#hoiChu').classList.add('moi');
    $('#mmLeg').textContent = sc.date + ' · ' + sc.title;
    if (!$('#docs').hidden) { $('#docs').hidden = true; moTuLieu(); }
  }
  let sub = ''; if (UI.che === 'phim') for (const s of sc.subs) if (t >= s[0] && t < s[1] + 0.4) sub = s[2];
  $('#sub').textContent = sub; $('#sub').hidden = !(sub && UI.cc && UI.che === 'phim');
}
// mức âm nền theo hồi
function amCapNhat(t, sc) {
  if (!UI.chay || !UI.am) { for (const k in AM.loops) amLap(k, 0); return; }
  const id = sc.id, tran = ['C04', 'C05', 'C06', 'C09'].includes(id);
  const camH = camera.position.y, gan = camH < 400 ? 1 : camH < 1500 ? 0.5 : 0.2;
  amLap('song', ['C01', 'C02', 'C03', 'C10', 'C11', 'C12'].includes(id) ? 0.2 : 0.1);
  amLap('songbo', ['C01', 'C02', 'C03', 'C04', 'C05', 'C11', 'C12'].includes(id) ? 0.55 * gan : 0.12 * gan);
  let dt = 1e9; for (const g of TAU) if (g.visible) dt = Math.min(dt, g.position.distanceTo(camera.position));
  amLap('songtau', dt < 250 ? 0.6 * (1 - dt / 250) + 0.15 : 0);
  amLap('chim', ['C01', 'C07', 'C08', 'C12'].includes(id) ? 0.25 : 0);
  amLap('chientruong', tran ? 0.16 : 0);
  amLap('trong', id === 'C06' || id === 'C09' ? 0.18 : 0);
  amLap('hanhquan', id === 'C06' && t < TE('C06-01') + 3 ? 0.3 : 0);
  amLap('bandan', (id === 'C06' && t > TC('C06', 4)) || (id === 'C09' && t > TS('C09-03')) ? 0.18 : 0);
  // giọng đọc rõ: khi đang có lời dẫn thì hạ hiệu ứng, nhạc
  const noi = UI.vo && sc.subs.some(s => t >= s[0] - 0.2 && t < s[1] + 0.3);
  if (AM.master && UI.am) AM.master.gain.setTargetAtTime(noi ? 0.5 : 0.8, AM.ctx.currentTime, 0.25);
  nhac.volume = clamp((tran ? 0.06 : 0.16) * (noi ? 0.65 : 1), 0, 1);
}

// ---------- khởi động ----------
let NGUA = null, NGUOI_NGUA = null, THUYEN_CHAI = null, TRAI = [];
async function khoiDong() {
  resize();
  const tien = (k, s) => { $('#fill').style.width = (k * 100) + '%'; $('#loadtxt').textContent = s; };
  tien(0.05, 'Đang tải kịch bản…');
  ST = await (await fetch(URLG('story.json'))).json();
  Object.assign(VT, await (await fetch(URLG('vitri.json'))).json());
  for (const s of ST.scenes) { SC[s.id] = s; for (const h of s.shots) SH[h.id] = h; }
  SAN.push([VT['dien-hai'].x, VT['dien-hai'].n, 125], [VT['an-hai'].x, VT['an-hai'].n, 90], [VT['son-tra-tay'].x, VT['son-tra-tay'].n, 30], [VT['dinh-hai'].x, VT['dinh-hai'].n, 30], [430, -5420, 20]);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi', 'chon-sang']) SAN.push([VT[k].x, VT[k].n, 45]);
  SAN.push([BT.M[0], BT.M[1], 55]);
  tien(0.15, 'Đang dựng địa hình vịnh Đà Nẵng…'); await dungDiaHinh(); waterU.hmap.value = HTEX; waterU.dmap.value = DTEX;
  tien(0.4, 'Đang dựng thành lũy…');
  TRANH.push([VT['dien-hai'].x, VT['dien-hai'].n, 160], [VT['an-hai'].x, VT['an-hai'].n, 110], [430, -5420, 60], [VT['trai-phap'].x, VT['trai-phap'].n, 90], [VT['son-tra-tay'].x, VT['son-tra-tay'].n, 60]);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) TRANH.push([VT[k].x, VT[k].n, 60]);
  // lũy (vết ƯỚC LƯỢNG theo sơ đồ 1859) — ranh không trồng cây
  const L1 = [[1560, -3300], [1100, -3330], [400, -3420], [-535, -3480], [-1300, -3300], [-2000, -2950]];
  const L2 = [[-535, -3560], [-300, -4500], [300, -5150], [1300, -5600], [1800, -5700]];
  const L3 = [[2300, -3700], [2700, -4600], [3150, -5900], [3700, -7000]];
  const L4 = [[-1600, -8000], [-900, -8050], [-300, -8150]];
  for (const L of [L1, L2, L3, L4]) for (let i = 0; i < L.length - 1; i++) for (let s = 0; s <= 1; s += 0.1) TRANH.push([lerp(L[i][0], L[i + 1][0], s), lerp(L[i][1], L[i + 1][1], s), 40]);
  TRANH.push([-260, -1320, 50], [-900, -3440, 50], [BT.M[0], BT.M[1], 70], [VT['hai-van'].x + 25, VT['hai-van'].n - 20, 45], [-505, -3510, 60], [430, -5420, 40]);
  await Promise.all([napGach(), napPhao()]);
  taoDienHai();
  taoThanh('an-hai', 46, 36, -0.2, 'nguyen', 10);
  taoPhaoDai('son-tra-tay', 2.6, 5); taoPhaoDai('dinh-hai', 0.6, 4);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi', 'chon-sang']) taoDon(k, k === 'lien-tri' ? 30 : 24);
  taoHaiVan();
  taoLuy(L1, TC('C08', 1), TC('C08', 4) + 2, 'L1'); taoLuy(L2, TC('C08', 3), TC('C08', 6), 'L2'); taoLuy(L3, TC('C08', 4), TC('C08', 7), 'L3'); taoLuy(L4, 0, 0.1, 'L4');
  banBanDo(430, -5420, 0.2); dungPhaoMau();
  tien(0.55, 'Đang dựng làng mạc, tre, dừa…'); await new Promise(r => setTimeout(r, 0));
  const dem = dungLang(); console.log('lang', dem); dungLangChai();
  // cây rừng thưa, bụi ven sông (V1.2)
  { const L = await (await fetch(URLG('cay.json'))).json(); const R = rng(77);
    const gC = new THREE.OctahedronGeometry(1, 0); gC.translate(0, 0.6, 0);
    const mk = (list, sx, sy, cols) => { const im = new THREE.InstancedMesh(gC, new THREE.MeshLambertMaterial({ color: 0xffffff }), list.length), m = new THREE.Matrix4(), c = new THREE.Color();
      list.forEach((t, i) => { const x = t[0] + TAM[0], n = t[1] + TAM[1], s = 0.7 + R() * 0.7; m.compose(new V3(x, gAt(x, n) - 0.3, -n), new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), R() * 6.3), new V3(sx * s, sy * s * (0.8 + R() * 0.5), sx * s)); im.setMatrixAt(i, m); im.setColorAt(i, c.set(cols[Math.floor(R() * cols.length)])); });
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; im.frustumCulled = false; scene.add(im); return im; };
    const ok = (t) => !trongVungTranh(t[0] + TAM[0], t[1] + TAM[1]); const rung = L.filter(t => !t[2] && ok(t) && hAt(t[0] + TAM[0], t[1] + TAM[1]) > 0.6), bui = L.filter(t => t[2] && ok(t) && hAt(t[0] + TAM[0], t[1] + TAM[1]) > 0.5);
    CONG.rung = mk(rung, 3.6, 4.2, [0x2f4a26, 0x3a5a2c, 0x45662f, 0x2a4222]); CONG.bui = mk(bui, 2.2, 1.6, [0x4a6a30, 0x587a36, 0x3e5e2a]);
    console.log('cay v12', rung.length, bui.length); }
  { const g = new Ghep(), x0 = -890, n0 = -3452, y0 = gAt(x0, n0);
    for (let k = 0; k < 40; k++) g.tru(0.03, 0.05, 1.4, (k % 8) * 0.12 - 0.5, 0.06 + Math.floor(k / 8) * 0.08, (k % 3) * 0.05, 0xb8a868, 4, 0, 0, Math.PI / 2);
    for (let k = 0; k < 12; k++) g.tru(0.0, 0.04, 1.2, 1.2 + (k % 6) * 0.25, 0.5, 0.8 + Math.floor(k / 6) * 0.3, 0xa89a58, 4, 0, -0.5);
    const m = g.luoi(); m.position.set(x0, y0, -n0); scene.add(m); CONG.chong = m; }
  // trại liên quân (từ khi chiếm, gỡ khi rút 1860)
  TRAI.push(dungTrai(VT['trai-phap'].x, VT['trai-phap'].n - 10, 6, 5, 0.3, TS('C06-01')), dungTrai(VT['dien-hai'].x + 170, VT['dien-hai'].n + 120, 5, 4, 0.1, TS('C06-01')));
  // thùng lương thực, quân y (Hồi 10)
  { const g = new Ghep(), tp = VT['trai-phap']; const x0 = tp.x - 10, n0 = tp.n - 30, y0 = gAt(x0, n0);
    for (let k = 0; k < 9; k++) g.hop(0.9, 0.6, 0.6, (k % 3) * 1.0 - 1, 0.3 + Math.floor(k / 3) * 0.6 * (k > 5 ? 0 : 1), Math.floor(k / 3) * 0.7, 0x7a5a36);
    for (let k = 0; k < 5; k++) g.tru(0.32, 0.32, 0.8, 2.4 + (k % 2) * 0.7, 0.4, -1 + k * 0.6, 0x5a4026, 10);
    g.hop(0.7, 0.4, 0.5, -2.5, 0.2, 1.5, 0xe8e4d8); g.hop(0.15, 0.4, 0.4, -2.5, 0.42, 1.5, 0xc0302a); g.hop(0.4, 0.15, 0.15, -2.5, 0.42, 1.5, 0xc0302a);
    const m = g.luoi(); m.position.set(x0, y0, -n0); scene.add(m); CONG.hang = m; }
  tien(0.65, 'Đang dựng hạm đội…'); await napTau(); dungHamDoi();
  THUYEN_CHAI = (() => { const R = rng(31), L = []; for (let k = 0; k < 28; k++) { const x = -1800 + R() * 2200, n = -1250 + R() * 900; if (hAt(x, n) > -1.2) continue; L.push([x, 0, -n, R() * 6.28, 1]); } const im = instDat(thuyenChaiGeo(), L); im.userData.L = L; return im; })();
  NGUA = taoNgua(); NGUA.children.forEach(c => c.visible = false);   // V1.3: vẽ bằng ngựa có xương của Ngọc Hồi – Đống Đa
  tien(0.75, 'Đang bố trí quân…');
  dungBinhKhi();
  { let k = 0; const ds = [['phap', 320], ['nguyen', 320], ['danbinh', 160], ['dannam', 120], ['dannu', 120], ['ntp', 4], ['khachnam', 10], ['khachnu', 10], ['aodai', 10], ['ngua', 4]];
    await Promise.all(ds.map(async ([t, c]) => { await napXNV(t, c); k++; tien(0.75 + 0.08 * k / ds.length, 'Đang tải nhân vật có xương… ' + k + '/' + ds.length); })); }
  boTriNhanVat(); dungBaoTang();
  NGUOI_NGUA = nhom({ id: 'nguoi-ngua', phe: 'nguyen', so: 1, mu: 'nondau', vk: 'khong', lich: [[0, 0, 0, 'ngoi']], hien: [TS('C03-03') - 1, TE('C03-03') + 1], y: 0 });
  lichBan();
  // điểm cháy
  const cv0 = CONG['dien-hai'].position, ca = CONG['an-hai'].position;
  CHAY.push({ p: cv0.clone().add(new V3(-20, 5, -8)), t0: TC('C05', 4), t1: TS('C06-03'), to: 1.6 }, { p: cv0.clone().add(new V3(25, 4, 10)), t0: TC('C05', 5), t1: TS('C06-02'), to: 1.2 },
    { p: ca.clone().add(new V3(5, 4, -5)), t0: TC('C05', 2), t1: TS('C06-02'), to: 1.4 }, { p: W(VT['son-tra-tay'].x + 10, VT['son-tra-tay'].n + 8, 3), t0: TC('C04', 6), t1: TS('C05-03'), to: 1.2 },
    { p: W(-1500, -8150, 2), t0: TC('C06', 5), t1: TS('C07-01'), to: 1 }, { p: W(-200, -7900, 2), t0: TC('C06', 5) + 3, t1: TS('C07-01'), to: 0.8 });
  // đuốc đêm 31/8 trên thành, đồn
  for (const p of PHAO.filter(p => p.ten === 'dien-hai' || p.ten === 'an-hai' || p.ten === 'son-tra-tay')) CHAY.push({ p: p.pos.clone().add(new V3(-p.dir.z * 2.5, 2.2, p.dir.x * 2.5)), t0: TC('C03', 9) - 2, t1: TC('C04', 4), to: 0.12 });
  // mũi tên
  const A = (pts, cao, t0, t1, h0, h1) => muiTen(pts, cao, t0, t1, [h0, h1]);
  A([[-1200, 2700], [200, 2900], [1500, 2500]], 140, TS('C04-05'), TS('C04-05') + 4, TS('C04-05'), TE('C04-05'));
  A([[-700, 1500], [500, 600], [1400, -200], [2050, -1300]], 140, TS('C04-05') + 2, TS('C04-05') + 6, TS('C04-05'), TE('C04-05'));
  A([[-4300, -3250], [-3200, -6000], [-1500, -8000]], 160, TS('C06-03'), TS('C06-03') + 4, TS('C06-03'), TE('C06-03'));
  A([[1200, -2300], [800, -5500], [-200, -7600]], 160, TS('C06-03') + 1, TS('C06-03') + 5, TS('C06-03'), TE('C06-03'));
  A([[1100, -2200], [400, -2900], [-420, -3300]], 180, TS('C09-01'), TS('C09-01') + 3, TS('C09-01'), TE('C09-01'));
  A([[1400, -2300], [700, -3700], [450, -5000]], 180, TS('C09-01') + 1, TS('C09-01') + 4, TS('C09-01'), TE('C09-01'));
  A([[2200, -1800], [2350, -3000], [2400, -3650]], 180, TS('C09-01') + 2, TS('C09-01') + 5, TS('C09-01'), TE('C09-01'));
  A([[2350, -2000], [2900, -4200], [3150, -5800]], 180, TS('C09-01') + 3, TS('C09-01') + 6, TS('C09-01'), TE('C09-01'));
  A([[-420, -3200], [300, -2700], [1000, -2300]], 120, TS('C09-05'), TS('C09-05') + 4, TS('C09-05'), TE('C09-05'));
  // V1.4 — Hồi 2 (0:44–0:54): hải trình liên quân tiến vào cửa biển Đà Nẵng, vẽ thẳng trên sa bàn
  { const t0 = TS('C02-01'), t1 = TE('C02-01') + 0.6;
    muiTen([[7600, 9900], [4600, 9200], [1400, 7600], [-300, 4600], [-850, 2350]], 420, t0 + 0.6, t0 + 5.2, [t0, t1], 0xd8402e, 150);
    muiTen([[9800, 5200], [7200, 7600], [3400, 8300], [600, 6300], [-450, 2700]], 420, t0 + 2.2, t0 + 7.2, [t0, t1], 0xf2c14e, 120);
    const mt = (ten, x, n, h, a, b) => { nhan(ten, new V3(x, h, -n), 'mt', (t) => t > a && t < b); NHAN[NHAN.length - 1].luon = true; };
    mt('Hạm đội Pháp từ Biển Đông (Quảng Châu)', 6900, 9600, 700, t0 + 0.6, t1);
    mt('Tàu, quân Tây Ban Nha từ Manila', 9000, 5700, 700, t0 + 2.2, t1);
    mt('Cửa biển Đà Nẵng', -900, 2600, 500, t0 + 5.5, t1); }
  for (const [L, t0, t1] of [[L1, TC('C08', 1), TC('C08', 4) + 2], [L2, TC('C08', 3), TC('C08', 6)], [L3, TC('C08', 4), TC('C08', 7)]]) {
    const dv = []; for (let i = 0; i < L.length - 1; i++) for (let s2 = 0; s2 < 1; s2 += 0.2) { const x = lerp(L[i][0], L[i + 1][0], s2), n = lerp(L[i][1], L[i + 1][1], s2); dv.push([x, n, gAt(x, n) + 25]); }
    const e = L[L.length - 1]; dv.push([e[0], e[1], gAt(e[0], e[1]) + 25]);
    const o = muiTen(dv, 0, t0, t1, [t0, ST.dur + 10], 0xf2b84a, 26); o.vachLuy = true;
  }
  COI = [TS('C01-05') + 2, TS('C02-05') + 1, TS('C03-04') + 1, TE('C03-04') - 1, TS('C11-03') + 1, TS('C12-02') + 1];
  dungVung(); dungNhan(); dungNhanBaoTang(); diBoGiaoDien();
  lapLichTroi(); dungGiaoDien();
  tien(0.85, 'Đang tải giọng đọc và âm thanh…');
  await Promise.all([napVoice(), amNap()]);
  tien(0.95, 'Đang nạp lên card đồ hoạ…');
  // vẽ thử toàn cảnh để nạp mọi hình khối lên GPU (bài học 10)
  capNhat(TS('C04-01') + 20, 0.016, true); renderer.compile(scene, camera); renderer.render(scene, camera);
  capNhat(TS('C09-04') + 3, 0.016, true); renderer.render(scene, camera);
  capNhat(0, 0.016, true); renderer.render(scene, camera);
  tien(1, 'Sẵn sàng'); $('#load').classList.add('ready'); $('#go').hidden = false; $('#gohint').hidden = false;
  window.__sa = { get OC() { return OC; }, NHOM, PHAO, BT, CONG, DI, TAU, get NGUA() { return NGUA; }, nhin: (p, t) => { UI.che = 'tu'; camera.position.set(...p); camera.lookAt(...t); }, tua, phat, dung, get t() { return UI.t; }, buoc: (dt) => { UI.t += dt; }, ST, cheDo, capNhat, renderer, camera, scene };
  requestAnimationFrame(vong);
}
let tLast = performance.now(), tCoi = 0, COI = [];
function capNhat(t, dt, nhay) {
  nguoiU.uT.value = t; waterU.time.value = t; skyU.time.value = t;
  tauCapNhat(t); xuongCapNhat(t);
  // ngựa đưa tin
  { const t0 = TS('C03-03') - 1, t1 = TE('C03-03') + 1, a = [-7480, 9880], LN = VNAT.ngua_chay * (t1 - t0), b = [a[0] + 100 / 156.2 * LN, a[1] - 120 / 156.2 * LN], u = clamp((t - t0) / (t1 - t0), 0, 1);   // ngựa phi đúng sải chân
    const x = lerp(a[0], b[0], u), n = lerp(a[1], b[1], u); NGUA.visible = t > t0 && t < t1; NGUA.userData.q = (t - t0); NGUA.position.set(x, gAt(x, n), -n); NGUA.rotation.y = -Math.atan2(b[0] - a[0], b[1] - a[1]);
    NGUA.userData.chan.forEach((c, i) => c.rotation.x = Math.sin(t * 9 + (i % 2 ? 0 : 1.6) + (i > 1 ? 0.8 : 0)) * 0.6);
    NGUOI_NGUA.lich = [[0, x, n, 'ngoi']]; NGUOI_NGUA.huong = [b[0], b[1]]; NGUOI_NGUA.y = gAt(x, n) + 1.22; }
  let mt = null;
  if (UI.che === 'phim') mt = mayQuay(t); else if (DI.on) diBoCapNhat(dt || 0.016); else { OC && OC.update(); baoTangBay(); }
  matCat();
  NHOM_DT = dt; NHOM_NHAY = nhay; nhomCapNhat(t);
  const mua = troiCapNhat(t);
  // cờ: Nguyễn → Pháp khi mất; trở lại khi liên quân rút
  const doi = (k, t0) => { const f = COT_CO[k]; if (f) doiCo(f, t >= t0 && t < TE('C12-02') ? 'phap' : 'nguyen'); };
  doi('son-tra-tay', TC('C04', 13)); doi('an-hai', TC('C05', 6)); doi('dien-hai', TC('C05', 7) + 6);
  coBay(t); luyCapNhat(t);
  for (const k of ['hai-chau', 'phuoc-ninh', 'thac-gian', 'lien-tri', 'nai-hien', 'hoa-khue', 'my-thi']) CONG[k].visible = t > SC.C07.t0;
  for (const im of TRAI) im.visible = t > im.userData.t0 && t < TE('C12-02');
  CONG.hang.visible = t > TS('C06-01') && t < TE('C11-05');
  THUYEN_CHAI.visible = t < TS('C03-04') || t > TS('C12-03');
  const camH = camera.position.y;
  VUNG.visible = (t > TS('C05-05') && t < TE('C12-01')) && camH > 1500; VUNG.userData.vien.m.visible = VUNG.visible;
  for (const x of DAU_X) x.visible = VUNG.visible && t < TS('C12-02');
  muiCapNhat(t);
  if (!nhay && UI.chay) for (const e of COI) if (tCoi < e && e <= t) { let d = 1e9; for (const g of TAU) if (g.visible) d = Math.min(d, g.position.distanceTo(camera.position)); amMot('coitau', clamp(1 - d / 9000, 0.25, 0.9)); }
  tCoi = t;
  for (const o of MUI) if (o.vachLuy) { o.m.visible = o.m.visible && camH > 1200; o.m.material.opacity = 0.85; }
  banCapNhat(t, dt, nhay); chayCapNhat(t, nhay ? 0 : dt); tauKhoi(t, nhay ? 0 : dt);
  if (!nhay) { KHOI.capNhat(dt, GIO); LUA.capNhat(dt, GIO); } else { KHOI.capNhat(0.001, GIO); LUA.capNhat(0.001, GIO); }
  muaCapNhat(t, mua > 0.5 && camH < 400 ? mua : 0);
  if (mt) {
    const id = mt.sh.the || ((t >= TC('C07', 4) - 0.3 && t < TC('C07', 7)) ? 'loi-binh' : mt.sh.id === 'C12-04' && t > (mt.sh.t0 + mt.sh.t1) / 2 ? 'hien-trang' : null);
    theHien(id, !!id && UI.che === 'phim'); document.body.classList.toggle('tua', id === 'tua-de');
    giaoDienCapNhat(t, mt.sc, mt.sh); amCapNhat(t, mt.sc);
  } else { const sc = ST.scenes.find(s => t >= s.t0 && t < s.t1) || ST.scenes[11]; giaoDienCapNhat(t, sc, null); amCapNhat(t, sc); }
  nhanCapNhat(t, UI.nhan, 0); veBanDoNho(dt || 0.016);
}
function vong() {
  requestAnimationFrame(vong);
  try {
    const now = performance.now(), dt = Math.min((now - tLast) / 1000, 0.1); tLast = now;
    if (UI.chay && !UI.keo) {
      if (voiceSan && UI.am && UI.vo && !voice.paused && Math.abs(voice.currentTime - UI.t) < 3) UI.t = voice.currentTime; else UI.t += dt * UI.toc;
      if (UI.t >= ST.dur) { UI.t = ST.dur; dung(); }
    }
    capNhat(UI.t, dt, NHAY); NHAY = false;
    renderer.render(scene, camera);
  } catch (e) { console.error(e); }
}
khoiDong().catch(e => { console.error(e); $('#loadtxt').textContent = 'Lỗi: ' + e.message; });

/* ==========================================================================
   VIỆT SỬ V3.8 — lớp chức năng (nạp cuối trang)
   1. Menu "Sách giáo khoa lịch sử" lấy dữ liệu từ CMS (/api/textbook/…)
   2. Khung quảng cáo AdSense: tự chèn, chỉ tải khi khung hiện ra màn hình
   ========================================================================== */
(function () {
  'use strict';
  var ONLINE = /^https?:$/.test(location.protocol);

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function yearLabel(y) { return y == null ? '' : (y < 0 ? Math.abs(y) + ' TCN' : String(y)); }
  function safeUrl(u) { return /^(https:\/\/[^\s"'<>]+|\/(?!\/)[^\s"'<>]*)$/.test(u || '') ? u : ''; }

  /* ======================================================================
     1. SÁCH GIÁO KHOA — đồng bộ với CMS
     ====================================================================== */
  var TB = { loaded: false, full: new Map() };

  function allLessons() {
    try { return Object.values(V21_LESSONS).flat(); } catch (e) { return []; }
  }
  function findLesson(id) { return allLessons().find(function (x) { return x.id === id; }); }

  function decorateList() {
    document.querySelectorAll('.v22-lesson[data-v22-id]').forEach(function (b) {
      var l = findLesson(b.dataset.v22Id);
      if (!l || !l.has_content) return;
      b.classList.add('vs-has-content');
      var small = b.querySelector('small');
      if (small) small.textContent = 'Đã có bài học' + (l.year == null ? '' : ' · Mốc ' + yearLabel(l.year));
    });
    // Ghi số bài đã biên tập lên tiêu đề từng chương
    document.querySelectorAll('details.v22-chapter').forEach(function (d) {
      var n = d.querySelectorAll('.v22-lesson.vs-has-content').length;
      var sum = d.querySelector('summary'); if (!sum) return;
      var old = sum.querySelector('.vs-badge'); if (old) old.remove();
      if (!n) return;
      var bd = document.createElement('span'); bd.className = 'vs-badge'; bd.textContent = n + ' bài đã biên tập';
      var t = sum.querySelector('.v22-chapter-title'); (t || sum).appendChild(bd);
    });
  }

  function hookRender() {
    if (typeof window.v22RenderCatalog !== 'function' || window.v22RenderCatalog.__v38) return;
    var prev = window.v22RenderCatalog;
    var wrapped = function () { var r = prev.apply(this, arguments); try { decorateList(); } catch (e) {} return r; };
    wrapped.__v38 = true;
    window.v22RenderCatalog = wrapped;
    try { v22RenderCatalog = wrapped; } catch (e) { /* đã gán qua window */ }
  }

  function hookOpen() {
    if (typeof window.v22OpenLesson !== 'function' || window.v22OpenLesson.__v38) return;
    var prev = window.v22OpenLesson;
    var wrapped = function (id) {
      var l = findLesson(id);
      if (ONLINE && l && l.has_content) { openRichLesson(id); return; }
      return prev.apply(this, arguments);
    };
    wrapped.__v38 = true;
    window.v22OpenLesson = wrapped;
    try { v22OpenLesson = wrapped; } catch (e) {}
  }

  function openModalShell(kind, title, desc, bodyHtml) {
    var ov = document.getElementById('overlay');
    if (!ov) return;
    document.getElementById('modtype').textContent = kind;
    document.getElementById('modtitle').textContent = title;
    document.getElementById('moddesc').textContent = desc || '';
    var tabs = document.getElementById('tabs'); if (tabs) tabs.innerHTML = '';
    document.getElementById('modalbody').innerHTML = bodyHtml;
    ov.classList.add('show');
    try { setModalView('full'); } catch (e) {}
    document.body.style.overflow = 'hidden';
    var body = document.getElementById('modalbody');
    if (body && body.parentElement) body.parentElement.scrollTop = 0;
  }

  async function fetchLesson(id) {
    if (TB.full.has(id)) return TB.full.get(id);
    var r = await fetch('/api/textbook/lessons/' + encodeURIComponent(id));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var d = await r.json();
    TB.full.set(id, d);
    return d;
  }

  async function openRichLesson(id) {
    var base = findLesson(id) || {};
    var kind = 'SÁCH GIÁO KHOA LỊCH SỬ · LỚP ' + (base.grade || '');
    openModalShell(kind, base.toc_title || base.title || 'Bài học', base.chapter || '',
      '<div class="panel"><p>Đang tải bài học…</p></div>');
    try { if (typeof v24WriteHash === 'function') v24WriteHash('bai-hoc', id); } catch (e) {}
    var l;
    try { l = await fetchLesson(id); } catch (e) {
      document.getElementById('modalbody').innerHTML = '<div class="panel"><p>Không tải được nội dung bài học. Vui lòng thử lại.</p></div>';
      return;
    }
    var chips = ['Lớp ' + l.grade, l.part, l.chapter].filter(Boolean)
      .map(function (c) { return '<span class="v22-topic-pill">' + esc(c) + '</span>'; }).join('');
    var html = '<div class="panel">' + chips + '<span class="v22-topic-pill">Đã biên tập</span>' +
      '<h3>' + esc(l.title) + '</h3>';
    var cover = safeUrl(l.cover_image);
    if (cover) {
      html += '<figure class="vs-lesson-cover"><img src="' + esc(cover) + '" alt="' + esc(l.cover_caption || l.title) +
        '" loading="lazy" decoding="async">' + (l.cover_caption ? '<figcaption>' + esc(l.cover_caption) + '</figcaption>' : '') + '</figure>';
    }
    html += '<p>' + esc(l.summary) + '</p></div>';
    if (l.key_points && l.key_points.length) {
      html += '<div class="panel"><h3>Ý chính cần nhớ</h3><ul>' +
        l.key_points.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }
    // content_html được máy chủ tạo từ Markdown và đã escape toàn bộ HTML người nhập (vs_render.markdown_safe)
    html += '<div class="panel vs-lesson-body">' + (l.content_html || '') + '</div>';
    if (l.review_questions && l.review_questions.length) {
      html += '<div class="panel"><h3>Câu hỏi tự ôn</h3><ol>' +
        l.review_questions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div>';
    }
    html += '<div class="panel"><h3>Học tiếp</h3><div class="vs-lesson-actions">';
    if (l.year != null) html += '<button class="secondary" type="button" id="vsLessonYear">Xem mốc ' + esc(yearLabel(l.year)) + ' trên timeline ↗</button>';
    if (l.entity_id && !/^lop-/.test(l.entity_id)) html += '<button class="secondary" type="button" id="vsLessonEntity">Mở hồ sơ liên quan ↗</button>';
    if (l.url) html += '<a class="secondary" href="' + esc(l.url) + '" target="_blank" rel="noopener">Mở trang bài học đầy đủ ↗</a>';
    html += '</div></div>';
    if (l.sources && l.sources.length) {
      html += '<div class="panel"><h3>Nguồn tư liệu</h3><ul>' + l.sources.map(function (s) {
        var u = safeUrl(s.url);
        return '<li>' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer nofollow">' + esc(s.title || u) + '</a>' : esc(s.title)) + '</li>';
      }).join('') + '</ul><p style="opacity:.75;font-size:13px">Bài tóm tắt do nhóm biên tập Việt Sử thực hiện, không thay thế sách giáo khoa chính thức.</p></div>';
    }
    document.getElementById('modalbody').innerHTML = html;
    var y = document.getElementById('vsLessonYear');
    if (y) y.onclick = function () { try { closeModal(); v21GoYear(l.year); } catch (e) {} };
    var en = document.getElementById('vsLessonEntity');
    if (en) en.onclick = function () { try { openItem(l.entity_id); } catch (e) {} };
  }

  async function loadTextbook() {
    if (!ONLINE || typeof V21_LESSONS !== 'object') return;
    var r;
    try { r = await fetch('/api/textbook/catalog'); } catch (e) { return; }
    if (!r.ok) return;
    var d = await r.json();
    if (!d || !d.grades) return;
    Object.keys(d.grades).forEach(function (g) { if (Array.isArray(d.grades[g])) V21_LESSONS[g] = d.grades[g]; });
    try { if (typeof V22_CHAPTERS === 'object' && d.chapters) Object.keys(d.chapters).forEach(function (g) { V22_CHAPTERS[g] = d.chapters[g]; }); } catch (e) {}
    TB.loaded = true;
    var school = document.getElementById('schoolHistory');
    if (school && !school.hidden) { try { v22RenderCatalog(); } catch (e) {} }
    // Mở lại bài từ liên kết chia sẻ #bai-hoc=… nếu bài đã có nội dung
    var m = decodeURIComponent(location.hash || '').match(/bai-hoc=(g\d{1,2}-[a-z0-9-]+)/);
    if (m) { var l = findLesson(m[1]); if (l && l.has_content) openRichLesson(m[1]); }
  }

  /* ======================================================================
     2. QUẢNG CÁO (AdSense) — cấu hình do máy chủ chèn vào window.VS_ADS
     ====================================================================== */
  var ADS = window.VS_ADS || { enabled: false };
  var POSITIONS = {
    home_top:          { host: '#mainHistory > header.hero', mode: 'after' },
    timeline_mid:      { host: '#timeline', mode: 'mid', every: 12 },
    timeline_bottom:   { host: '#timeline', mode: 'after' },
    hcm_bottom:        { host: '#hcmHistory', mode: 'append' },
    school_top:        { host: '#schoolHistory .v22-school-tools', mode: 'after' },
    school_bottom:     { host: '#v22Toc', mode: 'after' },
    characters_bottom: { host: '#v25CharacterGrid', mode: 'after' }
  };

  function makeSlot(pos) {
    var div = document.createElement('div');
    div.className = 'vs-ad';
    div.dataset.pos = pos;
    if (ADS.previewOnly || (ADS.preview && !(ADS.slots || {})[pos])) {
      div.classList.add('is-preview');
      div.innerHTML = '<div class="vs-ad-label">Quảng cáo</div><div>Vị trí: ' + esc(pos) + '</div>';
      return div;
    }
    var slot = (ADS.slots || {})[pos];
    if (!slot || !ADS.client) return null;
    div.innerHTML = '<div class="vs-ad-label">Quảng cáo</div>';
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADS.client);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    if (ADS.test) ins.setAttribute('data-adtest', 'on');
    div.appendChild(ins);
    return div;
  }

  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      io.unobserve(el);
      var ins = el.querySelector('ins.adsbygoogle');
      if (!ins || ins.dataset.vsPushed) return;
      if (el.getBoundingClientRect().width < 120) return;
      ins.dataset.vsPushed = '1';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }, { rootMargin: '300px 0px' }) : null;

  function place(pos) {
    var cfg = POSITIONS[pos];
    var host = $(cfg.host);
    if (!host) return;
    if (cfg.mode === 'mid') {
      if (host.querySelector('.vs-ad[data-pos="' + pos + '"]')) return;
      var rows = host.querySelectorAll(':scope > .era-section');
      if (rows.length < cfg.every + 4) return;
      var slot = makeSlot(pos); if (!slot) return;
      rows[cfg.every - 1].after(slot);
      if (io) io.observe(slot);
      return;
    }
    var parent = cfg.mode === 'append' ? host : host.parentElement;
    if (!parent || parent.querySelector(':scope > .vs-ad[data-pos="' + pos + '"]')) return;
    var s = makeSlot(pos); if (!s) return;
    if (cfg.mode === 'append') host.appendChild(s); else host.after(s);
    if (io) io.observe(s);
  }

  function placeAll() { Object.keys(POSITIONS).forEach(function (p) { try { place(p); } catch (e) {} }); }

  function initAds() {
    if (!ONLINE || !ADS.enabled) return;
    placeAll();
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () { t = null; placeAll(); }, 400);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ======================================================================
     Khởi động
     ====================================================================== */
  function init() {
    hookRender();
    hookOpen();
    loadTextbook();
    initAds();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

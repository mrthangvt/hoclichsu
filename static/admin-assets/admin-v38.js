/* HỌC LỊCH SỬ CMS V3.8 — Biên tập Sách giáo khoa + cấu hình AdSense */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tok() { return ($('token').value || '').trim(); }
  async function call(url, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ 'Content-Type': 'application/json', 'X-Admin-Token': tok() }, opts.headers || {});
    var r = await fetch(url, opts);
    var text = await r.text(), data;
    try { data = JSON.parse(text); } catch (e) { data = { detail: text }; }
    if (!r.ok) {
      var d = data && data.detail;
      if (Array.isArray(d)) d = d.map(function (x) { return (x.loc ? x.loc.slice(-1)[0] + ': ' : '') + x.msg; }).join('; ');
      throw new Error(typeof d === 'string' ? d : JSON.stringify(d));
    }
    return data;
  }
  function setStatus(id, msg, kind) { var el = $(id); el.textContent = msg; el.dataset.kind = kind || ''; }
  function lines(v) { return String(v || '').split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean); }

  /* ---------- Ghi nhớ mã trong phiên (sessionStorage, tự xoá khi đóng tab) ---------- */
  (function rememberToken() {
    var box = $('rememberToken'), input = $('token');
    if (!box || !input) return;
    try { var saved = sessionStorage.getItem('vs_admin_token'); if (saved) { input.value = saved; box.checked = true; } } catch (e) {}
    function sync() { try { if (box.checked && input.value) sessionStorage.setItem('vs_admin_token', input.value.trim()); else sessionStorage.removeItem('vs_admin_token'); } catch (e) {} }
    box.addEventListener('change', sync); input.addEventListener('change', sync);
  })();

  /* ======================= MARKDOWN XEM TRƯỚC ======================= */
  function inl(t) {
    t = t.replace(/!\[([^\]\n]{0,300})\]\(((?:https:\/\/|\/(?!\/))[^)\s"'<>]{1,1000})\)/g, '<img src="$2" alt="$1">');
    t = t.replace(/\[([^\]\n]{1,300})\]\(((?:https:\/\/|\/(?!\/))[^)\s"'<>]{1,1000})\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    t = t.replace(/\*\*(?=\S)(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[^\*\w])\*(?=\S)([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    return t;
  }
  function md(raw) {
    var out = [], para = [], list = [], lt = '', quote = [];
    function fp() { if (para.length) { out.push('<p>' + inl(esc(para.join(' '))) + '</p>'); para = []; } }
    function fl() { if (list.length) { out.push('<' + lt + '>' + list.map(function (x) { return '<li>' + inl(esc(x)) + '</li>'; }).join('') + '</' + lt + '>'); list = []; lt = ''; } }
    function fq() { if (quote.length) { out.push('<blockquote>' + quote.map(function (x) { return inl(esc(x)); }).join('<br>') + '</blockquote>'); quote = []; } }
    String(raw || '').replace(/\r\n/g, '\n').split('\n').forEach(function (line) {
      var s = line.trim(), m;
      if (!s) { fp(); fl(); fq(); return; }
      if ((m = s.match(/^(#{1,4})\s+(.+)$/))) { fp(); fl(); fq(); var lv = Math.min(m[1].length + 1, 5); out.push('<h' + lv + '>' + inl(esc(m[2])) + '</h' + lv + '>'); return; }
      if (/^(-{3,}|\*{3,})$/.test(s)) { fp(); fl(); fq(); out.push('<hr>'); return; }
      if ((m = s.match(/^[-*•]\s+(.+)$/))) { fp(); fq(); if (lt && lt !== 'ul') fl(); lt = 'ul'; list.push(m[1]); return; }
      if ((m = s.match(/^\d{1,3}[.)]\s+(.+)$/))) { fp(); fq(); if (lt && lt !== 'ol') fl(); lt = 'ol'; list.push(m[1]); return; }
      if (s.charAt(0) === '>') { fp(); fl(); quote.push(s.replace(/^>\s?/, '')); return; }
      fl(); fq(); para.push(s);
    });
    fp(); fl(); fq();
    return out.join('\n');
  }

  /* ======================= SÁCH GIÁO KHOA ======================= */
  var S = { rows: [], current: null, dirty: false, loadedGrade: null };
  var F = ['grade', 'lesson_number', 'sort_order', 'year', 'entity_id', 'author', 'part', 'chapter', 'title', 'toc_title', 'slug',
    'summary', 'cover_image', 'cover_caption', 'content', 'key_points', 'review_questions', 'sources', 'seo_title', 'meta_description'];

  function stateOf(r) {
    var m = r._meta || {};
    if (m.live_state === 'hidden') return 'hidden';
    if (m.dirty) return 'dirty';
    return m.live_state === 'published' ? 'published' : 'outline';
  }
  var BADGE = { published: ['Đã xuất bản', 'ok'], dirty: ['Có thay đổi chưa xuất bản', 'warn'], outline: ['Đề cương', 'muted'], hidden: ['Chưa hiển thị', 'warn'] };
  function badges(r) {
    var m = r._meta || {}, out = [];
    if (m.live_state === 'published') out.push(BADGE.published);
    else if (m.live_state === 'hidden') out.push(BADGE.hidden);
    else out.push(BADGE.outline);
    if (m.dirty && m.live_state !== 'hidden') out.push(BADGE.dirty);
    return out.map(function (b) { return '<span class="pill ' + b[1] + '">' + b[0] + '</span>'; }).join(' ');
  }

  async function loadList() {
    if (!tok()) { setStatus('sgkCount', 'Nhập mã quản trị ở phía trên trước.', 'err'); return; }
    var g = $('sgkGrade').value;
    try {
      S.rows = await call('/api/admin/textbook/lessons?grade=' + g);
      S.loadedGrade = g;
      renderList();
      var parts = {}, chapters = {};
      S.rows.forEach(function (r) { if (r.part) parts[r.part] = 1; if (r.chapter) chapters[r.chapter] = 1; });
      $('sgkParts').innerHTML = Object.keys(parts).map(function (p) { return '<option value="' + esc(p) + '">'; }).join('');
      $('sgkChapters').innerHTML = Object.keys(chapters).map(function (p) { return '<option value="' + esc(p) + '">'; }).join('');
    } catch (e) { setStatus('sgkCount', 'Lỗi: ' + e.message, 'err'); }
  }

  function renderList() {
    var q = ($('sgkSearch').value || '').trim().toLowerCase(), st = $('sgkState').value;
    var rows = S.rows.filter(function (r) {
      if (st && stateOf(r) !== st && !(st === 'dirty' && r._meta.dirty)) return false;
      return !q || ((r.toc_title || '') + ' ' + r.title + ' ' + (r.chapter || '')).toLowerCase().indexOf(q) >= 0;
    });
    var pub = S.rows.filter(function (r) { return r._meta.live_state === 'published'; }).length;
    $('sgkCount').textContent = rows.length + ' / ' + S.rows.length + ' bài · ' + pub + ' bài đã có nội dung';
    var lastCh = null, html = '';
    rows.forEach(function (r) {
      var ch = r.chapter || r.part || 'Khái quát';
      if (ch !== lastCh) { html += '<div class="sgk-ch">' + esc(ch) + '</div>'; lastCh = ch; }
      html += '<button type="button" role="listitem" class="sgk-item' + (S.current && S.current.id === r.id ? ' active' : '') + '" data-id="' + esc(r.id) + '">' +
        '<b>' + esc(r.toc_title || r.title) + '</b><span>' + badges(r) + '</span></button>';
    });
    $('sgkList').innerHTML = html || '<p class="note">Không có bài phù hợp.</p>';
  }

  function confirmLeave() {
    if (!S.dirty) return true;
    return window.confirm ? window.confirm('Bài đang sửa chưa lưu. Bỏ các thay đổi?') : true;
  }

  function fillForm(d) {
    S.current = d; S.dirty = false;
    $('sgkEmpty').classList.add('hidden'); $('sgkForm').classList.remove('hidden');
    $('sgkIdLabel').textContent = d.id ? ('Mã bài: ' + d.id + (d._meta && d._meta.origin === 'cms' ? ' · tạo trong CMS' : ' · mục lục gốc')) : 'Bài mới';
    $('sgkHeading').textContent = d.toc_title || d.title || 'Bài mới';
    $('sgkBadges').innerHTML = d.id ? badges(d) : '';
    F.forEach(function (k) {
      var el = $('sgkF_' + k); if (!el) return;
      var v = k === 'sort_order' ? (d._meta ? d._meta.sort_order : '') : d[k];
      if (k === 'key_points' || k === 'review_questions') v = (v || []).join('\n');
      else if (k === 'sources') v = (v || []).map(function (s) { return s.url ? (s.title && s.title !== s.url ? s.title + ' | ' + s.url : s.url) : s.title; }).join('\n');
      el.value = v == null ? '' : v;
    });
    $('sgkF_grade').disabled = !!d.id;
    var live = d._meta && d._meta.live_state === 'published' && d._meta.public_url;
    $('sgkViewLive').classList.toggle('hidden', !live);
    if (live) $('sgkViewLive').href = d._meta.public_url;
    $('sgkDelete').classList.toggle('hidden', !(d._meta && d._meta.origin === 'cms'));
    $('sgkUnpublish').classList.toggle('hidden', !(d._meta && d._meta.live_state === 'published'));
    $('sgkPublish').classList.toggle('hidden', !d.id);
    $('sgkHistoryBtn').classList.toggle('hidden', !d.id);
    $('sgkHistory').classList.add('hidden');
    updateCover(); updateCounts(); if (!$('sgkPreview').classList.contains('hidden')) $('sgkPreview').innerHTML = md($('sgkF_content').value);
    setStatus('sgkStatus', '');
    renderList();
  }

  async function openLesson(id) {
    if (S.current && S.current.id === id) return;
    if (!confirmLeave()) return;
    try { fillForm(await call('/api/admin/textbook/lessons/' + encodeURIComponent(id))); window.scrollTo({ top: $('sgk').offsetTop, behavior: 'smooth' }); }
    catch (e) { setStatus('sgkStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  function payload() {
    var p = {}; var num = function (id) { var v = $(id).value.trim(); return v === '' ? null : Number(v); };
    p.grade = Number($('sgkF_grade').value);
    p.lesson_number = num('sgkF_lesson_number'); p.sort_order = num('sgkF_sort_order'); p.year = num('sgkF_year');
    ['entity_id', 'author', 'part', 'chapter', 'title', 'toc_title', 'slug', 'summary', 'cover_image', 'cover_caption', 'content', 'seo_title', 'meta_description']
      .forEach(function (k) { p[k] = $('sgkF_' + k).value.trim(); });
    p.key_points = lines($('sgkF_key_points').value);
    p.review_questions = lines($('sgkF_review_questions').value);
    p.sources = lines($('sgkF_sources').value).map(function (l) {
      var i = l.lastIndexOf('|'); var title = i >= 0 ? l.slice(0, i).trim() : l, url = i >= 0 ? l.slice(i + 1).trim() : '';
      if (!url && /^https:\/\//.test(title)) { url = title; }
      return { title: title, url: url };
    });
    return p;
  }

  async function save(ev) {
    if (ev) ev.preventDefault();
    var p = payload();
    if (p.title.length < 3) { setStatus('sgkStatus', 'Tên bài cần ít nhất 3 ký tự.', 'err'); return; }
    var bad = p.sources.filter(function (s) { return s.url && !/^https:\/\/[^\s]+\.[^\s]+/.test(s.url); });
    if (bad.length) { setStatus('sgkStatus', 'Đường dẫn nguồn phải bắt đầu bằng https:// — kiểm tra: ' + bad[0].url, 'err'); return; }
    $('sgkSave').disabled = true;
    try {
      var isNew = !S.current || !S.current.id;
      var d = await call(isNew ? '/api/admin/textbook/lessons' : '/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id),
        { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(p) });
      fillForm(d);
      setStatus('sgkStatus', 'Đã lưu nháp lúc ' + new Date().toLocaleTimeString('vi-VN') + '. Bấm “Xuất bản” để cập nhật lên website.', 'ok');
      if (String(d.grade) !== $('sgkGrade').value) $('sgkGrade').value = String(d.grade);
      await loadList();
    } catch (e) { setStatus('sgkStatus', 'Chưa lưu được: ' + e.message, 'err'); }
    finally { $('sgkSave').disabled = false; }
  }

  async function publish() {
    if (!S.current || !S.current.id) return;
    if (S.dirty) { await save(); if (S.dirty) return; }
    try {
      var r = await call('/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id) + '/publish', { method: 'POST' });
      setStatus('sgkStatus', r.live_state === 'published' ? 'Đã xuất bản. Trang công khai: ' + r.url : 'Đã cập nhật đề cương (chưa đủ nội dung ≥ 150 ký tự để thành bài học đầy đủ).', 'ok');
      var id = S.current.id; S.current = null; await openLesson(id); await loadList();
      if (r.live_state === 'published') setStatus('sgkStatus', 'Đã xuất bản. Trang công khai: ' + r.url, 'ok');
    } catch (e) { setStatus('sgkStatus', 'Không xuất bản được: ' + e.message, 'err'); }
  }

  async function unpublish() {
    if (!S.current || !S.current.id) return;
    try {
      await call('/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id) + '/unpublish', { method: 'POST' });
      var id = S.current.id; S.current = null; await openLesson(id); await loadList();
      setStatus('sgkStatus', 'Đã gỡ nội dung khỏi website. Bản nháp vẫn được giữ.', 'ok');
    } catch (e) { setStatus('sgkStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  var delArm = 0;
  async function del() {
    if (!S.current || !S.current.id) return;
    if (Date.now() - delArm > 4000) { delArm = Date.now(); setStatus('sgkStatus', 'Bấm “Xóa bài” lần nữa trong 4 giây để xác nhận xóa vĩnh viễn.', 'err'); return; }
    try {
      await call('/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id), { method: 'DELETE' });
      S.current = null; S.dirty = false; $('sgkForm').classList.add('hidden'); $('sgkEmpty').classList.remove('hidden');
      await loadList(); setStatus('sgkCount', 'Đã xóa bài.', 'ok');
    } catch (e) { setStatus('sgkStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  async function history() {
    var box = $('sgkHistory');
    if (!box.classList.contains('hidden')) { box.classList.add('hidden'); return; }
    try {
      var rows = await call('/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id) + '/versions');
      var NAMES = { save: 'Lưu nháp', publish: 'Bản công khai trước khi xuất bản', unpublish: 'Trước khi gỡ', create: 'Tạo bài', 'import': 'Trước khi nhập' };
      box.innerHTML = rows.length ? rows.map(function (r) {
        return '<div class="article"><div><b>' + esc(NAMES[r.action] || r.action) + ' · ' + esc(new Date(r.changed_at).toLocaleString('vi-VN')) + '</b>' +
          '<small>' + esc(r.title) + ' · ' + r.chars + ' ký tự · ' + esc(r.changed_by || '') + '</small></div>' +
          '<button type="button" class="btn secondary" data-restore="' + r.id + '">Khôi phục vào nháp</button></div>';
      }).join('') : '<p class="note">Chưa có phiên bản cũ.</p>';
      box.classList.remove('hidden');
    } catch (e) { setStatus('sgkStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  async function restore(vid) {
    try {
      var d = await call('/api/admin/textbook/lessons/' + encodeURIComponent(S.current.id) + '/restore/' + vid, { method: 'POST' });
      fillForm(d); await loadList(); setStatus('sgkStatus', 'Đã khôi phục vào bản nháp. Kiểm tra rồi bấm Xuất bản nếu muốn.', 'ok');
    } catch (e) { setStatus('sgkStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  function newLesson() {
    if (!confirmLeave()) return;
    var g = Number($('sgkGrade').value);
    var max = S.rows.reduce(function (m, r) { return Math.max(m, (r._meta && r._meta.sort_order) || 0); }, 0);
    fillForm({ grade: g, title: '', status: '', _meta: { sort_order: max + 10 } });
    $('sgkF_grade').value = String(g); $('sgkF_grade').disabled = false;
    $('sgkF_title').focus();
  }

  function pickImage() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp';
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; if (!f) return resolve(null);
        if (f.size > 3500000) { alertMsg('Ảnh tối đa 3,5 MB — hãy nén ảnh trước.'); return resolve(null); }
        var rd = new FileReader(); rd.onload = function () { resolve(rd.result); }; rd.readAsDataURL(f);
      };
      inp.click();
    });
  }
  function alertMsg(m) { setStatus('sgkStatus', m, 'err'); }
  async function uploadImage() {
    var data = await pickImage(); if (!data) return null;
    setStatus('sgkStatus', 'Đang tải ảnh lên…');
    try { var r = await call('/api/admin/textbook/upload-image', { method: 'POST', body: JSON.stringify({ image_data: data }) }); setStatus('sgkStatus', 'Đã tải ảnh: ' + r.url, 'ok'); return r.url; }
    catch (e) { setStatus('sgkStatus', 'Lỗi tải ảnh: ' + e.message, 'err'); return null; }
  }

  function updateCover() {
    var u = $('sgkF_cover_image').value.trim(), img = $('sgkCoverPreview');
    if (/^(https:\/\/|\/(?!\/))[^\s"'<>]+$/.test(u)) { img.src = u; img.hidden = false; } else { img.hidden = true; img.removeAttribute('src'); }
  }
  function updateCounts() {
    document.querySelectorAll('#sgk .count').forEach(function (c) {
      var el = $(c.dataset.for); var n = el ? el.value.length : 0, max = +c.dataset.max;
      c.textContent = '(' + n.toLocaleString('vi-VN') + (max < 1000 ? '/' + max : '') + ' ký tự)';
      c.classList.toggle('over', max < 1000 && n > max);
    });
  }

  function wrapSel(before, after, placeholder) {
    var ta = $('sgkF_content'), s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
    var sel = v.slice(s, e) || placeholder || '';
    ta.setRangeText(before + sel + (after || ''), s, e, 'end');
    ta.focus(); ta.dispatchEvent(new Event('input'));
  }
  function prefixLines(prefix, numbered) {
    var ta = $('sgkF_content'), v = ta.value, s = v.lastIndexOf('\n', ta.selectionStart - 1) + 1, e = ta.selectionEnd;
    var block = v.slice(s, e) || 'Nội dung';
    var n = 0; var res = block.split('\n').map(function (l) { n++; return (numbered ? n + '. ' : prefix) + l.replace(/^(#{1,4}\s+|[-*•]\s+|\d+[.)]\s+|>\s?)/, ''); }).join('\n');
    ta.setRangeText(res, s, e, 'end'); ta.focus(); ta.dispatchEvent(new Event('input'));
  }
  async function toolbar(ev) {
    var b = ev.target.closest('button[data-md]'); if (!b) return;
    var k = b.dataset.md;
    if (k === 'h2') prefixLines('## '); else if (k === 'h3') prefixLines('### ');
    else if (k === 'b') wrapSel('**', '**', 'chữ đậm'); else if (k === 'i') wrapSel('*', '*', 'chữ nghiêng');
    else if (k === 'ul') prefixLines('- '); else if (k === 'ol') prefixLines('', true); else if (k === 'quote') prefixLines('> ');
    else if (k === 'hr') wrapSel('\n\n---\n\n', '', '');
    else if (k === 'link') wrapSel('[', '](https://)', 'chữ liên kết');
    else if (k === 'img') { var u = await uploadImage(); if (u) wrapSel('\n\n![', '](' + u + ')\n\n', 'Mô tả ảnh'); }
  }

  async function exportJson() {
    try {
      var r = await fetch('/api/admin/textbook/export', { headers: { 'X-Admin-Token': tok() } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var blob = await r.blob(); var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'sach-giao-khoa-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    } catch (e) { setStatus('sgkImportStatus', 'Lỗi: ' + e.message, 'err'); }
  }
  async function importJson() {
    var f = $('sgkImportFile').files[0]; if (!f) { setStatus('sgkImportStatus', 'Chọn file JSON trước.', 'err'); return; }
    try {
      var obj = JSON.parse(await f.text()); var lessons = Array.isArray(obj) ? obj : obj.lessons;
      if (!Array.isArray(lessons)) throw new Error('File cần có mảng "lessons"');
      var r = await call('/api/admin/textbook/import', { method: 'POST', body: JSON.stringify({ lessons: lessons, overwrite: $('sgkImportOverwrite').checked }) });
      setStatus('sgkImportStatus', 'Tạo mới ' + r.created.length + ', cập nhật ' + r.updated.length + ', bỏ qua ' + r.skipped.length +
        (r.skipped.length ? ' — ' + r.skipped.slice(0, 5).map(function (s) { return 'dòng ' + s.line + ': ' + s.reason; }).join('; ') : ''), 'ok');
      loadList();
    } catch (e) { setStatus('sgkImportStatus', 'Lỗi: ' + e.message, 'err'); }
  }

  function bindSgk() {
    $('sgkGrade').addEventListener('change', function () { if (confirmLeave()) { S.current = null; S.dirty = false; $('sgkForm').classList.add('hidden'); $('sgkEmpty').classList.remove('hidden'); loadList(); } });
    $('sgkState').addEventListener('change', renderList);
    $('sgkSearch').addEventListener('input', renderList);
    $('sgkReload').addEventListener('click', loadList);
    $('sgkNew').addEventListener('click', newLesson);
    $('sgkList').addEventListener('click', function (e) { var b = e.target.closest('.sgk-item'); if (b) openLesson(b.dataset.id); });
    $('sgkForm').addEventListener('submit', save);
    $('sgkForm').addEventListener('input', function (e) {
      S.dirty = true; updateCounts();
      if (e.target.id === 'sgkF_cover_image') updateCover();
      if (e.target.id === 'sgkF_content' && !$('sgkPreview').classList.contains('hidden')) $('sgkPreview').innerHTML = md(e.target.value);
    });
    $('sgkPublish').addEventListener('click', publish);
    $('sgkUnpublish').addEventListener('click', unpublish);
    $('sgkDelete').addEventListener('click', del);
    $('sgkHistoryBtn').addEventListener('click', history);
    $('sgkHistory').addEventListener('click', function (e) { var b = e.target.closest('[data-restore]'); if (b) restore(b.dataset.restore); });
    $('sgkCoverUpload').addEventListener('click', async function () { var u = await uploadImage(); if (u) { $('sgkF_cover_image').value = u; S.dirty = true; updateCover(); } });
    $('sgkCoverClear').addEventListener('click', function () { $('sgkF_cover_image').value = ''; $('sgkF_cover_caption').value = ''; S.dirty = true; updateCover(); });
    document.querySelector('#sgk .md-toolbar').addEventListener('click', toolbar);
    $('sgkPreviewToggle').addEventListener('click', function () {
      var p = $('sgkPreview'), on = p.classList.toggle('hidden') === false;
      this.setAttribute('aria-pressed', on ? 'true' : 'false'); this.textContent = on ? 'Ẩn xem trước' : 'Xem trước';
      if (on) p.innerHTML = md($('sgkF_content').value);
    });
    $('sgkExport').addEventListener('click', exportJson);
    $('sgkImport').addEventListener('click', importJson);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !$('sgk').classList.contains('hidden') && !$('sgkForm').classList.contains('hidden')) { e.preventDefault(); save(); }
    });
    window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  }

  /* ======================= QUẢNG CÁO ======================= */
  async function loadAds() {
    if (!tok()) { setStatus('adsStatus', 'Nhập mã quản trị ở phía trên trước.', 'err'); return; }
    try {
      var a = await call('/api/admin/ads');
      $('adsClient').value = a.client || ''; $('adsEnabled').checked = !!a.enabled; $('adsTest').checked = !!a.test_mode;
      $('adsPreview').checked = !!a.preview; $('adsAuto').checked = !!a.auto_ads; $('adsTxtExtra').value = a.ads_txt_extra || '';
      $('adsSlots').innerHTML = Object.keys(a.positions).map(function (k) {
        return '<label class="ads-row"><span>' + esc(a.positions[k]) + '<small>' + esc(k) + '</small></span><input data-slot="' + esc(k) + '" value="' + esc(a.slots[k] || '') + '" placeholder="vd: 1234567890" inputmode="numeric" maxlength="20"></label>';
      }).join('');
      setStatus('adsStatus', a.site_public ? '' : 'Lưu ý: SITE_URL đang là localhost — Google chỉ duyệt khi chạy trên tên miền thật.', a.site_public ? '' : 'err');
    } catch (e) { setStatus('adsStatus', 'Lỗi: ' + e.message, 'err'); }
  }
  async function saveAds() {
    var slots = {}; document.querySelectorAll('#adsSlots [data-slot]').forEach(function (i) { slots[i.dataset.slot] = i.value.trim(); });
    try {
      await call('/api/admin/ads', { method: 'PUT', body: JSON.stringify({ enabled: $('adsEnabled').checked, client: $('adsClient').value.trim(), test_mode: $('adsTest').checked,
        preview: $('adsPreview').checked, auto_ads: $('adsAuto').checked, slots: slots, ads_txt_extra: $('adsTxtExtra').value }) });
      setStatus('adsStatus', 'Đã lưu. Tải lại trang chủ để thấy thay đổi.', 'ok');
    } catch (e) { setStatus('adsStatus', 'Chưa lưu được: ' + e.message, 'err'); }
  }

  /* ======================= Điều hướng ======================= */
  window.vsAdminOpen = function (tab) {
    if (tab === 'sgk' && S.loadedGrade === null) loadList();
    if (tab === 'ads') loadAds();
  };
  document.addEventListener('DOMContentLoaded', function () {
    bindSgk();
    $('adsSave').addEventListener('click', saveAds);
    $('adsLoad').addEventListener('click', loadAds);
  });
})();

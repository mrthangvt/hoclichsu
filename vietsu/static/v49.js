/* V4.9: khôi phục ảnh từ bản V4.5 được chủ dự án gửi và dùng bản đồ véc-tơ. */
(function () {
  'use strict';
  const data = window.V49_REFERENCE;
  if (!data) return;
  const $ = id => document.getElementById(id);
  function vectorMap() {
    const mode = $('v24MapMode'), map = $('v23AtlasSVG'), tiles = $('v24LeafletMap');
    if (mode) { mode.value = 'offline'; mode.hidden = true; mode.setAttribute('aria-hidden', 'true'); }
    if (map) map.hidden = false;
    if (tiles) tiles.hidden = true;
    const note = document.querySelector('.v23-map-foot');
    if (note) note.textContent = 'Bản đồ véc-tơ minh họa. Vị trí các điểm cần đối chiếu với tư liệu bản đồ.';
  }
  // Chặn cả lần gọi muộn từ điều hướng/hash, không chỉ đổi giá trị ô chọn.
  window.v24SetMapMode = vectorMap;
  function image(img, src, alt) {
    if (!img || !src) return;
    // Ảnh riêng đã duyệt qua CMS tiếp tục được ưu tiên.
    if (/^\/static\/uploads\/avatars\//.test(img.getAttribute('src') || '')) return;
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    if (img.alt !== alt) img.alt = alt;
    if (img.style.display === 'none') img.style.removeProperty('display');
  }
  function portrait(id) {
    const custom = window.V45_IMAGE_OVERRIDES?.[id];
    if (custom?.approved && typeof custom.url === 'string' && /^(https:\/\/|\/|data:image\/)/.test(custom.url))
      return {src: custom.url, type: 'specific'};
    return data.portraits[id];
  }
  function refresh() {
    vectorMap();
    const menu = $('navHCM')?.querySelector('.nav-icon');
    if (menu) {
      menu.classList.remove('v30-hcm-mask');
      menu.style.removeProperty('--v30-hcm-mask');
      let img = menu.querySelector('img');
      if (!img) { img = document.createElement('img'); menu.replaceChildren(img); }
      image(img, data.menu, '');
      img.width = 28; img.height = 28; img.style.objectFit = 'contain';
    }
    document.querySelectorAll('#v25CharacterGrid .v25-char-card').forEach(card => {
      const id = (card.getAttribute('onclick') || '').match(/openItem\('([^']+)'\)/)?.[1];
      const p = portrait(id), holder = card.querySelector('.v25-char-avatar');
      if (!p || !holder) return;
      let img = holder.querySelector('img');
      if (!img) { img = document.createElement('img'); holder.prepend(img); }
      image(img, p.src, (p.type === 'template' ? 'Minh họa theo vai trò: ' : 'Ảnh nhân vật: ') + (card.querySelector('b')?.textContent || id));
      const initial = holder.querySelector('.v45-initial'); if (initial) initial.hidden = true;
      holder.title = p.note || 'Ảnh kế thừa bản V4.5';
    });
    if (typeof modalType === 'function' && modalType() === 'person' && typeof active === 'string') {
      const p = portrait(active);
      if (p) document.querySelectorAll('#modalbody .v36-profile-preview, #modalbody .avatar > img, #modalbody .v45-profile-image')
        .forEach(img => image(img, p.src, p.type === 'template' ? 'Hình đại diện minh họa theo vai trò' : 'Ảnh nhân vật kế thừa V4.5'));
    }
    document.querySelectorAll('#v23SpaceCards .v23-space-card').forEach(card => {
      const id = (card.getAttribute('onclick') || '').match(/scene:([^']+)/)?.[1], p = data.scenes[id];
      if (!p) return;
      let img = card.querySelector('.v42-thumb');
      if (!img) { img = document.createElement('img'); img.className = 'v42-thumb'; card.prepend(img); }
      image(img, p.src, p.alt); img.width = 380; img.height = 250;
    });
    document.documentElement.dataset.vietsuVersion = '4.9';
  }
  function init() {
    for (const name of ['v25RenderCharacters', 'renderModal', 'v23RenderMap', 'buildHCM']) {
      const previous = window[name];
      if (typeof previous === 'function') window[name] = function () {
        const result = previous.apply(this, arguments); refresh(); return result;
      };
    }
    // Theo dõi ảnh do các lớp cũ/API hoàn tất tải sau khi trang đã dựng.
    let pending = false;
    const observer = new MutationObserver(() => {
      if (pending) return;
      pending = true; queueMicrotask(() => { refresh(); pending = false; });
    });
    for (const id of ['v25CharacterGrid', 'modalbody']) {
      const node = $(id); if (node) observer.observe(node, {subtree:true, childList:true, attributes:true, attributeFilter:['src']});
    }
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();

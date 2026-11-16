/* VIỆT SỬ V4.6 — trải nghiệm 3D trong Popup; avatar HCM và ảnh mặc định Trung Quốc. */
(function () {
  'use strict';

  // Chỉ công bố lối vào sa bàn khi có trang 3D thực sự trong repository.
  const SCENES = Object.freeze({
    'quang-tri': { title: 'Thành cổ Quảng Trị 1972',
                   href: 'khong-gian/thanh-co-quang-tri/',
                   subtitle: 'Sa bàn tương tác Three.js · tái dựng mô phỏng, chưa phải tư liệu hiện trường' }
  });
  const CHINA = new Set(['hotatliet','bao','qinthuyhoang','sohan','tamquoc','thoduong','genghis','hongwu','thanhdrama']);
  const neutralSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Chưa có chân dung xác thực"><rect width="256" height="256" rx="34" fill="#283a40"/><circle cx="128" cy="91" r="41" fill="#abafa4"/><path d="M40 228c6-56 37-82 88-82s82 26 88 82" fill="#838f87"/><path d="M33 230h190" stroke="#d2b078" stroke-width="5"/></svg>';
  const NEUTRAL = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(neutralSvg);
  const REGISTRY = Object.create(null);
  const $ = id => document.getElementById(id);

  function hcmChapter7() {
    // Dùng hình đang hiển thị tại chương 7, không tự tạo ảnh mới và không chọn ảnh theo tuổi suy đoán.
    return document.querySelector('#hcmHistory .hcm-board .hcm-chapter:nth-of-type(7) .v29-stage-avatar img')?.getAttribute('src')
      || document.querySelectorAll('#hcmHistory .hcm-board .hcm-chapter .v29-stage-avatar img')[6]?.getAttribute('src')
      || document.querySelectorAll('#hcmHistory .hcm-mobile .hcm-mobile-chapter .v29-stage-avatar img')[6]?.getAttribute('src')
      || null;
  }

  function chosen(id) {
    const custom = REGISTRY[id];
    if (custom?.approved === true && typeof custom.url === 'string'
        && /^\/static\/uploads\/avatars\/[a-z0-9_-]+\.(?:png|jpg|webp)$/i.test(custom.url)) {
      return { src: custom.url, text: 'Ảnh đã được duyệt cho nhân vật' };
    }
    if (id === 'hochiminh') {
      const src = hcmChapter7();
      return src ? {src, text: 'Ảnh đại diện lấy từ chương 7 – Hồ Chí Minh'} : null;
    }
    if (CHINA.has(id)) return {src: NEUTRAL, text: 'Chưa có ảnh đúng trang phục; hình mặc định trung tính'};
    return null;
  }

  function putImage(holder, src, alt, forPopup) {
    if (!holder || !src) return;
    let img = holder.matches?.('img') ? holder : holder.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      const initial = holder.querySelector('.v45-initial');
      if (initial) initial.hidden = true;
      holder.prepend(img);
    }
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (forPopup) img.classList.add('v45-profile-image');
    img.onerror = () => { img.onerror = null; img.style.display = 'none'; };
  }

  function decorateCharacters() {
    const list = $('v25CharacterGrid');
    if (!list) return;
    list.querySelectorAll('.v25-char-card').forEach(card => {
      const onclick = card.getAttribute('onclick') || '';
      const m = onclick.match(/openItem\('([a-z0-9_-]+)'\)/i);
      if (!m) return;
      const id = m[1], pic = chosen(id);
      if (!pic) return;
      const holder = card.querySelector('.v45-avatar, .v25-char-avatar');
      if (!holder) return;
      putImage(holder, pic.src, pic.text + ': ' + (card.querySelector('.v25-char-info b')?.textContent || id), false);
      holder.classList.add('v46-portrait');
      holder.title = pic.text;
    });
  }

  function decoratePersonPopup() {
    if (typeof modalType !== 'function' || modalType() !== 'person' || typeof active !== 'string') return;
    const p = chosen(active);
    if (!p) return;
    const area = $('modalbody');
    if (!area) return;
    const images = area.querySelectorAll('.v36-profile-preview, .avatar > img, .v45-profile-image');
    if (images.length) images.forEach(img => putImage(img, p.src, p.text, true));
    else {
      const portrait = document.createElement('img');
      portrait.className = 'v45-profile-image v46-person-cover';
      portrait.src = p.src; portrait.alt = p.text; portrait.width = 156; portrait.height = 156;
      area.prepend(portrait);
    }
  }

  function scenePopup() {
    if (typeof modalType !== 'function' || modalType() !== 'scene') return;
    const id = typeof active === 'string' ? active.replace(/^scene:/, '') : '';
    const scene = SCENES[id];
    const body = $('modalbody');
    if (!body || body.querySelector('.v46-3d-entry')) return;
    if (!scene) return;
    const panel = document.createElement('section');
    panel.className = 'v46-3d-entry';
    const label = document.createElement('span');label.className = 'v46-3d-tag'; label.textContent='ĐÃ CÓ SA BÀN 3D';
    const title = document.createElement('h3'); title.textContent = scene.title;
    const p = document.createElement('p');p.textContent = scene.subtitle;
    const link = document.createElement('a');link.className='v46-3d-button';
    link.href = scene.href;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent = '◈  Vào trải nghiệm sa bàn 3D';
    const small = document.createElement('small');
    small.textContent = 'Mở trong thẻ mới · Có thể quay lại hồ sơ địa điểm bất cứ lúc nào';
    panel.append(label,title,p,link,small);
    body.prepend(panel);
    const desc = $('moddesc');
    if (desc) desc.textContent = 'Địa điểm lịch sử · Có sa bàn 3D tương tác';
  }

  function decorateCards() {
    document.querySelectorAll('#v23SpaceCards .v23-space-card').forEach(card => {
      if (card.querySelector('.v46-3d-card-label')) return;
      const onclick = card.getAttribute('onclick') || '';
      if (!onclick.includes("scene:quang-tri")) return;
      const marker = document.createElement('span');
      marker.className = 'v46-3d-card-label';
      marker.textContent = '◈ Có sa bàn 3D — chọn để xem';
      card.append(marker);
    });
  }

  function refreshPopup() {
    scenePopup();
    decoratePersonPopup();
  }
  async function loadPublicOverrides() {
    // GitHub Pages là trang tĩnh: API không có nên vẫn dùng ảnh mặc định.
    try {
      const response = await fetch('/api/v4.6/avatar-overrides', {cache:'no-store',credentials:'same-origin'});
      if (!response.ok) return;
      const data = await response.json();
      for (const [id, item] of Object.entries(data.overrides || {})) REGISTRY[id] = item;
      decorateCharacters();refreshPopup();
    } catch (_) { /* Bản offline/GitHub Pages không có CMS. */ }
  }

  function init() {
    if (typeof window.v25RenderCharacters === 'function') {
      const original = window.v25RenderCharacters;
      window.v25RenderCharacters = function () {
        const result = original.apply(this, arguments);
        decorateCharacters();
        return result;
      };
    }
    if (typeof window.renderModal === 'function') {
      const original = window.renderModal;
      window.renderModal = function () {
        const result = original.apply(this, arguments);
        refreshPopup();
        return result;
      };
    }
    if (typeof window.v23RenderMap === 'function') {
      const original = window.v23RenderMap;
      window.v23RenderMap = function () {
        const result = original.apply(this, arguments);
        decorateCards();
        return result;
      };
    }
    if (typeof window.buildHCM === 'function') {
      const original = window.buildHCM;
      window.buildHCM = function () {
        const result = original.apply(this, arguments);
        decorateCharacters();refreshPopup();
        return result;
      };
    }
    decorateCharacters();decorateCards();refreshPopup();
    loadPublicOverrides();
    document.documentElement.dataset.vietsuVersion = '4.6';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
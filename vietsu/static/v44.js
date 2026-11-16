/* VIỆT SỬ V4.4 — Hoán đổi avatar giai đoạn Hồ Chí Minh 4 và 5.
 * 4: 1941–1945 (Tổng khởi nghĩa Tháng Tám).
 * 5: 1945–1954 (Kháng chiến chống Pháp).
 * Không thay đổi năm, lời dẫn hoặc các giai đoạn khác.
 */
(function () {
  'use strict';

  function swapFourthAndFifthAvatars() {
    const section = document.getElementById('hcmHistory');
    if (!section) return;
    const views = ['.hcm-board .hcm-chapter', '.hcm-mobile .hcm-mobile-chapter'];
    views.forEach((selector) => {
      const chapters = [...section.querySelectorAll(selector)];
      if (chapters.length < 5 || chapters[3].dataset.v44AvatarSwap === 'done') return;
      const fourth = chapters[3].querySelector('.v29-stage-avatar img');
      const fifth = chapters[4].querySelector('.v29-stage-avatar img');
      if (!fourth || !fifth) return;

      const fourthSrc = fourth.getAttribute('src');
      const fifthSrc = fifth.getAttribute('src');
      if (!fourthSrc || !fifthSrc) return;
      fourth.setAttribute('src', fifthSrc);
      fifth.setAttribute('src', fourthSrc);
      fourth.alt = 'Hồ Chí Minh — Lãnh đạo Tổng khởi nghĩa Tháng Tám (1941–1945), ảnh minh họa';
      fifth.alt = 'Hồ Chí Minh — Lãnh đạo kháng chiến chống Pháp (1945–1954), ảnh minh họa';
      chapters[3].dataset.v44AvatarSwap = 'done';
      chapters[4].dataset.v44AvatarSwap = 'done';
    });
  }

  function initialize() {
    // V4.3 trang trí avatar trong buildHCM(); V4.4 cần chạy sau.
    if (typeof buildHCM === 'function') {
      const originalBuild = buildHCM;
      buildHCM = function () {
        const result = originalBuild.apply(this, arguments);
        swapFourthAndFifthAvatars();
        return result;
      };
    }
    swapFourthAndFifthAvatars();
    document.documentElement.dataset.vietsuVersion = '4.4';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();

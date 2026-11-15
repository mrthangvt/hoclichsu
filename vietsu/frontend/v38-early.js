/* VIỆT SỬ V3.8 — chạy sớm nhất trong <head>.
   Gộp các lệnh GET trùng nhau tới API khi tải trang (bản cũ gọi /api/site-config 3 lần,
   /api/v3.3/persons 2 lần…) → giảm tải máy chủ và tăng tốc hiển thị. */
(function () {
  'use strict';
  if (!/^https?:$/.test(location.protocol) || !window.fetch) return;
  var nativeFetch = window.fetch.bind(window);
  var cache = new Map();
  var SHARED = /^\/api\/(site-config|v3\.3\/persons|v2\.5\/characters|v3\.5\/costumes|v2\.3\/locations|textbook\/catalog)(\?|$)/;
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      if (method === 'GET' && SHARED.test(url)) {
        var hit = cache.get(url), t = Date.now();
        if (hit && t - hit.t < 20000) return hit.p.then(function (r) { return r.clone(); });
        var p = nativeFetch(url, { credentials: 'same-origin' });
        cache.set(url, { t: t, p: p });
        p.catch(function () { cache.delete(url); });
        return p.then(function (r) { return r.clone(); });
      }
    } catch (e) { /* dùng fetch gốc */ }
    return nativeFetch(input, init);
  };
})();

"""Quét tự động cả phim sa bàn (bộ máy 2.2+) — chạy TRƯỚC khi gửi bản mới cho anh Thắng duyệt.

Dừng ở từng mốc (mặc định mỗi 0,5 s) theo các cảnh của một tầng, chạy một bước phim, rồi ghi lại:
  - lỗi chạy (ngoại lệ, console.error, cảnh báo có chữ "lỗi"),
  - kết quả window.__kiem() của gói (máy quay dưới đất, mặt cắt gần sai, ra ngoài sa bàn…),
  - bước chậm (> 400 ms) — dấu hiệu nạp hình khối / dựng chương trình đồ hoạ giữa phim.

Cần: python3 -m http.server 8765 chạy trong vietsu/static; playwright + google-chrome (SwiftShader, không cần card đồ hoạ).
Chạy liền từ đầu tầng (không tải lại trang giữa chừng) để bắt cả lỗi tích luỹ bộ nhớ.

  python3 vietsu/tools/sa_ban/quet_phim.py ho-chi-minh-1975 noi-do            # cả tầng nội đô, bước 0,5 s
  python3 vietsu/tools/sa_ban/quet_phim.py ho-chi-minh-1975 chien-dich 1 0 300  # bước 1 s, từ 0 đến 300 s

Kết quả: JSON {n: số mốc, out: [vấn đề], nout, slow: [[giây, ms]]}. Bản sạch: out = [], slow = [].
Gói cần đặt window.__kiem = () => [danh sách vấn đề] và window.__sa = {seek, buoc, setPlaying, …} (xem packs/ho-chi-minh-1975/rieng.js).
"""
import asyncio, json, sys
from playwright.async_api import async_playwright

CONG = 8765


async def main():
    goi, tang = sys.argv[1], sys.argv[2]
    buoc = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    tu = sys.argv[4] if len(sys.argv) > 4 else '0'
    den = sys.argv[5] if len(sys.argv) > 5 else '1e9'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=[
            '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
            '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 640, 'height': 400})
        errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)[:300]))
        await pg.goto(f'http://localhost:{CONG}/khong-gian/engine/2.2.0/sa-ban.html?goi={goi}&tang={tang}&tu={tu}&den={den}')
        await pg.wait_for_function('window.__sa !== undefined', timeout=300000)
        await pg.wait_for_timeout(2000)
        # bắt lỗi in ra console (vòng vẽ có try/catch nên lỗi không nổi lên thành pageerror)
        await pg.evaluate("""(() => { const b = document.getElementById('bstart'); if (b) b.click(); window.__loi = [];
          const ce = console.error; console.error = (...a) => { window.__loi.push(String((a[1] && a[1].stack) || a.join(' ')).slice(0, 300)); ce(...a); };
          const cw = console.warn; console.warn = (...a) => { if (/lỗi/i.test(String(a[0]))) window.__loi.push('W ' + String((a[1] && a[1].stack) || a.join(' ')).slice(0, 300)); cw(...a); }; })()""")
        r = await pg.evaluate(f"""(async () => {{ const s = window.__sa; s.setPlaying(false); const out = []; let n = 0; const slow = [];
          const Q = new URLSearchParams(location.search), TU = +(Q.get('tu') || 0), DEN = +(Q.get('den') || 1e9);
          const tt = (await (await fetch('/khong-gian/packs/{goi}/story.json')).json()).scenes
            .filter((c) => !c.tang || c.tang === '{tang}').map((c) => ({{ ...c, t0: Math.max(c.t0, TU), t1: Math.min(c.t1, DEN) }})).filter((c) => c.t1 > c.t0);
          for (const c of tt) for (let t = c.t0 + 0.01; t < c.t1; t += {buoc}) {{
            s.seek(t); const a = performance.now();
            try {{ s.buoc({buoc}); }} catch (e) {{ out.push(['ERR', t.toFixed(2), String(e.stack || e).slice(0, 300)]); }}
            const d = performance.now() - a; if (d > 400) slow.push([t.toFixed(1), Math.round(d)]);
            const k = window.__kiem ? window.__kiem() : []; if (k.length) out.push([t.toFixed(2), k.join(', ')]);
            if (window.__loi.length) out.push(['LOI', t.toFixed(2), window.__loi.splice(0)]);
            n++; }}
          return {{ n, out: out.slice(0, 200), nout: out.length, slow: slow.slice(0, 20) }}; }})()""")
        print(json.dumps(r, ensure_ascii=False)[:6000])
        print('\n'.join(errs[:10]))
        await b.close()

asyncio.run(main())

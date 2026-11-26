# Chụp giữa mọi cú máy (hoặc danh sách id), ghép tờ xem
import sys, json, asyncio, subprocess, time
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
st = json.load(open('goi/story.json'))
shots = [s for sc in st['scenes'] for s in sc['shots']]
want = sys.argv[1:]
if want: shots = [s for s in shots if any(s['id'].startswith(w) for w in want)]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 800, 'height': 450})
        logs = []
        pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:400]))
        pg.on('console', lambda m: logs.append(m.text[:200]) if m.type == 'error' else None)
        await pg.goto('http://localhost:8765/index.html')
        await pg.wait_for_function('window.__sa', timeout=300000)
        await pg.evaluate("document.querySelector('#load').classList.add('done')")
        files = []
        for s in shots:
            t = s['t0'] + (s['t1'] - s['t0']) * 0.6
            await pg.evaluate(f"window.__sa.tua({t})")
            await pg.wait_for_timeout(900)
            f = f"xem/s_{s['id']}.jpg"; await pg.screenshot(path=f, type='jpeg', quality=75); files.append((s['id'], f))
        print('\n'.join(sorted(set(logs)))[:3000])
        await b.close()
    for k in range(0, len(files), 6):
        ims = files[k:k + 6]; W, H = 800, 450; S = Image.new('RGB', (W * 2, H * 3))
        for i, (sid, f) in enumerate(ims):
            im = Image.open(f); S.paste(im, ((i % 2) * W, (i // 2) * H)); ImageDraw.Draw(S).text(((i % 2) * W + 8, (i // 2) * H + 430), sid, fill='yellow')
        S.save(f'xem/to_{k // 6:02d}.jpg', quality=72)
asyncio.run(main())
srv.terminate()

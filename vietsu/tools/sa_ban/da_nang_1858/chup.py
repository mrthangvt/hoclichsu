# Chụp kiểm tra sa bàn: python3 chup.py t1 t2 ... (giây) -> xem/c_<t>.jpg
import sys, asyncio, subprocess, time, os
from playwright.async_api import async_playwright
TS = [float(x) for x in sys.argv[1:]] or [10]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        logs = []
        pg.on('console', lambda m: logs.append(m.type + ': ' + m.text[:300]))
        pg.on('pageerror', lambda e: logs.append('PAGEERR: ' + str(e)[:400]))
        await pg.goto('http://localhost:8765/index.html')
        try:
            await pg.wait_for_function('window.__sa', timeout=240000)
        except Exception as e:
            print('KHONG SAN', e)
        await pg.evaluate("document.querySelector('#nap').classList.add('an')")
        for t in TS:
            await pg.evaluate(f"window.__sa.tua({t})")
            await pg.wait_for_timeout(1800)
            await pg.screenshot(path=f'xem/c_{int(t)}.jpg', type='jpeg', quality=80)
        print('\n'.join(l for l in logs if 'GPU stall' not in l)[:4000])
        await b.close()
asyncio.run(main())
srv.terminate()

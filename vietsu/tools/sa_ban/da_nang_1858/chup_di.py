# python3 chup_di.py "x,z,yaw,pitch|ten" ...  — ảnh góc người đi bộ trong bảo tàng
import sys, asyncio, subprocess, time
from playwright.async_api import async_playwright
jobs = [a.split('|') for a in sys.argv[1:]]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_function('window.__sa', timeout=300000)
        await pg.evaluate("document.querySelector('#load').classList.add('done'); window.__sa.cheDo('baotang'); document.querySelector('#btDi').click(); document.querySelectorAll('.hud,#minimap').forEach(e=>e.style.visibility='hidden')")
        for pos, ten in jobs:
            x, z, yw, pt = pos.split(',')
            await pg.evaluate(f"Object.assign(window.__sa.DI,{{x:{x},z:{z},yaw:{yw},pitch:{pt},toi:null}})")
            await pg.wait_for_timeout(1300)
            await pg.screenshot(path=f'xem/d_{ten}.jpg', type='jpeg', quality=82)
        await b.close()
asyncio.run(main()); srv.terminate()

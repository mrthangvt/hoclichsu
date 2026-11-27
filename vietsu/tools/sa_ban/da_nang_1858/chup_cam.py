# python3 chup_cam.py t "px,py,pz" "tx,ty,tz" ten  (toạ độ three.js)
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
        await pg.evaluate("document.querySelector('#load').classList.add('done'); document.querySelectorAll('.hud,#storybar,#minimap,#help,.ghim').forEach(e=>e.style.visibility='hidden')")
        for t, pp, tt, ten in jobs:
            await pg.evaluate(f"window.__sa.tua({t}); window.__sa.nhin([{pp}],[{tt}])")
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'xem/k_{ten}.jpg', type='jpeg', quality=82)
        await b.close()
asyncio.run(main()); srv.terminate()

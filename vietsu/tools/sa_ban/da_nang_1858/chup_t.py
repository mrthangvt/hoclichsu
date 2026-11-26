# python3 chup_t.py t1 t2 ... — chụp chế độ phim ở các thời điểm
import sys, asyncio, subprocess, time
from playwright.async_api import async_playwright
from PIL import Image
ts = [float(a) for a in sys.argv[1:]]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_function('window.__sa', timeout=300000)
        await pg.evaluate("document.querySelector('#load').classList.add('done'); window.__sa.cheDo('phim')")
        for t in ts:
            await pg.evaluate(f"window.__sa.tua({t})"); await pg.wait_for_timeout(1200)
            await pg.screenshot(path=f'xem/t_{t:g}.jpg', type='jpeg', quality=80)
        await b.close()
    ims = [Image.open(f'xem/t_{t:g}.jpg').resize((640, 360)) for t in ts]
    c = Image.new('RGB', (1280, 360 * ((len(ims) + 1) // 2))); [c.paste(im, ((i % 2) * 640, (i // 2) * 360)) for i, im in enumerate(ims)]; c.save('xem/t_to.jpg', quality=82)
asyncio.run(main()); srv.terminate()

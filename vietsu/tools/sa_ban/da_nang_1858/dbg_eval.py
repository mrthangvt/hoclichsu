import sys, asyncio, subprocess, time
from playwright.async_api import async_playwright
js = sys.argv[1]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 960, 'height': 540})
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
        pg.on('console', lambda m: print('CON', m.text[:300]) if m.type in ('error', 'warning') else None)
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_function('window.__sa', timeout=300000)
        print(await pg.evaluate(js)); await pg.evaluate("document.querySelector('#load').classList.add('done')"); await pg.screenshot(path="xem/dbg.jpg", type="jpeg", quality=80)
        await b.close()
asyncio.run(main()); srv.terminate()

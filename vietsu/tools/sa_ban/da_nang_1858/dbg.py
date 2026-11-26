import sys, asyncio, subprocess, time
from playwright.async_api import async_playwright
JS = sys.argv[1]
srv = subprocess.Popen(['python3', '-m', 'http.server', '8765', '-d', 'goi'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 800, 'height': 450})
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
        await pg.goto('http://localhost:8765/index.html')
        await pg.wait_for_function('window.__sa', timeout=300000)
        print(await pg.evaluate(JS))
        await b.close()
asyncio.run(main()); srv.terminate()

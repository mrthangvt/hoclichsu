import asyncio, subprocess, time
from playwright.async_api import async_playwright
srv = subprocess.Popen(['python3', '-m', 'http.server', '8766', '-d', 'in/qt'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(0.8)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300]))
        await pg.goto('http://localhost:8766/index.html')
        await pg.wait_for_timeout(60000)
        await pg.screenshot(path='xem/qt_1.jpg', type='jpeg', quality=80)
        try:
            await pg.click('#go', timeout=5000); await pg.wait_for_timeout(15000)
        except Exception as e: print('go', e)
        await pg.screenshot(path='xem/qt_2.jpg', type='jpeg', quality=80)
        await pg.set_viewport_size({'width': 400, 'height': 800}); await pg.wait_for_timeout(3000)
        await pg.screenshot(path='xem/qt_3.jpg', type='jpeg', quality=80)
        await b.close()
asyncio.run(main()); srv.terminate()

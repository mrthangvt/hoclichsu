# python3 chup_bt.py "cx,cy,cz|tx,ty,tz|ten" — máy quay quỹ đạo, toạ độ cục bộ bảo tàng
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
        await pg.evaluate("document.querySelector('#load').classList.add('done'); window.__sa.cheDo('baotang'); document.querySelectorAll('.hud,#minimap,#btDi,.ghim').forEach(e=>e.style.visibility='hidden')")
        for c, t, ten in jobs:
            await pg.evaluate(f"(()=>{{const S=window.__sa,[mx,mn]=S.BT.M,y=S.BT.y0;const c=[{c}],t=[{t}];S.OC.target.set(mx+t[0],y+t[1],-mn+t[2]);S.camera.position.set(mx+c[0],y+c[1],-mn+c[2]);S.OC.minDistance=0.5}})()")
            await pg.wait_for_timeout(1300)
            await pg.screenshot(path=f'xem/b_{ten}.jpg', type='jpeg', quality=82)
        await b.close()
asyncio.run(main()); srv.terminate()

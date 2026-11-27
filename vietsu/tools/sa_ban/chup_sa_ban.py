import asyncio, sys, json
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; JS = sys.argv[3] if len(sys.argv) > 3 else ''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1280, 'height': 760})
        logs = []
        pg.on('console', lambda m: logs.append(f'[{m.type}] {m.text}'))
        pg.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
        pg.on('response', lambda r: logs.append(f'[404] {r.url}') if r.status >= 400 else None)
        await pg.goto(URL)
        try: await pg.wait_for_function("window.__sa !== undefined || /Không dựng|Lỗi khi tải/.test(document.body.innerText)", timeout=240000)
        except Exception as e: logs.append('TIMEOUT ' + str(e)[:200])
        if JS:
            try: logs.append('JS: ' + str(await pg.evaluate(JS)))
            except Exception as e: logs.append('JSERR ' + str(e)[:300])
        await pg.wait_for_timeout(1500)
        await pg.screenshot(path=OUT)
        err = await pg.evaluate("(document.getElementById('err')||{}).textContent || (document.getElementById('lm')||{}).textContent || ''")
        print('ERRTEXT:', err[:300])
        for l in logs[-25:]: print(l[:300])
        await b.close()
asyncio.run(main())

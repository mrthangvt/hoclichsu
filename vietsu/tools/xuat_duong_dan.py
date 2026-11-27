#!/usr/bin/env python3
"""Xuất danh sách đường dẫn rõ ràng của trang Học Lịch Sử ra vietsu/data/duong_dan.json.

Chạy trên máy có Playwright (sau khi build_v59.py):
    python3 vietsu/tools/xuat_duong_dan.py
Công cụ mở bản V5.9 trong trình duyệt ẩn, gọi window.HLS_DUONG_DAN.tatCa() (static/v59-duong-dan.js)
nên đường dẫn trong tệp luôn khớp đúng với đường dẫn trang tạo ra khi bấm.
Chạy lại mỗi khi thêm/sửa nhân vật, sự kiện, bài học… rồi commit duong_dan.json.
"""
import asyncio, functools, http.server, json, pathlib, threading

GOC = pathlib.Path(__file__).resolve().parents[1]
RA = GOC / "data" / "duong_dan.json"


def may_chu():
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def translate_path(self, path):
            p = path.split("?")[0].split("#")[0]
            if p in ("/", "/index.html"):
                return str(GOC / "static" / "Viet_Su_Timeline_V5.9_Offline.html")
            return str(GOC / p.lstrip("/"))
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


async def main():
    from playwright.async_api import async_playwright
    s = may_chu()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.route("**/fonts.g*/**", lambda r: r.abort())
        await pg.goto(f"http://127.0.0.1:{s.server_port}/index.html")
        await pg.wait_for_function("window.HLS_DUONG_DAN", timeout=30000)
        await pg.wait_for_timeout(1500)
        ds = await pg.evaluate("HLS_DUONG_DAN.tatCa()")
        await b.close()
    s.shutdown()
    ds.sort(key=lambda d: d["duong"])
    RA.write_text(json.dumps({"ghi_chu": "Tạo bằng tools/xuat_duong_dan.py — không sửa tay.", "duong_dan": ds},
                             ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    print(f"{RA.relative_to(GOC.parent)}: {len(ds)} đường dẫn")


if __name__ == "__main__":
    asyncio.run(main())

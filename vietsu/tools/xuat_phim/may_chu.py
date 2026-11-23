#!/usr/bin/env python3
"""Máy chủ tại máy cho công cụ xuất phim sa bàn (chỉ dùng riêng, không thuộc website).

Chạy:   python3 vietsu/tools/xuat_phim/may_chu.py            (cổng 8765, chỉ nghe 127.0.0.1)
Mở:     http://127.0.0.1:8765/quay/thanh-co-quang-tri/?auto&w=1080&h=1920&che_do=xem_thu

Đường dẫn:
  /khong-gian/...   → vietsu/static/khong-gian/... (sa bàn, nguyên bản, không sửa)
  /static/...       → vietsu/static/... (phông chữ, logo)
  /xuat_phim/...    → vietsu/tools/xuat_phim/... (bộ quay, danh sách khoảnh khắc)
  /quay/<sa-ban>/   → index.html của sa bàn, chèn <base> + dong_ho_ao.js vào đầu <head> (chỉ trong bộ nhớ, không ghi đè tệp)
  POST /xuat_phim/luu?ten=<tệp>  → ghi vào vietsu/tools/xuat_phim/ket_qua/<tệp>
"""
import http.server, os, re, sys, urllib.parse, socketserver

GOC = os.path.dirname(os.path.abspath(__file__))                 # vietsu/tools/xuat_phim
STATIC = os.path.normpath(os.path.join(GOC, '..', '..', 'static'))  # vietsu/static
KET_QUA = os.path.join(GOC, 'ket_qua')
CONG = int(os.environ.get('CONG', sys.argv[1] if len(sys.argv) > 1 else 8765))


class XuLy(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
                      '.wasm': 'application/wasm', '.glb': 'model/gltf-binary', '.webp': 'image/webp',
                      '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4'}

    def log_message(self, fmt, *a):
        if '/luu' in self.path or ' 404 ' in (fmt % a):
            sys.stderr.write('  ' + (fmt % a) + '\n')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def translate_path(self, path):
        p = urllib.parse.unquote(urllib.parse.urlparse(path).path)
        for tien_to, thu_muc in (('/xuat_phim/', GOC), ('/static/', STATIC), ('/khong-gian/', os.path.join(STATIC, 'khong-gian'))):
            if p.startswith(tien_to):
                dich = os.path.normpath(os.path.join(thu_muc, p[len(tien_to):]))
                return dich if dich.startswith(thu_muc) else os.path.join(GOC, '__khong_co__')
        return os.path.join(GOC, '__khong_co__')

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        m = re.fullmatch(r'/quay/([a-z0-9-]+)/(index\.html)?', u.path)
        if m:
            return self.trang_quay(m.group(1))
        if u.path in ('/', '/xuat_phim/'):
            self.send_response(302); self.send_header('Location', '/quay/thanh-co-quang-tri/?auto&w=1080&h=1920&che_do=xem_thu'); self.end_headers(); return
        return super().do_GET()

    def trang_quay(self, sa_ban):
        tep = os.path.join(STATIC, 'khong-gian', sa_ban, 'index.html')
        if not os.path.isfile(tep):
            return self.send_error(404, 'Không có sa bàn ' + sa_ban)
        html = open(tep, encoding='utf-8').read()
        chen = (f'<base href="/khong-gian/{sa_ban}/">\n'
                '<script src="/xuat_phim/dong_ho_ao.js"></script>\n')
        html = re.sub(r'(<head[^>]*>)', lambda k: k.group(1) + chen, html, count=1)
        b = html.encode('utf-8')
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)

    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        if u.path != '/xuat_phim/luu':
            return self.send_error(404)
        ten = urllib.parse.parse_qs(u.query).get('ten', [''])[0]
        if not re.fullmatch(r'[A-Za-z0-9_.-]{1,120}', ten) or ten.startswith('.'):
            return self.send_error(400, 'Tên tệp không hợp lệ')
        n = int(self.headers.get('Content-Length', 0))
        os.makedirs(KET_QUA, exist_ok=True)
        dich = os.path.join(KET_QUA, ten)
        with open(dich + '.tam', 'wb') as f:
            con = n
            while con > 0:
                k = self.rfile.read(min(con, 1 << 20))
                if not k:
                    break
                f.write(k); con -= len(k)
        os.replace(dich + '.tam', dich)
        sys.stderr.write(f'  đã lưu {dich} ({n/1e6:.1f} MB)\n')
        b = dich.encode('utf-8')
        self.send_response(200); self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)


class MayChu(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 128   # macOS mặc định hàng chờ 5: trang tải 7 mô hình cùng lúc sẽ bị từ chối kết nối


if __name__ == '__main__':
    os.makedirs(KET_QUA, exist_ok=True)
    s = MayChu(('127.0.0.1', CONG), XuLy)
    print(f'Máy chủ xuất phim: http://127.0.0.1:{CONG}/  (Ctrl+C để dừng)')
    print(f'Kết quả lưu ở: {KET_QUA}')
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        pass

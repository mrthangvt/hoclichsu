#!/bin/bash
# Bộ chạy thử Việt Sử V4.1 trên Mac. Không kết nối hay thay đổi VPS.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Thiếu Python 3.10+. Hãy cài Python từ python.org trước khi chạy." >&2
  exit 1
fi
python3 - <<'PYTHON'
import sys
if sys.version_info < (3, 10):
    raise SystemExit('Cần Python 3.10 trở lên (khuyến nghị 3.11–3.12).')
PYTHON

if [ ! -f .env ]; then
  echo 'Thiết lập cấu hình thử nghiệm riêng trên máy này...'
  ADMIN="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
  REVIEW="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
  cat > .env <<EOF
# Môi trường LOCAL, không dùng như cấu hình VPS
SITE_URL=http://127.0.0.1:8000
ALLOWED_HOSTS=
VIETSU_ADMIN_TOKEN=$ADMIN
VIETSU_REVIEW_TOKEN=$REVIEW
VIETSU_ADMIN_CAN_PUBLISH=0
OPENAI_API_KEY=
OPENAI_MODEL=
VIETSU_ENABLE_DOCS=0
VIETSU_RATE_PER_MIN=240
VIETSU_MAX_BODY_MB=8
EOF
  chmod 600 .env
  echo
  echo 'ĐÃ TẠO MÃ MỚI (chỉ lưu trên máy của anh):'
  echo "Mã quản trị: $ADMIN"
  echo "Mã thẩm định: $REVIEW"
  echo 'Có thể xem lại hai mã trong file .env, không chia sẻ file này.'
  echo
fi

if [ ! -x .venv/bin/python ]; then
  echo 'Tạo môi trường Python...'
  python3 -m venv .venv
fi
if [ ! -f .venv/.vietsu_dependencies_ready ]; then
  echo 'Cài thư viện (lần đầu cần kết nối Internet)...'
  .venv/bin/python -m pip install --upgrade pip
  .venv/bin/python -m pip install -r requirements.txt
  touch .venv/.vietsu_dependencies_ready
fi

echo "Tạo giao diện Việt Sử V4.2 (giữ nguyên V4.1 và dữ liệu CMS)..."
.venv/bin/python tools/build_v45.py

PORT="${PORT:-8000}"
if [ "${LAN:-0}" = "1" ]; then
  HOST=0.0.0.0
else
  HOST=127.0.0.1
fi

.venv/bin/python -m uvicorn main:app --host "$HOST" --port "$PORT" --workers 1 &
PID=$!
cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if ! .venv/bin/python - "$PORT" <<'PYTHON'
import sys,time,urllib.request
url=f'http://127.0.0.1:{sys.argv[1]}/api/health'
for _ in range(60):
    try:
        with urllib.request.urlopen(url,timeout=1) as res:
            if res.status==200:
                print('Máy chủ đã sẵn sàng:',url)
                raise SystemExit(0)
    except Exception:
        time.sleep(.5)
raise SystemExit(1)
PYTHON
then
  echo 'Không thể khởi động. Kiểm tra lỗi trên Terminal hoặc thử PORT=8001.' >&2
  exit 1
fi

printf '
Website: http://127.0.0.1:%s
CMS: http://127.0.0.1:%s/admin
' "$PORT" "$PORT"
if [ "$HOST" = '0.0.0.0' ]; then
  IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
  if [ -n "$IP" ]; then
    echo "Điện thoại cùng Wi-Fi: http://$IP:$PORT"
  else
    echo 'Tìm địa chỉ IP Wi-Fi trong Cài đặt Mạng trên Mac.'
  fi
  echo 'Chế độ mạng LAN: chỉ dùng trên Wi-Fi tin cậy; không mở cổng router ra Internet.'
fi
if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:$PORT" || true
fi
echo

echo 'Giữ cửa sổ Terminal này mở khi kiểm thử. Nhấn Ctrl+C để dừng.'
wait "$PID"

#!/usr/bin/env bash
# Chạy máy chủ Việt Sử (đọc cấu hình từ file .env cùng thư mục)
cd "$(dirname "$0")"
[ -d .venv ] || { python3 -m venv .venv && .venv/bin/pip install -r requirements.txt; }
exec .venv/bin/uvicorn main:app --host 127.0.0.1 --port "${PORT:-8000}" --workers 1 --proxy-headers --forwarded-allow-ips=127.0.0.1

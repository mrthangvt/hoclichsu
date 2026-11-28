# Máy chủ Học Lịch Sử (CMS /admin + API) cho VPS hoclichsu.com — xem docs/VPS_AAPANEL.md.
# Trang chính là file tĩnh do Nginx aaPanel phục vụ; container chỉ lo /admin, /api/, ảnh tải lên.
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Chạy chung mạng với máy (network_mode: host) để thấy Nginx là 127.0.0.1 → đọc đúng IP người dùng.
CMD ["sh", "-c", "exec uvicorn main:app --host 127.0.0.1 --port ${PORT:-8010} --workers 1 --proxy-headers --forwarded-allow-ips=127.0.0.1"]

#!/bin/bash
# Chỉ bật trong mạng Wi-Fi nội bộ tin cậy, cho phép điện thoại truy cập.
set -euo pipefail
cd "$(dirname "$0")"
LAN=1 bash ./start_local.command

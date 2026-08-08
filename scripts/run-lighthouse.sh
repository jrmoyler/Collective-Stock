#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 -m http.server 4173 --bind 127.0.0.1 --directory "$project_root/dist" >/tmp/collective-stock-lighthouse-server.log 2>&1 &
server_pid=$!
cleanup() { kill "$server_pid" >/dev/null 2>&1 || true; }
trap cleanup EXIT
sleep 0.3

CHROME_PATH="$project_root/.browser-runtime/chromium" \
XDG_CACHE_HOME="$project_root/.browser-runtime/cache" \
FONTCONFIG_PATH=/etc/fonts \
FONTCONFIG_FILE=/etc/fonts/fonts.conf \
npx lighthouse http://127.0.0.1:4173/ \
  --chrome-flags="--headless --no-sandbox --disable-setuid-sandbox --disable-gpu --disable-software-rasterizer" \
  --output=json \
  --output-path="$project_root/reports/lighthouse-mobile.json" \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet

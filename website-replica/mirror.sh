#!/usr/bin/env bash
# Fallback mirror using wget only (no Node/Playwright). Captures the server-sent HTML, not the
# JS-rendered DOM, and only same-host assets. Prefer `npm run crawl` for a faithful copy.
# Usage: ./mirror.sh [url] [outDir]
set -euo pipefail
URL="${1:-https://www.prismoralsurgery.com/}"
OUT="${2:-site-wget}"
wget --mirror --page-requisites --convert-links --adjust-extension --no-parent \
  --restrict-file-names=unix --trust-server-names -e robots=off \
  --user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36" \
  --wait=0.3 --random-wait --timeout=30 --tries=3 --no-host-directories \
  --directory-prefix="$OUT" "$URL"
echo "Mirror written to $OUT (open $OUT/index.html)"

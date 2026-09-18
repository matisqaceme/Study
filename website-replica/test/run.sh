#!/usr/bin/env bash
# End-to-end smoke test: serve the fixture site, crawl it, assert the mirror is complete, verify it offline.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules/playwright ] || { echo "run: npm install && npx playwright install chromium"; exit 1; }
PORT=8123; TMP=.tmp; OUT=$TMP/out
rm -rf "$TMP"; mkdir -p "$TMP"
cp -r test/fixture "$TMP/fixture"
sed -i "s/__PORT__/$PORT/g" "$TMP/fixture/index.html"

node serve.mjs "$TMP/fixture" "$PORT" 0.0.0.0 >/dev/null & SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1

node crawl.mjs "http://127.0.0.1:$PORT/" "$OUT" --wait=300

fail=0
expect_file() { [ -f "$OUT/$1" ] || { echo "MISSING $1"; fail=1; }; }
expect_grep() { grep -q -- "$2" "$OUT/$1" || { echo "EXPECTED '$2' in $1"; fail=1; }; }
refuse_grep() { ! grep -q -- "$2" "$OUT/$1" || { echo "UNEXPECTED '$2' in $1"; fail=1; }; }

expect_file index.html; expect_file about/index.html; expect_file services.html; expect_file team/index.html
expect_file img/logo.svg; expect_file img/photo.png; expect_file img/bg.png; expect_file img/favicon.ico
expect_file fonts/f.woff2; expect_file js/app.js; expect_file docs/brochure.pdf; expect_file manifest.json
expect_file "_ext/localhost/ext/ext.css"
ls "$OUT"/css/style__*.css >/dev/null 2>&1 || { echo "MISSING css/style__<hash>.css"; fail=1; }
ls "$OUT"/img/bg__*.png >/dev/null 2>&1 || { echo "MISSING img/bg__<hash>.png (query-string asset)"; fail=1; }

expect_grep index.html 'id="rendered">Rendered by JS'      # JS-rendered DOM captured
expect_grep index.html 'href="about/index.html"'            # same-site page links relative
expect_grep index.html 'href="services.html#pricing"'       # hash preserved
expect_grep index.html 'href="#top"'                        # fragment-only links stay as they are
expect_grep index.html 'href="#">'                          # (rewriting them to index.html breaks Webflow's current-page detection)
expect_grep index.html 'href="team/index.html"'             # redirecting link resolved
expect_grep index.html 'href="docs/brochure.pdf"'           # linked asset fetched
expect_grep index.html 'href="css/style__'                  # query-string stylesheet
expect_grep index.html 'href="_ext/localhost/ext/ext.css"'  # cross-origin stylesheet
expect_grep index.html 'src="js/app.js"'
expect_grep index.html "action=\"http://127.0.0.1:$PORT/contact\"" # forms keep pointing at the real backend
expect_grep index.html 'href="https://example.com/"'        # external links untouched
refuse_grep index.html '<base '
expect_grep about/index.html 'href="../index.html"'
expect_grep about/index.html 'src="../img/logo.svg"'
grep -q 'url("../fonts/f.woff2")' "$OUT"/css/style__*.css || { echo "css font url not rewritten"; fail=1; }
grep -q 'url(../img/bg__' "$OUT"/css/style__*.css || { echo "css query-string url not rewritten"; fail=1; }
grep -q 'url("../img/photo.png")' "$OUT/_ext/localhost/ext/ext.css" || { echo "cross-origin css url not rewritten"; fail=1; }
expect_file "_ext/localhost/img/photo.png"                # root-relative url() inside cross-origin CSS resolves against that origin
expect_grep index.html 'href="img/favicon.ico"'           # favicon (never fetched by headless Chromium) still captured
expect_grep index.html 'url(img/bg.png)'                  # unused <style> url() captured
expect_grep index.html 'srcset="img/logo.svg 1x, img/logo__'  # every srcset candidate captured
ls "$OUT"/img/logo__*.svg >/dev/null 2>&1 || { echo "MISSING srcset 2x candidate"; fail=1; }
[ "$(ls "$OUT"/img/logo__*.svg | wc -l)" -ge 4 ] || { echo "srcset URLs containing commas were not captured whole"; fail=1; }
refuse_grep index.html 'h_2,q_3 1x'                        # comma-in-URL candidate rewritten as one unit
refuse_grep index.html 'data-src="img/missing.png"'        # a reference the crawler could not fetch is not pointed at a nonexistent local file
expect_grep index.html "data-src=\"http://127.0.0.1:$PORT/img/missing.png\""   # ...it becomes absolute so it still works online
[ "$(grep -c "http://127.0.0.1:$PORT" "$OUT/index.html")" -le 3 ] || { echo "too many absolute self-references left in index.html"; fail=1; }

node verify.mjs "$OUT" 8124 || fail=1

# --links=dir: page links become directory URLs like the live site's (Webflow and similar builders inspect hrefs).
OUT2=$TMP/out-dir
node crawl.mjs "http://127.0.0.1:$PORT/" "$OUT2" --wait=300 --links=dir >/dev/null
expect_grep2() { grep -q -- "$2" "$OUT2/$1" || { echo "EXPECTED '$2' in $1 (dir mode)"; fail=1; }; }
expect_grep2 index.html 'href="about/"'                   # dir/index.html -> dir/
expect_grep2 index.html 'href="services.html#pricing"'     # non-index pages unchanged
expect_grep2 about/index.html 'href="../"'                 # link back to the root page
expect_grep2 index.html 'href="#top"'                      # fragment-only links untouched in dir mode too
[ "$(grep -o 'href="./"' "$OUT2/index.html" | wc -l)" -eq 1 ] || { echo "expected exactly one ./ link in dir mode (the / link); fragment hrefs must not become ./"; fail=1; }
grep -q 'href="about/index.html"' "$OUT2/index.html" && { echo "UNEXPECTED index.html link in dir mode"; fail=1; }
node verify.mjs "$OUT2" 8125 || fail=1
[ $fail -eq 0 ] && echo "ALL CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }

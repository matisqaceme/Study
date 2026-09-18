# website-replica

One-command static replica of https://www.owldental.ie for research use. Only run this
against a site you own or have written permission to copy.

## Status

`site/` holds the captured replica (see `site/manifest.json` for the capture date, page list, asset
list, and failures). The site is built on **Wix**. It is captured with `--links=dir` so page links
match the live URLs (`--links=file` writes `dir/index.html` links instead; Webflow sites need `dir`
because Webflow's runtime marks every `*/index.html` link as the current page when the URL ends in `/`).

Capturing needs **Full** network access in a cloud session (the default **Trusted** level only allows
package registries and GitHub). Docs: https://code.claude.com/docs/en/cloud-environments#network-access.
In a cloud session outbound HTTPS is re-terminated by the agent proxy, and Chromium does not read
the CA environment variables, so import the proxy CA into Chromium's NSS store first:

```bash
apt-get install -y libnss3-tools
mkdir -p ~/.pki/nssdb && certutil -d sql:$HOME/.pki/nssdb -N --empty-password
certutil -d sql:$HOME/.pki/nssdb -A -n ccr-agent-proxy -t "C,," -i /root/.ccr/agent-proxy-ca.crt
```

## Run

```bash
cd website-replica
npm install
npx playwright install chromium   # skip if a matching Chromium is already installed
npm run crawl                     # -> site/ and site/manifest.json (uses --links=dir, see below)
npm run verify                    # opens every page offline and reports anything missing
npm run serve                     # http://127.0.0.1:8080/
```

`crawl.mjs` options: `node crawl.mjs <url> [outDir] [--max-pages=500] [--wait=1500] [--scripts=keep|strip] [--links=file|dir]`.
Use `--scripts=strip` if the site's own JavaScript breaks the offline copy (common with Wix and
other builders whose runtime phones home). `--links=dir` writes page links as `dir/` instead of
`dir/index.html`, matching the live site's URLs; it needs a static host that serves `index.html` for
directories (any real host, and `serve.mjs`), so the copy no longer opens straight from disk.
Set `CHROMIUM_PATH=/path/to/chrome` to use a system browser.

`mirror.sh` is a wget-only fallback. It captures server-sent HTML, not the rendered DOM, and only
same-host assets.

## What the crawler does

1. Crawls every same-site page reachable from the start URL, seeded from `sitemap.xml` too.
2. Renders each page in headless Chromium at 1440x900, scrolls to trigger lazy loading, waits for
   the network to go idle, then snapshots the rendered DOM (so JS-injected content is included).
3. Saves every response the browser fetched: CSS, JS, images, fonts, from any host. Third-party
   assets land under `_ext/<host>/`.
4. Also fetches assets the browser never requested: favicons, unused `srcset` candidates,
   `url()` references in unused CSS rules, and same-site files linked from `<a>` (PDFs etc.).
5. Rewrites URLs in HTML and CSS to relative paths so the copy works from any static host or
   straight from disk. Redirected URLs get a stub page so old links still resolve.
6. Writes `site/manifest.json` listing every page, asset, redirect, and failure.

## What a static replica cannot be 1:1 on

- **Forms.** Contact and appointment forms keep their original `action` URL, so submitting posts
  to the live backend. Nothing is stored locally.
- **Third-party embeds.** Google Maps, review widgets, chat bubbles, booking iframes and analytics
  stay pointed at their live services and may refuse to load from a different origin.
- **Server-side behaviour.** Site search, logged-in areas, patient portals, and anything rendered
  per-request is captured only as the one response the crawler saw.
- **Timing.** Sliders, animations, and A/B content are frozen at the moment of capture.

## Test

`npm test` serves a small fixture site with two origins, crawls it, asserts the output
(rendered DOM, relative links, hash anchors, redirect resolution, query-string assets,
cross-origin CSS, favicons, srcset candidates), and runs the offline verifier.

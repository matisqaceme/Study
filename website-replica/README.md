# website-replica

One-command static replica of a website for research use. Only run this against a site you own or
have written permission to copy.

## Status

Captures live under `sites/<host>/`, each with its own `manifest.json` (capture date, page list with
HTTP status, asset list, redirects, failures).

### sites/owldental.ie (captured 2026-09-18)

**https://www.owldental.ie** is built with **Wix** (Thunderbolt runtime, served through Fastly). The
capture has 7 pages (the whole `pages-sitemap.xml`) and 250 assets with 0 fetch failures; `verify.mjs`
reports 0 broken requests. At 1440px the full-page contact page screenshot is pixel-identical to the
live site and the homepage differs only in the JavaScript-added "Back to Top" button and AVIF
compression noise in the hero photo (see below). Reproduce it with `npm run crawl`, i.e.

```bash
node crawl.mjs https://www.owldental.ie/ sites/owldental.ie --wait=2000 --links=dir --scripts=strip
```

`--scripts=strip` is required. Wix renders every page server-side, so the snapshot is complete
without JavaScript; with the site's scripts kept, the Wix runtime crashes on hydration from a
different origin (17 uncaught errors per page: React chunk ordering and a same-origin web worker it
cannot construct), keeps 40+ requests per page going to `static.parastorage.com`, pings Wix telemetry
(`frog.wix.com`, `panorama.wixapps.net`, Sentry) and nudges the team cards on the homepage a few
pixels out of place. Stripped, a page makes 4 requests to other hosts (Google Maps on the contact
page) and none to Wix.

### sites/prismoralsurgery.com (captured 2026-09-18)

**https://www.prismoralsurgery.com** is built with **Webflow** and served through Cloudflare. The
capture has 39 pages and 326 assets with 0 fetch failures; `verify.mjs` reports 0 broken requests,
and full-page screenshots at 1440px of the homepage, the About page, the contact page and a service
page are pixel-identical to the live site when served from a static host. Reproduce it with
`npm run crawl:prism`, i.e.

```bash
node crawl.mjs https://www.prismoralsurgery.com/ sites/prismoralsurgery.com --wait=2000 --links=dir
```

The 39 pages are the 33 sitemap URLs, `/contact` (a redirect to `/contact-us`, kept as a stub),
`/services/oral-surgery/%20iv-sedation` (a mis-typed link on the homepage that Webflow still serves;
it lands in a directory with a leading space) and 5 URLs that the live site links to but that return
Webflow's "Not Found" page: `/blog` (nav and footer on every page), `/oral-surgery/wisdom-teeth-removal`
(footer), `/services/other/sedation-dentistry` and `/services/other/general-anesthesia` (services
pages), and `/services/cosmetic-dentistry/botox` (Dr. Kim's page). Those 404 pages are mirrored as-is
so the dead links behave the same offline; `manifest.pageStatus` lists them.

Both captures use `--links=dir` so page links match the live URLs (`--links=file` writes
`dir/index.html` links instead). Webflow sites need `dir`: Webflow's runtime marks every
`*/index.html` link as the current page when the URL ends in `/`, which on the Prism site turned 2 to 4
highlighted nav links into 70 to 90.

Capturing needs **Full** network access in a cloud session (the default **Trusted** level only allows
package registries and GitHub). Docs: https://code.claude.com/docs/en/cloud-environments#network-access.
In a cloud session outbound HTTPS is re-terminated by the agent proxy, and Chromium does not read
the CA environment variables, so import the proxy CA into Chromium's NSS store first (the symptom is
`ERR_CERT_AUTHORITY_INVALID` on every page while `curl` works):

```bash
apt-get install -y libnss3-tools
mkdir -p ~/.pki/nssdb && [ -f ~/.pki/nssdb/cert9.db ] || certutil -d sql:$HOME/.pki/nssdb -N --empty-password
certutil -d sql:$HOME/.pki/nssdb -A -n ccr-agent-proxy -t "C,," -i /root/.ccr/agent-proxy-ca.crt
```

## Run

```bash
cd website-replica
npm install
npx playwright install chromium   # skip if a matching Chromium is already installed
npm run crawl                     # -> sites/owldental.ie/ and its manifest.json (crawl:prism for the other site)
npm run verify                    # opens every page offline and reports anything missing (verify:prism)
npm run serve                     # http://127.0.0.1:8080/ (serve:prism)
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
4. Also fetches assets the browser never requested: favicons, unused `srcset` candidates (parsed per
   the HTML spec, so URLs containing commas, as Wix's do, stay whole), `url()` references in unused
   CSS rules, and same-site files linked from `<a>` (PDFs etc.). A `<link rel="prefetch">` to another
   page is followed as a page, never saved as an asset.
5. Rewrites URLs in HTML and CSS to relative paths so the copy works from any static host or
   straight from disk. Only assets that were actually saved get a local path; a reference the
   crawler could not fetch (e.g. an image the CDN refuses) is made absolute to its original URL so
   it still works online. Fragment-only links (`href="#"`, `href="#top"`) are left alone.
   Redirected URLs get a stub page so old links still resolve.
6. Writes `site/manifest.json` listing every page (with the HTTP status it was served with), asset,
   redirect, and failure.

## What a static replica cannot be 1:1 on

- **Forms.** Contact and appointment forms keep their original `action` URL, so submitting posts
  to the live backend. Nothing is stored locally.
- **Third-party embeds.** Google Maps, review widgets, chat bubbles, booking iframes and analytics
  stay pointed at their live services and may refuse to load from a different origin.
- **Server-side behaviour.** Site search, logged-in areas, patient portals, and anything rendered
  per-request is captured only as the one response the crawler saw.
- **Timing.** Sliders, animations, and A/B content are frozen at the moment of capture.

### In the owldental.ie capture specifically

- **Contact form** (homepage): a Wix Forms component with no `action`; on the live site Wix's
  JavaScript posts it to Wix's API. With scripts stripped the Send button does nothing, and no
  submission is stored anywhere.
- **Online booking** (`/book-online`): a Wix Bookings component. At capture time the live page showed
  its empty state ("Nothing to book right now. Check back soon."), and that is what the copy holds;
  services added in Wix later will not appear in it.
- **Google Maps** (contact page): a Wix map component in an iframe served from
  `static.parastorage.com`, which loads `maps.googleapis.com` live. This is the only third-party
  traffic the stripped copy still makes (4 requests on the contact page).
- **Background video** (contact page): the Wix video file is captured and autoplays from the local
  copy.
- **Mobile menu, hover effects, entrance animations and the floating "Back to Top" button** that
  appears after scrolling: Wix-runtime behaviour, gone with the scripts. Every page and every link
  works; nothing on a page moves. That button is the only visible difference on the homepage.
- **Hero photo**: Wix serves it as AVIF picked at request time; the captured bytes render with a
  mean pixel error of about 5/255 against the live page (invisible, but not bit-identical).
- **Fonts**: Wix serves its fonts from `static.parastorage.com`; the CSS and 38 font files are
  captured and rewritten, so text renders identically offline.
- **The phone number** is plain text on the live site too (no `tel:` link); the one `mailto:` link is
  untouched. The site has no social links.

### In the prismoralsurgery.com capture specifically

- **Contact form** (footer of every page): posts to Basin (`usebasin.com/f/3bc24a39f0dd`) and is
  protected by Google reCAPTCHA, which loads live. Offline, the reCAPTCHA badge is the only visible
  difference on the homepage.
- **Google Maps embed** (`google.com/maps/embed` iframe) on the homepage and contact page: live only,
  blank offline.
- **Booking**: the "Make An Appointment" buttons link out to `book.patientloop.com`; the PatientLoop
  tracking script and its widget config load live.
- **Analytics**: Google Tag Manager (`GTM-MPKMBPWM`) and the GA4 tag it loads still run and will
  record visits to the copy against the live property. The GA beacons show up in `verify.mjs` as
  failed third-party background calls; they abort identically on the live site.
- **Fonts**: the Adobe Fonts (Typekit) kit `rux3wkq` and Google Fonts loader still run and re-fetch
  the-seasons and Inter from Adobe/Google when online. The snapshot also carries the `@font-face`
  rules pointing at the local copies, so both families render offline.
- **Outbound links** to `pdf.dsnforms.com` (patient forms), `weavebillpay.com`, `maps.app.goo.gl`,
  Instagram and Facebook are untouched.
- **Dead links** on the live site (listed under Status) resolve to the mirrored Webflow 404 page.

## Verify

`verify.mjs` serves the mirror, opens every HTML file in Chromium and counts as **broken** anything
the mirror should have served: a request to the local server that fails, or a document, script,
stylesheet, image, font or media file on any host that fails. Failed *background* calls to third
parties (analytics beacons, tracking pings, XHR from embeds) are listed separately and do not fail the
run, because they fail the same way on the live site or are outside what a static copy controls.
Two more cases are not counted as broken: a `<video>`/`<audio>` element cancelling its own download
(`net::ERR_ABORTED` on a media request is normal for autoplaying media), and HTML files under `_ext/`,
which are third-party iframe documents exercised through the pages that embed them rather than opened
standalone.

## Test

`npm test` serves a small fixture site with two origins, crawls it, asserts the output
(rendered DOM, relative links, hash anchors, redirect resolution, query-string assets,
cross-origin CSS, favicons, srcset candidates, `--links=dir` output), and runs the offline verifier.

#!/usr/bin/env node
/**
 * crawl.mjs - rendered static mirror of a website using Playwright + Chromium.
 *
 * Usage:
 *   node crawl.mjs <start-url> [outDir] [--max-pages=500] [--wait=1500] [--scripts=keep|strip] [--links=file|dir]
 *
 * 1. Crawls every same-site page reachable from the start URL (plus sitemap.xml).
 * 2. Renders each page in headless Chromium, scrolls to trigger lazy loading, snapshots the DOM.
 * 3. Saves every response the browser fetched (CSS, JS, images, fonts, from any host).
 * 4. Rewrites URLs in HTML and CSS to relative local paths so the copy works from any static host.
 * 5. Writes manifest.json (pages, assets, redirects, failures) next to the output.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; }),
);
if (!positional[0]) {
  console.error('usage: node crawl.mjs <start-url> [outDir] [--max-pages=N] [--wait=ms] [--scripts=keep|strip] [--links=file|dir]');
  process.exit(2);
}

const START = new URL(positional[0]);
const OUT = path.resolve(positional[1] ?? 'site');
const MAX_PAGES = Number(flags['max-pages'] ?? 500);
const SETTLE_MS = Number(flags.wait ?? 1500);
const STRIP_SCRIPTS = flags.scripts === 'strip';
// --links=file: page links point at "dir/index.html" (opens straight from disk).
// --links=dir:  page links point at "dir/" like the live site does. Needed for builders whose runtime inspects
//               link hrefs (Webflow marks every "*/index.html" link as the current page when the URL ends in "/").
const DIR_LINKS = flags.links === 'dir';
const SITE_HOST = START.hostname.replace(/^www\./, '');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const SKIP_PAGE = [/\/wp-admin(\/|$)/, /\/wp-login\.php/, /\/wp-json(\/|$)/, /\/xmlrpc\.php/, /\/feed\/?$/, /[?&]s=/, /[?&]replytocom=/, /\/cdn-cgi\//, /\/wp-content\/uploads\//];
const ASSET_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|css|js|mjs|json|xml|txt|pdf|docx?|xlsx?|pptx?|zip|mp[34]|webm|ogg|wav|woff2?|ttf|otf|eot|map|ics|vcf)$/i;
const CT_EXT = {
  'text/css': '.css', 'text/javascript': '.js', 'application/javascript': '.js', 'application/x-javascript': '.js',
  'application/json': '.json', 'application/ld+json': '.json', 'image/svg+xml': '.svg', 'image/jpeg': '.jpg',
  'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp', 'image/avif': '.avif', 'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico', 'font/woff2': '.woff2', 'font/woff': '.woff', 'application/font-woff2': '.woff2',
  'application/font-woff': '.woff', 'font/ttf': '.ttf', 'application/x-font-ttf': '.ttf', 'font/otf': '.otf',
  'application/pdf': '.pdf', 'text/html': '.html', 'text/plain': '.txt', 'application/xml': '.xml', 'text/xml': '.xml',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'audio/mpeg': '.mp3',
};

// ---------- helpers ----------
const hash8 = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const safeSeg = (seg) => { try { seg = decodeURIComponent(seg); } catch { /* keep raw */ } return seg.replace(/[<>:"\\|?*\x00-\x1f]/g, '_'); };
function parse(u) { try { return new URL(u); } catch { return null; } }
const isHttp = (u) => { const p = parse(u); return !!p && /^https?:$/.test(p.protocol); };
const sameSite = (u) => { const p = parse(u); return !!p && p.hostname.replace(/^www\./, '') === SITE_HOST; };
const normalize = (u) => { const p = new URL(u); p.hash = ''; return p.href; };
const looksLikeAsset = (u) => ASSET_EXT.test(new URL(u).pathname);
const isCrawlablePage = (u) => isHttp(u) && sameSite(u) && !looksLikeAsset(u) && !SKIP_PAGE.some((re) => re.test(u));
const mime = (ct) => (ct || '').split(';')[0].trim().toLowerCase();

/** Map a URL to an output-relative posix path. Pages become dir/index.html; assets keep their name. */
function localPathFor(urlStr, { isPage = false, contentType = '' } = {}) {
  const u = new URL(urlStr);
  const segs = u.pathname.split('/').filter(Boolean).map(safeSeg);
  const prefix = sameSite(urlStr) ? [] : ['_ext', safeSeg(u.hostname)];
  const q = u.search ? `__${hash8(u.search)}` : '';
  if (isPage) {
    const last = segs[segs.length - 1] ?? '';
    const ext = path.posix.extname(last);
    if (last && ext) segs[segs.length - 1] = `${last.slice(0, -ext.length)}${q}.html`;
    else segs.push(`index${q}.html`);
    return path.posix.join(...prefix, ...segs);
  }
  let last = segs.pop() ?? 'index';
  let ext = path.posix.extname(last);
  const ctExt = CT_EXT[mime(contentType)];
  if (!ext && ctExt) { ext = ctExt; last += ctExt; }
  if (q) last = ext ? `${last.slice(0, -ext.length)}${q}${ext}` : `${last}${q}`;
  return path.posix.join(...prefix, ...segs, last);
}

const assets = new Map();   // normalized url -> out-relative path
const assetMeta = new Map(); // out-relative path -> { url, contentType, bytes }
const pages = new Map();    // normalized url -> out-relative path
const pageStatus = new Map(); // normalized url -> HTTP status the page was served with (a 404 page is still mirrored, so dead links on the live site behave the same offline)
const redirects = new Map(); // requested page url -> final url
const failed = [];
const assetQueue = new Map(); // url -> planned path, for assets referenced but not loaded by the browser (favicons, unused srcset candidates, linked PDFs)
const queueAsset = (url) => { if (!assets.has(url) && !assetQueue.has(url)) assetQueue.set(url, localPathFor(url)); };

async function writeOut(rel, data) {
  const abs = path.join(OUT, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, data);
}

async function saveAsset(url, body, contentType) {
  url = normalize(url);
  if (assets.has(url)) return assets.get(url);
  const rel = assetQueue.get(url) ?? localPathFor(url, { contentType });
  assets.set(url, rel);
  assetMeta.set(rel, { url, contentType: mime(contentType), bytes: body.length });
  try { await writeOut(rel, body); } catch (e) { failed.push({ url, error: `write: ${e.message}` }); }
  return rel;
}

function attachResponseCapture(context) {
  context.on('response', async (res) => {
    const req = res.request();
    const url = res.url();
    if (!isHttp(url)) return;
    try {
      const frame = req.frame();
      if (req.resourceType() === 'document' && frame && frame.parentFrame() === null) return; // main page: we snapshot the DOM instead
    } catch { /* detached frame, treat as asset */ }
    const status = res.status();
    if (status < 200 || status >= 300 || status === 204) return;
    let body;
    try { body = await res.body(); } catch { return; }
    const ct = res.headers()['content-type'] ?? '';
    const rel = await saveAsset(url, body, ct);
    for (let r = req.redirectedFrom(); r; r = r.redirectedFrom()) assets.set(normalize(r.url()), rel); // alias redirect chain
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = 700; let y = 0;
    const max = () => document.documentElement.scrollHeight;
    while (y < max() && y < 60000) { y += step; window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
    window.scrollTo(0, 0);
  }).catch(() => {});
}

/** Runs inside the page: every link target, plus every asset URL referenced by markup or CSS text. */
function collectUrls() {
  const base = document.baseURI;
  const abs = (v) => { try { return new URL(v, base).href; } catch { return null; } };
  const refs = new Set();
  const add = (v) => { if (v && !/^(data|blob|javascript|mailto|tel|about):/i.test(v.trim())) { const a = abs(v.trim()); if (a) refs.add(a); } };
  const hrefs = Array.from(document.querySelectorAll('a[href], area[href]')).map((a) => a.href);
  for (const attr of ['src', 'poster', 'data-src', 'data-lazy-src', 'data-bg', 'data-background', 'data-background-image']) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => { if (!(el.tagName === 'IFRAME' && attr === 'src')) add(el.getAttribute(attr)); });
  }
  // srcset per the HTML spec: a URL runs to the next whitespace (so it may contain commas, as Wix image URLs do);
  // descriptors run to the next top-level comma.
  const parseSrcset = (v) => {
    const out = []; const s = v || ''; let i = 0;
    while (i < s.length) {
      while (i < s.length && /[\s,]/.test(s[i])) i++;
      if (i >= s.length) break;
      let start = i; while (i < s.length && !/\s/.test(s[i])) i++;
      let url = s.slice(start, i); let desc = '';
      if (/,$/.test(url)) url = url.replace(/,+$/, '');
      else {
        let depth = 0; start = i;
        while (i < s.length) { const c = s[i]; if (c === '(') depth++; else if (c === ')') depth--; else if (c === ',' && depth === 0) break; i++; }
        desc = s.slice(start, i).trim(); i++;
      }
      if (url) out.push({ url, desc });
    }
    return out;
  };
  for (const attr of ['srcset', 'data-srcset', 'data-lazy-srcset']) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => parseSrcset(el.getAttribute(attr)).forEach((c) => add(c.url)));
  }
  document.querySelectorAll('link[href]').forEach((el) => { if (/stylesheet|icon|preload|prefetch|manifest/i.test(el.rel)) add(el.getAttribute('href')); });
  const cssUrls = (css) => { for (const m of (css || '').matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) add(m[2]); for (const m of (css || '').matchAll(/@import\s+(['"])([^'"]+)\1/g)) add(m[2]); };
  document.querySelectorAll('style').forEach((el) => cssUrls(el.textContent));
  document.querySelectorAll('[style*="url("]').forEach((el) => cssUrls(el.getAttribute('style')));
  return { hrefs, refs: Array.from(refs) };
}

/** Runs inside the page: rewrite every URL we have a local copy of to a relative path, then serialize. */
function rewriteInPage({ assetMap, pageMap, pageDir, strip, dirLinks, sourceUrl }) {
  const base = document.baseURI;
  const rel = (to) => {
    const seg = (p) => p.split('/').filter((x) => x && x !== '.');
    const a = seg(pageDir), b = seg(to);
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return [...Array(a.length - i).fill('..'), ...b.slice(i)].join('/');
  };
  const pageHref = (to) => {
    let r = rel(to);
    if (dirLinks && /(^|\/)index\.html$/.test(r)) r = r.slice(0, -'index.html'.length) || './';
    return r || '.';
  };
  const abs = (v) => { try { const u = new URL(v, base); u.hash = ''; return u.href; } catch { return null; } };
  const hashOf = (v) => { try { return new URL(v, base).hash; } catch { return ''; } };
  const mapAsset = (v) => { if (!v || /^(data|blob|javascript|mailto|tel):/i.test(v.trim())) return null; const a = abs(v); return a && assetMap[a] ? rel(assetMap[a]) : null; };
  // A reference we have no local copy of (fetch failed, or it was never seen) becomes absolute so it still works online
  // once the page has moved directories; hash-only links stay as they are.
  const absolute = (v) => { if (!v || /^(#|data:|blob:|javascript:|mailto:|tel:|sms:|about:)/i.test(v.trim())) return null; try { return new URL(v.trim(), base).href; } catch { return null; } };
  const mapOrAbsolute = (v) => mapAsset(v) ?? absolute(v) ?? v;
  // srcset per the HTML spec: a URL runs to the next whitespace (so it may contain commas, as Wix image URLs do);
  // descriptors run to the next top-level comma.
  const parseSrcset = (v) => {
    const out = []; const s = v || ''; let i = 0;
    while (i < s.length) {
      while (i < s.length && /[\s,]/.test(s[i])) i++;
      if (i >= s.length) break;
      let start = i; while (i < s.length && !/\s/.test(s[i])) i++;
      let url = s.slice(start, i); let desc = '';
      if (/,$/.test(url)) url = url.replace(/,+$/, '');
      else {
        let depth = 0; start = i;
        while (i < s.length) { const c = s[i]; if (c === '(') depth++; else if (c === ')') depth--; else if (c === ',' && depth === 0) break; i++; }
        desc = s.slice(start, i).trim(); i++;
      }
      if (url) out.push({ url, desc });
    }
    return out;
  };
  const rewriteSrcset = (v) => parseSrcset(v).map(({ url, desc }) => mapOrAbsolute(url) + (desc ? ` ${desc}` : '')).join(', ');
  const rewriteCssText = (css) => css
    .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, qch, u) => { const r = mapAsset(u); return r ? `url(${qch}${r}${qch})` : m; })
    .replace(/@import\s+(['"])([^'"]+)\1/g, (m, qch, u) => { const r = mapAsset(u); return r ? `@import ${qch}${r}${qch}` : m; });

  document.querySelectorAll('base').forEach((b) => b.remove());
  if (strip) document.querySelectorAll('script, link[rel="modulepreload"]').forEach((s) => s.remove());

  for (const attr of ['src', 'poster', 'data-src', 'data-lazy-src', 'data-bg', 'data-background', 'data-background-image']) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      if (el.tagName === 'IFRAME' && attr === 'src') return; // third-party embeds stay live
      const v = el.getAttribute(attr); const r = mapOrAbsolute(v); if (r !== v) el.setAttribute(attr, r);
    });
  }
  for (const attr of ['srcset', 'data-srcset', 'data-lazy-srcset']) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => el.setAttribute(attr, rewriteSrcset(el.getAttribute(attr))));
  }
  document.querySelectorAll('link[href]').forEach((el) => { const v = el.getAttribute('href'); const r = mapOrAbsolute(v); if (r !== v) el.setAttribute('href', r); });
  document.querySelectorAll('a[href], area[href]').forEach((el) => {
    const v = el.getAttribute('href'); if (!v || /^(javascript|mailto|tel|sms):/i.test(v.trim())) return;
    if (v.trim() === '' || v.trim().startsWith('#')) return; // already points at this document; rewriting it to the page path makes builders (Webflow) flag it as the current page
    const a = abs(v); if (!a) return;
    if (pageMap[a]) el.setAttribute('href', pageHref(pageMap[a]) + hashOf(v));
    else if (assetMap[a]) el.setAttribute('href', rel(assetMap[a]));
    else { const r = absolute(v); if (r && r !== v) el.setAttribute('href', r); }
  });
  document.querySelectorAll('form[action]').forEach((el) => { const a = abs(el.getAttribute('action')); if (a) el.setAttribute('action', a); }); // submits still hit the real backend
  document.querySelectorAll('[style*="url("]').forEach((el) => el.setAttribute('style', rewriteCssText(el.getAttribute('style'))));
  document.querySelectorAll('style').forEach((el) => { el.textContent = rewriteCssText(el.textContent); });
  document.querySelectorAll('[integrity]').forEach((el) => el.removeAttribute('integrity'));

  return `<!DOCTYPE html>\n<!-- mirrored from ${sourceUrl} on ${new Date().toISOString()} -->\n${document.documentElement.outerHTML}`;
}

async function seedFromSitemaps(context) {
  const seen = new Set(); const found = [];
  const walk = async (u, depth) => {
    if (depth > 2 || seen.has(u)) return; seen.add(u);
    try {
      const r = await context.request.get(u, { timeout: 20000 });
      if (!r.ok()) return;
      const xml = await r.text();
      for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
        const loc = m[1].trim();
        if (/\.xml(\?|$)/i.test(loc)) await walk(loc, depth + 1); else found.push(loc);
      }
    } catch { /* no sitemap */ }
  };
  for (const name of ['sitemap.xml', 'sitemap_index.xml', 'wp-sitemap.xml']) await walk(new URL(`/${name}`, START.origin).href, 0);
  return found;
}

async function crawlPage(context, url) {
  const page = await context.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    const status = resp ? resp.status() : 0;
    const finalUrl = normalize(page.url());
    if (finalUrl !== url) redirects.set(url, finalUrl);
    if (!sameSite(finalUrl)) return [];
    const ct = resp ? resp.headers()['content-type'] ?? '' : '';
    if (resp && !mime(ct).includes('html')) { // e.g. a PDF or image linked as a page
      try { await saveAsset(finalUrl, await resp.body(), ct); } catch (e) { failed.push({ url, error: e.message }); }
      return [];
    }
    if (pages.has(finalUrl)) return [];
    await autoScroll(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);

    const { hrefs, refs } = await page.evaluate(collectUrls);
    const pageMap = {}; const nextPages = [];
    for (const h of hrefs) {
      if (!isHttp(h)) continue;
      const n = normalize(h);
      if (isCrawlablePage(n)) { pageMap[n] = localPathFor(n, { isPage: true }); nextPages.push(n); }
      else if (sameSite(n) && looksLikeAsset(n)) queueAsset(n);
    }
    for (const r of refs) if (isHttp(r)) queueAsset(normalize(r));
    await fetchQueuedAssets(context); // resolve referenced-but-unloaded assets now, so only assets we actually have get local paths
    const rel = localPathFor(finalUrl, { isPage: true });
    pageMap[finalUrl] = rel; pageMap[url] = rel;
    const assetMap = Object.fromEntries(assets);
    const html = await page.evaluate(rewriteInPage, { assetMap, pageMap, pageDir: path.posix.dirname(rel), strip: STRIP_SCRIPTS, dirLinks: DIR_LINKS, sourceUrl: finalUrl });
    await writeOut(rel, html);
    pages.set(finalUrl, rel); pageStatus.set(finalUrl, status);
    console.log(`page  ${finalUrl} -> ${rel}${status >= 400 ? ` [HTTP ${status}]` : ''}`);
    return nextPages;
  } catch (e) {
    failed.push({ url, error: e.message.split('\n')[0] });
    console.warn(`FAIL  ${url}: ${e.message.split('\n')[0]}`);
    return [];
  } finally { await page.close(); }
}

const unfetchable = new Set(); // queued asset urls that failed once; never retried, never rewritten to local paths
async function fetchQueuedAssets(context) {
  for (const url of assetQueue.keys()) {
    if (assets.has(url) || unfetchable.has(url)) continue;
    try {
      const r = await context.request.get(url, { timeout: 60000 });
      if (!r.ok()) { unfetchable.add(url); failed.push({ url, error: `HTTP ${r.status()}` }); continue; }
      await saveAsset(url, await r.body(), r.headers()['content-type'] ?? '');
      console.log(`asset ${url}`);
    } catch (e) { unfetchable.add(url); failed.push({ url, error: e.message.split('\n')[0] }); }
  }
}

/** Second pass over saved CSS files: point url() and @import at local copies. */
async function rewriteCssFiles() {
  for (const [rel, meta] of assetMeta) {
    if (meta.contentType !== 'text/css') continue;
    const abs = path.join(OUT, rel); const dir = path.posix.dirname(rel);
    let css; try { css = await fs.readFile(abs, 'utf8'); } catch { continue; }
    const map = (ref) => {
      if (/^(data|blob):/i.test(ref.trim())) return null;
      let target; try { target = normalize(new URL(ref.trim(), meta.url).href); } catch { return null; }
      const local = assets.get(target);
      return local ? path.posix.relative(dir, local) || '.' : target; // unknown refs become absolute so they still work online
    };
    const out = css
      .replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => { const r = map(u); return r ? `url(${q}${r}${q})` : m; })
      .replace(/@import\s+(['"])([^'"]+)\1/g, (m, q, u) => { const r = map(u); return r ? `@import ${q}${r}${q}` : m; });
    if (out !== css) await fs.writeFile(abs, out);
  }
}

/** For every page URL that redirected to another page, leave a stub so old links keep working. */
async function writeRedirectStubs() {
  for (const [from, to] of redirects) {
    const target = pages.get(to); if (!target) continue;
    const rel = localPathFor(from, { isPage: true });
    if (rel === target) continue;
    try { await fs.access(path.join(OUT, rel)); continue; } catch { /* free to write */ }
    const r = path.posix.relative(path.posix.dirname(rel), target);
    await writeOut(rel, `<!DOCTYPE html>\n<meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${r}"><a href="${r}">${to}</a>\n`);
  }
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); // set CHROMIUM_PATH to use a system Chromium
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: UA, serviceWorkers: 'block' });
  attachResponseCapture(context);

  const startUrl = normalize(START.href);
  const queue = [startUrl, ...(await seedFromSitemaps(context)).filter(isCrawlablePage).map(normalize)];
  const seen = new Set();
  while (queue.length && pages.size < MAX_PAGES) {
    const url = queue.shift();
    if (seen.has(url)) continue; seen.add(url);
    for (const next of await crawlPage(context, url)) if (!seen.has(next)) queue.push(next);
  }
  await fetchQueuedAssets(context);
  await context.close(); await browser.close();

  await rewriteCssFiles();
  await writeRedirectStubs();
  const manifest = {
    source: START.href, crawledAt: new Date().toISOString(), pageCount: pages.size, assetCount: assets.size,
    pages: Object.fromEntries(pages), pageStatus: Object.fromEntries(pageStatus), redirects: Object.fromEntries(redirects),
    assets: Object.fromEntries([...assetMeta].map(([rel, m]) => [m.url, { path: rel, contentType: m.contentType, bytes: m.bytes }])),
    failed, unvisited: queue.length,
  };
  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const errorPages = [...pageStatus].filter(([, s]) => s >= 400).length;
  console.log(`\ndone: ${pages.size} pages${errorPages ? ` (${errorPages} served with HTTP 4xx/5xx, see manifest.pageStatus)` : ''}, ${assets.size} assets, ${failed.length} failures${queue.length ? `, ${queue.length} pages left (raise --max-pages)` : ''}\noutput: ${OUT}`);
  if (failed.length) console.log('failures:', failed.slice(0, 20));
}

main().catch((e) => { console.error(e); process.exit(1); });

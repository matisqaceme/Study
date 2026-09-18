#!/usr/bin/env node
// Join a desktop capture and a mobile capture of the same site so that phones get the mobile pages.
// Usage: node link-variants.mjs <desktopDir> <mobileSubdir>   e.g. node link-variants.mjs sites/owldental.ie m
//
// Sites like Wix serve a different HTML document to phones, chosen by User-Agent on the server. A static
// host cannot do that, so every page in both trees gets a tiny inline script, first in <head>, that
// sends a phone/tablet user agent from /<path> to /<mobileSubdir>/<path> and a desktop one the other way.
// The choice is by user agent, like the origin's, so narrowing a desktop window does not switch layouts.
import fs from 'node:fs/promises';
import path from 'node:path';

const [desktopDir, mobileSub] = process.argv.slice(2);
if (!desktopDir || !mobileSub) { console.error('usage: node link-variants.mjs <desktopDir> <mobileSubdir>'); process.exit(2); }
const DESKTOP = path.resolve(desktopDir);
const MOBILE = path.join(DESKTOP, mobileSub);
const MARK = 'data-variant-switch';
const RE_MOBILE = '/Mobi|Android|iPhone|iPad|iPod|Silk|Kindle|Opera Mini|Windows Phone/i';

// `root` is the URL prefix that this tree is served at, relative to the site root ('' for desktop, '/m' for mobile).
const snippet = (toMobile) => `<script ${MARK}>(function(){var m=${RE_MOBILE}.test(navigator.userAgent);var p=location.pathname;` +
  (toMobile
    ? `if(m&&p.indexOf('/${mobileSub}/')!==0&&p!=='/${mobileSub}')location.replace('/${mobileSub}'+(p==='/'?'/':p)+location.search+location.hash);`
    : `if(!m&&(p.indexOf('/${mobileSub}/')===0||p==='/${mobileSub}'))location.replace((p.slice(${mobileSub.length + 1})||'/')+location.search+location.hash);`) +
  `})();</script>`;

async function listHtml(dir, skip, acc = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (p !== skip && e.name !== '_ext') await listHtml(p, skip, acc); }
    else if (/\.html?$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

async function inject(files, script) {
  let n = 0;
  for (const f of files) {
    let html = await fs.readFile(f, 'utf8');
    html = html.replace(new RegExp(`<script ${MARK}>.*?</script>`, 's'), ''); // idempotent
    if (!/<head[^>]*>/i.test(html)) continue; // redirect stubs and fragments
    html = html.replace(/<head[^>]*>/i, (m) => `${m}${script}`);
    await fs.writeFile(f, html); n++;
  }
  return n;
}

const d = await inject(await listHtml(DESKTOP, MOBILE), snippet(true));
const m = await inject(await listHtml(MOBILE, null), snippet(false));
console.log(`variant switch added to ${d} desktop pages and ${m} mobile pages (${path.relative(process.cwd(), MOBILE)})`);

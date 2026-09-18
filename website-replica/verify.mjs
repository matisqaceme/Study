#!/usr/bin/env node
// Serve the mirror locally, open every HTML page in Chromium, and report any request that fails
// or leaves the local server (i.e. anything the mirror did not capture). Usage: node verify.mjs <dir> [port]
//
// A failed request counts as BROKEN when the mirror should have served it: anything requested from the local
// server, or a document/script/stylesheet/image/font/media file on another host. Failed background calls to
// third-party services (analytics beacons, tracking pings, XHR from embeds) are listed separately and do not
// fail the run: they fail the same way on the live site or are outside what a static copy can control.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { startServer } from './serve.mjs';

const DIR = path.resolve(process.argv[2] ?? 'site');
const PORT = Number(process.argv[3] ?? 8091);
const ORIGIN = `http://127.0.0.1:${PORT}`;

async function listHtml(dir, acc = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await listHtml(p, acc); else if (/\.html?$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

const server = await startServer(PORT, '127.0.0.1');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); // set CHROMIUM_PATH to use a system Chromium
const page = await browser.newPage();
const problems = []; let external = 0; let requests = 0;
page.on('request', (r) => { requests++; if (!r.url().startsWith(ORIGIN)) external++; });
page.on('requestfailed', (r) => problems.push({ page: page.url(), url: r.url(), error: r.failure()?.errorText, type: r.resourceType() }));
page.on('response', (r) => { if (r.status() >= 400) problems.push({ page: page.url(), url: r.url(), error: `HTTP ${r.status()}`, type: r.request().resourceType() }); });

const files = await listHtml(DIR);
for (const f of files) {
  const url = `${ORIGIN}/${path.relative(DIR, f).split(path.sep).join('/')}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => problems.push({ page: url, error: e.message.split('\n')[0] }));
}
await browser.close(); server.close();

const BACKGROUND = new Set(['fetch', 'xhr', 'ping', 'beacon', 'websocket', 'eventsource', 'other']);
const isBroken = (p) => !p.url || p.url.startsWith(ORIGIN) || !BACKGROUND.has(p.type);
const broken = problems.filter(isBroken);
const thirdParty = problems.filter((p) => !isBroken(p));
const grouped = new Map();
for (const p of thirdParty) { const k = `${p.error}  ${p.url.split('?')[0]}`; grouped.set(k, (grouped.get(k) ?? 0) + 1); }

console.log(`${files.length} pages, ${requests} requests, ${external} to other hosts, ${broken.length} broken, ${thirdParty.length} failed third-party background calls`);
for (const p of broken.slice(0, 100)) console.log(`  BROKEN  ${p.error}  ${p.url ?? ''}  (on ${p.page})`);
for (const [k, n] of [...grouped].sort((a, b) => b[1] - a[1])) console.log(`  third-party  ${n}x  ${k}`);
process.exit(broken.length ? 1 : 0);

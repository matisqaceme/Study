#!/usr/bin/env node
// Serve the mirror locally, open every HTML page in Chromium, and report any request that fails
// or leaves the local server (i.e. anything the mirror did not capture). Usage: node verify.mjs <dir> [port]
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
page.on('requestfailed', (r) => problems.push({ page: page.url(), url: r.url(), error: r.failure()?.errorText }));
page.on('response', (r) => { if (r.status() >= 400) problems.push({ page: page.url(), url: r.url(), error: `HTTP ${r.status()}` }); });

const files = await listHtml(DIR);
for (const f of files) {
  const url = `${ORIGIN}/${path.relative(DIR, f).split(path.sep).join('/')}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => problems.push({ page: url, error: e.message.split('\n')[0] }));
}
await browser.close(); server.close();

console.log(`${files.length} pages, ${requests} requests, ${external} to other hosts, ${problems.length} broken`);
for (const p of problems.slice(0, 50)) console.log(`  ${p.error}  ${p.url ?? ''}  (on ${p.page})`);
process.exit(problems.length ? 1 : 0);

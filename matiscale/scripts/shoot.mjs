// Visual review harness: serves dist/, captures sectioned screenshots at
// desktop + mobile sizes, and reports console errors. Not part of the site —
// run `npm i -D puppeteer` first, then `npm run build && node scripts/shoot.mjs`.
import puppeteer from 'puppeteer'
import { mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const PORT = 4173
const ROOT = new URL('../dist', import.meta.url).pathname
const OUT = new URL('../shots', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (req, res) => {
  let path = req.url.split('?')[0]
  if (path === '/') path = '/index.html'
  try {
    const data = await readFile(join(ROOT, path))
    res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end()
  }
})
await new Promise((r) => server.listen(PORT, r))

const browser = await puppeteer.launch({
  acceptInsecureCerts: true,
  args: [
    '--no-sandbox',
    '--ignore-certificate-errors',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
})

async function shoot(name, { width, height, mobile = false, query = '', scrolls = [] }) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 })
  await page.goto(`http://localhost:${PORT}/${query}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 2500))
  await page.screenshot({ path: `${OUT}/${name}-hero.png` })
  for (const [label, y] of scrolls) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y)
    await new Promise((r) => setTimeout(r, 1600))
    await page.screenshot({ path: `${OUT}/${name}-${label}.png` })
  }
  const docH = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log(`${name}: page height ${docH}px, console errors: ${errors.length}`)
  errors.forEach((e) => console.log('  ERR:', e.slice(0, 200)))
  await page.close()
  return docH
}

const desktopH = await shoot('desktop', {
  width: 1440,
  height: 900,
  query: '?force3d',
  scrolls: [],
})
// section shots driven by fraction of page height
const fr = (f) => Math.round(desktopH * f)
await shoot('desktop2', {
  width: 1440,
  height: 900,
  query: '?force3d',
  scrolls: [
    ['proof', 800],
    ['problem', fr(0.22)],
    ['approach', fr(0.36)],
    ['guarantee', fr(0.55)],
    ['whofor', fr(0.68)],
    ['finale', desktopH - 900 - 200],
    ['footer', desktopH],
  ],
})
await shoot('mobile', {
  width: 390,
  height: 844,
  mobile: true,
  scrolls: [
    ['proof', 900],
    ['guarantee', fr(0.55)],
    ['footer', 99999],
  ],
})

await browser.close()
server.close()
console.log('done')

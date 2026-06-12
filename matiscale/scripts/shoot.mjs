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
  for (const [label, target] of scrolls) {
    await page.evaluate((t) => {
      if (typeof t === 'number') window.scrollTo({ top: t, behavior: 'instant' })
      else document.querySelector(t)?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }, target)
    if (label === 'faq') {
      await page.evaluate(() => {
        document.querySelectorAll('.faq-item').forEach((d, i) => { if (i < 2) d.open = true })
      })
    }
    await new Promise((r) => setTimeout(r, 1600))
    await page.screenshot({ path: `${OUT}/${name}-${label}.png` })
  }
  const docH = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log(`${name}: page height ${docH}px, console errors: ${errors.length}`)
  errors.forEach((e) => console.log('  ERR:', e.slice(0, 200)))
  await page.close()
  return docH
}

await shoot('desktop', {
  width: 1440,
  height: 900,
  scrolls: [],
})
await shoot('desktop2', {
  width: 1440,
  height: 900,
  scrolls: [
    ['proof', 800],
    ['problem', '.problem'],
    ['approach', '#approach'],
    ['compare', '#compare'],
    ['guarantee', '#guarantee'],
    ['quotes', '.quotes'],
    ['whofor', '.whofor'],
    ['faq', '#faq'],
    ['finale', '#contact'],
    ['footer', 999999],
  ],
})
await shoot('mobile', {
  width: 390,
  height: 844,
  mobile: true,
  scrolls: [
    ['proof', 900],
    ['compare', '#compare'],
    ['guarantee', '#guarantee'],
    ['faq', '#faq'],
    ['finale', '#contact'],
    ['footer', 999999],
  ],
})

await browser.close()
server.close()
console.log('done')

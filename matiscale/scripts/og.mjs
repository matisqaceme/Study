// One-off generator for public/og.png (1200x630 link-share image).
// Run: npm i -D puppeteer && node scripts/og.mjs && npm un puppeteer
import puppeteer from 'puppeteer'

const OUT = new URL('../public/og.png', import.meta.url).pathname

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
    background:
      radial-gradient(55% 80% at 88% -10%, #C5DCFF, rgba(220,235,255,0) 70%),
      radial-gradient(45% 70% at -5% 25%, #E7F0FF, rgba(231,240,255,0) 70%),
      radial-gradient(50% 60% at 70% 115%, rgba(90,168,255,0.35), rgba(255,255,255,0) 70%),
      #ffffff;
    color: #0B1220;
    padding: 72px 80px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 16px; font-weight: 700; font-size: 34px; letter-spacing: -0.01em; }
  h1 { font-weight: 700; font-size: 95px; line-height: 1.04; letter-spacing: -0.03em; }
  h1 em { font-style: normal; color: #2772FF; }
  .sub { font-weight: 500; font-size: 30px; line-height: 1.4; color: #51606F; max-width: 30ch; }
</style></head>
<body>
  <div class="brand">
    <svg width="44" height="44" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="none" stroke="#2772FF" stroke-width="6"/>
      <circle cx="32" cy="32" r="7" fill="#2772FF"/>
    </svg>
    Matiscale
  </div>
  <h1>We book your<br><em>next clients.</em></h1>
  <div class="sub">5 qualified meetings in your first 30 days, or we work free until you get them.</div>
</body></html>`

const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {})
await new Promise((r) => setTimeout(r, 800))
await page.screenshot({ path: OUT })
await browser.close()
console.log('wrote', OUT)

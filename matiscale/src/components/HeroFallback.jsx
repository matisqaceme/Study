import { useEffect, useRef } from 'react'

/**
 * Static stand-in for the WebGL field: painted once to a canvas,
 * echoing the gold particle band so low-power devices still get
 * the same composition — just without the motion.
 */
export default function HeroFallback() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const paint = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth: w, clientHeight: h } = canvas
      if (!w || !h) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      ctx.fillStyle = '#0A0A0C'
      ctx.fillRect(0, 0, w, h)

      const slate = ctx.createRadialGradient(
        w * 0.22, h * 0.18, 0,
        w * 0.22, h * 0.18, Math.max(w, h) * 0.55,
      )
      slate.addColorStop(0, 'rgba(91, 107, 115, 0.10)')
      slate.addColorStop(1, 'rgba(91, 107, 115, 0)')
      ctx.fillStyle = slate
      ctx.fillRect(0, 0, w, h)

      const gold = ctx.createRadialGradient(
        w * 0.68, h * 0.62, 0,
        w * 0.68, h * 0.62, Math.max(w, h) * 0.6,
      )
      gold.addColorStop(0, 'rgba(201, 168, 106, 0.14)')
      gold.addColorStop(0.55, 'rgba(201, 168, 106, 0.05)')
      gold.addColorStop(1, 'rgba(201, 168, 106, 0)')
      ctx.fillStyle = gold
      ctx.fillRect(0, 0, w, h)

      // A quiet scatter of gold points along the lower band.
      const seedRandom = (() => {
        let s = 42
        return () => {
          s = (s * 16807) % 2147483647
          return s / 2147483647
        }
      })()
      for (let i = 0; i < 220; i += 1) {
        const x = seedRandom() * w
        const yBase = h * 0.62
        const y = yBase + (seedRandom() - 0.35) * h * 0.34
        const a = 0.04 + seedRandom() * 0.3
        const rPt = 0.5 + seedRandom() * 1.1
        ctx.beginPath()
        ctx.arc(x, y, rPt, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 106, ${a.toFixed(3)})`
        ctx.fill()
      }
    }

    paint()
    let frame = 0
    const onResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(paint)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-fallback" aria-hidden="true" />
}

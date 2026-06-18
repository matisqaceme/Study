import { useEffect, useRef } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../lib/capabilities.js'

const INTERACTIVE = 'a, button, [data-cursor]'

export default function Cursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    // Touch devices keep their native behaviour; the elements simply
    // stay invisible (and are display:none via the coarse-pointer query).
    if (!hasFinePointer()) return undefined
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return undefined

    document.documentElement.classList.add('has-cursor')

    const instant = prefersReducedMotion()
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let ringX = targetX
    let ringY = targetY
    let targetScale = 1
    let scale = 1
    let shown = false
    let raf = 0

    const onMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!shown) {
        shown = true
        ringX = targetX
        ringY = targetY
        ring.style.opacity = '1'
        dot.style.opacity = '1'
      }
    }
    const onOver = (e) => {
      targetScale = e.target.closest?.(INTERACTIVE) ? 1.9 : 1
    }
    const onLeave = () => {
      shown = false
      ring.style.opacity = '0'
      dot.style.opacity = '0'
    }

    const tick = () => {
      const follow = instant ? 1 : 0.16
      ringX += (targetX - ringX) * follow
      ringY += (targetY - ringY) * follow
      scale += (targetScale - scale) * (instant ? 1 : 0.14)
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}

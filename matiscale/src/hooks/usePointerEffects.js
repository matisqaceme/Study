import { useEffect } from 'react'
import gsap from 'gsap'
import { hasFinePointer, prefersReducedMotion } from '../lib/capabilities.js'

/**
 * Buttons lean a few px toward the cursor while hovered and spring back
 * on leave. Fine pointers only; skipped under reduced motion.
 */
export function useMagneticButtons(strength = 0.22) {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return undefined

    const cleanups = Array.from(document.querySelectorAll('.btn')).map((btn) => {
      // gsap owns the transform from here on; keep CSS from fighting it.
      btn.classList.add('btn--magnetic')
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' })

      const onMove = (e) => {
        const r = btn.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * strength)
        yTo((e.clientY - (r.top + r.height / 2)) * strength)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }
      btn.addEventListener('pointermove', onMove, { passive: true })
      btn.addEventListener('pointerleave', onLeave)
      return () => {
        btn.removeEventListener('pointermove', onMove)
        btn.removeEventListener('pointerleave', onLeave)
        btn.classList.remove('btn--magnetic')
      }
    })

    return () => cleanups.forEach((fn) => fn())
  }, [strength])
}

/**
 * Feeds the cursor position into --mx/--my on whichever .card the
 * pointer is over; CSS paints a soft azure glow there (see .card::after).
 */
export function useCardGlow() {
  useEffect(() => {
    if (!hasFinePointer()) return undefined

    const onMove = (e) => {
      const card = e.target.closest?.('.card')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])
}

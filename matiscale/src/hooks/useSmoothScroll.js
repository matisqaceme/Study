import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { hasFinePointer, prefersReducedMotion } from '../lib/capabilities.js'

gsap.registerPlugin(ScrollTrigger)

// Roughly the fixed pill-nav height plus its top gap, so anchored sections
// don't tuck under the bar when we scroll to them.
const NAV_OFFSET = 88

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so there is a single
 * rAF loop kept in lockstep with ScrollTrigger. Initialized once from App.
 *
 * Skipped entirely on touch devices and under reduced motion: those
 * cohorts keep native scrolling and the CSS scroll-behavior anchor jumps.
 */
export function useSmoothScroll() {
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return undefined

    // autoRaf:false — we own the rAF loop via gsap.ticker (below).
    const lenis = new Lenis({ autoRaf: false })
    // Handle for programmatic callers (e.g. the screenshot harness) so they
    // scroll through Lenis instead of fighting its rAF loop.
    window.__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // In-page links: let Lenis own the scroll so the motion matches the wheel.
    const onAnchorClick = (e) => {
      const link = e.target.closest?.('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute('href')
      if (!hash || hash === '#') return
      const target =
        hash === '#top'
          ? document.body
          : document.querySelector(hash)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -NAV_OFFSET })
      if (typeof target.focus === 'function') {
        target.focus({ preventScroll: true })
      }
    }
    document.addEventListener('click', onAnchorClick)

    // Recompute trigger positions against the active scroller, one frame on.
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(refreshId)
      document.removeEventListener('click', onAnchorClick)
      gsap.ticker.remove(onTick)
      gsap.ticker.lagSmoothing(1000, 16)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

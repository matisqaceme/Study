import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/capabilities.js'

gsap.registerPlugin(ScrollTrigger)

export const EASE = 'power3.out'

/**
 * Reveals every [data-reveal] descendant of the scoped element as it
 * scrolls into view. Elements are only hidden from inside the effect,
 * so without JS (or with reduced motion) everything stays visible.
 *
 *   data-reveal          fade + rise
 *   data-reveal="line"   hairline draws in from the left
 */
export function useSectionReveal(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope || prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      scope.querySelectorAll('[data-reveal]').forEach((el) => {
        const delay = parseFloat(el.dataset.delay || '0')
        if (el.dataset.reveal === 'line') {
          gsap.fromTo(
            el,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 1.2,
              delay,
              ease: EASE,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            },
          )
        } else {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              delay,
              ease: EASE,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        }
      })
    }, scope)

    return () => ctx.revert()
  }, [scopeRef])
}

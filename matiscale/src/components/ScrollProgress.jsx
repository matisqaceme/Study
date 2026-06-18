import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/capabilities.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * A slim progress bar pinned to the very top of the page; its scaleX
 * tracks how far the document has been scrolled. Position-mapped, not
 * "motion", but we still skip it under reduced motion to stay quiet.
 */
export default function ScrollProgress() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const bar = ref.current
    if (!bar || prefersReducedMotion()) return undefined

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    })

    return () => st.kill()
  }, [])

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}

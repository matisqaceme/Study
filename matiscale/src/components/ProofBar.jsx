import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/capabilities.js'
import Marquee from './Marquee.jsx'

gsap.registerPlugin(ScrollTrigger)

const METRICS = [
  { value: 5, unit: '', label: 'meetings guaranteed / month' },
  { value: 48, unit: 'hr', label: 'onboarding' },
  { value: 100, unit: '%', label: 'done-for-you' },
]

export default function ProofBar() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el || prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      const numbers = gsap.utils.toArray('[data-count]')
      numbers.forEach((num) => {
        const target = parseInt(num.dataset.count, 10)
        const proxy = { value: 0 }
        gsap.to(proxy, {
          value: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          onUpdate: () => {
            num.textContent = String(Math.round(proxy.value))
          },
        })
      })
      gsap.fromTo(
        '.metric',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section className="proof" id="work" ref={sectionRef}>
      <div className="container">
        <div className="proof-grid">
          {METRICS.map((m) => (
            <div className="metric" key={m.label}>
              <span className="metric-value mono">
                <span
                  data-count={m.value}
                  style={{ minWidth: `${String(m.value).length}ch` }}
                >
                  {m.value}
                </span>
                {m.unit && <span className="metric-unit">{m.unit}</span>}
              </span>
              <span className="metric-label">{m.label}</span>
            </div>
          ))}
        </div>
        <Marquee />
      </div>
    </section>
  )
}

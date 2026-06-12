import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/capabilities.js'
import HeroAura from './HeroAura.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef(null)

  useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el || prefersReducedMotion()) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        delay: 0.25,
      })
      tl.fromTo(
        '.hero-line-inner',
        { yPercent: 112 },
        { yPercent: 0, duration: 1.25, stagger: 0.13 },
      )
        .fromTo(
          ['.hero-sub', '.hero-actions'],
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 1.0, stagger: 0.12 },
          '-=0.75',
        )
        .fromTo(
          // The nav lives outside this section, so resolve it directly.
          [document.querySelector('.nav'), '.hero-foot'].filter(Boolean),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.2 },
          '-=0.6',
        )

      // The scroll cue has done its job once scrolling starts;
      // fade it before it can brush against the fixed nav.
      gsap.to('.hero-foot', {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top-=40',
          end: 'top top-=260',
          scrub: true,
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <HeroAura />

      <div className="container hero-inner">
        <h1 className="hero-title">
          <span className="hero-line">
            <span className="hero-line-inner">We book your</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner">
              <em>next clients.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Done-for-you outbound that puts qualified meetings on your calendar
          — guaranteed.
        </p>
        <div className="hero-actions">
          <a className="btn" href="#contact">
            Book a call
          </a>
          <span className="hero-note mono">30 minutes. No obligation.</span>
        </div>
      </div>

      <div className="hero-foot" aria-hidden="true">
        <span className="mono">Scroll</span>
        <span className="hero-foot-line" />
      </div>
    </section>
  )
}

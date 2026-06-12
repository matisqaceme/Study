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
        .fromTo(
          '.hero-underline path',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
          '-=1.1',
        )

      // The aura recedes slower than the page scrolls: cheap depth.
      gsap.to('.aura', {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

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
              <em className="hero-em">
                next clients.
                <svg
                  className="hero-underline"
                  viewBox="0 0 340 14"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10 C 70 4, 150 3, 205 6 C 255 8.5, 305 8, 335 4.5"
                    pathLength="1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Done-for-you outbound for staffing firms and B2B companies. We find
          your buyers, reach them personally, and book qualified meetings
          straight into your calendar. 5 in your first 30 days, guaranteed.
        </p>
        <div className="hero-actions">
          <a className="btn" href="#contact">
            Book a call
          </a>
          <span className="hero-note mono">Live within days. No work on your side.</span>
        </div>
      </div>

      <div className="hero-foot" aria-hidden="true">
        <span className="mono">Scroll</span>
        <span className="hero-foot-line" />
      </div>
    </section>
  )
}

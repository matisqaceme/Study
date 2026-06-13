import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EASE } from '../hooks/useReveal.js'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    n: '01',
    title: 'We build your list',
    body: 'We find the exact decision-makers worth reaching, using live signals like hiring activity and growth so the timing is right.',
  },
  {
    n: '02',
    title: 'We send the cold emails',
    body: 'Every email is personalized and sent from dedicated, deliverability-optimized inboxes so it lands in the inbox and gets replies.',
  },
  {
    n: '03',
    title: 'We book the meetings',
    body: 'We handle every reply, qualify each prospect, and put confirmed meetings on your calendar.',
  },
]

export default function Approach() {
  const ref = useRef(null)

  // gsap.matchMedia is the single owner of these elements, so the desktop
  // pin and the mobile reveal never fight over the same nodes.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const mm = gsap.matchMedia(el)

    // Desktop, motion allowed: pin the section and scrub step focus. We drive
    // a single proxy value and compute each step's emphasis from its distance
    // to the active position — deterministic, no immediateRender guesswork.
    mm.add('(min-width: 64rem) and (prefers-reduced-motion: no-preference)', () => {
      const steps = gsap.utils.toArray('.step', el)
      const rules = steps.map((s) => s.querySelector('.step-rule'))
      const n = steps.length
      gsap.set(steps, { autoAlpha: 1, y: 0 })
      gsap.set(rules, { transformOrigin: 'left center' })

      const proxy = { p: 0 }
      const applyFocus = () => {
        const pos = proxy.p * (n - 1)
        steps.forEach((step, i) => {
          const dist = Math.abs(pos - i)
          gsap.set(step, { opacity: gsap.utils.clamp(0.3, 1, 1 - dist * 0.7) })
          gsap.set(rules[i], { scaleX: gsap.utils.clamp(0, 1, 1 - dist) })
        })
      }
      applyFocus()

      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        onUpdate: applyFocus,
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => '+=' + window.innerHeight * (n - 1),
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    })

    // Smaller screens, motion allowed: reveal each piece on scroll-in.
    mm.add('(max-width: 63.99rem) and (prefers-reduced-motion: no-preference)', () => {
      el.querySelectorAll('[data-reveal]').forEach((node) => {
        const delay = parseFloat(node.dataset.delay || '0')
        if (node.dataset.reveal === 'line') {
          gsap.fromTo(
            node,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 1.2,
              delay,
              ease: EASE,
              scrollTrigger: { trigger: node, start: 'top 88%', once: true },
            },
          )
        } else {
          gsap.fromTo(
            node,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              delay,
              ease: EASE,
              scrollTrigger: { trigger: node, start: 'top 85%', once: true },
            },
          )
        }
      })
    })

    // Reduced motion (any width): everything stays put, fully visible.

    return () => mm.revert()
  }, [])

  return (
    <section className="approach" id="approach" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          How Matiscale works
        </span>
        <div className="approach-steps">
          {STEPS.map((step) => (
            <article className="step" key={step.n}>
              <span className="step-rule" data-reveal="line" />
              <div className="step-row">
                <span className="step-n mono" data-reveal>
                  {step.n}
                </span>
                <h3 className="step-title" data-reveal data-delay="0.08">
                  {step.title}
                </h3>
                <p className="step-body" data-reveal data-delay="0.16">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/capabilities.js'

gsap.registerPlugin(ScrollTrigger)

const LEADS = [
  { name: 62, co: 40 },
  { name: 52, co: 34 },
  { name: 68, co: 44 },
]

// The calendar cell that fills with a booked call (index into a 10-cell grid).
const BOOKED_CELL = 7

export default function InboxDemo() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    // Markup renders the finished state; without motion it simply stays there.
    if (!el || prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

      tl.set('.lead-check', { scale: 0, autoAlpha: 0 })
        .set('.id-email-line', { scaleX: 0, transformOrigin: 'left center' })
        .set('.id-reply', { autoAlpha: 0, y: 10 })
        .set('.id-send-fill', { scaleX: 0, transformOrigin: 'left center' })
        .set('.id-booked', { autoAlpha: 0, scale: 0.6 })
        .set('.lead-row', { autoAlpha: 0, y: 14 })

      tl.to('.lead-row', { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 })
        .to('.id-send-fill', { scaleX: 1, duration: 0.7 }, '-=0.1')
        .to(
          '.lead-check',
          { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(2)' },
          '-=0.5',
        )
        .to('.id-email-line', { scaleX: 1, duration: 0.45, stagger: 0.12 }, '+=0.1')
        .to('.id-reply', { autoAlpha: 1, y: 0, duration: 0.5 }, '+=0.05')
        .to(
          '.id-booked',
          { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)' },
          '+=0.15',
        )

      ScrollTrigger.create({
        trigger: el,
        start: 'top 72%',
        onEnter: () => tl.restart(),
        onEnterBack: () => tl.restart(),
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section className="inbox" id="inbox" ref={ref}>
      <div className="container">
        <span className="kicker mono">See it work</span>
        <h2 className="inbox-title">From cold email to a booked call.</h2>
        <p className="inbox-sub">
          We send. They reply. The meeting lands on your calendar. You do none of it.
        </p>

        <div className="inbox-grid">
          {/* 1 — Prospects we reach */}
          <article className="inbox-stage">
            <span className="inbox-step mono">01 / Prospects</span>
            <div className="vis vis-leads" aria-hidden="true">
              {LEADS.map((lead, i) => (
                <div className="lead-row" key={i}>
                  <span className="lead-avatar" />
                  <span className="lead-lines">
                    <span
                      className="lead-line lead-line--name"
                      style={{ width: `${lead.name}%` }}
                    />
                    <span
                      className="lead-line lead-line--co"
                      style={{ width: `${lead.co}%` }}
                    />
                  </span>
                  <span className="lead-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 12.5l5.5 5.5L20 6.5"
                      />
                    </svg>
                  </span>
                </div>
              ))}
              <span className="id-send" aria-hidden="true">
                <span className="id-send-fill" />
              </span>
            </div>
          </article>

          {/* 2 — The email + reply */}
          <article className="inbox-stage">
            <span className="inbox-step mono">02 / Reply</span>
            <div className="vis vis-email" aria-hidden="true">
              <div className="email-meta">
                <span className="email-row">
                  <span className="email-key">To:</span> Head of Talent
                </span>
                <span className="email-row">
                  <span className="email-key">Subject:</span> a faster way to fill that req
                </span>
              </div>
              <span className="email-line id-email-line" />
              <span className="email-line email-line--short id-email-line" />
              <span className="email-reply id-reply">
                <span className="email-reply-dot" />
                Reply received
              </span>
            </div>
          </article>

          {/* 3 — The meeting on the calendar */}
          <article className="inbox-stage">
            <span className="inbox-step mono">03 / Meeting</span>
            <div className="vis vis-cal" aria-hidden="true">
              <div className="cal-days">
                {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                  <span className="cal-day mono" key={d + i}>
                    {d}
                  </span>
                ))}
              </div>
              <div className="cal-grid">
                {Array.from({ length: 10 }, (_, i) =>
                  i === BOOKED_CELL ? (
                    <span className="cal-cell cal-cell--booked id-booked" key={i}>
                      Call
                    </span>
                  ) : (
                    <span className="cal-cell" key={i} />
                  ),
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

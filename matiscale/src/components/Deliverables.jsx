import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const BOOKED_CELLS = [3, 7, 9]

export default function Deliverables() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="service" id="service" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          What you get
        </span>
        <h2 className="service-title" data-reveal>
          Not reports. <em>Booked meetings.</em>
        </h2>
        <p className="service-sub" data-reveal data-delay="0.1">
          One deliverable: meetings. Nothing else.
        </p>

        <div className="service-grid">
          <article className="card service-card" data-reveal>
            <div className="vis vis-leads" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div className="lead-row" key={i}>
                  <span className="lead-avatar" />
                  <span className="lead-lines">
                    <span className="lead-line lead-line--name" />
                    <span className="lead-line lead-line--co" />
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
            </div>
            <span className="service-step mono">01 / Research</span>
            <h3 className="service-card-title">A targeted list of your exact buyers</h3>
            <p className="service-card-body">
              The decision-makers worth reaching, picked on live signals: hiring, growth, funding.
            </p>
          </article>

          <article className="card service-card" data-reveal data-delay="0.12">
            <div className="vis vis-email" aria-hidden="true">
              <div className="email-meta">
                <span className="email-row">
                  <span className="email-key">To:</span> Head of Operations
                </span>
                <span className="email-row">
                  <span className="email-key">Subject:</span> quick question about Q3
                </span>
              </div>
              <span className="email-line" />
              <span className="email-line email-line--short" />
              <span className="email-reply">
                <span className="email-reply-dot" />
                Reply received
              </span>
            </div>
            <span className="service-step mono">02 / Outreach</span>
            <h3 className="service-card-title">Outreach that lands and gets replies</h3>
            <p className="service-card-body">
              Personalized messages from a dedicated, deliverability-optimized setup. No blasts.
            </p>
          </article>

          <article className="card service-card" data-reveal data-delay="0.24">
            <div className="vis vis-cal" aria-hidden="true">
              <div className="cal-days">
                {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
                  <span className="cal-day mono" key={d + i}>
                    {d}
                  </span>
                ))}
              </div>
              <div className="cal-grid">
                {Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    className={`cal-cell${BOOKED_CELLS.includes(i) ? ' cal-cell--booked' : ''}`}
                  >
                    {BOOKED_CELLS.includes(i) ? 'Call' : ''}
                  </span>
                ))}
              </div>
            </div>
            <span className="service-step mono">03 / Meetings</span>
            <h3 className="service-card-title">Qualified meetings on your calendar</h3>
            <p className="service-card-body">
              We handle every reply and qualify each prospect. You just show up and close.
            </p>
          </article>
        </div>

        {/*
          RESULTS SCREENSHOT. Drop the real image at public/results.png
          (PNG or JPG, ~1600px wide works best), then un-comment:

          <figure className="service-proof" data-reveal>
            <img src="/results.png" alt="A client calendar filled with booked meetings" loading="lazy" />
            <figcaption className="mono">A real client calendar, 30 days in</figcaption>
          </figure>
        */}
      </div>
    </section>
  )
}

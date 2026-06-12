import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'
import BrandMark from './BrandMark.jsx'

export default function FinalCta() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="finale" id="contact" ref={ref}>
      <div className="container finale-inner">
        <span className="kicker mono" data-reveal>
          Book a call
        </span>
        <h2 className="finale-title" data-reveal>
          Ready to fill your calendar?
        </h2>
        <div className="book-panel" data-reveal data-delay="0.15">
          {/*
            CALENDLY: when the booking link exists, replace the
            .book-placeholder div below with the inline embed:

            <iframe
              className="book-embed"
              src="https://calendly.com/YOUR-LINK?hide_gdpr_banner=1"
              title="Book a call with Matiscale"
            />
          */}
          <div className="book-placeholder">
            <span className="book-glyph">
              <BrandMark size={30} />
            </span>
            <p className="book-lead">What happens on the call</p>
            <ul className="book-points">
              <li>We map who you sell to and whether outbound fits.</li>
              <li>You get the exact plan and the exact price.</li>
              <li>No pressure. If we are not a fit, we say so.</li>
            </ul>
            <p className="book-sub">
              Online booking is coming soon. Until then, reach us directly.
              We reply within one business day.
            </p>
            <a className="btn" href="mailto:hello@matiscale.com">
              Email hello@matiscale.com
            </a>
            <span className="book-note mono">30 minutes. No obligation.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

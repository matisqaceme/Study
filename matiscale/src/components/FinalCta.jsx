import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

export default function FinalCta() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="finale" id="contact" ref={ref}>
      <div className="container finale-inner">
        <h2 className="finale-title" data-reveal>
          Ready to fill your calendar?
        </h2>
        <div className="finale-actions" data-reveal data-delay="0.15">
          <a className="btn" href="#calendly">
            Book a call
          </a>
        </div>
        <a
          className="finale-email mono"
          href="mailto:hello@matiscale.com"
          data-reveal
          data-delay="0.25"
        >
          hello@matiscale.com
        </a>
      </div>
    </section>
  )
}

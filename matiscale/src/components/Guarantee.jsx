import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

export default function Guarantee() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="guarantee" id="guarantee" ref={ref}>
      <div className="container">
        <div className="guarantee-panel" data-reveal>
          <span className="kicker mono">The Matiscale guarantee</span>
          <h2 className="guarantee-title">
            5 qualified meetings in your first 30 days,{' '}
            <em>or we work free until you get them.</em>
          </h2>
          <p className="guarantee-sub">
            No long contracts. No paying for activity. We get paid because the
            meetings happen.
          </p>
          <a className="btn btn--inverse" href="#contact">
            Book a call
          </a>
        </div>
      </div>
    </section>
  )
}

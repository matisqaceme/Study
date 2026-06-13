import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

export default function FoundingClients() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="founding" id="founding" ref={ref}>
      <div className="container">
        <div className="founding-row" data-reveal>
          <div className="founding-copy">
            <span className="kicker mono">Founding clients</span>
            <h2 className="founding-title">
              A limited number of founding spots.
            </h2>
            <p className="founding-sub">
              Early partners get our full focus and our best rate, locked in.
            </p>
          </div>
          <a className="btn" href="#contact">
            Book a call
          </a>
        </div>
      </div>
    </section>
  )
}

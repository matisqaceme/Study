import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

export default function Problem() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="problem" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          What we do
        </span>
        <h2 className="problem-title">
          <span className="block" data-reveal>
            We run your cold email.
          </span>
          <span className="block" data-reveal data-delay="0.1">
            You take the meetings.
          </span>
        </h2>
        <p className="problem-sub" data-reveal data-delay="0.2">
          We find the companies that need your services, email the
          decision-makers, handle the replies, and book qualified meetings
          straight into your calendar. You don&rsquo;t send anything, write
          anything, or manage anything. You show up.
        </p>
      </div>
    </section>
  )
}

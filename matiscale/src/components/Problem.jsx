import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

export default function Problem() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="problem" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          The problem
        </span>
        <h2 className="problem-title">
          <span className="block" data-reveal>
            Your pipeline shouldn&rsquo;t depend
          </span>
          <span className="block" data-reveal data-delay="0.1">
            on referrals and luck.
          </span>
        </h2>
        <p className="problem-sub" data-reveal data-delay="0.2">
          Referrals stall. Inbound is slow. The firms that grow are simply in
          front of more buyers, more often. Most agencies fix this with
          volume: spray, pray, and burn your domain. We do the opposite.
        </p>
      </div>
    </section>
  )
}

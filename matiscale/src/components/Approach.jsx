import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

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
  useSectionReveal(ref)

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

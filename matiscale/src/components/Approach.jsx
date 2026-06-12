import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const STEPS = [
  {
    n: '01',
    title: 'We find your buyers',
    body: 'A precise list of the companies and decision-makers you want — built by hand, not scraped at scale.',
  },
  {
    n: '02',
    title: 'We reach them',
    body: 'Outreach in your name, written for one reader at a time. No blasts. No templates.',
  },
  {
    n: '03',
    title: 'Meetings land in your calendar',
    body: 'Qualified, confirmed, briefed. You show up and sell.',
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

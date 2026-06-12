import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const STEPS = [
  {
    n: '01',
    title: 'We find your buyers',
    body: 'A targeted list of the exact decision-makers worth reaching, built on live signals — hiring, growth, funding — so the timing is right.',
  },
  {
    n: '02',
    title: 'We reach them, personally',
    body: 'Every message is personalized and sent from a dedicated, deliverability-optimized setup — so it lands and gets replies.',
  },
  {
    n: '03',
    title: 'Meetings land on your calendar',
    body: 'We handle every reply and qualify each prospect. You just show up and close.',
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

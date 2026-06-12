import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

// Keep in sync with the FAQPage entries in index.html.
const ITEMS = [
  {
    q: 'What exactly do you deliver?',
    a: 'Booked, qualified meetings on your calendar. That’s the whole service.',
  },
  {
    q: 'What counts as a qualified meeting?',
    a: 'A confirmed call with a real decision-maker who fits your ideal customer profile and has agreed to the meeting. Not a lead. Not a maybe. A booked, qualified conversation.',
  },
  {
    q: 'How fast do we see results?',
    a: 'Campaigns go live within days; first meetings typically land inside the first few weeks.',
  },
  {
    q: 'What if it doesn’t work?',
    a: 'You get 5 qualified meetings in your first 30 days or we work free until you do. The risk is ours.',
  },
]

export default function Faq() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="faq" id="faq" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          Questions, answered
        </span>
        <div className="faq-list">
          {ITEMS.map((item, i) => (
            <details
              className="faq-item"
              key={item.q}
              data-reveal
              data-delay={String(Math.min(i * 0.06, 0.3))}
            >
              <summary className="faq-q">{item.q}</summary>
              <p className="faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

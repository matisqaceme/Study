import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const ITEMS = [
  {
    q: 'How does it work?',
    a: 'We build a hand-researched list of your ideal buyers, reach out in your name, and confirmed meetings land on your calendar. You show up and sell — we handle everything before that.',
  },
  {
    q: 'What counts as a qualified meeting?',
    a: 'We define it together in onboarding: company profile, size, and the seniority of the person in the room. If a meeting doesn’t match what we agreed, it doesn’t count toward the guarantee.',
  },
  {
    q: 'How fast do meetings start?',
    a: 'Onboarding takes 48 hours and outreach goes live within the first week. The guarantee clock starts on day one: 5 qualified meetings in your first 30 days.',
  },
  {
    q: 'What exactly does the guarantee cover?',
    a: '5 qualified meetings in your first 30 days — or we keep working at no charge until you get them. No partial credits, no fine print.',
  },
  {
    q: 'What do you need from me?',
    a: 'About an hour for onboarding, and clarity on who you sell to. After that we run everything and send you a short weekly summary.',
  },
  {
    q: 'What channels do you use?',
    a: 'Email-first outbound sent in your name, written for one reader at a time, with follow-ups where they make sense. No blasts, no templates, and your domain reputation stays protected.',
  },
  {
    q: 'What does it cost?',
    a: 'A flat monthly retainer, month to month, no setup fee. The exact number depends on your market and volume — book a call and we’ll give it to you straight.',
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

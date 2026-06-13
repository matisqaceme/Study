import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const AUDIENCES = [
  {
    n: 'A',
    title: 'Who it’s for',
    body: 'Staffing and recruiting firms — IT, healthcare, light-industrial, finance and accounting, and engineering. Mid-sized firms, 50 to 500 employees.',
  },
  {
    n: 'B',
    title: 'Why it works',
    body: 'One placement is worth thousands. It only takes one meeting that turns into a client to pay for months of what we do. No vague metrics — just one thing you can count: booked meetings.',
  },
]

export default function WhoFor() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="whofor" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          Built for staffing
        </span>
        <div className="whofor-grid">
          {AUDIENCES.map((a, i) => (
            <div
              className="card"
              key={a.n}
              data-reveal
              data-delay={String(i * 0.12)}
            >
              <span className="card-n mono">{a.n}</span>
              <h3 className="card-title">{a.title}</h3>
              <p className="card-body">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

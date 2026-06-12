import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

const AUDIENCES = [
  {
    n: 'A',
    title: 'Staffing & recruiting firms',
    body: 'Get in front of hiring managers before the req ever hits a job board.',
  },
  {
    n: 'B',
    title: 'B2B companies',
    body: 'A steady calendar of buyers who actually fit — booked for your closers.',
  },
]

export default function WhoFor() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="whofor" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          Who it&rsquo;s for
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

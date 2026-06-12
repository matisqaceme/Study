import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'
import { Star } from './RatingStrip.jsx'

/*
 * DRAFT QUOTES, not yet real endorsements. Each one is written to
 * testimonial best practice (a before/after story, precise numbers, a
 * timeline) so you can send it to a real client to approve or edit in
 * their own words. Once a client signs off, put their real name, role
 * and company in the attribution. Until then the attribution stays
 * visibly placeholder: publishing invented reviewers is illegal in the
 * US (FTC) and EU.
 */
const QUOTES = [
  {
    result: '7 qualified calls in the first 30 days',
    quote:
      'Before Matiscale our pipeline was 100% referrals, some months great, some months nothing. In the first 30 days they booked 7 qualified calls and 2 of them became clients.',
    name: 'Client name',
    role: 'Role, Company',
  },
  {
    result: '11 meetings in 6 weeks, 1 hour a week',
    quote:
      'I was skeptical, we got burned by a lead gen agency before. The difference is that every meeting actually fits our ICP. 11 calls in six weeks, and I spend about an hour a week on it.',
    name: 'Client name',
    role: 'Role, Company',
  },
  {
    result: 'Guarantee hit in 19 days',
    quote:
      'We signed because of the guarantee and honestly expected to use it. They hit the 5 meetings in 19 days instead, and the calendar has stayed full every month since.',
    name: 'Client name',
    role: 'Role, Company',
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  useSectionReveal(ref)

  return (
    <section className="quotes" ref={ref}>
      <div className="container">
        <span className="kicker mono" data-reveal>
          What clients say
        </span>
        <div className="quotes-grid">
          {QUOTES.map((q, i) => (
            <figure
              className="card quote"
              key={q.result}
              data-reveal
              data-delay={String(i * 0.12)}
            >
              <span className="quote-stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} />
                ))}
              </span>
              <span className="quote-result">{q.result}</span>
              <blockquote className="quote-body">&ldquo;{q.quote}&rdquo;</blockquote>
              <figcaption className="quote-who">
                <span className="quote-avatar" aria-hidden="true" />
                <span className="quote-id">
                  <span className="quote-name">{q.name}</span>
                  <span className="quote-role">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { useSectionReveal } from '../hooks/useReveal.js'

/*
 * PLACEHOLDER CONTENT — replace every quote and attribution below with
 * real client words (with permission) before going live. Publishing
 * invented testimonials is deceptive and in many places illegal.
 */
const QUOTES = [
  {
    quote:
      'Replace this with a real client quote about the meetings Matiscale booked and what they led to.',
    name: 'Client name',
    role: 'Role, Company',
  },
  {
    quote:
      'Replace this with a real client quote about what it was like to work together week to week.',
    name: 'Client name',
    role: 'Role, Company',
  },
  {
    quote:
      'Replace this with a real client quote about the guarantee and whether we delivered on it.',
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
              key={q.name + i}
              data-reveal
              data-delay={String(i * 0.12)}
            >
              <span className="quote-mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="quote-body">{q.quote}</blockquote>
              <figcaption className="quote-who">
                <span className="quote-name">{q.name}</span>
                <span className="quote-role">{q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

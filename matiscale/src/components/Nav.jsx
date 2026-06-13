import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BrandMark from './BrandMark.jsx'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'What you get', href: '#service' },
  { label: 'Compare', href: '#compare' },
  { label: 'Guarantee', href: '#guarantee' },
  { label: 'FAQ', href: '#faq' },
]

export default function Nav() {
  const ref = useRef(null)

  // The bar never leaves. Past the hero it just firms up its backdrop
  // so the brand stays legible over section content.
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const trigger = ScrollTrigger.create({
      start: 40,
      end: 'max',
      toggleClass: { targets: el, className: 'nav--scrolled' },
    })
    return () => trigger.kill()
  }, [])

  // Light up whichever nav link maps to the section currently in view.
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const triggers = []
    el.querySelectorAll('.nav-link').forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'))
      if (!section) return
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => link.classList.toggle('nav-link--active', self.isActive),
        }),
      )
    })
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <header className="nav" ref={ref}>
      <a className="nav-brand" href="#top" aria-label="Matiscale, back to top">
        <BrandMark />
        <span className="nav-wordmark">Matiscale</span>
      </a>
      <nav className="nav-links" aria-label="Main">
        {LINKS.map((link) => (
          <a key={link.href} className="nav-link mono" href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="btn btn--nav" href="#contact">
        Book a call
      </a>
    </header>
  )
}

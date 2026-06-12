import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'Approach', href: '#approach' },
  { label: 'Guarantee', href: '#guarantee' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const ref = useRef(null)

  // Slip away on scroll down, return on scroll up — keeps the bar from
  // ever sitting on top of section content.
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const trigger = ScrollTrigger.create({
      start: 160,
      end: 'max',
      onUpdate: (self) => {
        el.classList.toggle('nav--hidden', self.direction === 1)
      },
      onLeaveBack: () => el.classList.remove('nav--hidden'),
    })
    return () => trigger.kill()
  }, [])

  return (
    <header className="nav" ref={ref}>
      <a className="nav-mark mono" href="#top">
        Matiscale
      </a>
      <nav className="nav-links" aria-label="Main">
        {LINKS.map((link) => (
          <a key={link.href} className="nav-link mono" href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

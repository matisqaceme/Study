import { useEffect, useState } from 'react'

/**
 * Sticky bottom CTA, mobile only (CSS hides it above 44rem). Appears
 * once the hero scrolls away and steps aside while the booking section
 * is on screen.
 */
export default function MobileCta() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const contact = document.getElementById('contact')
    if (!hero || !contact) return undefined

    let pastHero = false
    let atContact = false
    const update = () => setShow(pastHero && !atContact)

    const heroObs = new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting
      update()
    })
    const contactObs = new IntersectionObserver(([entry]) => {
      atContact = entry.isIntersecting
      update()
    })
    heroObs.observe(hero)
    contactObs.observe(contact)
    return () => {
      heroObs.disconnect()
      contactObs.disconnect()
    }
  }, [])

  return (
    <div className={`mobile-cta${show ? ' mobile-cta--show' : ''}`}>
      <a className="btn mobile-cta-btn" href="#contact" tabIndex={show ? 0 : -1}>
        Book a call
      </a>
    </div>
  )
}

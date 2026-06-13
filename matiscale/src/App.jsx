import { useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMagneticButtons, useCardGlow } from './hooks/usePointerEffects.js'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import ProofBar from './components/ProofBar.jsx'
import Problem from './components/Problem.jsx'
import Approach from './components/Approach.jsx'
import Deliverables from './components/Deliverables.jsx'
import Comparison from './components/Comparison.jsx'
import Guarantee from './components/Guarantee.jsx'
import WhoFor from './components/WhoFor.jsx'
import FoundingClients from './components/FoundingClients.jsx'
import Faq from './components/Faq.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import Cursor from './components/Cursor.jsx'
import MobileCta from './components/MobileCta.jsx'

export default function App() {
  useMagneticButtons()
  useCardGlow()

  // Web fonts change metrics; recalculate trigger positions once they land.
  useEffect(() => {
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh())
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#contact">
        Skip to contact
      </a>
      <Nav />
      <main>
        <Hero />
        <ProofBar />
        <Problem />
        <Approach />
        <Deliverables />
        <Comparison />
        <Guarantee />
        {/* CASE STUDIES — add after first results. Client logos, case
            studies, and testimonials go here once they are real and
            approved. Do not publish invented clients, quotes, or numbers. */}
        <WhoFor />
        <FoundingClients />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MobileCta />
      <Cursor />
    </>
  )
}

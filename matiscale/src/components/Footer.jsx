import BrandMark from './BrandMark.jsx'

const LINKS = [
  { label: 'Approach', href: '#approach' },
  { label: 'Compare', href: '#compare' },
  { label: 'Guarantee', href: '#guarantee' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Book a call', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="footer-mark" href="#top" aria-label="Matiscale, back to top">
              <BrandMark />
              <span>Matiscale</span>
            </a>
            <p className="footer-tag">Done-for-you outbound. Meetings guaranteed.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            {LINKS.map((link) => (
              <a key={link.href} className="footer-link" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-row">
          <span className="footer-year mono">
            © {new Date().getFullYear()} Matiscale
          </span>
          <a className="footer-email mono" href="mailto:hello@matiscale.com">
            hello@matiscale.com
          </a>
        </div>
      </div>
    </footer>
  )
}

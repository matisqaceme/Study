export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-row">
        <span className="footer-mark">Matiscale</span>
        <span className="footer-year mono">© {new Date().getFullYear()}</span>
        <a className="footer-email mono" href="mailto:hello@matiscale.com">
          hello@matiscale.com
        </a>
      </div>
    </footer>
  )
}

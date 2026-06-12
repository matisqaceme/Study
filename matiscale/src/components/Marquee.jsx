/*
 * Horizontally scrolling strip, Cluely-style. Until real client logos
 * exist this scrolls the industries we book for, which is truthful and
 * still gives the page motion. Swap ITEMS for <img> logos later, the
 * track duplication and CSS stay the same.
 */
const ITEMS = [
  'IT staffing',
  'Healthcare staffing',
  'Light-industrial staffing',
  'Finance & accounting staffing',
  'Engineering staffing',
  'Manufacturing',
  'Logistics',
]

function Group({ hidden }) {
  return (
    <div className="marquee-group" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <span className="marquee-item mono" key={item}>
          {item}
          <span className="marquee-dot" />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee">
      <span className="marquee-label mono">Built for</span>
      <div className="marquee-viewport">
        <div className="marquee-track">
          <Group />
          <Group hidden />
        </div>
      </div>
    </div>
  )
}

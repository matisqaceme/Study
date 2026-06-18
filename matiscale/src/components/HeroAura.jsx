/**
 * The hero backdrop: layered sky-blue radial blobs drifting on very
 * slow transform-only keyframes (see .aura-* in index.css), fading to
 * white at the bottom. Pure CSS, no canvas, no JS loop.
 */
export default function HeroAura() {
  return (
    <div className="aura" aria-hidden="true">
      <div className="aura-blob aura-blob--a" />
      <div className="aura-blob aura-blob--b" />
      <div className="aura-blob aura-blob--c" />
      <div className="aura-fade" />
    </div>
  )
}

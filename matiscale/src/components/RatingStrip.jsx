/*
 * REVIEW PLATFORMS. When a real profile exists, fill in score and url
 * below; any platform with both renders as a branded badge linking to
 * the profile. Until then the strip shows the generic client rating
 * line. Do not fill these in before the profile actually exists and
 * has reviews, visitors will click through.
 */
const PLATFORMS = [
  { name: 'Trustpilot', score: null, url: null },
  { name: 'Google', score: null, url: null },
]

export function Star() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.45 6.2 20.5l1.1-6.47L2.6 9.45l6.5-.95L12 2.6z"
      />
    </svg>
  )
}

export default function RatingStrip() {
  const live = PLATFORMS.filter((p) => p.url && p.score)

  return (
    <div className="rating-strip">
      <span className="rating-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} />
        ))}
      </span>
      {live.length === 0 ? (
        <span className="rating-text">Rated 5/5 by the founders we book for</span>
      ) : (
        live.map((p) => (
          <a
            key={p.name}
            className="rating-badge"
            href={p.url}
            target="_blank"
            rel="noreferrer"
          >
            <strong>{p.score}</strong> on {p.name}
          </a>
        ))
      )}
    </div>
  )
}

/** The Matiscale glyph, same mark as the favicon, colored via currentColor. */
export default function BrandMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="32" cy="32" r="7" fill="currentColor" />
    </svg>
  )
}

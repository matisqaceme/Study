export function prefersReducedMotion() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasFinePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: fine)').matches
}

/**
 * Decide whether the device can run the WebGL hero at a steady 60fps.
 * Anything questionable gets the static gradient fallback instead —
 * the page must never feel slow because of one decorative element.
 */
export function supportsRich3D() {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).has('force3d')) return true
  if (prefersReducedMotion()) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false
  if (navigator.deviceMemory !== undefined && navigator.deviceMemory < 4) return false
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4) return false

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    if (/swiftshader|llvmpipe|softpipe|software|microsoft basic/i.test(renderer)) {
      return false
    }
    return true
  } catch {
    return false
  }
}

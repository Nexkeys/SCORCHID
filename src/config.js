/**
 * SCORCHID scene config: single source of truth for the scroll->camera
 * contract, section registry (page order, labels, accent palette) and the
 * device quality tier.
 *
 * Scroll math: App maps window.scrollY to a fractional section index f using
 * each section's real offsetTop, so sections can be any height. The camera
 * sits at y = -(SECTION_DEPTH * f); focal objects sit at y = -(SECTION_DEPTH * i).
 */

export const SECTION_DEPTH = 5
export const MESH_Z = -4

/**
 * side: where the TEXT sits on wide screens. The 3D object takes the other
 * half of the viewport so copy and sculpture never fight for the same space.
 */
export const SECTIONS = [
  { id: 'home', index: '01', label: 'Home', accent: '#22d3ee', side: 'center' },
  { id: 'protocol', index: '02', label: 'Protocol', accent: '#38bdf8', side: 'left' },
  { id: 'security', index: '03', label: 'Security', accent: '#818cf8', side: 'right' },
  { id: 'tokenomics', index: '04', label: 'Tokenomics', accent: '#fbbf24', side: 'left' },
  { id: 'ecosystem', index: '05', label: 'Ecosystem', accent: '#34d399', side: 'center' },
  { id: 'roadmap', index: '06', label: 'Roadmap', accent: '#a78bfa', side: 'left' },
  { id: 'community', index: '07', label: 'Community', accent: '#f472b6', side: 'center' },
]

export const SECTION_COUNT = SECTIONS.length

/** Total camera descent across all pages. */
export const TOTAL_DEPTH = SECTION_DEPTH * (SECTION_COUNT - 1)

/**
 * Coarse device tier, decided once at startup. 'low' drops pixel ratio,
 * antialiasing, env-map resolution and particle count. PerformanceMonitor in
 * ThreeCanvas can still demote a 'high' device at runtime if frames drop.
 */
function detectQuality() {
  if (typeof window === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory || 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const saveData = navigator.connection && navigator.connection.saveData
  if (saveData || coarse || cores <= 4 || memory <= 2) return 'low'
  return 'high'
}

export const QUALITY = detectQuality()

export const REDUCED_MOTION =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Atmosphere -- fixed overlay chrome (z-40/60, pointer-events-none):
 *   1. CUSTOM CURSOR: dot + trailing ring, lerped toward the pointer with
 *      separate easing; the ring scales on interactive targets. The DOM is
 *      rendered ALWAYS so `ref.current` is never null when quickTo runs;
 *      behaviour is gated on fine pointer + reduced-motion via CSS class
 *      (body.has-custom-cursor -> cursor:none only on fine pointer media).
 *   2. FILM GRAIN: SVG feTurbulence data-URI, steps() animation, safe for all.
 *
 * Positions are written via gsap.quickTo on x/y only (no React state in the
 * frame path), so the cursor stays compositor-friendly.
 */
const GRAIN_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

// Fixed left offsets tuned so dot+ring feel centred on the pointer (the Tailwind
// -translate-x/y-1/2 classes are removed; the half-size offsets are applied here).
const DOT_OFFSET = 4
const RING_OFFSET = 18

export default function Atmosphere() {
  const cursorRef = useRef(null)
  const ringRef = useRef(null)
  const activeRef = useRef(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dot = cursorRef.current
    const ring = ringRef.current
    if (!finePointer || reduceMotion || !dot || !ring) return undefined

    document.body.classList.add('has-custom-cursor')
    activeRef.current = true

    // quickTo on x/y only (transform-based, no per-frame layout writes).
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power2.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power2.out' })

    const onMove = (e) => {
      dotX(e.clientX - DOT_OFFSET)
      dotY(e.clientY - DOT_OFFSET)
      ringX(e.clientX - RING_OFFSET)
      ringY(e.clientY - RING_OFFSET)
    }
    const onOver = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover], [data-magnetic]')) {
        gsap.to(ring, { scale: 2.6, duration: 0.35, ease: 'power3.out' })
        gsap.to(dot, { scale: 0.4, duration: 0.35, ease: 'power3.out' })
      }
    }
    const onOut = (e) => {
      if (e.target.closest('a, button, [data-cursor-hover], [data-magnetic]')) {
        gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' })
        gsap.to(dot, { scale: 1, duration: 0.4, ease: 'power3.out' })
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('mouseout', onOut, { passive: true })

    return () => {
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      activeRef.current = false
    }
  }, [])

  return (
    <>
      {/* Film grain. No mix-blend-mode: blending a full-screen layer over the
          WebGL canvas forces a re-composite every frame and was a big cost on
          integrated GPUs. A plain low-opacity layer reads almost the same. */}
      <div
        aria-hidden="true"
        className="animate-grain pointer-events-none fixed inset-[-10%] z-40 opacity-[0.035]"
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: '180px 180px' }}
      />
      {/* Custom cursor: dot (always in DOM so refs are stable; hidden on coarse/touch). */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-2 w-2 rounded-full bg-[color:var(--accent)] lg:block"
      />
      {/* Custom cursor: trailing ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[59] hidden h-9 w-9 rounded-full border border-[color:var(--accent)]/60 lg:block"
      />
    </>
  )
}

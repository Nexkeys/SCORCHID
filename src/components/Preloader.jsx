import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { REDUCED_MOTION } from '../config.js'

// Never hold the visitor longer than this, even if WebGL or fonts stall.
const MAX_WAIT_MS = 3500

/**
 * Preloader -- coal screen with a mono percentage counter.
 *
 * Lifecycle:
 *   mount         -> lock scroll, ease the counter quickly to 90
 *   ready (or the MAX_WAIT_MS fallback)
 *                 -> finish to 100, slide the panel up, unlock, onDone()
 *
 * `ready` comes from App: true once the 3D scene has rendered its first frame
 * and the web fonts are in. The counter reflects real progress instead of a
 * fixed delay, so fast machines get in almost immediately.
 */
export default function Preloader({ ready, onDone }) {
  const [gone, setGone] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const panelRef = useRef(null)
  const numRef = useRef(null)
  const barRef = useRef(null)
  const counter = useRef({ v: 0 })
  const finishing = useRef(false)

  const paint = () => {
    const v = counter.current.v
    if (numRef.current) numRef.current.textContent = String(Math.round(v)).padStart(3, '0')
    if (barRef.current) {
      // ASCII progress bar: filled cells are '=', the leading edge flickers.
      const cells = 28
      const filled = Math.round((v / 100) * cells)
      let bar = ''
      for (let i = 0; i < cells; i += 1) {
        if (i < filled) bar += '='
        else if (i === filled) bar += '+-*'[(Math.random() * 3) | 0]
        else bar += '-'
      }
      barRef.current.textContent = bar
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const tween = gsap.to(counter.current, {
      v: 90,
      duration: REDUCED_MOTION ? 0.01 : 0.9,
      ease: 'power2.out',
      onUpdate: paint,
    })
    const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS)
    return () => {
      tween.kill()
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!(ready || timedOut) || finishing.current) return
    finishing.current = true
    gsap
      .timeline()
      .to(counter.current, {
        v: 100,
        duration: REDUCED_MOTION ? 0.01 : 0.35,
        ease: 'power1.out',
        overwrite: true,
        onUpdate: paint,
      })
      .to(panelRef.current, {
        yPercent: -100,
        duration: REDUCED_MOTION ? 0.01 : 0.8,
        ease: 'power4.inOut',
        onComplete: () => {
          document.body.style.overflow = ''
          onDone?.()
          setGone(true)
        },
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, timedOut])

  if (gone) return null

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-coal"
    >
      <p className="hud">SCORCHID · Syncing with mainnet</p>
      <h1 className="display mt-4 text-[clamp(4rem,17vw,15rem)] text-neutral-100">
        Loading <span ref={numRef} className="tabular-nums text-[color:var(--accent)]">000</span>%
      </h1>
      <p ref={barRef} aria-hidden="true" className="mt-6 font-mono text-sm tracking-[0.2em] text-[color:var(--accent)]">
        ----------------------------
      </p>
      <p className="hud absolute bottom-8 px-6 text-center">Fair launch · No presale · Liquidity locked</p>
    </div>
  )
}

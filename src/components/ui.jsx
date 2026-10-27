import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const GLYPHS = '!<>-_\\/[]{}=+*^?#01'

/**
 * Scramble -- decodes its text through random glyphs on hover (and once when
 * it scrolls into view if `onView`). Writes textContent directly; no state.
 */
export function Scramble({ text, className = '', onView = false, as: Tag = 'span' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let frame = 0
    let raf = 0
    const run = () => {
      cancelAnimationFrame(raf)
      frame = 0
      const total = text.length * 2 + 8
      const tick = () => {
        let out = ''
        for (let i = 0; i < text.length; i += 1) {
          if (text[i] === ' ' || frame / 2 > i + 4) out += text[i]
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        el.textContent = out
        frame += 1
        if (frame < total) raf = requestAnimationFrame(tick)
        else el.textContent = text
      }
      tick()
    }
    const host = el.closest('a, button') || el
    host.addEventListener('mouseenter', run)
    const st = onView ? ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run }) : null
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('mouseenter', run)
      if (st) st.kill()
    }
  }, [text, onView])

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text}
    </Tag>
  )
}

/** Rolling text: hover rolls a duplicate up into place (Lando-style). */
export function Roll({ children }) {
  return (
    <span className="roll" aria-hidden="false">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}

/** Splits a heading into masked words, animated by App ([data-split] > [data-word]). */
export function SplitWords({ text, className = '', accent = [] }) {
  return (
    <span data-split className={className}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span
            data-word
            className={`inline-block will-change-transform ${accent.includes(i) ? 'font-serif normal-case italic text-[color:var(--accent)]' : ''}`}
          >
            {word}
            {' '}
          </span>
        </span>
      ))}
    </span>
  )
}

/** Section kicker: [ 02 ] PROTOCOL ------ */
export function Kicker({ index, label }) {
  return (
    <div className="hud mb-6 flex items-center gap-4" data-reveal>
      <span className="text-[color:var(--accent)]">[ {index} ]</span>
      <Scramble text={label} onView />
      <span className="h-px w-16 bg-white/15" />
    </div>
  )
}

/** Nudges its child toward the cursor (GSAP quickTo). */
export function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(hover: hover)').matches) return undefined
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
    const move = (e) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [strength])

  return (
    <div ref={ref} data-magnetic className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  )
}

/** Pill button with rolling label and accent fill wipe. */
export function Button({ href, children, variant = 'solid', className = '' }) {
  const solid = variant === 'solid'
  return (
    <Magnetic>
      <a
        href={href}
        className={`group pointer-events-auto relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 font-mono text-xs uppercase tracking-widest2 transition-colors duration-500 ${
          solid
            ? 'bg-[color:var(--accent)] text-coal'
            : 'border border-white/20 text-neutral-100 hover:border-[color:var(--accent)]'
        } ${className}`}
      >
        <span
          className={`absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:translate-y-0 ${
            solid ? 'bg-white' : 'bg-[color:var(--accent)]'
          }`}
        />
        <span className={`relative ${solid ? '' : 'group-hover:text-coal'}`}>
          <Roll>{children}</Roll>
        </span>
        <span className={`relative transition-transform duration-500 group-hover:translate-x-1 ${solid ? '' : 'group-hover:text-coal'}`}>
          &rarr;
        </span>
      </a>
    </Magnetic>
  )
}

/** Animates a number from 0 when it scrolls into view. */
export function CountUp({ value, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const obj = { v: 0 }
    const paint = () => {
      el.textContent = prefix + obj.v.toFixed(decimals) + suffix
    }
    paint()
    const tween = gsap.to(obj, { v: value, duration: 1.8, ease: 'expo.out', paused: true, onUpdate: paint })
    const st = ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tween.play() })
    return () => {
      st.kill()
      tween.kill()
    }
  }, [value, prefix, suffix, decimals])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** Infinite marquee row; data-skew lets App lean it into scroll velocity. */
export function Marquee({ items, className = '', speed = 'animate-marquee', reverse = false, separator = '✦' }) {
  const doubled = [...items, ...items]
  return (
    <div className="pointer-events-none select-none overflow-hidden whitespace-nowrap">
      <div data-skew className="will-change-transform">
        <div className={`flex w-max ${speed}`} style={reverse ? { animationDirection: 'reverse' } : undefined}>
          {doubled.map((item, i) => (
            <span key={i} className={`flex items-center ${className}`}>
              {item}
              <span className="mx-[0.35em] text-[color:var(--accent)] opacity-70">{separator}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

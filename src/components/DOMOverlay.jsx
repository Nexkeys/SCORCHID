import { useEffect, useRef, useState } from 'react'
import { SECTIONS } from '../config.js'
import { NAV_LINKS, TICKER } from '../content.js'
import { Button, Roll, Scramble } from './ui.jsx'
import { Community, Ecosystem, Home, Protocol, Roadmap, Security, Tokenomics } from './sections.jsx'

/* ------------------------------------------------------------------ *
 * Header: logo mark, rolling nav, buy CTA, mobile menu.               *
 * ------------------------------------------------------------------ */

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
      <path d="M16 2 L28 16 L16 30 L4 16 Z" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ stroke: 'var(--accent)' }} />
      <path d="M16 9 L22 16 L16 23 L10 16 Z" style={{ fill: 'var(--accent)' }} />
    </svg>
  )
}

function Header({ onMenu }) {
  return (
    <header className="pointer-events-none fixed left-0 top-0 z-30 w-full bg-gradient-to-b from-coal via-coal/70 to-transparent">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <a href="#home" className="group pointer-events-auto flex items-center gap-3">
          <LogoMark />
          <span className="font-display text-xl tracking-wider text-neutral-100">
            <Roll>SCORCHID</Roll>
          </span>
        </a>
        <nav className="pointer-events-auto hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="group font-mono text-[11px] uppercase tracking-widest2 text-neutral-400 transition-colors hover:text-neutral-50">
              <Roll>{link.label}</Roll>
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Button href="#tokenomics">Buy $SCRCH</Button>
          </div>
          <button
            type="button"
            onClick={onMenu}
            className="pointer-events-auto rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest2 text-neutral-100 lg:hidden"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col bg-coal px-6 py-6 transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] ${
        open ? 'pointer-events-auto [clip-path:inset(0_0_0_0)]' : 'pointer-events-none [clip-path:inset(0_0_100%_0)]'
      }`}
      aria-hidden={!open}
    >
      <div className="flex justify-end">
        <button type="button" onClick={onClose} tabIndex={open ? 0 : -1} className="rounded-full border border-white/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest2">
          Close
        </button>
      </div>
      <nav className="mt-10 flex flex-1 flex-col justify-center gap-2" aria-label="Mobile">
        {NAV_LINKS.map((link, i) => (
          <a key={link.id} href={`#${link.id}`} onClick={onClose} tabIndex={open ? 0 : -1} className="group flex items-baseline gap-4 border-b border-white/10 py-3">
            <span className="hud text-[color:var(--accent)]">0{i + 2}</span>
            <span className="display text-6xl text-neutral-50">
              <Roll>{link.label}</Roll>
            </span>
          </a>
        ))}
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Ticker tape under the header.                                       *
 * ------------------------------------------------------------------ */

function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="pointer-events-none absolute left-0 top-[76px] z-10 w-full overflow-hidden border-y border-white/10 bg-coal/60 py-2">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {items.map(([sym, price, delta], i) => (
          <span key={i} className="flex items-baseline gap-3 font-mono text-[11px]">
            <span className="text-neutral-200">{sym}</span>
            <span className="tabular-nums text-neutral-500">{price}</span>
            <span className={`tabular-nums ${delta.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'}`}>{delta}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * HUD: progress bar, 12-col grid, corner ticks, block counter,        *
 * section index. All fixed, all pointer-events-none except links.    *
 * ------------------------------------------------------------------ */

function BlockCounter() {
  const ref = useRef(null)
  useEffect(() => {
    let block = 19284551
    const id = setInterval(() => {
      block += 1
      if (ref.current) ref.current.textContent = block.toLocaleString('en-US')
    }, 2000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="hud fixed bottom-6 left-6 z-20 hidden items-center gap-2 md:flex md:left-12">
      <span className="h-1.5 w-1.5 animate-blink rounded-full bg-[color:var(--accent)]" />
      Block #<span ref={ref}>19,284,551</span>
    </p>
  )
}

function SectionIndex() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id))
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight * 0.5
      let index = 0
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top + window.scrollY <= mid) index = i
      })
      setActive((prev) => (prev === index ? prev : index))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex md:right-12" aria-label="Sections">
      {SECTIONS.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} className="group pointer-events-auto flex items-center gap-3">
          <span
            className={`font-mono text-[10px] uppercase tracking-widest2 transition-all duration-500 ${
              i === active ? 'translate-x-0 text-neutral-200 opacity-100' : 'translate-x-2 text-neutral-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
            }`}
          >
            {s.label}
          </span>
          <span className={`h-px transition-all duration-500 ${i === active ? 'w-10 bg-[color:var(--accent)]' : 'w-4 bg-white/25 group-hover:w-7'}`} />
        </a>
      ))}
    </nav>
  )
}

function Hud() {
  return (
    <>
      <div data-progress className="fixed left-0 top-0 z-[35] h-[2px] w-full origin-left scale-x-0 bg-[color:var(--accent)]" />
      {/* Faint 12-column grid, the structure every section snaps to. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] mx-auto hidden max-w-[1400px] grid-cols-12 px-12 lg:grid">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="border-l border-white/[0.035] last:border-r" />
        ))}
      </div>
      {/* Viewport corner ticks. */}
      {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((pos) => (
        <span key={pos} aria-hidden="true" className={`pointer-events-none fixed z-20 h-4 w-4 border-white/25 ${pos}`} />
      ))}
      <BlockCounter />
      <p className="hud fixed bottom-6 right-6 z-20 hidden md:block md:right-12">
        <Scramble text="SCRCH / USD 0.0421" />
      </p>
      <SectionIndex />
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Root: pointer-events-none shell over the canvas; interactive        *
 * children opt back in with pointer-events-auto.                      *
 * ------------------------------------------------------------------ */

export default function DOMOverlay() {
  const [menu, setMenu] = useState(false)
  return (
    <>
      <Hud />
      <Header onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <div id="scroll-track" className="pointer-events-none relative z-10">
        <Ticker />
        <Home />
        <Protocol />
        <Security />
        <Tokenomics />
        <Ecosystem />
        <Roadmap />
        <Community />
      </div>
    </>
  )
}

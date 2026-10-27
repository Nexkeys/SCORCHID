import { useMemo, useState } from 'react'
import { Button, CountUp, Kicker, Marquee, Roll, Scramble, SplitWords } from './ui.jsx'
import {
  ALLOCATION,
  AUDITORS,
  CONTRACT,
  ECOSYSTEM,
  FAQ,
  HERO_STATS,
  PRICE_SERIES,
  ROADMAP,
  SECURITY_CHECKS,
  SECURITY_STATS,
  SOCIALS,
  STATEMENT,
  STEPS,
  TOKEN_STATS,
  VOICES,
} from '../content.js'

const WRAP = 'mx-auto w-full max-w-[1400px] px-6 md:px-12'
// Text column placement, mirroring config.js `side` (3D object takes the other half).
const LEFT = 'md:w-[52%]'
const RIGHT = 'md:ml-auto md:w-[48%]'

/* ================================================================== *
 * 01 HOME -- kinetic hero + manifesto statement over contour lines    *
 * ================================================================== */

function Chars({ text }) {
  return text.split('').map((c, i) => (
    <span key={i} data-char className="inline-block will-change-transform">
      {c}
    </span>
  ))
}

/** Topographic contour rings (Lando-style backdrop), generated once. */
function Contours() {
  const paths = useMemo(() => {
    const out = []
    for (let k = 1; k <= 14; k += 1) {
      const r = 30 + k * 34
      let d = ''
      for (let i = 0; i <= 96; i += 1) {
        const a = (i / 96) * Math.PI * 2
        const rr = r * (1 + 0.11 * Math.sin(3 * a + k * 0.7) + 0.05 * Math.sin(5 * a - k))
        d += `${i ? 'L' : 'M'}${(500 + Math.cos(a) * rr).toFixed(1)} ${(500 + Math.sin(a) * rr * 0.62).toFixed(1)}`
      }
      out.push(`${d}Z`)
    }
    return out
  }, [])
  return (
    <svg data-speed="1.4" viewBox="0 0 1000 1000" className="pointer-events-none absolute left-1/2 top-1/2 h-[140vh] w-[140vw] -translate-x-1/2 -translate-y-1/2 opacity-60" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
    </svg>
  )
}

export function Home() {
  const words = `${STATEMENT.before} ${STATEMENT.accent} ${STATEMENT.after}`.split(' ')
  const accentIndex = STATEMENT.before.split(' ').length
  return (
    <section id="home" className="relative">
      <div data-hero className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-40 pt-32 text-center">
        <p data-hero-sub className="hud mb-8 flex items-center gap-3">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live on mainnet · Season 02
        </p>
        <h1 className="display text-[clamp(5rem,21vw,19rem)] text-neutral-50 [perspective:800px]">
          <Chars text="SCORCH" />
          <span className="text-[color:var(--accent)]">
            <Chars text="ID" />
          </span>
        </h1>
        <p data-hero-sub className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
          Stake it. Burn it. Own the heat. <span className="text-neutral-500">$SCRCH is the deflationary token where every trade shrinks supply and every holder shares the yield.</span>
        </p>
        <div data-hero-sub className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="#tokenomics">Buy $SCRCH</Button>
          <Button href="#protocol" variant="ghost">
            How it works
          </Button>
        </div>

        <div data-hero-sub className="absolute inset-x-0 bottom-0">
          <div className={`${WRAP} grid grid-cols-2 border-t hairline md:grid-cols-4`}>
            {HERO_STATS.map((s, i) => (
              <div key={s.label} className={`py-5 text-left ${i ? 'md:border-l md:pl-6' : ''} hairline`}>
                <p className="hud">{s.label}</p>
                <p className="mt-2 flex items-baseline gap-3 font-mono text-lg text-neutral-100 md:text-xl">
                  {s.value}
                  <span className="text-xs text-emerald-400">{s.delta}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manifesto statement: the camera flies through the shattering knot while this reads. */}
      <div className="relative flex min-h-screen items-center overflow-hidden py-32">
        <Contours />
        <div className={`${WRAP} relative text-center`}>
          <p className="hud mb-10" data-reveal>
            [ manifesto ]
          </p>
          <h2 className="display mx-auto max-w-6xl text-[clamp(2.4rem,6vw,6rem)] text-neutral-100">
            <SplitWords text={words.join(' ')} accent={[accentIndex]} />
          </h2>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * 02 PROTOCOL -- outline marquee + numbered process rows              *
 * ================================================================== */

export function Protocol() {
  return (
    <section id="protocol" className="relative min-h-screen overflow-hidden py-28">
      <div className="mb-20 opacity-90">
        <Marquee
          items={['Stake', 'Burn', 'Earn', 'Repeat']}
          className="display text-outline text-[clamp(4rem,13vw,12rem)]"
          speed="animate-marquee"
        />
      </div>
      <div className={WRAP}>
        <div className={LEFT}>
          <Kicker index="02" label="Protocol" />
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-neutral-50">
            <SplitWords text="Three moves. Zero middlemen." accent={[3]} />
          </h2>
          <ol className="mt-14" data-stagger>
            {STEPS.map((step) => (
              <li key={step.n} className="group pointer-events-auto grid grid-cols-[4.5rem_1fr] gap-6 border-t hairline py-8 transition-colors duration-500 hover:bg-white/[0.02] md:grid-cols-[6rem_1fr]">
                <span className="display text-outline text-6xl transition-colors duration-500 group-hover:text-[color:var(--accent)] md:text-7xl">
                  {step.n}
                </span>
                <div>
                  <h3 className="display text-4xl text-neutral-50 md:text-5xl">{step.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400 md:text-base">{step.body}</p>
                  <p className="hud mt-4 text-[color:var(--accent)]">{step.meta}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * 03 SECURITY -- checklist, counters, auditors                        *
 * ================================================================== */

export function Security() {
  return (
    <section id="security" className="relative flex min-h-screen items-center py-28">
      <div className={WRAP}>
        <div className={RIGHT}>
          <Kicker index="03" label="Security" />
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-neutral-50">
            <SplitWords text="Audited twice. Trust nobody." accent={[3]} />
          </h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-neutral-400 md:text-base" data-reveal>
            Immutable contracts, locked liquidity and no keys left in anyone&apos;s pocket. Read the code before you read our posts.
          </p>
          <ul className="mt-10 space-y-3" data-stagger>
            {SECURITY_CHECKS.map((item) => (
              <li key={item} className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-neutral-300 md:text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--accent)] text-[10px] text-[color:var(--accent)]">
                  &#10003;
                </span>
                {item}
              </li>
            ))}
          </ul>
          <dl className="mt-12 grid grid-cols-2 gap-3" data-stagger>
            {SECURITY_STATS.map((s) => (
              <div key={s.label} className="panel p-5">
                <dt className="hud">{s.label}</dt>
                <dd className="display mt-3 text-5xl text-neutral-50">
                  <CountUp {...s} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2" data-reveal>
            <span className="hud">Audited by</span>
            {AUDITORS.map((a) => (
              <Scramble key={a} text={a} onView className="font-mono text-xs tracking-widest2 text-neutral-300" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * 04 TOKENOMICS -- donut, sparkline, counters                          *
 * ================================================================== */

const DONUT_R = 80
const DONUT_C = 2 * Math.PI * DONUT_R

function Donut() {
  let offset = 0
  return (
    <svg viewBox="0 0 200 200" className="h-52 w-52 -rotate-90 md:h-60 md:w-60" aria-label="Token allocation chart">
      <circle cx="100" cy="100" r={DONUT_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
      {ALLOCATION.map((a) => {
        const len = (a.pct / 100) * DONUT_C
        const el = (
          <circle
            key={a.label}
            data-seg={`${len - 2} ${DONUT_C}`}
            cx="100"
            cy="100"
            r={DONUT_R}
            fill="none"
            stroke={a.color}
            strokeWidth="18"
            strokeDasharray={`${len - 2} ${DONUT_C}`}
            strokeDashoffset={-offset}
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}

function Sparkline() {
  const { line, area } = useMemo(() => {
    const w = 400
    const h = 120
    const min = Math.min(...PRICE_SERIES)
    const max = Math.max(...PRICE_SERIES)
    const pts = PRICE_SERIES.map((v, i) => [(i / (PRICE_SERIES.length - 1)) * w, h - ((v - min) / (max - min)) * (h - 10) - 5])
    const l = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    return { line: l, area: `${l}L${w} ${h}L0 ${h}Z` }
  }, [])
  return (
    <svg viewBox="0 0 400 120" className="h-28 w-full" preserveAspectRatio="none" aria-label="30 day price chart">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path data-draw d={line} fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Tokenomics() {
  return (
    <section id="tokenomics" className="relative flex min-h-screen items-center py-28">
      <div className={WRAP}>
        <div className={LEFT}>
          <Kicker index="04" label="Tokenomics" />
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-neutral-50">
            <SplitWords text="One billion tokens. Fewer every day." accent={[3]} />
          </h2>

          <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-center" data-reveal>
            <div className="relative shrink-0">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="display text-4xl text-neutral-50">1B</span>
                <span className="hud">$SCRCH</span>
              </div>
            </div>
            <ul className="w-full space-y-4">
              {ALLOCATION.map((a) => (
                <li key={a.label}>
                  <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-wider text-neutral-300">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                      {a.label}
                    </span>
                    <span className="tabular-nums text-neutral-100">{a.pct}%</span>
                  </div>
                  <div className="mt-2 h-px w-full bg-white/10">
                    <div data-bar className="h-px origin-left" style={{ width: `${a.pct * 2}%`, maxWidth: '100%', background: a.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel mt-10 p-5" data-reveal>
            <div className="flex items-baseline justify-between">
              <span className="hud">SCRCH / USD · 30D</span>
              <span className="font-mono text-sm text-neutral-100">
                $0.0421 <span className="text-emerald-400">+98.6%</span>
              </span>
            </div>
            <Sparkline />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-y-8 border-t hairline pt-8 md:grid-cols-4" data-stagger>
            {TOKEN_STATS.map((s) => (
              <div key={s.label}>
                <dd className="display text-4xl text-[color:var(--accent)] md:text-5xl">
                  <CountUp {...s} />
                </dd>
                <dt className="hud mt-2">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * 05 ECOSYSTEM -- pinned section, cards slide sideways                 *
 * ================================================================== */

function CardArt({ hue, seed }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse
          key={i}
          cx={100 + Math.sin(seed + i) * 6}
          cy="60"
          rx={18 + i * 13}
          ry={10 + i * 7}
          fill="none"
          stroke={hue}
          strokeOpacity={0.9 - i * 0.12}
          strokeWidth="0.8"
          transform={`rotate(${seed * 17 + i * 6} 100 60)`}
        />
      ))}
      <circle cx="100" cy="60" r="6" fill={hue} />
    </svg>
  )
}

export function Ecosystem() {
  return (
    <section id="ecosystem" className="relative flex h-screen flex-col justify-center overflow-hidden">
      <div className={`${WRAP} mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end`}>
        <div>
          <Kicker index="05" label="Ecosystem" />
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-neutral-50">
            <SplitWords text="Plug into the furnace." accent={[3]} />
          </h2>
        </div>
        <p className="hud max-w-xs md:text-right" data-reveal>
          Six apps, one burn. Every product routes fees back to stakers. Keep scrolling &rarr;
        </p>
      </div>
      <div data-rail className="flex w-max gap-5 pl-6 pr-6 md:pl-12">
        {ECOSYSTEM.map((app, i) => (
          <article key={app.name} className="panel group pointer-events-auto flex h-[min(58vh,440px)] w-[min(78vw,360px)] shrink-0 flex-col p-6 transition-colors duration-500 hover:bg-coal/90">
            <div className="flex items-center justify-between">
              <span className="hud">
                {String(i + 1).padStart(2, '0')} / {String(ECOSYSTEM.length).padStart(2, '0')}
              </span>
              <span className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest2" style={{ borderColor: app.hue, color: app.hue }}>
                {app.status}
              </span>
            </div>
            <div className="my-6 min-h-0 flex-1 transition-transform duration-700 group-hover:scale-110">
              <CardArt hue={app.hue} seed={i + 1} />
            </div>
            <p className="hud" style={{ color: app.hue }}>
              {app.tag}
            </p>
            <h3 className="display mt-2 text-4xl text-neutral-50">{app.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{app.body}</p>
            <p className="mt-4 border-t hairline pt-4 font-mono text-xs text-neutral-200">{app.stat}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ================================================================== *
 * 06 ROADMAP -- self-drawing spine timeline                            *
 * ================================================================== */

const STATUS_STYLE = {
  Done: 'bg-[color:var(--accent)] border-[color:var(--accent)]',
  Live: 'bg-emerald-400 border-emerald-400 animate-pulse',
  Next: 'border-white/40',
  Soon: 'border-white/20',
}

export function Roadmap() {
  return (
    <section id="roadmap" className="relative min-h-screen py-28">
      <div className={WRAP}>
        <div className={LEFT}>
          <Kicker index="06" label="Roadmap" />
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)] text-neutral-50">
            <SplitWords text="From spark to inferno." accent={[3]} />
          </h2>
          <div className="relative mt-14 pl-10">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10">
              <div data-spine className="h-full w-px origin-top bg-[color:var(--accent)]" />
            </div>
            <ol className="space-y-14" data-stagger>
              {ROADMAP.map((p) => (
                <li key={p.phase} className="relative">
                  <span className={`absolute -left-10 top-2 h-[15px] w-[15px] rounded-full border-2 bg-coal ${STATUS_STYLE[p.status]}`} />
                  <p className="hud">
                    Phase {p.phase} · {p.when}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <h3 className="display text-5xl text-neutral-50 md:text-6xl">{p.name}</h3>
                    <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest2 text-neutral-300">
                      {p.status}
                    </span>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                    {p.items.map((item) => (
                      <li key={item} className="border-l hairline pl-3 text-sm text-neutral-400">
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== *
 * 07 COMMUNITY -- CTA, signup, voices carousel, FAQ, footer            *
 * ================================================================== */

function Signup() {
  const [sent, setSent] = useState(false)
  if (sent) {
    return (
      <p className="hud mt-10 text-[color:var(--accent)]" role="status">
        You&apos;re on the list. Watch for the next burn report.
      </p>
    )
  }
  return (
    <form
      className="pointer-events-auto mx-auto mt-10 flex w-full max-w-md items-center gap-2 rounded-full border border-white/15 p-1.5 focus-within:border-[color:var(--accent)]"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder="you@wallet.xyz"
        className="min-w-0 flex-1 bg-transparent px-4 font-mono text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
      />
      <button type="submit" className="group rounded-full bg-[color:var(--accent)] px-5 py-2.5 font-mono text-xs uppercase tracking-widest2 text-coal">
        <Roll>Get alerts</Roll>
      </button>
    </form>
  )
}

function Voices() {
  const cards = VOICES.map((v) => (
    <figure key={v.n} className="panel mx-2 w-[300px] whitespace-normal p-6 md:w-[360px]">
      <p className="hud flex justify-between">
        <span className="text-[color:var(--accent)]">{v.n}</span>
        <span>{v.handle}</span>
      </p>
      <blockquote className="mt-4 text-lg leading-snug text-neutral-200">&ldquo;{v.quote}&rdquo;</blockquote>
    </figure>
  ))
  return <Marquee items={cards} speed="animate-marqueeSlow" separator="" />
}

export function Community() {
  const [copied, setCopied] = useState(false)
  return (
    <section id="community" className="relative pt-28">
      <div className={`${WRAP} flex min-h-[90vh] flex-col items-center justify-center text-center`}>
        <Kicker index="07" label="Community" />
        <h2 className="display text-[clamp(4.5rem,15vw,14rem)] text-neutral-50">
          <SplitWords text="Join the heat." accent={[2]} />
        </h2>
        <p className="mt-6 max-w-md text-neutral-400" data-reveal>
          Burn reports, launch alerts and governance votes. No spam, only signal.
        </p>
        <Signup />
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3" data-reveal>
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} className="group pointer-events-auto font-mono text-xs uppercase tracking-widest2 text-neutral-300 hover:text-[color:var(--accent)]">
              <Roll>{s.label}</Roll>
            </a>
          ))}
        </div>
      </div>

      <div className="py-20">
        <p className={`${WRAP} hud mb-8`}>[ voices from the chain ]</p>
        <Voices />
      </div>

      <div className={`${WRAP} grid gap-12 py-20 md:grid-cols-[1fr_2fr]`}>
        <h3 className="display text-6xl text-neutral-50 md:text-7xl">
          <SplitWords text="Questions, answered." accent={[1]} />
        </h3>
        <div className="border-t hairline" data-stagger>
          {FAQ.map((f) => (
            <details key={f.q} className="group pointer-events-auto border-b hairline py-6">
              <summary className="flex cursor-pointer items-center justify-between gap-6 text-xl text-neutral-100 md:text-2xl">
                {f.q}
                <span className="font-mono text-[color:var(--accent)] transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-xl text-neutral-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <footer className="relative overflow-hidden border-t hairline pt-16">
        <div className={`${WRAP} grid gap-10 md:grid-cols-4`}>
          <div className="md:col-span-2">
            <p className="hud">Contract address</p>
            <button
              type="button"
              className="pointer-events-auto mt-3 flex items-center gap-3 font-mono text-lg text-neutral-100 hover:text-[color:var(--accent)]"
              onClick={() => {
                navigator.clipboard?.writeText(CONTRACT).catch(() => {})
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              }}
            >
              {CONTRACT}
              <span className="hud text-[color:var(--accent)]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div>
            <p className="hud mb-4">Explore</p>
            {['protocol', 'tokenomics', 'ecosystem', 'roadmap'].map((id) => (
              <a key={id} href={`#${id}`} className="group pointer-events-auto block py-1 text-sm capitalize text-neutral-300 hover:text-[color:var(--accent)]">
                <Roll>{id}</Roll>
              </a>
            ))}
          </div>
          <div>
            <p className="hud mb-4">Back to</p>
            <a href="#home" className="group pointer-events-auto block py-1 text-sm text-neutral-300 hover:text-[color:var(--accent)]">
              <Roll>Top &uarr;</Roll>
            </a>
          </div>
        </div>
        <p className={`${WRAP} hud mt-14 normal-case tracking-wider`}>
          &copy; 2026 SCORCHID. Concept site: the token, figures, partners and quotes shown are placeholders. Not financial advice.
        </p>
        <p aria-hidden="true" className="display mt-6 select-none bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-center text-[23vw] leading-[0.78] text-transparent">
          SCORCHID
        </p>
      </footer>
    </section>
  )
}

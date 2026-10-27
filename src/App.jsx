import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import DOMOverlay from './components/DOMOverlay.jsx'
import Atmosphere from './components/Atmosphere.jsx'
import Preloader from './components/Preloader.jsx'
import { SECTIONS, REDUCED_MOTION } from './config.js'

// Lazy-load the WebGL layer: the DOM + preloader paint immediately, the 3D
// chunk (three.js) streams in behind it.
const ThreeCanvas = lazy(() => import('./components/ThreeCanvas.jsx'))

gsap.registerPlugin(ScrollTrigger)

/**
 * App -- composition root.
 *
 * Scroll architecture (zero React state in the hot path):
 *   window scroll -> fractional section index f (from real section offsets)
 *   -> scrollIndex ref -> CameraRig eases toward it inside useFrame.
 * Because f comes from each section's offsetTop, sections can be any height
 * and every 3D station still lines up with its copy.
 */
export default function App() {
  const scrollIndex = useRef(0)
  const [glReady, setGlReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setFontsReady(true))
    else setFontsReady(true)
  }, [])

  // scrollY -> fractional section index. A pinned section (horizontal scroll)
  // sits inside a GSAP pin-spacer; its extra scroll length is a "hold" during
  // which the camera stays parked on that station.
  useEffect(() => {
    let tops = []
    let holds = []
    const measure = () => {
      tops = []
      holds = []
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id)
        if (!el) {
          tops.push(0)
          holds.push(0)
          return
        }
        const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el
        tops.push(box.getBoundingClientRect().top + window.scrollY)
        holds.push(Math.max(0, box.offsetHeight - el.offsetHeight))
      })
      update()
    }
    const update = () => {
      const y = window.scrollY
      const last = tops.length - 1
      let i = 0
      while (i < last && y >= tops[i + 1]) i += 1
      if (i >= last) {
        scrollIndex.current = last
        return
      }
      const start = tops[i] + holds[i]
      if (y <= start) {
        scrollIndex.current = i
        return
      }
      const span = Math.max(1, tops[i + 1] - start)
      scrollIndex.current = i + Math.min(1, (y - start) / span)
    }

    measure()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    ScrollTrigger.addEventListener('refresh', measure)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
      ScrollTrigger.removeEventListener('refresh', measure)
    }
  }, [])

  // Lenis inertial smooth scroll, driven by GSAP's ticker so ScrollTrigger,
  // the camera and every scrubbed tween read the same eased scroll position.
  useEffect(() => {
    if (!loaded || REDUCED_MOTION) return undefined
    const lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // In-page anchors glide instead of jumping.
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const target = document.querySelector(a.getAttribute('href'))
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { duration: 1.8 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [loaded])

  // Scroll-driven motion, started once the preloader has lifted.
  useEffect(() => {
    if (!loaded) return undefined

    const ctx = gsap.context(() => {
      // Ecosystem: pin the section and slide the card rail sideways.
      const rail = document.querySelector('[data-rail]')
      if (rail) {
        const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 48)
        gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '#ecosystem',
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
      }

      // Roadmap spine draws itself as you read down the phases.
      gsap.from('[data-spine]', {
        scaleY: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#roadmap', start: 'top 60%', end: 'bottom 70%', scrub: true },
      })

      // Donut segments sweep in one after another.
      gsap.utils.toArray('[data-seg]').forEach((seg, i) => {
        const [len, circ] = seg.dataset.seg.split(' ')
        gsap.fromTo(
          seg,
          { attr: { 'stroke-dasharray': `0 ${circ}` } },
          {
            attr: { 'stroke-dasharray': `${len} ${circ}` },
            duration: 1.4,
            delay: i * 0.12,
            ease: 'expo.out',
            scrollTrigger: { trigger: seg.ownerSVGElement, start: 'top 85%', toggleActions: 'play none none reverse' },
          },
        )
      })

      // Price sparkline draws in.
      gsap.utils.toArray('[data-draw]').forEach((path) => {
        const len = path.getTotalLength()
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 2,
            ease: 'power2.inOut',
            scrollTrigger: { trigger: path, start: 'top 90%', toggleActions: 'play none none reverse' },
          },
        )
      })

      // Top progress bar.
      gsap.to('[data-progress]', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: '#scroll-track', start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      })

      if (REDUCED_MOTION) {
        gsap.set('[data-hero] [data-char], [data-word], [data-reveal], [data-stagger] > *', { autoAlpha: 1 })
        gsap.set('[data-bar]', { scaleX: 1 })
        return
      }

      // Hero title: letters rise and flip into place.
      gsap.from('[data-hero] [data-char]', {
        yPercent: 110,
        rotateX: -80,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.04,
      })
      gsap.from('[data-hero-sub]', { y: 30, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.35 })

      // Hero drifts up and fades as you leave it.
      gsap.to('[data-hero]', {
        yPercent: -25,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
      })

      // Headings: each word slides up out of its own mask.
      gsap.utils.toArray('[data-split]').forEach((el) => {
        gsap.from(el.querySelectorAll('[data-word]'), {
          yPercent: 115,
          rotate: 4,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      // Blocks: lift + fade with a slight clip wipe.
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 50, clipPath: 'inset(0% 0% 100% 0%)' },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
          },
        )
      })

      // Groups of cards / rows: children cascade in.
      gsap.utils.toArray('[data-stagger]').forEach((el) => {
        gsap.from(el.children, {
          autoAlpha: 0,
          y: 40,
          scale: 0.96,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        })
      })

      // Allocation bars fill from the left.
      gsap.utils.toArray('[data-bar]').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
        })
      })

      // Depth parallax for decorative layers.
      gsap.utils.toArray('[data-speed]').forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 1
        gsap.to(el, {
          yPercent: -20 * speed,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      // Marquees lean into the scroll: skew follows scroll velocity.
      const skewers = gsap.utils.toArray('[data-skew]').map((el) =>
        gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3.out' }),
      )
      ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = gsap.utils.clamp(-12, 12, self.getVelocity() / -250)
          skewers.forEach((to) => to(skew))
        },
      })
    })

    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [loaded])

  return (
    <main className="relative">
      <Atmosphere />
      <Preloader ready={glReady && fontsReady} onDone={() => setLoaded(true)} />
      <Suspense fallback={null}>
        <ThreeCanvas scrollIndex={scrollIndex} onReady={() => setGlReady(true)} />
      </Suspense>
      <DOMOverlay />
    </main>
  )
}

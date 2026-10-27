import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import ThreeContent from './ThreeContent.jsx'
import { SECTION_DEPTH, SECTION_COUNT, SECTIONS, MESH_Z, QUALITY, REDUCED_MOTION } from '../config.js'

/**
 * SCORCHID WebGL layer (public contract):
 *   ThreeCanvas({ scrollIndex, onReady })
 *     scrollIndex -- ref, .current is the fractional section index (0..SECTION_COUNT-1)
 *     onReady     -- called once the first frame has rendered (or WebGL is missing)
 *
 * Frame loop ownership: CameraRig is the ONLY place the camera is touched.
 */

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

/**
 * CameraRig -- the cinematography.
 *  - eases a smoothed index f toward scrollIndex (frame-rate independent)
 *  - descends to y = -SECTION_DEPTH * f
 *  - sweeps sideways in an arc between stations, alternating left/right, and
 *    dollies in as it arrives at each one, so every transition is a camera move
 *  - mouse parallax, velocity roll (both off for reduced motion)
 */
function CameraRig({ scrollIndex }) {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const s = useRef({ f: 0, roll: 0, px: 0, py: 0 })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20)
    const st = s.current
    const prev = st.f
    st.f = THREE.MathUtils.damp(st.f, scrollIndex.current, 5, dt)
    const f = st.f
    const v = (f - prev) / Math.max(dt, 1e-4)

    const seg = Math.floor(f)
    const frac = f - seg
    const side = seg % 2 === 0 ? 1 : -1
    const arc = REDUCED_MOTION ? 0 : Math.sin(frac * Math.PI) * 1.4 * side
    const near = 1 - Math.min(1, Math.abs(f - Math.round(f)) * 2) // 1 at a station

    if (!REDUCED_MOTION) {
      st.px = THREE.MathUtils.damp(st.px, state.pointer.x * 0.5, 3, dt)
      st.py = THREE.MathUtils.damp(st.py, state.pointer.y * 0.25, 3, dt)
    }

    camera.position.set(arc + st.px, -SECTION_DEPTH * f + st.py, 6.6 - near * 1.0)

    const aspect = size.width / Math.max(1, size.height)
    const targetFov = aspect < 0.85 ? 64 : 46
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 4, dt)
      camera.updateProjectionMatrix()
    }

    look.set(arc * 0.35, camera.position.y - 0.3 - st.py * 0.5, MESH_Z)
    camera.lookAt(look)

    const targetRoll = REDUCED_MOTION ? 0 : THREE.MathUtils.clamp(-v * 0.05, -0.1, 0.1) + arc * 0.03
    st.roll = THREE.MathUtils.damp(st.roll, targetRoll, 5, dt)
    if (st.roll !== 0) camera.rotateZ(st.roll)
  })

  return null
}

/**
 * ScrollMood -- lerps fog + accent light toward the active section's color and
 * writes --accent to :root (only when the section changes).
 */
function ScrollMood() {
  const { camera, scene } = useThree()
  const light = useRef(null)
  const last = useRef(-1)
  const colors = useMemo(() => SECTIONS.map((sec) => new THREE.Color(sec.accent)), [])
  // Fog only takes a faint tint of the accent so distant dust stays dark.
  const fogColors = useMemo(() => colors.map((c) => new THREE.Color('#07090b').lerp(c, 0.12)), [colors])

  useFrame((state, delta) => {
    const index = THREE.MathUtils.clamp(Math.round(-camera.position.y / SECTION_DEPTH), 0, SECTION_COUNT - 1)
    const k = 1 - Math.exp(-3 * Math.min(delta, 1 / 20))
    if (scene.fog) scene.fog.color.lerp(fogColors[index], k)
    if (light.current) {
      light.current.color.lerp(colors[index], k)
      light.current.position.y = camera.position.y + 0.5
    }
    if (index !== last.current) {
      last.current = index
      document.documentElement.style.setProperty('--accent', SECTIONS[index].accent)
    }
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.2} />
      <pointLight ref={light} position={[0, 0, 3]} intensity={16} distance={16} decay={1.8} color="#22d3ee" />
    </>
  )
}

/**
 * Procedural env map for metallic reflections, baked ONCE (frames={1}).
 * Nothing is fetched over the network.
 */
function ProceduralEnvironment() {
  return (
    <Environment resolution={QUALITY === 'low' ? 128 : 256} frames={1}>
      <Lightformer form="rect" intensity={3.2} position={[0, 6, -6]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={2.6} position={[-7, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 2.5, 1]} color="#22d3ee" />
      <Lightformer form="rect" intensity={2.0} position={[7, -2, 2]} rotation-y={-Math.PI / 2} scale={[8, 2.5, 1]} color="#818cf8" />
      <Lightformer form="ring" intensity={4.0} position={[0, 1, -1]} scale={[3, 3, 1]} color="#fbbf24" />
    </Environment>
  )
}

/** Fires onReady after the first two rendered frames (shaders compiled, env baked). */
function FirstFrame({ onReady }) {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 2) onReady?.()
  })
  return null
}

/**
 * Post stack: mipmap bloom makes every emissive edge and flying shard glow,
 * a hint of chromatic aberration gives the lens-glass feel, vignette frames
 * the shot. Bloom works on a downsampled mip chain, so its cost stays small.
 */
function PostFX({ aberration }) {
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0009), [])
  return (
    <EffectComposer multisampling={QUALITY === 'low' ? 0 : 2} disableNormalPass>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} radius={0.7} />
      {aberration ? <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} /> : <></>}
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}

export default function ThreeCanvas({ scrollIndex, onReady }) {
  const supported = useMemo(detectWebGL, [])
  const [dpr, setDpr] = useState(QUALITY === 'low' ? 1 : 1.5)
  // Last-resort switch if the device keeps struggling after dropping to 1x.
  const [aberration, setAberration] = useState(true)

  useEffect(() => {
    if (!supported) onReady?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  // No WebGL: render nothing -- DOMOverlay is the complete, usable site.
  if (!supported) return null

  return (
    <div className="fixed left-0 top-0 h-full w-full" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: QUALITY !== 'low', alpha: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [0, 0, 6.6], fov: 46, near: 0.1, far: 60 }}
      >
        {/* Runtime safety net: if frames drop, fall back to 1x pixel ratio. */}
        {/* flipflops caps how often quality may bounce: every dpr change
            reallocates the post-processing buffers, so endless toggling stalls. */}
        <PerformanceMonitor
          flipflops={2}
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(QUALITY === 'low' ? 1 : 1.5)}
          onFallback={() => {
            setDpr(1)
            setAberration(false)
          }}
        />
        <fog attach="fog" args={['#07090b', 14, 34]} />
        <ScrollMood />
        <Suspense fallback={null}>
          <ProceduralEnvironment />
        </Suspense>
        <ThreeContent />
        <CameraRig scrollIndex={scrollIndex} />
        <FirstFrame onReady={onReady} />
        <PostFX aberration={aberration} />
      </Canvas>
    </div>
  )
}

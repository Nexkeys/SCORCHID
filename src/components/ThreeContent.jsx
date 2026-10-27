import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { SECTION_DEPTH, SECTIONS, MESH_Z, QUALITY, TOTAL_DEPTH } from '../config.js'
import { shardGeometry, shardMaterial } from './shards.js'

const HOVER_SCALE = 1.12
const HALF_PI = Math.PI / 2
const TAU = Math.PI * 2

/**
 * How scattered a station is, from the camera's distance to it (in stations).
 * Whole while the camera is within ~0.18 of a station, fully scattered by
 * ~0.8 away. Symmetric, so scrolling down OR up through a section assembles
 * its object on the way in and blows it apart on the way out.
 */
function shardAmount(camY, stationY) {
  const d = Math.abs(camY - stationY) / SECTION_DEPTH
  const t = THREE.MathUtils.clamp((d - 0.18) / 0.62, 0, 1)
  return t * t * (3 - 2 * t)
}

/** Horizontal home of a station: opposite the text column on wide screens. */
function stationX(side, wide) {
  if (!wide) return 0
  if (side === 'left') return 2.3
  if (side === 'right') return -2.3
  return 0
}

/** Hover: elastic scale pulse on the station + emissive flare on the hit mesh. */
function useHover(targetRef) {
  return useMemo(
    () => ({
      onPointerOver: (event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
        if (targetRef.current) {
          gsap.to(targetRef.current.scale, {
            x: HOVER_SCALE, y: HOVER_SCALE, z: HOVER_SCALE,
            duration: 0.6, ease: 'elastic.out(1, 0.45)', overwrite: 'auto',
          })
        }
        const m = event.object.material
        if (m && m.emissiveIntensity !== undefined) {
          if (m.userData.baseEmissive === undefined) m.userData.baseEmissive = m.emissiveIntensity
          gsap.to(m, { emissiveIntensity: m.userData.baseEmissive * 2.2 + 0.3, duration: 0.35, overwrite: 'auto' })
        }
      },
      onPointerOut: (event) => {
        document.body.style.cursor = ''
        if (targetRef.current) {
          gsap.to(targetRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
        }
        const m = event.object.material
        if (m && m.userData.baseEmissive !== undefined) {
          gsap.to(m, { emissiveIntensity: m.userData.baseEmissive, duration: 0.7, overwrite: 'auto' })
        }
      },
    }),
    [targetRef],
  )
}

/**
 * Station -- one focal object in the vertical stack.
 * Owns: bobbing, idle spin, side placement, visibility culling (stations more
 * than ~1.4 sections from the camera are not drawn at all) and the shard
 * uniform for every material in `shards`. `onFrame(s, t)` lets a station add
 * its own extras (orbiting chips, morphing orb) driven by the same values.
 */
function Station({ index, motion, shards = [], onFrame, children }) {
  const outer = useRef(null)
  const spin = useRef(null)
  const hoverTarget = useRef(null)
  const hover = useHover(hoverTarget)
  const stationY = -SECTION_DEPTH * index
  const side = SECTIONS[index].side

  useFrame((state, delta) => {
    const g = outer.current
    if (!g) return
    const camY = state.camera.position.y
    const visible = Math.abs(camY - stationY) / SECTION_DEPTH < 1.4
    g.visible = visible
    if (!visible) return

    const t = state.clock.elapsedTime
    const wide = state.size.width / Math.max(1, state.size.height) > 1.1
    g.position.x = THREE.MathUtils.damp(g.position.x, stationX(side, wide), 4, delta)
    g.position.y = stationY + Math.sin(t * motion.bobSpeed + motion.phase) * motion.bob
    spin.current.rotation.y = t * motion.spin + motion.phase

    const s = shardAmount(camY, stationY)
    for (let i = 0; i < shards.length; i += 1) shards[i].userData.uShards.value = s
    if (onFrame) onFrame(s, t)
  })

  return (
    <group ref={outer} position={[0, stationY, MESH_Z]}>
      <group ref={spin} {...hover}>
        <group ref={hoverTarget} rotation={[motion.tiltX || 0, 0, motion.tiltZ || 0]}>
          {children}
        </group>
      </group>
    </group>
  )
}

/** Ring of small spheres around a station; spins and scatters outward. */
function Orbiters({ groupRef, count, radius, size, colors }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * TAU
        return { pos: [Math.cos(a) * radius, Math.sin(a * 2) * 0.25, Math.sin(a) * radius], color: colors[i % colors.length] }
      }),
    [count, radius, colors],
  )
  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh key={i} position={item.pos}>
          <sphereGeometry args={[size, 16, 12]} />
          <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.6} metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

/** Drifting "block dust": one Points draw call spanning the whole descent. */
function Dust() {
  const ref = useRef(null)
  const geometry = useMemo(() => {
    const count = QUALITY === 'low' ? 500 : 1400
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = 4 - Math.random() * (TOTAL_DEPTH + 10)
      positions[i * 3 + 2] = MESH_Z - 10 + Math.random() * 14
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} color="#9be7ff" transparent opacity={0.55} depthWrite={false} sizeAttenuation />
    </points>
  )
}

/**
 * Floating crystal shards flanking the descent: one InstancedMesh, one draw
 * call. Each crystal tumbles on its own axis; the set drifts slowly so the
 * frame always has foreground depth passing the lens.
 */
function Crystals() {
  const ref = useRef(null)
  const count = QUALITY === 'low' ? 36 : 80
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const sideSign = Math.random() < 0.5 ? -1 : 1
        return {
          x: sideSign * (3.2 + Math.random() * 5),
          y: 3 - Math.random() * (TOTAL_DEPTH + 8),
          z: MESH_Z - 6 + Math.random() * 9,
          s: 0.06 + Math.random() * 0.16,
          rx: Math.random() * TAU,
          ry: Math.random() * TAU,
          speed: 0.2 + Math.random() * 0.6,
        }
      }),
    [count],
  )
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c7f6ff', emissive: '#22d3ee', emissiveIntensity: 0.18, metalness: 0.9, roughness: 0.1, flatShading: true }),
    [],
  )

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < data.length; i += 1) {
      const d = data[i]
      dummy.position.set(d.x, d.y + Math.sin(t * d.speed + i) * 0.2, d.z)
      dummy.rotation.set(d.rx + t * d.speed * 0.6, d.ry + t * d.speed, 0)
      dummy.scale.setScalar(d.s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, material, count]} frustumCulled={false}>
      <octahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}

export default function ThreeContent() {
  /* ---------- geometries (split into shards once) ---------- */
  const geo = useMemo(
    () => ({
      knot: shardGeometry(new THREE.TorusKnotGeometry(0.9, 0.3, 140, 20)),
      ring: shardGeometry(new THREE.TorusGeometry(1.4, 0.07, 12, 120)),
      chip: shardGeometry(new THREE.OctahedronGeometry(0.35, 0)),
      gem: shardGeometry(new THREE.IcosahedronGeometry(1.3, 1)),
      cage: new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2, 0)),
      coin: shardGeometry(new THREE.CylinderGeometry(1.6, 1.6, 0.32, 56, 1)),
      block: shardGeometry(new THREE.BoxGeometry(0.75, 0.75, 0.75, 2, 2, 2)),
      link: shardGeometry(new THREE.CylinderGeometry(0.05, 0.05, 1, 8, 1)),
      haloA: shardGeometry(new THREE.TorusGeometry(1.5, 0.04, 8, 120)),
      haloB: shardGeometry(new THREE.TorusGeometry(1.95, 0.03, 8, 140)),
    }),
    [],
  )

  /* ---------- materials ---------- */
  const mat = useMemo(
    () => ({
      knot: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#e8fbff', emissive: '#22d3ee', emissiveIntensity: 0.3, metalness: 0.9, roughness: 0.18, envMapIntensity: 1.5,
      }),
      ring: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#0a0a0a', emissive: '#38bdf8', emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.2,
      }),
      chip: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#f5c542', emissive: '#f5c542', emissiveIntensity: 0.4, metalness: 0.8, roughness: 0.2,
      }),
      gem: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#818cf8', emissive: '#4f46e5', emissiveIntensity: 0.25, metalness: 0.5, roughness: 0.12, flatShading: true, envMapIntensity: 1.3,
      }),
      cage: new THREE.LineBasicMaterial({ color: '#a5b4fc', transparent: true, opacity: 0.35 }),
      coin: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#f5c542', emissive: '#f59e0b', emissiveIntensity: 0.05, metalness: 1, roughness: 0.22, envMapIntensity: 2.2,
      }),
      block: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#1e1b4b', emissive: '#a78bfa', emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.3, flatShading: true,
      }),
      halo: shardMaterial(THREE.MeshStandardMaterial, {
        color: '#f472b6', emissive: '#f472b6', emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.25, envMapIntensity: 1.6,
      }),
    }),
    [],
  )

  /* ---------- per-station extras ---------- */
  const tokens = useRef(null)
  const chips = useRef(null)
  const sats = useRef(null)
  const orb = useRef(null)
  const orbMat = useRef(null)
  const cage = useRef(null)

  const spinScatter = (ref, speed) => (s, t) => {
    const g = ref.current
    if (!g) return
    g.rotation.y = t * speed
    g.scale.setScalar(1 + s * 1.8)
  }

  const securityFrame = (s, t) => {
    if (cage.current) cage.current.rotation.set(t * -0.12, t * -0.18, 0)
    mat.cage.opacity = 0.35 * (1 - s)
  }

  // The orb uses drei's distort shader, so instead of shattering it melts:
  // distortion swells and the sphere shrinks as the camera leaves.
  const ecosystemFrame = (s, t) => {
    if (orbMat.current) orbMat.current.distort = 0.35 + s * 0.6
    if (orb.current) orb.current.scale.setScalar(1 - s * 0.55)
    spinScatter(sats, 0.45)(s, t)
  }

  // Roadmap chain: five blocks on a rising diagonal, joined by links.
  const chain = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const x = (i - 2) * 0.95
        const y = (i - 2) * 0.45
        return { pos: [x, y, Math.sin(i) * 0.3], rot: [i * 0.4, i * 0.7, 0] }
      }),
    [],
  )

  return (
    <group>
      <Dust />
      <Crystals />

      {/* 01 HOME: liquid-metal knot + three orbiting tokens. */}
      <Station index={0} motion={{ spin: 0.16, bob: 0.12, bobSpeed: 0.8, phase: 0 }} shards={[mat.knot]} onFrame={spinScatter(tokens, 0.5)}>
        <mesh geometry={geo.knot} material={mat.knot} frustumCulled={false} />
        <Orbiters groupRef={tokens} count={3} radius={1.9} size={0.16} colors={['#22d3ee', '#f5c542']} />
      </Station>

      {/* 02 PROTOCOL: upright signal ring + gold chip riding its edge. */}
      <Station index={1} motion={{ spin: 0.3, tiltX: 0.5, tiltZ: 0.2, bob: 0.1, bobSpeed: 0.7, phase: 1 }} shards={[mat.ring, mat.chip]}>
        <mesh geometry={geo.ring} material={mat.ring} frustumCulled={false} />
        <mesh geometry={geo.chip} material={mat.chip} position={[1.65, 0.3, 0.2]} frustumCulled={false} />
      </Station>

      {/* 03 SECURITY: faceted gem inside a wireframe vault cage. */}
      <Station index={2} motion={{ spin: 0.14, tiltX: 0.16, bob: 0.11, bobSpeed: 0.75, phase: 2 }} shards={[mat.gem]} onFrame={securityFrame}>
        <mesh geometry={geo.gem} material={mat.gem} frustumCulled={false} />
        <lineSegments ref={cage} geometry={geo.cage} material={mat.cage} />
      </Station>

      {/* 04 TOKENOMICS: gold coin flipping on its axis + five orbit chips. */}
      <Station index={3} motion={{ spin: 0.5, tiltX: HALF_PI, bob: 0.09, bobSpeed: 0.9, phase: 3 }} shards={[mat.coin]} onFrame={spinScatter(chips, -0.42)}>
        <mesh geometry={geo.coin} material={mat.coin} frustumCulled={false} />
        <group rotation={[-HALF_PI, 0, 0]}>
          <Orbiters groupRef={chips} count={5} radius={2.3} size={0.12} colors={['#f5c542', '#22d3ee']} />
        </group>
      </Station>

      {/* 05 ECOSYSTEM: breathing emerald orb + four satellite apps. */}
      <Station index={4} motion={{ spin: 0.1, bob: 0.14, bobSpeed: 0.85, phase: 4 }} onFrame={ecosystemFrame}>
        <mesh ref={orb}>
          <sphereGeometry args={[1.3, QUALITY === 'low' ? 48 : 64, QUALITY === 'low' ? 48 : 64]} />
          <MeshDistortMaterial
            ref={orbMat}
            color="#34d399"
            emissive="#059669"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.25}
            distort={0.35}
            speed={1.4}
            envMapIntensity={1.2}
          />
        </mesh>
        <Orbiters groupRef={sats} count={4} radius={2.1} size={0.14} colors={['#34d399', '#22d3ee', '#f5c542', '#f472b6']} />
      </Station>

      {/* 06 ROADMAP: a chain of blocks, each phase one block. */}
      <Station index={5} motion={{ spin: 0.2, tiltZ: 0.1, bob: 0.12, bobSpeed: 0.8, phase: 5 }} shards={[mat.block]}>
        {chain.map((b, i) => (
          <mesh key={i} geometry={geo.block} material={mat.block} position={b.pos} rotation={b.rot} frustumCulled={false} />
        ))}
        {chain.slice(1).map((b, i) => {
          const a = chain[i].pos
          const mid = [(a[0] + b.pos[0]) / 2, (a[1] + b.pos[1]) / 2, (a[2] + b.pos[2]) / 2]
          const angle = Math.atan2(b.pos[1] - a[1], b.pos[0] - a[0]) - HALF_PI
          return <mesh key={`l${i}`} geometry={geo.link} material={mat.block} position={mid} rotation={[0, 0, angle]} frustumCulled={false} />
        })}
      </Station>

      {/* 07 COMMUNITY: double halo, two loops in different planes. */}
      <Station index={6} motion={{ spin: 0.24, tiltX: 0.7, tiltZ: 0.3, bob: 0.16, bobSpeed: 0.9, phase: 6 }} shards={[mat.halo]}>
        <mesh geometry={geo.haloA} material={mat.halo} frustumCulled={false} />
        <mesh geometry={geo.haloB} material={mat.halo} rotation={[1.1, 0.4, 0]} frustumCulled={false} />
      </Station>
    </group>
  )
}

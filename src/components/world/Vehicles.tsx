import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Vec2 } from '@/data/world'
import { playerState } from '@/systems/playerState'
import { useNightGlow } from './Props'

const wheel = (pos: [number, number, number], r = 0.26) => (
  <mesh position={pos} rotation={[0, 0, Math.PI / 2]} castShadow>
    <cylinderGeometry args={[r, r, 0.18, 14]} />
    <meshStandardMaterial color="#141414" roughness={0.9} />
  </mesh>
)

/** Kerala CNG auto-rickshaw: green body, yellow canopy. Front faces +z. */
export function AutoRickshaw({ body = '#1f7a45', canopy = '#f6c431' }: { body?: string; canopy?: string }) {
  const lamp = useNightGlow(4)
  return (
    <group>
      <mesh position={[0, 0.5, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.32, 0.42, 2.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.98, -0.55]} castShadow>
        <boxGeometry args={[1.34, 0.62, 1.3]} />
        <meshStandardMaterial color={body} roughness={0.45} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.0, 0.92]} castShadow>
        <boxGeometry args={[0.7, 0.95, 0.42]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.42, 1.02]}>
        <boxGeometry args={[1.18, 0.12, 0.25]} />
        <meshStandardMaterial color={canopy} />
      </mesh>
      <mesh position={[0, 1.62, 0.98]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[1.1, 0.48]} />
        <meshStandardMaterial color="#bfe3ef" transparent opacity={0.45} roughness={0.05} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* canopy */}
      <mesh position={[0, 1.95, -0.12]} castShadow>
        <boxGeometry args={[1.42, 0.14, 2.3]} />
        <meshStandardMaterial color={canopy} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.9, -0.12]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.22]}>
        <cylinderGeometry args={[0.71, 0.71, 2.3, 16, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={canopy} roughness={0.5} />
      </mesh>
      {[-0.66, 0.66].map((x) => (
        <mesh key={x} position={[x, 1.55, 0.85]}>
          <boxGeometry args={[0.05, 0.8, 0.05]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      <mesh position={[0, 1.28, -1.24]}>
        <boxGeometry args={[1.36, 0.6, 0.06]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 1.08, -0.65]}>
        <boxGeometry args={[1.1, 0.25, 0.6]} />
        <meshStandardMaterial color="#5a2a1a" />
      </mesh>
      <mesh position={[0, 0.98, 1.15]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial ref={lamp} color="#fffbe6" emissive="#fff1b0" emissiveIntensity={0} />
      </mesh>
      {wheel([0, 0.26, 1.0])}
      {wheel([-0.66, 0.26, -0.75])}
      {wheel([0.66, 0.26, -0.75])}
    </group>
  )
}

/** KSRTC bus, front faces +z */
export function Bus() {
  return (
    <group>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.5, 10]} />
        <meshStandardMaterial color="#c8352b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.35, 0]} castShadow>
        <boxGeometry args={[2.5, 1, 10]} />
        <meshStandardMaterial color="#f2e6c4" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[2.52, 0.65, 9.2]} />
        <meshStandardMaterial color="#2a3a40" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh position={[0, 2.95, 0]}>
        <boxGeometry args={[2.4, 0.2, 9.8]} />
        <meshStandardMaterial color="#e2d6b0" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[2.54, 0.12, 10.02]} />
        <meshStandardMaterial color="#f6c431" />
      </mesh>
      {wheel([-1.2, 0.45, 3.2], 0.45)}
      {wheel([1.2, 0.45, 3.2], 0.45)}
      {wheel([-1.2, 0.45, -3.2], 0.45)}
      {wheel([1.2, 0.45, -3.2], 0.45)}
    </group>
  )
}

/** Offsets a closed centreline loop to the left-hand lane (India drives on the left). */
function laneLoop(center: Vec2[], offset: number): THREE.Vector3[] {
  const n = center.length
  return center.map((p, i) => {
    const prev = center[(i - 1 + n) % n]
    const next = center[(i + 1) % n]
    const d1 = new THREE.Vector2(p[0] - prev[0], p[1] - prev[1]).normalize()
    const d2 = new THREE.Vector2(next[0] - p[0], next[1] - p[1]).normalize()
    const l1 = new THREE.Vector2(d1.y, -d1.x)
    const l2 = new THREE.Vector2(d2.y, -d2.x)
    const m = l1.clone().add(l2)
    const k = offset / Math.max(0.3, (1 + l1.dot(l2)) / 1)
    return new THREE.Vector3(p[0] + m.x * k, 0, p[1] + m.y * k)
  })
}

function MovingAuto({ loop, speed, startT, body, canopy }: { loop: Vec2[]; speed: number; startT: number; body?: string; canopy?: string }) {
  const ref = useRef<THREE.Group>(null)
  const pts = useMemo(() => laneLoop(loop, 2), [loop])
  const lengths = useMemo(() => pts.map((p, i) => p.distanceTo(pts[(i + 1) % pts.length])), [pts])
  const total = lengths.reduce((a, b) => a + b, 0)
  const dist = useRef(startT * total)
  const vel = useRef(speed)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const sample = (d: number, out: THREE.Vector3) => {
    d = ((d % total) + total) % total
    for (let i = 0; i < pts.length; i++) {
      if (d <= lengths[i]) return out.lerpVectors(pts[i], pts[(i + 1) % pts.length], d / lengths[i])
      d -= lengths[i]
    }
    return out.copy(pts[0])
  }

  useFrame((_, dt) => {
    if (!ref.current) return
    // yield to the player
    sample(dist.current + 3.2, tmp)
    const blocked = Math.hypot(tmp.x - playerState.x, tmp.z - playerState.z) < 2.2
    vel.current += ((blocked ? 0 : speed) - vel.current) * Math.min(1, dt * (blocked ? 6 : 1.5))
    dist.current += vel.current * dt
    const p = sample(dist.current, new THREE.Vector3())
    const ahead = sample(dist.current + 1.5, tmp)
    ref.current.position.set(p.x, Math.sin(dist.current * 3) * 0.015, p.z)
    const yaw = Math.atan2(ahead.x - p.x, ahead.z - p.z)
    let diff = yaw - ref.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    ref.current.rotation.y += diff * Math.min(1, dt * 6)
  })
  return (
    <group ref={ref}>
      <AutoRickshaw body={body} canopy={canopy} />
    </group>
  )
}

const LOOPS: Vec2[][] = [
  [
    [0, 0],
    [0, 36],
    [40, 36],
    [40, 0],
  ],
  [
    [0, 0],
    [-40, 0],
    [-40, 36],
    [0, 36],
  ],
  [
    [-0.3, -46],
    [-0.3, 62],
    [0.3, 62],
    [0.3, -46],
  ],
  [
    [-62, 0.3],
    [62, 0.3],
    [62, -0.3],
    [-62, -0.3],
  ],
]

export function Traffic({ count = 6 }: { count?: number }) {
  const list = [
    { loop: LOOPS[0], speed: 6.5, startT: 0.1 },
    { loop: LOOPS[1], speed: 6, startT: 0.5 },
    { loop: LOOPS[2], speed: 7.5, startT: 0.05 },
    { loop: LOOPS[2], speed: 7, startT: 0.55, body: '#14361f', canopy: '#f2d24a' },
    { loop: LOOPS[3], speed: 8, startT: 0.3 },
    { loop: LOOPS[3], speed: 7, startT: 0.8, body: '#1a1a1a', canopy: '#f6c431' },
  ]
  return (
    <group>
      {list.slice(0, count).map((a, i) => (
        <MovingAuto key={i} {...a} />
      ))}
    </group>
  )
}

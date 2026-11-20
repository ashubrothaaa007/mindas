import { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import { BUILDINGS, PALMS, PARKED_AUTOS, PARKED_BUS, ROADS, STALLS } from '@/data/world'
import { Bench, Building, ClockTower, Houseboat, Palms, Stall, StreetLamp, Water } from './Props'
import { AutoRickshaw, Bus } from './Vehicles'
import { asphaltTexture, groundTexture, pavementTexture, signTexture } from './textures'

function Ground() {
  const grass = useMemo(() => {
    const t = groundTexture().clone()
    t.needsUpdate = true
    t.repeat.set(30, 30)
    return t
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[240, 240]} />
      <meshStandardMaterial color="#86b35a" map={grass} roughness={1} />
    </mesh>
  )
}

function Roads() {
  const asphalt = asphaltTexture()
  const pave = pavementTexture()
  const dashes = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = []
    for (const r of ROADS) {
      const alongZ = r.d > r.w
      const len = alongZ ? r.d : r.w
      for (let s = -len / 2 + 2; s < len / 2 - 1; s += 4) {
        const x = alongZ ? r.x : r.x + s
        const z = alongZ ? r.z + s : r.z
        // skip intersections
        const inX = ROADS.some((o) => o !== r && Math.abs(x - o.x) < o.w / 2 + 0.5 && Math.abs(z - o.z) < o.d / 2 + 0.5)
        if (!inX) out.push({ x, z, rot: alongZ ? 0 : Math.PI / 2 })
      }
    }
    return out
  }, [])
  return (
    <group>
      {/* sidewalks */}
      {ROADS.map((r, i) => {
        const t = pave.clone()
        t.needsUpdate = true
        t.repeat.set((r.w + 6) / 2, (r.d + 6) / 2)
        return (
          <mesh key={`p${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.03, r.z]} receiveShadow>
            <planeGeometry args={[r.w + 6, r.d + 6]} />
            <meshStandardMaterial map={t} color="#e4d2b8" roughness={1} />
          </mesh>
        )
      })}
      {ROADS.map((r, i) => {
        const t = asphalt.clone()
        t.needsUpdate = true
        t.repeat.set(r.w / 4, r.d / 4)
        return (
          <mesh key={`r${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.06, r.z]} receiveShadow>
            <planeGeometry args={[r.w, r.d]} />
            <meshStandardMaterial map={t} roughness={0.95} />
          </mesh>
        )
      })}
      {/* curbs */}
      {ROADS.map((r, i) => {
        const alongZ = r.d > r.w
        return [-1, 1].map((s) => (
          <mesh key={`c${i}${s}`} position={[alongZ ? r.x + (s * r.w) / 2 : r.x, 0.09, alongZ ? r.z : r.z + (s * r.d) / 2]} receiveShadow>
            <boxGeometry args={[alongZ ? 0.25 : r.w, 0.1, alongZ ? r.d : 0.25]} />
            <meshStandardMaterial color="#d8cba8" />
          </mesh>
        ))
      })}
      <Instances limit={dashes.length}>
        <planeGeometry args={[0.18, 1.8]} />
        <meshStandardMaterial color="#f4ecd0" />
        {dashes.map((d, i) => (
          <Instance key={i} position={[d.x, 0.075, d.z]} rotation={[-Math.PI / 2, 0, d.rot]} />
        ))}
      </Instances>
      {/* zebra crossings at the main junction */}
      {[
        [0, 6, 0],
        [0, -6, 0],
        [6, 0, 1],
        [-6, 0, 1],
      ].map(([x, z, r], k) => (
        <group key={k} position={[x, 0.08, z]} rotation={[0, r ? Math.PI / 2 : 0, 0]}>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-3 + i, 0, 0]}>
              <planeGeometry args={[0.55, 2.4]} />
              <meshStandardMaterial color="#f7f3e6" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Plaza({ x, z, w, d, color = '#d9c4a2' }: { x: number; z: number; w: number; d: number; color?: string }) {
  const t = useMemo(() => {
    const tt = pavementTexture().clone()
    tt.needsUpdate = true
    tt.repeat.set(w / 2, d / 2)
    return tt
  }, [w, d])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.035, z]} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={t} color={color} roughness={1} />
    </mesh>
  )
}

function Shelter({ x, z, w, d, color, label }: { x: number; z: number; w: number; d: number; color: string; label?: string }) {
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * w) / 2 - sx * 0.2, 1.6, (sz * d) / 2 - sz * 0.2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 3.2, 6]} />
            <meshStandardMaterial color="#2b3b33" />
          </mesh>
        )),
      )}
      <mesh position={[0, 3.25, 0]} castShadow>
        <boxGeometry args={[w + 0.6, 0.18, d + 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {label && (
        <mesh position={[0, 3.75, d / 2 + 0.31]}>
          <planeGeometry args={[Math.min(w, 6), Math.min(w, 6) / 4]} />
          <meshStandardMaterial map={signTexture(label, '#14361f')} />
        </mesh>
      )}
    </group>
  )
}

function Train() {
  return (
    <group position={[0, 0, -73]}>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 4]} />
        <meshStandardMaterial color="#5a5048" />
      </mesh>
      {[-24, -12, 0, 12, 24].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.9, 0]} castShadow>
            <boxGeometry args={[11.4, 3, 3]} />
            <meshStandardMaterial color={i === 0 ? '#c8352b' : '#2d5fa8'} />
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <boxGeometry args={[10.6, 0.7, 3.02]} />
            <meshStandardMaterial color="#e6ecf2" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bunting({ from, to, y = 4.2 }: { from: [number, number]; to: [number, number]; y?: number }) {
  const flags = 14
  const colors = ['#b8f53c', '#fcd34d', '#f97362', '#fbf6e6']
  return (
    <group>
      {Array.from({ length: flags }, (_, i) => {
        const t = (i + 0.5) / flags
        const x = from[0] + (to[0] - from[0]) * t
        const z = from[1] + (to[1] - from[1]) * t
        const sag = Math.sin(t * Math.PI) * 0.6
        return (
          <mesh key={i} position={[x, y - sag, z]} rotation={[0, Math.atan2(to[0] - from[0], to[1] - from[1]) + Math.PI / 2, Math.PI]}>
            <coneGeometry args={[0.22, 0.45, 3]} />
            <meshStandardMaterial color={colors[i % colors.length]} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

export function City({ quality }: { quality: 'low' | 'medium' | 'high' }) {
  const lamps = useMemo(() => {
    const out: { p: [number, number, number]; r: number }[] = []
    for (let z = -40; z <= 60; z += 16) {
      out.push({ p: [-4.8, 0, z], r: 0 }, { p: [4.8, 0, z + 8], r: Math.PI })
    }
    for (let x = -60; x <= 60; x += 18) {
      if (Math.abs(x) < 8) continue
      out.push({ p: [x, 0, -4.8], r: -Math.PI / 2 })
    }
    return out
  }, [])
  return (
    <group>
      <Ground />
      <Roads />
      <Plaza x={0} z={-52} w={46} d={9} />
      <Plaza x={-29} z={-19} w={20} d={14} color="#d2b48c" />
      <Plaza x={27} z={30} w={14} d={5} />
      <Plaza x={-21} z={23} w={6} d={14} color="#e8e2d4" />
      <Plaza x={12.5} z={-12.5} w={6} d={12} color="#cdb894" />
      {BUILDINGS.map((b, i) => (
        <Building key={i} b={b} />
      ))}
      <ClockTower position={[0, 0, -63]} />
      <Train />
      {STALLS.map((s, i) => (
        <Stall key={i} {...s} />
      ))}
      <Bunting from={[-20, -25.5]} to={[-38, -25.5]} />
      <Bunting from={[-20, -12.5]} to={[-38, -12.5]} />
      <Palms positions={quality === 'low' ? PALMS.filter((_, i) => i % 2 === 0) : PALMS} />
      {lamps.map((l, i) => (
        <StreetLamp key={i} position={l.p} rotation={l.r} />
      ))}
      {/* Auto stand */}
      <Shelter x={12.2} z={-12.5} w={3.2} d={10} color="#f6c431" label="AUTO STAND" />
      {PARKED_AUTOS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
          <AutoRickshaw body={i === 1 ? '#1f7a45' : i === 0 ? '#14361f' : '#1a1a1a'} />
        </group>
      ))}
      {/* Bus stand */}
      <Shelter x={28} z={30} w={8} d={2.6} color="#d14b3c" label="KSRTC" />
      <Bench position={[26, 0, 29.4]} />
      <Bench position={[30, 0, 29.4]} />
      <group position={[PARKED_BUS[0], 0, PARKED_BUS[1]]} rotation={[0, -Math.PI / 2, 0]}>
        <Bus />
      </group>
      {/* Tea shop details */}
      <mesh position={[-13.9, 0.55, 13]} castShadow>
        <boxGeometry args={[0.8, 1.1, 3.2]} />
        <meshStandardMaterial color="#7a4a26" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-13.9, 1.3, 12 + i * 0.8]}>
          <cylinderGeometry args={[0.14, 0.14, 0.38, 10]} />
          <meshStandardMaterial color={['#f2c33b', '#e8553d', '#c9a26b'][i]} transparent opacity={0.85} />
        </mesh>
      ))}
      <Bench position={[-10.5, 0, 16.5]} rotation={Math.PI / 2} />
      <Bench position={[-10.5, 0, 9]} rotation={Math.PI / 2} />
      {/* Restaurant tables */}
      {[
        [17, -27],
        [27, -28],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.06, 14]} />
            <meshStandardMaterial color="#fbf6e6" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          <mesh position={[0, 2.3, 0]} castShadow>
            <coneGeometry args={[1.5, 0.6, 8]} />
            <meshStandardMaterial color={i ? '#a3e635' : '#f97362'} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 5]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        </group>
      ))}
      <Water />
      <Houseboat position={[0, 0, 70]} />
      {/* promenade rail */}
      <mesh position={[0, 0.5, 62.6]}>
        <boxGeometry args={[150, 0.1, 0.1]} />
        <meshStandardMaterial color="#e7dfcf" />
      </mesh>
    </group>
  )
}

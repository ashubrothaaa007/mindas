import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'
import type { BuildingDef, Vec2 } from '@/data/world'
import { roofTileTexture, signTexture, windowGlowTexture, windowTexture } from './textures'
import { isNight, timeState } from '@/systems/time'

/** Shared ref so many materials can react to night without re-rendering */
export const nightMaterials = new Set<THREE.MeshStandardMaterial>()

export function useNightGlow(intensity = 1) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => {
    if (!ref.current) return
    const target = isNight(timeState.hours) ? intensity : 0
    ref.current.emissiveIntensity += (target - ref.current.emissiveIntensity) * 0.05
  })
  return ref
}

export function Building({ b }: { b: BuildingDef }) {
  const tex = useMemo(() => {
    if (!b.windows) return null
    const t = windowTexture().clone()
    t.needsUpdate = true
    t.repeat.set(Math.max(1, Math.round(b.w / 4)), Math.max(1, Math.round(b.h / 3.2)))
    return t
  }, [b.w, b.h, b.windows])
  const glow = useMemo(() => {
    if (!b.windows) return null
    const t = windowGlowTexture().clone()
    t.needsUpdate = true
    t.repeat.set(Math.max(1, Math.round(b.w / 4)), Math.max(1, Math.round(b.h / 3.2)))
    return t
  }, [b.w, b.h, b.windows])
  const roofTex = useMemo(() => {
    const t = roofTileTexture().clone()
    t.needsUpdate = true
    t.repeat.set(b.w / 2, 3)
    return t
  }, [b.w])
  const matRef = useNightGlow(0.9)
  const face = b.face ?? 0
  const signRot = [0, Math.PI / 2, Math.PI, -Math.PI / 2][face]
  const signDist = face % 2 === 0 ? b.d / 2 : b.w / 2
  const signWidth = Math.min(face % 2 === 0 ? b.w * 0.8 : b.d * 0.8, 9)

  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.w, b.h, b.d]} />
        <meshStandardMaterial
          ref={matRef}
          color={b.color}
          map={tex ?? undefined}
          emissiveMap={glow ?? undefined}
          emissive={glow ? '#ffb85c' : '#000000'}
          emissiveIntensity={0}
          roughness={0.9}
        />
      </mesh>
      {/* plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[b.w + 0.3, 0.4, b.d + 0.3]} />
        <meshStandardMaterial color="#8b7d6b" roughness={1} />
      </mesh>
      {b.roof === 'tile' && (
        <group position={[0, b.h, 0]}>
          {/* Kerala style hip roof: two sloped planes + gable ends */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, 0.9, (s * b.d) / 4 + s * 0.15]} rotation={[s * 0.62, 0, 0]} castShadow>
              <boxGeometry args={[b.w + 1, 0.18, b.d / 2 / Math.cos(0.62) + 0.6]} />
              <meshStandardMaterial color={b.roofColor} map={roofTex} roughness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[b.w + 1.05, 0.3, 0.3]} />
            <meshStandardMaterial color="#7a2e1a" />
          </mesh>
        </group>
      )}
      {b.roof === 'flat' && (
        <group position={[0, b.h, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[b.w + 0.25, 0.5, b.d + 0.25]} />
            <meshStandardMaterial color="#e7dfcf" roughness={0.95} />
          </mesh>
          {b.h > 8 && (
            <mesh position={[b.w / 4, 1.2, -b.d / 4]} castShadow>
              <cylinderGeometry args={[0.7, 0.7, 1.6, 12]} />
              <meshStandardMaterial color="#3a6ea5" />
            </mesh>
          )}
        </group>
      )}
      {b.sign && (
        <group rotation={[0, signRot, 0]}>
          <mesh position={[0, Math.min(b.h - 0.9, 3.6), signDist + 0.08]}>
            <planeGeometry args={[signWidth, signWidth / 4]} />
            <meshStandardMaterial map={signTexture(b.sign, b.signColor ?? '#1d4a2b')} roughness={0.6} emissive="#ffffff" emissiveIntensity={0.08} />
          </mesh>
          {/* awning */}
          <mesh position={[0, 2.6, signDist + 0.7]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[signWidth, 0.08, 1.5]} />
            <meshStandardMaterial color={b.signColor ?? '#1d4a2b'} />
          </mesh>
          {/* door */}
          <mesh position={[0, 1.15, signDist + 0.03]}>
            <planeGeometry args={[1.6, 2.3]} />
            <meshStandardMaterial color="#4a2e1c" />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** Instanced coconut palms */
export function Palms({ positions }: { positions: Vec2[] }) {
  const data = useMemo(
    () =>
      positions.map(([x, z], i) => {
        const h = 6 + ((i * 37) % 10) / 3
        const lean = (((i * 53) % 10) / 10 - 0.5) * 0.25
        const rot = (i * 1.7) % (Math.PI * 2)
        return { x, z, h, lean, rot }
      }),
    [positions],
  )
  const leafGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.quadraticCurveTo(0.7, 1.4, 0, 3.4)
    shape.quadraticCurveTo(-0.7, 1.4, 0, 0)
    const g = new THREE.ShapeGeometry(shape, 6)
    g.rotateX(-Math.PI / 2)
    g.translate(0, 0, 0)
    return g
  }, [])
  return (
    <group>
      <Instances limit={positions.length * 3} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 1, 7]} />
        <meshStandardMaterial color="#8a6a48" roughness={1} />
        {data.flatMap((p, i) =>
          [0, 1, 2].map((s) => {
            const seg = p.h / 3
            const y = seg * s + seg / 2
            const off = p.lean * (y * y) * 0.08
            return <Instance key={`${i}-${s}`} position={[p.x + off * Math.cos(p.rot), y, p.z + off * Math.sin(p.rot)]} scale={[1 - s * 0.12, seg + 0.05, 1 - s * 0.12]} rotation={[p.lean * Math.sin(p.rot) * 0.6, 0, -p.lean * Math.cos(p.rot) * 0.6]} />
          }),
        )}
      </Instances>
      <Instances limit={positions.length * 8} geometry={leafGeo} castShadow>
        <meshStandardMaterial color="#3f8a2e" side={THREE.DoubleSide} roughness={0.8} />
        {data.flatMap((p, i) => {
          const off = p.lean * p.h * p.h * 0.08
          return Array.from({ length: 8 }, (_, k) => (
            <Instance
              key={`${i}-${k}`}
              position={[p.x + off * Math.cos(p.rot), p.h, p.z + off * Math.sin(p.rot)]}
              rotation={[-(0.3 + (k % 2) * 0.3), (k / 8) * Math.PI * 2 + p.rot, 0, 'YXZ']}
              color={k % 2 ? '#4f9e35' : '#3a7f2a'}
            />
          ))
        })}
      </Instances>
      <Instances limit={positions.length}>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#6b4a1f" />
        {data.map((p, i) => {
          const off = p.lean * p.h * p.h * 0.08
          return <Instance key={i} position={[p.x + off * Math.cos(p.rot) + 0.2, p.h - 0.3, p.z + off * Math.sin(p.rot)]} />
        })}
      </Instances>
    </group>
  )
}

export function StreetLamp({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const bulb = useNightGlow(3)
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 5, 6]} />
        <meshStandardMaterial color="#2b3b33" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.6, 4.95, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <meshStandardMaterial color="#2b3b33" />
      </mesh>
      <mesh position={[1.15, 4.82, 0]}>
        <boxGeometry args={[0.5, 0.14, 0.26]} />
        <meshStandardMaterial ref={bulb} color="#fff3c4" emissive="#ffcf6a" emissiveIntensity={0} />
      </mesh>
    </group>
  )
}

export function Stall({ x, z, color, goods }: { x: number; z: number; color: string; goods: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 1, 2]} />
        <meshStandardMaterial color="#8a5a34" />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-1.3 + (i % 3) * 1.3, 1.15, i < 3 ? -0.4 : 0.4]} castShadow>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? goods : '#f2c33b'} roughness={0.6} />
        </mesh>
      ))}
      {[-1.7, 1.7].map((px) =>
        [-0.9, 0.9].map((pz) => (
          <mesh key={`${px}${pz}`} position={[px, 1.4, pz]}>
            <cylinderGeometry args={[0.05, 0.05, 2.8, 5]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.85, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[4.2, 0.12, 2.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-1.8 + i * 0.6, 2.7, 1.32]}>
          <boxGeometry args={[0.3, 0.3, 0.04]} />
          <meshStandardMaterial color={i % 2 ? '#fbf6e6' : color} />
        </mesh>
      ))}
    </group>
  )
}

export function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#8a5a34" />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.45, 0.45]} />
          <meshStandardMaterial color="#5a3a24" />
        </mesh>
      ))}
    </group>
  )
}

export function Water() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).color.setHSL(0.48, 0.45, 0.32 + Math.sin(clock.elapsedTime * 0.5) * 0.015)
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 76]} receiveShadow>
      <planeGeometry args={[220, 30, 1, 1]} />
      <meshStandardMaterial color="#2c7a73" roughness={0.15} metalness={0.3} />
    </mesh>
  )
}

export function Houseboat({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    ref.current.position.x = position[0] + Math.sin(t * 0.05) * 30
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.02
    ref.current.position.y = position[1] + Math.sin(t * 1.1) * 0.05
  })
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[9, 0.7, 2.6]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 7, 12, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#c8a25a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[1.45, 1.45, 7, 12, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#d8b46a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/** Station clock tower with live-ish hands */
export function ClockTower({ position }: { position: [number, number, number] }) {
  const hand = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (hand.current) hand.current.rotation.z = -((timeState.hours % 12) / 12) * Math.PI * 2
  })
  return (
    <group position={position}>
      <mesh position={[0, 7, 0]} castShadow>
        <boxGeometry args={[4, 14, 4]} />
        <meshStandardMaterial color="#e3cfa2" />
      </mesh>
      <mesh position={[0, 15, 0]} castShadow>
        <coneGeometry args={[3.4, 3, 4]} />
        <meshStandardMaterial color="#9c3b26" />
      </mesh>
      <mesh position={[0, 11.5, 2.02]}>
        <circleGeometry args={[1.3, 24]} />
        <meshStandardMaterial color="#fffaf0" />
      </mesh>
      <mesh ref={hand} position={[0, 11.5, 2.06]}>
        <boxGeometry args={[0.12, 1.1, 0.02]} />
        <meshStandardMaterial color="#14361f" />
      </mesh>
    </group>
  )
}

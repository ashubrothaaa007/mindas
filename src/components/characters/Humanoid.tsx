import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface HumanoidLook {
  skin: string
  shirt: string
  lower: string
  hair: string
  mundu?: boolean
  female?: boolean
  mustache?: boolean
  backpack?: string
  hairWhite?: boolean
}

export interface HumanoidMotion {
  speed: number
  talking: boolean
  airborne?: boolean
}

/** Stylised low-poly person with walk, idle, talk and jump poses. */
export function Humanoid({ look, motion, scale = 1 }: { look: HumanoidLook; motion: MutableRefObject<HumanoidMotion>; scale?: number }) {
  const legL = useRef<THREE.Group>(null)
  const legR = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const phase = useRef(Math.random() * 10)

  useFrame((_, dt) => {
    const m = motion.current
    const s = Math.min(m.speed, 9)
    phase.current += dt * (4 + s * 1.15)
    const p = phase.current
    const amp = Math.min(1, s / 4.5)
    const swing = Math.sin(p) * 0.75 * amp
    if (legL.current && legR.current) {
      const tuck = m.airborne ? 0.6 : 0
      legL.current.rotation.x = swing - tuck
      legR.current.rotation.x = -swing - tuck * 0.4
    }
    if (armL.current && armR.current) {
      const idle = Math.sin(p * 0.35) * 0.04
      armL.current.rotation.x = -swing * 0.9 + idle
      armR.current.rotation.x = swing * 0.9 - idle
      armL.current.rotation.z = m.airborne ? 0.9 : 0.08
      armR.current.rotation.z = m.airborne ? -0.9 : -0.08
      if (m.talking) {
        armR.current.rotation.x = -0.9 + Math.sin(p * 0.9) * 0.25
        armR.current.rotation.z = -0.25
      }
    }
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(p)) * 0.06 * amp + Math.sin(p * 0.4) * 0.008
      body.current.rotation.y = Math.sin(p) * 0.06 * amp
    }
    if (head.current) {
      head.current.rotation.x = m.talking ? Math.sin(p * 1.4) * 0.08 : 0
      head.current.rotation.y = m.talking ? Math.sin(p * 0.5) * 0.15 : 0
    }
  })

  const skinMat = <meshStandardMaterial color={look.skin} roughness={0.7} />
  return (
    <group scale={scale}>
      <group ref={body}>
        {/* Legs */}
        {([
          [legL, -0.13],
          [legR, 0.13],
        ] as const).map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.92, 0]}>
            <mesh position={[0, -0.43, 0]} castShadow>
              <capsuleGeometry args={[0.105, 0.62, 4, 8]} />
              <meshStandardMaterial color={look.mundu ? look.skin : look.lower} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.86, 0.06]} castShadow>
              <boxGeometry args={[0.2, 0.1, 0.32]} />
              <meshStandardMaterial color="#3a2a20" />
            </mesh>
          </group>
        ))}
        {/* Mundu / skirt */}
        {(look.mundu || look.female) && (
          <mesh position={[0, look.female ? 0.5 : 0.62, 0]} castShadow>
            <cylinderGeometry args={[0.3, look.female ? 0.4 : 0.34, look.female ? 0.86 : 0.62, 12]} />
            <meshStandardMaterial color={look.lower} roughness={0.9} />
          </mesh>
        )}
        {/* Torso */}
        <mesh position={[0, 1.27, 0]} castShadow>
          <capsuleGeometry args={[0.27, 0.38, 4, 10]} />
          <meshStandardMaterial color={look.shirt} roughness={0.8} />
        </mesh>
        {look.female && (
          <mesh position={[0.02, 1.3, 0.02]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.16, 0.85, 0.58]} />
            <meshStandardMaterial color={look.lower} roughness={0.9} />
          </mesh>
        )}
        {look.backpack && (
          <mesh position={[0, 1.3, -0.3]} castShadow>
            <boxGeometry args={[0.42, 0.5, 0.2]} />
            <meshStandardMaterial color={look.backpack} roughness={0.7} />
          </mesh>
        )}
        {/* Arms */}
        {([
          [armL, -0.36],
          [armR, 0.36],
        ] as const).map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 1.55, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow>
              <capsuleGeometry args={[0.075, 0.42, 4, 8]} />
              <meshStandardMaterial color={look.shirt} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.6, 0]} castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              {skinMat}
            </mesh>
          </group>
        ))}
        {/* Head */}
        <group ref={head} position={[0, 1.82, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.12, 8]} />
            {skinMat}
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 14]} />
            {skinMat}
          </mesh>
          <mesh position={[0, 0.06, -0.02]} scale={[1.05, 0.85, 1.05]}>
            <sphereGeometry args={[0.225, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={look.hair} roughness={0.9} />
          </mesh>
          {look.female && (
            <mesh position={[0, 0.02, -0.24]}>
              <sphereGeometry args={[0.11, 10, 10]} />
              <meshStandardMaterial color={look.hair} />
            </mesh>
          )}
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.2]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial color="#1a1310" />
            </mesh>
          ))}
          {look.mustache && (
            <mesh position={[0, -0.07, 0.205]}>
              <boxGeometry args={[0.13, 0.03, 0.03]} />
              <meshStandardMaterial color={look.hair === '#d9d4c8' || look.hair === '#8a8a8a' ? look.hair : '#1b1410'} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}

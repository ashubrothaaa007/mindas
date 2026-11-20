import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { playerState } from '@/systems/playerState'
import { scarfColor, useGame } from '@/store/game'

/** Small 3D Minu that trots after the player. */
export function MinuCompanion3D() {
  const group = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const scarf = useGame((s) => scarfColor(s.progress.minuScarf))
  const pos = useRef(new THREE.Vector3(playerState.x + 1, 0, playerState.z + 1))

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    // target: behind-right of player
    const f = playerState.facing
    const tx = playerState.x - Math.sin(f) * 1.3 + Math.cos(f) * 0.9
    const tz = playerState.z - Math.cos(f) * 1.3 - Math.sin(f) * 0.9
    const d = Math.hypot(tx - pos.current.x, tz - pos.current.z)
    const moving = d > 0.25
    pos.current.x += (tx - pos.current.x) * Math.min(1, dt * 3.2)
    pos.current.z += (tz - pos.current.z) * Math.min(1, dt * 3.2)
    if (!group.current) return
    group.current.position.set(pos.current.x, (moving ? Math.abs(Math.sin(t * 12)) * 0.12 : Math.sin(t * 2) * 0.02) + playerState.y * 0.6, pos.current.z)
    const look = moving ? Math.atan2(tx - pos.current.x, tz - pos.current.z) : Math.atan2(playerState.x - pos.current.x, playerState.z - pos.current.z)
    let diff = look - group.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    group.current.rotation.y += diff * Math.min(1, dt * 6)
    if (tail.current) tail.current.rotation.y = Math.sin(t * (moving ? 10 : 3)) * 0.4
  })

  const lime = '#a3e635'
  const forest = '#1d4a2b'
  const cream = '#fbf3dc'
  return (
    <group ref={group} scale={0.55}>
      <mesh position={[0, 0.55, 0]} castShadow scale={[1, 0.9, 1.25]}>
        <sphereGeometry args={[0.38, 16, 14]} />
        <meshStandardMaterial color={lime} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0.18]} scale={[0.7, 0.75, 0.9]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color={cream} />
      </mesh>
      <group position={[0, 1.05, 0.28]}>
        <mesh castShadow>
          <sphereGeometry args={[0.36, 18, 16]} />
          <meshStandardMaterial color={lime} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.1, 0.24]} scale={[1, 0.75, 1]}>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshStandardMaterial color={cream} />
        </mesh>
        <mesh position={[0, -0.04, 0.43]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#0d2416" />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.07, 0.31]}>
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshStandardMaterial color="#0d2416" roughness={0.2} />
            </mesh>
            <mesh position={[x + 0.02, 0.1, 0.36]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
            <mesh position={[x * 1.6, 0.36, -0.02]} rotation={[0, 0, -x * 2]}>
              <coneGeometry args={[0.12, 0.32, 4]} />
              <meshStandardMaterial color={lime} />
            </mesh>
            <mesh position={[x * 1.75, 0.5, -0.02]} rotation={[0, 0, -x * 2]}>
              <coneGeometry args={[0.055, 0.1, 4]} />
              <meshStandardMaterial color={forest} />
            </mesh>
          </group>
        ))}
      </group>
      {scarf && (
        <mesh position={[0, 0.8, 0.12]} rotation={[Math.PI / 2 - 0.2, 0, 0]}>
          <torusGeometry args={[0.26, 0.06, 8, 16]} />
          <meshStandardMaterial color={scarf} />
        </mesh>
      )}
      <group ref={tail} position={[0, 0.6, -0.4]}>
        <mesh position={[0, 0.25, -0.3]} rotation={[-0.9, 0, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.5, 4, 10]} />
          <meshStandardMaterial color={lime} />
        </mesh>
        <mesh position={[0, 0.5, -0.58]}>
          <sphereGeometry args={[0.17, 10, 10]} />
          <meshStandardMaterial color={forest} />
        </mesh>
      </group>
      {[-0.18, 0.18].map((x) =>
        [-0.2, 0.25].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.12, z]}>
            <capsuleGeometry args={[0.07, 0.16, 4, 6]} />
            <meshStandardMaterial color={z > 0 ? cream : lime} />
          </mesh>
        )),
      )}
    </group>
  )
}

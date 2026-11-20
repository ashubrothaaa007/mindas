import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { LOCATIONS, NPCS, npcById } from '@/data/world'
import { missionById } from '@/data/missions'
import { playerState } from '@/systems/playerState'
import { useGame } from '@/store/game'

export const INTERACT_RADIUS = 3.2

/** Proximity detection, location discovery and the guidance chevron. */
export function WorldSystems() {
  const acc = useRef(0)
  const arrow = useRef<THREE.Group>(null)

  useFrame(({ clock }, dt) => {
    const s = useGame.getState()
    // nearest interactable NPC
    let best: string | null = null
    let bestD = INTERACT_RADIUS
    for (const n of NPCS) {
      const d = Math.hypot(playerState.x - n.pos[0], playerState.z - n.pos[1])
      if (d < bestD) {
        bestD = d
        best = n.id
      }
    }
    if (best !== s.nearbyNpcId) s.setNearbyNpc(best)

    acc.current += dt
    if (acc.current > 0.5) {
      acc.current = 0
      for (const l of LOCATIONS) {
        if (!s.progress.visited.includes(l.id) && Math.hypot(playerState.x - l.pos[0], playerState.z - l.pos[1]) < l.radius) s.visitLocation(l.id)
      }
    }

    // Guide chevron toward tracked mission
    if (arrow.current) {
      const m = s.progress.trackedMissionId ? missionById(s.progress.trackedMissionId) : null
      const npc = m ? npcById(m.npcId) : null
      const d = npc ? Math.hypot(npc.pos[0] - playerState.x, npc.pos[1] - playerState.z) : 0
      const show = !!npc && d > 6 && !s.conversationMissionId
      arrow.current.visible = show
      if (show && npc) {
        const ang = Math.atan2(npc.pos[0] - playerState.x, npc.pos[1] - playerState.z)
        arrow.current.position.set(playerState.x + Math.sin(ang) * 1.6, 0.1 + playerState.y, playerState.z + Math.cos(ang) * 1.6)
        arrow.current.rotation.y = ang
        const pulse = 0.85 + Math.sin(clock.elapsedTime * 4) * 0.15
        arrow.current.scale.setScalar(pulse)
      }
    }
  })

  return (
    <group ref={arrow}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[chevron()]} />
        <meshBasicMaterial color="#b8f53c" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function chevron() {
  const s = new THREE.Shape()
  // pointing toward -y in shape space => +z after rotation
  s.moveTo(0, -0.55)
  s.lineTo(0.45, 0.1)
  s.lineTo(0.2, 0.1)
  s.lineTo(0, -0.2)
  s.lineTo(-0.2, 0.1)
  s.lineTo(-0.45, 0.1)
  s.closePath()
  return s
}


export function LocationLabels() {
  const visited = useGame((s) => s.progress.visited)
  return (
    <>
      {LOCATIONS.map((l) => (
        <Html key={l.id} position={[l.pos[0], l.id === 'station' ? 11 : 6.5, l.pos[1]]} center distanceFactor={22} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center">
          <div className={`whitespace-nowrap rounded-full px-4 py-1.5 font-display text-[22px] font-semibold shadow-lg ${visited.includes(l.id) ? 'bg-cream text-forest' : 'bg-forest/85 text-cream ring-2 ring-lime/50'}`}>
              {visited.includes(l.id) ? l.name : '???'}
            </div>
            {visited.includes(l.id) && <div className="ml mt-1 rounded-full bg-black/40 px-3 text-[18px] font-semibold text-cream">{l.ml}</div>}
          </div>
        </Html>
      ))}
    </>
  )
}

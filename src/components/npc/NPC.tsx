import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Humanoid, type HumanoidMotion } from '../characters/Humanoid'
import type { NpcDef } from '@/data/world'
import { playerState } from '@/systems/playerState'
import { isMissionUnlocked, useGame } from '@/store/game'
import { missionById } from '@/data/missions'

export type MarkerState = 'story' | 'chat' | 'locked' | 'done' | 'tracked'

export function useMarkerState(npc: NpcDef): MarkerState {
  return useGame((s) => {
    const m = missionById(npc.missionId)
    if (!m) return 'done'
    const done = s.progress.completedMissions.includes(m.id)
    if (done) return 'done'
    if (!isMissionUnlocked(m.id, s.progress.completedMissions)) return 'locked'
    if (m.kind === 'chat') return 'chat'
    return s.progress.trackedMissionId === m.id ? 'tracked' : 'story'
  })
}

function Marker({ state }: { state: MarkerState }) {
  const ref = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ref.current) {
      ref.current.position.y = 2.75 + Math.sin(t * 2) * 0.12
      ref.current.rotation.y = t * 1.4
    }
    if (ring.current) {
      const s = 1 + ((t * 0.8) % 1) * 0.8
      ring.current.scale.set(s, s, s)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - ((t * 0.8) % 1))
    }
  })
  if (state === 'done') return null
  const color = state === 'locked' ? '#8a948c' : state === 'chat' ? '#fbf6e6' : '#b8f53c'
  const big = state === 'tracked' || state === 'story'
  return (
    <group>
      <group ref={ref}>
        <mesh scale={big ? [0.32, 0.5, 0.32] : [0.2, 0.3, 0.2]}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={state === 'locked' ? 0.1 : 0.8} roughness={0.3} />
        </mesh>
      </group>
      {big && (
        <>
          <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
          </mesh>
          {state === 'tracked' && (
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 16, 8, 1, true]} />
              <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          )}
        </>
      )}
    </group>
  )
}

export function NPC({ npc }: { npc: NpcDef }) {
  const group = useRef<THREE.Group>(null)
  const motion = useRef<HumanoidMotion>({ speed: 0, talking: false })
  const [near, setNear] = useState(false)
  const state = useMarkerState(npc)
  const mission = missionById(npc.missionId)

  useFrame((_, dt) => {
    if (!group.current) return
    const dx = playerState.x - npc.pos[0]
    const dz = playerState.z - npc.pos[1]
    const d = Math.hypot(dx, dz)
    const isNear = d < 9
    if (isNear !== near) setNear(isNear)
    const talking = useGame.getState().conversationMissionId === npc.missionId
    motion.current.talking = talking
    const target = d < 7 ? Math.atan2(dx, dz) : npc.rot
    let diff = target - group.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    group.current.rotation.y += diff * Math.min(1, dt * 4)
  })

  return (
    <group position={[npc.pos[0], 0, npc.pos[1]]}>
      <group ref={group} rotation={[0, npc.rot, 0]}>
        <Humanoid
          look={{ skin: npc.skin, shirt: npc.shirt, lower: npc.mundu, hair: npc.hair, mundu: !npc.female, female: npc.female, mustache: npc.mustache }}
          motion={motion}
        />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <Marker state={state} />
      {near && (
        <Html position={[0, state === 'done' ? 2.5 : 3.45, 0]} center distanceFactor={9} zIndexRange={[10, 0]} style={{ pointerEvents: 'auto' }}>
          <button
            type="button"
            disabled={!mission || state === 'locked'}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              if (mission && state !== 'locked') useGame.getState().openConversation(mission.id)
            }}
            className="whitespace-nowrap rounded-xl border border-white/15 bg-[#0d1a12]/90 px-4 py-2 text-center shadow-lg backdrop-blur-md transition hover:border-lime/60 hover:bg-forest disabled:cursor-default"
            aria-label={mission && state !== 'locked' ? `${state === 'done' ? 'Replay' : 'Talk to'} ${npc.name}, ${mission.title}` : `${npc.name}, mission locked`}
          >
            <span className="block font-display text-[15px] font-semibold text-cream">{npc.name}</span>
            <span className="block text-[11px] font-semibold text-lime/90">{npc.role}{mission ? ` · ${mission.title}` : ''}</span>
            {state !== 'locked' && <span className="mt-1 block text-[10px] font-extrabold uppercase tracking-wider text-sun">Tap to talk · E</span>}
          </button>
        </Html>
      )}
    </group>
  )
}

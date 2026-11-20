import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import { useGame } from '@/store/game'
import { City } from '@/components/world/City'
import { DayNight } from '@/components/world/DayNight'
import { Traffic } from '@/components/world/Vehicles'
import { Pedestrians } from '@/components/world/Pedestrians'
import { LocationLabels, WorldSystems } from '@/components/world/WorldSystems'
import { Player } from '@/components/characters/Player'
import { MinuCompanion3D } from '@/components/characters/MinuCompanion3D'
import { NPC } from '@/components/npc/NPC'
import { NPCS } from '@/data/world'

export function MainWorldScene() {
  const graphics = useGame((s) => s.settings.graphics)
  const setReady = useGame((s) => s.setWorldReady)
  const shadows = graphics !== 'low'
  const dpr: [number, number] = graphics === 'high' ? [1, 2] : graphics === 'medium' ? [1, 1.5] : [0.75, 1]
  return (
    <Canvas
      key={graphics}
      shadows={shadows}
      dpr={dpr}
      gl={{ antialias: graphics !== 'low', powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 400, position: [6.5, 6, 18] }}
      onCreated={() => setTimeout(() => setReady(true), 350)}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <DayNight shadows={shadows} shadowSize={graphics === 'high' ? 2048 : 1024} />
        <City quality={graphics} />
        <Traffic count={graphics === 'low' ? 3 : 6} />
        <Pedestrians count={graphics === 'low' ? 4 : 7} />
        {NPCS.map((n) => (
          <NPC key={n.id} npc={n} />
        ))}
        <Player />
        <MinuCompanion3D />
        <WorldSystems />
        <LocationLabels />
        <AdaptiveDpr pixelated={false} />
      </Suspense>
    </Canvas>
  )
}

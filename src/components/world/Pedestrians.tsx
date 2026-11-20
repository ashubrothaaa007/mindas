import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Humanoid, type HumanoidLook, type HumanoidMotion } from '../characters/Humanoid'
import type { Vec2 } from '@/data/world'

const ROUTES: { path: Vec2[]; look: HumanoidLook; speed: number }[] = [
  { path: [[5.5, 5.5], [5.5, 30], [35, 30], [35, 5.5]], speed: 1.5, look: { skin: '#8d5a3b', shirt: '#f4efe0', lower: '#f7f3e6', hair: '#1b1410', mundu: true, mustache: true } },
  { path: [[-5.5, -40], [-5.5, 30]], speed: 1.3, look: { skin: '#a06a48', shirt: '#d84a8f', lower: '#f2c33b', hair: '#130d0a', female: true } },
  { path: [[5.5, -45], [5.5, -22]], speed: 1.6, look: { skin: '#7c4e33', shirt: '#3b7be8', lower: '#2d2d3a', hair: '#1b1410' } },
  { path: [[-20, -20.5], [-37, -20.5]], speed: 1.1, look: { skin: '#9a6142', shirt: '#2f9e6b', lower: '#7a2e5a', hair: '#130d0a', female: true } },
  { path: [[-8, 41.5], [32, 41.5]], speed: 1.2, look: { skin: '#87553a', shirt: '#f6c431', lower: '#f7f3e6', hair: '#2a2a2a', mundu: true } },
  { path: [[9, -47], [-15, -47]], speed: 1.4, look: { skin: '#b07a52', shirt: '#7a8fa8', lower: '#24324a', hair: '#1b1410' } },
  { path: [[-5.5, 6], [-34, 6]], speed: 1.25, look: { skin: '#93603f', shirt: '#e8553d', lower: '#eadfc6', hair: '#130d0a', female: true } },
]

function Walker({ path, look, speed, offset }: { path: Vec2[]; look: HumanoidLook; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null)
  const motion = useRef<HumanoidMotion>({ speed, talking: false })
  const pts = useMemo(() => path.map(([x, z]) => new THREE.Vector3(x, 0, z)), [path])
  const lengths = useMemo(() => pts.map((p, i) => p.distanceTo(pts[(i + 1) % pts.length])), [pts])
  const total = lengths.reduce((a, b) => a + b, 0)
  const d = useRef(offset * total)
  useFrame((_, dt) => {
    if (!ref.current) return
    d.current = (d.current + speed * dt) % total
    let rem = d.current
    for (let i = 0; i < pts.length; i++) {
      if (rem <= lengths[i]) {
        const a = pts[i]
        const b = pts[(i + 1) % pts.length]
        ref.current.position.lerpVectors(a, b, rem / lengths[i])
        const yaw = Math.atan2(b.x - a.x, b.z - a.z)
        let diff = yaw - ref.current.rotation.y
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        ref.current.rotation.y += diff * Math.min(1, dt * 5)
        break
      }
      rem -= lengths[i]
    }
  })
  return (
    <group ref={ref}>
      <Humanoid look={look} motion={motion} />
    </group>
  )
}

export function Pedestrians({ count = 7 }: { count?: number }) {
  return (
    <group>
      {ROUTES.slice(0, count).map((r, i) => (
        <Walker key={i} {...r} offset={(i * 0.37) % 1} />
      ))}
    </group>
  )
}

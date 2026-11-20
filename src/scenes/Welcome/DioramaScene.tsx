import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Building, Palms } from '@/components/world/Props'
import { AutoRickshaw } from '@/components/world/Vehicles'
import { Humanoid, type HumanoidLook, type HumanoidMotion } from '@/components/characters/Humanoid'
import type { BuildingDef, Vec2 } from '@/data/world'

const BUILDINGS: BuildingDef[] = [
  { x: -3.2, z: -3.2, w: 3, d: 3, h: 3.4, color: '#f2d7a6', roof: 'tile', roofColor: '#b5482e', windows: true },
  { x: 3.4, z: -3.4, w: 2.8, d: 2.6, h: 5.5, color: '#cfe3c8', roof: 'flat', windows: true },
  { x: -3.4, z: 3.2, w: 2.6, d: 2.8, h: 2.6, color: '#f2b8a2', roof: 'tile', roofColor: '#9c3b26', windows: true },
  { x: 3.3, z: 3.3, w: 2.8, d: 2.8, h: 3.8, color: '#e9d7b0', roof: 'tile', roofColor: '#b5482e', windows: true },
  { x: -6.4, z: 0.2, w: 1.8, d: 3, h: 2.4, color: '#bfd8e8', roof: 'tile', roofColor: '#b5482e', windows: true },
  { x: 0.4, z: -6.6, w: 3.4, d: 1.6, h: 3, color: '#f5d7a1', roof: 'tile', roofColor: '#9c3b26', windows: true },
]
const PALMS: Vec2[] = [
  [-6, -4.5],
  [6.3, -1],
  [5.8, 5.6],
  [-1.6, 6.6],
  [-5.6, 5.2],
  [1.4, -4.2],
]

function CirclingAuto({ radius, speed, offset, body }: { radius: number; speed: number; offset: number; body?: string }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset
    if (!ref.current) return
    ref.current.position.set(Math.cos(t) * radius, 0.12, Math.sin(t) * radius)
    ref.current.rotation.y = -t + (speed > 0 ? Math.PI : 0)
  })
  return (
    <group ref={ref} scale={0.45}>
      <AutoRickshaw body={body} />
    </group>
  )
}

function Walker({ look, radius, speed, offset }: { look: HumanoidLook; radius: number; speed: number; offset: number }) {
  const ref = useRef<THREE.Group>(null)
  const motion = useRef<HumanoidMotion>({ speed: 2.5, talking: false })
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset
    if (!ref.current) return
    ref.current.position.set(Math.cos(t) * radius, 0.12, Math.sin(t) * radius)
    ref.current.rotation.y = -t + (speed > 0 ? Math.PI : 0)
  })
  return (
    <group ref={ref} scale={0.42}>
      <Humanoid look={look} motion={motion} />
    </group>
  )
}

function Island() {
  return (
    <group>
      {/* water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#2c8a80" roughness={0.15} metalness={0.25} />
      </mesh>
      {/* earth */}
      <mesh position={[0, -0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[8.6, 8.2, 1, 64]} />
        <meshStandardMaterial color="#a8572f" roughness={1} />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[8.6, 8.6, 0.1, 64]} />
        <meshStandardMaterial color="#7fb04f" roughness={1} />
      </mesh>
      {/* ring road + cross */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.11, 0]} receiveShadow>
        <ringGeometry args={[5.1, 6.1, 64]} />
        <meshStandardMaterial color="#3d4044" />
      </mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, r]} position={[0, 0.115, 0]} receiveShadow>
          <planeGeometry args={[1.2, 10.4]} />
          <meshStandardMaterial color="#3d4044" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#a3e635" />
      </mesh>
    </group>
  )
}

function Houseboat() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.12
    if (!ref.current) return
    ref.current.position.set(Math.cos(t) * 11, -0.45 + Math.sin(clock.elapsedTime) * 0.04, Math.sin(t) * 11)
    ref.current.rotation.y = -t
  })
  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.3, 3]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 2.2, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#d8b46a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function DioramaScene() {
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [15, 11, 15], fov: 32 }} gl={{ antialias: true }}>
      <color attach="background" args={['#0d1a12']} />
      <fog attach="fog" args={['#0d1a12', 28, 60]} />
      <hemisphereLight args={['#ffe9c4', '#1d4a2b', 1.1]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={2.8}
        color="#ffd29a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-8, 4, -6]} intensity={30} color="#b8f53c" distance={20} />
      <group position={[0, -1.2, 0]}>
        <Float speed={1} rotationIntensity={0.05} floatIntensity={0.25}>
          <Island />
          {BUILDINGS.map((b, i) => (
            <Building key={i} b={b} />
          ))}
          <group scale={1}>
            <Palms positions={PALMS} />
          </group>
          <CirclingAuto radius={5.35} speed={0.45} offset={0} />
          <CirclingAuto radius={5.85} speed={-0.38} offset={2} body="#14361f" />
          <CirclingAuto radius={5.35} speed={0.45} offset={3.3} body="#1a1a1a" />
          <Walker radius={7.2} speed={0.12} offset={0} look={{ skin: '#8d5a3b', shirt: '#f4efe0', lower: '#f7f3e6', hair: '#1b1410', mundu: true, mustache: true }} />
          <Walker radius={7.4} speed={-0.1} offset={2} look={{ skin: '#a06a48', shirt: '#d84a8f', lower: '#f2c33b', hair: '#130d0a', female: true }} />
          <Walker radius={4.4} speed={0.14} offset={4} look={{ skin: '#b07a52', shirt: '#2b8a6e', lower: '#2d3e5c', hair: '#1b1410', backpack: '#a3e635' }} />
        </Float>
        <Houseboat />
        <ContactShadows position={[0, -0.95, 0]} opacity={0.4} scale={30} blur={2.5} far={4} />
      </group>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.5} minPolarAngle={0.8} maxPolarAngle={1.15} />
    </Canvas>
  )
}

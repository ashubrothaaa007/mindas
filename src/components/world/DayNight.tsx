import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGame } from '@/store/game'
import { DAY_LENGTH, PRESET_HOURS, isNight, timeState } from '@/systems/time'
import { playerState } from '@/systems/playerState'

const c = (hex: string) => new THREE.Color(hex)
const FOG_DAY = c('#cfe2df')
const FOG_DUSK = c('#f0b48a')
const FOG_NIGHT = c('#121d33')
const SUN_LOW = c('#ffae63')
const SUN_HIGH = c('#fff3dc')
const MOON = c('#8fa8ff')
const SKY_DAY = c('#cfe8ff')
const SKY_NIGHT = c('#24345c')

export function DayNight({ shadows, shadowSize }: { shadows: boolean; shadowSize: number }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sky = useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  const [night, setNight] = useState(isNight(timeState.hours))
  const timeMode = useGame((s) => s.settings.timeMode)

  useEffect(() => {
    scene.fog = new THREE.Fog(FOG_DAY.clone(), 45, 150)
    if (sun.current) scene.add(sun.current.target)
    return () => {
      scene.fog = null
    }
  }, [scene])

  useFrame((_, dt) => {
    if (timeMode === 'auto') timeState.hours = (timeState.hours + (dt * 24) / DAY_LENGTH) % 24
    else {
      const target = PRESET_HOURS[timeMode]
      timeState.hours += (target - timeState.hours) * Math.min(1, dt * 2)
    }
    const h = timeState.hours
    const elev = Math.sin(((h - 6) / 12) * Math.PI)
    const e = elev * 1.15
    const az = (h / 24) * Math.PI * 2 + 0.6
    const dir = new THREE.Vector3(Math.cos(az) * Math.cos(e), Math.sin(e), Math.sin(az) * Math.cos(e))
    const day = THREE.MathUtils.smoothstep(elev, -0.12, 0.3)
    const dusk = THREE.MathUtils.clamp(1 - Math.abs(elev - 0.08) / 0.28, 0, 1)

    if (sun.current) {
      const light = sun.current
      const lightDir = elev > -0.05 ? dir : dir.clone().multiplyScalar(-1).setY(Math.max(0.5, -dir.y))
      light.position.set(playerState.x + lightDir.x * 60, Math.max(8, lightDir.y * 60), playerState.z + lightDir.z * 60)
      light.target.position.set(playerState.x, 0, playerState.z)
      light.target.updateMatrixWorld()
      light.intensity = elev > -0.05 ? 0.2 + day * 2.6 : 0.45
      light.color.copy(elev > -0.05 ? SUN_LOW.clone().lerp(SUN_HIGH, THREE.MathUtils.smoothstep(elev, 0.05, 0.55)) : MOON)
    }
    if (hemi.current) {
      hemi.current.intensity = 0.45 + day * 0.85
      hemi.current.color.copy(SKY_NIGHT.clone().lerp(SKY_DAY, day))
    }
    if (scene.fog instanceof THREE.Fog) {
      const fog = FOG_NIGHT.clone().lerp(FOG_DAY, day).lerp(FOG_DUSK, dusk * 0.75)
      scene.fog.color.copy(fog)
    }
    if (sky.current) {
      const u = (sky.current.material as THREE.ShaderMaterial).uniforms
      u.sunPosition.value.copy(dir.clone().multiplyScalar(100))
    }
    const n = isNight(h)
    if (n !== night) setNight(n)
  })

  return (
    <>
      <Sky ref={sky as never} distance={450000} turbidity={6} rayleigh={1.6} mieCoefficient={0.006} mieDirectionalG={0.85} />
      {night && <Stars radius={180} depth={40} count={2500} factor={5} fade speed={0.6} />}
      <hemisphereLight ref={hemi} args={['#cfe8ff', '#4a5a32', 1]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
    </>
  )
}

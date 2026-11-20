import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Humanoid, type HumanoidMotion } from './Humanoid'
import { keys } from '@/systems/input'
import { playerState } from '@/systems/playerState'
import { resolveCollisions } from '@/systems/collision'
import { outfitColor, useGame } from '@/store/game'
import { missionById } from '@/data/missions'
import { npcById } from '@/data/world'
import { playFootstep } from '@/services/audio/ambience'

const WALK = 4.6
const SPRINT = 8
const GRAVITY = 24
const JUMP_V = 8.5

export function Player() {
  const group = useRef<THREE.Group>(null)
  const motion = useRef<HumanoidMotion>({ speed: 0, talking: false })
  const vel = useRef(new THREE.Vector3())
  const vy = useRef(0)
  const stepTimer = useRef(0)
  const camTarget = useRef(new THREE.Vector3())
  const camPos = useRef(new THREE.Vector3())
  const { camera, gl } = useThree()
  const outfit = useGame((s) => outfitColor(s.progress.outfit))

  // Mouse camera: drag to orbit, wheel to zoom
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0
    const down = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      const sens = useGame.getState().settings.mouseSensitivity * 0.005
      playerState.camYaw -= (e.clientX - lastX) * sens
      playerState.camPitch = THREE.MathUtils.clamp(playerState.camPitch + (e.clientY - lastY) * sens, 0.08, 1.2)
      lastX = e.clientX
      lastY = e.clientY
    }
    const up = (e: PointerEvent) => {
      dragging = false
      el.style.cursor = 'grab'
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      playerState.camDist = THREE.MathUtils.clamp(playerState.camDist + e.deltaY * 0.01, 4.5, 16)
    }
    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useGame.getState()
    const convo = s.conversationMissionId
    const blocked = !!convo || !!s.overlay || !!s.reward || !!s.activity

    // Input → desired velocity in camera space
    let ix = 0
    let iz = 0
    if (!blocked) {
      if (keys.has('KeyW') || keys.has('ArrowUp')) iz += 1
      if (keys.has('KeyS') || keys.has('ArrowDown')) iz -= 1
      if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1
      if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1
    }
    const yaw = playerState.camYaw
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
    const wish = fwd.multiplyScalar(iz).add(right.multiplyScalar(ix))
    const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight')
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(sprint ? SPRINT : WALK)
    vel.current.lerp(wish, 1 - Math.exp(-dt * 12))

    let nx = playerState.x + vel.current.x * dt
    let nz = playerState.z + vel.current.z * dt
    ;[nx, nz] = resolveCollisions(nx, nz, 0.45)
    playerState.x = nx
    playerState.z = nz

    // Jump
    if (!blocked && keys.has('Space') && playerState.y <= 0.001) vy.current = JUMP_V
    vy.current -= GRAVITY * dt
    playerState.y = Math.max(0, playerState.y + vy.current * dt)
    if (playerState.y === 0) vy.current = Math.max(0, vy.current)

    const speed = Math.hypot(vel.current.x, vel.current.z)
    playerState.speed = speed

    if (!blocked && playerState.y <= 0.02 && speed > 0.65) {
      stepTimer.current += dt
      const stride = THREE.MathUtils.mapLinear(THREE.MathUtils.clamp(speed, WALK, SPRINT), WALK, SPRINT, 0.48, 0.31)
      if (stepTimer.current >= stride) {
        playFootstep(speed, s.settings.volume)
        stepTimer.current %= stride
      }
    } else {
      stepTimer.current = 0
    }

    // Facing
    let targetFacing = playerState.facing
    const npc = convo ? npcById(missionById(convo)?.npcId ?? '') : null
    if (npc) targetFacing = Math.atan2(npc.pos[0] - nx, npc.pos[1] - nz)
    else if (speed > 0.3) targetFacing = Math.atan2(vel.current.x, vel.current.z)
    let diff = targetFacing - playerState.facing
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    playerState.facing += diff * (1 - Math.exp(-dt * 12))

    motion.current.speed = speed
    motion.current.airborne = playerState.y > 0.05
    motion.current.talking = false

    if (group.current) {
      group.current.position.set(nx, playerState.y, nz)
      group.current.rotation.y = playerState.facing
    }

    // Camera
    if (npc) {
      // Cinematic over-the-shoulder framing for conversations
      const mid = new THREE.Vector3((nx + npc.pos[0]) / 2, 1.5, (nz + npc.pos[1]) / 2)
      const dir = new THREE.Vector3(npc.pos[0] - nx, 0, npc.pos[1] - nz).normalize()
      const side = new THREE.Vector3(dir.z, 0, -dir.x)
      const desired = new THREE.Vector3(nx, 2.4, nz).addScaledVector(dir, -3.4).addScaledVector(side, 1.8)
      camPos.current.lerp(desired, 1 - Math.exp(-dt * 3))
      camTarget.current.lerp(mid.setY(1.9), 1 - Math.exp(-dt * 3))
    } else {
      const { camPitch: pitch, camDist: dist } = playerState
      const desired = new THREE.Vector3(nx + Math.sin(yaw) * dist * Math.cos(pitch), playerState.y + 1.6 + Math.sin(pitch) * dist, nz + Math.cos(yaw) * dist * Math.cos(pitch))
      if (camPos.current.lengthSq() === 0) camPos.current.copy(desired)
      camPos.current.lerp(desired, 1 - Math.exp(-dt * 8))
      camTarget.current.lerp(new THREE.Vector3(nx, playerState.y + 1.5, nz), 1 - Math.exp(-dt * 12))
    }
    camera.position.copy(camPos.current)
    camera.lookAt(camTarget.current)
  })

  return (
    <group ref={group}>
      <Humanoid look={{ skin: '#b07a52', shirt: outfit ?? '#2b8a6e', lower: '#2d3e5c', hair: '#1b1410', backpack: '#a3e635' }} motion={motion} />
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  )
}

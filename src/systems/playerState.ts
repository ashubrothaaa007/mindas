import { PLAYER_SPAWN } from '@/data/world'

/** Mutable per-frame player state shared between the 3D scene and the HUD (no React re-renders). */
export const playerState = {
  x: PLAYER_SPAWN[0],
  y: 0,
  z: PLAYER_SPAWN[1],
  facing: Math.PI,
  camYaw: 0,
  camPitch: 0.42,
  camDist: 9,
  speed: 0,
}

export function resetPlayer() {
  playerState.x = PLAYER_SPAWN[0]
  playerState.z = PLAYER_SPAWN[1]
  playerState.y = 0
  playerState.facing = Math.PI
  playerState.camYaw = 0
}

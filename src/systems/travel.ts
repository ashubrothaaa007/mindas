import { npcById, LOCATIONS } from '@/data/world'
import { playerState } from './playerState'
import { resolveCollisions } from './collision'

/** Places the player just in front of an NPC, facing them. */
export function travelToNpc(npcId: string) {
  const npc = npcById(npcId)
  if (!npc) return
  const fx = Math.sin(npc.rot)
  const fz = Math.cos(npc.rot)
  const [x, z] = resolveCollisions(npc.pos[0] + fx * 2.4, npc.pos[1] + fz * 2.4, 0.45)
  playerState.x = x
  playerState.z = z
  playerState.y = 0
  playerState.facing = Math.atan2(npc.pos[0] - x, npc.pos[1] - z)
  playerState.camYaw = playerState.facing + Math.PI
}

export function travelToLocation(id: string) {
  const l = LOCATIONS.find((x) => x.id === id)
  if (!l) return
  const [x, z] = resolveCollisions(l.pos[0] + 2, l.pos[1] + 2, 0.45)
  playerState.x = x
  playerState.z = z
  playerState.y = 0
}

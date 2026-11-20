import { COLLIDERS } from '@/data/world'

/** Pushes a circle (player) out of axis-aligned boxes. Returns the corrected position. */
export function resolveCollisions(x: number, z: number, r: number): [number, number] {
  for (let pass = 0; pass < 2; pass++) {
    for (const c of COLLIDERS) {
      const cx = Math.max(c.minX, Math.min(x, c.maxX))
      const cz = Math.max(c.minZ, Math.min(z, c.maxZ))
      const dx = x - cx
      const dz = z - cz
      const d2 = dx * dx + dz * dz
      if (d2 < r * r) {
        if (d2 > 1e-6) {
          const d = Math.sqrt(d2)
          x = cx + (dx / d) * r
          z = cz + (dz / d) * r
        } else {
          // centre inside box: push out along the shallowest axis
          const pens = [x - c.minX, c.maxX - x, z - c.minZ, c.maxZ - z]
          const i = pens.indexOf(Math.min(...pens))
          if (i === 0) x = c.minX - r
          else if (i === 1) x = c.maxX + r
          else if (i === 2) z = c.minZ - r
          else z = c.maxZ + r
        }
      }
    }
  }
  x = Math.max(-72, Math.min(72, x))
  z = Math.max(-72, Math.min(61, z))
  return [x, z]
}

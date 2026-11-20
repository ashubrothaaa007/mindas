import * as THREE from 'three'

const cache = new Map<string, THREE.Texture>()

function canvasTex(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = true) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

/** Facade with windows and shutters, tinted by the material colour. */
export function windowTexture() {
  return canvasTex('windows', 128, 128, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const x = 16 + i * 64
        const y = 14 + j * 64
        g.fillStyle = '#d9d2c2'
        g.fillRect(x - 4, y - 4, 40, 44)
        g.fillStyle = '#3b4a52'
        g.fillRect(x, y, 32, 36)
        g.fillStyle = '#5c7480'
        g.fillRect(x + 2, y + 2, 13, 32)
        g.fillStyle = '#4b626d'
        g.fillRect(x + 17, y + 2, 13, 32)
        g.fillStyle = '#c9bfa8'
        g.fillRect(x - 6, y + 38, 44, 5)
      }
    }
  })
}

/** Emissive mask for lit windows at night */
export function windowGlowTexture() {
  return canvasTex('windows-glow', 128, 128, (g) => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, 128, 128)
    const lit = [
      [0, 0],
      [1, 1],
      [0, 1],
    ]
    for (const [i, j] of lit) {
      g.fillStyle = '#ffcf7a'
      g.fillRect(16 + i * 64, 14 + j * 64, 32, 36)
    }
  })
}

export function roofTileTexture() {
  return canvasTex('roof', 64, 64, (g) => {
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 64, 64)
    for (let y = 0; y < 64; y += 8) {
      g.fillStyle = 'rgba(0,0,0,0.22)'
      g.fillRect(0, y + 6, 64, 2)
      for (let x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) {
        g.fillStyle = 'rgba(0,0,0,0.12)'
        g.fillRect(x, y, 1.5, 8)
      }
    }
  })
}

export function groundTexture() {
  return canvasTex('ground', 256, 256, (g) => {
    g.fillStyle = '#6f9a46'
    g.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 1600; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      const s = Math.random() * 3 + 1
      g.fillStyle = Math.random() > 0.5 ? 'rgba(140,180,80,0.35)' : 'rgba(70,110,40,0.35)'
      g.fillRect(x, y, s, s)
    }
  })
}

export function pavementTexture() {
  return canvasTex('pavement', 128, 128, (g) => {
    g.fillStyle = '#c9b49a'
    g.fillRect(0, 0, 128, 128)
    g.strokeStyle = 'rgba(90,70,50,0.35)'
    g.lineWidth = 2
    for (let i = 0; i <= 128; i += 32) {
      g.beginPath()
      g.moveTo(i, 0)
      g.lineTo(i, 128)
      g.moveTo(0, i)
      g.lineTo(128, i)
      g.stroke()
    }
  })
}

export function asphaltTexture() {
  return canvasTex('asphalt', 128, 128, (g) => {
    g.fillStyle = '#3d4044'
    g.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)'
      g.fillRect(Math.random() * 128, Math.random() * 128, 2, 2)
    }
  })
}

/** Shop sign with text, generated per label */
export function signTexture(text: string, bg: string) {
  return canvasTex(
    `sign-${text}-${bg}`,
    512,
    128,
    (g) => {
      g.fillStyle = bg
      g.fillRect(0, 0, 512, 128)
      g.strokeStyle = 'rgba(255,255,255,0.6)'
      g.lineWidth = 6
      g.strokeRect(8, 8, 496, 112)
      g.fillStyle = '#fff6dc'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      let size = 64
      g.font = `700 ${size}px "Baloo Chettan 2", "Fredoka", sans-serif`
      while (g.measureText(text).width > 460 && size > 20) {
        size -= 4
        g.font = `700 ${size}px "Baloo Chettan 2", "Fredoka", sans-serif`
      }
      g.fillText(text, 256, 70)
    },
    false,
  )
}

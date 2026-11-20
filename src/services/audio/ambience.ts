/**
 * Procedural city ambience (no audio files): traffic rumble, breeze, birds,
 * distant horns. Built with WebAudio and started after the first user gesture.
 */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let timers: number[] = []

function noiseBuffer(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
  const d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    d[i] = last * 3.5
  }
  return b
}

function chirp(c: AudioContext, out: AudioNode) {
  const t = c.currentTime
  const n = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < n; i++) {
    const o = c.createOscillator()
    const g = c.createGain()
    const st = t + i * 0.13
    const f = 2600 + Math.random() * 1400
    o.frequency.setValueAtTime(f, st)
    o.frequency.exponentialRampToValueAtTime(f * 1.4, st + 0.07)
    g.gain.setValueAtTime(0.0001, st)
    g.gain.exponentialRampToValueAtTime(0.05, st + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.1)
    o.connect(g).connect(out)
    o.start(st)
    o.stop(st + 0.12)
  }
}

function horn(c: AudioContext, out: AudioNode) {
  const t = c.currentTime
  const beeps = Math.random() > 0.5 ? 2 : 1
  for (let i = 0; i < beeps; i++) {
    const st = t + i * 0.22
    const o = c.createOscillator()
    const o2 = c.createOscillator()
    const g = c.createGain()
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800
    o.type = o2.type = 'square'
    o.frequency.value = 420 + Math.random() * 60
    o2.frequency.value = o.frequency.value * 1.26
    g.gain.setValueAtTime(0.0001, st)
    g.gain.exponentialRampToValueAtTime(0.018, st + 0.02)
    g.gain.setValueAtTime(0.018, st + 0.14)
    g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18)
    o.connect(lp)
    o2.connect(lp)
    lp.connect(g).connect(out)
    o.start(st)
    o2.start(st)
    o.stop(st + 0.2)
    o2.stop(st + 0.2)
  }
}

export function startAmbience(volume: number) {
  if (ctx) {
    setAmbienceVolume(volume)
    ctx.resume().catch(() => {})
    return
  }
  try {
    ctx = new AudioContext()
  } catch {
    return
  }
  master = ctx.createGain()
  master.gain.value = volume * 0.5
  master.connect(ctx.destination)
  const buf = noiseBuffer(ctx)
  // Traffic rumble
  const rumble = ctx.createBufferSource()
  rumble.buffer = buf
  rumble.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 260
  const rg = ctx.createGain()
  rg.gain.value = 0.22
  rumble.connect(lp).connect(rg).connect(master)
  rumble.start()
  // Breeze through palms
  const breeze = ctx.createBufferSource()
  breeze.buffer = buf
  breeze.loop = true
  breeze.playbackRate.value = 0.7
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.6
  const bg = ctx.createGain()
  bg.gain.value = 0.05
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.12
  lfoGain.gain.value = 0.04
  lfo.connect(lfoGain).connect(bg.gain)
  lfo.start()
  breeze.connect(bp).connect(bg).connect(master)
  breeze.start()
  const loop = (fn: () => void, min: number, max: number) => {
    const run = () => {
      if (!ctx || !master) return
      fn()
      timers.push(window.setTimeout(run, min + Math.random() * (max - min)))
    }
    timers.push(window.setTimeout(run, min + Math.random() * (max - min)))
  }
  loop(() => ctx && master && chirp(ctx, master), 2500, 7000)
  loop(() => ctx && master && horn(ctx, master), 6000, 16000)
}

export function setAmbienceVolume(v: number) {
  if (master && ctx) master.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.2)
}

export function stopAmbience() {
  timers.forEach(clearTimeout)
  timers = []
  ctx?.close().catch(() => {})
  ctx = null
  master = null
}

/** Short, layered footstep that follows the player's walking or sprinting cadence. */
export function playFootstep(speed: number, volume: number) {
  try {
    const c = ctx
    if (!c || c.state !== 'running' || speed < 0.2 || volume <= 0) return
    const now = c.currentTime
    const level = Math.min(0.045, Math.max(0.008, speed / 8 * 0.035)) * volume

    // Soft low-frequency ground contact.
    const thud = c.createOscillator()
    const thudGain = c.createGain()
    thud.type = 'sine'
    thud.frequency.setValueAtTime(105 + Math.random() * 20, now)
    thud.frequency.exponentialRampToValueAtTime(48, now + 0.09)
    thudGain.gain.setValueAtTime(0.0001, now)
    thudGain.gain.exponentialRampToValueAtTime(level, now + 0.008)
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)
    thud.connect(thudGain).connect(c.destination)
    thud.start(now)
    thud.stop(now + 0.12)

    // A very quiet filtered scuff adds texture without an audio asset.
    const length = Math.floor(c.sampleRate * 0.065)
    const buffer = c.createBuffer(1, length, c.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length)
    const noise = c.createBufferSource()
    const filter = c.createBiquadFilter()
    const scuff = c.createGain()
    noise.buffer = buffer
    filter.type = 'lowpass'
    filter.frequency.value = 900 + Math.random() * 500
    scuff.gain.value = level * 0.32
    noise.connect(filter).connect(scuff).connect(c.destination)
    noise.start(now)
  } catch {
    /* audio unavailable */
  }
}

/** Short UI blips used for rewards and recording cues. */
export function blip(kind: 'start' | 'stop' | 'success' | 'coin', volume: number) {
  try {
    const c = ctx ?? new AudioContext()
    const t = c.currentTime
    const notes = { start: [660, 880], stop: [880, 660], success: [523, 659, 784, 1047], coin: [988, 1319] }[kind]
    notes.forEach((f, i) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = 'triangle'
      o.frequency.value = f
      const st = t + i * 0.09
      g.gain.setValueAtTime(0.0001, st)
      g.gain.exponentialRampToValueAtTime(0.12 * volume, st + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.18)
      o.connect(g).connect(c.destination)
      o.start(st)
      o.stop(st + 0.2)
    })
  } catch {
    /* audio unavailable */
  }
}

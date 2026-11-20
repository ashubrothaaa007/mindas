import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Lock, MapPin, Moon, Navigation2, Sun, Sunset, ScrollText, Cloud, CloudOff } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { PlayerStats } from '../ui/Stats'
import { SideNav } from '../ui/SideNav'
import { Minu } from '../mascot/Minu'
import { isMissionUnlocked, useGame } from '@/store/game'
import { missionById } from '@/data/missions'
import { BUILDINGS, LOCATIONS, NPCS, ROADS, npcById } from '@/data/world'
import { playerState } from '@/systems/playerState'
import { formatClock, isNight, timeState } from '@/systems/time'
import { useT } from '@/hooks/useT'
import { backendMode } from '@/services/config'

function useTicker(ms: number) {
  const [, set] = useState(0)
  useEffect(() => {
    const id = setInterval(() => set((x) => x + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}

export function TopLeft() {
  useTicker(1000)
  const h = timeState.hours
  const Icon = isNight(h) ? Moon : h > 16.5 || h < 7.5 ? Sunset : Sun
  return (
    <div className="flex flex-col gap-2">
      <div className="glass rounded-2xl py-2 pl-2 pr-4">
        <Logo sub="Kochi · Kerala" />
      </div>
      <div className="flex gap-2">
        <div className="glass inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-bold text-cream">
          <Icon className="h-4 w-4 text-sun" /> {formatClock(h)}
        </div>
        <div className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-bold text-sage" title={backendMode() === 'demo' ? 'Voice runs on your browser’s speech engines with on-device evaluation. Connect the backend for Sarvam + Gemini.' : 'Connected to MINDA voice backend'}>
          {backendMode() === 'demo' ? <CloudOff className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5 text-lime" />}
          {backendMode() === 'demo' ? 'Demo mode' : 'Cloud voice'}
        </div>
      </div>
    </div>
  )
}

export function TopRight() {
  const setScreen = useGame((s) => s.setScreen)
  return <PlayerStats onProfile={() => setScreen('profile')} />
}

export function LeftNav() {
  return <SideNav floating />
}

export function MissionPanel() {
  const t = useT()
  useTicker(1000)
  const tracked = useGame((s) => s.progress.trackedMissionId)
  const setOverlay = useGame((s) => s.setOverlay)
  const m = tracked ? missionById(tracked) : null
  const npc = m ? npcById(m.npcId) : null
  const loc = m ? LOCATIONS.find((l) => l.id === m.locationId) : null
  if (!m || !npc) {
    return (
      <div className="glass w-[300px] rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Minu mood="wave" size={64} shadow={false} />
          <div>
            <div className="font-display text-[16px] font-semibold text-cream">{t('noMission')}</div>
            <p className="text-[13px] text-sage">{t('noMissionHint')}</p>
          </div>
        </div>
        <button onClick={() => setOverlay('missions')} className="btn-ghost mt-4 w-full py-2.5 text-[14px]">
          Browse missions <span className="kbd ml-2 !h-5 !text-[10px]">J</span>
        </button>
      </div>
    )
  }
  const d = Math.hypot(npc.pos[0] - playerState.x, npc.pos[1] - playerState.z)
  const ang = Math.atan2(npc.pos[0] - playerState.x, npc.pos[1] - playerState.z)
  const rel = ang - (playerState.camYaw + Math.PI)
  return (
    <motion.div layout className="glass w-[320px] overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between bg-lime/95 px-5 py-2.5 text-forest">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">{t('currentMission')}</span>
        <ScrollText className="h-4 w-4" />
      </div>
      <div className="p-5">
        <div className="font-display text-[22px] font-semibold leading-tight text-cream">{m.title}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-sage">
          <MapPin className="h-3.5 w-3.5" /> {loc?.name} · {npc.name}
        </div>
        <div className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-lime/80">{t('objective')}</div>
        <p className="mt-1 text-[14px] leading-snug text-cream/90">{m.brief}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sage">{t('distance')}</div>
            <div className="mt-1 flex items-center gap-2">
              <Navigation2 className="h-4 w-4 text-lime transition-transform" style={{ transform: `rotate(${(-rel * 180) / Math.PI}deg)` }} />
              <span className="font-display text-[20px] font-semibold tabular-nums text-cream">{d < 3.5 ? 'Here' : `${Math.round(d)} m`}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sage">{t('reward')}</div>
            <div className="mt-1 flex items-center gap-1.5 font-display text-[15px] font-semibold text-cream">
              <Gift className="h-4 w-4 text-sun" /> {m.rewards.xp} XP · {m.rewards.coins}c
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function InteractionPrompt() {
  const t = useT()
  const nearby = useGame((s) => s.nearbyNpcId)
  const completed = useGame((s) => s.progress.completedMissions)
  const openConversation = useGame((s) => s.openConversation)
  const npc = nearby ? npcById(nearby) : null
  const m = npc ? missionById(npc.missionId) : null
  const locked = m ? !isMissionUnlocked(m.id, completed) : false
  const done = m ? completed.includes(m.id) : false
  const prereq = m?.unlockAfter ? missionById(m.unlockAfter) : null
  return (
    <AnimatePresence>
      {npc && m && (
        <motion.div key={npc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col items-center gap-3">
          <div className="card-cream relative w-[520px] overflow-hidden !rounded-2xl py-4 pl-7 pr-6">
            <span className={`absolute inset-y-0 left-0 w-2 ${locked ? 'bg-sage' : 'bg-sun'}`} />
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#c89a12]">
              {LOCATIONS.find((l) => l.id === m.locationId)?.name} · {npc.role}
            </div>
            <div className="mt-1 flex items-center gap-2 font-display text-[24px] font-semibold">
              {locked && <Lock className="h-5 w-5" />} {m.title}
              {done && <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-forest">Completed · replay</span>}
            </div>
            <p className="mt-1 text-[14px] text-forest/75">{locked ? `Complete “${prereq?.title}” to unlock this mission.` : m.brief}</p>
          </div>
          {!locked && (
            <button onClick={() => openConversation(m.id)} className="btn-primary flex items-center gap-3 px-6 py-3 text-[16px]">
              <span className="kbd !bg-forest !text-lime !shadow-none">E</span> {t('talkTo')} {npc.name}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ControlsHint() {
  const t = useT()
  const items: [string, string][] = [
    ['WASD', t('move')],
    ['Shift', t('sprint')],
    ['Space', t('jump')],
    ['E', t('interact')],
    ['M', t('map')],
    ['J', t('missions')],
    ['Esc', t('pause')],
  ]
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
      {items.map(([k, l]) => (
        <div key={k} className="flex items-center gap-1.5 text-[12px] font-bold text-cream/80">
          <span className="kbd">{k}</span> {l}
        </div>
      ))}
      <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 text-[12px] font-bold text-cream/60">{t('camera')}</div>
    </div>
  )
}

export function Minimap({ size = 196 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const setOverlay = useGame((s) => s.setOverlay)
  useEffect(() => {
    const c = ref.current!
    const dpr = window.devicePixelRatio || 1
    c.width = size * dpr
    c.height = size * dpr
    const g = c.getContext('2d')!
    const S = 2.1
    const draw = () => {
      const { progress } = useGame.getState()
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, size, size)
      g.save()
      g.beginPath()
      g.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
      g.clip()
      g.fillStyle = '#5c8a3e'
      g.fillRect(0, 0, size, size)
      g.translate(size / 2, size / 2)
      g.rotate(playerState.camYaw)
      g.scale(S, S)
      g.translate(-playerState.x, -playerState.z)
      g.fillStyle = '#2c8a80'
      g.fillRect(-120, 62.5, 240, 40)
      g.fillStyle = '#d9c4a2'
      for (const r of ROADS) g.fillRect(r.x - r.w / 2 - 3, r.z - r.d / 2 - 3, r.w + 6, r.d + 6)
      g.fillStyle = '#3d4044'
      for (const r of ROADS) g.fillRect(r.x - r.w / 2, r.z - r.d / 2, r.w, r.d)
      g.fillStyle = '#f3ead0'
      for (const b of BUILDINGS) g.fillRect(b.x - b.w / 2, b.z - b.d / 2, b.w, b.d)
      const tracked = progress.trackedMissionId ? missionById(progress.trackedMissionId) : null
      for (const n of NPCS) {
        const m = missionById(n.missionId)!
        const done = progress.completedMissions.includes(m.id)
        const locked = !isMissionUnlocked(m.id, progress.completedMissions)
        g.beginPath()
        g.arc(n.pos[0], n.pos[1], tracked?.npcId === n.id ? 2.4 : 1.5, 0, Math.PI * 2)
        g.fillStyle = done ? '#9fb69a' : locked ? '#6b746d' : m.kind === 'story' ? '#b8f53c' : '#fbf6e6'
        g.fill()
        if (tracked?.npcId === n.id) {
          g.lineWidth = 0.8
          g.strokeStyle = '#14361f'
          g.stroke()
        }
      }
      // player
      g.translate(playerState.x, playerState.z)
      g.rotate(-playerState.facing)
      g.beginPath()
      g.moveTo(0, 2.8)
      g.lineTo(1.9, -1.8)
      g.lineTo(0, -0.8)
      g.lineTo(-1.9, -1.8)
      g.closePath()
      g.fillStyle = '#fff'
      g.strokeStyle = '#14361f'
      g.lineWidth = 0.6
      g.fill()
      g.stroke()
      g.restore()
      // tracked target arrow on rim
      if (tracked) {
        const npc = npcById(tracked.npcId)!
        const dx = npc.pos[0] - playerState.x
        const dz = npc.pos[1] - playerState.z
        const dist = Math.hypot(dx, dz) * S
        if (dist > size / 2 - 10) {
          const cy = Math.cos(playerState.camYaw)
          const sy = Math.sin(playerState.camYaw)
          const rx = dx * cy - dz * sy
          const rz = dx * sy + dz * cy
          const a = Math.atan2(rz, rx)
          const R = size / 2 - 11
          g.save()
          g.translate(size / 2 + Math.cos(a) * R, size / 2 + Math.sin(a) * R)
          g.rotate(a)
          g.beginPath()
          g.moveTo(7, 0)
          g.lineTo(-5, -6)
          g.lineTo(-5, 6)
          g.closePath()
          g.fillStyle = '#b8f53c'
          g.strokeStyle = '#14361f'
          g.lineWidth = 2
          g.fill()
          g.stroke()
          g.restore()
        }
      }
      // north marker
      const na = playerState.camYaw - Math.PI / 2
      g.fillStyle = '#fbf6e6'
      g.font = '700 11px Fredoka, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText('N', size / 2 + Math.cos(na) * (size / 2 - 12), size / 2 + Math.sin(na) * (size / 2 - 12))
    }
    const id = setInterval(draw, 80)
    draw()
    return () => clearInterval(id)
  }, [size])
  return (
    <button onClick={() => setOverlay('map')} className="group relative rounded-full p-1.5 glass" aria-label="Open map" style={{ width: size + 12, height: size + 12 }}>
      <canvas ref={ref} style={{ width: size, height: size }} className="rounded-full" />
      <span className="kbd absolute -bottom-1 left-1/2 -translate-x-1/2">M</span>
    </button>
  )
}

export function CompanionWidget() {
  const toggle = useGame((s) => s.toggleOverlay)
  const overlay = useGame((s) => s.overlay)
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={() => toggle('companion')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex items-end"
      aria-label="Ask Minu for hints"
    >
      <AnimatePresence>
        {(hover || overlay === 'companion') && (
          <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute bottom-16 right-[88px] whitespace-nowrap rounded-xl bg-cream px-3 py-1.5 font-display text-[13px] font-semibold text-forest shadow-lg">
            Need a hint?
          </motion.span>
        )}
      </AnimatePresence>
      <div className="rounded-full bg-forest/60 p-1 ring-2 ring-lime/40 backdrop-blur transition group-hover:ring-lime">
        <Minu mood={hover ? 'wave' : 'idle'} size={70} shadow={false} />
      </div>
    </button>
  )
}

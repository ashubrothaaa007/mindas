import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Check, Coins, Flame, Gift, Lock, MessageSquareText, Mic, Star, Trophy, Compass, MessageCircle } from 'lucide-react'
import { SideNav } from '@/components/ui/SideNav'
import { PlayerStats } from '@/components/ui/Stats'
import { Logo } from '@/components/ui/Logo'
import { Minu } from '@/components/mascot/Minu'
import { isMissionUnlocked, isUnitUnlocked, localDateKey, today, useGame } from '@/store/game'
import { ACTIVITY_REWARDS, UNITS, type ActivityType } from '@/data/learning'
import { missionById, STORY_MISSIONS } from '@/data/missions'
import { travelToNpc } from '@/systems/travel'
import { useT } from '@/hooks/useT'

type NodeState = 'done' | 'current' | 'open' | 'locked'
interface PathNode {
  key: string
  unitIdx: number
  type: ActivityType | 'chest'
  state: NodeState
  x: number
  y: number
}

const ICON: Record<ActivityType | 'chest', typeof BookOpen> = { words: BookOpen, sentences: MessageSquareText, conversation: Mic, challenge: Trophy, chest: Gift }
const LABEL: Record<ActivityType | 'chest', string> = { words: 'Learn 5 words', sentences: 'Practise 5 sentences', conversation: 'NPC conversation', challenge: 'Daily challenge', chest: 'Unit reward' }

const STEP = 128
const UNIT_GAP = 150

export function LearningPathPage() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(720)
  const t = useT()
  const progress = useGame((s) => s.progress)
  const openActivity = useGame((s) => s.openActivity)
  const setScreen = useGame((s) => s.setScreen)
  const trackMission = useGame((s) => s.trackMission)
  const pushToast = useGame((s) => s.pushToast)
  const setTrackMission = useGame((s) => s.trackMission)
  const conversationPathDay = progress.conversationPathDay ?? 1
  const conversationPathCount = progress.conversationPathDate === today() ? progress.conversationPathCount ?? 0 : 0
  const conversationPathCompleteToday = progress.conversationPathLastCompletedDate === today()

  const startConversationPath = () => {
    const mission = STORY_MISSIONS.find((item) => isMissionUnlocked(item.id, progress.completedMissions) && !progress.completedMissions.includes(item.id))
      ?? STORY_MISSIONS.find((item) => isMissionUnlocked(item.id, progress.completedMissions))
      ?? STORY_MISSIONS[0]
    setTrackMission(mission.id)
    travelToNpc(mission.npcId)
    setScreen('world')
  }

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const measure = () => setCanvasWidth(Math.max(300, Math.min(720, element.clientWidth)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const W = canvasWidth

  const { nodes, height, headers, current } = useMemo(() => {
    const nodes: PathNode[] = []
    const headers: { unitIdx: number; y: number }[] = []
    let y = 40
    let k = 0
    let current: PathNode | null = null
    UNITS.forEach((u, ui) => {
      headers.push({ unitIdx: ui, y })
      y += UNIT_GAP
      const unlocked = isUnitUnlocked(ui, progress.completedMissions)
      const up = progress.unitProgress[u.id] ?? {}
      const convDone = progress.completedMissions.includes(u.missionId)
      const doneMap: Record<ActivityType, boolean> = { words: up.words !== undefined, sentences: up.sentences !== undefined, conversation: convDone, challenge: up.challenge !== undefined }
      const types: (ActivityType | 'chest')[] = ['words', 'sentences', 'conversation', 'challenge', 'chest']
      types.forEach((type) => {
        let state: NodeState
        if (!unlocked) state = 'locked'
        else if (type === 'chest') state = doneMap.words && doneMap.sentences && doneMap.conversation && doneMap.challenge ? 'done' : 'locked'
        else if (doneMap[type]) state = 'done'
        else if (type === 'challenge' && !convDone) state = 'locked'
        else state = 'open'
        const x = W / 2 + Math.sin(k * 0.95) * Math.min(170, W * 0.25)
        const node: PathNode = { key: `${u.id}-${type}`, unitIdx: ui, type, state, x, y }
        if (!current && state === 'open') {
          node.state = 'current'
          current = node
        }
        nodes.push(node)
        y += STEP
        k++
      })
    })
    return { nodes, height: y + 40, headers, current: current as PathNode | null }
  }, [progress.completedMissions, progress.unitProgress, W])

  const pathD = useMemo(() => {
    let d = ''
    nodes.forEach((n, i) => {
      if (i === 0) d += `M ${n.x} ${n.y}`
      else {
        const p = nodes[i - 1]
        const my = (p.y + n.y) / 2
        d += ` C ${p.x} ${my}, ${n.x} ${my}, ${n.x} ${n.y}`
      }
    })
    return d
  }, [nodes])
  const doneD = useMemo(() => {
    const lastDone = nodes.reduce((acc, n, i) => (n.state === 'done' ? i : acc), -1)
    const upto = current ? nodes.indexOf(current) : lastDone
    return nodes.slice(0, Math.max(1, upto + 1)).reduce((d, n, i, arr) => {
      if (i === 0) return `M ${n.x} ${n.y}`
      const p = arr[i - 1]
      const my = (p.y + n.y) / 2
      return `${d} C ${p.x} ${my}, ${n.x} ${my}, ${n.x} ${n.y}`
    }, '')
  }, [nodes, current])

  const onNode = (n: PathNode) => {
    const unit = UNITS[n.unitIdx]
    if (n.state === 'locked') {
      if (n.type === 'chest') return pushToast({ kind: 'info', title: 'Unit reward', body: 'Finish all four activities in this unit to open it.' })
      if (n.type === 'challenge') return pushToast({ kind: 'info', title: 'Challenge locked', body: `Complete the conversation “${missionById(unit.missionId)?.title}” first.` })
      return pushToast({ kind: 'info', title: 'Unit locked', body: `Finish “${missionById(UNITS[n.unitIdx - 1]?.missionId)?.title}” in the world to unlock.` })
    }
    if (n.type === 'chest') return pushToast({ kind: 'achievement', title: `${unit.title} complete!`, body: `Badge: ${missionById(unit.missionId)?.badge}` })
    if (n.type === 'conversation') {
      const m = missionById(unit.missionId)!
      trackMission(m.id)
      travelToNpc(m.npcId)
      setScreen('world')
      return
    }
    openActivity(unit.id, n.type)
  }

  const daily = progress.daily?.date === today() ? progress.daily.done : []
  const dailyItems: { type: ActivityType; label: string }[] = [
    { type: 'words', label: 'Learn five new words' },
    { type: 'sentences', label: 'Practise five useful sentences' },
    { type: 'conversation', label: 'Complete an NPC conversation' },
    { type: 'challenge', label: 'Complete a daily challenge' },
  ]
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = localDateKey(d)
    return { key, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), active: (progress.dailyLog[key] ?? 0) > 0 }
  })

  return (
    <div className="app-page learning-page relative flex h-full w-full overflow-hidden bg-ink">
      <aside className="app-sidebar flex w-[260px] shrink-0 flex-col gap-5 p-6">
        <Logo sub="Kochi · Kerala" />
        <div className="flex-1">
          <SideNav />
        </div>
      </aside>

      {/* Path */}
      <main className="learning-main scroll-thin relative flex-1 overflow-y-auto">
        <div className="learning-heading sticky top-0 z-20 flex items-center justify-between bg-gradient-to-b from-ink via-ink/90 to-transparent px-10 pb-8 pt-6">
          <div>
            <div className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-lime/80">{t('dailyPath')}</div>
            <h1 className="font-display text-[38px] font-semibold leading-tight text-cream">Your Malayalam journey</h1>
          </div>
          <PlayerStats onProfile={() => setScreen('profile')} />
        </div>
        <section className="conversation-path-mobile-card mx-auto mb-5 w-[min(720px,calc(100%-28px))] rounded-3xl border border-lime/20 bg-forest-2 p-4 shadow-lg" aria-labelledby="conversation-path-title">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/15 text-lime"><MessageCircle className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 id="conversation-path-title" className="font-display text-[17px] font-semibold text-cream">Day {conversationPathDay} · Talk to someone</h2>
              <p className="text-[13px] text-sage">{conversationPathCompleteToday ? `Day ${conversationPathDay - 1} complete. Your next daily challenge is ready tomorrow.` : `${conversationPathCount} of ${conversationPathDay} conversations complete · earn XP and coins with every conversation.`}</p>
            </div>
            {!conversationPathCompleteToday && <button type="button" onClick={startConversationPath} className="btn-primary shrink-0 px-4 text-[13px]">Explore</button>}
          </div>
        </section>
        <div ref={canvasRef} className="learning-canvas relative mx-auto -mt-4" style={{ width: '100%', maxWidth: 720, height }}>
          <PathBackdrop width={W} height={height} />
          <svg width={W} height={height} className="absolute inset-0">
            <path d={pathD} stroke="rgba(251,246,230,0.12)" strokeWidth={22} fill="none" strokeLinecap="round" />
            <path d={pathD} stroke="rgba(251,246,230,0.25)" strokeWidth={3} strokeDasharray="2 14" fill="none" strokeLinecap="round" />
            <motion.path d={doneD} stroke="#a3e635" strokeWidth={10} fill="none" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
          </svg>
          {headers.map((h) => {
            const u = UNITS[h.unitIdx]
            const unlocked = isUnitUnlocked(h.unitIdx, progress.completedMissions)
            return (
              <div key={u.id} className="path-unit-header absolute left-1/2 z-10 w-[520px] -translate-x-1/2" style={{ top: h.y - 10 }}>
                <div className={`flex items-center gap-4 rounded-3xl px-6 py-4 ${unlocked ? 'bg-lime text-forest shadow-[0_6px_0_#4f8a14]' : 'bg-white/5 text-sage ring-1 ring-white/10'}`}>
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl font-display text-[20px] font-bold ${unlocked ? 'bg-forest text-lime' : 'bg-white/5'}`}>{unlocked ? h.unitIdx + 1 : <Lock className="h-5 w-5" />}</div>
                  <div className="flex-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-70">Unit {h.unitIdx + 1}</div>
                    <div className="font-display text-[22px] font-semibold leading-tight">{u.title}</div>
                    <div className="text-[13px] font-semibold opacity-75">{u.subtitle}</div>
                  </div>
                </div>
              </div>
            )
          })}
          {nodes.map((n) => (
            <PathNodeButton key={n.key} node={n} onClick={() => onNode(n)} />
          ))}
          {current && (
            <motion.div className="pointer-events-none absolute z-10" style={{ top: current.y - 70, left: current.x > W / 2 ? current.x - 230 : current.x + 70 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <Minu mood="excited" size={120} />
            </motion.div>
          )}
        </div>
      </main>

      {/* Right column */}
      <aside className="learning-aside scroll-thin flex w-[340px] shrink-0 flex-col gap-4 overflow-y-auto p-6">
        <div className="glass rounded-3xl border border-lime/20 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/15 text-lime"><MessageCircle className="h-5 w-5" /></div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime/80">Free-world conversation</div>
              <div className="mt-1 font-display text-[21px] font-semibold text-cream">Day {conversationPathDay}</div>
              <p className="mt-1 text-[13px] text-sage">{conversationPathCompleteToday ? `Completed! Day ${conversationPathDay - 1} is saved. Come back tomorrow for your next challenge.` : `${conversationPathCount}/${conversationPathDay} conversations today. Earn XP and coins as you speak.`}</p>
            </div>
          </div>
          {!conversationPathCompleteToday && <button type="button" onClick={startConversationPath} className="btn-primary mt-4 w-full px-4 text-[14px]"><Compass className="h-4 w-4" /> Explore and talk</button>}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime transition-[width] duration-300" style={{ width: `${Math.min(100, (conversationPathCount / conversationPathDay) * 100)}%` }} /></div>
          <div className="mt-2 text-[12px] font-semibold text-sage">{(progress.completedConversationDays ?? []).length} daily levels completed</div>
        </div>
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral/20">
              <Flame className="h-6 w-6 text-coral" />
            </div>
            <div>
              <div className="font-display text-[28px] font-bold leading-none text-cream">{progress.streak} day streak</div>
              <div className="text-[13px] text-sage">Best: {progress.bestStreak} days</div>
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            {week.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-1.5">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${d.active ? 'bg-coral text-cream' : 'bg-white/5 text-sage'}`}>{d.active ? <Flame className="h-4 w-4" /> : null}</span>
                <span className="text-[11px] font-bold text-sage">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="font-display text-[18px] font-semibold text-cream">Today’s goals</div>
            <div className="font-display text-[14px] font-semibold text-lime">{daily.length}/4</div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${(daily.length / 4) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-2.5">
            {dailyItems.map((d) => {
              const done = daily.includes(d.type)
              const Icon = ICON[d.type]
              return (
                <li key={d.type} className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${done ? 'bg-lime text-forest' : 'bg-white/5 text-sage'}`}>{done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span>
                  <span className={`flex-1 text-[14px] font-semibold ${done ? 'text-sage line-through' : 'text-cream'}`}>{d.label}</span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-sun">
                    <Coins className="h-3.5 w-3.5" />
                    {ACTIVITY_REWARDS[d.type].coins}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="glass relative overflow-hidden rounded-3xl p-5">
          <div className="font-display text-[18px] font-semibold text-cream">{current ? 'Up next' : 'All caught up!'}</div>
          <p className="mt-1 text-[14px] text-sage">
            {current ? `${LABEL[current.type]} · ${UNITS[current.unitIdx].title}` : 'You’ve completed every unit available in Kochi. Replay activities to sharpen your skills.'}
          </p>
          {current && (
            <button onClick={() => onNode(current)} className="btn-primary mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-[15px]">
              {current.type === 'conversation' ? <Compass className="h-4 w-4" /> : <Star className="h-4 w-4" />} {current.type === 'conversation' ? 'Go to the world' : 'Start'}
            </button>
          )}
          <div className="absolute -bottom-3 -right-2">
            <Minu mood="wave" size={90} shadow={false} />
          </div>
        </div>
      </aside>
    </div>
  )
}

function PathNodeButton({ node, onClick }: { node: PathNode; onClick: () => void }) {
  const Icon = node.state === 'locked' && node.type !== 'chest' ? Lock : ICON[node.type]
  const size = node.type === 'chest' ? 76 : 84
  const styles: Record<NodeState, string> = {
    done: 'bg-gradient-to-b from-[#c2f75a] to-[#7cc41f] text-forest shadow-[0_7px_0_#4f8a14]',
    current: 'bg-gradient-to-b from-sun to-[#e9b10f] text-forest shadow-[0_7px_0_#a77a06]',
    open: 'bg-gradient-to-b from-[#2f7044] to-[#1d4a2b] text-lime shadow-[0_7px_0_#0f2a19] ring-2 ring-lime/40',
    locked: 'bg-gradient-to-b from-[#3a4a40] to-[#2a352e] text-sage/70 shadow-[0_7px_0_#1a221d]',
  }
  return (
    <div className="absolute z-10 flex flex-col items-center" style={{ left: node.x - size / 2, top: node.y - size / 2, width: size }}>
      {node.state === 'current' && (
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute -top-11 whitespace-nowrap rounded-xl bg-cream px-3 py-1 font-display text-[14px] font-bold text-forest shadow-lg">
          START
        </motion.div>
      )}
      <button onClick={onClick} className={`relative grid place-items-center rounded-full transition hover:brightness-110 active:translate-y-1 ${styles[node.state]}`} style={{ width: size, height: size }} aria-label={LABEL[node.type]}>
        {node.state === 'current' && <span className="absolute -inset-2 rounded-full border-4 border-sun/40" style={{ animation: 'pulse-ring 1.8s ease-out infinite' }} />}
        {node.state === 'done' && node.type !== 'chest' ? <Check className="h-9 w-9" strokeWidth={3} /> : <Icon className="h-8 w-8" strokeWidth={2.4} />}
      </button>
      <div className={`mt-3 whitespace-nowrap rounded-lg px-2 py-0.5 text-center font-display text-[13px] font-medium ${node.state === 'locked' ? 'text-sage/60' : 'text-cream'} bg-ink/60`}>{LABEL[node.type]}</div>
    </div>
  )
}

function PathBackdrop({ width, height }: { width: number; height: number }) {
  const palms = useMemo(() => Array.from({ length: Math.floor(height / 160) }, (_, i) => ({ x: i % 2 ? width - 40 - (i % 3) * 20 : 30 + (i % 4) * 14, y: 120 + i * 160, s: 0.8 + (i % 3) * 0.2 })), [height, width])
  return (
    <svg width={width + 240} height={height} className="pointer-events-none absolute -left-[120px] top-0" aria-hidden>
      <defs>
        <linearGradient id="river" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2c8a80" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2c8a80" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {/* backwater ribbon */}
      <path d={`M ${width + 200} 0 C ${width - 40} ${height * 0.2}, ${width + 220} ${height * 0.45}, ${width - 20} ${height * 0.7} S ${width + 160} ${height}, ${width + 120} ${height}`} stroke="url(#river)" strokeWidth={90} fill="none" />
      {/* hills */}
      {Array.from({ length: Math.ceil(height / 420) }, (_, i) => (
        <g key={i} opacity={0.5}>
          <ellipse cx={i % 2 ? 60 : width + 180} cy={260 + i * 420} rx={190} ry={120} fill="#1d4a2b" />
          <ellipse cx={i % 2 ? 140 : width + 100} cy={300 + i * 420} rx={150} ry={90} fill="#24572f" />
        </g>
      ))}
      {palms.map((p, i) => (
        <g key={i} transform={`translate(${p.x + 120} ${p.y}) scale(${p.s})`} opacity={0.55}>
          <path d="M0 0 Q 6 -40 2 -80" stroke="#6b4f33" strokeWidth={6} fill="none" strokeLinecap="round" />
          {[-60, -25, 15, 50, 90, 130].map((a) => (
            <path key={a} d="M2 -80 q 22 -10 40 8" stroke="#3f8a2e" strokeWidth={7} fill="none" strokeLinecap="round" transform={`rotate(${a} 2 -80)`} />
          ))}
        </g>
      ))}
    </svg>
  )
}

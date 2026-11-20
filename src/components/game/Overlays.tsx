import { useEffect, useState } from 'react'
import { CheckCircle2, Coins, Compass, Lightbulb, Lock, Map as MapIcon, MapPin, Backpack, Play, ScrollText, Sparkles, Shirt, Navigation, Volume2 } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Minu } from '../mascot/Minu'
import { isMissionUnlocked, useGame } from '@/store/game'
import { MISSIONS, missionById, STORY_MISSIONS } from '@/data/missions'
import { BUILDINGS, LOCATIONS, NPCS, ROADS, npcById } from '@/data/world'
import { SHOP } from '@/data/learning'
import { playerState } from '@/systems/playerState'
import { travelToLocation, travelToNpc } from '@/systems/travel'
import { useSpeak } from '@/hooks/useSpeak'
import { useT } from '@/hooks/useT'

/* ---------------- Map ---------------- */

export function MapOverlay() {
  const t = useT()
  const overlay = useGame((s) => s.overlay)
  const setOverlay = useGame((s) => s.setOverlay)
  const visited = useGame((s) => s.progress.visited)
  const completed = useGame((s) => s.progress.completedMissions)
  const tracked = useGame((s) => s.progress.trackedMissionId)
  const trackMission = useGame((s) => s.trackMission)
  const [sel, setSel] = useState<string | null>(null)
  const [, tick] = useState(0)
  useEffect(() => {
    if (overlay !== 'map') return
    const id = setInterval(() => tick((x) => x + 1), 200)
    return () => clearInterval(id)
  }, [overlay])
  const loc = LOCATIONS.find((l) => l.id === sel)
  const locMissions = loc ? MISSIONS.filter((m) => m.locationId === loc.id) : []
  return (
    <Modal open={overlay === 'map'} onClose={() => setOverlay(null)} title="Kochi City Map" kicker={`${visited.length} / ${LOCATIONS.length} places discovered`} width={1180} icon={<MapIcon className="h-5 w-5" />}>
      <div className="grid grid-cols-[1fr_300px]">
        <div className="p-5">
          <svg viewBox="-76 -76 152 142" className="w-full rounded-2xl bg-[#5c8a3e]">
            <rect x={-80} y={62.5} width={160} height={10} fill="#2c8a80" />
            {ROADS.map((r, i) => (
              <rect key={`s${i}`} x={r.x - r.w / 2 - 3} y={r.z - r.d / 2 - 3} width={r.w + 6} height={r.d + 6} fill="#d9c4a2" />
            ))}
            {ROADS.map((r, i) => (
              <rect key={i} x={r.x - r.w / 2} y={r.z - r.d / 2} width={r.w} height={r.d} fill="#3d4044" />
            ))}
            {BUILDINGS.map((b, i) => (
              <rect key={i} x={b.x - b.w / 2} y={b.z - b.d / 2} width={b.w} height={b.d} fill="#f3ead0" stroke="#14361f" strokeOpacity={0.25} strokeWidth={0.3} rx={0.6} />
            ))}
            {NPCS.map((n) => {
              const m = missionById(n.missionId)!
              const done = completed.includes(m.id)
              const locked = !isMissionUnlocked(m.id, completed)
              return <circle key={n.id} cx={n.pos[0]} cy={n.pos[1]} r={tracked === m.id ? 2.2 : 1.4} fill={done ? '#9fb69a' : locked ? '#6b746d' : m.kind === 'story' ? '#b8f53c' : '#fbf6e6'} stroke="#14361f" strokeWidth={0.4} />
            })}
            {LOCATIONS.map((l) => {
              const v = visited.includes(l.id)
              return (
                <g key={l.id} onClick={() => setSel(l.id)} className="cursor-pointer">
                  <circle cx={l.pos[0]} cy={l.pos[1]} r={sel === l.id ? 4.2 : 3.4} fill={v ? '#fbf6e6' : '#14361f'} stroke={sel === l.id ? '#b8f53c' : '#fbf6e6'} strokeWidth={0.8} />
                  <text x={l.pos[0]} y={l.pos[1] + 1.1} textAnchor="middle" fontSize={3} fontWeight={800} fill={v ? '#14361f' : '#fbf6e6'}>
                    {v ? l.name[0] : '?'}
                  </text>
                  <text x={l.pos[0]} y={l.pos[1] - 5} textAnchor="middle" fontSize={3.2} fontWeight={700} fill="#fff" stroke="#0d1a12" strokeWidth={0.6} paintOrder="stroke" fontFamily="Fredoka">
                    {v ? l.name : 'Undiscovered'}
                  </text>
                </g>
              )
            })}
            <g transform={`translate(${playerState.x} ${playerState.z}) rotate(${(-playerState.facing * 180) / Math.PI})`}>
              <circle r={4} fill="#b8f53c" opacity={0.3} />
              <path d="M0 3 L2 -2 L0 -1 L-2 -2 Z" fill="#fff" stroke="#14361f" strokeWidth={0.5} />
            </g>
          </svg>
          <div className="mt-3 flex gap-4 text-[12px] font-bold text-sage">
            <Legend color="#b8f53c" label="Story mission" />
            <Legend color="#fbf6e6" label="Chat with a local" />
            <Legend color="#6b746d" label="Locked" />
            <Legend color="#9fb69a" label="Completed" />
          </div>
        </div>
        <div className="border-l border-white/10 p-5">
          {loc ? (
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime/80">{visited.includes(loc.id) ? 'Discovered' : 'Not yet discovered'}</div>
              <div className="mt-1 font-display text-[22px] font-semibold text-cream">{loc.name}</div>
              <div className="ml text-[16px] text-sage">{loc.ml}</div>
              <div className="mt-4 space-y-2">
                {locMissions.map((m) => {
                  const locked = !isMissionUnlocked(m.id, completed)
                  const done = completed.includes(m.id)
                  return (
                    <div key={m.id} className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="flex items-center gap-2 font-display text-[15px] font-semibold text-cream">
                        {done ? <CheckCircle2 className="h-4 w-4 text-lime" /> : locked ? <Lock className="h-4 w-4 text-sage" /> : <Sparkles className="h-4 w-4 text-lime" />} {m.title}
                      </div>
                      <p className="mt-1 text-[12px] text-sage">{m.brief}</p>
                      {!locked && m.kind === 'story' && (
                        <button onClick={() => trackMission(m.id)} className={`mt-2 h-8 rounded-lg px-3 text-[12px] font-bold ${tracked === m.id ? 'bg-lime text-forest' : 'bg-white/10 text-cream hover:bg-white/15'}`}>
                          {tracked === m.id ? 'Tracking' : 'Track mission'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <button
                disabled={!visited.includes(loc.id)}
                onClick={() => {
                  const m = locMissions[0]
                  if (m) travelToNpc(m.npcId)
                  else travelToLocation(loc.id)
                  setOverlay(null)
                }}
                className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3"
              >
                <Navigation className="h-4 w-4" /> {visited.includes(loc.id) ? 'Fast travel here' : 'Discover on foot first'}
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Minu mood="thinking" size={110} />
              <p className="mt-3 text-[14px] text-sage">Select a place on the map to see its missions. Discovered places unlock fast travel.</p>
              <p className="mt-2 text-[12px] font-bold text-sage/70">{t('map')}: M</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="h-3 w-3 rounded-full ring-1 ring-forest" style={{ background: color }} /> {label}
  </span>
)

/* ---------------- Missions ---------------- */

export function MissionsOverlay() {
  const t = useT()
  const overlay = useGame((s) => s.overlay)
  const setOverlay = useGame((s) => s.setOverlay)
  const setScreen = useGame((s) => s.setScreen)
  const screen = useGame((s) => s.screen)
  const completed = useGame((s) => s.progress.completedMissions)
  const tracked = useGame((s) => s.progress.trackedMissionId)
  const trackMission = useGame((s) => s.trackMission)
  const chats = MISSIONS.filter((m) => m.kind === 'chat')

  const go = (id: string) => {
    const m = missionById(id)!
    if (m.kind === 'story') trackMission(id)
    travelToNpc(m.npcId)
    setOverlay(null)
    if (screen !== 'world') setScreen('world')
  }

  const Row = ({ id }: { id: string }) => {
    const m = missionById(id)!
    const npc = npcById(m.npcId)!
    const done = completed.includes(id)
    const locked = !isMissionUnlocked(id, completed)
    const prereq = m.unlockAfter ? missionById(m.unlockAfter) : null
    return (
      <div className={`flex items-center gap-4 rounded-2xl p-4 ring-1 transition ${tracked === id ? 'bg-lime/10 ring-lime/60' : 'bg-white/[0.04] ring-white/10'}`}>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? 'bg-lime text-forest' : locked ? 'bg-white/5 text-sage' : 'bg-forest-3 text-lime'}`}>
          {done ? <CheckCircle2 className="h-6 w-6" /> : locked ? <Lock className="h-5 w-5" /> : <ScrollText className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[18px] font-semibold text-cream">{m.title}</span>
            {tracked === id && <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-forest">Tracking</span>}
          </div>
          <div className="text-[13px] text-sage">
            {LOCATIONS.find((l) => l.id === m.locationId)?.name} · {npc.name}
          </div>
          <p className="mt-1 text-[13px] text-cream/75">{locked ? `Unlocks after “${prereq?.title}”.` : m.brief}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-[14px] font-semibold text-sun">
            +{m.rewards.xp} XP · +{m.rewards.coins}c
          </div>
          {!locked && (
            <div className="mt-2 flex justify-end gap-2">
              {m.kind === 'story' && !done && tracked !== id && (
                <button onClick={() => trackMission(id)} className="h-9 rounded-xl bg-white/10 px-3 text-[13px] font-bold text-cream hover:bg-white/15">
                  Track
                </button>
              )}
              <button onClick={() => go(id)} className="btn-primary inline-flex h-9 items-center gap-1.5 !rounded-xl px-3 text-[13px]">
                <Play className="h-3.5 w-3.5" /> {done ? 'Replay' : 'Go there'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Modal open={overlay === 'missions'} onClose={() => setOverlay(null)} title={t('missions')} kicker={`${completed.filter((c) => STORY_MISSIONS.some((m) => m.id === c)).length} / ${STORY_MISSIONS.length} story missions complete`} icon={<ScrollText className="h-5 w-5" />}>
      <div className="space-y-6 p-7">
        <section>
          <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-lime/80">Story · Kochi</h3>
          <div className="space-y-2.5">
            {STORY_MISSIONS.map((m) => (
              <Row key={m.id} id={m.id} />
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-lime/80">Chat with locals</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {chats.map((m) => (
              <Row key={m.id} id={m.id} />
            ))}
          </div>
        </section>
      </div>
    </Modal>
  )
}

/* ---------------- Inventory ---------------- */

export function InventoryOverlay() {
  const t = useT()
  const overlay = useGame((s) => s.overlay)
  const setOverlay = useGame((s) => s.setOverlay)
  const progress = useGame((s) => s.progress)
  const buy = useGame((s) => s.buy)
  const equip = useGame((s) => s.equip)
  const pushToast = useGame((s) => s.pushToast)

  return (
    <Modal open={overlay === 'inventory'} onClose={() => setOverlay(null)} title={t('inventory')} kicker="Spend coins on optional extras. Learning is always free." icon={<Backpack className="h-5 w-5" />} width={1000}>
      <div className="grid grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center border-r border-white/10 p-6">
          <Minu mood="excited" size={150} />
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
              <Coins className="mx-auto h-5 w-5 text-sun" />
              <div className="mt-1 font-display text-[22px] font-semibold text-cream">{progress.coins}</div>
              <div className="text-[11px] font-bold text-sage">Coins</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
              <Lightbulb className="mx-auto h-5 w-5 text-sun" />
              <div className="mt-1 font-display text-[22px] font-semibold text-cream">{progress.hintTokens}</div>
              <div className="text-[11px] font-bold text-sage">Hint tokens</div>
            </div>
          </div>
          <p className="mt-4 text-center text-[12px] text-sage">Earn coins from lessons (20), sentence practice (30), conversations (50) and daily challenges (100).</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-6">
          {SHOP.map((item) => {
            const owned = item.kind !== 'hint' && progress.owned.includes(item.id)
            const equipped = (item.kind === 'outfit' && progress.outfit === item.id) || (item.kind === 'minu' && progress.minuScarf === item.id)
            const afford = progress.coins >= item.price
            return (
              <div key={item.id} className="flex gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: item.color ?? '#2a6339' }}>
                  {item.kind === 'hint' ? <Lightbulb className="h-6 w-6 text-sun" /> : item.kind === 'outfit' ? <Shirt className="h-6 w-6 text-forest" /> : <Sparkles className="h-6 w-6 text-forest" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="font-display text-[16px] font-semibold text-cream">{item.name}</div>
                  <p className="text-[12px] text-sage">{item.desc}</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="inline-flex items-center gap-1 font-display text-[14px] font-semibold text-sun">
                      <Coins className="h-4 w-4" /> {item.price}
                    </span>
                    {owned ? (
                      <button
                        onClick={() => equip(equipped ? null : item.id, item.kind === 'outfit' ? 'outfit' : 'minu')}
                        className={`h-8 rounded-lg px-3 text-[12px] font-bold ${equipped ? 'bg-lime text-forest' : 'bg-white/10 text-cream hover:bg-white/15'}`}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        disabled={!afford}
                        onClick={() => buy(item.id) && pushToast({ kind: 'info', title: `Purchased: ${item.name}` })}
                        className="btn-primary h-8 !rounded-lg px-3 text-[12px]"
                      >
                        {afford ? 'Buy' : 'Need more coins'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Companion (Minu hints) ---------------- */

export function CompanionPanel() {
  const overlay = useGame((s) => s.overlay)
  const setOverlay = useGame((s) => s.setOverlay)
  const tracked = useGame((s) => s.progress.trackedMissionId)
  const streak = useGame((s) => s.progress.streak)
  const setScreen = useGame((s) => s.setScreen)
  const speaker = useSpeak()
  const m = tracked ? missionById(tracked) : null
  const npc = m ? npcById(m.npcId) : null
  const loc = m ? LOCATIONS.find((l) => l.id === m.locationId) : null
  const phrase = m?.turns[0].reply
  return (
    <Modal open={overlay === 'companion'} onClose={() => setOverlay(null)} title="Minu’s hints" kicker="Your fox companion" width={720} icon={<Lightbulb className="h-5 w-5" />}>
      <div className="flex gap-6 p-7">
        <div className="shrink-0">
          <Minu mood="talking" size={140} />
        </div>
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl bg-cream p-4 text-forest">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-forest/50">Where to next</div>
            <p className="mt-1 text-[15px] font-semibold">
              {m && npc ? `Find ${npc.name} at ${loc?.name}. Follow the green arrow at your feet, or the arrow on the minimap.` : 'You’ve finished every story mission! Chat with locals or practise on the learning path.'}
            </p>
          </div>
          {phrase && (
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime/80">Phrase to warm up with</div>
              <div className="ml mt-1 text-[22px] font-bold text-lime-bright">{phrase.text}</div>
              <div className="text-[14px] italic text-cream/70">{phrase.roman}</div>
              <div className="text-[14px] text-sage">{phrase.intent}</div>
              <button onClick={() => speaker.play(phrase, { slow: true })} className="btn-ghost mt-3 inline-flex h-9 items-center gap-2 px-3 text-[13px]">
                <Volume2 className="h-4 w-4" /> Hear it slowly
              </button>
            </div>
          )}
          <ul className="space-y-1.5 text-[14px] text-cream/80">
            <li className="flex gap-2">
              <Compass className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> Exploring new places earns XP and unlocks fast travel on the map.
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> Glowing green diamonds mean a story mission; cream ones are quick chats.
            </li>
            <li className="flex gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
              {streak > 0 ? `You’re on a ${streak}-day streak. Keep it going today!` : 'Finish any activity today to start your streak.'}
            </li>
          </ul>
          <button
            onClick={() => {
              setOverlay(null)
              setScreen('path')
            }}
            className="btn-primary px-5 py-2.5 text-[14px]"
          >
            Practise on the learning path
          </button>
        </div>
      </div>
    </Modal>
  )
}

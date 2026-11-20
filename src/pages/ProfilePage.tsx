import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, BookOpen, Coins, Compass, Crown, Flag, Flame, Lock, MessageCircle, Mic, Pencil, Trophy, MapPin } from 'lucide-react'
import { SideNav } from '@/components/ui/SideNav'
import { Logo } from '@/components/ui/Logo'
import { Avatar, LevelRing } from '@/components/ui/Stats'
import { Minu } from '@/components/mascot/Minu'
import { levelFromXp, localDateKey, useGame, XP_PER_LEVEL } from '@/store/game'
import { ACHIEVEMENTS } from '@/data/achievements'
import { MISSIONS, STORY_MISSIONS, missionById } from '@/data/missions'
import { LOCATIONS } from '@/data/world'
import { LANGUAGES, PLAYABLE_TARGETS, TARGET_OPTIONS } from '@/data/languages'
import { UNITS } from '@/data/learning'
import { useT } from '@/hooks/useT'

const ACH_ICON = { message: MessageCircle, flag: Flag, flame: Flame, mic: Mic, compass: Compass, crown: Crown }

export function ProfilePage() {
  const t = useT()
  const profile = useGame((s) => s.profile)
  const progress = useGame((s) => s.progress)
  const setProfile = useGame((s) => s.setProfile)
  const resetAll = useGame((s) => s.resetAll)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile.name)
  const [confirmReset, setConfirmReset] = useState(false)
  const [vocabFilter, setVocabFilter] = useState<'all' | 'new' | 'review' | 'mastered'>('all')

  const level = levelFromXp(progress.xp)
  const scores = progress.scores.slice(-24)
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0
  const storyDone = STORY_MISSIONS.filter((m) => progress.completedMissions.includes(m.id)).length
  const unitActs = UNITS.reduce((acc, u) => acc + Object.keys(progress.unitProgress[u.id] ?? {}).length, 0)
  const mlProgress = Math.round(((storyDone + unitActs) / (STORY_MISSIONS.length + UNITS.length * 3)) * 100)

  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const key = localDateKey(d)
        return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), v: progress.dailyLog[key] ?? 0 }
      }),
    [progress.dailyLog],
  )
  const maxWeek = Math.max(4, ...week.map((w) => w.v))
  const vocabulary = Object.values(progress.vocabulary ?? {}).filter((word) => vocabFilter === 'all' || word.status === vocabFilter)

  const stats = [
    { icon: BookOpen, label: 'Words learned', value: progress.learnedWords.length },
    { icon: MessageCircle, label: 'Sentences spoken', value: progress.history.length },
    { icon: Trophy, label: 'Missions complete', value: progress.completedMissions.length },
    { icon: MapPin, label: 'Places discovered', value: `${progress.visited.length}/${LOCATIONS.length}` },
  ]

  return (
    <div className="app-page profile-page relative flex h-full w-full overflow-hidden bg-ink">
      <aside className="app-sidebar flex w-[260px] shrink-0 flex-col gap-5 p-6">
        <Logo sub="Kochi · Kerala" />
        <div className="flex-1">
          <SideNav />
        </div>
      </aside>
      <main className="app-main scroll-thin flex-1 overflow-y-auto p-6 pl-0">
        <div className="profile-content mx-auto max-w-[1180px] space-y-5">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-forest-2 via-forest to-ink p-8 ring-1 ring-lime/15">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />
            <div className="profile-hero-content flex items-center gap-8">
              <div className="relative">
                <Avatar size={128} />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-forest p-1">
                  <LevelRing size={52} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-lime/80">{t('progress')}</div>
                {editing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      setProfile({ name: name.trim() || 'Explorer' })
                      setEditing(false)
                    }}
                    className="mt-1 flex gap-2"
                  >
                    <input autoFocus value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} className="h-12 rounded-xl bg-white/10 px-4 font-display text-[28px] text-cream outline-none ring-1 ring-lime/40" />
                    <button className="btn-primary px-4">Save</button>
                  </form>
                ) : (
                  <h1 className="mt-1 flex items-center gap-3 font-display text-[44px] font-semibold leading-none text-cream">
                    {profile.name}
                    <button onClick={() => setEditing(true)} className="grid h-9 w-9 place-items-center rounded-xl text-sage ring-1 ring-white/10 hover:text-cream" aria-label="Edit name">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </h1>
                )}
                <div className="mt-2 text-[15px] text-sage">
                  Learning <span className="ml text-cream">{LANGUAGES[profile.targetLang].native}</span> from {LANGUAGES[profile.nativeLang].name} · Kochi, Kerala
                </div>
                <div className="mt-5 max-w-xl">
                  <div className="flex justify-between text-[13px] font-bold">
                    <span className="text-cream">
                      {t('level')} {level}
                    </span>
                    <span className="text-sage">
                      {progress.xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to level {level + 1}
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-lime-deep to-lime-bright" initial={{ width: 0 }} animate={{ width: `${((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100}%` }} transition={{ duration: 1 }} />
                  </div>
                </div>
              </div>
              <div className="profile-hero-stats flex gap-3">
                <BigStat icon={<Coins className="h-6 w-6 text-sun" />} value={progress.coins} label={t('coins')} />
                <BigStat icon={<Flame className="h-6 w-6 text-coral" />} value={progress.streak} label={`${t('streak')} · best ${progress.bestStreak}`} />
                <BigStat icon={<Award className="h-6 w-6 text-lime" />} value={progress.xp} label="Total XP" />
              </div>
              <div className="hidden xl:block">
                <Minu mood="wave" size={130} />
              </div>
            </div>
          </section>

          <div className="profile-stats-grid grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="glass flex items-center gap-4 rounded-3xl p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-lime">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-[28px] font-bold leading-none text-cream">{s.value}</div>
                  <div className="mt-1 text-[13px] font-semibold text-sage">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <section className="glass rounded-3xl p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-[20px] font-semibold text-cream">My vocabulary</h2>
                <p className="text-[13px] text-sage">Words you have studied, with practice status and attempt history.</p>
              </div>
              <div className="flex gap-2" aria-label="Filter vocabulary">
                {(['all', 'new', 'review', 'mastered'] as const).map((filter) => (
                  <button key={filter} onClick={() => setVocabFilter(filter)} className={`rounded-xl px-3 py-2 text-[12px] font-bold capitalize ${vocabFilter === filter ? 'bg-lime text-forest' : 'bg-white/5 text-sage hover:text-cream'}`}>
                    {filter} {filter === 'all' ? Object.keys(progress.vocabulary ?? {}).length : Object.values(progress.vocabulary ?? {}).filter((word) => word.status === filter).length}
                  </button>
                ))}
              </div>
            </div>
            {vocabulary.length ? (
              <div className="profile-vocabulary-grid mt-4 grid grid-cols-2 gap-3">
                {vocabulary.map((word) => (
                  <div key={word.text} className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                    <div className="ml min-w-[100px] text-[24px] font-bold text-lime">{word.text}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-cream">{word.meaning}</div>
                      <div className="text-[12px] italic text-sage">{word.roman}</div>
                      <div className="mt-1 text-[11px] text-sage">{word.attempts} attempt{word.attempts === 1 ? '' : 's'} · last practised {word.lastPracticeDate}</div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ${word.status === 'mastered' ? 'bg-lime/15 text-lime' : word.status === 'review' ? 'bg-coral/15 text-coral' : 'bg-sun/15 text-sun'}`}>{word.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-[13px] text-sage">{vocabFilter === 'all' ? 'Study a word lesson to start your collection.' : `No ${vocabFilter} words yet.`}</div>
            )}
          </section>

          <div className="profile-columns grid grid-cols-[1.4fr_1fr] gap-5">
            {/* Speaking chart */}
            <section className="glass rounded-3xl p-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-[20px] font-semibold text-cream">Speaking progress</h2>
                  <p className="text-[13px] text-sage">Score of your last {scores.length || 0} spoken replies</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-[34px] font-bold leading-none text-lime">{avg || '—'}</div>
                  <div className="text-[12px] font-bold text-sage">average</div>
                </div>
              </div>
              <ScoreChart values={scores.map((s) => s.score)} />
            </section>
            {/* Weekly */}
            <section className="glass rounded-3xl p-6">
              <h2 className="font-display text-[20px] font-semibold text-cream">This week</h2>
              <p className="text-[13px] text-sage">Activities completed per day</p>
              <div className="mt-6 flex h-[170px] items-end justify-between gap-3">
                {week.map((w, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-display text-[12px] font-semibold text-cream/80">{w.v || ''}</span>
                    <motion.div className={`w-full rounded-xl ${i === 6 ? 'bg-lime' : 'bg-lime/40'}`} initial={{ height: 4 }} animate={{ height: Math.max(4, (w.v / maxWeek) * 130) }} transition={{ delay: i * 0.05 }} />
                    <span className="text-[11px] font-bold text-sage">{w.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="profile-support-grid grid grid-cols-[1fr_1fr_1fr] gap-5">
            {/* Languages */}
            <section className="glass rounded-3xl p-6">
              <h2 className="font-display text-[20px] font-semibold text-cream">Languages</h2>
              <div className="mt-4 space-y-3">
                {TARGET_OPTIONS.slice(0, 5).map((c) => {
                  const active = c === profile.targetLang
                  return (
                    <div key={c} className="flex items-center gap-3">
                      <span className={`ml grid h-10 w-10 place-items-center rounded-xl text-[18px] font-bold ${active ? 'bg-lime text-forest' : 'bg-white/5 text-sage'}`}>{LANGUAGES[c].glyph}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-[14px] font-semibold">
                          <span className={active ? 'text-cream' : 'text-sage'}>{LANGUAGES[c].name}</span>
                          <span className="text-sage">{active ? `${mlProgress}%` : PLAYABLE_TARGETS.includes(c) ? '0%' : 'Soon'}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-lime" style={{ width: `${active ? mlProgress : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
            {/* Missions */}
            <section className="glass rounded-3xl p-6">
              <h2 className="font-display text-[20px] font-semibold text-cream">Completed missions</h2>
              <div className="mt-4 space-y-2">
                {MISSIONS.filter((m) => progress.completedMissions.includes(m.id)).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
                    <Trophy className="h-4 w-4 text-sun" />
                    <span className="flex-1 font-display text-[15px] text-cream">{m.title}</span>
                    {m.badge && <span className="text-[11px] font-bold text-lime">{m.badge}</span>}
                  </div>
                ))}
                {progress.completedMissions.length === 0 && <Empty text="No missions yet. Raju Bhai is waiting at the auto stand!" />}
              </div>
            </section>
            {/* Achievements */}
            <section className="glass rounded-3xl p-6">
              <h2 className="font-display text-[20px] font-semibold text-cream">Achievements</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((a) => {
                  const got = progress.achievements.includes(a.id)
                  const Icon = got ? ACH_ICON[a.icon] : Lock
                  return (
                    <div key={a.id} className="flex flex-col items-center text-center" title={a.desc}>
                      <div className={`grid h-16 w-16 place-items-center rounded-full ${got ? 'bg-gradient-to-b from-sun to-[#e0a20b] text-forest shadow-[0_0_0_4px_rgba(252,211,77,0.2)]' : 'bg-white/5 text-sage/60'}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className={`mt-2 text-[12px] font-bold leading-tight ${got ? 'text-cream' : 'text-sage/70'}`}>{a.title}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Conversation history */}
          <section className="glass rounded-3xl p-6">
            <h2 className="font-display text-[20px] font-semibold text-cream">Conversation history</h2>
            <div className="mt-4 divide-y divide-white/5">
              {progress.history.slice(0, 10).map((h) => (
                <div key={h.id} className="profile-history-row grid grid-cols-[180px_1fr_1fr_70px] items-center gap-4 py-3">
                  <div className="text-[13px] font-semibold text-sage">
                    {missionById(h.missionId)?.title ?? 'Sentence practice'}
                    <div className="text-[11px] opacity-70">{new Date(h.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                  <div className="ml text-[15px] text-cream/70">{h.npcLine}</div>
                  <div className="ml text-[15px] font-semibold text-cream">“{h.said}”</div>
                  <div className={`text-right font-display text-[20px] font-bold ${h.score >= 80 ? 'text-lime' : h.score >= 55 ? 'text-sun' : 'text-coral'}`}>{h.score}</div>
                </div>
              ))}
              {progress.history.length === 0 && <Empty text="Your spoken conversations will appear here." />}
            </div>
          </section>

          <div className="flex items-center justify-between pb-6 text-[13px] text-sage">
            <span>Progress is saved in this browser.</span>
            {confirmReset ? (
              <span className="flex items-center gap-2">
                Erase all progress?
                <button onClick={resetAll} className="rounded-lg bg-coral px-3 py-1.5 font-bold text-cream">
                  Yes, reset
                </button>
                <button onClick={() => setConfirmReset(false)} className="rounded-lg bg-white/10 px-3 py-1.5 font-bold text-cream">
                  Cancel
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirmReset(true)} className="font-bold hover:text-coral">
                Reset progress
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function BigStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="min-w-[110px] rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
      {icon}
      <div className="mt-2 font-display text-[30px] font-bold leading-none text-cream">{value}</div>
      <div className="mt-1 text-[12px] font-semibold text-sage">{label}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Minu mood="idle" size={54} shadow={false} />
      <p className="text-[13px] text-sage">{text}</p>
    </div>
  )
}

function ScoreChart({ values }: { values: number[] }) {
  const w = 640
  const h = 190
  if (values.length < 2) {
    return (
      <div className="mt-6 flex h-[190px] items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10">
        <Minu mood="listening" size={70} shadow={false} />
        <p className="max-w-[240px] text-[13px] text-sage">Speak a couple of replies to a local and your progress chart will appear here.</p>
      </div>
    )
  }
  const pts = values.map((v, i) => [20 + (i / (values.length - 1)) * (w - 40), h - 20 - (v / 100) * (h - 40)] as const)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0]},${h - 20} L${pts[0][0]},${h - 20} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="sc" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={20} x2={w - 20} y1={h - 20 - (g / 100) * (h - 40)} y2={h - 20 - (g / 100) * (h - 40)} stroke="rgba(255,255,255,0.07)" />
          <text x={0} y={h - 16 - (g / 100) * (h - 40)} fontSize={10} fill="#9fb69a">
            {g}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#sc)" />
      <motion.path d={line} fill="none" stroke="#b8f53c" strokeWidth={3} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#0d1a12" stroke="#b8f53c" strokeWidth={2} />
      ))}
    </svg>
  )
}

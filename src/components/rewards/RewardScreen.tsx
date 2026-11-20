import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Award, Coins, Mic, Sparkles, Star, Unlock, Volume2, Route, ArrowRight } from 'lucide-react'
import { useGame } from '@/store/game'
import { Minu } from '../mascot/Minu'
import { useSpeak } from '@/hooks/useSpeak'
import { useT } from '@/hooks/useT'
import { blip } from '@/services/audio/ambience'
import { ACHIEVEMENTS } from '@/data/achievements'

function Confetti() {
  const reduceMotion = useReducedMotion()
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: Math.random() * 100,
        d: 2.4 + Math.random() * 2.2,
        delay: Math.random() * 0.8,
        r: Math.random() * 720 - 360,
        c: ['#b8f53c', '#fcd34d', '#f97362', '#fbf6e6', '#7cc41f'][i % 5],
        w: 6 + Math.random() * 8,
      })),
    [],
  )
  if (reduceMotion) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.w, height: p.w * 0.45, background: p.c }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', rotate: p.r, opacity: [1, 1, 0.6] }}
          transition={{ duration: p.d, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

function Counter({ to, prefix = '+' }: { to: number; prefix?: string }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.5 }}>
      {prefix}
      {to}
    </motion.span>
  )
}

export function RewardScreen() {
  const t = useT()
  const reward = useGame((s) => s.reward)
  const dismiss = useGame((s) => s.dismissReward)
  const setScreen = useGame((s) => s.setScreen)
  const screen = useGame((s) => s.screen)
  const speaker = useSpeak()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!reward) return
    const v = useGame.getState().settings.volume
    blip('success', v)
    const id = setTimeout(() => blip('coin', v), 700)
    return () => clearTimeout(id)
  }, [reward])

  return (
    <AnimatePresence>
      {reward && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75] grid place-items-center bg-ink/75 backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(184,245,60,0.28),transparent_55%)]" />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[38%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-25"
            style={{ background: 'repeating-conic-gradient(from 0deg, rgba(252,211,77,0.5) 0deg 8deg, transparent 8deg 22deg)', maskImage: 'radial-gradient(circle, black 20%, transparent 65%)' }}
            animate={{ rotate: reduceMotion ? 0 : 360 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <Confetti />
          <motion.div initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="reward-dialog relative flex w-full max-w-[980px] flex-col items-center px-8" role="dialog" aria-modal="true" aria-labelledby="reward-title">
            <Minu mood="celebrate" size={170} />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-2 text-[13px] font-extrabold uppercase tracking-[0.3em] text-lime">
              {reward.subtitle}
            </motion.div>
            <motion.h1 id="reward-title" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mt-1 text-center font-display text-[clamp(32px,5vw,56px)] font-bold leading-tight text-cream">
              {reward.title}
            </motion.h1>
            {reward.leveledUp && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-sun px-4 py-1.5 font-display text-[15px] font-semibold text-forest">
                <Star className="h-4 w-4" fill="currentColor" /> Level up! You reached level {reward.leveledUp}
              </motion.div>
            )}

            <div className="reward-stats mt-7 grid w-full grid-cols-3 gap-4">
              <Stat icon={<Sparkles className="h-6 w-6" />} label="XP earned" value={<Counter to={reward.xp} />} tone="lime" />
              <Stat icon={<Coins className="h-6 w-6" />} label="Coins earned" value={<Counter to={reward.coins} />} tone="sun" />
              <Stat icon={<Mic className="h-6 w-6" />} label="Speaking score" value={reward.score !== undefined ? <Counter to={reward.score} prefix="" /> : '—'} tone="cream" suffix={reward.score !== undefined ? '/100' : ''} />
            </div>

            <div className="reward-details mt-4 grid w-full grid-cols-[1fr_280px] gap-4">
              <div className="glass rounded-3xl p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime/80">{reward.vocab.length ? 'New vocabulary' : 'Unlocked'}</div>
                {reward.vocab.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reward.vocab.map((v) => (
                      <button key={v.text} onClick={() => speaker.play(v)} className="group flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-left ring-1 ring-white/10 hover:ring-lime/60">
                        <Volume2 className="h-4 w-4 text-lime opacity-60 group-hover:opacity-100" />
                        <span>
                          <span className="ml block text-[18px] font-bold leading-tight text-cream">{v.text}</span>
                          <span className="block text-[12px] text-sage">
                            {v.roman} · {v.meaning}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {reward.unlocked.length > 0 && (
                  <div className={`${reward.vocab.length ? 'mt-4 border-t border-white/10 pt-4' : 'mt-3'} space-y-1.5`}>
                    {reward.unlocked.map((u) => (
                      <div key={u} className="flex items-center gap-2 text-[14px] font-semibold text-cream">
                        <Unlock className="h-4 w-4 text-lime" /> {u}
                      </div>
                    ))}
                  </div>
                )}
                {!reward.vocab.length && !reward.unlocked.length && <p className="mt-2 text-[14px] text-sage">Practice rounds keep your skills sharp and your streak alive.</p>}
              </div>
              <div className="glass flex flex-col items-center justify-center rounded-3xl p-5 text-center">
                {reward.badge ? (
                  <>
                    <motion.div initial={{ rotateY: 180, scale: 0.4 }} animate={{ rotateY: 0, scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-b from-sun to-[#e0a20b] shadow-[0_0_0_6px_rgba(252,211,77,0.25),0_12px_30px_-8px_rgba(252,211,77,0.6)]">
                      <Award className="h-11 w-11 text-forest" />
                    </motion.div>
                    <div className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sun">Badge earned</div>
                    <div className="font-display text-[19px] font-semibold text-cream">{reward.badge}</div>
                  </>
                ) : reward.achievements.length ? null : (
                  <>
                    <Minu mood="excited" size={80} shadow={false} />
                    <div className="mt-2 text-[13px] text-sage">Keep going to earn badges!</div>
                  </>
                )}
                {reward.achievements.map((id) => {
                  const a = ACHIEVEMENTS.find((x) => x.id === id)
                  return (
                    <div key={id} className="mt-3 rounded-xl bg-lime/15 px-3 py-1.5 text-[13px] font-bold text-lime">
                      Achievement: {a?.title}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="reward-actions mt-7 flex gap-3">
              <button
                onClick={() => {
                  dismiss()
                  setScreen('path')
                }}
                className="btn-ghost inline-flex h-14 items-center gap-2 px-6 text-[16px]"
              >
                <Route className="h-5 w-5" /> {t('openPath')}
              </button>
              <button
                onClick={() => {
                  dismiss()
                  if (screen !== 'world' && screen !== 'path') setScreen('world')
                }}
                className="btn-primary inline-flex h-14 items-center gap-2 px-8 text-[18px]"
              >
                {screen === 'path' ? t('continue') : t('continueExploring')} <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Stat({ icon, label, value, tone, suffix }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: 'lime' | 'sun' | 'cream'; suffix?: string }) {
  const color = tone === 'lime' ? 'text-lime' : tone === 'sun' ? 'text-sun' : 'text-cream'
  return (
    <div className="glass flex items-center gap-4 rounded-3xl p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ${color}`}>{icon}</div>
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-sage">{label}</div>
        <div className={`font-display text-[34px] font-bold leading-none ${color}`}>
          {value}
          {suffix && <span className="text-[16px] text-sage">{suffix}</span>}
        </div>
      </div>
    </div>
  )
}

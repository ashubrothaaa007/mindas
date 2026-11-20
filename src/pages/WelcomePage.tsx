import { Suspense, lazy, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, HardDrive, Mic, Map as MapIcon, Sparkles } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Minu, type MinuMood } from '@/components/mascot/Minu'
import { Modal } from '@/components/ui/Modal'
import { levelFromXp, useGame } from '@/store/game'
import { useT } from '@/hooks/useT'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const DioramaScene = lazy(() => import('@/scenes/Welcome/DioramaScene').then((m) => ({ default: m.DioramaScene })))

const GLYPHS = [
  { g: 'മ', x: 54, y: 16, s: 64, r: -8, d: 0 },
  { g: 'அ', x: 88, y: 22, s: 46, r: 10, d: 1.2 },
  { g: 'あ', x: 92, y: 62, s: 52, r: -6, d: 0.6 },
  { g: 'é', x: 60, y: 78, s: 44, r: 12, d: 1.8 },
  { g: 'अ', x: 76, y: 10, s: 40, r: 6, d: 2.4 },
  { g: 'ñ', x: 50, y: 52, s: 36, r: -12, d: 1.4 },
  { g: 'ಕ', x: 84, y: 84, s: 42, r: 8, d: 0.3 },
]

const MINU_LINES: { text: string; mood: MinuMood }[] = [
  { text: 'Hi! I’m Minu. Ready to talk with the locals?', mood: 'wave' },
  { text: 'നമസ്കാരം! (Namaskaaram!) That means hello!', mood: 'excited' },
  { text: 'Don’t worry about mistakes. Speaking is how we learn!', mood: 'talking' },
  { text: 'I know a great tea shop in Kochi...', mood: 'thinking' },
]

export function WelcomePage() {
  const t = useT()
  const setScreen = useGame((s) => s.setScreen)
  const onboarded = useGame((s) => s.profile.onboarded)
  const progress = useGame((s) => s.progress)
  const name = useGame((s) => s.profile.name)
  const [lineIdx, setLineIdx] = useState(0)
  const [account, setAccount] = useState(false)
  const line = MINU_LINES[lineIdx]

  return (
    <div className="welcome-page relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_70%_45%,#24502f_0%,#0d1a12_62%)]">
      {/* 3D diorama */}
      <div className="welcome-art absolute inset-y-0 right-0 w-[64%]">
        <ErrorBoundary>
          <Suspense fallback={null}>
            <DioramaScene />
          </Suspense>
        </ErrorBoundary>
      </div>
      <div className="welcome-wash pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#0d1a12_0%,#0d1a12_30%,rgba(13,26,18,0.6)_45%,transparent_62%)]" />

      {/* Floating language glyphs */}
      {GLYPHS.map((g) => (
        <span
          key={g.g}
          className="ml pointer-events-none absolute select-none font-bold text-lime/25"
          style={{ left: `${g.x}%`, top: `${g.y}%`, fontSize: g.s, ['--r' as string]: `${g.r}deg`, animation: `floaty ${6 + g.d}s ease-in-out ${g.d}s infinite` }}
        >
          {g.g}
        </span>
      ))}

      <header className="welcome-header absolute inset-x-0 top-0 flex items-center justify-between px-12 py-8">
        <Logo sub="Don’t just learn. Speak." />
        <div className="flex items-center gap-2 text-[13px] font-bold text-sage">
          <span className="h-2 w-2 rounded-full bg-lime" /> Kerala region now open
        </div>
      </header>

      <main className="welcome-copy relative flex h-full max-w-[640px] flex-col justify-center pl-16 pr-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex w-fit items-center gap-2 rounded-full bg-lime/10 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.2em] text-lime ring-1 ring-lime/30">
          <Sparkles className="h-3.5 w-3.5" /> Voice-first language adventure
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 font-display text-[clamp(52px,6vw,84px)] font-bold leading-[0.92] tracking-tight text-cream">
          {t('welcomeTitle')}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-5 font-display text-[28px] font-medium leading-tight text-lime">
          {t('welcomeLead')}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-cream/70">
          {t('welcomeSub')}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }} className="welcome-actions mt-10 flex items-center gap-4">
          <button onClick={() => setScreen(onboarded ? 'world' : 'onboarding')} className="btn-primary inline-flex h-16 items-center gap-3 px-8 text-[20px]">
            {onboarded ? `Continue as ${name}` : t('start')} <ArrowRight className="h-6 w-6" />
          </button>
          <button onClick={() => setAccount(true)} className="btn-ghost h-16 px-6 text-[16px]">
            {onboarded ? 'New adventure' : t('haveAccount')}
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="welcome-features mt-14 flex gap-8 text-[13px] font-semibold text-sage">
          <span className="inline-flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-lime" /> Explore a living 3D Kochi
          </span>
          <span className="inline-flex items-center gap-2">
            <Mic className="h-4 w-4 text-lime" /> Speak, don’t tap
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lime" /> Feedback that understands meaning
          </span>
        </motion.div>
      </main>

      {/* Minu in the foreground */}
      <div className="welcome-minu absolute bottom-10 right-[34%] z-10 flex flex-col items-end">
        <AnimatePresence mode="wait">
          <motion.div key={lineIdx} initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="ml relative mb-2 mr-24 max-w-[260px] rounded-2xl rounded-br-sm bg-cream px-4 py-3 font-display text-[15px] font-medium text-forest shadow-xl">
            {line.text}
          </motion.div>
        </AnimatePresence>
        <button onClick={() => setLineIdx((i) => (i + 1) % MINU_LINES.length)} className="transition hover:scale-[1.03]" aria-label="Talk to Minu">
          <Minu mood={line.mood} size={190} />
        </button>
      </div>

      <Modal open={account} onClose={() => setAccount(false)} title={onboarded ? 'Start a new adventure?' : 'Welcome back'} kicker="Saved progress" width={560} icon={<HardDrive className="h-5 w-5" />}>
        <div className="p-7">
          {onboarded ? (
            <>
              <p className="text-cream/80">
                You have a saved explorer on this device: <b className="text-cream">{name}</b>, level {levelFromXp(progress.xp)}, {progress.coins} coins, {progress.streak}-day streak.
              </p>
              <div className="mt-6 flex gap-3">
                <button className="btn-primary flex-1 py-3" onClick={() => setScreen('world')}>
                  Continue this save
                </button>
                <button
                  className="btn-ghost flex-1 py-3"
                  onClick={() => {
                    useGame.getState().resetAll()
                    setAccount(false)
                    setScreen('onboarding')
                  }}
                >
                  Reset and start over
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-cream/80">No saved progress was found in this browser. MINDA currently saves progress on this device. Cloud accounts aren’t connected yet, so there’s nothing to sign in to.</p>
              <button className="btn-primary mt-6 w-full py-3" onClick={() => setScreen('onboarding')}>
                Start a new adventure
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Minu, type MinuMood } from '@/components/mascot/Minu'
import { useGame } from '@/store/game'
import { DIFFICULTIES, LANGUAGES, NATIVE_OPTIONS, PLAYABLE_TARGETS, REGIONS, TARGET_OPTIONS, type Difficulty, type LangCode } from '@/data/languages'
import { UI_TRANSLATED } from '@/data/i18n'
import { resetPlayer } from '@/systems/playerState'

const STEPS = ['Your language', 'Learn', 'Level', 'Region']

export function OnboardingPage() {
  const profile = useGame((s) => s.profile)
  const setProfile = useGame((s) => s.setProfile)
  const setScreen = useGame((s) => s.setScreen)
  const [step, setStep] = useState(0)
  const [native, setNative] = useState<LangCode>(profile.nativeLang)
  const [target, setTarget] = useState<LangCode | null>(profile.targetLang !== profile.nativeLang ? profile.targetLang : null)
  const [difficulty, setDifficulty] = useState<Difficulty>(profile.difficulty)
  const [region, setRegion] = useState(profile.regionId)
  const [name, setName] = useState(profile.name === 'Explorer' ? '' : profile.name)

  const minu: { text: string; mood: MinuMood }[] = [
    { text: 'First, which language do you think in? I’ll explain everything in it.', mood: 'wave' },
    { text: 'Ooh, exciting! Which language do you want to speak?', mood: 'excited' },
    { text: 'Be honest. I’ll adjust how much help you get.', mood: 'thinking' },
    { text: 'Where shall we land? Kochi has the best chai, trust me.', mood: 'talking' },
  ]

  const canNext = step === 0 ? !!native : step === 1 ? !!target && PLAYABLE_TARGETS.includes(target) : step === 2 ? !!difficulty : REGIONS.find((r) => r.id === region)?.playable

  const finish = () => {
    setProfile({ nativeLang: native, targetLang: target ?? 'ml', difficulty, regionId: region, name: name.trim() || 'Explorer', onboarded: true })
    resetPlayer()
    setScreen('world')
  }

  return (
    <div className="app-page onboarding-page relative flex h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_20%_20%,#1d4a2b_0%,#0d1a12_60%)]">
      {/* Left: Minu guide */}
      <aside className="onboarding-guide relative flex w-[360px] shrink-0 flex-col justify-between border-r border-white/5 p-10">
        <Logo sub="Set up your adventure" />
        <div className="flex flex-col items-start">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 rounded-2xl rounded-bl-sm bg-cream px-4 py-3 font-display text-[16px] font-medium text-forest">
              {minu[step].text}
            </motion.div>
          </AnimatePresence>
          <Minu mood={minu[step].mood} size={200} />
        </div>
        <ol className="space-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 font-display text-[15px] ${i === step ? 'text-cream' : i < step ? 'text-lime' : 'text-sage/60'}`}>
              <span className={`grid h-7 w-7 place-items-center rounded-full text-[13px] font-bold ${i < step ? 'bg-lime text-forest' : i === step ? 'bg-cream text-forest' : 'bg-white/5'}`}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </aside>

      {/* Right: step content */}
      <main className="flex flex-1 flex-col">
        <div className="h-1.5 w-full bg-white/5">
          <motion.div className="h-full bg-lime" animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="onboarding-content scroll-thin flex-1 overflow-y-auto px-14 py-12">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-lime/80">
                Step {step + 1} of 4
              </div>
              {step === 0 && (
                <>
                  <h1 className="mt-2 font-display text-[44px] font-semibold text-cream">Choose your native language</h1>
                  <p className="mt-1 text-[16px] text-sage">All menus, instructions and translations will use this language.</p>
                  <div className="onboarding-language-grid mt-8 grid grid-cols-4 gap-4">
                    {NATIVE_OPTIONS.map((c) => (
                      <LangCard key={c} code={c} selected={native === c} onClick={() => setNative(c)} note={UI_TRANSLATED.includes(c) ? undefined : 'Menus partly in English'} />
                    ))}
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h1 className="mt-2 font-display text-[44px] font-semibold text-cream">What do you want to learn?</h1>
                  <p className="mt-1 text-[16px] text-sage">Characters in the world will speak this language.</p>
                  <div className="onboarding-language-grid mt-8 grid grid-cols-4 gap-4">
                    {TARGET_OPTIONS.map((c) => {
                      const isNative = c === native
                      const playable = PLAYABLE_TARGETS.includes(c)
                      return <LangCard key={c} code={c} selected={target === c} disabled={isNative || !playable} note={isNative ? 'Your native language' : playable ? 'Kerala region' : 'Coming soon'} onClick={() => setTarget(c)} />
                    })}
                  </div>
                  {native === 'ml' && <p className="mt-6 max-w-xl rounded-2xl bg-sun/10 p-4 text-[14px] text-sun">Malayalam is your native language, and it’s the only fully built region so far. More languages are on the way!</p>}
                </>
              )}
              {step === 2 && (
                <>
                  <h1 className="mt-2 font-display text-[44px] font-semibold text-cream">How much {target ? LANGUAGES[target].name : ''} do you know?</h1>
                  <p className="mt-1 text-[16px] text-sage">You can change the amount of help at any time.</p>
                  <div className="onboarding-difficulty-grid mt-8 grid grid-cols-2 gap-4">
                    {DIFFICULTIES.map((d, i) => (
                      <button key={d.id} onClick={() => setDifficulty(d.id)} aria-pressed={difficulty === d.id} className={`flex items-center gap-5 rounded-3xl p-6 text-left ring-2 transition ${difficulty === d.id ? 'bg-lime/10 ring-lime' : 'bg-white/[0.03] ring-white/10 hover:ring-white/30'}`}>
                        <div className="flex h-14 items-end gap-1">
                          {[0, 1, 2, 3].map((b) => (
                            <span key={b} className={`w-3 rounded-full ${b <= i ? 'bg-lime' : 'bg-white/10'}`} style={{ height: 14 + b * 12 }} />
                          ))}
                        </div>
                        <div className="flex-1">
                          <div className="font-display text-[22px] font-semibold text-cream">{d.title}</div>
                          <div className="text-[14px] text-sage">{d.desc}</div>
                          <div className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-lime/80">{d.mode} conversations</div>
                        </div>
                        {difficulty === d.id && <Check className="h-6 w-6 text-lime" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className="mt-2 font-display text-[44px] font-semibold text-cream">Choose your region</h1>
                  <p className="mt-1 text-[16px] text-sage">Each region is a living city with its own people, places and missions.</p>
                  <div className="onboarding-region-grid mt-8 grid grid-cols-3 gap-5">
                    {REGIONS.map((r) => (
                      <button
                        key={r.id}
                        disabled={!r.playable}
                        onClick={() => setRegion(r.id)}
                        aria-pressed={region === r.id}
                        className={`group relative overflow-hidden rounded-3xl text-left ring-2 transition ${region === r.id ? 'ring-lime' : 'ring-white/10 hover:ring-white/30'} disabled:cursor-not-allowed`}
                      >
                        <img src={r.image} alt={`${r.name} illustration`} className={`h-48 w-full object-cover transition duration-500 group-hover:scale-105 ${r.playable ? '' : 'grayscale-[0.6] brightness-[0.55]'}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-[24px] font-semibold text-cream">{r.name}</span>
                            {r.playable ? <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-forest">Open</span> : <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-cream"><Lock className="h-3 w-3" /> Soon</span>}
                          </div>
                          <div className="text-[13px] text-cream/75">
                            {r.city} · {LANGUAGES[r.language].name} · {r.tagline}
                          </div>
                        </div>
                        {region === r.id && (
                          <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-lime text-forest">
                            <Check className="h-5 w-5" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <label className="mt-8 block max-w-md">
                    <span className="text-[13px] font-bold text-sage">What should the locals call you?</span>
                    <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder="Explorer" className="mt-2 h-12 w-full rounded-2xl bg-white/5 px-4 font-display text-[17px] text-cream outline-none ring-1 ring-white/15 placeholder:text-sage/50 focus:ring-lime" />
                  </label>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="onboarding-footer flex items-center justify-between border-t border-white/5 px-14 py-6">
          <button onClick={() => (step === 0 ? setScreen('welcome') : setStep(step - 1))} className="btn-ghost inline-flex h-12 items-center gap-2 px-5">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <button disabled={!canNext} onClick={() => (step < 3 ? setStep(step + 1) : finish())} className="btn-primary inline-flex h-14 items-center gap-2 px-8 text-[18px]">
            {step < 3 ? 'Continue' : 'Enter Kochi'} <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </main>
    </div>
  )
}

function LangCard({ code, selected, onClick, disabled, note }: { code: LangCode; selected: boolean; onClick: () => void; disabled?: boolean; note?: string }) {
  const l = LANGUAGES[code]
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`relative flex flex-col items-start rounded-3xl p-5 text-left ring-2 transition ${selected ? 'bg-lime/10 ring-lime' : 'bg-white/[0.03] ring-white/10 hover:ring-white/30'} disabled:opacity-40`}
    >
      <span className={`ml grid h-14 w-14 place-items-center rounded-2xl text-[28px] font-bold ${selected ? 'bg-lime text-forest' : 'bg-white/5 text-lime'}`}>{l.glyph}</span>
      <span className="mt-4 font-display text-[20px] font-semibold text-cream">{l.name}</span>
      <span className="ml text-[15px] text-sage">{l.native}</span>
      {note && <span className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-lime/70">{note}</span>}
      {selected && (
        <span className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-lime text-forest">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  )
}

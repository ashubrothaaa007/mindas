import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Captions, Languages, Lightbulb, MapPin, RotateCcw, X, ArrowRight, Flag, Ticket } from 'lucide-react'
import { missionById } from '@/data/missions'
import { npcById } from '@/data/world'
import { useGame } from '@/store/game'
import { useSpeak, engineNote } from '@/hooks/useSpeak'
import { useT } from '@/hooks/useT'
import { evaluate, type Feedback } from '@/services/ai/evaluate'
import { blip } from '@/services/audio/ambience'
import { SpeakControls } from '../voice/SpeakControls'
import { VoiceInput, type VoiceResult } from '../voice/VoiceInput'
import { FeedbackPanel } from '../voice/FeedbackPanel'
import { Minu } from '../mascot/Minu'
import type { ConversationMode } from '@/data/languages'
import { LANGUAGES } from '@/data/languages'

export function ConversationOverlay() {
  const missionId = useGame((s) => s.conversationMissionId)
  const nonce = useGame((s) => s.conversationNonce)
  return <AnimatePresence>{missionId && <Conversation key={`${missionId}-${nonce}`} missionId={missionId} />}</AnimatePresence>
}

type Phase = 'turn' | 'evaluating' | 'feedback' | 'outro'

const FARES: Record<number, string> = { 0: 'Not quoted yet', 1: 'Quoted ₹200', 2: 'Offered ₹140' }

function Conversation({ missionId }: { missionId: string }) {
  const t = useT()
  const mission = missionById(missionId)!
  const npc = npcById(mission.npcId)!
  const settings = useGame((s) => s.settings)
  const setSettings = useGame((s) => s.setSettings)
  const hintTokens = useGame((s) => s.progress.hintTokens)
  const targetLang = useGame((s) => s.profile.targetLang)
  const close = useGame((s) => s.closeConversation)
  const recordTurn = useGame((s) => s.recordTurn)
  const completeMission = useGame((s) => s.completeMission)
  const consumeHint = useGame((s) => s.useHint)
  const speaker = useSpeak()

  const [turnIdx, setTurnIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('turn')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [result, setResult] = useState<VoiceResult | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [best, setBest] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [listening, setListening] = useState(false)

  const turn = mission.turns[turnIdx]
  const mode: ConversationMode = settings.mode
  const gender = npc.female ? 'f' : 'm'
  const showTranslation = settings.showTranslation && (mode !== 'immersive' || revealed)
  const showRoman = settings.showRomanization && (mode !== 'immersive' || revealed)

  // NPC speaks each new line
  useEffect(() => {
    const line = phase === 'outro' ? mission.outro : turn.npc
    if (phase !== 'turn' && phase !== 'outro') return
    if (phase === 'turn' && attempts > 0) return
    const id = setTimeout(() => speaker.play(line, { gender }), 450)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnIdx, phase === 'outro'])

  const onResult = useCallback(
    async (r: VoiceResult) => {
      setResult(r)
      setPhase('evaluating')
      const fb = await evaluate({
        transcript: r.text,
        confidence: r.confidence,
        source: r.source,
        expected: { text: turn.reply.text, roman: turn.reply.roman, intent: turn.reply.intent },
        concepts: turn.reply.concepts,
        grammar: turn.reply.grammar,
        context: turn.reply.context,
        npcLine: turn.npc.text,
      })
      setFeedback(fb)
      setBest((b) => Math.max(b, fb.score))
      setPhase('feedback')
      recordTurn({ missionId, npcLine: turn.npc.text, said: r.text, score: fb.score })
      if (fb.passed) blip('success', useGame.getState().settings.volume)
      if (!fb.passed && mode === 'guided') setRevealed(true)
    },
    [turn, missionId, recordTurn, mode],
  )

  const retry = () => {
    setAttempts((a) => a + 1)
    setFeedback(null)
    setPhase('turn')
  }

  const next = () => {
    const newScores = [...scores, Math.max(best, feedback?.score ?? 0)]
    setScores(newScores)
    setFeedback(null)
    setResult(null)
    setAttempts(0)
    setBest(0)
    setRevealed(false)
    if (turnIdx + 1 < mission.turns.length) {
      setTurnIdx(turnIdx + 1)
      setPhase('turn')
    } else setPhase('outro')
  }

  const finish = () => {
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    speaker.stop()
    completeMission(missionId, avg)
  }

  const revealWithHint = () => {
    if (mode !== 'immersive' || revealed) return setRevealed(true)
    if (consumeHint()) setRevealed(true)
  }

  const npcMood = phase === 'feedback' ? (feedback?.passed ? 'excited' : 'thinking') : listening ? 'listening' : speaker.speakingKey ? 'talking' : 'idle'
  const note = engineNote(speaker.engine)
  const progressDots = useMemo(() => mission.turns.map((_, i) => (i < turnIdx || phase === 'outro' ? 'done' : i === turnIdx ? 'now' : 'todo')), [mission.turns, turnIdx, phase])

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="conversation-backdrop pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-5"
    >
      <div className="conversation-shell card-cream pointer-events-auto w-full max-w-[1140px] overflow-hidden !rounded-[24px]" role="dialog" aria-modal="true" aria-label={`${mission.title} conversation`}>
        {/* Header */}
        <div className="flex items-center gap-4 border-b-2 border-forest/10 px-6 py-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl font-display text-lg font-bold text-forest ring-2 ring-forest" style={{ background: npc.shirt }}>
            {npc.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="font-display text-[20px] font-semibold leading-tight">{npc.name}</div>
            <div className="text-[13px] font-semibold text-forest/60">
              {npc.role} · speaks <span className="ml">{LANGUAGES[targetLang].native}</span>
            </div>
          </div>
          <div className="ml-3 hidden items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-lime lg:flex">
            <Flag className="h-3.5 w-3.5" /> {mission.kind === 'story' ? 'Mission' : 'Chat'}: {mission.title}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5" aria-label="Conversation progress">
            {progressDots.map((d, i) => (
              <span key={i} className={`h-2.5 rounded-full transition-all ${d === 'done' ? 'w-2.5 bg-lime-deep' : d === 'now' ? 'w-7 bg-forest' : 'w-2.5 bg-forest/15'}`} />
            ))}
          </div>
          <ModeSwitch mode={mode} onChange={(m) => setSettings({ mode: m })} />
          <button onClick={() => (speaker.stop(), close())} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-forest/15 hover:bg-forest/5" aria-label="Leave conversation">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Objective */}
        <div className="flex items-center gap-4 bg-sun px-6 py-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-forest/70">{t('objective')}</span>
          <span className="flex-1 text-[14px] font-semibold">{mission.objective}</span>
          {mission.id === 'auto' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1 text-[12px] font-bold text-cream">
              <Ticket className="h-3.5 w-3.5 text-lime" />
              Fare: {phase === 'outro' ? 'Agreed ₹140 · under ₹150' : FARES[turnIdx]}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-forest/60">
            <MapPin className="h-3.5 w-3.5" /> Kochi
          </span>
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {phase === 'outro' ? (
              <motion.div key="outro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-8 py-2">
                <Minu mood="celebrate" size={130} />
                <div className="flex-1">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-forest/50">{npc.name} says</div>
                  <div className="ml mt-1 text-[30px] font-bold leading-tight">{mission.outro.text}</div>
                  {settings.showRomanization && <div className="mt-1 text-[16px] italic text-forest/60">{mission.outro.roman}</div>}
                  {settings.showTranslation && <div className="mt-1 text-[15px] font-semibold text-forest/75">{mission.outro.meaning}</div>}
                  <div className="mt-3">
                    <SpeakControls line={mission.outro} speaker={speaker} gender={gender} />
                  </div>
                </div>
                <button onClick={finish} className="btn-primary flex items-center gap-2 px-7 py-4 text-[18px]">
                  Complete {mission.kind === 'story' ? 'mission' : 'chat'} <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            ) : phase === 'feedback' && feedback && result ? (
              <motion.div key={`fb-${attempts}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <FeedbackPanel fb={feedback} result={result} speaker={speaker} />
                <div className="mt-5 flex items-center justify-end gap-3 border-t-2 border-forest/10 pt-4">
                  {!feedback.passed && <span className="mr-auto text-[13px] font-semibold text-forest/60">Tip: you don’t need the exact sentence. Just include the key words.</span>}
                  <button onClick={retry} className="inline-flex h-12 items-center gap-2 rounded-2xl border-2 border-forest/20 px-5 font-display font-semibold hover:bg-forest/5">
                    <RotateCcw className="h-4 w-4" /> {t('tryAgain')}
                  </button>
                  {(feedback.passed || attempts >= 1) && (
                    <button onClick={next} className="btn-primary inline-flex h-12 items-center gap-2 px-6 text-[16px]">
                      {feedback.passed ? t('continue') : 'Move on'} <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key={`turn-${turnIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 gap-5">
                  {/* NPC line */}
                  <div className="relative rounded-2xl border-2 border-forest bg-white/60 p-5 shadow-[4px_4px_0_#14361f]">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-forest/50">{npc.name} says</div>
                      <div className="flex gap-1">
                        <Toggle on={settings.showTranslation} onClick={() => setSettings({ showTranslation: !settings.showTranslation })} icon={<Languages className="h-3.5 w-3.5" />} label={t('translation')} />
                        <Toggle on={settings.showRomanization} onClick={() => setSettings({ showRomanization: !settings.showRomanization })} icon={<Captions className="h-3.5 w-3.5" />} label={t('pronunciation')} />
                      </div>
                    </div>
                    <div className="ml mt-2 text-[32px] font-bold leading-tight">{turn.npc.text}</div>
                    {showRoman && <div className="mt-0.5 text-[16px] italic text-forest/60">{turn.npc.roman}</div>}
                    {showTranslation && <div className="mt-1 text-[15px] font-semibold text-forest/75">{turn.npc.meaning}</div>}
                    {mode === 'immersive' && !revealed && <div className="mt-1 text-[12px] font-bold text-forest/45">Immersive mode: translation hidden</div>}
                    <div className="mt-4">
                      <SpeakControls line={turn.npc} speaker={speaker} gender={gender} />
                    </div>
                    {note && <p className="mt-2 text-[11px] font-semibold leading-snug text-forest/50">{note}</p>}
                  </div>

                  {/* Reply assist */}
                  <div className="rounded-2xl bg-forest p-5 text-cream">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime">Your turn</div>
                      <div className="text-[11px] font-bold text-sage">
                        {mode === 'beginner' ? 'Beginner · full support' : mode === 'guided' ? 'Guided · hints on request' : 'Immersive · respond naturally'}
                      </div>
                    </div>
                    {mode !== 'immersive' || revealed ? (
                      <>
                        <div className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sage">{t('yourIntention')}</div>
                        <div className="text-[17px] font-semibold">“{turn.reply.intent}”</div>
                      </>
                    ) : (
                      <div className="mt-3 text-[15px] text-cream/80">Answer {npc.name.split(' ')[0]} in Malayalam however you like. Use a hint if you get stuck.</div>
                    )}
                    {mode === 'beginner' || revealed ? (
                      <div className="mt-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                        <div className="ml text-[22px] font-bold leading-snug text-lime-bright">{turn.reply.text}</div>
                        {settings.showRomanization && <div className="text-[14px] italic text-cream/70">{turn.reply.roman}</div>}
                        <div className="mt-2.5">
                          <SpeakControls line={{ text: turn.reply.text, roman: turn.reply.roman }} speaker={speaker} compact tone="dark" />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        {mode === 'guided' && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {turn.reply.concepts.map((c) => (
                              <span key={c.label} className="ml rounded-lg bg-white/10 px-2 py-1 text-[13px] font-semibold">
                                {c.target} <span className="font-sans text-sage">· {c.label}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <button onClick={revealWithHint} disabled={mode === 'immersive' && hintTokens <= 0} className="btn-ghost inline-flex h-10 items-center gap-2 px-4 text-[14px]">
                          <Lightbulb className="h-4 w-4 text-sun" />
                          {mode === 'immersive' ? (hintTokens > 0 ? `Use a hint (${hintTokens} left)` : 'No hints left · get more in Inventory') : 'Show the full sentence'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 rounded-2xl bg-cream-2/70 px-6 py-4">
                  <div className="w-44 shrink-0">
                    <Minu mood={npcMood === 'talking' ? 'listening' : npcMood} size={78} shadow={false} />
                  </div>
                  <div className="flex-1">
                    {phase === 'evaluating' ? (
                      <div className="flex flex-col items-center py-4">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span key={i} className="h-3 w-3 rounded-full bg-forest" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                          ))}
                        </div>
                        <div className="mt-3 font-display text-[15px] font-medium text-forest/70">Minu is checking what you said…</div>
                      </div>
                    ) : (
                      <VoiceInput onResult={onResult} onListeningChange={setListening} />
                    )}
                  </div>
                  <div className="w-44 shrink-0 text-right text-[12px] font-semibold leading-relaxed text-forest/55">
                    {attempts > 0 ? `Attempt ${attempts + 1}` : 'Listen first, then speak.'}
                    <br />
                    Any natural phrasing with the key words counts.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition ${on ? 'bg-forest text-lime' : 'bg-forest/8 text-forest/60 hover:bg-forest/15'}`} aria-pressed={on}>
      {icon} {label}
    </button>
  )
}

function ModeSwitch({ mode, onChange }: { mode: ConversationMode; onChange: (m: ConversationMode) => void }) {
  const modes: { id: ConversationMode; label: string }[] = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'guided', label: 'Guided' },
    { id: 'immersive', label: 'Immersive' },
  ]
  return (
    <div className="flex rounded-xl bg-forest/8 p-1">
      {modes.map((m) => (
        <button key={m.id} onClick={() => onChange(m.id)} className={`h-8 rounded-lg px-3 font-display text-[13px] font-medium transition ${mode === m.id ? 'bg-forest text-lime' : 'text-forest/60 hover:text-forest'}`}>
          {m.label}
        </button>
      ))}
    </div>
  )
}

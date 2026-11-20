import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, MessageSquareText, Timer, Trophy, Volume2, X, XCircle } from 'lucide-react'
import { useGame } from '@/store/game'
import { UNITS, unitById, type Unit } from '@/data/learning'
import { missionById } from '@/data/missions'
import { useSpeak, engineNote } from '@/hooks/useSpeak'
import { Minu, type MinuMood } from '../mascot/Minu'
import { SpeakControls } from '../voice/SpeakControls'
import { VoiceInput, type VoiceResult } from '../voice/VoiceInput'
import { ScoreRing } from '../voice/FeedbackPanel'
import { evaluate, type Feedback } from '@/services/ai/evaluate'
import { blip } from '@/services/audio/ambience'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

export function ActivityOverlay() {
  const activity = useGame((s) => s.activity)
  const close = useGame((s) => s.closeActivity)
  const unit = activity ? unitById(activity.unitId) : null
  return (
    <AnimatePresence>
      {activity && unit && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="activity-backdrop fixed inset-0 z-[62] grid place-items-center bg-ink/70 p-8 backdrop-blur-md">
          <motion.div initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} className="activity-window card-cream relative flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden !rounded-[26px]" role="dialog" aria-modal="true" aria-label="Learning activity">
            <div className="flex items-center gap-3 border-b-2 border-forest/10 px-7 py-4">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-lime">
                {activity.type === 'words' ? <BookOpen className="h-5 w-5" /> : activity.type === 'sentences' ? <MessageSquareText className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-forest/50">{unit.title}</div>
                <div className="font-display text-[22px] font-semibold leading-tight">
                  {activity.type === 'words' ? 'Learn five new words' : activity.type === 'sentences' ? 'Practise five useful sentences' : 'Daily challenge'}
                </div>
              </div>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-forest/15 hover:bg-forest/5" aria-label="Close activity">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto p-7">
              {activity.type === 'words' && <WordsLesson unit={unit} />}
              {activity.type === 'sentences' && <SentencesLesson unit={unit} />}
              {activity.type === 'challenge' && <DailyChallenge unit={unit} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Steps({ total, idx }: { total: number; idx: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-full transition ${i < idx ? 'bg-lime-deep' : i === idx ? 'bg-forest' : 'bg-forest/10'}`} />
      ))}
    </div>
  )
}

/* ---------- Words ---------- */

function WordsLesson({ unit }: { unit: Unit }) {
  const speaker = useSpeak()
  const complete = useGame((s) => s.completeActivity)
  const learnWord = useGame((s) => s.learnWord)
  const practiceWord = useGame((s) => s.practiceWord)
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn')
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const word = unit.words[i]
  const quiz = useMemo(() => shuffle(unit.words), [unit])
  const q = quiz[i]
  const options = useMemo(() => (q ? shuffle([q.meaning, ...shuffle(UNITS.flatMap((u) => u.words).filter((w) => w.meaning !== q.meaning)).slice(0, 3).map((w) => w.meaning)]) : []), [q])

  useEffect(() => {
    if (phase === 'learn' && word) {
      learnWord(word)
      speaker.play(word)
    }
    if (phase === 'quiz' && q) speaker.play(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, phase])

  if (phase === 'learn') {
    return (
      <div>
        <Steps total={unit.words.length * 2} idx={i} />
        <div className="mt-6 grid grid-cols-[1fr_220px] items-center gap-6">
          <motion.div key={word.text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-[28px] border-2 border-forest bg-white/60 p-10 text-center shadow-[6px_6px_0_#14361f]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-forest/45">
              Word {i + 1} of {unit.words.length}
            </div>
            <div className="ml mt-3 text-[72px] font-bold leading-none">{word.text}</div>
            <div className="mt-3 text-[22px] italic text-forest/60">{word.roman}</div>
            <div className="mt-2 text-[20px] font-semibold">{word.meaning}</div>
            <div className="mt-6 flex justify-center">
              <SpeakControls line={word} speaker={speaker} />
            </div>
          </motion.div>
          <div className="flex flex-col items-center text-center">
            <Minu mood="talking" size={140} />
            <p className="mt-2 text-[13px] font-semibold text-forest/60">Say it out loud as you hear it.</p>
          </div>
        </div>
        {engineNote(speaker.engine) && <p className="mt-3 text-center text-[12px] font-semibold text-forest/50">{engineNote(speaker.engine)}</p>}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (i + 1 < unit.words.length) setI(i + 1)
              else {
                setPhase('quiz')
                setI(0)
              }
            }}
            className="btn-primary inline-flex h-12 items-center gap-2 px-6"
          >
            {i + 1 < unit.words.length ? 'Next word' : 'Start quick quiz'} <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }

  const answer = (opt: string) => {
    if (picked) return
    setPicked(opt)
    const ok = opt === q.meaning
    practiceWord(q, ok)
    if (ok) {
      setCorrect((c) => c + 1)
      blip('coin', useGame.getState().settings.volume)
    }
  }
  const next = () => {
    if (i + 1 < quiz.length) {
      setI(i + 1)
      setPicked(null)
    } else complete(unit.id, 'words', (correct / quiz.length) * 100)
  }
  return (
    <div>
      <Steps total={unit.words.length * 2} idx={unit.words.length + i} />
      <div className="mt-6 grid grid-cols-[1fr_200px] gap-6">
        <div>
          <div className="text-[13px] font-bold text-forest/60">What does this mean?</div>
          <div className="mt-2 flex items-center gap-4">
            <div className="ml text-[56px] font-bold leading-none">{q.text}</div>
            <button onClick={() => speaker.play(q)} className="grid h-12 w-12 place-items-center rounded-2xl bg-forest text-lime" aria-label="Listen">
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {options.map((o) => {
              const state = !picked ? 'idle' : o === q.meaning ? 'right' : o === picked ? 'wrong' : 'idle'
              return (
                <button
                  key={o}
                  onClick={() => answer(o)}
                  className={`flex h-16 items-center justify-between rounded-2xl border-2 px-5 text-left font-display text-[18px] font-medium transition ${
                    state === 'right' ? 'border-lime-deep bg-lime/40' : state === 'wrong' ? 'border-coral bg-coral/15' : 'border-forest/15 bg-white/60 hover:border-forest'
                  }`}
                >
                  {o}
                  {state === 'right' && <CheckCircle2 className="h-5 w-5 text-lime-deep" />}
                  {state === 'wrong' && <XCircle className="h-5 w-5 text-coral" />}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Minu mood={!picked ? 'thinking' : picked === q.meaning ? 'excited' : 'sad'} size={130} />
          {picked && <p className="mt-2 text-center text-[13px] font-semibold text-forest/70">{picked === q.meaning ? 'Spot on!' : `It means “${q.meaning}”.`}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={!picked} onClick={next} className="btn-primary inline-flex h-12 items-center gap-2 px-6">
          {i + 1 < quiz.length ? 'Next' : 'Finish lesson'} <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

/* ---------- Sentences ---------- */

function SentencesLesson({ unit }: { unit: Unit }) {
  const speaker = useSpeak()
  const complete = useGame((s) => s.completeActivity)
  const recordTurn = useGame((s) => s.recordTurn)
  const [i, setI] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const s = unit.sentences[i]

  useEffect(() => {
    speaker.play(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  const onResult = async (r: VoiceResult) => {
    setBusy(true)
    const res = await evaluate({ transcript: r.text, confidence: r.confidence, source: r.source, expected: { text: s.text, roman: s.roman, intent: s.meaning }, concepts: s.concepts, grammar: s.grammar, context: 'Practice sentence' })
    setBusy(false)
    setFb(res)
    recordTurn({ missionId: `practice-${unit.id}`, npcLine: s.meaning, said: r.text, score: res.score })
    if (res.passed) blip('success', useGame.getState().settings.volume)
  }
  const next = () => {
    const all = [...scores, fb?.score ?? 0]
    setScores(all)
    setFb(null)
    if (i + 1 < unit.sentences.length) setI(i + 1)
    else complete(unit.id, 'sentences', all.reduce((a, b) => a + b, 0) / all.length)
  }
  const mood: MinuMood = busy ? 'thinking' : fb ? (fb.passed ? 'celebrate' : 'sad') : 'listening'
  return (
    <div>
      <Steps total={unit.sentences.length} idx={i} />
      <div className="mt-6 grid grid-cols-[1fr_200px] gap-6">
        <div className="rounded-[28px] border-2 border-forest bg-white/60 p-7 shadow-[6px_6px_0_#14361f]">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-forest/45">
            Sentence {i + 1} of {unit.sentences.length}
          </div>
          <div className="ml mt-2 text-[38px] font-bold leading-tight">{s.text}</div>
          <div className="text-[18px] italic text-forest/60">{s.roman}</div>
          <div className="mt-1 text-[17px] font-semibold">{s.meaning}</div>
          <div className="mt-4">
            <SpeakControls line={s} speaker={speaker} />
          </div>
          <p className="ml mt-3 text-[13px] text-forest/60">{s.grammar}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Minu mood={mood} size={130} />
        </div>
      </div>
      <div className="mt-5 rounded-[24px] bg-cream-2/70 p-5">
        {fb ? (
          <div className="flex items-center gap-6">
            <ScoreRing score={fb.score} size={96} />
            <div className="flex-1">
              <div className="ml text-[18px] font-semibold">“{fb.transcript}”</div>
              <div className="text-[14px] font-semibold text-forest/70">{fb.minuLine}</div>
              {fb.missing.filter((c) => c.required).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {fb.missing
                    .filter((c) => c.required)
                    .map((c) => (
                      <span key={c.label} className="ml rounded-lg bg-coral/15 px-2 py-0.5 text-[13px] font-semibold text-[#b23a2b]">
                        missing: {c.target} · {c.label}
                      </span>
                    ))}
                </div>
              )}
              {fb.pronunciation && <div className="mt-1 text-[12px] font-semibold text-forest/50">{fb.pronunciation}</div>}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setFb(null)} className="h-11 rounded-xl border-2 border-forest/20 px-4 font-display font-semibold hover:bg-forest/5">
                Try again
              </button>
              <button onClick={next} className="btn-primary inline-flex h-11 items-center gap-2 px-5">
                {i + 1 < unit.sentences.length ? 'Next' : 'Finish'} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : busy ? (
          <div className="py-6 text-center font-display text-forest/70">Checking your sentence…</div>
        ) : (
          <VoiceInput onResult={onResult} />
        )}
      </div>
    </div>
  )
}

/* ---------- Daily challenge ---------- */

type Q = { kind: 'listen' | 'meaning' | 'reverse'; prompt: { text: string; roman: string; meaning: string }; options: string[]; answer: string }

function buildQuestions(unit: Unit): Q[] {
  const mission = missionById(unit.missionId)!
  const pool = [...unit.words, ...unit.sentences.map((s) => ({ text: s.text, roman: s.roman, meaning: s.meaning })), ...mission.turns.map((t) => t.npc)]
  const picks = shuffle(pool).slice(0, 6)
  return picks.map((p, idx) => {
    const kind: Q['kind'] = (['listen', 'meaning', 'reverse'] as const)[idx % 3]
    const others = shuffle(pool.filter((x) => x.text !== p.text)).slice(0, 3)
    if (kind === 'reverse') return { kind, prompt: p, options: shuffle([p.text, ...others.map((o) => o.text)]), answer: p.text }
    if (kind === 'listen') return { kind, prompt: p, options: shuffle([p.text, ...others.map((o) => o.text)]), answer: p.text }
    return { kind, prompt: p, options: shuffle([p.meaning, ...others.map((o) => o.meaning)]), answer: p.meaning }
  })
}

function DailyChallenge({ unit }: { unit: Unit }) {
  const speaker = useSpeak()
  const complete = useGame((s) => s.completeActivity)
  const qs = useMemo(() => buildQuestions(unit), [unit])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(75)
  const q = qs[i]

  useEffect(() => {
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (q.kind === 'listen') speaker.play(q.prompt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])
  useEffect(() => {
    if (timeLeft === 0) complete(unit.id, 'challenge', (correct / qs.length) * 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft === 0])

  const answer = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === q.answer) {
      setCorrect((c) => c + 1)
      blip('coin', useGame.getState().settings.volume)
    }
  }
  const next = () => {
    if (i + 1 < qs.length) {
      setI(i + 1)
      setPicked(null)
    } else complete(unit.id, 'challenge', (correct / qs.length) * 100)
  }
  const isMl = q.kind !== 'meaning'
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Steps total={qs.length} idx={i} />
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-[15px] font-semibold ${timeLeft < 15 ? 'bg-coral text-cream' : 'bg-forest text-lime'}`}>
          <Timer className="h-4 w-4" /> {timeLeft}s
        </div>
        <div className="font-display text-[15px] font-semibold text-forest/60">
          {correct} correct
        </div>
      </div>
      <div className="mt-6 grid grid-cols-[1fr_190px] gap-6">
        <div>
          <div className="text-[13px] font-bold text-forest/60">{q.kind === 'listen' ? 'Listen, then pick what you heard' : q.kind === 'meaning' ? 'What does this mean?' : 'How do you say this in Malayalam?'}</div>
          <div className="mt-2 flex min-h-[72px] items-center gap-4">
            {q.kind === 'listen' ? (
              <button onClick={() => speaker.play(q.prompt)} className="btn-primary inline-flex h-16 items-center gap-3 px-6 text-[18px]">
                <Volume2 className="h-6 w-6" /> Play audio
              </button>
            ) : q.kind === 'meaning' ? (
              <div className="ml text-[42px] font-bold leading-tight">{q.prompt.text}</div>
            ) : (
              <div className="text-[30px] font-semibold leading-tight">“{q.prompt.meaning}”</div>
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {q.options.map((o) => {
              const state = !picked ? 'idle' : o === q.answer ? 'right' : o === picked ? 'wrong' : 'idle'
              return (
                <button
                  key={o}
                  onClick={() => answer(o)}
                  className={`min-h-16 rounded-2xl border-2 px-5 py-3 text-left transition ${isMl ? 'ml text-[20px] font-semibold' : 'font-display text-[17px] font-medium'} ${
                    state === 'right' ? 'border-lime-deep bg-lime/40' : state === 'wrong' ? 'border-coral bg-coral/15' : 'border-forest/15 bg-white/60 hover:border-forest'
                  }`}
                >
                  {o}
                </button>
              )
            })}
          </div>
          {picked && <div className="mt-3 text-[14px] text-forest/70"><span className="ml font-semibold">{q.prompt.text}</span> · <i>{q.prompt.roman}</i> · {q.prompt.meaning}</div>}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Minu mood={!picked ? 'thinking' : picked === q.answer ? 'celebrate' : 'sad'} size={120} />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={!picked} onClick={next} className="btn-primary inline-flex h-12 items-center gap-2 px-6">
          {i + 1 < qs.length ? 'Next' : 'Finish challenge'} <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}


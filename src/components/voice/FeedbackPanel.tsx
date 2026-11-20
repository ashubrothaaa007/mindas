import { motion } from 'framer-motion'
import { CheckCircle2, Cpu, Sparkles } from 'lucide-react'
import type { Feedback } from '@/services/ai/evaluate'
import type { VoiceResult } from './VoiceInput'
import { SpeakControls } from './SpeakControls'
import type { useSpeak } from '@/hooks/useSpeak'
import { Minu } from '../mascot/Minu'

export function ScoreRing({ score, size = 112 }: { score: number; size?: number }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  const color = score >= 80 ? '#5d9e17' : score >= 55 ? '#e0a20b' : '#e0533f'
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(20,54,31,0.1)" strokeWidth="10" fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="font-display text-[34px] font-bold text-forest">{score}</div>
        <div className="text-[11px] font-extrabold tracking-wider text-forest/50">/ 100</div>
      </div>
    </div>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-forest/50">{children}</div>

export function FeedbackPanel({ fb, result, speaker }: { fb: Feedback; result: VoiceResult; speaker: ReturnType<typeof useSpeak> }) {
  const mood = fb.score >= 85 ? 'celebrate' : fb.passed ? 'excited' : fb.score >= 50 ? 'thinking' : 'sad'
  return (
    <div className="grid grid-cols-[220px_1fr_1fr] gap-5">
      <div className="flex flex-col items-center rounded-2xl bg-forest/[0.04] p-4">
        <ScoreRing score={fb.score} />
        <div className="-mb-2 mt-1">
          <Minu mood={mood} size={92} shadow={false} />
        </div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative mt-3 rounded-2xl bg-forest px-3 py-2 text-center font-display text-[13px] font-medium leading-snug text-cream">
          {fb.minuLine}
        </motion.div>
      </div>

      <div className="space-y-3.5">
        <div>
          <Label>You said</Label>
          <div className="ml text-[20px] font-semibold leading-snug text-forest">“{fb.transcript}”</div>
          <div className="mt-1 text-[12px] font-bold text-forest/50">
            {result.source === 'speech' ? `Spoken · transcribed${result.confidence ? ` · ${Math.round(result.confidence * 100)}% confidence` : ''}` : 'Typed answer'}
          </div>
        </div>
        <div>
          <Label>Meaning</Label>
          <p className="text-[14px] font-semibold text-forest/85">{fb.meaning}</p>
        </div>
        <div>
          <Label>Grammar</Label>
          <p className="ml text-[14px] text-forest/80">{fb.grammar}</p>
        </div>
        <div>
          <Label>Context</Label>
          <p className="text-[14px] text-forest/80">{fb.context}</p>
        </div>
      </div>

      <div className="space-y-3.5">
        <div>
          <Label>Missing words</Label>
          {fb.missing.length === 0 ? (
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-lime-deep">
              <CheckCircle2 className="h-4 w-4" /> Nothing important missing
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {fb.missing.map((c) => (
                <span key={c.label} className={`ml rounded-lg px-2 py-1 text-[13px] font-semibold ${c.required ? 'bg-coral/15 text-[#b23a2b]' : 'bg-sun/30 text-forest'}`}>
                  {c.target} <span className="font-sans opacity-60">· {c.label}</span>
                  {!c.required && <span className="font-sans text-[10px] opacity-60"> (optional)</span>}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label>Pronunciation</Label>
          <p className="text-[14px] text-forest/80">{fb.pronunciation ?? (result.source === 'typed' ? 'Not assessed for typed answers.' : 'Not scored: the recogniser didn’t report a reliable confidence value.')}</p>
        </div>
        <div className="rounded-2xl border-2 border-lime-deep/40 bg-lime/15 p-3">
          <Label>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Improved sentence
            </span>
          </Label>
          <div className="ml text-[18px] font-semibold text-forest">{fb.improved}</div>
          <div className="mb-2 text-[13px] italic text-forest/60">{fb.improvedRoman}</div>
          <SpeakControls line={{ text: fb.improved, roman: fb.improvedRoman }} speaker={speaker} compact />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-forest/45">
          <Cpu className="h-3.5 w-3.5" /> {fb.engine === 'gemini' ? 'Evaluated by Gemini' : 'Evaluated on-device (demo mode, meaning-based matching)'}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, Mic, Square, SendHorizontal, AlertCircle } from 'lucide-react'
import { startListening, speechRecognitionSupported, type SttSession } from '@/services/voice/stt'
import { blip } from '@/services/audio/ambience'
import { useGame } from '@/store/game'
import { LANGUAGES } from '@/data/languages'

export interface VoiceResult {
  text: string
  confidence: number | null
  source: 'speech' | 'typed'
}

/**
 * Primary microphone interaction with live transcription, a level meter and an honest
 * typed fallback when speech recognition is unavailable or blocked.
 */
export function VoiceInput({ onResult, disabled, size = 'lg', onListeningChange }: { onResult: (r: VoiceResult) => void; disabled?: boolean; size?: 'lg' | 'md'; onListeningChange?: (l: boolean) => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'processing'>('idle')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [typing, setTyping] = useState(() => !speechRecognitionSupported())
  const [typed, setTyped] = useState('')
  const [level, setLevel] = useState(0)
  const session = useRef<SttSession | null>(null)
  const supported = speechRecognitionSupported()

  useEffect(() => () => session.current?.cancel(), [])
  useEffect(() => onListeningChange?.(state === 'listening'), [state, onListeningChange])

  const start = async () => {
    if (disabled) return
    setError(null)
    setInterim('')
    const { profile, settings } = useGame.getState()
    blip('start', settings.volume)
    setState('listening')
    session.current = await startListening(LANGUAGES[profile.targetLang].speechTag, {
      onInterim: setInterim,
      onLevel: setLevel,
      onFinal: (text, confidence) => {
        setState('idle')
        setLevel(0)
        blip('stop', settings.volume)
        onResult({ text, confidence, source: 'speech' })
      },
      onError: (msg, code) => {
        setState('idle')
        setLevel(0)
        setError(msg)
        if (code === 'unsupported' || code === 'permission' || code === 'network') setTyping(true)
      },
    })
  }

  const stop = () => {
    setState('processing')
    session.current?.stop()
  }

  const submitTyped = () => {
    if (!typed.trim()) return
    onResult({ text: typed.trim(), confidence: null, source: 'typed' })
    setTyped('')
  }

  const big = size === 'lg'
  const listening = state === 'listening'
  const dim = big ? 84 : 64

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex items-center gap-5">
        {/* level bars left */}
        <Bars level={level} active={listening} />
        <div className="relative" style={{ width: dim, height: dim }}>
          {listening && (
            <>
              <span className="absolute inset-0 rounded-full bg-lime/40" style={{ animation: 'pulse-ring 1.4s ease-out infinite' }} />
              <span className="absolute inset-0 rounded-full bg-lime/30" style={{ animation: 'pulse-ring 1.4s ease-out 0.5s infinite' }} />
            </>
          )}
          <motion.button
            whileTap={{ scale: 0.94 }}
            animate={{ scale: listening ? 1 + level * 0.12 : 1 }}
            disabled={disabled || state === 'processing'}
            onClick={listening ? stop : start}
            className={`relative grid h-full w-full place-items-center rounded-full border-4 transition ${
              listening ? 'border-forest bg-coral text-cream shadow-[0_0_0_6px_rgba(249,115,98,0.25)]' : 'border-forest bg-gradient-to-b from-[#c2f75a] to-[#86cf22] text-forest shadow-[0_6px_0_#4f8a14,0_18px_40px_-12px_rgba(163,230,53,0.7)]'
            } disabled:opacity-50`}
            aria-label={listening ? 'Stop recording' : 'Start speaking'}
          >
            {listening ? <Square className="h-7 w-7" fill="currentColor" /> : <Mic className={big ? 'h-9 w-9' : 'h-7 w-7'} strokeWidth={2.4} />}
          </motion.button>
        </div>
        <Bars level={level} active={listening} mirror />
      </div>
      <div className="mt-3 min-h-[24px] text-center">
        <AnimatePresence mode="wait">
          {listening ? (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-display text-[14px] font-medium">
              <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
              <span className="text-coral">Recording</span>
              <span className="ml text-current/80">{interim ? `“${interim}”` : 'speak now…'}</span>
            </motion.div>
          ) : state === 'processing' ? (
            <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-[14px] opacity-70">
              Transcribing…
            </motion.div>
          ) : (
            <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-[13px] opacity-60">
              {supported ? 'Tap the mic and say your reply' : 'Speech recognition isn’t available in this browser'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <div className="mt-2 flex max-w-lg items-start gap-2 rounded-xl bg-coral/15 px-3 py-2 text-[13px] font-semibold text-[#b23a2b]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {typing ? (
        <div className="mt-3 flex w-full max-w-lg items-center gap-2">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitTyped()}
            placeholder="Type in Malayalam or romanised, e.g. Enikku station pokanam"
            className="ml h-11 flex-1 rounded-xl border-2 border-forest/20 bg-white/80 px-4 text-[15px] text-forest outline-none placeholder:text-forest/40 focus:border-lime-deep"
            disabled={disabled}
          />
          <button onClick={submitTyped} disabled={disabled || !typed.trim()} className="btn-primary grid h-11 w-11 place-items-center !rounded-xl" aria-label="Submit answer">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button onClick={() => setTyping(true)} className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold opacity-60 hover:opacity-100">
          <Keyboard className="h-3.5 w-3.5" /> Can’t speak right now? Type instead
        </button>
      )}
    </div>
  )
}

function Bars({ level, active, mirror }: { level: number; active: boolean; mirror?: boolean }) {
  const n = 6
  return (
    <div className={`flex h-12 items-center gap-1 ${mirror ? 'flex-row-reverse' : ''}`}>
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 1) / n
        const h = active ? 6 + Math.max(0, level * 44 * k * (0.6 + Math.random() * 0.4)) : 6
        return <span key={i} className={`w-1.5 rounded-full transition-[height] duration-75 ${active ? 'bg-coral' : 'bg-current opacity-20'}`} style={{ height: h }} />
      })}
    </div>
  )
}

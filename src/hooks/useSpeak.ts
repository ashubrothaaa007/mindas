import { useCallback, useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking, type TtsResult } from '@/services/voice/tts'
import { useGame } from '@/store/game'
import { LANGUAGES } from '@/data/languages'

export function useSpeak() {
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)
  const [engine, setEngine] = useState<TtsResult['engine'] | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      stopSpeaking()
    }
  }, [])

  const play = useCallback(async (line: { text: string; roman: string }, opts: { slow?: boolean; key?: string; gender?: 'm' | 'f' } = {}) => {
    const { settings, profile } = useGame.getState()
    const key = opts.key ?? line.text + (opts.slow ? ':slow' : '')
    setSpeakingKey(key)
    const res = await speak({
      text: line.text,
      roman: line.roman,
      tag: LANGUAGES[profile.targetLang].speechTag,
      rate: settings.voiceRate * (opts.slow ? 0.6 : 1),
      volume: Math.max(0.05, settings.volume),
      gender: opts.gender,
    })
    if (!mounted.current) return
    setEngine(res.engine)
    setSpeakingKey((k) => (k === key ? null : k))
  }, [])

  return { play, speakingKey, engine, stop: () => (stopSpeaking(), setSpeakingKey(null)) }
}

export const engineNote = (engine: TtsResult['engine'] | null) =>
  engine === 'browser-approx'
    ? 'No Malayalam voice is installed in this browser, so audio reads the pronunciation guide. Connect the Sarvam voice backend for native audio.'
    : engine === 'none'
      ? 'Audio playback is unavailable in this browser. Use the pronunciation guide.'
      : null

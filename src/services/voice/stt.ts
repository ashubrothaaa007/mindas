import { VOICE_API_URL } from '../config'

export interface SttCallbacks {
  onInterim?: (text: string) => void
  onFinal: (text: string, confidence: number | null) => void
  onError: (message: string, code: 'unsupported' | 'permission' | 'no-speech' | 'network' | 'other') => void
  onLevel?: (level: number) => void
}

export interface SttSession {
  stop: () => void
  cancel: () => void
}

type SR = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

const SpeechRecognitionCtor = (): (new () => SR) | null => {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export const speechRecognitionSupported = () => Boolean(VOICE_API_URL ? navigator.mediaDevices && 'MediaRecorder' in window : SpeechRecognitionCtor())

/** Live microphone level meter (0..1) for the recording visualiser. */
async function startMeter(onLevel: (l: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const ctx = new AudioContext()
  const src = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  src.connect(analyser)
  const buf = new Uint8Array(analyser.fftSize)
  let raf = 0
  const tick = () => {
    analyser.getByteTimeDomainData(buf)
    let sum = 0
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128
      sum += v * v
    }
    onLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4))
    raf = requestAnimationFrame(tick)
  }
  tick()
  return {
    stream,
    dispose: () => {
      cancelAnimationFrame(raf)
      stream.getTracks().forEach((t) => t.stop())
      ctx.close().catch(() => {})
    },
  }
}

export async function startListening(langTag: string, cb: SttCallbacks): Promise<SttSession> {
  let meter: Awaited<ReturnType<typeof startMeter>> | null = null
  try {
    meter = await startMeter((l) => cb.onLevel?.(l))
  } catch (e) {
    const name = (e as Error)?.name
    cb.onError(
      name === 'NotAllowedError' ? 'Microphone access was blocked. Allow the mic in your browser, or type your answer below.' : 'No microphone was found. You can type your answer below.',
      'permission',
    )
    return { stop: () => {}, cancel: () => {} }
  }

  // Cloud path: record audio and send to Sarvam Saaras through the backend
  if (VOICE_API_URL) {
    const rec = new MediaRecorder(meter.stream)
    const chunks: Blob[] = []
    let cancelled = false
    rec.ondataavailable = (e) => chunks.push(e.data)
    rec.onstop = async () => {
      meter?.dispose()
      if (cancelled) return
      try {
        const form = new FormData()
        form.append('file', new Blob(chunks, { type: rec.mimeType }), 'speech.webm')
        form.append('lang', langTag)
        const res = await fetch(`${VOICE_API_URL}/stt`, { method: 'POST', body: form })
        if (!res.ok) throw new Error(`STT ${res.status}`)
        const data = (await res.json()) as { transcript: string; confidence?: number }
        if (!data.transcript?.trim()) cb.onError('I didn’t catch anything. Try speaking a little louder.', 'no-speech')
        else cb.onFinal(data.transcript, data.confidence ?? null)
      } catch {
        cb.onError('The speech service could not be reached. Type your answer instead, or try again.', 'network')
      }
    }
    rec.start()
    return {
      stop: () => rec.state !== 'inactive' && rec.stop(),
      cancel: () => {
        cancelled = true
        if (rec.state !== 'inactive') rec.stop()
      },
    }
  }

  const Ctor = SpeechRecognitionCtor()
  if (!Ctor) {
    meter.dispose()
    cb.onError('This browser has no built-in speech recognition. Use Chrome or Edge, or type your answer below.', 'unsupported')
    return { stop: () => {}, cancel: () => {} }
  }
  const sr = new Ctor()
  sr.lang = langTag
  sr.interimResults = true
  sr.continuous = false
  sr.maxAlternatives = 1
  let finalText = ''
  let finalConf: number | null = null
  let settled = false
  let cancelled = false
  sr.onresult = (e) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) {
        finalText += r[0].transcript
        finalConf = r[0].confidence || null
      } else interim += r[0].transcript
    }
    cb.onInterim?.((finalText + ' ' + interim).trim())
  }
  sr.onerror = (e) => {
    if (settled || cancelled) return
    settled = true
    meter?.dispose()
    const map: Record<string, [string, SttCallbacks['onError'] extends (a: string, b: infer C) => void ? C : never]> = {
      'not-allowed': ['Microphone access was blocked. Allow the mic, or type your answer below.', 'permission'],
      'no-speech': ['I didn’t hear anything. Tap the mic and speak after the beep.', 'no-speech'],
      network: ['Speech recognition needs an internet connection. Type your answer instead.', 'network'],
      'language-not-supported': ['Your browser can’t recognise this language yet. Type your answer instead.', 'unsupported'],
    }
    const [msg, code] = map[e.error] ?? ['Speech recognition stopped unexpectedly. Try again or type your answer.', 'other']
    cb.onError(msg, code)
  }
  sr.onend = () => {
    meter?.dispose()
    if (settled || cancelled) return
    settled = true
    if (finalText.trim()) cb.onFinal(finalText.trim(), finalConf)
    else cb.onError('I didn’t catch that. Tap the mic and try again.', 'no-speech')
  }
  try {
    sr.start()
  } catch {
    meter.dispose()
    cb.onError('Could not start speech recognition. Type your answer instead.', 'other')
  }
  return {
    stop: () => sr.stop(),
    cancel: () => {
      cancelled = true
      meter?.dispose()
      sr.abort()
    },
  }
}

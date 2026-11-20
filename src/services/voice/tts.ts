import { VOICE_API_URL } from '../config'

export type TtsResult = { engine: 'cloud' | 'browser-native' | 'browser-approx' | 'none' }

let currentAudio: HTMLAudioElement | null = null
let voicesCache: SpeechSynthesisVoice[] = []

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!('speechSynthesis' in window)) return Promise.resolve([])
  const v = speechSynthesis.getVoices()
  if (v.length) {
    voicesCache = v
    return Promise.resolve(v)
  }
  return new Promise((resolve) => {
    const done = () => {
      voicesCache = speechSynthesis.getVoices()
      resolve(voicesCache)
    }
    speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    setTimeout(done, 800)
  })
}

export async function nativeVoiceAvailable(tag: string): Promise<boolean> {
  const voices = voicesCache.length ? voicesCache : await loadVoices()
  const base = tag.split('-')[0]
  return voices.some((v) => v.lang.toLowerCase().startsWith(base))
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/**
 * Speak a target-language line.
 * Cloud: Sarvam Bulbul via backend. Browser: native voice for the language when installed,
 * otherwise an approximate reading of the romanised pronunciation with an Indian English voice.
 */
export async function speak(opts: { text: string; roman: string; tag: string; rate: number; volume: number; gender?: 'm' | 'f' }): Promise<TtsResult> {
  stopSpeaking()
  if (VOICE_API_URL) {
    try {
      const res = await fetch(`${VOICE_API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: opts.text, lang: opts.tag, pace: opts.rate, speaker: opts.gender === 'f' ? 'female' : 'male' }),
      })
      if (!res.ok) throw new Error(`TTS ${res.status}`)
      const blob = await res.blob()
      const audio = new Audio(URL.createObjectURL(blob))
      audio.volume = opts.volume
      currentAudio = audio
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve()
        audio.onerror = () => resolve()
        audio.play().catch(() => resolve())
      })
      return { engine: 'cloud' }
    } catch (e) {
      console.warn('[MINDA] Cloud TTS failed, falling back to browser speech', e)
    }
  }
  if (!('speechSynthesis' in window)) return { engine: 'none' }
  const voices = voicesCache.length ? voicesCache : await loadVoices()
  const base = opts.tag.split('-')[0]
  const native = voices.find((v) => v.lang.toLowerCase().startsWith(base))
  const approx = voices.find((v) => v.lang === 'en-IN') ?? voices.find((v) => v.lang.startsWith('en'))
  const useNative = Boolean(native)
  const utter = new SpeechSynthesisUtterance(useNative ? opts.text : opts.roman)
  utter.lang = useNative ? native!.lang : 'en-IN'
  if (useNative) utter.voice = native!
  else if (approx) utter.voice = approx
  utter.rate = opts.rate
  utter.volume = opts.volume
  utter.pitch = opts.gender === 'f' ? 1.15 : 0.95
  await new Promise<void>((resolve) => {
    utter.onend = () => resolve()
    utter.onerror = () => resolve()
    speechSynthesis.speak(utter)
    // Safety: some engines never fire onend
    setTimeout(resolve, Math.max(2500, opts.text.length * 180) / opts.rate)
  })
  return { engine: useNative ? 'browser-native' : 'browser-approx' }
}

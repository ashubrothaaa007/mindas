/**
 * MINDA voice backend.
 *
 * API keys for Sarvam (Saaras STT, Bulbul TTS) and Gemini must never ship to the browser.
 * Point VITE_MINDA_API_URL at a server (Supabase Edge Function, etc.) that exposes:
 *
 *   POST {url}/tts       { text, lang, speaker, pace }            -> audio/wav|mpeg bytes   (Sarvam Bulbul v4 Flash)
 *   POST {url}/stt       multipart: file (audio/webm), lang         -> { transcript, confidence? } (Sarvam Saaras v4)
 *   POST {url}/evaluate  { expected, concepts, transcript, context } -> Feedback JSON        (Gemini)
 *   POST {url}/progress  { playerId, progress }                     -> { ok: true }           (Supabase upsert)
 *
 * When the variable is unset the game runs in Demo mode: it uses the browser's own speech
 * engines and an on-device evaluator, and labels itself as such in the UI.
 */
export const VOICE_API_URL: string | undefined = (import.meta.env.VITE_MINDA_API_URL as string | undefined)?.replace(/\/$/, '') || undefined

export type Engine = 'cloud' | 'browser' | 'demo'

export const backendMode = (): 'cloud' | 'demo' => (VOICE_API_URL ? 'cloud' : 'demo')

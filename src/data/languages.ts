import kerala from '@/assets/regions/kerala.jpg'
import tamilnadu from '@/assets/regions/tamilnadu.jpg'
import karnataka from '@/assets/regions/karnataka.jpg'
import japan from '@/assets/regions/japan.jpg'
import france from '@/assets/regions/france.jpg'
import spain from '@/assets/regions/spain.jpg'

export type LangCode = 'en' | 'ml' | 'ta' | 'hi' | 'te' | 'kn' | 'bn' | 'ja' | 'fr' | 'es'

export interface Language {
  code: LangCode
  name: string
  native: string
  glyph: string
  /** BCP-47 tag used for speech recognition + synthesis */
  speechTag: string
}

export const LANGUAGES: Record<LangCode, Language> = {
  en: { code: 'en', name: 'English', native: 'English', glyph: 'Aa', speechTag: 'en-IN' },
  ml: { code: 'ml', name: 'Malayalam', native: 'മലയാളം', glyph: 'മ', speechTag: 'ml-IN' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', glyph: 'த', speechTag: 'ta-IN' },
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी', glyph: 'अ', speechTag: 'hi-IN' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', glyph: 'త', speechTag: 'te-IN' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', glyph: 'ಕ', speechTag: 'kn-IN' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা', glyph: 'অ', speechTag: 'bn-IN' },
  ja: { code: 'ja', name: 'Japanese', native: '日本語', glyph: 'あ', speechTag: 'ja-JP' },
  fr: { code: 'fr', name: 'French', native: 'Français', glyph: 'É', speechTag: 'fr-FR' },
  es: { code: 'es', name: 'Spanish', native: 'Español', glyph: 'Ñ', speechTag: 'es-ES' },
}

export const NATIVE_OPTIONS: LangCode[] = ['en', 'ml', 'ta', 'hi', 'te', 'kn', 'bn']
export const TARGET_OPTIONS: LangCode[] = ['ml', 'ta', 'hi', 'kn', 'te', 'ja', 'fr', 'es']
/** Target languages with a fully built, playable region. */
export const PLAYABLE_TARGETS: LangCode[] = ['ml']

export type Difficulty = 'beginner' | 'basic' | 'intermediate' | 'advanced'
export const DIFFICULTIES: { id: Difficulty; title: string; desc: string; mode: ConversationMode }[] = [
  { id: 'beginner', title: 'Complete Beginner', desc: 'I know nothing yet. Show me everything.', mode: 'beginner' },
  { id: 'basic', title: 'Basic', desc: 'I know a few words and greetings.', mode: 'beginner' },
  { id: 'intermediate', title: 'Intermediate', desc: 'I can manage simple conversations.', mode: 'guided' },
  { id: 'advanced', title: 'Advanced', desc: 'Throw me in. Hints only when I ask.', mode: 'immersive' },
]

export type ConversationMode = 'beginner' | 'guided' | 'immersive'

export interface Region {
  id: string
  name: string
  city: string
  language: LangCode
  image: string
  tagline: string
  playable: boolean
}

export const REGIONS: Region[] = [
  { id: 'kerala', name: 'Kerala', city: 'Kochi', language: 'ml', image: kerala, tagline: 'Backwaters, chai and auto stands', playable: true },
  { id: 'tamilnadu', name: 'Tamil Nadu', city: 'Madurai', language: 'ta', image: tamilnadu, tagline: 'Temple towns and flower markets', playable: false },
  { id: 'karnataka', name: 'Karnataka', city: 'Mysuru', language: 'kn', image: karnataka, tagline: 'Palaces and boulder country', playable: false },
  { id: 'japan', name: 'Japan', city: 'Kyoto', language: 'ja', image: japan, tagline: 'Lantern-lit lanes and tea houses', playable: false },
  { id: 'france', name: 'France', city: 'Paris', language: 'fr', image: france, tagline: 'Cafés, boulangeries and the metro', playable: false },
  { id: 'spain', name: 'Spain', city: 'Sevilla', language: 'es', image: spain, tagline: 'Plazas, tapas and orange trees', playable: false },
]

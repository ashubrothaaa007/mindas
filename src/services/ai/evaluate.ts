import type { Concept } from '@/data/missions'
import { VOICE_API_URL } from '../config'

export interface Feedback {
  score: number
  passed: boolean
  transcript: string
  meaning: string
  matched: Concept[]
  missing: Concept[]
  grammar: string
  context: string
  pronunciation: string | null
  improved: string
  improvedRoman: string
  minuLine: string
  engine: 'gemini' | 'on-device'
}

export interface EvalInput {
  transcript: string
  confidence: number | null
  source: 'speech' | 'typed'
  expected: { text: string; roman: string; intent: string }
  concepts: Concept[]
  grammar: string
  context: string
  npcLine?: string
}

const CHILLU: Record<string, string> = { 'ൽ': 'ല്', 'ൻ': 'ന്', 'ർ': 'ര്', 'ൾ': 'ള്', 'ൺ': 'ണ്', 'ൿ': 'ക്' }

export function normalize(s: string) {
  return s
    .normalize('NFC')
    .replace(/[\u200c\u200d]/g, '')
    .replace(/[ൽൻർൾൺൿ]/g, (c) => CHILLU[c])
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’()₹-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function lev(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

const isMalayalam = (s: string) => /[\u0D00-\u0D7F]/.test(s)

function conceptMatched(concept: Concept, text: string, tokens: string[]) {
  return concept.variants.some((raw) => {
    const v = normalize(raw)
    if (!v) return false
    if (isMalayalam(v)) {
      if (text.includes(v)) return true
      // tolerate a dropped/extra vowel sign on longer words
      return v.length >= 4 && tokens.some((t) => isMalayalam(t) && (t.includes(v.slice(0, -1)) || lev(t.slice(0, v.length), v) <= 1))
    }
    if (/^\d+$/.test(v)) return tokens.includes(v)
    if (text.includes(v) && v.length >= 3) return true
    const tol = v.length <= 4 ? 0 : v.length <= 7 ? 1 : 2
    return tokens.some((t) => t === v || (tol > 0 && Math.abs(t.length - v.length) <= tol + 1 && lev(t, v) <= tol) || (v.length >= 5 && t.startsWith(v.slice(0, v.length - 1))))
  })
}

/** On-device evaluator: semantic concept matching, not exact-sentence matching. */
export function evaluateLocally(input: EvalInput): Feedback {
  const text = normalize(input.transcript)
  const tokens = text.split(' ').filter(Boolean)
  const matched: Concept[] = []
  const missing: Concept[] = []
  for (const c of input.concepts) (conceptMatched(c, text, tokens) ? matched : missing).push(c)
  const req = input.concepts.filter((c) => c.required)
  const reqHit = req.filter((c) => matched.includes(c)).length
  const opt = input.concepts.filter((c) => !c.required)
  const optHit = opt.filter((c) => matched.includes(c)).length
  const reqRatio = req.length ? reqHit / req.length : 1
  const optRatio = opt.length ? optHit / opt.length : 1
  const script = isMalayalam(input.transcript)
  const englishOnly = !script && tokens.length > 0 && matched.length === 0

  let score = Math.round(30 + reqRatio * 50 + optRatio * 14 + (script ? 6 : 0))
  if (reqHit === 0) score = Math.min(score, tokens.length ? 35 : 0)
  if (input.source === 'speech' && input.confidence && input.confidence < 0.6) score -= 4
  score = Math.max(0, Math.min(100, score))
  const passed = reqRatio === 1

  const meaning = passed
    ? `“${input.expected.intent}”${optRatio < 1 ? ' (in a shorter form)' : ''}`
    : matched.length
      ? `You got across: ${matched.map((c) => c.label).join(', ')}, but the key idea is missing.`
      : englishOnly
        ? 'That sounded like English. Try the Malayalam phrase. Listen first, then repeat.'
        : 'I couldn’t match that to this situation yet.'

  let pronunciation: string | null = null
  if (input.source === 'speech' && input.confidence !== null && input.confidence > 0) {
    const pct = Math.round(input.confidence * 100)
    pronunciation =
      pct >= 85 ? `Clear speech: the recogniser was ${pct}% confident.` : pct >= 65 ? `Mostly clear (${pct}% recogniser confidence). Slow down slightly on longer words.` : `The recogniser was only ${pct}% sure. Try the slow audio and match its rhythm.`
  }

  const minuLine =
    score >= 90
      ? 'Brilliant! That sounded completely natural.'
      : passed
        ? 'Great job! You got your message across clearly.'
        : score >= 50
          ? 'So close! Add the missing word and you’ve got it.'
          : 'No worries, that’s how everyone learns. Listen once more and try again!'

  return {
    score,
    passed,
    transcript: input.transcript,
    meaning,
    matched,
    missing,
    grammar: input.grammar,
    context: passed ? input.context : 'The other person needs the missing information to respond.',
    pronunciation,
    improved: input.expected.text,
    improvedRoman: input.expected.roman,
    minuLine,
    engine: 'on-device',
  }
}

/** Uses the Gemini-backed evaluator when configured; falls back to the on-device evaluator. */
export async function evaluate(input: EvalInput): Promise<Feedback> {
  const local = evaluateLocally(input)
  if (!VOICE_API_URL) return local
  try {
    const res = await fetch(`${VOICE_API_URL}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: input.transcript,
        expected: input.expected,
        concepts: input.concepts.map((c) => ({ label: c.label, target: c.target, required: c.required })),
        npcLine: input.npcLine,
        context: input.context,
      }),
    })
    if (!res.ok) throw new Error(`evaluate ${res.status}`)
    const remote = (await res.json()) as Partial<Feedback>
    return { ...local, ...remote, matched: local.matched, missing: local.missing, engine: 'gemini' }
  } catch (e) {
    console.warn('[MINDA] Remote evaluation failed, using on-device evaluator', e)
    return local
  }
}

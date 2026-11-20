import { Volume2, RotateCcw, Snail } from 'lucide-react'
import type { useSpeak } from '@/hooks/useSpeak'
import { useT } from '@/hooks/useT'

type Speak = ReturnType<typeof useSpeak>

export function SpeakControls({ line, speaker, gender, compact = false, tone = 'light' }: { line: { text: string; roman: string }; speaker: Speak; gender?: 'm' | 'f'; compact?: boolean; tone?: 'light' | 'dark' }) {
  const t = useT()
  const playing = speaker.speakingKey === line.text
  const playingSlow = speaker.speakingKey === line.text + ':slow'
  const base =
    tone === 'light'
      ? 'border-forest/15 bg-forest/5 text-forest hover:bg-forest/10'
      : 'border-white/15 bg-white/5 text-cream hover:bg-white/10'
  const btn = `inline-flex items-center gap-1.5 rounded-xl border px-3 ${compact ? 'h-8 text-[12px]' : 'h-9 text-[13px]'} font-display font-medium transition`
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={`${btn} ${playing ? '!border-lime-deep !bg-lime text-forest' : base}`} onClick={() => speaker.play(line, { gender })}>
        <Volume2 className={`h-4 w-4 ${playing ? 'animate-pulse' : ''}`} /> {t('listen')}
      </button>
      <button className={`${btn} ${base}`} onClick={() => speaker.play(line, { gender, key: line.text })} title={t('replay')}>
        <RotateCcw className="h-4 w-4" /> {!compact && t('replay')}
      </button>
      <button className={`${btn} ${playingSlow ? '!border-lime-deep !bg-lime text-forest' : base}`} onClick={() => speaker.play(line, { gender, slow: true })}>
        <Snail className="h-4 w-4" /> {t('slow')}
      </button>
    </div>
  )
}

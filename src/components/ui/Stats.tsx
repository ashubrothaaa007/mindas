import { Coins, Flame } from 'lucide-react'
import { levelFromXp, useGame, XP_PER_LEVEL } from '@/store/game'
import { useT } from '@/hooks/useT'

export function Avatar({ size = 40, onClick }: { size?: number; onClick?: () => void }) {
  const name = useGame((s) => s.profile.name)
  const outfit = useGame((s) => s.progress.outfit)
  const color = outfit === 'outfit-lime' ? '#9bdc3a' : outfit === 'outfit-sunset' ? '#f97362' : outfit === 'outfit-royal' ? '#3b6fd8' : '#2b8a6e'
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-lime/70 transition hover:ring-lime"
      style={{ width: size, height: size, background: `radial-gradient(circle at 50% 120%, ${color} 0 45%, #f3ead0 46%)` }}
      aria-label={onClick ? `Open ${name}'s profile` : name}
    >
      <span className="absolute top-[18%] h-[38%] w-[38%] rounded-full bg-[#b07a52]" />
      <span className="absolute top-[14%] h-[20%] w-[40%] rounded-t-full bg-[#1b1410]" />
      <span className="sr-only">{name}</span>
    </Tag>
  )
}

export function LevelRing({ size = 46 }: { size?: number }) {
  const xp = useGame((s) => s.progress.xp)
  const level = levelFromXp(xp)
  const pct = (xp % XP_PER_LEVEL) / XP_PER_LEVEL
  const r = size / 2 - 4
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#b8f53c" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s' }} />
      </svg>
      <span className="absolute font-display text-[15px] font-bold text-cream">{level}</span>
    </div>
  )
}

export function PlayerStats({ onProfile }: { onProfile?: () => void }) {
  const t = useT()
  const { xp, coins, streak } = useGame((s) => s.progress)
  return (
    <div className="glass flex items-center gap-1 rounded-2xl p-1.5 pr-2">
      <div className="flex items-center gap-2.5 rounded-xl px-2 py-1">
        <LevelRing />
        <div className="leading-tight">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sage">
            {t('level')} {levelFromXp(xp)}
          </div>
          <div className="font-display text-[15px] font-semibold text-cream">
            {xp % XP_PER_LEVEL}
            <span className="text-sage"> / {XP_PER_LEVEL} XP</span>
          </div>
        </div>
      </div>
      <div className="mx-1 h-8 w-px bg-white/10" />
      <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5" title={t('coins')}>
        <Coins className="h-5 w-5 text-sun" strokeWidth={2.4} />
        <span className="font-display text-[17px] font-semibold tabular-nums text-cream">{coins}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5" title={t('streak')}>
        <Flame className={`h-5 w-5 ${streak > 0 ? 'text-coral' : 'text-sage'}`} strokeWidth={2.4} />
        <span className="font-display text-[17px] font-semibold tabular-nums text-cream">{streak}</span>
      </div>
      <div className="ml-1">
        <Avatar size={40} onClick={onProfile} />
      </div>
    </div>
  )
}

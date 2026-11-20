export function FoxMark({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <path d="M8 8 L20 18 L28 18 L40 8 L38 26 C38 36 31 42 24 42 C17 42 10 36 10 26 Z" fill="#a3e635" />
      <path d="M8 8 L14 13 L11 17 Z M40 8 L34 13 L37 17 Z" fill="#14361f" />
      <path d="M24 28 C30 28 34 32 34 35 C32 39 28 42 24 42 C20 42 16 39 14 35 C14 32 18 28 24 28 Z" fill="#fbf6e6" />
      <circle cx="18" cy="25" r="2.6" fill="#0d1a12" />
      <circle cx="30" cy="25" r="2.6" fill="#0d1a12" />
      <circle cx="18.8" cy="24.2" r="0.9" fill="#fff" />
      <circle cx="30.8" cy="24.2" r="0.9" fill="#fff" />
      <ellipse cx="24" cy="31" rx="2.4" ry="1.7" fill="#0d1a12" />
    </svg>
  )
}

export function Logo({ compact = false, sub }: { compact?: boolean; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_6px_20px_-6px_rgba(163,230,53,0.45)] ring-1 ring-lime/30">
        <FoxMark size={32} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold tracking-[0.08em] text-cream">MINDA</span>
            <span className="ml text-[15px] font-semibold text-lime">മിണ്ട്</span>
          </div>
          {sub && <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sage">{sub}</div>}
        </div>
      )}
    </div>
  )
}

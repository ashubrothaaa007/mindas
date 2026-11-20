import { useEffect, useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({ open, onClose, title, kicker, children, width = 920, icon }: { open: boolean; onClose: () => void; title: string; kicker?: string; children: ReactNode; width?: number; icon?: ReactNode }) {
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop fixed inset-0 z-[60] grid place-items-center bg-ink/65 p-8 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            initial={{ y: 24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="modal-window glass flex max-h-[86vh] w-full flex-col overflow-hidden rounded-[24px]"
            style={{ maxWidth: width }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-7 py-5">
              {icon && <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-forest">{icon}</div>}
              <div className="flex-1">
                {kicker && <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lime/80">{kicker}</div>}
                <h2 id={titleId} className="font-display text-[26px] font-semibold leading-tight text-cream">{title}</h2>
              </div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-cream/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-cream" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string; disabled?: boolean }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
      {options.map((o) => (
        <button
          key={o.id}
          disabled={o.disabled}
          onClick={() => onChange(o.id)}
          className={`h-9 rounded-lg px-3.5 font-display text-[14px] font-medium transition ${value === o.id ? 'bg-lime text-forest' : 'text-cream/70 hover:text-cream disabled:opacity-35'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Slider({ value, min, max, step, onChange, format }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-56 cursor-pointer appearance-none rounded-full accent-lime"
        style={{ background: `linear-gradient(90deg, #a3e635 ${pct}%, rgba(255,255,255,0.12) ${pct}%)` }}
      />
      <span className="w-14 text-right font-display text-[14px] font-semibold tabular-nums text-cream">{format ? format(value) : value}</span>
    </div>
  )
}

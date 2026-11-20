import { AnimatePresence, motion } from 'framer-motion'
import { Award, MapPin, Info } from 'lucide-react'
import { useGame } from '@/store/game'

export function Toasts() {
  const toasts = useGame((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[80] flex w-[min(92vw,440px)] -translate-x-1/2 flex-col items-center gap-2" aria-live="polite" aria-relevant="additions text">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="glass flex w-full min-w-0 items-center gap-3 rounded-2xl px-4 py-3"
            role="status"
          >
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${t.kind === 'achievement' ? 'bg-sun text-forest' : t.kind === 'discovery' ? 'bg-lime text-forest' : 'bg-white/10 text-cream'}`}>
              {t.kind === 'achievement' ? <Award className="h-5 w-5" /> : t.kind === 'discovery' ? <MapPin className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold text-cream">{t.title}</div>
              {t.body && <div className="ml text-[13px] text-sage">{t.body}</div>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

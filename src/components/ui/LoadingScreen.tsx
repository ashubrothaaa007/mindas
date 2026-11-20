import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Minu } from '../mascot/Minu'

const TIPS = [
  'You don’t need perfect grammar. Locals understand the key words.',
  'ചേച്ചി (chechi) and ചേട്ടാ (chetta) are friendly ways to address people.',
  'Tap “Slow” to hear every syllable clearly before you speak.',
  'Bargaining at the auto stand is expected. Counter with a smaller number!',
  'Hold Shift while walking to sprint across Kochi.',
]

export function LoadingScreen({ label = 'Loading Kochi' }: { label?: string }) {
  const [tip, setTip] = useState(() => Math.floor(Math.random() * TIPS.length))
  useEffect(() => {
    const t = setInterval(() => setTip((x) => (x + 1) % TIPS.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="absolute inset-0 z-[70] grid place-items-center bg-[radial-gradient(ellipse_at_50%_40%,#1d4a2b_0%,#0d1a12_70%)]"
    >
      <div className="flex flex-col items-center">
        <Minu mood="thinking" size={170} />
        <div className="mt-4 font-display text-[28px] font-semibold text-cream">{label}…</div>
        <div className="mt-4 h-2 w-72 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #b8f53c, transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite' }} />
        </div>
        <motion.p key={tip} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ml mt-6 max-w-md text-center text-[15px] text-sage">
          {TIPS[tip]}
        </motion.p>
      </div>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Backpack, ChevronLeft, ChevronRight, Compass, Route, ScrollText } from 'lucide-react'
import { useGame } from '@/store/game'
import { useT } from '@/hooks/useT'

export function SideNav({ floating = false }: { floating?: boolean }) {
  const t = useT()
  const [open, setOpen] = useState(true)
  const screen = useGame((s) => s.screen)
  const overlay = useGame((s) => s.overlay)
  const setScreen = useGame((s) => s.setScreen)
  const setOverlay = useGame((s) => s.setOverlay)

  const items = [
    { id: 'explore', label: t('explore'), icon: Compass, key: '', active: screen === 'world' && !overlay, run: () => setScreen('world') },
    { id: 'path', label: t('learningPath'), icon: Route, key: '', active: screen === 'path', run: () => setScreen('path') },
    { id: 'missions', label: t('missions'), icon: ScrollText, key: 'J', active: overlay === 'missions', run: () => setOverlay(overlay === 'missions' ? null : 'missions') },
    { id: 'progress', label: t('progress'), icon: BarChart3, key: '', active: screen === 'profile', run: () => setScreen('profile') },
    { id: 'inventory', label: t('inventory'), icon: Backpack, key: 'I', active: overlay === 'inventory', run: () => setOverlay(overlay === 'inventory' ? null : 'inventory') },
  ]

  return (
    <motion.nav
      aria-label="Main navigation"
      animate={{ width: open ? 212 : 64 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      className={`glass flex flex-col gap-1 overflow-hidden rounded-3xl p-2 ${floating ? '' : 'h-full'}`}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={it.run}
          aria-label={it.label}
          aria-current={it.active ? 'page' : undefined}
          className={`group relative flex h-12 items-center gap-3 rounded-2xl px-3 text-left transition ${it.active ? 'bg-lime text-forest' : 'text-cream/80 hover:bg-white/8 hover:text-cream'}`}
          title={it.label}
        >
          <it.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2.2} />
          {open && <span className="flex-1 truncate font-display text-[15px] font-medium">{it.label}</span>}
          {open && it.key && <span className={`kbd !h-5 !min-w-5 !text-[10px] ${it.active ? '!bg-forest !text-lime !shadow-none' : ''}`}>{it.key}</span>}
        </button>
      ))}
      <div className="flex-1" />
      <button onClick={() => setOpen((o) => !o)} className="flex h-10 items-center justify-center rounded-xl text-sage hover:bg-white/5 hover:text-cream" aria-label={open ? 'Collapse navigation' : 'Expand navigation'}>
        {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
    </motion.nav>
  )
}

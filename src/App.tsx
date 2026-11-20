import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '@/store/game'
const WelcomePage = lazy(() => import('@/pages/WelcomePage').then((m) => ({ default: m.WelcomePage })))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const WorldPage = lazy(() => import('@/pages/WorldPage').then((m) => ({ default: m.WorldPage })))
const LearningPathPage = lazy(() => import('@/pages/LearningPathPage').then((m) => ({ default: m.LearningPathPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
import { RewardScreen } from '@/components/rewards/RewardScreen'
import { ActivityOverlay } from '@/components/learning/ActivityOverlay'
import { Toasts } from '@/components/ui/Toasts'
import { CompanionPanel, InventoryOverlay, MissionsOverlay } from '@/components/game/Overlays'

export default function App() {
  const screen = useGame((s) => s.screen)
  return (
    <div className="app-shell relative h-full w-full overflow-hidden bg-ink text-cream">
      <AnimatePresence mode="wait">
        <motion.div key={screen} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <Suspense fallback={<div role="status" className="screen-loading grid h-full place-items-center bg-ink font-display text-lg text-cream"><span className="loading-indicator" aria-hidden="true" />Loading MINDA…</div>}>
            {screen === 'welcome' && <WelcomePage />}
            {screen === 'onboarding' && <OnboardingPage />}
            {screen === 'world' && <WorldPage />}
            {screen === 'path' && <LearningPathPage />}
            {screen === 'profile' && <ProfilePage />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      <MissionsOverlay />
      <InventoryOverlay />
      <CompanionPanel />
      <ActivityOverlay />
      <RewardScreen />
      <Toasts />
    </div>
  )
}

import { useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence } from 'framer-motion'
import { MainWorldScene } from '@/scenes/MainWorld/MainWorldScene'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { CompanionWidget, ControlsHint, InteractionPrompt, LeftNav, MissionPanel, Minimap, TopLeft, TopRight } from '@/components/game/HUD'
import { ConversationOverlay } from '@/components/missions/ConversationOverlay'
import { MapOverlay } from '@/components/game/Overlays'
import { PauseMenu } from '@/components/game/PauseMenu'
import { isMissionUnlocked, useGame } from '@/store/game'
import { attachInput, isTypingEvent, keys } from '@/systems/input'
import { npcById } from '@/data/world'
import { missionById } from '@/data/missions'
import { startAmbience, stopAmbience, setAmbienceVolume } from '@/services/audio/ambience'

export function WorldPage() {
  const ready = useGame((s) => s.worldReady)
  const conversation = useGame((s) => s.conversationMissionId)
  const setReady = useGame((s) => s.setWorldReady)
  const setScreen = useGame((s) => s.setScreen)
  const volume = useGame((s) => s.settings.volume)

  useEffect(() => {
    attachInput()
    setReady(false)
    startAmbience(useGame.getState().settings.volume)
    return () => {
      stopAmbience()
      keys.clear()
    }
  }, [setReady])

  useEffect(() => setAmbienceVolume(volume), [volume])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingEvent(e) || e.repeat) return
      const s = useGame.getState()
      if (s.reward || s.activity) return
      switch (e.code) {
        case 'Escape':
          e.preventDefault()
          if (s.overlay) s.setOverlay(null)
          else if (s.conversationMissionId) s.closeConversation()
          else s.setOverlay('pause')
          break
        case 'KeyE': {
          if (s.overlay || s.conversationMissionId || !s.nearbyNpcId) return
          const npc = npcById(s.nearbyNpcId)
          const m = npc ? missionById(npc.missionId) : null
          if (!m) return
          if (isMissionUnlocked(m.id, s.progress.completedMissions)) s.openConversation(m.id)
          else s.pushToast({ kind: 'info', title: 'Mission locked', body: `Complete “${missionById(m.unlockAfter!)?.title}” first.` })
          break
        }
        case 'KeyM':
          if (!s.conversationMissionId) s.toggleOverlay('map')
          break
        case 'KeyJ':
          if (!s.conversationMissionId) s.toggleOverlay('missions')
          break
        case 'KeyI':
          if (!s.conversationMissionId) s.toggleOverlay('inventory')
          break
        case 'KeyH':
          if (!s.conversationMissionId) s.toggleOverlay('companion')
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="world-page relative h-full w-full overflow-hidden bg-ink">
      <ErrorBoundary onExit={() => setScreen('welcome')}>
        <MainWorldScene />
      </ErrorBoundary>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.45)]" />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0">
        <div className="world-logo pointer-events-auto absolute left-6 top-6">
          <TopLeft />
        </div>
        <div className="world-stats pointer-events-auto absolute right-6 top-6">
          <TopRight />
        </div>
        {!conversation && (
          <>
            <div className="world-left-nav pointer-events-auto absolute left-6 top-[164px]">
              <LeftNav />
            </div>
            <div className="world-mission pointer-events-auto absolute right-6 top-[100px]">
              <MissionPanel />
            </div>
            <div className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2">
              <InteractionPrompt />
            </div>
            <div className="world-controls pointer-events-auto absolute bottom-6 left-6">
              <ControlsHint />
            </div>
            <div className="world-bottom-tools pointer-events-auto absolute bottom-6 right-6 flex items-end gap-3">
              <CompanionWidget />
              <Minimap />
            </div>
            <MobileGameControls />
          </>
        )}
      </div>

      <ConversationOverlay />
      <MapOverlay />
      <PauseMenu />
      <AnimatePresence>{!ready && <LoadingScreen />}</AnimatePresence>
    </div>
  )
}

function MobileGameControls() {
  const controls = [
    { label: 'Move forward', key: 'KeyW', grid: 'col-start-2 row-start-1', symbol: '↑' },
    { label: 'Move left', key: 'KeyA', grid: 'col-start-1 row-start-2', symbol: '←' },
    { label: 'Move backward', key: 'KeyS', grid: 'col-start-2 row-start-2', symbol: '↓' },
    { label: 'Move right', key: 'KeyD', grid: 'col-start-3 row-start-2', symbol: '→' },
  ]
  const press = (key: string) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    keys.add(key)
  }
  const release = (key: string) => () => keys.delete(key)

  useEffect(() => () => controls.forEach((control) => keys.delete(control.key)), [])

  return (
    <div className="mobile-game-controls pointer-events-auto absolute bottom-24 left-4 z-30" aria-label="Touch movement controls">
      <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
        {controls.map((control) => (
          <button
            key={control.key}
            type="button"
            aria-label={control.label}
            className={`touch-direction ${control.grid}`}
            onPointerDown={press(control.key)}
            onPointerUp={release(control.key)}
            onPointerCancel={release(control.key)}
            onLostPointerCapture={release(control.key)}
          >
            {control.symbol}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Jump"
        className="touch-jump mt-2 w-full"
        onPointerDown={press('Space')}
        onPointerUp={release('Space')}
        onPointerCancel={release('Space')}
        onLostPointerCapture={release('Space')}
      >
        Jump
      </button>
    </div>
  )
}

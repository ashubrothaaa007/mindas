import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Home, Play, RotateCcw, Settings as SettingsIcon, Cloud, CloudOff } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Minu } from '../mascot/Minu'
import { Segmented, Slider } from '../ui/Modal'
import { useGame, type Graphics, type TimeMode } from '@/store/game'
import { useT } from '@/hooks/useT'
import { LANGUAGES, NATIVE_OPTIONS, PLAYABLE_TARGETS, TARGET_OPTIONS, type ConversationMode, type LangCode } from '@/data/languages'
import { UI_TRANSLATED } from '@/data/i18n'
import { missionById } from '@/data/missions'
import { travelToNpc } from '@/systems/travel'
import { backendMode } from '@/services/config'
import { setAmbienceVolume } from '@/services/audio/ambience'

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/5 py-3.5">
      <div>
        <div className="font-display text-[15px] font-medium text-cream">{label}</div>
        {hint && <div className="text-[12px] text-sage">{hint}</div>}
      </div>
      {children}
    </div>
  )
}

export function SettingsPanel() {
  const t = useT()
  const settings = useGame((s) => s.settings)
  const profile = useGame((s) => s.profile)
  const setSettings = useGame((s) => s.setSettings)
  const setProfile = useGame((s) => s.setProfile)
  const select = 'h-10 rounded-xl bg-white/5 px-3 font-display text-[14px] text-cream ring-1 ring-white/10 outline-none focus:ring-lime'
  return (
    <div>
      <Row label={t('sound')} hint="Ambience, effects and voices">
        <Slider
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => {
            setSettings({ volume: v })
            setAmbienceVolume(v)
          }}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Row>
      <Row label={t('voiceSpeed')} hint="How fast characters speak">
        <Slider value={settings.voiceRate} min={0.5} max={1.3} step={0.05} onChange={(v) => setSettings({ voiceRate: v })} format={(v) => `${v.toFixed(2)}×`} />
      </Row>
      <Row label={t('interfaceLanguage')} hint="All menus and instructions">
        <select className={select} value={profile.nativeLang} onChange={(e) => setProfile({ nativeLang: e.target.value as LangCode })}>
          {NATIVE_OPTIONS.map((c) => (
            <option key={c} value={c} className="bg-forest">
              {LANGUAGES[c].name} · {LANGUAGES[c].native}
              {UI_TRANSLATED.includes(c) ? '' : ' (partial)'}
            </option>
          ))}
        </select>
      </Row>
      <Row label={t('targetLanguage')} hint="Characters speak this language">
        <select className={select} value={profile.targetLang} onChange={(e) => setProfile({ targetLang: e.target.value as LangCode })}>
          {TARGET_OPTIONS.map((c) => (
            <option key={c} value={c} disabled={!PLAYABLE_TARGETS.includes(c)} className="bg-forest">
              {LANGUAGES[c].name}
              {PLAYABLE_TARGETS.includes(c) ? '' : ' (coming soon)'}
            </option>
          ))}
        </select>
      </Row>
      <Row label="Conversation mode">
        <Segmented<ConversationMode>
          value={settings.mode}
          onChange={(v) => setSettings({ mode: v })}
          options={[
            { id: 'beginner', label: 'Beginner' },
            { id: 'guided', label: 'Guided' },
            { id: 'immersive', label: 'Immersive' },
          ]}
        />
      </Row>
      <Row label={t('mouseSensitivity')}>
        <Slider value={settings.mouseSensitivity} min={0.3} max={2.5} step={0.1} onChange={(v) => setSettings({ mouseSensitivity: v })} format={(v) => `${v.toFixed(1)}×`} />
      </Row>
      <Row label={t('graphics')} hint="Lower settings run faster on laptops">
        <Segmented<Graphics>
          value={settings.graphics}
          onChange={(v) => setSettings({ graphics: v })}
          options={[
            { id: 'low', label: 'Low' },
            { id: 'medium', label: 'Medium' },
            { id: 'high', label: 'High' },
          ]}
        />
      </Row>
      <Row label={t('timeOfDay')}>
        <Segmented<TimeMode>
          value={settings.timeMode}
          onChange={(v) => setSettings({ timeMode: v })}
          options={[
            { id: 'auto', label: 'Cycle' },
            { id: 'day', label: 'Day' },
            { id: 'dusk', label: 'Dusk' },
            { id: 'night', label: 'Night' },
          ]}
        />
      </Row>
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        {backendMode() === 'demo' ? <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-sage" /> : <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-lime" />}
        <div className="text-[13px] text-sage">
          <div className="font-display text-[15px] font-medium text-cream">Voice engine: {backendMode() === 'demo' ? 'Demo mode' : 'MINDA cloud'}</div>
          {backendMode() === 'demo'
            ? 'Speech recognition and voices come from your browser. Answers are checked on your device. Progress is saved in this browser. Connect the backend for Sarvam speech, Gemini feedback and cloud saves.'
            : 'Speech by Sarvam Saaras and Bulbul, feedback by Gemini.'}
        </div>
      </div>
    </div>
  )
}

export function PauseMenu() {
  const t = useT()
  const overlay = useGame((s) => s.overlay)
  const setOverlay = useGame((s) => s.setOverlay)
  const setScreen = useGame((s) => s.setScreen)
  const tracked = useGame((s) => s.progress.trackedMissionId)
  const conversation = useGame((s) => s.conversationMissionId)
  const openConversation = useGame((s) => s.openConversation)
  const restartConversation = useGame((s) => s.restartConversation)
  const closeConversation = useGame((s) => s.closeConversation)
  const [tab, setTab] = useState<'menu' | 'settings'>('menu')
  const missionToRestart = conversation ?? tracked
  const open = overlay === 'pause'

  const restart = () => {
    if (conversation) return restartConversation()
    const m = missionToRestart ? missionById(missionToRestart) : null
    if (!m) return
    travelToNpc(m.npcId)
    openConversation(m.id)
  }

  const items = [
    { label: t('resume'), icon: Play, run: () => setOverlay(null), primary: true },
    { label: t('restartMission'), icon: RotateCcw, run: restart, disabled: !missionToRestart },
    { label: t('settings'), icon: SettingsIcon, run: () => setTab('settings') },
    {
      label: t('exitMenu'),
      icon: Home,
      run: () => {
        closeConversation()
        setScreen('welcome')
      },
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[65] flex bg-ink/60 backdrop-blur-md" onAnimationComplete={() => !open && setTab('menu')}>
          <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex w-[420px] flex-col justify-between border-r border-white/10 bg-gradient-to-b from-forest/95 to-ink/95 p-10">
            <div>
              <Logo sub="Paused" />
              <h2 className="mt-12 font-display text-[44px] font-semibold leading-none text-cream">{t('paused')}</h2>
              <div className="mt-8 flex flex-col gap-2.5">
                {items.map((it) => (
                  <button
                    key={it.label}
                    disabled={it.disabled}
                    onClick={it.run}
                    className={`flex h-14 items-center gap-3 px-5 text-left text-[17px] ${it.primary ? 'btn-primary' : 'btn-ghost'} ${tab === 'settings' && it.icon === SettingsIcon ? '!border-lime' : ''} disabled:opacity-40`}
                  >
                    <it.icon className="h-5 w-5" /> {it.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-3">
              <Minu mood="idle" size={80} shadow={false} />
              <p className="pb-3 text-[13px] text-sage">
                Press <span className="kbd">Esc</span> to resume.
              </p>
            </div>
          </motion.div>
          <div className="flex flex-1 items-center justify-center p-12" onMouseDown={(e) => e.target === e.currentTarget && setOverlay(null)}>
            {tab === 'settings' ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass scroll-thin max-h-[82vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] px-8 py-6">
                <h3 className="mb-2 font-display text-[26px] font-semibold text-cream">{t('settings')}</h3>
                <SettingsPanel />
              </motion.div>
            ) : (
              <div className="text-center text-sage">
                <div className="font-display text-[22px] text-cream/90">MINDA: Don’t just learn. Speak.</div>
                <p className="mt-2 text-[14px]">Your world. Your conversations. Your language adventure.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

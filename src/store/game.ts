import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConversationMode, Difficulty, LangCode } from '@/data/languages'
import { DIFFICULTIES } from '@/data/languages'
import { missionById, STORY_MISSIONS } from '@/data/missions'
import { LOCATIONS } from '@/data/world'
import { ACTIVITY_REWARDS, SHOP, UNITS, type ActivityType, type Word } from '@/data/learning'
import { ACHIEVEMENTS } from '@/data/achievements'

export type Screen = 'welcome' | 'onboarding' | 'world' | 'path' | 'profile'
export type Overlay = null | 'map' | 'missions' | 'inventory' | 'pause' | 'companion'
export type Graphics = 'low' | 'medium' | 'high'
export type TimeMode = 'auto' | 'day' | 'dusk' | 'night'

export interface Profile {
  name: string
  nativeLang: LangCode
  targetLang: LangCode
  difficulty: Difficulty
  regionId: string
  onboarded: boolean
}

export interface Settings {
  volume: number
  voiceRate: number
  mouseSensitivity: number
  graphics: Graphics
  timeMode: TimeMode
  mode: ConversationMode
  showTranslation: boolean
  showRomanization: boolean
}

export interface ConversationRecord {
  id: string
  missionId: string
  date: string
  npcLine: string
  said: string
  score: number
}

export interface VocabularyEntry extends Word {
  status: 'new' | 'review' | 'mastered'
  attempts: number
  lastPracticeDate: string
}

export interface RewardSummary {
  title: string
  subtitle: string
  xp: number
  coins: number
  score?: number
  vocab: { text: string; roman: string; meaning: string }[]
  badge?: string
  unlocked: string[]
  achievements: string[]
  leveledUp?: number
}

export interface Toast {
  id: number
  title: string
  body?: string
  kind: 'achievement' | 'discovery' | 'info'
}

export interface Progress {
  xp: number
  coins: number
  streak: number
  bestStreak: number
  lastActiveDate: string | null
  completedMissions: string[]
  unitProgress: Record<string, Partial<Record<ActivityType, number>>>
  achievements: string[]
  visited: string[]
  learnedWords: string[]
  vocabulary: Record<string, VocabularyEntry>
  history: ConversationRecord[]
  scores: { date: string; score: number }[]
  dailyLog: Record<string, number>
  conversationPathDay: number
  conversationPathDate: string
  conversationPathCount: number
  conversationPathLastCompletedDate: string | null
  completedConversationDays: number[]
  hintTokens: number
  owned: string[]
  outfit: string | null
  minuScarf: string | null
  trackedMissionId: string | null
  daily: { date: string; done: ActivityType[] }
}

/** Calendar key in the player's local timezone (daily challenges are local-day based). */
export const localDateKey = (d: Date) => {
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const today = () => localDateKey(new Date())
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

export const XP_PER_LEVEL = 250
export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1

export const isMissionUnlocked = (id: string, completed: string[]) => {
  const m = missionById(id)
  if (!m) return false
  return !m.unlockAfter || completed.includes(m.unlockAfter)
}

export const isUnitUnlocked = (unitIndex: number, completed: string[]) =>
  unitIndex === 0 || completed.includes(UNITS[unitIndex - 1].missionId)

const defaultProgress = (): Progress => ({
  xp: 0,
  coins: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  completedMissions: [],
  unitProgress: {},
  achievements: [],
  visited: [],
  learnedWords: [],
  vocabulary: {},
  history: [],
  scores: [],
  dailyLog: {},
  conversationPathDay: 1,
  conversationPathDate: today(),
  conversationPathCount: 0,
  conversationPathLastCompletedDate: null,
  completedConversationDays: [],
  hintTokens: 1,
  owned: [],
  outfit: null,
  minuScarf: null,
  trackedMissionId: 'auto',
  daily: { date: today(), done: [] },
})

interface GameState {
  screen: Screen
  profile: Profile
  settings: Settings
  progress: Progress
  // transient
  overlay: Overlay
  conversationMissionId: string | null
  conversationNonce: number
  reward: RewardSummary | null
  activity: { unitId: string; type: ActivityType } | null
  nearbyNpcId: string | null
  toasts: Toast[]
  worldReady: boolean

  setScreen: (s: Screen) => void
  setProfile: (p: Partial<Profile>) => void
  setSettings: (s: Partial<Settings>) => void
  setOverlay: (o: Overlay) => void
  toggleOverlay: (o: Exclude<Overlay, null>) => void
  setNearbyNpc: (id: string | null) => void
  setWorldReady: (r: boolean) => void
  openConversation: (missionId: string) => void
  closeConversation: () => void
  restartConversation: () => void
  recordTurn: (rec: Omit<ConversationRecord, 'id' | 'date'>) => void
  learnWord: (word: Word) => void
  practiceWord: (word: Word, correct: boolean) => void
  completeMission: (missionId: string, avgScore: number) => RewardSummary
  completeActivity: (unitId: string, type: ActivityType, score: number) => RewardSummary
  visitLocation: (id: string) => void
  trackMission: (id: string | null) => void
  buy: (itemId: string) => boolean
  equip: (itemId: string | null, kind: 'outfit' | 'minu') => void
  useHint: () => boolean
  dismissReward: () => void
  openActivity: (unitId: string, type: ActivityType) => void
  closeActivity: () => void
  pushToast: (t: Omit<Toast, 'id'>) => void
  dropToast: (id: number) => void
  resetAll: () => void
}

let toastId = 1

/** Records which of today's four daily activities are done. */
function markDaily(p: Progress, type: ActivityType): Progress {
  const t = today()
  const done = p.daily?.date === t ? p.daily.done : []
  return { ...p, daily: { date: t, done: done.includes(type) ? done : [...done, type] } }
}

/** Applies streak + daily log updates for a learning action. */
function touchStreak(p: Progress): Progress {
  const t = today()
  let streak = p.streak
  if (p.lastActiveDate !== t) {
    streak = p.lastActiveDate && dayDiff(p.lastActiveDate, t) === 1 ? p.streak + 1 : 1
  }
  return {
    ...p,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastActiveDate: t,
    dailyLog: { ...p.dailyLog, [t]: (p.dailyLog[t] ?? 0) + 1 },
  }
}

function evaluateAchievements(p: Progress): string[] {
  const earned: string[] = []
  const has = (id: string) => p.achievements.includes(id)
  const check = (id: string, cond: boolean) => cond && !has(id) && earned.push(id)
  check('first-conversation', p.history.length > 0)
  check('first-mission', STORY_MISSIONS.some((m) => p.completedMissions.includes(m.id)))
  check('streak-7', p.streak >= 7)
  check('confident-speaker', p.scores.filter((s) => s.score >= 90).length >= 5)
  check('city-explorer', LOCATIONS.every((l) => p.visited.includes(l.id)))
  check('local-legend', STORY_MISSIONS.every((m) => p.completedMissions.includes(m.id)))
  return earned
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const grantAchievements = (p: Progress) => {
        const earned = evaluateAchievements(p)
        if (earned.length) {
          p = { ...p, achievements: [...p.achievements, ...earned], coins: p.coins + earned.length * 25 }
          earned.forEach((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id)
            if (a) get().pushToast({ kind: 'achievement', title: `Achievement: ${a.title}`, body: `${a.desc} +25 coins` })
          })
        }
        return { p, earned }
      }

      return {
        screen: 'welcome',
        profile: { name: 'Explorer', nativeLang: 'en', targetLang: 'ml', difficulty: 'beginner', regionId: 'kerala', onboarded: false },
        settings: {
          volume: 0.7,
          voiceRate: 0.9,
          mouseSensitivity: 1,
          graphics: 'medium',
          timeMode: 'auto',
          mode: 'beginner',
          showTranslation: true,
          showRomanization: true,
        },
        progress: defaultProgress(),
        overlay: null,
        conversationMissionId: null,
        conversationNonce: 0,
        reward: null,
        activity: null,
        nearbyNpcId: null,
        toasts: [],
        worldReady: false,

        setScreen: (screen) => set({ screen, overlay: null }),
        setProfile: (p) =>
          set((s) => {
            const profile = { ...s.profile, ...p }
            const settings = p.difficulty ? { ...s.settings, mode: DIFFICULTIES.find((d) => d.id === p.difficulty)!.mode } : s.settings
            return { profile, settings }
          }),
        setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
        setOverlay: (overlay) => set({ overlay }),
        toggleOverlay: (o) => set((s) => ({ overlay: s.overlay === o ? null : o })),
        setNearbyNpc: (nearbyNpcId) => set({ nearbyNpcId }),
        setWorldReady: (worldReady) => set({ worldReady }),
        openConversation: (missionId) =>
          set((s) => ({
            conversationMissionId: missionId,
            conversationNonce: s.conversationNonce + 1,
            overlay: null,
            progress: missionById(missionId)?.kind === 'story' ? { ...s.progress, trackedMissionId: missionId } : s.progress,
          })),
        closeConversation: () => set({ conversationMissionId: null }),
        restartConversation: () => set((s) => ({ conversationNonce: s.conversationNonce + 1, overlay: null })),
        recordTurn: (rec) =>
          set((s) => {
            let p: Progress = {
              ...s.progress,
              history: [{ ...rec, id: crypto.randomUUID(), date: new Date().toISOString() }, ...s.progress.history].slice(0, 60),
              scores: [...s.progress.scores, { date: new Date().toISOString(), score: rec.score }].slice(-200),
            }
            p = grantAchievements(p).p
            return { progress: p }
          }),
        learnWord: (word) =>
          set((s) => {
            if (s.progress.vocabulary[word.text]) return {}
            return {
              progress: {
                ...s.progress,
                vocabulary: {
                  ...s.progress.vocabulary,
                  [word.text]: { ...word, status: 'new', attempts: 0, lastPracticeDate: today() },
                },
              },
            }
          }),
        practiceWord: (word, correct) =>
          set((s) => ({
            progress: {
              ...s.progress,
              learnedWords: correct
                ? Array.from(new Set([...s.progress.learnedWords, word.text]))
                : s.progress.learnedWords.filter((text) => text !== word.text),
              vocabulary: {
                ...s.progress.vocabulary,
                [word.text]: {
                  ...word,
                  status: correct ? 'mastered' : 'review',
                  attempts: (s.progress.vocabulary[word.text]?.attempts ?? 0) + 1,
                  lastPracticeDate: today(),
                },
              },
            },
          })),
        completeMission: (missionId, avgScore) => {
          const m = missionById(missionId)!
          const s = get()
          const first = !s.progress.completedMissions.includes(missionId)
          const before = levelFromXp(s.progress.xp)
          const bonusXp = Math.round(avgScore / 5)
          // Mission rewards are one-time. Replay conversations can still count toward the
          // daily conversation path, which has its own explicitly repeatable daily rewards.
          const xp = first ? m.rewards.xp + bonusXp : 0
          const coins = first ? m.rewards.coins : 0
          const pathDate = today()
          const pathDay = s.progress.conversationPathDay ?? 1
          const pathAlreadyCompleteToday = s.progress.conversationPathLastCompletedDate === pathDate
          const pathCount = s.progress.conversationPathDate === pathDate ? s.progress.conversationPathCount : 0
          const countsTowardPath = !pathAlreadyCompleteToday && pathCount < pathDay
          const nextPathCount = pathCount + (countsTowardPath ? 1 : 0)
          const pathDayComplete = countsTowardPath && nextPathCount >= pathDay
          const pathXp = countsTowardPath ? 35 + (pathDayComplete ? 75 : 0) : 0
          const pathCoins = countsTowardPath ? 20 + (pathDayComplete ? 50 : 0) : 0
          let p = touchStreak({
            ...s.progress,
            xp: s.progress.xp + xp + pathXp,
            coins: s.progress.coins + coins + pathCoins,
            completedMissions: first ? [...s.progress.completedMissions, missionId] : s.progress.completedMissions,
            conversationPathDate: pathDate,
            conversationPathCount: nextPathCount,
            conversationPathDay: pathDayComplete ? pathDay + 1 : pathDay,
            conversationPathLastCompletedDate: pathDayComplete ? pathDate : s.progress.conversationPathLastCompletedDate ?? null,
            completedConversationDays: pathDayComplete ? [...new Set([...(s.progress.completedConversationDays ?? []), pathDay])] : s.progress.completedConversationDays ?? [],
          })
          if (m.kind === 'story') p = markDaily(p, 'conversation')
          const unlocked: string[] = []
          if (first && m.kind === 'story') {
            const next = STORY_MISSIONS.find((x) => x.unlockAfter === missionId)
            if (next) {
              unlocked.push(`New mission: ${next.title}`)
              p.trackedMissionId = next.id
            } else p.trackedMissionId = null
            const unitIdx = UNITS.findIndex((u) => u.missionId === missionId)
            if (unitIdx >= 0) {
              unlocked.push(`Daily challenge: ${UNITS[unitIdx].title}`)
              if (UNITS[unitIdx + 1]) unlocked.push(`Learning unit: ${UNITS[unitIdx + 1].title}`)
            }
          }
          if (countsTowardPath) unlocked.push(pathDayComplete ? `Day ${pathDay} complete · Day ${pathDay + 1} unlocked` : `Conversation ${nextPathCount}/${pathDay} for Day ${pathDay}`)
          const res = grantAchievements(p)
          p = res.p
          const after = levelFromXp(p.xp)
          const reward: RewardSummary = {
            title: m.title,
            subtitle: pathDayComplete ? `Day ${pathDay} complete · daily path reward` : countsTowardPath ? `Day ${pathDay} · conversation ${nextPathCount}/${pathDay}` : first ? 'Mission complete' : 'Mission already rewarded',
            xp: xp + pathXp,
            coins: coins + pathCoins,
            score: Math.round(avgScore),
            vocab: m.vocab,
            badge: first ? m.badge : undefined,
            unlocked,
            achievements: res.earned,
            leveledUp: after > before ? after : undefined,
          }
          set({ progress: p, reward, conversationMissionId: null })
          return reward
        },
        completeActivity: (unitId, type, score) => {
          const s = get()
          const unit = UNITS.find((u) => u.id === unitId)!
          const prevBest = s.progress.unitProgress[unitId]?.[type]
          const first = prevBest === undefined
          const base = ACTIVITY_REWARDS[type]
          const xp = first ? base.xp : Math.round(base.xp / 3)
          const coins = first ? base.coins : Math.round(base.coins / 5)
          const before = levelFromXp(s.progress.xp)
          let p = touchStreak({
            ...s.progress,
            xp: s.progress.xp + xp,
            coins: s.progress.coins + coins,
            unitProgress: { ...s.progress.unitProgress, [unitId]: { ...s.progress.unitProgress[unitId], [type]: Math.max(prevBest ?? 0, score) } },
          })
          p = markDaily(p, type)
          const res = grantAchievements(p)
          p = res.p
          const names: Record<ActivityType, string> = { words: 'Five new words', sentences: 'Five useful sentences', conversation: 'NPC conversation', challenge: 'Daily challenge' }
          const reward: RewardSummary = {
            title: names[type],
            subtitle: `${unit.title} · ${first ? 'Activity complete' : 'Practice round'}`,
            xp,
            coins,
            score: Math.round(score),
            vocab: type === 'words' ? unit.words : [],
            unlocked: type === 'sentences' && first ? [`Talk to the locals: ${missionById(unit.missionId)?.title}`] : [],
            achievements: res.earned,
            leveledUp: levelFromXp(p.xp) > before ? levelFromXp(p.xp) : undefined,
          }
          set({ progress: p, reward, activity: null })
          return reward
        },
        visitLocation: (id) => {
          const s = get()
          if (s.progress.visited.includes(id)) return
          const loc = LOCATIONS.find((l) => l.id === id)
          let p = { ...s.progress, visited: [...s.progress.visited, id], xp: s.progress.xp + 10 }
          get().pushToast({ kind: 'discovery', title: `Discovered: ${loc?.name}`, body: `${loc?.ml} · +10 XP` })
          p = grantAchievements(p).p
          set({ progress: p })
        },
        trackMission: (id) => set((s) => ({ progress: { ...s.progress, trackedMissionId: id } })),
        buy: (itemId) => {
          const item = SHOP.find((i) => i.id === itemId)
          const s = get()
          if (!item || s.progress.coins < item.price) return false
          if (item.kind !== 'hint' && s.progress.owned.includes(itemId)) return false
          set({
            progress: {
              ...s.progress,
              coins: s.progress.coins - item.price,
              hintTokens: item.kind === 'hint' ? s.progress.hintTokens + 3 : s.progress.hintTokens,
              owned: item.kind === 'hint' ? s.progress.owned : [...s.progress.owned, itemId],
              outfit: item.kind === 'outfit' ? itemId : s.progress.outfit,
              minuScarf: item.kind === 'minu' ? itemId : s.progress.minuScarf,
            },
          })
          return true
        },
        equip: (itemId, kind) =>
          set((s) => ({ progress: { ...s.progress, ...(kind === 'outfit' ? { outfit: itemId } : { minuScarf: itemId }) } })),
        useHint: () => {
          const s = get()
          if (s.progress.hintTokens <= 0) return false
          set({ progress: { ...s.progress, hintTokens: s.progress.hintTokens - 1 } })
          return true
        },
        dismissReward: () => set({ reward: null }),
        openActivity: (unitId, type) => set({ activity: { unitId, type } }),
        closeActivity: () => set({ activity: null }),
        pushToast: (t) => {
          const id = toastId++
          set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
          setTimeout(() => get().dropToast(id), 4200)
        },
        dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        resetAll: () => set({ progress: defaultProgress(), screen: 'welcome', profile: { ...get().profile, onboarded: false } }),
      }
    },
    {
      name: 'minda-save-v1',
      version: 3,
      partialize: (s) => ({ profile: s.profile, settings: s.settings, progress: s.progress }),
      migrate: (persistedState, version) => {
        const state = persistedState as GameState
        if (version < 3) {
          return {
            ...state,
            progress: { ...defaultProgress(), ...state.progress, vocabulary: state.progress?.vocabulary ?? {} },
          }
        }
        return state
      },
    },
  ),
)

export const scarfColor = (id: string | null) => SHOP.find((i) => i.id === id)?.color
export const outfitColor = (id: string | null) => SHOP.find((i) => i.id === id)?.color

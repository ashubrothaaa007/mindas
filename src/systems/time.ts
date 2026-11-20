import type { TimeMode } from '@/store/game'

/** World clock in hours (0–24). Driven by the DayNight component. */
export const timeState = { hours: 16.5 }

export const PRESET_HOURS: Record<Exclude<TimeMode, 'auto'>, number> = { day: 11.5, dusk: 18.1, night: 21.5 }

/** Real seconds per in-game day in auto mode */
export const DAY_LENGTH = 480

export const isNight = (h: number) => h < 6 || h > 19

export function formatClock(h: number) {
  const hh = Math.floor(h)
  const mm = Math.floor((h - hh) * 60)
  const suffix = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${mm.toString().padStart(2, '0')} ${suffix}`
}

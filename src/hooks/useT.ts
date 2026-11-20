import { useGame } from '@/store/game'
import { translate, type StringKey } from '@/data/i18n'

export function useT() {
  const lang = useGame((s) => s.profile.nativeLang)
  return (key: StringKey) => translate(lang, key)
}

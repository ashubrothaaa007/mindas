/** Keyboard state for movement. Ignores keys typed into form fields. */
export const keys = new Set<string>()

const isTyping = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

let attached = false
export function attachInput() {
  if (attached) return
  attached = true
  window.addEventListener('keydown', (e) => {
    if (isTyping(e)) return
    keys.add(e.code)
    if (e.code === 'Space' && !(e.target as HTMLElement)?.closest?.('button')) e.preventDefault()
  })
  window.addEventListener('keyup', (e) => keys.delete(e.code))
  window.addEventListener('blur', () => keys.clear())
}

export const isTypingEvent = isTyping

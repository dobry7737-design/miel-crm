/** Libellé raccourci ouverture palette (client uniquement). */
export function getPaletteOpenKbdLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+K'
  const p = navigator.platform ?? ''
  const ua = navigator.userAgent ?? ''
  const apple = /Mac|iPhone|iPad|iPod/i.test(p) || ua.includes('Mac OS')
  return apple ? '⌘K' : 'Ctrl+K'
}

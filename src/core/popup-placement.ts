import type { ObjectDirective } from 'vue'

export type PopupSide = 'top' | 'bottom' | 'left' | 'right'
export function choosePopupSide(preferred: PopupSide, anchor: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>, size: { width: number; height: number }, viewport: { width: number; height: number }, gap = 8): PopupSide {
  const spaces = { top: anchor.top - gap - 8, bottom: viewport.height - anchor.bottom - gap - 8, left: anchor.left - gap - 8, right: viewport.width - anchor.right - gap - 8 }
  const opposite: Record<PopupSide, PopupSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
  const other = opposite[preferred], required = preferred === 'top' || preferred === 'bottom' ? size.height : size.width
  return spaces[preferred] >= required || spaces[preferred] >= spaces[other] ? preferred : other
}

export function applyPopupSide(element: HTMLElement, side: PopupSide, gap = 8) {
  element.dataset.placement = side
  element.style.transformOrigin = ({ top: 'center bottom', bottom: 'center top', left: 'right center', right: 'left center' } as const)[side]
  element.style.setProperty('--apple-popup-x', `${side === 'left' ? gap : side === 'right' ? -gap : 0}px`)
  element.style.setProperty('--apple-popup-y', `${side === 'top' ? gap : side === 'bottom' ? -gap : 0}px`)
}

const states = new WeakMap<HTMLElement, { update(): void; destroy(): void }>()
/** Inline field popups stay attached to their anchor; placement is live through leave. */
export function updateFieldPopup(element: HTMLElement) { states.get(element)?.update() }
export function mountFieldPopup(element: HTMLElement) {
  if (states.has(element)) { updateFieldPopup(element); return }
  const anchor = element.parentElement
  const win = element.ownerDocument.defaultView
  if (!anchor || !win) return
  const update = () => {
    if (!element.isConnected || element.style.display === 'none') return
    const rect = anchor.getBoundingClientRect()
    // scrollHeight measures the contents even during the height reveal/close.
    const css = win.getComputedStyle(element)
    const border = (parseFloat(css.borderTopWidth) || 0) + (parseFloat(css.borderBottomWidth) || 0)
    const height = element.scrollHeight + border
    const side = choosePopupSide('bottom', rect, { height, width: element.offsetWidth }, { width: win.innerWidth, height: win.innerHeight })
    applyPopupSide(element, side)
    element.style.top = side === 'bottom' ? 'calc(100% + 8px)' : 'auto'
    element.style.bottom = side === 'top' ? 'calc(100% + 8px)' : 'auto'
  }
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
  observer?.observe(anchor)
  observer?.observe(element)
  element.ownerDocument.addEventListener('scroll', update, true)
  win.addEventListener('resize', update)
  states.set(element, { update, destroy() {
    observer?.disconnect()
    element.ownerDocument.removeEventListener('scroll', update, true)
    win.removeEventListener('resize', update)
  } })
  update()
}
export const FieldPopupPlacement: ObjectDirective<HTMLElement> = {
  mounted: mountFieldPopup,
  updated: updateFieldPopup,
  unmounted(element) { states.get(element)?.destroy(); states.delete(element) },
}

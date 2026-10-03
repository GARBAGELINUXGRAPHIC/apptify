import type { ObjectDirective } from 'vue'

export type PopupSide = 'top' | 'bottom' | 'left' | 'right'
export function choosePopupSide(preferred: PopupSide, anchor: Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>, size: { width: number; height: number }, viewport: { width: number; height: number }, gap = 8): PopupSide {
  const spaces = { top: anchor.top - gap - 8, bottom: viewport.height - anchor.bottom - gap - 8, left: anchor.left - gap - 8, right: viewport.width - anchor.right - gap - 8 }
  const opposite: Record<PopupSide, PopupSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
  const other = opposite[preferred], required = preferred === 'top' || preferred === 'bottom' ? size.height : size.width
  return spaces[preferred] >= required || spaces[preferred] >= spaces[other] ? preferred : other
}

export function applyPopupSide(element: HTMLElement, side: PopupSide, gap = 8) {
  const changed = element.dataset.placement !== side
  element.dataset.placement = side
  element.style.transformOrigin = ({ top: 'center bottom', bottom: 'center top', left: 'right center', right: 'left center' } as const)[side]
  element.style.setProperty('--apple-popup-x', `${side === 'left' ? gap : side === 'right' ? -gap : 0}px`)
  element.style.setProperty('--apple-popup-y', `${side === 'top' ? gap : side === 'bottom' ? -gap : 0}px`)
  if (changed) element.dispatchEvent(new Event('apple-popup-placement'))
}

export interface PopupPositioner { update(): void; destroy(): void }
interface PopupPositionOptions {
  anchor: HTMLElement
  placement?: () => PopupSide
  align?: () => 'start' | 'center' | 'end'
  fixed?: boolean
  gap?: number
}

/** A popup's usable area is the visual viewport intersected with anchor scrollports. */
function popupBounds(anchor: HTMLElement, panel: HTMLElement) {
  const win = anchor.ownerDocument.defaultView!, viewport = win.visualViewport
  const bounds = { left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, right: (viewport?.offsetLeft ?? 0) + (viewport?.width ?? win.innerWidth), bottom: (viewport?.offsetTop ?? 0) + (viewport?.height ?? win.innerHeight) }
  const ancestors: HTMLElement[] = []
  for (let parent = anchor.parentElement; parent && parent !== anchor.ownerDocument.body; parent = parent.parentElement) {
    // A teleported submenu can extend beyond its parent menu. A real scrollport
    // around that menu still constrains both popups.
    if (parent.dataset.placement && !parent.contains(panel)) continue
    const css = win.getComputedStyle(parent)
    const clipsX = /auto|scroll|hidden|clip/.test(css.overflowX), clipsY = /auto|scroll|hidden|clip/.test(css.overflowY)
    if (!clipsX && !clipsY) continue
    const rect = parent.getBoundingClientRect()
    if (clipsX) { bounds.left = Math.max(bounds.left, rect.left + parent.clientLeft); bounds.right = Math.min(bounds.right, rect.left + parent.clientLeft + parent.clientWidth) }
    if (clipsY) { bounds.top = Math.max(bounds.top, rect.top + parent.clientTop); bounds.bottom = Math.min(bounds.bottom, rect.top + parent.clientTop + parent.clientHeight) }
    ancestors.push(parent)
  }
  bounds.left += 8; bounds.top += 8; bounds.right -= 8; bounds.bottom -= 8
  return { bounds, ancestors }
}

/** Keep the DOM node, not a component ref: Vue clears refs before leave finishes. */
export function createPopupPositioner(panel: HTMLElement, options: PopupPositionOptions): PopupPositioner {
  const { anchor, fixed = false, gap = 8 } = options
  const doc = anchor.ownerDocument, win = doc.defaultView!
  const original = { maxHeight: panel.style.maxHeight, maxWidth: panel.style.maxWidth, overflowY: panel.style.overflowY, width: panel.style.width, left: panel.style.left, right: panel.style.insetInlineEnd }
  let destroyed = false, updating = false, tracking = 0, anchorGeometry = ''
  const track = () => {
    tracking = 0
    if (destroyed || !panel.isConnected || win.getComputedStyle(panel).display === 'none') return
    const rect = anchor.getBoundingClientRect(), geometry = `${rect.left},${rect.top},${rect.width},${rect.height}`
    if (geometry !== anchorGeometry) { anchorGeometry = geometry; update() }
    if (!tracking) tracking = win.requestAnimationFrame(track)
  }
  const update = () => {
    if (destroyed || updating || !panel.isConnected || win.getComputedStyle(panel).display === 'none') return
    updating = true
    const { bounds } = popupBounds(anchor, panel), rect = anchor.getBoundingClientRect()
    // Restore the full layout for measurement. Animation only clips/translates;
    // its intermediate visible size must never decide which side has space.
    panel.style.maxWidth = original.maxWidth
    panel.style.maxHeight = original.maxHeight
    if (!fixed) {
      panel.style.width = original.width
      panel.style.left = original.left
      panel.style.insetInlineEnd = original.right
    }
    const css = win.getComputedStyle(panel)
    const border = (parseFloat(css.borderTopWidth) || 0) + (parseFloat(css.borderBottomWidth) || 0)
    const naturalWidth = panel.offsetWidth
    if (!fixed) panel.style.width = `${naturalWidth}px`
    const width = Math.min(naturalWidth, Math.max(0, bounds.right - bounds.left))
    panel.style.maxWidth = `${width}px`
    // Measure after horizontal clamping because wrapping changes the space
    // needed vertically. Absolute child popups are not their parent's height.
    const height = fixed ? panel.offsetHeight : Math.max(panel.offsetHeight, panel.scrollHeight + border)
    const relative = { top: rect.top - bounds.top + 8, bottom: rect.bottom - bounds.top + 8, left: rect.left - bounds.left + 8, right: rect.right - bounds.left + 8 }
    const side = choosePopupSide(options.placement?.() ?? 'bottom', relative, { width, height }, { width: bounds.right - bounds.left + 16, height: bounds.bottom - bounds.top + 16 }, gap)
    const vertical = side === 'top' || side === 'bottom'
    const availableHeight = vertical ? (side === 'top' ? rect.top - gap - bounds.top : bounds.bottom - rect.bottom - gap) : bounds.bottom - bounds.top
    const availableWidth = vertical ? bounds.right - bounds.left : (side === 'left' ? rect.left - gap - bounds.left : bounds.right - rect.right - gap)
    panel.style.maxHeight = `${Math.max(0, availableHeight)}px`
    panel.style.maxWidth = `${Math.max(0, availableWidth)}px`
    panel.style.overflowY = height > availableHeight ? 'auto' : fixed ? 'visible' : original.overflowY
    const actualWidth = panel.offsetWidth, actualHeight = panel.offsetHeight
    const align = options.align?.() ?? 'start'
    let left = align === 'end' ? rect.right - actualWidth : align === 'center' ? rect.left + (rect.width - actualWidth) / 2 : rect.left
    let top = side === 'top' ? rect.top - actualHeight - gap : rect.bottom + gap
    if (!vertical) {
      left = side === 'left' ? rect.left - actualWidth - gap : rect.right + gap
      top = align === 'start' ? rect.top : align === 'end' ? rect.bottom - actualHeight : rect.top + (rect.height - actualHeight) / 2
    }
    left = Math.max(bounds.left, Math.min(left, bounds.right - actualWidth))
    top = Math.max(bounds.top, Math.min(top, bounds.bottom - actualHeight))
    if (fixed && !panel.offsetParent) {
      panel.style.left = `${left}px`; panel.style.top = `${top}px`
    } else {
      const parent = panel.offsetParent as HTMLElement | null
      const origin = parent?.getBoundingClientRect()
      panel.style.insetInlineEnd = 'auto'
      panel.style.left = `${left - (origin?.left ?? 0) + (parent?.scrollLeft ?? 0) - (parent?.clientLeft ?? 0)}px`
      panel.style.top = `${top - (origin?.top ?? 0) + (parent?.scrollTop ?? 0) - (parent?.clientTop ?? 0)}px`
      panel.style.bottom = 'auto'
    }
    applyPopupSide(panel, side, fixed ? 10 : gap)
    updating = false
    if (!tracking) tracking = win.requestAnimationFrame(track)
  }
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
  observer?.observe(anchor); observer?.observe(panel)
  popupBounds(anchor, panel).ancestors.forEach(parent => observer?.observe(parent))
  const content = new MutationObserver(() => {
    for (const child of Array.from(panel.children)) observer?.observe(child)
    update()
  })
  content.observe(panel, { subtree: true, childList: true, characterData: true })
  for (const child of Array.from(panel.children)) observer?.observe(child)
  doc.addEventListener('scroll', update, true)
  win.addEventListener('resize', update)
  win.visualViewport?.addEventListener('resize', update)
  win.visualViewport?.addEventListener('scroll', update)
  update()
  return { update, destroy() {
    destroyed = true; observer?.disconnect(); content.disconnect()
    win.cancelAnimationFrame(tracking)
    doc.removeEventListener('scroll', update, true); win.removeEventListener('resize', update)
    win.visualViewport?.removeEventListener('resize', update); win.visualViewport?.removeEventListener('scroll', update)
  } }
}

const states = new WeakMap<HTMLElement, PopupPositioner>()
/** Inline field popups stay attached to their anchor; placement is live through leave. */
export function updateFieldPopup(element: HTMLElement) { states.get(element)?.update() }
export function unmountFieldPopup(element: HTMLElement) { states.get(element)?.destroy(); states.delete(element) }
export function mountFieldPopup(element: HTMLElement, gap = 8) {
  if (states.has(element)) { updateFieldPopup(element); return }
  const anchor = element.parentElement
  if (anchor && element.ownerDocument.defaultView) states.set(element, createPopupPositioner(element, { anchor, gap }))
}
export const FieldPopupPlacement: ObjectDirective<HTMLElement, { gap?: number } | undefined> = {
  mounted: (element, binding) => mountFieldPopup(element, binding.value?.gap),
  updated: updateFieldPopup,
  // v-if unmount runs while Vue still retains the leaving DOM. Its transition
  // calls unmountFieldPopup after leave; a removed subtree can stop immediately.
  unmounted(element) { if (!element.isConnected) unmountFieldPopup(element) },
}

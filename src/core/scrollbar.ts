import { scrollBarZIndex } from './layers'

export type ScrollBarAxis = 'both' | 'horizontal' | 'vertical'
interface ScrollBarOptions {
  axis?: ScrollBarAxis
  label?: string
  controls?: string
  host?: HTMLElement
  interaction?: () => void
}
const native = 'data-apple-scrollbar-native'
const hitSize = 12
const bindings = new WeakMap<HTMLElement, { refresh(): void; dispose(): void }>()
let sequence = 0
const limit = (value: number, maximum: number) => Math.max(0, Math.min(value, maximum))
const scrollable = (overflow: string) => /^(auto|scroll|overlay)$/.test(overflow)

export function attachScrollBar(target: HTMLElement, options: ScrollBarOptions = {}) {
  const existing = bindings.get(target)
  existing?.dispose()
  const doc = target.ownerDocument, win = doc.defaultView!
  const root = target === doc.scrollingElement
  const themeHost = options.host ?? target
  const originalId = target.id, originalNative = target.getAttribute(native)
  const id = target.id || options.controls || `apple-scrollport-${++sequence}`
  if (!target.id) target.id = id
  target.setAttribute(native, '')
  let frame = 0, disposed = false
  let drag: { pointer: number; origin: number; value: number; snap: string; bar: HTMLElement } | undefined
  const bars = (['horizontal', 'vertical'] as const).filter(axis => !options.axis || options.axis === 'both' || options.axis === axis).map(axis => {
    const bar = doc.createElement('div'), slider = doc.createElement('div'), thumb = doc.createElement('span')
    bar.className = `apple-scroll-bar apple-scroll-bar--${axis}`
    slider.className = 'apple-scroll-bar__slider'
    thumb.className = 'apple-scroll-bar__thumb'
    thumb.style.margin = axis === 'horizontal' ? '1px 0' : '0 1px'
    bar.hidden = true
    bar.tabIndex = 0
    bar.setAttribute('role', 'scrollbar')
    bar.setAttribute('aria-label', options.label || (root ? '页面滚动条' : `${target.getAttribute('aria-label') || '内容'}滚动条`))
    bar.setAttribute('aria-controls', id)
    bar.setAttribute('aria-orientation', axis)
    bar.setAttribute('aria-valuemin', '0')
    slider.append(thumb)
    bar.append(slider)
    doc.body.append(bar)
    const horizontal = axis === 'horizontal'
    let length = 0, thumbSize = 0, maximum = 0, rtl = false
    const value = () => horizontal ? target.scrollLeft * (rtl ? -1 : 1) : target.scrollTop
    const scroll = (destination: number) => {
      const position = limit(destination, maximum)
      target.scrollTo({ [horizontal ? 'left' : 'top']: horizontal && rtl ? -position : position, behavior: 'instant' })
      refresh()
    }
    const end = (event?: PointerEvent) => {
      if (!drag || drag.bar !== bar || event && event.pointerId !== drag.pointer) return
      const previous = drag
      drag = undefined
      bar.classList.remove('is-dragging')
      target.style.scrollSnapType = previous.snap
      if (bar.hasPointerCapture?.(previous.pointer)) bar.releasePointerCapture(previous.pointer)
    }
    bar.addEventListener('pointerdown', event => {
      if (event.button !== 0 || maximum <= 1 || drag) return
      event.preventDefault(); event.stopPropagation()
      options.interaction?.()
      bar.focus({ preventScroll: true })
      const coordinate = horizontal ? event.clientX : event.clientY
      drag = { pointer: event.pointerId, origin: coordinate, value: value(), snap: target.style.scrollSnapType, bar }
      target.style.scrollSnapType = 'none'
      bar.classList.add('is-dragging')
      const thumbBounds = thumb.getBoundingClientRect()
      const thumbStart = horizontal ? thumbBounds.left : thumbBounds.top
      const thumbEnd = horizontal ? thumbBounds.right : thumbBounds.bottom
      if (coordinate < thumbStart || coordinate > thumbEnd) {
        const bounds = bar.getBoundingClientRect()
        const progress = (coordinate - (horizontal ? bounds.left : bounds.top) - thumbSize / 2) / Math.max(1, length - thumbSize)
        scroll((horizontal && rtl ? 1 - progress : progress) * maximum)
        drag.value = value()
      }
      try { bar.setPointerCapture(event.pointerId) } catch { /* Synthetic pointers may have no capture. */ }
    })
    bar.addEventListener('pointermove', event => {
      if (!drag || drag.bar !== bar || event.pointerId !== drag.pointer) return
      event.preventDefault()
      const delta = (horizontal ? event.clientX : event.clientY) - drag.origin
      scroll(drag.value + delta / Math.max(1, length - thumbSize) * maximum * (horizontal && rtl ? -1 : 1))
    })
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) bar.addEventListener(name, end)
    bar.addEventListener('keydown', event => {
      const page = horizontal ? target.clientWidth : target.clientHeight
      const destinations: Record<string, number> = { Home: 0, End: maximum, PageUp: value() - page, PageDown: value() + page,
        ...(horizontal ? { ArrowLeft: value() - (rtl ? -40 : 40), ArrowRight: value() + (rtl ? -40 : 40) } : { ArrowUp: value() - 40, ArrowDown: value() + 40 }) }
      if (!(event.key in destinations)) return
      event.preventDefault(); event.stopPropagation(); options.interaction?.()
      const snap = target.style.scrollSnapType
      target.style.scrollSnapType = 'none'
      scroll(destinations[event.key])
      target.style.scrollSnapType = snap
    })
    bar.addEventListener('wheel', event => {
      const delta = (horizontal ? event.deltaX || event.deltaY : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? length : 1)
      if (!delta || limit(value() + delta, maximum) === value()) return
      event.preventDefault(); options.interaction?.(); scroll(value() + delta)
    }, { passive: false })
    return {
      bar, end,
      update(bounds: { left: number; top: number; right: number; bottom: number }, style: CSSStyleDeclaration, visible: boolean, corner: boolean, host: HTMLElement, layer: number) {
        if (bar.parentElement !== host) host.append(bar)
        bar.style.zIndex = String(layer)
        const theme = win.getComputedStyle(themeHost)
        bar.style.setProperty('--apple-scrollbar-thumb-rgb', theme.colorScheme === 'dark' ? '255 255 255' : '0 0 0')
        bar.setAttribute('data-apple-motion', themeHost.closest('[data-apple-motion]')?.getAttribute('data-apple-motion') ?? 'full')
        rtl = style.direction === 'rtl'
        bar.dir = rtl ? 'rtl' : 'ltr'
        const viewport = horizontal ? target.clientWidth : target.clientHeight
        const total = horizontal ? target.scrollWidth : target.scrollHeight
        maximum = Math.max(0, total - viewport)
        length = Math.max(0, (horizontal ? bounds.right - bounds.left : bounds.bottom - bounds.top) - 4 - (corner ? hitSize : 0))
        const enabled = root ? !/hidden|clip/.test(horizontal ? style.overflowX : style.overflowY) && !/hidden|clip/.test(win.getComputedStyle(doc.body).overflow) : scrollable(horizontal ? style.overflowX : style.overflowY)
        const hidden = !visible || !enabled || maximum <= 1 || length <= 0
        if (hidden) { end(); bar.hidden = true; return }
        bar.hidden = false
        const x = horizontal ? bounds.left + 2 : rtl ? bounds.left : bounds.right - hitSize
        const y = horizontal ? bounds.bottom - hitSize : bounds.top + 2
        const width = horizontal ? length : hitSize, height = horizontal ? hitSize : length
        Object.assign(bar.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` })
        // A transformed or filtered popup can establish a local fixed containing block.
        const painted = bar.getBoundingClientRect()
        const scaleX = painted.width / width || 1, scaleY = painted.height / height || 1
        Object.assign(bar.style, { left: `${x + (x - painted.left) / scaleX}px`, top: `${y + (y - painted.top) / scaleY}px`, width: `${width / scaleX}px`, height: `${height / scaleY}px` })
        thumbSize = Math.min(length, Math.max(28, viewport / total * length))
        const progress = limit(value(), maximum) / maximum
        const offset = (horizontal && rtl ? 1 - progress : progress) * (length - thumbSize)
        Object.assign(slider.style, horizontal ? { width: `${thumbSize / scaleX}px`, transform: `translateX(${offset / scaleX}px)` } : { height: `${thumbSize / scaleY}px`, transform: `translateY(${offset / scaleY}px)` })
        bar.setAttribute('aria-valuemax', String(Math.round(maximum)))
        bar.setAttribute('aria-valuenow', String(Math.round(limit(value(), maximum))))
      },
    }
  })
  function refresh() {
    if (disposed) return
    const style = win.getComputedStyle(target)
    let inherited = 0
    for (let ancestor: HTMLElement | null = target; ancestor; ancestor = ancestor.parentElement) {
      const zIndex = Number.parseInt(win.getComputedStyle(ancestor).zIndex, 10)
      if (Number.isFinite(zIndex)) inherited = Math.max(inherited, zIndex)
    }
    const surface = target.closest<HTMLElement>(':popover-open, dialog:modal')
    const host = surface ? (surface === target ? target : target.parentElement ?? surface) : doc.body
    const rect = target.getBoundingClientRect()
    const scaleX = target.offsetWidth ? rect.width / target.offsetWidth : 1, scaleY = target.offsetHeight ? rect.height / target.offsetHeight : 1
    const bounds = root ? { left: 0, top: 0, right: doc.documentElement.clientWidth, bottom: win.innerHeight }
      : { left: rect.left + target.clientLeft * scaleX, top: rect.top + target.clientTop * scaleY,
        right: rect.left + (target.clientLeft + target.clientWidth) * scaleX, bottom: rect.top + (target.clientTop + target.clientHeight) * scaleY }
    if (!root && !target.matches(':popover-open')) {
      for (let parent = target.parentElement; parent && parent !== doc.body; parent = parent.parentElement) {
        const css = win.getComputedStyle(parent), clip = parent.getBoundingClientRect()
        if (/hidden|clip|auto|scroll/.test(css.overflowX)) { bounds.left = Math.max(bounds.left, clip.left + parent.clientLeft); bounds.right = Math.min(bounds.right, clip.left + parent.clientLeft + parent.clientWidth) }
        if (/hidden|clip|auto|scroll/.test(css.overflowY)) { bounds.top = Math.max(bounds.top, clip.top + parent.clientTop); bounds.bottom = Math.min(bounds.bottom, clip.top + parent.clientTop + parent.clientHeight) }
        if (parent.matches(':popover-open')) break
      }
    }
    bounds.left = Math.max(0, bounds.left); bounds.top = Math.max(0, bounds.top)
    bounds.right = Math.min(doc.documentElement.clientWidth, bounds.right); bounds.bottom = Math.min(win.innerHeight, bounds.bottom)
    const modals = [...doc.querySelectorAll<HTMLElement>('[aria-modal="true"]')].filter(element => element.getClientRects().length)
    const modal = modals.at(-1)
    const modalSurface = modal?.closest<HTMLElement>(':popover-open, dialog:modal')
    const aboveModal = Boolean(surface && modalSurface && Number.parseInt(win.getComputedStyle(surface).zIndex, 10) > Number.parseInt(win.getComputedStyle(modalSurface).zIndex, 10))
    const visible = target.isConnected && (root || target.getClientRects().length > 0) && style.visibility !== 'hidden' && !target.closest('[inert]') && (!modal || modal.contains(target) || aboveModal) && bounds.right > bounds.left && bounds.bottom > bounds.top
    const both = bars.length === 2 && target.scrollWidth > target.clientWidth + 1 && target.scrollHeight > target.clientHeight + 1
    bars.forEach(entry => entry.update(bounds, style, visible, both, host, scrollBarZIndex(inherited)))
  }
  function queue() { if (!frame && !disposed) frame = win.requestAnimationFrame(() => { frame = 0; refresh() }) }
  const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(queue) : undefined
  function observe() {
    resize?.disconnect(); resize?.observe(target)
    if (root) resize?.observe(doc.body)
    for (const child of target.children) if (!child.classList.contains('apple-scroll-bar')) resize?.observe(child)
    queue()
  }
  const mutations = new MutationObserver(records => {
    if (records.some(record => !isBarMutation(record))) observe()
  })
  mutations.observe(target, { childList: true, subtree: true, attributes: true, characterData: true })
  for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) mutations.observe(ancestor, { attributes: true })
  win.addEventListener('scroll', queue, { capture: true, passive: true })
  win.addEventListener('resize', queue, { passive: true })
  doc.addEventListener('load', queue, true)
  win.visualViewport?.addEventListener('resize', queue)
  win.visualViewport?.addEventListener('scroll', queue)
  observe(); refresh()
  const binding = {
    refresh,
    dispose() {
      if (disposed) return
      disposed = true; win.cancelAnimationFrame(frame)
      bars.forEach(entry => { entry.end(); entry.bar.remove() })
      resize?.disconnect(); mutations.disconnect()
      win.removeEventListener('scroll', queue, true); win.removeEventListener('resize', queue)
      doc.removeEventListener('load', queue, true)
      win.visualViewport?.removeEventListener('resize', queue); win.visualViewport?.removeEventListener('scroll', queue)
      if (originalNative === null) target.removeAttribute(native); else target.setAttribute(native, originalNative)
      if (!originalId && target.id === id) target.removeAttribute('id')
      bindings.delete(target)
    },
  }
  bindings.set(target, binding)
  return binding
}

function isBarMutation(record: MutationRecord) {
  if ((record.target as Element).closest?.('.apple-scroll-bar')) return true
  if (record.type === 'attributes' && (record.attributeName === native || record.attributeName === 'id')) return true
  return record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].every(node => node instanceof Element && node.classList.contains('apple-scroll-bar'))
}

const globals = new WeakMap<Document, { release(): void; retain(): void }>()
export function installScrollBars(host: HTMLElement) {
  const doc = host.ownerDocument, win = doc.defaultView!
  const current = globals.get(doc)
  if (current) { current.retain(); return current.release }
  const managed = new Map<HTMLElement, ReturnType<typeof attachScrollBar>>()
  let users = 1, frame = 0
  function scan() {
    frame = 0
    const candidates = new Set<HTMLElement>()
    if (doc.scrollingElement && !doc.scrollingElement.hasAttribute('data-apple-scrollbar-ignore')) candidates.add(doc.scrollingElement as HTMLElement)
    for (const element of doc.querySelectorAll<HTMLElement>('*')) {
      if (!(element instanceof win.HTMLElement) || element === doc.body || element.closest('.apple-scroll-bar') || element.hasAttribute('data-apple-scrollbar-ignore')) continue
      const style = win.getComputedStyle(element)
      if ((scrollable(style.overflowX) || scrollable(style.overflowY)) && (managed.has(element) || !element.hasAttribute(native) && style.scrollbarWidth !== 'none')) candidates.add(element)
    }
    for (const [element, binding] of managed) if (!candidates.has(element) || !element.isConnected || bindings.get(element) !== binding) { binding.dispose(); managed.delete(element) }
    for (const element of candidates) {
      if (!managed.has(element) && !bindings.has(element)) managed.set(element, attachScrollBar(element, { host: element === doc.scrollingElement ? host : undefined }))
      managed.get(element)?.refresh()
    }
  }
  const queue = () => { if (!frame) frame = win.requestAnimationFrame(scan) }
  const mutations = new MutationObserver(records => { if (records.some(record => !isBarMutation(record))) queue() })
  mutations.observe(doc.documentElement, { subtree: true, childList: true, attributes: true })
  win.addEventListener('resize', queue, { passive: true })
  doc.addEventListener('load', queue, true)
  scan()
  const shared = {
    retain() { users++ },
    release() {
      if (--users > 0) return
      mutations.disconnect(); win.cancelAnimationFrame(frame)
      win.removeEventListener('resize', queue); doc.removeEventListener('load', queue, true)
      managed.forEach(binding => binding.dispose()); managed.clear(); globals.delete(doc)
    },
  }
  globals.set(doc, shared)
  return shared.release
}

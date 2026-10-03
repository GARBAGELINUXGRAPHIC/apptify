import { getCurrentInstance, h, Transition, withDirectives, type VNode, type VNodeChild } from 'vue'
import { motionDuration } from './motion'
import { FieldPopupPlacement, mountFieldPopup, updateFieldPopup, unmountFieldPopup, type PopupSide } from './popup-placement'

interface PopupAnimation {
  animation?: Animation
  value: number
  from: number
  to: number
  reveal: boolean
  done: () => void
  dispose: () => void
}
const animations = new WeakMap<HTMLElement, PopupAnimation>()
const values = new WeakMap<HTMLElement, number>()
const transitions = new WeakMap<object, Map<string, { open: boolean; interrupted?: number }>>()
const cleanup = { unmounted: (element: HTMLElement) => { if (!element.isConnected) freezePopup(element) } }

function progress(state: PopupAnimation) {
  const timing = state.animation?.effect?.getComputedTiming()
  return typeof timing?.progress === 'number' ? state.from + (state.to - state.from) * timing.progress : state.value
}
function frame(element: HTMLElement, value: number, reveal: boolean) {
  const side = (element.dataset.placement ?? 'bottom') as PopupSide
  const hidden = (1 - value) * 100
  const reduced = motionDuration(element) <= 80
  const x = reduced ? 0 : (parseFloat(element.style.getPropertyValue('--apple-popup-x')) || 0) * (1 - value)
  const y = reduced ? 0 : (parseFloat(element.style.getPropertyValue('--apple-popup-y')) || 0) * (1 - value)
  const clip = side === 'top' ? `${hidden}% 0 0 0` : side === 'left' ? `0 0 0 ${hidden}%` : side === 'right' ? `0 ${hidden}% 0 0` : `0 0 ${hidden}% 0`
  return { transform: `translate(${x}px, ${y}px)`, ...(reveal ? { clipPath: `inset(${clip})` } : { opacity: String(value) }) }
}

export function freezePopup(element: Element) {
  const el = element as HTMLElement, state = animations.get(el)
  if (!state) return values.get(el)
  const value = progress(state)
  Object.assign(el.style, frame(el, value, state.reveal))
  values.set(el, value)
  state.animation?.cancel(); state.dispose(); animations.delete(el)
  return value
}
export function finishPopup(element: HTMLElement) {
  const state = animations.get(element)
  if (!state) return
  Object.assign(element.style, frame(element, state.to, state.reveal))
  values.set(element, state.to)
  state.animation?.cancel(); state.dispose(); animations.delete(element)
  state.done()
}
export function resetPopup(element: Element) {
  const el = element as HTMLElement
  el.style.transform = ''; el.style.clipPath = ''; el.style.opacity = ''; el.style.willChange = ''
}
export function preparePopup(element: Element, reveal: boolean, interrupted?: number) {
  const el = element as HTMLElement
  freezePopup(el)
  if (interrupted !== undefined) values.set(el, interrupted)
  else if (!values.has(el)) values.set(el, 0)
  Object.assign(el.style, frame(el, values.get(el)!, reveal))
}

/** One scalar controls visibility. Reproject it when placement changes so an
 * in-flight reveal/reversal never keeps the opening side's clip or translation. */
export function animatePopup(element: Element, opened: boolean, done: () => void, reveal = true) {
  const el = element as HTMLElement
  freezePopup(el)
  const from = values.get(el) ?? (opened ? 0 : 1), to = opened ? 1 : 0
  const state: PopupAnimation = { value: from, from, to, reveal, done, dispose: () => {} }
  const run = () => {
    state.value = progress(state)
    state.animation?.cancel(); state.animation = undefined
    state.from = state.value
    const duration = motionDuration(el) * Math.abs(to - state.from)
    Object.assign(el.style, frame(el, state.from, reveal))
    if (!duration || !el.animate) { finishPopup(el); return }
    el.style.willChange = reveal ? 'clip-path, transform' : 'opacity, transform'
    state.animation = el.animate([frame(el, state.from, reveal), frame(el, to, reveal)], { duration, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both' })
    state.animation.onfinish = () => finishPopup(el)
  }
  const policy = () => { if (motionDuration(el) <= 80) finishPopup(el) }
  const observer = new MutationObserver(policy)
  observer.observe(el.ownerDocument.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-apple-motion', 'data-motion'] })
  const media = el.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')
  media?.addEventListener?.('change', policy)
  el.addEventListener('apple-popup-placement', run)
  state.dispose = () => { observer.disconnect(); media?.removeEventListener?.('change', policy); el.removeEventListener('apple-popup-placement', run); el.style.willChange = '' }
  animations.set(el, state)
  run()
}

/** Shared field transition keeps the full panel layout stable during clipping. */
export function popupTransition(content: VNodeChild, name = 'apple-field-menu', persisted = false, gap = 8) {
  const owner = getCurrentInstance()!
  if (!transitions.has(owner)) transitions.set(owner, new Map())
  const records = transitions.get(owner)!
  if (!records.has(name)) records.set(name, { open: false })
  const record = records.get(name)!
  record.open = !!content
  const clear = (element: Element) => {
    element.classList.remove(`${name}-enter-active`, `${name}-leave-active`)
    resetPopup(element)
  }
  return h(Transition, {
    name, css: false, persisted,
    onBeforeEnter: (el: Element) => { preparePopup(el, true, record.interrupted); record.interrupted = undefined },
    onEnter: (element: Element, done: () => void) => {
      const el = element as HTMLElement
      mountFieldPopup(el, gap)
      el.classList.add(`${name}-enter-active`)
      animatePopup(el, true, done)
    },
    onBeforeLeave: (el: Element) => updateFieldPopup(el as HTMLElement),
    onLeave: (element: Element, done: () => void) => {
      element.classList.add(`${name}-leave-active`)
      animatePopup(element, false, done)
    },
    onAfterEnter: clear,
    onAfterLeave: (el: Element) => {
      // v-if replaces a leaving DOM node when reopened. Vue finishes its old
      // leave callback first; transfer the visible fraction to the new node.
      const value = freezePopup(el)
      record.interrupted = record.open && !persisted ? value : undefined
      clear(el)
      if (!persisted) unmountFieldPopup(el as HTMLElement)
    },
    onEnterCancelled: (el: Element) => { freezePopup(el); clear(el) },
    onLeaveCancelled: (el: Element) => { (el as HTMLElement).style.display = ''; freezePopup(el); clear(el) },
  }, { default: () => content ? withDirectives(content as VNode, [[FieldPopupPlacement, { gap }], [cleanup]]) : content })
}

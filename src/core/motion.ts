import { withDirectives, type DirectiveBinding, type ObjectDirective, type VNode } from 'vue'
import { Ripple } from 'vuetify/directives/ripple'

export function motionDuration(element: HTMLElement, fallback = 300): number {
  if (element.closest('[data-apple-motion="none"], [data-motion="none"]')) return 0
  const mode = element.closest('[data-apple-motion]')?.getAttribute('data-apple-motion')
  if (mode === 'none') return 0
  if (mode === 'reduced' || element.closest('[data-motion="reduced"], [data-apple-motion="reduced"]') || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return 80
  const duration = getComputedStyle(element).getPropertyValue('--apple-duration').trim()
  return duration ? parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000) : fallback
}

const vuetifyRipple = Ripple as ObjectDirective<HTMLElement, boolean>
const rippleStates = new WeakMap<HTMLElement, { update: (binding: DirectiveBinding<boolean>) => void; destroy: () => void }>()
export const AppleRipple: ObjectDirective<HTMLElement, boolean> = {
  mounted(el, binding, vnode, previous) {
    let current = binding
    let enabled = binding.value !== false && motionDuration(el) > 80
    if (typeof vuetifyRipple.mounted === 'function') vuetifyRipple.mounted(el, { ...binding, value: enabled }, vnode, previous)
    const sync = () => {
      const next = current.value !== false && motionDuration(el) > 80 && !el.matches(':disabled, [aria-disabled="true"]')
      if (next === enabled) return
      if (typeof vuetifyRipple.updated === 'function') vuetifyRipple.updated(el, { ...current, value: next, oldValue: enabled }, vnode, previous ?? vnode)
      enabled = next
    }
    // Ancestor policy can change without this component rerendering.
    const events = ['mousedown', 'touchstart', 'keydown']
    events.forEach(event => el.addEventListener(event, sync, { capture: true, passive: true }))
    rippleStates.set(el, { update(next) { current = next; sync() }, destroy() { events.forEach(event => el.removeEventListener(event, sync, true)) } })
  },
  updated(el, binding) { rippleStates.get(el)?.update(binding) },
  unmounted(el, binding, vnode, previous) {
    rippleStates.get(el)?.destroy(); rippleStates.delete(el)
    if (typeof vuetifyRipple.unmounted === 'function') vuetifyRipple.unmounted(el, binding, vnode, previous)
  },
}

export function ripple(node: VNode, enabled = true): VNode {
  return withDirectives(node, [[AppleRipple, enabled]])
}

const entrances = new WeakMap<HTMLElement, Animation>()
function enter(element: HTMLElement) {
  entrances.get(element)?.cancel()
  const duration = motionDuration(element)
  if (duration <= 80 || !element.animate) return
  const animation = element.animate([{ transform: 'translateY(14px)' }, { transform: 'translateY(0)' }], { duration, easing: 'cubic-bezier(.2,.65,.3,1)' })
  entrances.set(element, animation)
  animation.onfinish = () => entrances.delete(element)
}

// Entrance only: never duplicates the page or delays replacement for a leave phase.
export const AppleEntrance: ObjectDirective<HTMLElement, unknown> = {
  mounted: enter,
  updated(element, binding) {
    if (motionDuration(element) <= 80) entrances.get(element)?.cancel()
    else if (!Object.is(binding.value, binding.oldValue)) enter(element)
  },
  unmounted(element) { entrances.get(element)?.cancel(); entrances.delete(element) },
}

type SelectionValue = unknown | { selector: string }
const selections = new WeakMap<HTMLElement, { update: (value?: SelectionValue) => void; destroy: () => void }>()

export const AppleSelection: ObjectDirective<HTMLElement, SelectionValue> = {
  mounted(element, binding) {
    const indicator = document.createElement('span')
    indicator.className = 'apple-selection-indicator'
    indicator.setAttribute('aria-hidden', 'true')
    element.classList.add('apple-selection')
    element.appendChild(indicator)
    let value = binding.value
    let initialized = false
    let frame = 0
    const measure = () => {
      const selector = value && typeof value === 'object' && 'selector' in value ? String(value.selector) : '[data-apple-selected="true"]'
      const target = element.querySelector<HTMLElement>(selector)
      indicator.hidden = !target
      if (!target) return
      const box = element.getBoundingClientRect()
      const rect = target.getBoundingClientRect()
      indicator.style.transitionDuration = initialized ? `${motionDuration(element)}ms` : '0ms'
      indicator.style.width = `${rect.width}px`
      indicator.style.height = `${rect.height}px`
      indicator.style.transform = `translate(${rect.left - box.left + element.scrollLeft - element.clientLeft}px, ${rect.top - box.top + element.scrollTop - element.clientTop}px)`
      initialized = true
    }
    const update = (next = value) => {
      value = next
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => update())
    resize?.observe(element)
    const mutation = new MutationObserver(() => update())
    mutation.observe(element, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-apple-selected', 'aria-selected', 'class'] })
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    selections.set(element, { update, destroy() { cancelAnimationFrame(frame); resize?.disconnect(); mutation.disconnect(); window.removeEventListener('resize', onResize); indicator.remove() } })
    update()
  },
  updated(element, binding) { selections.get(element)?.update(binding.value) },
  unmounted(element) { selections.get(element)?.destroy(); selections.delete(element) },
}

/*! Ripple animation adapted from Vuetify. Copyright (c) 2016-now Vuetify, LLC. MIT license; see THIRD_PARTY_LICENSES.txt. */
import type { DirectiveBinding } from 'vue'

export type RippleElement = HTMLElement & {
  _ripple?: { enabled: boolean; touched: boolean; showTimer?: number; showTimerCommit: (() => void) | null }
}
const handled = Symbol('apple-ripple-handled')
const disposers = new WeakMap<HTMLElement, () => void>()

export const Ripple = {
  mounted(el: RippleElement, binding: Pick<DirectiveBinding<{ keys: string[] }>, 'value' | 'modifiers'>) {
    const state: NonNullable<RippleElement['_ripple']> = { enabled: true, touched: false, showTimerCommit: null }
    el._ripple = state
    const timers = new Set<number>()
    const frames = new Set<number>()
    let keyboard = false
    let touch = false
    const later = (callback: () => void, delay = 0) => {
      const id = window.setTimeout(() => { timers.delete(id); callback() }, delay)
      timers.add(id)
      return id
    }
    const frame = (callback: () => void) => {
      const id = requestAnimationFrame(() => { frames.delete(id); callback() })
      frames.add(id)
    }
    const show = (event: Event) => {
      if (!state.enabled) return
      const centered = binding.modifiers.center || event.type === 'keydown'
      const rect = el.getBoundingClientRect()
      const point = 'touches' in event ? (event as TouchEvent).touches[(event as TouchEvent).touches.length - 1] : event as MouseEvent
      const zoom = (document.body as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom || 1
      const x = centered ? el.clientWidth / 2 : (point.clientX - rect.left) / zoom
      const y = centered ? el.clientHeight / 2 : (point.clientY - rect.top) / zoom
      const radius = binding.modifiers.circle
        ? el.clientWidth / 2 + (centered ? 0 : Math.hypot(x - el.clientWidth / 2, y - el.clientWidth / 2) / 4)
        : Math.hypot(el.clientWidth, el.clientHeight) / 2
      const container = document.createElement('span')
      const animation = document.createElement('span')
      container.className = 'v-ripple__container'
      animation.className = 'v-ripple__animation v-ripple__animation--enter'
      animation.style.width = animation.style.height = `${radius * 2}px`
      animation.style.transform = `translate(${x - radius}px, ${y - radius}px) scale(${binding.modifiers.circle ? .15 : .3})`
      animation.dataset.activated = String(performance.now())
      container.append(animation)
      el.append(container)
      frame(() => frame(() => {
        if (container.parentNode !== el) return
        animation.classList.replace('v-ripple__animation--enter', 'v-ripple__animation--in')
        animation.style.transform = `translate(${(el.clientWidth - radius * 2) / 2}px, ${(el.clientHeight - radius * 2) / 2}px) scale(1)`
      }))
    }
    const hide = () => {
      const waves = Array.from(el.children).filter(child => child.classList.contains('v-ripple__container'))
      const animation = waves.reverse().map(child => child.firstElementChild as HTMLElement | null).find(wave => wave && !wave.dataset.isHiding)
      if (!animation) return
      animation.dataset.isHiding = 'true'
      later(() => {
        if (animation.parentElement?.parentNode !== el) return
        animation.classList.remove('v-ripple__animation--enter', 'v-ripple__animation--in')
        animation.classList.add('v-ripple__animation--out')
        later(() => { if (animation.parentElement?.parentNode === el) animation.parentElement.remove() }, 300)
      }, Math.max(250 - (performance.now() - Number(animation.dataset.activated)), 0))
    }
    const start = (event: Event) => {
      const marked = event as Event & { [handled]?: boolean }
      if (state.touched || marked[handled]) return
      marked[handled] = true
      if (binding.modifiers.stop || !state.enabled) return
      if (event.type === 'touchstart') {
        state.touched = true
        touch = true
        state.showTimerCommit = () => show(event)
        state.showTimer = later(() => { state.showTimerCommit?.(); state.showTimerCommit = null }, 80)
      } else if (!touch) show(event)
    }
    const end = (event: Event) => {
      window.clearTimeout(state.showTimer)
      if (event.type === 'touchend' && state.showTimerCommit) {
        state.showTimerCommit()
        state.showTimerCommit = null
        later(hide)
      } else hide()
      later(() => { state.touched = false })
    }
    const cancel = () => { window.clearTimeout(state.showTimer); state.showTimerCommit = null }
    const keydown = (event: Event) => {
      if (!keyboard && state.enabled && binding.value.keys.includes((event as KeyboardEvent).key)) {
        keyboard = true
        start(event)
      }
    }
    const keyup = (event: Event) => { if (keyboard) { keyboard = false; end(event) } }
    const listeners: [string, EventListener][] = [
      ['mousedown', start], ['mouseup', end], ['mouseleave', end],
      ['touchstart', start], ['touchend', end], ['touchmove', cancel], ['touchcancel', cancel],
      ['keydown', keydown], ['keyup', keyup], ['blur', keyup], ['dragstart', end],
    ]
    listeners.forEach(([name, listener]) => el.addEventListener(name, listener, { passive: true }))
    disposers.set(el, () => {
      listeners.forEach(([name, listener]) => el.removeEventListener(name, listener))
      timers.forEach(id => window.clearTimeout(id))
      frames.forEach(id => cancelAnimationFrame(id))
      delete el._ripple
    })
  },
  unmounted(el: RippleElement) { disposers.get(el)?.(); disposers.delete(el) },
}

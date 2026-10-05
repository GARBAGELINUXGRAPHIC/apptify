import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, Teleport } from 'vue'
import { appleKey, createApple, type AppleContext } from '../src/core/context'
import { AppleProvider } from '../src/components/foundation'
import { ripple } from '../src/core/motion'

let wrapper: VueWrapper | undefined
afterEach(() => { wrapper?.unmount(); wrapper = undefined; document.body.innerHTML = ''; localStorage.clear(); vi.useRealTimers(); vi.unstubAllGlobals() })
const Probe = defineComponent({
  props: { disabled: Boolean, enabled: { type: Boolean, default: true } },
  render() { return ripple(h('button', { disabled: this.disabled }, 'Probe'), this.enabled) },
})
const mountProbe = (context?: AppleContext) => {
  const parent = document.createElement('div'); parent.dataset.appleMotion = 'full'; document.body.append(parent)
  wrapper = mount(Probe, { attachTo: parent, global: { provide: context ? { [appleKey as symbol]: context } : {} } })
  return { parent, button: wrapper }
}

describe('global ripple lifecycle', () => {
  it('applies the app switch without a provider and clears active waves immediately', async () => {
    const app = createApple({ ripple: false, motion: 'full' })
    const { button } = mountProbe(app)
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    app.ripple.value.set(true)
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__container')).toHaveLength(1)
    app.ripple.value.set(false)
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    await button.trigger('keydown', { key: 'Enter' })
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    await button.trigger('keyup', { key: 'Enter' })
    expect(createApple().ripple.value.enabled).toBe(true)
  })

  it('automatically disables reduced motion but allows manual enable except in none', async () => {
    const app = createApple({ motion: 'full' })
    const { button } = mountProbe(app)
    await button.trigger('mousedown')
    app.motion.value.set('reduced')
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    expect(app.ripple.value.enabled).toBe(false)
    app.ripple.value.set(true)
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__container')).toHaveLength(1)
    app.motion.value.set('none')
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    app.ripple.value.set(true)
    expect(app.ripple.value.enabled).toBe(false)
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    app.motion.value.set('full')
    app.ripple.value.set(true)
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__container')).toHaveLength(1)
  })

  it('shares the switch through nested providers and external teleports', async () => {
    const app = createApple({ motion: 'full' })
    const target = document.createElement('div'); document.body.append(target)
    wrapper = mount(AppleProvider, {
      attachTo: document.body,
      global: { provide: { [appleKey as symbol]: app } },
      slots: { default: () => h(AppleProvider, { theme: 'dark' }, () => h(Teleport, { to: target }, h(Probe))) },
    })
    const button = target.querySelector('button')!
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(button.querySelectorAll('.v-ripple__container')).toHaveLength(1)
    app.ripple.value.set(false)
    expect(button.querySelectorAll('.v-ripple__container')).toHaveLength(0)
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(button.querySelectorAll('.v-ripple__container')).toHaveLength(0)
  })

  it('restores and syncs the saved switch while accepting old or invalid preferences', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const first = createApple({ persist: true })
    first.ripple.value.set(false)
    const second = createApple({ persist: true })
    second.attach()
    expect(second.ripple.value.enabled).toBe(false)
    window.dispatchEvent(new StorageEvent('storage', { key: 'apptify:preferences', newValue: JSON.stringify({ ripple: true }) }))
    expect(second.ripple.value.enabled).toBe(true)
    expect(JSON.parse(localStorage.getItem('apptify:preferences')!).ripple).toBe(false)
    second.dispose()
    for (const ripple of [undefined, null, 'false', 0]) {
      localStorage.setItem('apptify:preferences', JSON.stringify({ motion: 'none', ripple }))
      const app = createApple({ persist: true })
      app.attach()
      expect(app.ripple.value.enabled).toBe(false)
      app.dispose()
    }
  })

  it('clears an active wave when the ancestor policy changes without another event', async () => {
    const { parent, button } = mountProbe()
    await button.trigger('mousedown'); expect(button.findAll('.v-ripple__container')).toHaveLength(1)
    parent.dataset.appleMotion = 'none'; await nextTick()
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    parent.dataset.appleMotion = 'full'; await nextTick()
    await button.trigger('mousedown'); expect(button.findAll('.v-ripple__container')).toHaveLength(1)
  })

  it('never duplicates keyboard listeners across disabled/binding/policy cycles', async () => {
    const { parent, button } = mountProbe()
    for (let cycle = 0; cycle < 4; cycle++) {
      await button.trigger('keydown', { key: ' ' })
      expect(button.findAll('.v-ripple__container')).toHaveLength(1)
      parent.dataset.appleMotion = 'reduced'; await nextTick()
      expect(button.findAll('.v-ripple__container')).toHaveLength(0)
      await button.trigger('keyup', { key: ' ' })
      await button.setProps({ disabled: true, enabled: false })
      await button.trigger('mousedown'); expect(button.findAll('.v-ripple__container')).toHaveLength(0)
      await button.setProps({ disabled: false, enabled: true })
      parent.dataset.appleMotion = 'full'; await nextTick()
    }
    await button.trigger('keydown', { key: 'Enter' }); expect(button.findAll('.v-ripple__container')).toHaveLength(1)
    await button.trigger('keyup', { key: 'Enter' })
  })

  it('cancels both visible waves and delayed touch work', async () => {
    vi.useFakeTimers()
    const { button } = mountProbe()
    await button.trigger('mousedown'); await button.trigger('pointercancel')
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    const touch = new TouchEvent('touchstart', { bubbles: true, touches: [{ clientX: 10, clientY: 10 } as Touch] })
    button.element.dispatchEvent(touch)
    button.element.dispatchEvent(new TouchEvent('touchcancel', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(100)
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
  })

  it('shows a short touch tap and removes its wave after release', async () => {
    vi.useFakeTimers()
    const { button } = mountProbe()
    button.element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [{ clientX: 10, clientY: 10 } as Touch] }))
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
    button.element.dispatchEvent(new TouchEvent('touchend', { bubbles: true }))
    expect(button.findAll('.v-ripple__container')).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(600)
    expect(button.findAll('.v-ripple__container')).toHaveLength(0)
  })

  it('keeps a nested control press from starting its parent ripple', async () => {
    const parent = document.createElement('div'); parent.dataset.appleMotion = 'full'; document.body.append(parent)
    wrapper = mount(defineComponent({ render() { return ripple(h('div', [h(Probe)])) } }), { attachTo: parent })
    await wrapper.get('button').trigger('mousedown')
    expect(wrapper.element.querySelectorAll(':scope > .v-ripple__container')).toHaveLength(0)
    expect(wrapper.get('button').findAll('.v-ripple__container')).toHaveLength(1)
  })

  it('owns only direct waves and releases its markers and timers on unmount', async () => {
    const { button } = mountProbe()
    const element = button.element as HTMLElement
    const nested = document.createElement('div'); nested.innerHTML = '<span class="v-ripple__container"></span>'; element.append(nested)
    await button.trigger('mousedown'); await button.trigger('pointercancel')
    expect(nested.children).toHaveLength(1)
    expect(element.style.position).toBe('')
    button.unmount(); wrapper = undefined
    expect(element.hasAttribute('data-apple-ripple')).toBe(false)
    expect(element.hasAttribute('data-apple-ripple-positioned')).toBe(false)
  })
})

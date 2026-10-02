import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { ripple } from '../src/core/motion'

let wrapper: VueWrapper | undefined
afterEach(() => { wrapper?.unmount(); wrapper = undefined; document.body.innerHTML = ''; vi.useRealTimers() })
const mountProbe = () => {
  const parent = document.createElement('div'); parent.dataset.appleMotion = 'full'; document.body.append(parent)
  wrapper = mount(defineComponent({
    props: { disabled: Boolean, enabled: { type: Boolean, default: true } },
    render() { return ripple(h('button', { disabled: this.disabled }, 'Probe'), this.enabled) },
  }), { attachTo: parent })
  return { parent, button: wrapper }
}

describe('global ripple lifecycle', () => {
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

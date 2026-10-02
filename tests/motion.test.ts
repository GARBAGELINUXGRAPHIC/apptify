import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, withDirectives } from 'vue'
import { AppleButton } from '../src/components/button'
import { AppleAutoSize } from '../src/components/motion'
import { appleKey, createApple } from '../src/core/context'
import { AppleRipple, AppleSelection, motionDuration } from '../src/core/motion'

afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('shared motion rules', () => {
  it('cancels a running size animation and releases clipping when motion is disabled', async () => {
    let resize = () => {}
    let height = 40
    const cancel = vi.fn()
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback } observe() {} disconnect() {} })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ x: 0, y: 0, left: 0, top: 0, width: 100, height, right: 100, bottom: height, toJSON() {} }))
    const previous = HTMLElement.prototype.animate
    HTMLElement.prototype.animate = vi.fn(() => ({ cancel, onfinish: null })) as unknown as typeof previous
    const context = createApple({ motion: 'full' })
    const wrapper = mount(AppleAutoSize, { attachTo: document.body, global: { provide: { [appleKey as symbol]: context } }, slots: { default: '<div>Content</div>' } })
    height = 100; resize()
    expect((wrapper.element as HTMLElement).style.overflow).toBe('clip')
    context.motion.value.set('none'); await nextTick()
    expect(cancel).toHaveBeenCalled()
    expect((wrapper.element as HTMLElement).style.overflow).toBe('')
    height = 160; resize()
    expect((wrapper.element as HTMLElement).style.overflow).toBe('')
    wrapper.unmount(); HTMLElement.prototype.animate = previous
  })
  it('caps local motion by ancestor settings and respects local none', () => {
    const parent = document.createElement('div'), child = document.createElement('button')
    parent.dataset.appleMotion = 'none'; child.dataset.appleMotion = 'full'; parent.append(child); document.body.append(parent)
    expect(motionDuration(child)).toBe(0)
    parent.dataset.appleMotion = 'full'; child.dataset.motion = 'none'
    expect(motionDuration(child)).toBe(0)
    child.dataset.motion = 'reduced'
    expect(motionDuration(child)).toBe(80)
  })

  it('does not initialize Ripple on text-only buttons', async () => {
    const button = mount(AppleButton, { props: { variant: 'ghost' }, slots: { default: 'Details' } })
    await button.trigger('mousedown')
    expect(button.find('.v-ripple__container').exists()).toBe(false)
    button.unmount()
  })

  it('checks changed ancestor policy at interaction time without requiring a child rerender', async () => {
    const parent = document.createElement('div'); parent.dataset.appleMotion = 'none'; document.body.append(parent)
    const button = mount(defineComponent({ render() { return withDirectives(h('button', 'Row'), [[AppleRipple, true]]) } }), { attachTo: parent })
    await button.trigger('mousedown')
    expect(button.find('.v-ripple__container').exists()).toBe(false)
    parent.dataset.appleMotion = 'full'
    await button.trigger('mousedown')
    expect(button.find('.v-ripple__container').exists()).toBe(true)
    await button.trigger('mouseup')
    parent.dataset.appleMotion = 'none'
    await button.trigger('mousedown')
    expect(button.findAll('.v-ripple__animation')).toHaveLength(1)
    button.unmount()
  })

  it('positions one indicator at the selected target and cleans up on unmount', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return { x: 0, y: 0, left: this.dataset.index === '2' ? 100 : 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, toJSON() {} }
    })
    const wrapper = mount(defineComponent({
      props: { selected: { type: Number, default: 1 } },
      render() { return withDirectives(h('div', [1, 2].map(index => h('button', { 'data-index': index, 'data-apple-selected': this.selected === index }, String(index)))), [[AppleSelection, this.selected]]) },
    }), { attachTo: document.body })
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(wrapper.find('.apple-selection-indicator').attributes('style')).toContain('translate(0px, 0px)')
    await wrapper.setProps({ selected: 2 })
    await new Promise(resolve => requestAnimationFrame(resolve))
    expect(wrapper.findAll('.apple-selection-indicator')).toHaveLength(1)
    expect(wrapper.find('.apple-selection-indicator').attributes('style')).toContain('translate(100px, 0px)')
    wrapper.unmount()
    expect(document.querySelector('.apple-selection-indicator')).toBeNull()
  })
})

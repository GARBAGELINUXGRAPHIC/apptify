// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppleImageCompare } from '../src/components/foundation'

const props = { before: '/before.png', after: '/after.png' }

describe('AppleImageCompare', () => {
  it('supports keyboard steps, endpoints and parent updates without changing image geometry', async () => {
    const wrapper = mount(AppleImageCompare, { props })
    const slider = wrapper.get('[role=slider]')
    await slider.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([51])
    await slider.trigger('keydown', { key: 'ArrowLeft', shiftKey: true })
    expect(slider.attributes('aria-valuenow')).toBe('41')
    await slider.trigger('keydown', { key: 'Home' })
    expect(slider.attributes('aria-valuenow')).toBe('0')
    await slider.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('change')?.at(-1)).toEqual([100])
    await wrapper.setProps({ modelValue: 25 })
    expect(slider.attributes('aria-valuenow')).toBe('25')
    expect(wrapper.findAll('img').map(image => image.attributes('src'))).toEqual(['/after.png', '/before.png'])
    wrapper.unmount()
  })

  it('clamps invalid values and disables keyboard and pointer changes', async () => {
    const wrapper = mount(AppleImageCompare, { props: { ...props, modelValue: 250 } })
    const slider = wrapper.get('[role=slider]')
    expect(slider.attributes('aria-valuenow')).toBe('100')
    await wrapper.setProps({ modelValue: NaN })
    expect(slider.attributes('aria-valuenow')).toBe('50')
    await wrapper.setProps({ disabled: true })
    await slider.trigger('keydown', { key: 'Home' })
    await wrapper.trigger('pointerdown', { pointerId: 1, clientX: 0, button: 0 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(slider.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('tracks one pointer, commits at release, and rolls back cancelled scrolling gestures', async () => {
    const wrapper = mount(AppleImageCompare, { props })
    wrapper.get<HTMLElement>('.apple-image-compare__surface').element.getBoundingClientRect = () => ({ left: 100, width: 400 }) as DOMRect
    const event = (pointerId: number, clientX: number) => ({ pointerId, clientX, button: 0 })
    await wrapper.trigger('pointerdown', event(1, 200))
    expect(wrapper.get('[role=slider]').attributes('aria-valuenow')).toBe('25')
    await wrapper.trigger('pointermove', event(2, 500))
    expect(wrapper.get('[role=slider]').attributes('aria-valuenow')).toBe('25')
    await wrapper.trigger('pointermove', event(1, 400))
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.trigger('pointerup', event(1, 400))
    expect(wrapper.emitted('change')).toEqual([[75]])
    await wrapper.trigger('pointerdown', event(2, 120))
    await wrapper.trigger('pointercancel', event(2, 120))
    expect(wrapper.get('[role=slider]').attributes('aria-valuenow')).toBe('75')
    expect(wrapper.emitted('change')).toEqual([[75]])
    wrapper.unmount()
  })
})

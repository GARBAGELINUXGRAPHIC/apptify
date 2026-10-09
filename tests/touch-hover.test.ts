import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { isTouchDevice, syncTouchDevice } from '../src/core/device'
import { ApplePopover, AppleSnackbar } from '../src/components/overlays'
import { AppleDatePicker } from '../src/components/date-picker'
import { AppleAutocomplete, AppleSelect } from '../src/components/forms'

const wrappers: Array<{ unmount(): void }> = []
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.useRealTimers()
  vi.unstubAllGlobals()
  syncTouchDevice()
})
function touch(enabled: boolean) {
  vi.stubGlobal('navigator', { maxTouchPoints: enabled ? 5 : 0 })
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  syncTouchDevice()
}

describe('hover behavior independent of touch capability', () => {
  it('keeps the shared touch capability indicator', () => {
    touch(true)
    expect(isTouchDevice.value).toBe(true)
    expect(document.documentElement.hasAttribute('data-apple-touch')).toBe(true)
    touch(false)
    expect(isTouchDevice.value).toBe(false)
    expect(document.documentElement.hasAttribute('data-apple-touch')).toBe(false)
  })
  it('opens and closes popovers on hover when touch is available', async () => {
    touch(true)
    vi.useFakeTimers()
    const wrapper = mount(ApplePopover, { props: { openOnHover: true, motion: 'none' } })
    wrappers.push(wrapper)
    await wrapper.trigger('mouseenter')
    expect(wrapper.vm.opened).toBe(true)
    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(wrapper.vm.opened).toBe(false)
    await wrapper.get('button').trigger('click')
    expect(wrapper.vm.opened).toBe(true)
  })
  it('pauses and resumes snackbar timers on hover when touch is available', async () => {
    touch(true)
    vi.useFakeTimers()
    const wrapper = mount(AppleSnackbar, { props: { duration: 1000 } })
    wrappers.push(wrapper)
    vi.advanceTimersByTime(400)
    await wrapper.get('.apple-snackbar').trigger('mouseenter')
    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.get('.apple-snackbar').trigger('mouseleave')
    vi.advanceTimersByTime(599)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toEqual([[undefined, 'timeout']])
  })
  it('keeps a hovered snackbar paused when touch capability changes', async () => {
    touch(false)
    vi.useFakeTimers()
    const wrapper = mount(AppleSnackbar, { props: { duration: 1000 } })
    wrappers.push(wrapper)
    vi.advanceTimersByTime(400)
    await wrapper.get('.apple-snackbar').trigger('mouseenter')
    touch(true)
    await nextTick()
    vi.advanceTimersByTime(600)
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.get('.apple-snackbar').trigger('mouseleave')
    vi.advanceTimersByTime(600)
    expect(wrapper.emitted('close')).toEqual([[undefined, 'timeout']])
  })
  it('updates select hover selection when touch is available and skips disabled options', async () => {
    touch(true)
    const wrapper = mount(AppleSelect, { props: { items: [{ label: 'One', value: 1 }, { label: 'Two', value: 2, disabled: true }] } })
    wrappers.push(wrapper)
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.get('[role="option"]').trigger('mouseenter')
    expect(wrapper.vm.activeIndex).toBe(0)
    await wrapper.findAll('[role="option"]')[1]!.trigger('mouseenter')
    expect(wrapper.vm.activeIndex).toBe(0)
  })
  it('updates autocomplete hover selection when touch is available', async () => {
    touch(true)
    const wrapper = mount(AppleAutocomplete, { props: { items: [{ label: 'One', value: 1 }] } })
    wrappers.push(wrapper)
    await wrapper.get('input').trigger('focus')
    await wrapper.get('[role="option"]').trigger('mouseenter')
    expect(wrapper.vm.activeIndex).toBe(0)
  })
  it.each(['mouse', 'touch'])('handles calendar hover trails by event source (%s) on a touch-capable device', async pointerType => {
    touch(true)
    const wrapper = mount(AppleDatePicker, { props: { modelValue: '2026-09-26' } })
    wrappers.push(wrapper)
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    const day = wrapper.get('[data-date="2026-09-25"]')
    const animate = vi.fn()
    Object.defineProperty(day.element, 'animate', { value: animate })
    await day.trigger('pointerleave', { pointerType })
    expect(animate).toHaveBeenCalledTimes(pointerType === 'mouse' ? 1 : 0)
  })
})

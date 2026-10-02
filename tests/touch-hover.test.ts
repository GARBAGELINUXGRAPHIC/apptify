import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { isTouchDevice, syncTouchDevice } from '../src/core/device'
import { ApplePopover, AppleSnackbar } from '../src/components/overlays'
import { AppleDatePicker } from '../src/components/date-picker'

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

describe('global touch hover guard', () => {
  it('marks hybrid devices for CSS and restores desktop hover', () => {
    touch(true)
    expect(isTouchDevice.value).toBe(true)
    expect(document.documentElement.hasAttribute('data-apple-touch')).toBe(true)
    touch(false)
    expect(isTouchDevice.value).toBe(false)
    expect(document.documentElement.hasAttribute('data-apple-touch')).toBe(false)
  })
  it('ignores emulated hover but still opens popovers on click', async () => {
    touch(true)
    const wrapper = mount(ApplePopover, { props: { openOnHover: true, motion: 'none' } })
    wrappers.push(wrapper)
    await wrapper.trigger('mouseenter')
    expect(wrapper.vm.opened).toBe(false)
    await wrapper.get('button').trigger('click')
    expect(wrapper.vm.opened).toBe(true)
  })
  it('does not leave snackbar timers paused by synthetic mouse events', async () => {
    touch(true)
    vi.useFakeTimers()
    const wrapper = mount(AppleSnackbar, { props: { duration: 1000 } })
    wrappers.push(wrapper)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('close')).toEqual([[undefined, 'timeout']])
  })
  it('resumes a hovered snackbar when touch becomes available', async () => {
    touch(false)
    vi.useFakeTimers()
    const wrapper = mount(AppleSnackbar, { props: { duration: 1000 } })
    wrappers.push(wrapper)
    vi.advanceTimersByTime(400)
    await wrapper.trigger('mouseenter')
    touch(true)
    await nextTick()
    vi.advanceTimersByTime(600)
    expect(wrapper.emitted('close')).toEqual([[undefined, 'timeout']])
  })
  it('does not animate calendar hover trails on touch devices', async () => {
    touch(true)
    const wrapper = mount(AppleDatePicker, { props: { modelValue: '2026-09-26' } })
    wrappers.push(wrapper)
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    const day = wrapper.get('[data-date="2026-09-25"]')
    const animate = vi.fn()
    Object.defineProperty(day.element, 'animate', { value: animate })
    await day.trigger('pointerleave')
    expect(animate).not.toHaveBeenCalled()
  })
})

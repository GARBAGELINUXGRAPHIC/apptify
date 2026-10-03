import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, config, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { appleKey, createApple } from '../src/core/context'
import { AppleDatePicker, AppleSelect } from '../src/components/forms'
import {
  AppleActionSheet, AppleDialog, AppleDrawer, InternalImageViewer,
  AppleMenu, AppleOverlayHost, ApplePopover, AppleSheet, AppleSnackbar, AppleTooltip,
} from '../src/components/overlays'

const wrappers: VueWrapper[] = []
const mounted = <T extends VueWrapper>(wrapper: T): T => { wrappers.push(wrapper); return wrapper }
const settle = async () => { await nextTick(); await flushPromises(); await nextTick() }
const finishLeave = async () => {
  await settle()
  await vi.waitFor(async () => {
    await settle()
    expect(document.querySelector('[class*="-leave-active"], [class*="-enter-active"]')).toBeNull()
  }, { timeout: 3000, interval: 20 })
  await settle()
}

beforeEach(() => {
  config.global.stubs.transition = false
  config.global.stubs['transition-group'] = false
})

afterEach(() => {
  wrappers.splice(0).reverse().forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  vi.useRealTimers()
  delete config.global.stubs.transition
  delete config.global.stubs['transition-group']
})

describe('overlay lifecycle', () => {
  it('traps keyboard focus and restores the opener', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = mounted(mount(AppleDialog, { props: { modelValue: true, title: '确认' }, attachTo: document.body }))
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
    const controls = wrapper.findAll('button')
    expect(document.activeElement).toBe(controls[0].element)
    ;(controls.at(-1)!.element as HTMLElement).focus()
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(controls[0].element)
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }))
    expect(document.activeElement).toBe(controls.at(-1)!.element)
    await wrapper.setProps({ modelValue: false })
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).not.toBe(opener)
    await finishLeave()
    expect(document.activeElement).toBe(opener)
    expect(document.body.style.overflow).toBe('')
  })

  it('closes only the top programmatic layer and retains the body lock', async () => {
    document.body.style.overflow = 'scroll'
    const apple = createApple()
    const outer = apple.dialog({ title: '外层' })
    const host = mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    await settle()
    const inner = apple.dialog({ title: '内层' })
    await settle()
    expect(host.findAll('[role="dialog"]')).toHaveLength(2)
    expect(host.findAll('[aria-modal="true"]')).toHaveLength(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(await inner.result).toBeUndefined()
    expect(apple.overlays.entries.value.map(entry => entry.id)).toEqual([outer.id])
    expect(document.body.style.overflow).toBe('hidden')
    outer.close('done')
    await finishLeave()
    expect(await outer.result).toBe('done')
    expect(document.body.style.overflow).toBe('scroll')
  })

  it('shares the stack between declarative and programmatic overlays', async () => {
    const apple = createApple()
    const host = mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    const parent = apple.dialog({ title: '服务弹窗' })
    await settle()
    const drawer = mounted(mount(AppleDrawer, { props: { modelValue: true, title: '声明式抽屉' }, attachTo: document.body }))
    await settle()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await settle()
    expect(drawer.emitted('update:modelValue')).toEqual([[false]])
    expect(apple.overlays.entries.value[0]?.id).toBe(parent.id)
    expect(host.find('[role="dialog"]').attributes('aria-modal')).toBeUndefined()
    await drawer.setProps({ modelValue: false })
    await finishLeave()
    expect(host.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
  })

  it('lets an open inline select consume Escape before the containing drawer', async () => {
    const drawer = mounted(mount(AppleDrawer, {
      props: { modelValue: true }, attachTo: document.body,
      slots: { default: () => h(AppleSelect, { label: '主题', items: [{ label: '浅色', value: 'light' }, { label: '深色', value: 'dark' }] }) },
    }))
    await settle()
    const select = drawer.find('[role="combobox"]')
    await select.trigger('click')
    expect(drawer.find('[role="listbox"]').exists()).toBe(true)
    await select.trigger('keydown', { key: 'Escape' })
    await finishLeave()
    expect(drawer.find('[role="listbox"]').exists()).toBe(false)
    expect(drawer.emitted('close')).toBeUndefined()
    expect(document.body.style.overflow).toBe('hidden')
    await select.trigger('keydown', { key: 'Escape' })
    expect(drawer.emitted('update:modelValue')).toEqual([[false]])
  })

  it('lets an open inline calendar consume Escape before the containing dialog', async () => {
    const dialog = mounted(mount(AppleDialog, {
      props: { modelValue: true }, attachTo: document.body,
      slots: { default: () => h(AppleDatePicker, { label: '到店日期' }) },
    }))
    await settle()
    await dialog.find('[aria-label="打开日历"]').trigger('click')
    expect(dialog.find('.apple-date-menu').exists()).toBe(true)
    const segment = dialog.find('.apple-date-field input')
    await segment.trigger('keydown', { key: 'Escape' })
    await finishLeave()
    expect(dialog.find('.apple-date-menu').exists()).toBe(false)
    expect(dialog.emitted('close')).toBeUndefined()
    await segment.trigger('keydown', { key: 'Escape' })
    expect(dialog.emitted('update:modelValue')).toEqual([[false]])
  })

  it('retains the original focus target when a lower layer is removed first', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const apple = createApple()
    mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    const lower = apple.dialog({ title: '外层' })
    await settle()
    const upper = apple.dialog({ title: '内层' })
    await settle()
    lower.close()
    await finishLeave()
    expect(document.body.style.overflow).toBe('hidden')
    upper.close()
    await finishLeave()
    expect(document.activeElement).toBe(opener)
    expect(document.body.style.overflow).toBe('')
  })

  it('honors persistent and asynchronous confirmation controls', async () => {
    const wrapper = mounted(mount(AppleDialog, {
      props: { modelValue: true, persistent: true, closeOnConfirm: false }, attachTo: document.body,
    }))
    await settle()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.find('.apple-overlay-backdrop').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(wrapper.emitted('confirm')).toEqual([[true]])
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.setProps({ loading: true })
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
  })

  it('returns dialog results and component reverse-channel responses', async () => {
    const apple = createApple()
    const onMessage = vi.fn((_channel: string, payload: unknown) => payload)
    const component = defineComponent({
      props: ['close', 'sendMessage'],
      render() { return h('button', { onClick: () => this.close(this.sendMessage('save', 42)) }, '保存内容') },
    })
    const handle = apple.dialog<number>({ title: '编辑', component, onMessage })
    const host = mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    await settle()
    await host.find('.apple-modal-body button').trigger('click')
    expect(onMessage).toHaveBeenCalledWith('save', 42)
    expect(await handle.result).toBe(42)
    const confirm = apple.dialog<boolean>({ title: '确认' })
    await settle()
    await host.findAll('.apple-modal-footer button').at(-1)!.trigger('click')
    expect(await confirm.result).toBe(true)
  })

  it('teleports inside the provider target and responds to global motion', async () => {
    const apple = createApple({ motion: 'none' })
    const target = document.createElement('div')
    document.body.appendChild(target)
    apple.portalTarget.value = target
    mounted(mount(AppleDialog, {
      props: { modelValue: true, title: '主题弹窗' },
      global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body,
    }))
    await settle()
    expect(target.querySelector('[role="dialog"]')?.getAttribute('data-apple-motion')).toBe('none')
    apple.motion.value.set('full')
    await nextTick()
    expect(target.querySelector('[role="dialog"]')?.getAttribute('data-apple-motion')).toBe('full')
  })

  it.each([AppleDialog, AppleDrawer, AppleSheet])('keeps $name mounted until its leave transition completes', async (component) => {
    const wrapper = mounted(mount(component, { props: { modelValue: true }, attachTo: document.body }))
    await settle()
    await wrapper.setProps({ modelValue: false })
    expect(document.querySelector('.apple-modal-presence-leave-active')).not.toBeNull()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(wrapper.emitted('after-close')).toBeUndefined()
    expect(document.body.style.overflow).toBe('hidden')
    await finishLeave()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.emitted('after-close')).toEqual([[]])
    expect(document.body.style.overflow).toBe('')
  })

  it('cancels leave without dropping the lock when a modal reopens', async () => {
    const wrapper = mounted(mount(AppleDrawer, { props: { modelValue: true }, attachTo: document.body }))
    await settle()
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await finishLeave()
    expect(wrapper.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
    expect(wrapper.emitted('after-close')).toBeUndefined()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('disposes immediately without a translated frame when motion is disabled', async () => {
    const wrapper = mounted(mount(AppleDrawer, { props: { modelValue: true, motion: 'none' }, attachTo: document.body }))
    await settle()
    expect(document.querySelector('[class*="-enter-from"]')).toBeNull()
    await wrapper.setProps({ modelValue: false })
    await settle()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(wrapper.emitted('after-close')).toEqual([[]])
  })

  it('keeps a closing programmatic layer topmost and resolves its result before visual disposal', async () => {
    const apple = createApple()
    const lower = apple.dialog({ title: '外层' })
    const host = mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    await settle()
    const upper = apple.dialog({ title: '内层' })
    await settle()
    upper.close('saved')
    await settle()
    expect(await upper.result).toBe('saved')
    expect(host.findAll('[role="dialog"]')).toHaveLength(2)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(apple.overlays.entries.value.map(entry => entry.id)).toEqual([lower.id])
    await finishLeave()
    expect(host.findAll('[role="dialog"]')).toHaveLength(1)
    expect(host.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
  })

  it('uses the real shared button component for both dialog actions', async () => {
    const wrapper = mounted(mount(AppleDialog, { props: { modelValue: true }, attachTo: document.body }))
    await settle()
    const actions = wrapper.findAll('.apple-modal-footer .apple-button')
    expect(actions).toHaveLength(2)
    expect(actions[0].classes()).toContain('apple-button--secondary')
    expect(actions[1].classes()).toContain('apple-button--primary')
    expect(actions.every(action => action.find('.apple-button__content').exists())).toBe(true)
  })
})

describe('notification queue', () => {
  it('retains service notifications during their rightward leave motion', async () => {
    const apple = createApple()
    const first = apple.notify('已保存', { duration: 0 })
    apple.notify('已同步', { duration: 0 })
    const host = mounted(mount(AppleOverlayHost, { global: { provide: { [appleKey as symbol]: apple } }, attachTo: document.body }))
    await settle()
    first.close()
    await settle()
    expect(host.findAll('.apple-snackbar')).toHaveLength(2)
    expect(host.find('.apple-toast-leave-active').exists()).toBe(true)
    await finishLeave()
    expect(host.findAll('.apple-snackbar')).toHaveLength(1)
    expect(host.find('.apple-snackbar').text()).toContain('已同步')
  })
  it('pauses timeout while hovered and resumes the remaining time', async () => {
    vi.useFakeTimers()
    const wrapper = mounted(mount(AppleSnackbar, { props: { message: '已保存', duration: 1000 } }))
    vi.advanceTimersByTime(600)
    await wrapper.trigger('mouseenter')
    vi.advanceTimersByTime(3000)
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.trigger('mouseleave')
    vi.advanceTimersByTime(399)
    expect(wrapper.emitted('close')).toBeUndefined()
    vi.advanceTimersByTime(1)
    expect(wrapper.emitted('close')).toEqual([[undefined, 'timeout']])
  })

  it('keeps zero-duration notifications and clears timers when removed', async () => {
    vi.useFakeTimers()
    const wrapper = mounted(mount(AppleSnackbar, { props: { duration: 0, message: '等待完成' } }))
    vi.advanceTimersByTime(60000)
    await settle()
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.setProps({ duration: 1000 })
    expect(vi.getTimerCount()).toBe(1)
    wrapper.unmount()
    wrappers.pop()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('menus and tooltips', () => {
  it('supports an activator slot, arrow navigation, disabled items, and selection', async () => {
    const wrapper = mounted(mount(AppleMenu, {
      props: { items: [{ label: '复制', value: 'copy' }, { label: '不可用', value: 'disabled', disabled: true }, { label: '删除', value: 'delete', danger: true }] },
      slots: { activator: ({ props }: { props: Record<string, unknown> }) => h('button', props, '打开菜单') },
      attachTo: document.body,
    }))
    await wrapper.find('button').trigger('click')
    await settle()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    const items = wrapper.findAll('[role="menuitem"]')
    expect(document.activeElement).toBe(items[0].element)
    await items[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[2].element)
    await items[2].trigger('click')
    await finishLeave()
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('delete')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('does not close an underlying popover when the top dialog is dismissed', async () => {
    const popover = mounted(mount(ApplePopover, { slots: { default: () => h('button', '内部') }, attachTo: document.body }))
    await popover.find('button').trigger('click')
    await settle()
    const dialog = mounted(mount(AppleDialog, { props: { modelValue: true }, attachTo: document.body }))
    await settle()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(popover.find('.apple-popover').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(dialog.emitted('close')).toHaveLength(1)
    expect(popover.find('.apple-popover').exists()).toBe(true)
  })

  it('shows a tooltip for keyboard focus and dismisses it with Escape', async () => {
    const wrapper = mounted(mount(AppleTooltip, {
      props: { text: '保存' }, slots: { default: () => h('button', '工具') }, attachTo: document.body,
    }))
    await wrapper.find('button').trigger('focusin')
    await settle()
    expect(wrapper.find('[role="tooltip"]').text()).toBe('保存')
    expect(wrapper.find('button').attributes('aria-describedby')).toBeTruthy()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await finishLeave()
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('returns the action sheet selected value', async () => {
    const wrapper = mounted(mount(AppleActionSheet, { props: { modelValue: true, items: [{ label: '相机', value: 'camera' }] }, attachTo: document.body }))
    await settle()
    await wrapper.find('.apple-action-sheet-item').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('camera')
    expect(wrapper.emitted('close')).toEqual([['camera', 'select']])
  })

  it('accepts a content template with selection and close callbacks', async () => {
    const camera = { label: '相机', value: 'camera' }
    const wrapper = mounted(mount(AppleActionSheet, {
      props: { modelValue: true, items: [{ label: '默认条目', value: 'fallback' }] },
      slots: { default: ({ select, close }) => [
        h('button', { class: 'custom-select', onClick: () => select(camera) }, '拍摄照片'),
        h('button', { class: 'custom-close', onClick: () => close('done') }, '完成'),
      ] }, attachTo: document.body,
    }))
    await settle()
    expect(wrapper.find('.apple-sheet-handle').exists()).toBe(false)
    expect(wrapper.find('.apple-action-sheet-items').exists()).toBe(false)
    expect(wrapper.find('.apple-action-sheet-cancel').exists()).toBe(true)
    await wrapper.find('.custom-select').trigger('click')
    expect(wrapper.emitted('select')).toEqual([['camera', camera]])
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    await wrapper.find('.custom-close').trigger('click')
    expect(wrapper.emitted('close')).toEqual([['camera', 'select'], ['done', 'close']])
  })

  it('ignores disabled actions selected through a template', async () => {
    const wrapper = mounted(mount(AppleActionSheet, {
      props: { modelValue: true },
      slots: { default: ({ select }) => h('button', { onClick: () => select({ label: '不可用', value: 'disabled', disabled: true }) }, '选择') },
      attachTo: document.body,
    }))
    await settle()
    await wrapper.find('.apple-modal-body button').trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})

describe('image viewer', () => {
  const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate')
  beforeEach(() => {
    // jsdom has no WAAPI. Model its lifetime so return-animation cleanup and
    // the shared scroll lock are checked before and after completion.
    Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: (_frames: Keyframe[], options: KeyframeAnimationOptions) => {
      let timer: ReturnType<typeof setTimeout>
      let finish!: () => void
      const finished = new Promise<void>(resolve => { finish = () => { clearTimeout(timer); resolve() } })
      timer = setTimeout(finish, Number(options.duration) || 0)
      return { finished, cancel: finish, finish }
    } })
  })
  afterEach(() => {
    if (originalAnimate) Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate)
    else Reflect.deleteProperty(HTMLElement.prototype, 'animate')
  })
  it('can reduce motion while a photo is still loading with an infinite spinner', async () => {
    const wrapper = mounted(mount(InternalImageViewer, { props: { modelValue: true, images: ['/pending.png'], motion: 'full' }, attachTo: document.body }))
    await settle()
    const finishTransition = vi.fn(), finishSpinner = vi.fn(() => { throw new Error('Cannot finish an infinite animation') })
    Object.defineProperty(wrapper.find('.apple-image-viewer').element, 'getAnimations', { value: () => [
      { effect: { getComputedTiming: () => ({ endTime: 360 }) }, finish: finishTransition },
      { effect: { getComputedTiming: () => ({ endTime: Infinity }) }, finish: finishSpinner },
    ] })
    await wrapper.setProps({ motion: 'reduced' })
    expect(finishTransition).toHaveBeenCalledOnce()
    expect(finishSpinner).not.toHaveBeenCalled()
    expect(wrapper.find('[aria-label="图片加载中"]').exists()).toBe(true)
  })

  it('cleans up gestures on image changes and close, and renders load errors', async () => {
    const wrapper = mounted(mount(InternalImageViewer, { props: { modelValue: true, images: ['/one.png', '/two.png'], motion: 'none' }, attachTo: document.body }))
    await settle()
    await wrapper.find('.apple-viewer-image').trigger('load')
    const first = wrapper.vm.panzoom!
    const destroyFirst = vi.spyOn(first, 'destroy')
    await wrapper.find('[aria-label="下一张"]').trigger('click')
    expect(destroyFirst).toHaveBeenCalledOnce()
    expect(wrapper.vm.loaded).toBe(false)
    await wrapper.find('.apple-viewer-image').trigger('error')
    expect(wrapper.find('[role="status"]').text()).toContain('图片加载失败')
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.find('[aria-label="放大"]').attributes('disabled')).toBeDefined()
    await wrapper.find('[aria-label="上一张"]').trigger('click')
    await wrapper.find('.apple-viewer-image').trigger('load')
    const destroySecond = vi.spyOn(wrapper.vm.panzoom!, 'destroy')
    await wrapper.setProps({ modelValue: false })
    await finishLeave()
    expect(destroySecond).toHaveBeenCalledOnce()
    await wrapper.setProps({ modelValue: true })
    await settle()
    await wrapper.find('.apple-viewer-image').trigger('load')
    expect(wrapper.vm.panzoom!.getScale()).toBe(1)
  })
  it('uses wheel distance rather than timing or event count, including fractional deltas and units', async () => {
    const scaleAfter = async (deltas: number[], deltaMode = 0) => {
      const wrapper = mounted(mount(InternalImageViewer, { props: { modelValue: true, images: ['/one.png'], motion: 'none' }, attachTo: document.body }))
      await settle()
      const image = wrapper.find('.apple-viewer-image')
      Object.defineProperties(image.element, { width: { value: 400 }, height: { value: 300 }, naturalWidth: { value: 800 } })
      await image.trigger('load')
      const panel = wrapper.find('.apple-image-viewer')
      for (const deltaY of deltas) await panel.trigger('wheel', { deltaY, deltaMode })
      const scale = wrapper.vm.panzoom!.getScale()
      await wrapper.setProps({ modelValue: false })
      await settle()
      return scale
    }
    expect(await scaleAfter([-240])).toBeCloseTo(Math.exp(0.48))
    expect(await scaleAfter(Array(24).fill(-10))).toBeCloseTo(Math.exp(0.48))
    expect(await scaleAfter(Array(480).fill(-0.5))).toBeCloseTo(Math.exp(0.48))
    expect(await scaleAfter([-15], 1)).toBeCloseTo(Math.exp(0.48))
    expect(await scaleAfter([-240, 240])).toBeCloseTo(1)
    expect(await scaleAfter([-0.5])).toBeCloseTo(Math.exp(0.001), 8)
    expect(await scaleAfter([-1], 2)).toBeCloseTo(Math.exp(window.innerHeight * 0.002))
    expect(await scaleAfter([-100000, 1])).toBeLessThan(10)
  })
  it('zooms with the scroll wheel while preserving the shared scroll lock', async () => {
    const wrapper = mounted(mount(InternalImageViewer, { props: { modelValue: true, images: ['/one.png'] }, attachTo: document.body }))
    await settle()
    const image = wrapper.find('.apple-viewer-image')
    Object.defineProperties(image.element, { width: { value: 400 }, height: { value: 300 }, naturalWidth: { value: 800 } })
    await image.trigger('load')
    await wrapper.find('.apple-image-viewer').trigger('wheel', { deltaY: -120 })
    await vi.waitFor(() => expect(Number(wrapper.find('.apple-viewer-canvas').attributes('style').match(/scale\(([^)]+)\)/)?.[1])).toBeCloseTo(Math.exp(0.24)))
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ modelValue: false })
    expect(document.querySelector('.apple-viewer-presence-leave-active')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
    await finishLeave()
    expect(wrapper.find('.apple-image-viewer').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
  })
  it('labels gallery controls and supports keyboard navigation', async () => {
    const wrapper = mounted(mount(InternalImageViewer, {
      props: { modelValue: true, images: [{ src: '/one.png', alt: '一' }, '/two.png'] }, attachTo: document.body,
    }))
    await settle()
    expect(wrapper.find('.apple-viewer-canvas').exists()).toBe(true)
    expect(wrapper.find('[aria-label="关闭图片预览"]').exists()).toBe(true)
    expect(wrapper.find('.apple-viewer-count').text()).toBe('1 / 2')
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle()
    expect(wrapper.find('.apple-viewer-count').text()).toBe('2 / 2')
    expect(wrapper.emitted('update:index')).toEqual([[1]])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('does not navigate the underlying viewer while a dialog is focused', async () => {
    const viewer = mounted(mount(InternalImageViewer, { props: { modelValue: true, images: ['/one.png', '/two.png'] }, attachTo: document.body }))
    await settle()
    mounted(mount(AppleDialog, { props: { modelValue: true }, slots: { default: () => h('input', { 'aria-label': '内容' }) }, attachTo: document.body }))
    await settle()
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle()
    expect(viewer.find('.apple-viewer-count').text()).toBe('1 / 2')
    expect(viewer.emitted('update:index')).toBeUndefined()
  })
})

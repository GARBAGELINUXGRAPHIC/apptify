import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { appleKey, createApple } from '../src/core/context'
import {
  AppleActionSheet, AppleDialog, AppleDrawer, AppleImageViewer,
  AppleMenu, AppleOverlayHost, ApplePopover, AppleSnackbar, AppleTooltip,
} from '../src/components/overlays'

const wrappers: VueWrapper[] = []
const mounted = <T extends VueWrapper>(wrapper: T): T => { wrappers.push(wrapper); return wrapper }
const settle = async () => { await nextTick(); await flushPromises(); await nextTick() }

afterEach(() => {
  wrappers.splice(0).reverse().forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  vi.useRealTimers()
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
    await settle()
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
    expect(apple.overlays.entries.map(entry => entry.id)).toEqual([outer.id])
    expect(document.body.style.overflow).toBe('hidden')
    outer.close('done')
    await settle()
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
    expect(apple.overlays.entries[0]?.id).toBe(parent.id)
    expect(host.find('[role="dialog"]').attributes('aria-modal')).toBeUndefined()
    await drawer.setProps({ modelValue: false })
    await settle()
    expect(host.find('[role="dialog"]').attributes('aria-modal')).toBe('true')
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
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    upper.close()
    await settle()
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
    apple.motion.set('full')
    await nextTick()
    expect(target.querySelector('[role="dialog"]')?.getAttribute('data-apple-motion')).toBe('full')
  })
})

describe('notification queue', () => {
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
    await settle()
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
    await settle()
    expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
  })

  it('returns the action sheet selected value', async () => {
    const wrapper = mounted(mount(AppleActionSheet, { props: { modelValue: true, items: [{ label: '相机', value: 'camera' }] }, attachTo: document.body }))
    await settle()
    await wrapper.find('.apple-action-sheet-item').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('camera')
    expect(wrapper.emitted('close')).toEqual([['camera', 'select']])
  })
})

describe('image viewer', () => {
  it('uses the gallery engine, labels controls, and supports keyboard navigation', async () => {
    const wrapper = mounted(mount(AppleImageViewer, {
      props: { modelValue: true, images: [{ src: '/one.png', alt: '一' }, '/two.png'] }, attachTo: document.body,
    }))
    await settle()
    expect(wrapper.find('.vel-modal').exists()).toBe(true)
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
    const viewer = mounted(mount(AppleImageViewer, { props: { modelValue: true, images: ['/one.png', '/two.png'] }, attachTo: document.body }))
    await settle()
    mounted(mount(AppleDialog, { props: { modelValue: true }, slots: { default: () => h('input', { 'aria-label': '内容' }) }, attachTo: document.body }))
    await settle()
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }))
    await settle()
    expect(viewer.find('.apple-viewer-count').text()).toBe('1 / 2')
    expect(viewer.emitted('update:index')).toBeUndefined()
  })
})

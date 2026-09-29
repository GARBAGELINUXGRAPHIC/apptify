import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AppleNavibar, components } from '../src'

const items = [{ label: 'Home', value: 'home' }, { label: 'Design', value: 'design' }, { label: 'Disabled', value: 'disabled', disabled: true }, { label: 'Docs', value: 'docs', href: '/docs' }]
let width = 1024
let resize: () => void
const disconnect = vi.fn()
const wrappers: VueWrapper[] = []
function render(props = {}) {
  const wrapper = mount(AppleNavibar, { props: { items, brand: 'Apptify', ...props }, attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  width = 1024
  disconnect.mockClear()
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width, height: 64, top: 0, left: 0, right: width, bottom: 64, x: 0, y: 0, toJSON: () => ({}) }))
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe() {}
    disconnect = disconnect
  })
})

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('AppleNavibar', () => {
  it('exports and registers a fixed navigation with native links', () => {
    expect(components.AppleNavibar).toBe(AppleNavibar)
    const wrapper = render({ modelValue: 'home' })
    expect(wrapper.classes()).toContain('apple-navibar--fixed')
    expect(wrapper.find('nav').attributes('aria-label')).toBe('主导航')
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Home')
    expect(wrapper.find('a[href="/docs"]').text()).toBe('Docs')
    expect(wrapper.find('.apple-navibar__toggle').attributes('hidden')).toBeDefined()
  })

  it('collapses at the breakpoint, opens by keyboard, and restores focus on Escape', async () => {
    const wrapper = render()
    width = 390; resize(); await nextTick()
    const toggle = wrapper.find('.apple-navibar__toggle')
    expect(wrapper.find('nav').attributes('aria-hidden')).toBe('true')
    await toggle.trigger('keydown', { key: 'ArrowDown' })
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(wrapper.find('.apple-navibar__item').element)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.find('nav').attributes('aria-hidden')).toBe('true')
    expect(document.activeElement).toBe(toggle.element)
    expect(wrapper.emitted('toggle')).toEqual([[true], [false]])
  })

  it('selects once, closes the disclosure, and prevents disabled navigation', async () => {
    width = 390
    const wrapper = render({ items: [...items, { label: 'Blocked link', value: 'blocked', href: '/blocked', disabled: true }] })
    await wrapper.find('.apple-navibar__toggle').trigger('click')
    const blocked = wrapper.findAll('[aria-disabled="true"]')
    expect(blocked[1]!.attributes('href')).toBeUndefined()
    for (const element of blocked) await element.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.findAll('.apple-navibar__item')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['design']])
    expect(wrapper.emitted('change')).toEqual([['design', items[1]]])
    expect(wrapper.find('[aria-current="page"]').text()).toBe('Design')
    expect(wrapper.find('.apple-navibar__toggle').attributes('aria-expanded')).toBe('false')
  })

  it('closes for outside interactions and external route changes', async () => {
    width = 390
    const wrapper = render({ modelValue: 'home' })
    const toggle = wrapper.find('.apple-navibar__toggle')
    await toggle.trigger('click')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')
    await wrapper.setProps({ modelValue: 'design' })
    expect(toggle.attributes('aria-expanded')).toBe('false')
  })

  it('resets an open menu when resized and supports a custom breakpoint', async () => {
    width = 700
    const wrapper = render({ fixed: false, breakpoint: 800 })
    await nextTick()
    expect(wrapper.classes()).not.toContain('apple-navibar--fixed')
    await wrapper.find('.apple-navibar__toggle').trigger('click')
    width = 1000; resize(); await nextTick()
    expect(wrapper.find('nav').attributes('aria-hidden')).toBeUndefined()
    width = 700; resize(); await nextTick()
    expect(wrapper.find('nav').attributes('aria-hidden')).toBe('true')
    await wrapper.setProps({ breakpoint: 600 })
    expect(wrapper.find('nav').attributes('aria-hidden')).toBeUndefined()
  })

  it('supports brand, item, and action slots and disconnects observation', () => {
    const wrapper = mount(AppleNavibar, { props: { items }, slots: {
      brand: () => h('strong', 'My brand'),
      item: ({ item }: { item: { label: string } }) => h('span', `${item.label}!`),
      actions: () => h('button', 'Account'),
    } })
    expect(wrapper.find('.apple-navibar__brand').text()).toBe('My brand')
    expect(wrapper.find('.apple-navibar__item').text()).toBe('Home!')
    expect(wrapper.find('.apple-navibar__actions').text()).toBe('Account')
    disconnect.mockClear()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })
})

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, KeepAlive, nextTick, ref } from 'vue'
import { AppleTree } from '../src/components/content'
import { AppleProvider } from '../src/components/foundation'
import { AppleSpeedDial, AppleSpeedDialItem } from '../src/components/speed-dial'
import { appleKey, createApple } from '../src/core/context'

const wrappers: { unmount(): void }[] = []
const trees = [{ label: '项目', value: 'root', children: [{ label: '接口', value: 'api' }, { label: '指南', value: 'guide' }] }]
let mobile = true
let mediaChanged: (() => void) | undefined
beforeEach(() => {
  mobile = true
  mediaChanged = undefined
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ get matches() { return query === '(max-width: 900px)' && mobile }, addEventListener: (_: string, listener: () => void) => { if (query === '(max-width: 900px)') mediaChanged = listener }, removeEventListener: vi.fn() })))
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 })
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
async function render(children: () => ReturnType<typeof h>[]) {
  const context = createApple({ motion: 'none' })
  const wrapper = mount(defineComponent({ setup: () => () => h('main', children()) }), { attachTo: document.body, global: { provide: { [appleKey as symbol]: context } } })
  wrappers.push(wrapper)
  await flushPromises()
  return { wrapper, context }
}
async function openDirectory() {
  document.querySelector<HTMLButtonElement>('.apple-speed-dial-directory')!.click()
  await flushPromises()
}

describe('global SpeedDial', () => {
  it('shares registration through nested Providers and prefers the app host over a child host', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { context } = await render(() => [
      h(AppleProvider, { theme: 'dark' }, { default: () => [h(AppleTree, { items: trees }), h(AppleSpeedDialItem, { label: '页面操作' }), h(AppleSpeedDial, { label: '子页面宿主' })] }),
      h(AppleSpeedDial, { label: '应用宿主' }),
    ])
    expect(document.querySelectorAll('.apple-speed-dial')).toHaveLength(1)
    expect(document.querySelector('.apple-speed-dial')?.getAttribute('aria-label')).toBe('应用宿主')
    expect(context.speedDial.entries.value.map(entry => entry.kind)).toEqual(['directory', 'action'])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('only one app host'))
  })

  it('moves the same tree between desktop and mobile, preserving search and selection events', async () => {
    const select = vi.fn()
    const { context } = await render(() => [h(AppleTree, { items: trees, label: '接口目录', onSelect: select }), h(AppleSpeedDial)])
    await openDirectory()
    const input = document.querySelector<HTMLInputElement>('[type="search"]')!
    input.value = '接口'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('.apple-directory-dialog [aria-label="接口"]')).not.toBeNull()
    expect(document.querySelector('.apple-directory-dialog [aria-label="指南"]')).toBeNull()
    document.querySelector<HTMLElement>('[aria-label="接口"] > .apple-tree__row')!.click()
    await flushPromises()
    expect(select).toHaveBeenCalledWith(trees[0].children[0])
    expect(context.speedDial.open.value).toBe(false)
    mobile = false
    mediaChanged?.()
    await flushPromises()
    expect(document.querySelector('.apple-tree-host [type="search"]')).toBe(input)
    expect(input.value).toBe('接口')
    expect(document.querySelector('.apple-speed-dial-directory')).toBeNull()
  })

  it('combines multiple trees into TabBar and keeps action callbacks in their declaring page', async () => {
    const click = vi.fn()
    const { wrapper, context } = await render(() => [h(AppleTree, { label: '目录甲', items: trees }), h(AppleTree, { label: '目录乙', items: [{ label: '设置', value: 'settings' }] }), h(AppleSpeedDialItem, { label: '新增', onClick: click }), h(AppleSpeedDial)])
    document.querySelector<HTMLButtonElement>('.apple-speed-dial-item')!.click()
    expect(click).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.apple-speed-dial .apple-back-top')!.compareDocumentPosition(document.querySelector('.apple-speed-dial-item')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.querySelector('.apple-speed-dial')?.lastElementChild?.classList.contains('apple-speed-dial-directory')).toBe(true)
    expect(document.querySelector('.apple-speed-dial-directory')?.classList.contains('apple-button--primary')).toBe(true)
    await openDirectory()
    const tabs = document.querySelectorAll<HTMLButtonElement>('.apple-directory-dialog .apple-tabs--bar [role="tab"]')
    expect([...tabs].map(tab => tab.textContent)).toEqual(['目录甲', '目录乙'])
    tabs[1].click()
    await flushPromises()
    expect(document.querySelector('.apple-directory-dialog [role="tree"]')?.getAttribute('aria-label')).toBe('目录乙')
    wrapper.unmount()
    wrappers.pop()
    expect(context.speedDial.entries.value).toEqual([])
    expect(context.speedDial.host.value).toBeUndefined()
  })

  it('keeps opted-out trees and trees without a host in place', async () => {
    const { context } = await render(() => [h(AppleTree, { items: trees, mobileDirectory: false }), h(AppleSpeedDial)])
    expect(context.speedDial.entries.value).toHaveLength(0)
    expect(document.querySelector('.apple-tree-host [role="tree"]')).not.toBeNull()
    expect(document.querySelector('.apple-speed-dial-directory')).toBeNull()
    const standalone = mount(AppleTree, { props: { items: trees }, attachTo: document.body })
    wrappers.push(standalone)
    await flushPromises()
    expect(standalone.find('[role="tree"]').exists()).toBe(true)
  })

  it('unregisters cached pages while inactive and registers once on return', async () => {
    const show = ref(true)
    const Page = defineComponent({ setup: () => () => h(AppleTree, { items: trees }) })
    const Other = defineComponent({ setup: () => () => h('div', '其他页面') })
    const { context } = await render(() => [h(KeepAlive, null, { default: () => h(show.value ? Page : Other) }), h(AppleSpeedDial)])
    expect(context.speedDial.entries.value).toHaveLength(1)
    show.value = false
    await flushPromises()
    expect(context.speedDial.entries.value).toHaveLength(0)
    show.value = true
    await flushPromises()
    expect(context.speedDial.entries.value).toHaveLength(1)
  })
})

describe('tree search', () => {
  it('reveals matching paths without changing controlled expansion, then restores it when cleared', async () => {
    const wrapper = mount(AppleTree, { props: { items: trees, expanded: [] } })
    wrappers.push(wrapper)
    await wrapper.get('input').setValue('接口')
    expect(wrapper.find('[aria-label="接口"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="指南"]').exists()).toBe(false)
    await wrapper.get('[aria-label="项目"] > .apple-tree__row').trigger('click')
    expect(wrapper.get('[aria-label="项目"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:expanded')).toBeUndefined()
    await wrapper.get('input').setValue('')
    expect(wrapper.get('[aria-label="项目"]').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ searchable: false })
    expect(wrapper.find('input').exists()).toBe(false)
  })
})

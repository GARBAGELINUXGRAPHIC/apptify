// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AppleAccordion, AppleAvatar, AppleBackTop, AppleBadge, AppleBreadcrumbs, AppleCarousel, AppleFloatingGroup, AppleInfiniteScroll, AppleList, AppleMarquee, ApplePagination, AppleProgress, ApplePullRefresh, AppleSkeleton, AppleSwipeCell, AppleTable, AppleTabBar, AppleTabs, AppleTimeline, AppleTree } from '../src/components/content'

const items = [
  { label: '概览', value: 'overview', content: '概览内容' },
  { label: '暂未开放', value: 'disabled', disabled: true },
  { label: '详细参数', value: 'details', content: '参数内容' },
]
const wrappers: { unmount(): void }[] = []
function keep<T extends { unmount(): void }>(wrapper: T): T { wrappers.push(wrapper); return wrapper }

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', undefined)
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('AppleCarousel lifecycle', () => {
  it('ignores a queued scroll callback after its track is unmounted', () => {
    vi.useFakeTimers()
    const wrapper = mount(AppleCarousel, { props: { items: [{ label: 'One', value: 1 }] } })
    const onScroll = wrapper.vm.onScroll
    wrapper.unmount()
    onScroll()
    expect(() => vi.runAllTimers()).not.toThrow()
  })
})

describe('AppleTabs', () => {
  it('does not attach Ripple to either tab variant', async () => {
    for (const component of [AppleTabs, AppleTabBar]) {
      const wrapper = keep(mount(component, { props: { items }, attachTo: document.body }))
      await wrapper.get('[role="tab"]').trigger('mousedown')
      expect(wrapper.find('.v-ripple__container').exists()).toBe(false)
      await wrapper.get('[role="tab"]').trigger('mouseup')
      await wrapper.get('[role="tab"]').trigger('keydown', { key: 'Enter' })
      expect(wrapper.find('.v-ripple__container').exists()).toBe(false)
    }
  })
  it('shares keyboard behavior with the top-rounded tab bar and renders the item content fallback', async () => {
    const wrapper = keep(mount(AppleTabBar, { props: { items } }))
    expect(wrapper.find('.apple-tabs--bar').exists()).toBe(true)
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('概览内容')
    await wrapper.get('[role="tab"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['details'])
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('参数内容')
    expect(wrapper.find('.apple-selection-indicator').exists()).toBe(true)
  })

  it('uses one focusable tab, skips disabled items and supports wrapping keyboard navigation', async () => {
    const wrapper = keep(mount(AppleTabs, { props: { items }, attachTo: document.body, slots: { default: ({ value }: { value: string }) => `当前：${value}` } }))
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs.filter(tab => tab.attributes('tabindex') === '0')).toHaveLength(1)
    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['details'])
    expect(document.activeElement).toBe(tabs[2]!.element)
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('当前：details')
    await tabs[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['overview'])
    await tabs[0]!.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(tabs[2]!.element)
  })

  it('recovers when the active tab is removed and honors a controlled value', async () => {
    const wrapper = keep(mount(AppleTabs, { props: { items, modelValue: 'details' } }))
    await wrapper.get('[role="tab"]').trigger('click')
    expect(wrapper.findAll('[role="tab"]')[2]!.attributes('aria-selected')).toBe('true')
    await wrapper.setProps({ items: items.slice(0, 2) })
    expect(wrapper.get('[role="tab"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[role="tabpanel"]').attributes('aria-labelledby')).toBe(wrapper.get('[role="tab"]').attributes('id'))
  })
})

describe('AppleAccordion and ApplePagination', () => {
  it('opens one accordion item at a time, closes again, and supports multiple mode', async () => {
    const wrapper = keep(mount(AppleAccordion, { props: { items } }))
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    expect(buttons[0]!.attributes('aria-expanded')).toBe('true')
    await buttons[2]!.trigger('click')
    expect(buttons[0]!.attributes('aria-expanded')).toBe('false')
    expect(buttons[2]!.attributes('aria-expanded')).toBe('true')
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
    await wrapper.setProps({ multiple: true })
    await buttons[0]!.trigger('click')
    await buttons[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['overview', 'details']])
    expect(buttons[1]!.attributes('disabled')).toBeDefined()
  })

  it('keeps collapse content mounted for height transitions but removes it from focus and accessibility when closed', async () => {
    const wrapper = keep(mount(AppleAccordion, { props: { items: items.slice(0, 1) }, slots: { item: '<button>内容动作</button>' } }))
    const region = wrapper.get('[role="region"]')
    expect(region.attributes('hidden')).toBeUndefined()
    expect(region.attributes('inert')).toBeDefined()
    expect(region.attributes('aria-hidden')).toBe('true')
    await wrapper.get('h3 button').trigger('click')
    expect(region.attributes('inert')).toBeUndefined()
    expect(region.attributes('aria-hidden')).toBe('false')
    await wrapper.get('h3 button').trigger('click')
    expect(region.find('button').exists()).toBe(true)
    expect(region.attributes('inert')).toBeDefined()
  })

  it('bounds pages, shows gaps, and never emits out-of-range changes', async () => {
    const wrapper = keep(mount(ApplePagination, { props: { total: 250, pageSize: 10, modelValue: 12 } }))
    expect(wrapper.findAll('.apple-pagination__gap')).toHaveLength(2)
    await wrapper.get('[aria-label="下一页"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[13]])
    await wrapper.setProps({ modelValue: 25 })
    expect(wrapper.get('[aria-label="下一页"]').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ total: 0 })
    expect(wrapper.get('[aria-current="page"]').text()).toBe('1')
    expect(wrapper.get('[aria-label="上一页"]').attributes('disabled')).toBeDefined()
  })
})

describe('AppleTable', () => {
  const rows = [{ id: 'a', name: 'A', price: 30 }, { id: 'b', name: 'B', price: 10 }, { id: 'c', name: 'C', price: 20 }]
  const columns = [{ key: 'name', label: '名称' }, { key: 'price', label: '价格', sortable: true }]

  it('sorts numerically in both directions without mutating input rows', async () => {
    const wrapper = keep(mount(AppleTable, { props: { rows, columns } }))
    await wrapper.get('.apple-table__sort').trigger('click')
    expect(wrapper.findAll('tbody tr').map(row => row.findAll('td')[0]!.text())).toEqual(['B', 'C', 'A'])
    expect(wrapper.get('[aria-sort]').attributes('aria-sort')).toBe('ascending')
    await wrapper.get('.apple-table__sort').trigger('click')
    expect(wrapper.findAll('tbody tr').map(row => row.findAll('td')[0]!.text())).toEqual(['A', 'C', 'B'])
    expect(rows.map(row => row.id)).toEqual(['a', 'b', 'c'])
  })

  it('selects only the current page and preserves selections across pages', async () => {
    const wrapper = keep(mount(AppleTable, { props: { rows, columns, selectable: true, pageSize: 2 } }))
    await wrapper.get('thead input').setValue(true)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([['a', 'b']])
    await wrapper.get('[aria-label="下一页"]').trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.get('tbody tr').text()).toContain('C')
    await wrapper.get('thead input').setValue(true)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([['a', 'b', 'c']])
    await wrapper.get('[aria-label="上一页"]').trigger('click')
    await wrapper.get('thead input').setValue(false)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([['c']])
  })

  it('sets the header checkbox indeterminate and prevents disabled selection', async () => {
    const wrapper = keep(mount(AppleTable, { props: { rows, columns, selectable: true, selected: ['a'], disabled: true } }))
    expect((wrapper.get('thead input').element as HTMLInputElement).indeterminate).toBe(true)
    expect(wrapper.get('thead input').attributes('disabled')).toBeDefined()
    await wrapper.get('.apple-table__sort').trigger('click')
    expect(wrapper.emitted('sort')).toBeUndefined()
  })

  it('resizes columns with keyboard input, enforces min/max, and allows opting out per column', async () => {
    const wrapper = keep(mount(AppleTable, { props: { rows, columns: [{ key: 'name', label: '名称', width: 120, minWidth: 110, maxWidth: 130 }, { key: 'price', label: '价格', resizable: false }] } }))
    expect(wrapper.findAll('[role="separator"]')).toHaveLength(1)
    const handle = wrapper.get('[role="separator"]')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(handle.attributes('aria-valuenow')).toBe('130')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(handle.attributes('aria-valuenow')).toBe('110')
    expect(wrapper.emitted('column-resize')?.at(-1)).toEqual([{ key: 'name', width: 110 }])
    await wrapper.setProps({ disabled: true })
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(handle.attributes('aria-valuenow')).toBe('110')
  })
})

describe('AppleTree', () => {
  it('expands and selects through the entire row rather than requiring the chevron', async () => {
    const wrapper = keep(mount(AppleTree, { props: { items: [{ label: '项目', value: 'root', children: [{ label: '组件', value: 'child' }] }, { label: '不可用', value: 'off', disabled: true }] } }))
    await wrapper.get('.apple-tree__row').trigger('click')
    expect(wrapper.emitted('update:expanded')?.at(-1)).toEqual([['root']])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['root'])
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(3)
    expect(wrapper.get('.apple-tree__row').attributes('data-apple-selected')).toBe('true')
    expect(wrapper.find('.apple-selection-indicator').exists()).toBe(false)
    await wrapper.get('.apple-tree__row').trigger('click')
    expect(wrapper.emitted('update:expanded')?.at(-1)).toEqual([[]])
    await wrapper.get('.is-disabled').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })

  it('expands with arrow keys, roves focus, selects a child, and returns to its parent', async () => {
    const wrapper = keep(mount(AppleTree, { attachTo: document.body, props: { items: [{ label: '项目', value: 'root', children: [{ label: '组件', value: 'child' }, { label: '隐藏', value: 'off', disabled: true }] }, { label: '归档', value: 'archive' }] } }))
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:expanded')).toEqual([[['root']]])
    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(4)
    await wrapper.get('[role="treeitem"]').trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    const child = wrapper.get('[role="treeitem"][aria-label="组件"]')
    expect(document.activeElement).toBe(child.element)
    await child.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['child']])
    await child.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('[role="treeitem"][aria-label="归档"]').element)
    await child.trigger('keydown', { key: 'ArrowLeft' })
    await nextTick()
    expect(document.activeElement).toBe(wrapper.get('[role="treeitem"][aria-label="项目"]').element)
  })
})

describe('AppleCarousel', () => {
  it('navigates with controls and keyboard while keeping offscreen slides inert', async () => {
    const wrapper = keep(mount(AppleCarousel, { props: { items: [{ label: '一', value: 1 }, { label: '二', value: 2 }] } }))
    expect(wrapper.get('[aria-label="上一张"]').attributes('disabled')).toBeDefined()
    await wrapper.get('[aria-label="下一张"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
    expect(wrapper.findAll('.apple-carousel__slide')[0]!.attributes('inert')).toBeDefined()
    expect(wrapper.findAll('.apple-carousel__slide')[1]!.attributes('inert')).toBeUndefined()
    await wrapper.get('.apple-carousel__track').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('reports a native horizontal scroll and uses slide-relative offsets', async () => {
    vi.useFakeTimers()
    const wrapper = keep(mount(AppleCarousel, { props: { items: [{ label: '一', value: 1 }, { label: '二', value: 2 }] } }))
    const track = wrapper.get('.apple-carousel__track').element as HTMLElement
    const slides = wrapper.findAll('.apple-carousel__slide')
    Object.defineProperty(track, 'offsetLeft', { value: 80 })
    Object.defineProperty(slides[0]!.element, 'offsetLeft', { value: 0 })
    Object.defineProperty(slides[1]!.element, 'offsetLeft', { value: 320 })
    track.scrollLeft = 320
    await wrapper.get('.apple-carousel__track').trigger('scroll')
    await vi.advanceTimersByTimeAsync(130)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
    await wrapper.get('[aria-label="上一张"]').trigger('click')
    expect(HTMLElement.prototype.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' })
  })
})

describe('Mobile patterns', () => {
  it('refreshes via touch and exposes a completion callback without duplicate refreshes', async () => {
    const wrapper = keep(mount(ApplePullRefresh, { props: { threshold: 50 }, slots: { default: '我的列表' } }))
    await wrapper.trigger('touchstart', { touches: [{ clientY: 0, clientX: 0 }] })
    await wrapper.trigger('touchmove', { touches: [{ clientY: 130, clientX: 0 }] })
    expect(wrapper.get('.apple-pull-refresh__indicator').text()).toBe('松开刷新')
    await wrapper.trigger('touchend')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
    const done = wrapper.emitted('refresh')![0]![0] as () => void
    done()
    await nextTick()
    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('does not capture horizontal gestures or trigger refresh below threshold', async () => {
    const wrapper = keep(mount(ApplePullRefresh))
    await wrapper.trigger('touchstart', { touches: [{ clientY: 0, clientX: 0 }] })
    await wrapper.trigger('touchmove', { touches: [{ clientY: 15, clientX: 60 }] })
    await wrapper.trigger('touchend')
    expect(wrapper.emitted('refresh')).toBeUndefined()
    await wrapper.trigger('touchstart', { touches: [{ clientY: 0, clientX: 0 }] })
    await wrapper.trigger('touchmove', { touches: [{ clientY: 10, clientX: 0 }] })
    await wrapper.trigger('touchend')
    expect(wrapper.emitted('refresh')).toBeUndefined()
  })

  it('loads once per in-flight request, retries an error, and stops when finished', async () => {
    const wrapper = keep(mount(AppleInfiniteScroll))
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(wrapper.text()).toContain('正在加载')
    await wrapper.setProps({ error: '网络不可用' })
    expect(wrapper.text()).toContain('网络不可用')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
    const done = wrapper.emitted('retry')![0]![0] as () => void
    await wrapper.setProps({ error: false, finished: true })
    done()
    await nextTick()
    expect(wrapper.text()).toContain('已经到底了')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('uses IntersectionObserver and disconnects it on unmount', async () => {
    let notify: IntersectionObserverCallback | undefined
    const observe = vi.fn(); const unobserve = vi.fn(); const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { notify = callback }
      observe = observe
      unobserve = unobserve
      disconnect = disconnect
    })
    const wrapper = mount(AppleInfiniteScroll)
    expect(observe).toHaveBeenCalledOnce()
    notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    notify!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    await nextTick()
    expect(wrapper.emitted('load')).toHaveLength(1)
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('offers a keyboard-operable swipe action entry and honors disabled', async () => {
    const wrapper = keep(mount(AppleSwipeCell, { slots: { default: '订单', actions: '<button type="button">删除</button>' } }))
    expect(wrapper.get('.apple-swipe-cell__actions').attributes('inert')).toBeDefined()
    expect(wrapper.get('.apple-swipe-cell__actions').attributes('aria-hidden')).toBe('true')
    await wrapper.get('[aria-label="更多操作"]').trigger('click')
    expect(wrapper.get('.apple-swipe-cell__actions').attributes('inert')).toBeUndefined()
    expect(wrapper.get('.apple-swipe-cell__actions').attributes('aria-hidden')).toBe('false')
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.get('[aria-label="更多操作"]').attributes('aria-expanded')).toBe('false')
    await wrapper.setProps({ disabled: true })
    await wrapper.trigger('touchstart', { touches: [{ clientX: 100, clientY: 0 }] })
    await wrapper.trigger('touchend', { changedTouches: [{ clientX: 0, clientY: 0 }] })
    expect(wrapper.get('[aria-label="更多操作"]').attributes('aria-expanded')).toBe('false')
  })
})

describe('Status and utility components', () => {
  it('emits breadcrumb navigation with its original item and event without requiring href', async () => {
    const wrapper = keep(mount(AppleBreadcrumbs, { props: { items } }))
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')?.[0]?.[0]).toEqual(items[0])
    expect(wrapper.emitted('click')?.[0]?.[1]).toBeInstanceOf(MouseEvent)
    expect(wrapper.get('[aria-current="page"]').text()).toBe('详细参数')
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('supports horizontal timelines and structured skeleton variants', () => {
    const timeline = keep(mount(AppleTimeline, { props: { items, orientation: 'horizontal' } }))
    expect(timeline.classes()).toContain('apple-timeline--horizontal')
    const table = keep(mount(AppleSkeleton, { props: { variant: 'table', rows: 2, columns: 3 } }))
    expect(table.findAll('.apple-skeleton__table-row')).toHaveLength(3)
    expect(table.findAll('.apple-skeleton__block')).toHaveLength(9)
    const list = keep(mount(AppleSkeleton, { props: { variant: 'list', rows: 2, lines: 2 } }))
    expect(list.findAll('.apple-skeleton__row')).toHaveLength(2)
    expect(list.findAll('.apple-skeleton__avatar')).toHaveLength(2)
    const card = keep(mount(AppleSkeleton, { props: { variant: 'card', width: 320 } }))
    expect(card.find('.apple-skeleton__image').exists()).toBe(true)
    expect(card.attributes('style')).toContain('width: 320px')
  })

  it('retains list selection events when a filtered list changes size', async () => {
    const wrapper = keep(mount(AppleList, { props: { items, selectable: true } }))
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['details'])
    await wrapper.setProps({ items: [items[2]!] })
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.find('.apple-list-size').exists()).toBe(true)
  })

  it('positions back-to-top after floating actions without double fixed positioning', async () => {
    const wrapper = keep(mount(AppleFloatingGroup, { props: { threshold: 0 }, slots: { default: () => h('button', '帮助') } }))
    await nextTick()
    expect(wrapper.findAll('button').at(-1)?.attributes('aria-label')).toBe('回到顶部')
    expect(wrapper.get('.apple-back-top').classes()).not.toContain('apple-back-top--fixed')
    const standalone = keep(mount(AppleBackTop, { props: { threshold: 0 } }))
    await nextTick()
    expect(standalone.get('button').classes()).toContain('apple-back-top--fixed')
    await wrapper.setProps({ backTop: false })
    expect(wrapper.find('.apple-back-top').exists()).toBe(false)
  })

  it('falls back after an avatar error and resets when src changes', async () => {
    const wrapper = keep(mount(AppleAvatar, { props: { src: '/missing.png', name: '张三' } }))
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('张三')
    await wrapper.setProps({ src: '/new.png' })
    expect(wrapper.get('img').attributes('src')).toBe('/new.png')
  })

  it('caps badge display but retains the full accessible value, and clamps progress', () => {
    const badge = keep(mount(AppleBadge, { props: { value: 150 } }))
    expect(badge.text()).toBe('99+')
    expect(badge.get('[role="status"]').attributes('aria-label')).toBe('150 条消息')
    const progress = keep(mount(AppleProgress, { props: { modelValue: 150, max: 100 } }))
    expect(progress.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(progress.get('.apple-progress__fill').attributes('style')).toContain('width: 100%')
  })

  it('pauses the marquee and hides duplicate content from assistive technology', async () => {
    const wrapper = keep(mount(AppleMarquee, { props: { text: '本周新品' } }))
    expect(wrapper.get('[aria-hidden="true"][inert]').text()).toBe('本周新品')
    await wrapper.get('button').trigger('click')
    expect(wrapper.classes()).toContain('is-paused')
    expect(wrapper.get('button').attributes('aria-label')).toBe('开始滚动')
  })

  it('listens to a custom scroll target and scrolls it to top', async () => {
    const target = document.createElement('div')
    target.id = 'scroll-area'
    target.scrollTop = 500
    document.body.appendChild(target)
    const wrapper = keep(mount(AppleBackTop, { props: { target: '#scroll-area', threshold: 300 } }))
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(true)
    await wrapper.get('button').trigger('click')
    expect(target.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    target.scrollTop = 0
    target.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { AppleTable } from '../src/components/content'

let wrapper: VueWrapper | undefined
const rows = Array.from({ length: 10_000 }, (_, id) => ({ id, name: `Item ${id}`, score: id }))
const columns = [{ key: 'name', label: 'Name' }, { key: 'score', label: 'Score', sortable: true }]

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(240)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(640)
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn(function (this: HTMLElement, options: ScrollToOptions) { this.scrollTop = options.top ?? 0; this.dispatchEvent(new Event('scroll')) }) })
})

afterEach(() => { wrapper?.unmount(); wrapper = undefined; vi.restoreAllMocks() })

describe('AppleTable virtual rows', () => {
  it('updates virtual measurements when reactive rows are appended in place', async () => {
    const changing = reactive(rows.slice(0, 20))
    wrapper = mount(AppleTable, { props: { rows: changing, columns, virtual: true, height: 240 } })
    await nextTick()
    const initialHeight = (wrapper.vm as unknown as { virtualizer: { getTotalSize(): number } }).virtualizer.getTotalSize()
    changing.push(...rows.slice(20, 40))
    await nextTick()
    expect((wrapper.vm as unknown as { virtualizer: { getTotalSize(): number } }).virtualizer.getTotalSize()).toBe(initialHeight + 20 * 48)
    expect(wrapper.get('table').attributes('aria-rowcount')).toBe('41')
  })

  it('renders a bounded window and updates indices after scrolling', async () => {
    wrapper = mount(AppleTable, { props: { rows, columns, virtual: true, height: 240, rowHeight: 48, overscan: 2 } })
    await nextTick()
    expect(wrapper.findAll('tbody tr[aria-rowindex]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('tbody tr[aria-rowindex]').length).toBeLessThan(15)
    expect(wrapper.get('table').attributes('aria-rowcount')).toBe('10001')
    const scroll = wrapper.get('.apple-table__scroll')
    ;(scroll.element as HTMLElement).scrollTop = 24000
    await scroll.trigger('scroll')
    await nextTick()
    expect(Number(wrapper.get('tbody tr[aria-rowindex]').attributes('aria-rowindex'))).toBeGreaterThan(400)
    expect(wrapper.findAll('tbody tr[aria-rowindex]').length).toBeLessThan(15)
    expect(wrapper.findAll('.apple-table__spacer')).toHaveLength(2)
  })

  it('sorts the complete data set, not only mounted rows, and resets the scroll window', async () => {
    wrapper = mount(AppleTable, { props: { rows, columns, virtual: true, height: 240 } })
    await nextTick()
    await wrapper.get('.apple-table__sort').trigger('click')
    await wrapper.get('.apple-table__sort').trigger('click')
    await nextTick()
    expect(wrapper.get('tbody tr[aria-rowindex]').text()).toContain('Item 9999')
    expect(wrapper.findAll('tbody tr[aria-rowindex]').length).toBeLessThan(20)
    await wrapper.setProps({ rows: [] })
    expect(wrapper.get('.apple-table__empty').text()).toBe('暂无数据')
  })

  it('supports toggling virtualization without losing the page selection model', async () => {
    wrapper = mount(AppleTable, { props: { rows: rows.slice(0, 30), columns, selectable: true, virtual: true, height: 240, pageSize: 20 } })
    await nextTick()
    await wrapper.get('thead input').setValue(true)
    expect((wrapper.emitted('update:selected')?.at(-1)?.[0] as number[]).length).toBe(20)
    await wrapper.setProps({ virtual: false })
    expect(wrapper.findAll('tbody tr[aria-rowindex]')).toHaveLength(20)
    expect(wrapper.findAll('tbody tr.is-selected')).toHaveLength(20)
  })
})

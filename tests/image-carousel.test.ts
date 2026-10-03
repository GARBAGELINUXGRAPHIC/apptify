// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AppleImage } from '../src/components/foundation'

const slides = [{ value: 1, label: '一', description: '第一张' }, { value: 2, label: '二', description: '第二张' }, { value: 3, label: '三' }]
const wrappers: ReturnType<typeof mount>[] = []
function carousel(extra = {}) {
  const wrapper = mount(AppleImage, { props: { carousel: true, gallery: slides, motion: 'none', ...extra }, slots: { item: ({ item, index, active }: any) => h('article', [h('strong', item.label), h('button', { 'data-active': active, 'data-index': index }, '详情')]) } })
  wrappers.push(wrapper)
  const track = wrapper.get('.apple-image__gallery').element as HTMLElement
  Object.defineProperties(track, { clientWidth: { configurable: true, value: 320 }, scrollWidth: { configurable: true, value: slides.length * 320 } })
  Array.from(track.children).forEach((slide, index) => Object.defineProperties(slide, { offsetLeft: { configurable: true, value: index * 320 }, offsetWidth: { configurable: true, value: 320 } }))
  return wrapper
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', undefined)
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn(function(this: HTMLElement, options: ScrollToOptions) { this.scrollLeft = options.left ?? 0 }) })
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('AppleImage carousel mode', () => {
  it('reuses image navigation for controls, keyboard, custom slides and inert state', async () => {
    const wrapper = carousel({ label: '精选内容', galleryLayout: 'tiled' })
    expect(wrapper.attributes('data-gallery-layout')).toBe('compact')
    expect(wrapper.attributes('aria-roledescription')).toBe('轮播图')
    expect(wrapper.attributes('aria-label')).toBe('精选内容')
    expect(wrapper.find('img').exists()).toBe(false)
    await nextTick()
    await wrapper.get('[aria-label="下一张图片"]').trigger('click')
    expect(wrapper.emitted('update:index')?.at(-1)).toEqual([1])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([1])
    const groups = wrapper.findAll('.apple-image__slide')
    expect(groups[0]!.attributes('inert')).toBeDefined()
    expect(groups[1]!.attributes('inert')).toBeUndefined()
    expect(groups[1]!.find('button').attributes('data-active')).toBe('true')
    await wrapper.get('.apple-image__gallery').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:index')?.at(-1)).toEqual([0])
    await wrapper.get('[aria-label="查看三"]').trigger('click')
    expect(wrapper.emitted('update:index')?.at(-1)).toEqual([2])
    expect(wrapper.get('[aria-label="下一张图片"]').attributes('disabled')).toBeDefined()
  })

  it('reports native scroll from slide-relative offsets without waiting on a timer', async () => {
    const wrapper = carousel()
    await nextTick()
    const track = wrapper.get('.apple-image__gallery').element as HTMLElement
    Object.defineProperty(track, 'offsetLeft', { value: 80 })
    track.scrollLeft = 640
    await wrapper.get('.apple-image__gallery').trigger('scroll')
    expect(wrapper.emitted('update:index')?.at(-1)).toEqual([2])
    await wrapper.get('[aria-label="上一张图片"]').trigger('click')
    expect(track.scrollLeft).toBe(320)
  })

  it('follows controlled index and repositions after gallery shrink', async () => {
    const wrapper = carousel({ index: 2 })
    await nextTick()
    const track = wrapper.get('.apple-image__gallery').element as HTMLElement
    expect(track.scrollLeft).toBe(640)
    await wrapper.setProps({ index: 1 })
    await nextTick()
    expect(track.scrollLeft).toBe(320)
    await wrapper.setProps({ gallery: slides.slice(0, 1) })
    await nextTick()
    expect(wrapper.attributes('data-index')).toBe('0')
    expect(wrapper.findAll('.apple-image__slide')).toHaveLength(1)
    expect(wrapper.get('.apple-image__slide').attributes('inert')).toBeUndefined()
  })

  it('blocks navigation, keyboard and pointer dragging when disabled', async () => {
    const wrapper = carousel({ disabled: true })
    await nextTick()
    expect(wrapper.get('.apple-image__gallery').attributes('tabindex')).toBe('-1')
    expect(wrapper.findAll('.apple-image__dot').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    await wrapper.get('.apple-image__gallery').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.get('.apple-image__gallery').trigger('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 200 })
    expect(wrapper.vm.galleryDrag).toBeNull()
    expect(wrapper.emitted('update:index')).toBeUndefined()
  })

  it('renders image metadata captions and keeps normal image previews unchanged', () => {
    const wrapper = mount(AppleImage, { props: { carousel: true, gallery: [{ src: '/one.jpg', label: '标题', description: '介绍' }, { src: '/two.jpg', label: '第二张' }] } })
    wrappers.push(wrapper)
    expect(wrapper.find('.apple-image__slide-caption').text()).toBe('标题介绍')
    expect(wrapper.get('img').attributes('alt')).toBe('标题')
    expect(wrapper.get('[aria-label="查看标题"]').attributes('aria-controls')).toBe(wrapper.get('.apple-image__gallery').attributes('id'))
    const normal = mount(AppleImage, { props: { gallery: [{src:'/one.jpg',alt:'普通图片'}, '/two.jpg'] } })
    wrappers.push(normal)
    expect(normal.find('.apple-image__slide').exists()).toBe(false)
    expect(normal.attributes('aria-roledescription')).toBeUndefined()
    expect(normal.get('[aria-label="放大图片：普通图片"]').element.tagName).toBe('BUTTON')
  })

  it('ignores a saved scroll callback after unmounting', () => {
    const wrapper = carousel(), onScroll = wrapper.vm.scrolled
    wrapper.unmount()
    wrappers.pop()
    expect(() => onScroll()).not.toThrow()
  })
})

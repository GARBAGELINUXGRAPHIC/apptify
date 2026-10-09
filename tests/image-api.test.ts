// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import * as api from '../src/index'
import { AppleImage } from '../src/components/foundation'

const wrappers: ReturnType<typeof mount>[] = []
function image(props = {}, attrs = {}) {
  const wrapper = mount(AppleImage, { props: { motion: 'none', ...props }, attrs })
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()))

describe('AppleImage public API', () => {
  it('does not export or register either viewer name', () => {
    for (const name of ['AppleImageViewer', 'InternalImageViewer']) {
      expect(api).not.toHaveProperty(name)
      expect(api.components).not.toHaveProperty(name)
      expect(api.overlayComponents).not.toHaveProperty(name)
    }
    expect(api.components.AppleImage).toBe(AppleImage)
    expect(AppleImage.props).not.toHaveProperty('src')
    expect(AppleImage.props).not.toHaveProperty('alt')
  })

  for (const array of [false, true]) {
    it(`normalizes a single ${array ? 'array' : 'object'} with metadata and no arrows`, async () => {
      const entry = { src: '/one.jpg', alt: '描述', title: '标题', width: 400, height: 300 }
      const wrapper = image({ gallery: array ? [entry] : entry, index: 99 })
      expect(wrapper.get('img').attributes('alt')).toBe('描述')
      expect(wrapper.get('img').attributes('width')).toBe('400')
      expect(wrapper.attributes('data-index')).toBe('0')
      expect(wrapper.find('.apple-image__arrows').exists()).toBe(false)
      await wrapper.get('.apple-image__trigger').trigger('click')
      expect(wrapper.find('.apple-image-viewer').exists()).toBe(true)
      expect(wrapper.find('[aria-label="上一张"]').exists()).toBe(false)
      expect(wrapper.find('[aria-label="下一张"]').exists()).toBe(false)
      await wrapper.get('[aria-label="关闭图片预览"]').trigger('click')
      await flushPromises()
      expect(wrapper.find('.apple-image-viewer').exists()).toBe(false)
    })
  }

  it('ignores empty entries and legacy attributes without inventing a source', async () => {
    const wrapper = image({ gallery: ['', {}, { src: ' ' }, null] }, { src: '/legacy.jpg', alt: 'legacy', id: 'empty' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.attributes('src')).toBeUndefined()
    expect(wrapper.attributes('alt')).toBeUndefined()
    expect(wrapper.attributes('id')).toBe('empty')
    expect(wrapper.get('[aria-label="暂无图片"]').element.tagName).toBe('DIV')
    await wrapper.get('.apple-image__trigger').trigger('click')
    expect(wrapper.find('.apple-image-viewer').exists()).toBe(false)
    await wrapper.setProps({ gallery: { src: '/valid.jpg', alt: 'valid' } })
    expect(wrapper.get('img').attributes('src')).toBe('/valid.jpg')
    await wrapper.get('.apple-image__trigger').trigger('click')
    await wrapper.setProps({ gallery: [] })
    await flushPromises()
    expect(wrapper.find('.apple-image-viewer').exists()).toBe(false)
    expect(wrapper.attributes('data-index')).toBe('0')
  })

  it('defaults to zero and clamps controlled indices while preserving array metadata', async () => {
    const wrapper = image({ gallery: [{ src: '/one.jpg', alt: 'one' }, { src: '/two.jpg', alt: 'two' }] })
    expect(wrapper.attributes('data-index')).toBe('0')
    for (const [index, normalized] of [[20, 1], [-2, 0], [NaN, 0], [Infinity, 0], [1.9, 1]]) {
      await wrapper.setProps({ index })
      expect(wrapper.attributes('data-index')).toBe(String(normalized))
    }
    expect(wrapper.findAll('img').map(img => img.attributes('alt'))).toEqual(['one', 'two'])
    await wrapper.setProps({ gallery: [{ src: '/one.jpg', alt: 'one' }] })
    expect(wrapper.attributes('data-index')).toBe('0')
    expect(wrapper.find('.apple-image__arrows').exists()).toBe(false)
  })
})

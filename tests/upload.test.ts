import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { AppleUpload } from '../src/components/forms'

describe('AppleUpload whole dropzone', () => {
  it('opens once from padding, copy and icon, without nested buttons or label activation', async () => {
    const wrapper = mount(AppleUpload, { slots: { default: () => h('p', '拖放文件') } })
    const input = wrapper.get('input').element as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    await wrapper.get('.apple-upload').trigger('click')
    await wrapper.get('.apple-upload__trigger span').trigger('click')
    await wrapper.get('svg').trigger('click')
    await wrapper.get('p').trigger('click')
    expect(click).toHaveBeenCalledTimes(4)
    expect(wrapper.find('.apple-upload label').exists()).toBe(false)
    expect(wrapper.find('button button').exists()).toBe(false)
    expect(wrapper.get('.apple-upload').attributes('data-apple-ripple')).toBe('')
    wrapper.unmount()
  })

  it('supports Enter and Space without scroll, repeat activation or child key activation', async () => {
    const wrapper = mount(AppleUpload, { props: { label: '附件' } })
    const click = vi.spyOn(wrapper.get('input').element as HTMLInputElement, 'click')
    const zone = wrapper.get('.apple-upload')
    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      zone.element.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    }
    await zone.trigger('keydown', { key: ' ', repeat: true })
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    expect(click).toHaveBeenCalledTimes(2)
    expect(zone.attributes('tabindex')).toBe('0')
    expect(zone.attributes('aria-label')).toBe('附件')
    wrapper.unmount()
  })

  it('leaves nested operations and removal independent from the file chooser', async () => {
    const file = new File(['content'], 'file.txt')
    const action = vi.fn()
    const wrapper = mount(AppleUpload, { props: { modelValue: [file] }, slots: { default: () => [
      h('button', { onClick: action }, [h('span', '预览')]),
      h('a', { href: '#preview' }, '链接'),
      h('div', { role: 'button', tabindex: 0 }, '取消'),
      h('div', { contenteditable: '' }, '编辑'),
      h('input', { type: 'text' }), h('select'), h('textarea'),
    ] } })
    const click = vi.spyOn(wrapper.get('input[type=file]').element as HTMLInputElement, 'click')
    for (const selector of ['button span', 'a', '[role=button][tabindex="0"]:not(.apple-upload)', '[contenteditable]', 'input[type=text]', 'select', 'textarea']) await wrapper.get(selector).trigger('click')
    await wrapper.get('button[aria-label="移除 file.txt"]').trigger('click')
    expect(action).toHaveBeenCalledTimes(1)
    expect(click).not.toHaveBeenCalled()
    expect(wrapper.emitted('remove')?.[0]).toEqual([file])
    wrapper.unmount()
  })

  it.each(['disabled', 'loading'] as const)('ignores pointer, keyboard and dropped files while %s', async state => {
    const wrapper = mount(AppleUpload, { props: { [state]: true } })
    const click = vi.spyOn(wrapper.get('input').element as HTMLInputElement, 'click')
    const zone = wrapper.get('.apple-upload')
    await zone.trigger('click')
    await zone.trigger('keydown', { key: 'Enter' })
    await zone.trigger('drop', { dataTransfer: { files: [new File(['content'], 'file.txt')] } })
    expect(click).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(zone.attributes('aria-disabled')).toBe('true')
    expect(zone.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })
})

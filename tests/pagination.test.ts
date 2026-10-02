// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { ApplePagination } from '../src/components/content'

const props = { total: 250, pageSize: 10, modelValue: 12 }
describe('ApplePagination manual page draft', () => {
  it('preserves editing and only commits a validated Apply or Enter', async () => {
    const wrapper = mount(ApplePagination, { props })
    const input = wrapper.get('input')
    await input.setValue('2')
    await input.setValue('24')
    expect(wrapper.emitted('change')).toBeUndefined()
    expect((input.element as HTMLInputElement).value).toBe('24')
    await wrapper.get('.apple-pagination__jump button').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[24]])
    await wrapper.setProps({ modelValue: 24 })
    await input.setValue('03')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('change')).toEqual([[24], [3]])
    expect((input.element as HTMLInputElement).value).toBe('3')
    wrapper.unmount()
  })
  it('rejects empty, fractional, nonnumeric, negative and out-of-range input without replacing the draft', async () => {
    const wrapper = mount(ApplePagination, { props })
    for (const value of ['', '1.5', 'hello', '-1', '0', '26', '1e1', '9007199254740993']) {
      await wrapper.get('input').setValue(value)
      await wrapper.get('input').trigger('keydown', { key: 'Enter' })
      expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
      expect(wrapper.get('[role="alert"]').text()).toContain('1–25')
      expect((wrapper.get('input').element as HTMLInputElement).value).toBe(value)
    }
    expect(wrapper.emitted('change')).toBeUndefined()
    wrapper.unmount()
  })
  it('refreshes draft and clears obsolete errors when page bounds or selected page change', async () => {
    const wrapper = mount(ApplePagination, { props })
    await wrapper.get('input').setValue('99')
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    await wrapper.setProps({ total: 30 })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('3')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    await wrapper.setProps({ modelValue: 2 })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2')
    await wrapper.get('input').setValue('8')
    await wrapper.setProps({ pageSize: 5 })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('2')
    wrapper.unmount()
  })
  it('disables manual and numbered navigation when disabled or empty', async () => {
    const wrapper = mount(ApplePagination, { props: { ...props, disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.setProps({ disabled: false, total: 0 })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[aria-current="page"]').text()).toBe('1')
    await wrapper.setProps({ total: 20 })
    expect(wrapper.get('input').attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})

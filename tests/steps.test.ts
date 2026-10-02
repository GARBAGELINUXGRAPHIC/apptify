// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { AppleSteps } from '../src/components/content'
import { AppleButton } from '../src/components/button'

const items = [{ label: '选择', value: 0 }, { label: '确认', value: 1, description: '详情' }, { label: '完成', value: 2, disabled: true }]
describe('AppleSteps independent controls', () => {
  it('only circle and label select; layout and description are inert', async () => {
    const wrapper = mount(AppleSteps, { props: { items, clickable: true, modelValue: 1 } })
    await wrapper.get('li').trigger('click')
    await wrapper.get('.apple-steps__copy > span').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('.apple-steps__label').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[0]])
    await wrapper.findAllComponents(AppleButton)[1]!.trigger('click')
    expect(wrapper.emitted('change')).toEqual([[0], [1]])
    expect(wrapper.get('li[aria-current="step"]').text()).toContain('确认')
    expect(wrapper.findAllComponents(AppleButton)[0]!.props('variant')).toBe('outline')
    wrapper.unmount()
  })
  it('honors per-item and global disabled and renders nonclickable steps without buttons', async () => {
    const wrapper = mount(AppleSteps, { props: { items, clickable: true } })
    const last = wrapper.findAll('li')[2]!
    expect(last.attributes('aria-disabled')).toBe('true')
    for (const button of last.findAll('button')) expect(button.attributes('disabled')).toBeDefined()
    await last.get('.apple-steps__label').trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    await wrapper.setProps({ clickable: false, disabled: false })
    expect(wrapper.findAll('button')).toHaveLength(0)
    wrapper.unmount()
  })
})

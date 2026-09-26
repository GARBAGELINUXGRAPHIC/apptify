import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h } from 'vue'
import {
  AppleAutocomplete, AppleCascader, AppleCheckbox, AppleColorPicker,
  AppleDatePicker, AppleForm, AppleFormField, AppleInput, AppleOtpInput,
  AppleRadioGroup, AppleRate, AppleSegmentedControl, AppleSelect,
  AppleSlider, AppleStepper, AppleSwitch, AppleTextarea, AppleTimePicker,
  AppleUpload, formComponents,
} from '../src/components/forms'

describe('Apple form controls', () => {
  it('exports all 19 real components', () => {
    expect(Object.keys(formComponents)).toHaveLength(19)
    for (const [name, component] of Object.entries(formComponents)) {
      expect(component.name).toBe(name)
      expect(component.render).toBeTypeOf('function')
    }
  })

  it('associates input labels and messages and emits clear', async () => {
    const wrapper = mount(AppleInput, { props: { label: '姓名', hint: '公开显示', clearable: true, modelValue: '陈晨' } })
    const input = wrapper.get('input')
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-describedby')).toBe(wrapper.get('p').attributes('id'))
    await input.setValue('李明')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['李明'])
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    await wrapper.setProps({ error: '请输入姓名', loading: true })
    expect(input.attributes('aria-invalid')).toBe('true')
    expect((input.element as HTMLInputElement).disabled).toBe(true)
  })

  it('toggles password visibility without changing the value', async () => {
    const wrapper = mount(AppleInput, { props: { label: '密码', type: 'password', modelValue: 'private' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('input').attributes('type')).toBe('text')
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('provides textarea native limits and a counter', async () => {
    const wrapper = mount(AppleTextarea, { props: { label: '说明', modelValue: 'hello', maxlength: 20, counter: true } })
    expect(wrapper.get('textarea').attributes('maxlength')).toBe('20')
    expect(wrapper.get('.apple-field__counter').text()).toBe('5 / 20')
    await wrapper.get('textarea').setValue('updated')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['updated'])
  })

  it('preserves numeric select values and serializes the actual value', async () => {
    const wrapper = mount(AppleSelect, { props: { label: '容量', modelValue: 256, items: [{ label: '256 GB', value: 256 }, { label: '512 GB', value: 512 }] }, attrs: { name: 'capacity' } })
    await wrapper.get('select').setValue('1')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([512])
    expect(wrapper.get('input[type=hidden]').attributes('name')).toBe('capacity')
    expect((wrapper.get('input[type=hidden]').element as HTMLInputElement).value).toBe('256')
    expect(wrapper.get('select').attributes('name')).toBeUndefined()
  })

  it('supports combobox search, disabled options and keyboard selection', async () => {
    const wrapper = mount(AppleAutocomplete, { props: { label: '城市', items: [{ label: '北京', value: 'bj', disabled: true }, { label: '上海', value: 'sh' }, { label: '杭州', value: 'hz' }] } })
    const input = wrapper.get('input[role=combobox]')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toContain('option-1')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['sh'])
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.setValue('杭')
    expect(wrapper.findAll('[role=option]')).toHaveLength(1)
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['杭'])
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(input.attributes('aria-activedescendant')).toContain('option-0')
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role=listbox]').exists()).toBe(false)
  })

  it('requires a selected autocomplete option rather than arbitrary query text', async () => {
    const wrapper = mount(AppleAutocomplete, { props: { label: '城市', required: true, items: [{ label: '上海', value: 'sh' }] } })
    const input = wrapper.get('input[role=combobox]')
    await input.setValue('不存在的城市')
    expect((input.element as HTMLInputElement).checkValidity()).toBe(false)
    await wrapper.setProps({ modelValue: 'sh' })
    await input.trigger('focus')
    expect((input.element as HTMLInputElement).checkValidity()).toBe(true)
    await input.setValue('新城市')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('represents checkbox indeterminate state and switch state accessibly', async () => {
    const checkbox = mount(AppleCheckbox, { props: { label: '选择全部', indeterminate: true } })
    expect((checkbox.get('input').element as HTMLInputElement).indeterminate).toBe(true)
    expect(checkbox.get('input').attributes('aria-checked')).toBe('mixed')
    await checkbox.get('input').setValue(true)
    expect(checkbox.emitted('update:modelValue')?.at(-1)).toEqual([true])
    const toggle = mount(AppleSwitch, { props: { label: '通知', modelValue: true } })
    expect(toggle.get('input').attributes('role')).toBe('switch')
    await toggle.get('input').setValue(false)
    expect(toggle.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('implements radio and segmented groups as native mutually exclusive inputs', async () => {
    const props = { label: '配送', modelValue: 'pickup', items: [{ label: '到店', value: 'pickup' }, { label: '快递', value: 'delivery' }, { label: '不可用', value: 'disabled', disabled: true }] }
    for (const component of [AppleRadioGroup, AppleSegmentedControl]) {
      const wrapper = mount(component, { props })
      const radios = wrapper.findAll('input[type=radio]')
      expect(radios[0]!.attributes('name')).toBe(radios[1]!.attributes('name'))
      await radios[1]!.setValue(true)
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['delivery'])
      expect((radios[2]!.element as HTMLInputElement).disabled).toBe(true)
    }
  })

  it('keeps slider values numeric and rounds stepper arithmetic', async () => {
    const slider = mount(AppleSlider, { props: { label: '音量', modelValue: 20 } })
    await slider.get('input').setValue('35')
    expect(slider.emitted('update:modelValue')?.at(-1)).toEqual([35])
    const stepper = mount(AppleStepper, { props: { label: '数量', modelValue: 0.2, min: 0, max: 0.3, step: 0.1 } })
    await stepper.get('button[aria-label="增加"]').trigger('click')
    expect(stepper.emitted('update:modelValue')?.at(-1)).toEqual([0.3])
    await stepper.setProps({ modelValue: 0.3 })
    expect((stepper.get('button[aria-label="增加"]').element as HTMLButtonElement).disabled).toBe(true)
    await stepper.get('input').setValue('10')
    expect(stepper.emitted('update:modelValue')?.at(-1)).toEqual([0.3])
  })

  it('uses platform date, time and color pickers with v-model', async () => {
    const date = mount(AppleDatePicker, { props: { label: '日期', min: '2026-01-01' } })
    await date.get('input').setValue('2026-09-26')
    expect(date.emitted('update:modelValue')?.at(-1)).toEqual(['2026-09-26'])
    const time = mount(AppleTimePicker, { props: { label: '时间' } })
    await time.get('input').setValue('12:30')
    expect(time.emitted('update:modelValue')?.at(-1)).toEqual(['12:30'])
    const color = mount(AppleColorPicker, { props: { label: '颜色' } })
    await color.get('input').setValue('#ff0000')
    expect(color.emitted('update:modelValue')?.at(-1)).toEqual(['#ff0000'])
  })

  it('validates file types, size, counts and removal without uploading data', async () => {
    const file = new File(['valid'], 'photo.png', { type: 'image/png' })
    const invalid = new File(['no'], 'notes.txt', { type: 'text/plain' })
    const large = new File(['way too big'], 'large.png', { type: 'image/png' })
    const wrapper = mount(AppleUpload, { props: { label: '照片', multiple: true, accept: 'image/*', maxSize: 8, maxFiles: 1, required: true } })
    wrapper.vm.selectFiles([file, invalid, large])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[file]])
    expect(wrapper.emitted('reject')?.[0]?.[0]).toHaveLength(2)
    await wrapper.setProps({ modelValue: [file] })
    expect((wrapper.get('input[type=file]').element as HTMLInputElement).required).toBe(false)
    wrapper.vm.selectFiles([file])
    expect(wrapper.emitted('reject')).toHaveLength(1)
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    expect(wrapper.emitted('remove')?.[0]).toEqual([file])
  })

  it('supports file drop and ignores selection while disabled', async () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    const wrapper = mount(AppleUpload, { props: { label: '照片' } })
    await wrapper.get('.apple-upload').trigger('drop', { dataTransfer: { files: [file] } })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file]])
    await wrapper.setProps({ disabled: true })
    wrapper.vm.selectFiles([file])
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('preserves form values through async validation and avoids duplicate submits', async () => {
    let finish!: (value: boolean) => void
    const validator = vi.fn(() => new Promise<boolean>(resolve => { finish = resolve }))
    const wrapper = mount(AppleForm, { props: { validator }, slots: { default: () => h('input', { name: 'username', value: 'Chen' }) } })
    await wrapper.trigger('submit')
    expect(validator).toHaveBeenCalledTimes(1)
    expect((wrapper.get('fieldset').element as HTMLFieldSetElement).disabled).toBe(true)
    await wrapper.trigger('submit')
    expect(validator).toHaveBeenCalledTimes(1)
    finish(true)
    await flushPromises()
    expect((wrapper.emitted('submit')?.[0]?.[0] as FormData).get('username')).toBe('Chen')
    expect((wrapper.get('fieldset').element as HTMLFieldSetElement).disabled).toBe(false)
  })

  it('blocks invalid forms and renders custom validation errors', async () => {
    const required = mount(AppleForm, { slots: { default: () => h('input', { name: 'username', required: true }) } })
    await required.trigger('submit')
    expect(required.emitted('submit')).toBeUndefined()
    expect(required.emitted('invalid')?.[0]).toEqual([{ type: 'native' }])
    const custom = mount(AppleForm, { props: { validator: () => '名称已存在' } })
    await custom.trigger('submit')
    await flushPromises()
    expect(custom.get('[role=alert]').text()).toBe('名称已存在')
    expect(custom.emitted('submit')).toBeUndefined()
  })

  it('passes field semantics to custom controls', () => {
    const wrapper = mount(AppleFormField, { props: { label: '邮箱', error: '无效的邮箱', for: 'email' }, slots: { default: props => h('input', props) } })
    expect(wrapper.get('input').attributes('id')).toBe('email')
    expect(wrapper.get('input').attributes('aria-describedby')).toBe('email-message')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('handles OTP paste, completion and backspace', async () => {
    const wrapper = mount(AppleOtpInput, { props: { length: 4, modelValue: '' } })
    await wrapper.findAll('input')[0]!.trigger('paste', { clipboardData: { getData: () => '12a34' } })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1234'])
    expect(wrapper.emitted('complete')?.at(-1)).toEqual(['1234'])
    await wrapper.setProps({ modelValue: '1234' })
    await wrapper.findAll('input')[3]!.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['123'])
    expect(wrapper.findAll('input')[0]!.attributes('autocomplete')).toBe('one-time-code')
  })

  it('replaces cascader descendants when a parent changes', async () => {
    const wrapper = mount(AppleCascader, { props: { label: '地区', name: 'region', modelValue: ['zj', 'hz'], items: [{ label: '浙江', value: 'zj', children: [{ label: '杭州', value: 'hz' }] }, { label: '上海', value: 'sh', children: [{ label: '浦东', value: 'pd' }] }] } })
    expect(wrapper.findAll('select')).toHaveLength(2)
    expect(wrapper.findAll('input[type=hidden]')[1]!.attributes('name')).toBe('region[1]')
    await wrapper.findAll('select')[0]!.setValue('1')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['sh']])
    await wrapper.setProps({ modelValue: ['sh'] })
    expect(wrapper.findAll('select')[1]!.text()).toContain('浦东')
    await wrapper.findAll('select')[1]!.setValue('0')
    expect(wrapper.emitted('complete')?.at(-1)).toEqual([['sh', 'pd']])
  })

  it('supports keyboard rating, clear and read-only mode', async () => {
    const wrapper = mount(AppleRate, { props: { modelValue: 3 } })
    expect(wrapper.findAll('[role=radio]').filter(button => button.attributes('tabindex') === '0')).toHaveLength(1)
    await wrapper.findAll('button')[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([4])
    await wrapper.findAll('button')[2]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    await wrapper.setProps({ readonly: true })
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppleDatePicker } from '../src/components/forms'
import { AppleTabBar } from '../src/components/content'

afterEach(() => vi.useRealTimers())

describe('AppleDatePicker', () => {
  it('uses the shared TabBar for linked panels, keyboard switching, and retained draft values', async () => {
    const wrapper = mount(AppleDatePicker, { props: { type: 'datetime-local', modelValue: '2026-09-26T12:30', motion: 'none' } })
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    expect(wrapper.findComponent(AppleTabBar).props('motion')).toBe('none')
    const [date, time] = wrapper.findAll('[role=tab]')
    expect(wrapper.get('[role=tabpanel]').attributes('aria-labelledby')).toBe(date!.attributes('id'))
    await date!.trigger('keydown', { key: 'ArrowRight' })
    expect(time!.attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[role=tabpanel]').attributes('id')).toBe(time!.attributes('aria-controls'))
    expect((wrapper.get('.apple-calendar__time-column input').element as HTMLInputElement).value).toBe('12')
    await time!.trigger('keydown', { key: 'Home' })
    expect(wrapper.get('.apple-calendar__day.is-selected').attributes('data-date')).toBe('2026-09-26')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('freezes readable mount-time placeholders and does not use native pickers', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 8, 26, 12, 34, 56))
    const wrapper = mount(AppleDatePicker, { props: { format: 'YYYY/MM/DD HH:mm:ss', label: '到店日期' } })
    expect(wrapper.findAll('.apple-date-segment').map(input => input.attributes('placeholder'))).toEqual(['2026', '09', '26', '12', '34', '56'])
    vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 0))
    await wrapper.setProps({ label: '新的标签' })
    expect(wrapper.get('[data-part=year]').attributes('placeholder')).toBe('2026')
    expect(wrapper.find('input[type=date], input[type=time], input[type=datetime-local]').exists()).toBe(false)
    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('[data-part=year]').attributes('id'))
    wrapper.unmount()
  })

  it.each([
    ['YYYY/MM', ['year', 'month'], '2026-09'],
    ['y/m/d', ['year', 'month', 'day'], '2026-09-26'],
    ['YYYY/MM/DD HH:mm', ['year', 'month', 'day', 'hour', 'minute'], '2026-09-26T12:34'],
    ['ymdhms', ['year', 'month', 'day', 'hour', 'minute', 'second'], '2026-09-26T12:34:56'],
    ['HH:mm', ['hour', 'minute'], '12:34'],
    ['hms', ['hour', 'minute', 'second'], '12:34:56'],
  ])('accepts %s granularity and preserves canonical values', async (format, parts, value) => {
    const wrapper = mount(AppleDatePicker, { props: { format, modelValue: value }, attrs: { name: 'date' } })
    expect(wrapper.findAll('.apple-date-segment').map(input => input.attributes('data-part'))).toEqual(parts)
    expect((wrapper.get('input[type=hidden]').element as HTMLInputElement).value).toBe(value)
    const last = wrapper.findAll('.apple-date-segment').at(-1)!
    await last.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([value])
    wrapper.unmount()
  })

  it('limits every segment and never changes focus while entering digits', async () => {
    const wrapper = mount(AppleDatePicker, { attachTo: document.body, props: { format: 'YYYY/MM/DD HH:mm:ss', modelValue: '2026-09-26T12:34:56' } })
    const year = wrapper.get('[data-part=year]')
    ;(year.element as HTMLInputElement).focus()
    await year.setValue('222222')
    expect((year.element as HTMLInputElement).value).toBe('2222')
    expect(document.activeElement).toBe(year.element)
    for (const [part, upper] of [['month', '12'], ['day', '31'], ['hour', '23'], ['minute', '59'], ['second', '59']]) {
      const input = wrapper.get(`[data-part=${part}]`)
      ;(input.element as HTMLInputElement).focus()
      await input.setValue('99')
      expect((input.element as HTMLInputElement).value).toBe(upper)
      expect(document.activeElement).toBe(input.element)
    }
    wrapper.unmount()
  })

  it('limits February using leap years and clamps the day when a month changes', async () => {
    const wrapper = mount(AppleDatePicker, { props: { modelValue: '2024-02-29' } })
    await wrapper.get('[data-part=year]').setValue('2026')
    await wrapper.get('[data-part=year]').trigger('blur')
    expect((wrapper.get('[data-part=day]').element as HTMLInputElement).value).toBe('28')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-02-28'])
    wrapper.unmount()
  })

  it('blocks incomplete and out-of-range values during native form validation', async () => {
    const wrapper = mount(AppleDatePicker, { props: { required: true, min: '2026-01-01', max: '2026-12-31' } })
    const year = wrapper.get('[data-part=year]')
    expect((year.element as HTMLInputElement).checkValidity()).toBe(false)
    await year.setValue('2026')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    await wrapper.get('[data-part=month]').setValue('09')
    await wrapper.get('[data-part=day]').setValue('26')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-09-26'])
    expect((year.element as HTMLInputElement).checkValidity()).toBe(true)
    await year.setValue('2027')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect((year.element as HTMLInputElement).checkValidity()).toBe(false)
    wrapper.unmount()
  })

  it('renders complete dates, month/year navigation, and a second time tab', async () => {
    const wrapper = mount(AppleDatePicker, { props: { format: 'YYYY/MM/DD HH:mm', modelValue: '2026-09-26T12:30' } })
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    expect(wrapper.findAll('[role=tab]').map(tab => tab.text())).toEqual(['日期', '时间'])
    expect(wrapper.get('.apple-calendar__day.is-selected').attributes('data-date')).toBe('2026-09-26')
    await wrapper.get('.apple-calendar__heading').trigger('click')
    expect(wrapper.findAll('.apple-calendar__choice')).toHaveLength(12)
    await wrapper.get('.apple-calendar__heading').trigger('click')
    const year = wrapper.findAll('.apple-calendar__choice').find(button => button.text() === '2027')!
    await year.trigger('click')
    expect(wrapper.findAll('.apple-calendar__choice.is-selected')).toHaveLength(0)
    await wrapper.findAll('.apple-calendar__choice')[8]!.trigger('click')
    expect(wrapper.find('.apple-calendar__day.is-selected').exists()).toBe(false)
    await wrapper.get('[data-date="2027-09-26"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2027-09-26T12:30'])
    expect(wrapper.findAll('[role=tab]')[1]!.attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('.apple-calendar__time-column')).toHaveLength(2)
    wrapper.unmount()
  })

  it('animates hover trails except the exact selected date, not matching day numbers in other years', async () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }))
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const wrapper = mount(AppleDatePicker, { props: { modelValue: '2026-09-26' } })
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    const selected = wrapper.get('[data-date="2026-09-26"]')
    Object.defineProperty(selected.element, 'animate', { value: animate })
    await selected.trigger('pointerleave')
    expect(animate).not.toHaveBeenCalled()
    wrapper.vm.cursor = new Date(2027, 8, 1)
    await wrapper.vm.$nextTick()
    const nextYear = wrapper.get('[data-date="2027-09-26"]')
    Object.defineProperty(nextYear.element, 'animate', { value: animate })
    await nextYear.trigger('pointerleave')
    expect(animate).toHaveBeenCalledTimes(1)
    wrapper.unmount(); vi.unstubAllGlobals()
  })

  it('supports keyboard calendar movement and disabled dates', async () => {
    const wrapper = mount(AppleDatePicker, { attachTo: document.body, props: { modelValue: '2026-09-26', min: '2026-09-20', max: '2026-10-03' } })
    await wrapper.get('button[aria-label="打开日历"]').trigger('click')
    expect((wrapper.get('[data-date="2026-09-19"]').element as HTMLButtonElement).disabled).toBe(true)
    await wrapper.get('[data-date="2026-09-26"]').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(wrapper.get('[data-date="2026-09-27"]').element)
    await wrapper.get('[data-date="2026-09-27"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role=dialog]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('uses time-only granularity without a second component', async () => {
    const wrapper = mount(AppleDatePicker, { props: { granularity: 'hms', modelValue: '12:30:15' } })
    await wrapper.get('button[aria-label="选择时间"]').trigger('click')
    expect(wrapper.find('.apple-calendar__days').exists()).toBe(false)
    expect(wrapper.findAll('.apple-calendar__time-column')).toHaveLength(3)
    await wrapper.findAll('.apple-calendar__time-column')[0]!.findAll('button')[14]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['14:30:15'])
    wrapper.unmount()
  })
})

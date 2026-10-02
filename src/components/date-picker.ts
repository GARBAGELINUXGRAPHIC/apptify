import { isTouchDevice } from '../core/device'
import { defineComponent, h, useId, Transition, type PropType } from 'vue'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3 } from 'lucide-vue-next'
import { addDays, addMonths, format as formatDate, getDaysInMonth, startOfMonth, startOfWeek } from 'date-fns'
import { ripple } from '../core/motion'
import { AppleAutoSize } from './motion'
import { AppleTabBar } from './tabs'

type Part = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
type Parts = Record<Part, string>
type Segment = { part: Part; separator: string; width: number }
const labels: Record<Part, string> = { year: '年', month: '月', day: '日', hour: '时', minute: '分', second: '秒' }
const emptyParts = (): Parts => ({ year: '', month: '', day: '', hour: '', minute: '', second: '' })
const presets: Record<string, string> = { year: 'YYYY', month: 'YYYY/MM', day: 'YYYY/MM/DD', date: 'YYYY/MM/DD', hour: 'YYYY/MM/DD HH', minute: 'YYYY/MM/DD HH:mm', second: 'YYYY/MM/DD HH:mm:ss', hm: 'HH:mm', hms: 'HH:mm:ss', ym: 'YYYY/MM', ymd: 'YYYY/MM/DD', ymdhm: 'YYYY/MM/DD HH:mm', ymdhms: 'YYYY/MM/DD HH:mm:ss' }

// Lowercase m is a month before the hour segment and a minute after it.
function segmentsFor(pattern: string): Segment[] {
  const segments: Segment[] = []
  const matches = [...pattern.matchAll(/y+|M+|d+|h+|m+|s+/gi)]
  let time = false
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index]!, token = match[0]!, char = token[0]!.toLowerCase()
    if (char === 'h') time = true
    const part: Part = char === 'y' ? 'year' : char === 'd' ? 'day' : char === 'h' ? 'hour' : char === 's' ? 'second' : time ? 'minute' : 'month'
    if (segments.some(segment => segment.part === part)) continue
    const next = matches[index + 1]
    const separator = pattern.slice(match.index! + token.length, next ? next.index! : pattern.length)
    segments.push({ part, width: part === 'year' ? 4 : 2, separator })
  }
  return segments.length ? segments : segmentsFor('YYYY/MM/DD')
}
function dateParts(date: Date): Parts {
  return { year: String(date.getFullYear()).padStart(4, '0'), month: String(date.getMonth() + 1).padStart(2, '0'), day: String(date.getDate()).padStart(2, '0'), hour: String(date.getHours()).padStart(2, '0'), minute: String(date.getMinutes()).padStart(2, '0'), second: String(date.getSeconds()).padStart(2, '0') }
}
function dateFrom(parts: Parts, fallback: Date): Date {
  const date = new Date(fallback)
  date.setDate(1)
  date.setFullYear(Number(parts.year || fallback.getFullYear()), Number(parts.month || fallback.getMonth() + 1) - 1, Number(parts.day || 1))
  date.setHours(Number(parts.hour || 0), Number(parts.minute || 0), Number(parts.second || 0), 0)
  return date
}
function readParts(value: string, segments: Segment[]): Parts {
  const result = emptyParts(), numbers = value.match(/\d+/g) || []
  segments.forEach((segment, index) => { result[segment.part] = numbers[index] || '' })
  return result
}
function canonical(parts: Parts, segments: Segment[]): string {
  const present = (part: Part) => segments.some(segment => segment.part === part)
  const date = (['year', 'month', 'day'] as Part[]).filter(present).map(part => parts[part].padStart(part === 'year' ? 4 : 2, '0')).join('-')
  const time = (['hour', 'minute', 'second'] as Part[]).filter(present).map(part => parts[part].padStart(2, '0')).join(':')
  return date && time ? `${date}T${time}` : date || time
}
function hoverTrail(event: PointerEvent, selected: boolean) {
  const element = event.currentTarget as HTMLElement
  element.getAnimations?.().forEach(animation => animation.cancel())
  if (isTouchDevice.value || event.pointerType === 'touch' || selected || element.closest('[data-apple-motion="none"]') || element.closest('[data-apple-motion="reduced"]') || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const color = 'rgb(128 128 128 / 8%)'
  element.animate?.([{ backgroundColor: color }, { backgroundColor: 'transparent' }], { duration: 240, easing: 'ease-out' })
}

export const AppleDatePicker = defineComponent({
  name: 'AppleDatePicker', inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' }, label: { type: String, default: '' }, hint: { type: String, default: '' }, error: { type: String, default: '' }, disabled: Boolean, loading: Boolean, required: Boolean,
    min: String, max: String, format: String, granularity: String,
    type: { type: String as PropType<'date' | 'month' | 'datetime-local' | 'time'>, default: 'date' },
    motion: { type: String as PropType<'inherit' | 'auto' | 'full' | 'reduced' | 'none'>, default: 'inherit' },
  },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId(), now: new Date(), draft: emptyParts(), opened: false, tab: 'date', view: 'days', cursor: startOfMonth(new Date()), focusedDate: '', direction: 1, lastEmitted: null as string | null, outside: null as ((event: PointerEvent) => void) | null } },
  computed: {
    pattern(): string { return this.format || presets[this.granularity || ''] || (this.type === 'month' ? 'YYYY/MM' : this.type === 'datetime-local' ? 'YYYY/MM/DD HH:mm' : this.type === 'time' ? 'HH:mm' : 'YYYY/MM/DD') },
    segments(): Segment[] { return segmentsFor(this.pattern) },
    hasDate(): boolean { return this.segments.some(segment => ['year', 'month', 'day'].includes(segment.part)) },
    hasTime(): boolean { return this.segments.some(segment => ['hour', 'minute', 'second'].includes(segment.part)) },
    placeholderParts(): Parts { return dateParts(this.now) },
    selectedDate(): string { return this.draft.year && this.draft.month && this.draft.day ? `${this.draft.year.padStart(4, '0')}-${this.draft.month.padStart(2, '0')}-${this.draft.day.padStart(2, '0')}` : '' },
    dates(): Date[] { const start = startOfWeek(startOfMonth(this.cursor), { weekStartsOn: 0 }); return Array.from({ length: 42 }, (_, index) => addDays(start, index)) },
    years(): number[] { const start = Math.max(1, Math.floor(this.cursor.getFullYear() / 12) * 12); return Array.from({ length: 12 }, (_, index) => start + index).filter(year => year <= 9999) },
    id(): string { return String(this.$attrs.id || this.inputId) },
    validity(): string {
      if (!this.segments.some(segment => this.draft[segment.part])) return this.required ? '请选择日期或时间' : ''
      if (this.segments.some(segment => !this.draft[segment.part])) return '请填写完整的日期或时间'
      for (const { part } of this.segments) { const value = Number(this.draft[part]); if (value < this.lower(part) || value > this.upper(part)) return `请输入有效的${labels[part]}` }
      const value = canonical(this.draft, this.segments)
      if (this.min && value < this.normalizeBound(this.min)) return `不能早于 ${this.min}`
      if (this.max && value > this.normalizeBound(this.max)) return `不能晚于 ${this.max}`
      return ''
    },
  },
  watch: {
    modelValue(value: string) { if (value !== this.lastEmitted) this.sync(); this.lastEmitted = null; this.$nextTick(this.syncValidity) },
    pattern() { this.sync() },
    required() { this.$nextTick(this.syncValidity) }, min() { this.$nextTick(this.syncValidity) }, max() { this.$nextTick(this.syncValidity) },
    disabled(value: boolean) { if (value) this.opened = false }, loading(value: boolean) { if (value) this.opened = false },
  },
  created() { this.sync() },
  mounted() { this.syncValidity(); this.outside = (event: PointerEvent) => { if (!(this.$el as HTMLElement).contains(event.target as Node)) this.close() }; document.addEventListener('pointerdown', this.outside) },
  beforeUnmount() { if (this.outside) document.removeEventListener('pointerdown', this.outside) },
  methods: {
    lower(part: Part): number { return ['year', 'month', 'day'].includes(part) ? 1 : 0 },
    upper(part: Part): number { return part === 'year' ? 9999 : part === 'month' ? 12 : part === 'day' ? getDaysInMonth(dateFrom({ ...this.draft, day: '1' }, this.now)) : part === 'hour' ? 23 : 59 },
    normalizeBound(value: string): string { return canonical(readParts(value, this.segments), this.segments) },
    sync() { this.draft = readParts(this.modelValue, this.segments); const date = dateFrom(this.draft, this.now); this.cursor = startOfMonth(date); this.tab = this.hasDate ? 'date' : 'time'; this.view = this.segments.some(segment => segment.part === 'day') ? 'days' : this.segments.some(segment => segment.part === 'month') ? 'months' : 'years'; this.$nextTick(this.syncValidity) },
    syncValidity() { (this.$refs[`input-${this.segments[0]?.part}`] as HTMLInputElement | undefined)?.setCustomValidity(this.validity) },
    focus(part?: Part) { const target = part || this.segments[0]?.part; if (target) (this.$refs[`input-${target}`] as HTMLInputElement | undefined)?.focus() },
    emitValue(commit = false) { const value = this.validity ? '' : this.segments.every(segment => !this.draft[segment.part]) ? '' : canonical(this.draft, this.segments); this.lastEmitted = value; this.$emit('update:modelValue', value); if (commit && !this.validity) this.$emit('change', value); this.$nextTick(this.syncValidity) },
    input(part: Part, event: Event) {
      const input = event.target as HTMLInputElement, width = part === 'year' ? 4 : 2
      let value = input.value.replace(/\D/g, '').slice(0, width)
      if (value && Number(value) > this.upper(part)) value = String(this.upper(part))
      this.draft[part] = value; input.value = value
      this.emitValue()
    },
    commitPart(part: Part) { if (this.draft[part]) this.draft[part] = String(Math.max(this.lower(part), Math.min(this.upper(part), Number(this.draft[part])))).padStart(part === 'year' ? 4 : 2, '0'); if ((part === 'month' || part === 'year') && this.draft.day) this.draft.day = String(Math.min(this.upper('day'), Number(this.draft.day))).padStart(2, '0'); this.emitValue(true) },
    inputKey(part: Part, event: KeyboardEvent) {
      if (event.key === 'Escape') { this.close(); return }
      if (event.key === 'ArrowDown' && event.altKey) { event.preventDefault(); this.open(); return }
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
      event.preventDefault(); this.draft[part] = String(Math.max(this.lower(part), Math.min(this.upper(part), Number(this.draft[part] || this.placeholderParts[part]) + (event.key === 'ArrowUp' ? 1 : -1))))
      this.commitPart(part)
    },
    open() { if (this.disabled || this.loading) return; this.opened = true; this.cursor = startOfMonth(dateFrom(this.draft, this.now)); this.focusedDate = this.selectedDate || formatDate(this.now, 'yyyy-MM-dd') },
    close() { this.opened = false },
    fillDefaults() { for (const { part } of this.segments) if (!this.draft[part]) this.draft[part] = this.placeholderParts[part] },
    dateDisabled(date: Date): boolean {
      if (date.getFullYear() < 1 || date.getFullYear() > 9999) return true
      const dateOnly = formatDate(date, 'yyyy-MM-dd')
      const bound = (value: string) => value.replaceAll('/', '-').split(/[T ]/)[0]!
      return Boolean(this.min && dateOnly.slice(0, bound(this.min).length) < bound(this.min) || this.max && dateOnly.slice(0, bound(this.max).length) > bound(this.max))
    },
    chooseDate(date: Date) {
      if (this.dateDisabled(date)) return
      this.fillDefaults(); const parts = dateParts(date); this.draft.year = parts.year; this.draft.month = parts.month; this.draft.day = parts.day; this.cursor = startOfMonth(date); this.focusedDate = formatDate(date, 'yyyy-MM-dd'); this.emitValue(true)
      if (this.hasTime) this.tab = 'time'; else { this.close(); this.focus() }
    },
    chooseMonth(month: number) { const date = new Date(this.cursor); date.setMonth(month, 1); this.cursor = date; if (this.segments.some(segment => segment.part === 'day')) this.view = 'days'; else this.chooseDate(date) },
    chooseYear(year: number) { const date = new Date(this.cursor); date.setFullYear(year, date.getMonth(), 1); this.cursor = date; if (this.segments.some(segment => segment.part === 'month')) this.view = 'months'; else this.chooseDate(date) },
    move(direction: number) {
      this.direction = direction; const amount = this.view === 'days' ? direction : this.view === 'months' ? direction * 12 : direction * 144
      const next = addMonths(this.cursor, amount); if (next.getFullYear() >= 1 && next.getFullYear() <= 9999) this.cursor = next
    },
    calendarKey(date: Date, event: KeyboardEvent) {
      const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -date.getDay(), End: 6 - date.getDay() }
      if (event.key === 'Escape') { event.preventDefault(); this.close(); this.focus(); return }
      if (!(event.key in offsets) && !['PageUp', 'PageDown'].includes(event.key)) return
      event.preventDefault(); const next = event.key === 'PageUp' || event.key === 'PageDown' ? addMonths(date, (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1)) : addDays(date, offsets[event.key]!)
      if (next.getFullYear() < 1 || next.getFullYear() > 9999) return
      this.direction = next > date ? 1 : -1; this.cursor = startOfMonth(next); this.focusedDate = formatDate(next, 'yyyy-MM-dd')
      this.$nextTick(() => (this.$refs[`day-${this.focusedDate}`] as HTMLButtonElement)?.focus())
    },
    renderCalendar() {
      const year = this.cursor.getFullYear(), month = this.cursor.getMonth()
      const grid = this.view === 'days'
        ? h('div', { class: 'apple-calendar__days', role: 'grid', 'aria-label': `${year}年${month + 1}月` }, [
          h('div', { class: 'apple-calendar__weekdays', role: 'row' }, ['日', '一', '二', '三', '四', '五', '六'].map(day => h('span', { role: 'columnheader' }, day))),
          ...Array.from({ length: 6 }, (_, week) => h('div', { class: 'apple-calendar__week', role: 'row' }, this.dates.slice(week * 7, week * 7 + 7).map(date => { const key = formatDate(date, 'yyyy-MM-dd'), selected = key === this.selectedDate, disabled = this.dateDisabled(date); return h('span', { role: 'gridcell', 'aria-selected': selected }, ripple(h('button', { key, ref: `day-${key}`, type: 'button', disabled, tabindex: key === this.focusedDate ? 0 : -1, 'data-date': key, 'aria-label': formatDate(date, 'yyyy年M月d日'), 'aria-current': key === formatDate(this.now, 'yyyy-MM-dd') ? 'date' : undefined, class: ['apple-calendar__day', { 'is-selected': selected, 'is-other-month': date.getMonth() !== month }], onClick: () => this.chooseDate(date), onPointerleave: (event: PointerEvent) => hoverTrail(event, selected), onKeydown: (event: KeyboardEvent) => this.calendarKey(date, event) }, date.getDate().toString()), !disabled)) }))),
        ])
        : h('div', { class: 'apple-calendar__choices', role: 'group', 'aria-label': this.view === 'months' ? '选择月份' : '选择年份' }, (this.view === 'months' ? Array.from({ length: 12 }, (_, index) => index) : this.years).map(value => { const selected = this.view === 'months' ? year === Number(this.draft.year) && value + 1 === Number(this.draft.month) : value === Number(this.draft.year); return ripple(h('button', { type: 'button', class: ['apple-calendar__choice', { 'is-selected': selected }], 'aria-pressed': selected, onPointerleave: (event: PointerEvent) => hoverTrail(event, selected), onClick: () => this.view === 'months' ? this.chooseMonth(value) : this.chooseYear(value) }, this.view === 'months' ? `${value + 1}月` : String(value))) }))
      return h('div', { class: 'apple-calendar' }, [
        h('div', { class: 'apple-calendar__header' }, [
          ripple(h('button', { type: 'button', class: 'apple-calendar__heading', onClick: () => { this.view = this.view === 'days' ? 'months' : this.view === 'months' ? 'years' : 'days' } }, [this.view === 'days' ? `${year}年${month + 1}月` : this.view === 'months' ? `${year}年` : `${this.years[0]} – ${this.years.at(-1)}`, h(ChevronDown, { size: 16 })])),
          ripple(h('button', { type: 'button', class: 'apple-field__icon', 'aria-label': this.view === 'days' ? '上个月' : '上一页', onClick: () => this.move(-1) }, h(ChevronLeft, { size: 18 }))),
          ripple(h('button', { type: 'button', class: 'apple-field__icon', 'aria-label': this.view === 'days' ? '下个月' : '下一页', onClick: () => this.move(1) }, h(ChevronRight, { size: 18 }))),
        ]),
        h(AppleAutoSize, {}, { default: () => h(Transition, { name: this.direction > 0 ? 'apple-calendar-forward' : 'apple-calendar-backward', mode: 'out-in' }, { default: () => h('div', { key: `${this.view}-${year}-${month}`, class: 'apple-calendar__page' }, grid) }) }),
      ])
    },
    renderTime() {
      return h('div', { class: 'apple-calendar__time' }, this.segments.filter(segment => ['hour', 'minute', 'second'].includes(segment.part)).map(({ part }) => h('label', { class: 'apple-calendar__time-column' }, [h('span', labels[part]), h('input', { type: 'text', inputmode: 'numeric', maxlength: 2, class: 'apple-control', 'aria-label': labels[part], value: this.draft[part], placeholder: this.placeholderParts[part], onFocus: (event: FocusEvent) => (event.target as HTMLInputElement).select(), onInput: (event: Event) => { this.fillDefaults(); this.input(part, event) }, onBlur: () => this.commitPart(part), onKeydown: (event: KeyboardEvent) => this.inputKey(part, event) }), h('div', { class: 'apple-calendar__time-values' }, Array.from({ length: this.upper(part) + 1 }, (_, value) => ripple(h('button', { type: 'button', 'aria-pressed': this.draft[part] !== '' && Number(this.draft[part]) === value, class: { 'is-selected': this.draft[part] !== '' && Number(this.draft[part]) === value }, onClick: () => { this.fillDefaults(); this.draft[part] = String(value).padStart(2, '0'); this.emitValue(true) } }, String(value).padStart(2, '0')))))])))
    },
  },
  render() {
    const message = this.error || this.hint, inactive = this.disabled || this.loading
    const panel = this.opened && !inactive ? h('div', { class: 'apple-date-menu', role: 'dialog', 'aria-label': this.label || '选择日期与时间', id: `${this.id}-calendar` }, [
      this.hasDate && this.hasTime
        ? h(AppleTabBar, { class: 'apple-calendar__tabs', label: '日期与时间', motion: this.motion, modelValue: this.tab, items: [{ value: 'date', label: '日期' }, { value: 'time', label: '时间' }], 'onUpdate:modelValue': (value: string | number) => { this.tab = String(value) } }, { 'panel-date': () => this.renderCalendar(), 'panel-time': () => this.renderTime() })
        : this.hasDate ? this.renderCalendar() : this.renderTime(),
      h('div', { class: 'apple-calendar__footer' }, [h('button', { type: 'button', class: 'apple-calendar__text', onClick: () => { this.draft = emptyParts(); this.emitValue(true) } }, '清除'), h('button', { type: 'button', class: 'apple-calendar__text', disabled: this.hasDate && this.dateDisabled(this.now), onClick: () => { this.draft = dateParts(this.now); this.cursor = startOfMonth(this.now); this.emitValue(true) } }, this.hasDate ? '今天' : '现在'), ripple(h('button', { type: 'button', class: 'apple-calendar__done', onClick: () => { this.close(); this.focus() } }, '完成'))]),
    ]) : null
    return h('div', { class: ['apple-field', 'apple-date-field', this.$attrs.class, { 'has-error': !!this.error, 'is-disabled': inactive }], 'data-apple-motion': this.motion, 'data-apple-popup-open': this.opened ? true : undefined, onFocusout: (event: FocusEvent) => { if (event.relatedTarget && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) this.close() }, onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape') this.close() } }, [
      this.label ? h('label', { class: 'apple-field__label', for: this.id }, [this.label, this.required ? h('span', { 'aria-hidden': true, class: 'apple-field__required' }, ' *') : null]) : null,
      h('div', { class: 'apple-date-anchor' }, [
        h('div', { class: 'apple-date-input apple-input-wrap', role: 'group', 'aria-label': this.label || this.$attrs['aria-label'] || '日期与时间' }, [
          h('div', { class: 'apple-date-segments' }, this.segments.flatMap(({ part, separator, width }, index) => [h('input', { ...this.$attrs, class: 'apple-date-segment', id: index === 0 ? this.id : `${this.id}-${part}`, ref: `input-${part}`, name: undefined, type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: width, size: width, value: this.draft[part], placeholder: this.placeholderParts[part], disabled: inactive, required: this.required, 'data-part': part, 'aria-label': `${this.label || this.$attrs['aria-label'] || ''}${labels[part]}`, 'aria-invalid': this.error ? true : undefined, 'aria-describedby': message ? `${this.id}-message` : undefined, onFocus: (event: FocusEvent) => (event.target as HTMLInputElement).select(), onInput: (event: Event) => this.input(part, event), onBlur: () => this.commitPart(part), onKeydown: (event: KeyboardEvent) => this.inputKey(part, event) }), separator ? h('span', { class: 'apple-date-separator', 'aria-hidden': true }, separator) : null])),
          ripple(h('button', { type: 'button', class: 'apple-field__icon', disabled: inactive, 'aria-label': this.hasDate ? '打开日历' : '选择时间', 'aria-expanded': this.opened, 'aria-controls': `${this.id}-calendar`, onClick: () => this.opened ? this.close() : this.open() }, h(this.hasDate ? CalendarDays : Clock3, { size: 19 }))),
        ]),
        h(Transition, { name: 'apple-date-pop', onBeforeEnter: (element: Element) => { (element as HTMLElement).style.height = '0px' }, onEnter: (element: Element) => { const el = element as HTMLElement; void el.offsetHeight; el.style.height = `${el.scrollHeight}px` }, onAfterEnter: (element: Element) => { (element as HTMLElement).style.height = '' }, onBeforeLeave: (element: Element) => { const el = element as HTMLElement; el.style.height = `${el.getBoundingClientRect().height}px`; void el.offsetHeight }, onLeave: (element: Element) => { (element as HTMLElement).style.height = '0px' } }, { default: () => panel }),
      ]),
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue, disabled: inactive }) : null,
      message ? h('p', { id: `${this.id}-message`, class: ['apple-field__message', { 'is-error': !!this.error }], role: this.error ? 'alert' : undefined }, message) : null,
    ])
  },
})

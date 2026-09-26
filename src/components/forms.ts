import { defineComponent, h, useId, type PropType, type Slots, type VNodeChild } from 'vue'
import { Check, ChevronDown, Eye, EyeOff, LoaderCircle, Minus, Plus, Star, Upload, X } from 'lucide-vue-next'

export type AppleOptionValue = string | number
export interface AppleOption { label: string; value: AppleOptionValue; disabled?: boolean }
export interface AppleCascaderOption extends AppleOption { children?: AppleCascaderOption[] }
export interface AppleUploadRejection { file: File; reason: string }

const fieldProps = {
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  loading: Boolean,
  required: Boolean,
  motion: { type: String as PropType<'inherit' | 'auto' | 'full' | 'reduced' | 'none'>, default: 'inherit' },
}
const optionProps = {
  items: { type: Array as PropType<AppleOption[]>, default: () => [] },
  modelValue: { type: [String, Number] as PropType<AppleOptionValue | null>, default: null },
}
interface FieldVm {
  label: string; hint: string; error: string; disabled: boolean; loading: boolean
  required: boolean; motion: string; inputId: string
  $attrs: Record<string, unknown>; $slots: Slots
}
function fieldId(vm: FieldVm): string { return String(vm.$attrs.id || vm.inputId) }
function controlAttrs(vm: FieldVm) {
  return {
    ...vm.$attrs,
    id: fieldId(vm),
    disabled: vm.disabled || vm.loading,
    required: vm.required,
    'aria-label': vm.$attrs['aria-label'] || vm.label || undefined,
    'aria-invalid': vm.error ? true : undefined,
    'aria-busy': vm.loading || undefined,
    'aria-describedby': [vm.$attrs['aria-describedby'], (vm.error || vm.hint) ? `${fieldId(vm)}-message` : ''].filter(Boolean).join(' ') || undefined,
  }
}
function field(vm: FieldVm, control: VNodeChild, classes = '', error = vm.error): VNodeChild {
  return h('div', {
    class: ['apple-field', classes, { 'is-disabled': vm.disabled, 'has-error': !!error }],
    'data-apple-motion': vm.motion,
  }, [
    vm.label ? h('label', { class: 'apple-field__label', for: fieldId(vm) }, [vm.label, vm.required ? h('span', { 'aria-hidden': true, class: 'apple-field__required' }, ' *') : null]) : null,
    control,
    error || vm.hint ? h('p', { id: `${fieldId(vm)}-message`, class: ['apple-field__message', { 'is-error': !!error }], role: error ? 'alert' : undefined }, error || vm.hint) : null,
  ])
}
function spinner() { return h(LoaderCircle, { size: 18, class: 'apple-control__spinner', 'aria-hidden': true }) }
function numericValue(event: Event) { return Number((event.target as HTMLInputElement).value) }
function stringValue(event: Event) { return (event.target as HTMLInputElement).value }

export const AppleInput = defineComponent({
  name: 'AppleInput', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: [String, Number], default: '' }, type: { type: String, default: 'text' }, placeholder: String, clearable: Boolean },
  emits: ['update:modelValue', 'change', 'clear'],
  data() { return { inputId: useId(), passwordVisible: false } },
  methods: { focus() { (this.$refs.input as HTMLInputElement)?.focus() } },
  render() {
    return field(this, h('div', { class: 'apple-input-wrap' }, [
      this.$slots.prefix ? h('span', { class: 'apple-input__affix' }, this.$slots.prefix()) : null,
      h('input', { ...controlAttrs(this), ref: 'input', class: ['apple-control', this.$attrs.class], type: this.type === 'password' && this.passwordVisible ? 'text' : this.type, placeholder: this.placeholder, value: this.modelValue,
        onInput: (event: Event) => this.$emit('update:modelValue', stringValue(event)), onChange: (event: Event) => this.$emit('change', stringValue(event)),
      }),
      this.loading ? spinner() : null,
      this.clearable && String(this.modelValue).length ? h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': '清空', title: '清空', onClick: () => { this.$emit('update:modelValue', ''); this.$emit('clear'); this.focus() } }, h(X, { size: 16 })) : null,
      this.type === 'password' ? h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': this.passwordVisible ? '隐藏密码' : '显示密码', title: this.passwordVisible ? '隐藏密码' : '显示密码', 'aria-pressed': this.passwordVisible, onClick: () => { this.passwordVisible = !this.passwordVisible } }, h(this.passwordVisible ? EyeOff : Eye, { size: 18 })) : null,
      this.$slots.suffix ? h('span', { class: 'apple-input__affix' }, this.$slots.suffix()) : null,
    ]))
  },
})

export const AppleTextarea = defineComponent({
  name: 'AppleTextarea', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: String, default: '' }, placeholder: String, rows: { type: Number, default: 4 }, maxlength: Number, counter: Boolean, resize: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  methods: { focus() { (this.$refs.input as HTMLTextAreaElement)?.focus() } },
  render() {
    return field(this, [h('textarea', { ...controlAttrs(this), ref: 'input', class: ['apple-control', 'apple-textarea', this.$attrs.class], rows: this.rows, maxlength: this.maxlength, placeholder: this.placeholder, value: this.modelValue, style: { resize: this.resize ? 'vertical' : 'none' }, onInput: (event: Event) => this.$emit('update:modelValue', stringValue(event)), onChange: (event: Event) => this.$emit('change', stringValue(event)) }), this.counter ? h('span', { class: 'apple-field__counter' }, `${this.modelValue.length}${this.maxlength ? ` / ${this.maxlength}` : ''}`) : null])
  },
})

export const AppleSelect = defineComponent({
  name: 'AppleSelect', inheritAttrs: false,
  props: { ...fieldProps, ...optionProps, placeholder: { type: String, default: '请选择' } },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    const index = this.items.findIndex(item => item.value === this.modelValue)
    return field(this, h('div', { class: 'apple-select-wrap' }, [
      h('select', { ...controlAttrs(this), name: undefined, class: ['apple-control', 'apple-select', this.$attrs.class], value: index < 0 ? '' : String(index), onChange: (event: Event) => { const value = stringValue(event); const selected = value === '' ? null : this.items[Number(value)]?.value; this.$emit('update:modelValue', selected); this.$emit('change', selected) } }, [h('option', { value: '', disabled: this.required }, this.placeholder), ...this.items.map((item, i) => h('option', { value: String(i), disabled: item.disabled, key: `${typeof item.value}:${item.value}` }, item.label))]),
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue ?? '', disabled: this.disabled || this.loading }) : null,
      this.loading ? spinner() : h(ChevronDown, { size: 17, class: 'apple-select__chevron', 'aria-hidden': true }),
    ]))
  },
})

export const AppleAutocomplete = defineComponent({
  name: 'AppleAutocomplete', inheritAttrs: false,
  props: { ...fieldProps, ...optionProps, placeholder: { type: String, default: '搜索或选择' }, emptyText: { type: String, default: '没有匹配的选项' }, clearable: { type: Boolean, default: true }, filter: { type: Function as PropType<(query: string, item: AppleOption) => boolean>, default: (query: string, item: AppleOption) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()) } },
  emits: ['update:modelValue', 'change', 'search'],
  data() { return { inputId: useId(), query: '', opened: false, activeIndex: -1 } },
  computed: {
    filteredItems(): AppleOption[] { return this.items.filter(item => this.filter(this.query, item)) },
    selectedLabel(): string { return this.items.find(item => item.value === this.modelValue)?.label || '' },
  },
  watch: {
    modelValue() { if (!this.opened) this.query = this.selectedLabel; this.$nextTick(this.syncValidity) },
    required() { this.$nextTick(this.syncValidity) },
    items: { deep: true, handler() { if (!this.opened) this.query = this.selectedLabel; this.$nextTick(this.syncValidity) } },
  },
  mounted() { this.query = this.selectedLabel; this.syncValidity() },
  methods: {
    focus() { (this.$refs.input as HTMLInputElement)?.focus() },
    syncValidity() { (this.$refs.input as HTMLInputElement)?.setCustomValidity(this.required && !this.items.some(item => item.value === this.modelValue) ? '请选择一个选项' : '') },
    choose(item: AppleOption) { if (item.disabled || this.disabled || this.loading) return; this.$emit('update:modelValue', item.value); this.$emit('change', item.value); this.query = item.label; this.opened = false; this.activeIndex = -1; this.focus() },
    close() { this.opened = false; this.activeIndex = -1; this.query = this.selectedLabel },
    onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); this.close(); return }
      if (event.key === 'Enter' && this.opened) { event.preventDefault(); const item = this.filteredItems[this.activeIndex]; if (item) this.choose(item); return }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault(); this.opened = true
      const available = this.filteredItems.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0)
      if (!available.length) return
      const current = available.indexOf(this.activeIndex)
      this.activeIndex = current < 0 ? available[event.key === 'ArrowDown' ? 0 : available.length - 1]! : available[(current + (event.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length]!
      this.$nextTick(() => (this.$refs[`option-${this.activeIndex}`] as HTMLElement)?.scrollIntoView?.({ block: 'nearest' }))
    },
  },
  render() {
    return field(this, h('div', { class: 'apple-autocomplete', onFocusout: (event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.close() } }, [
      h('div', { class: 'apple-input-wrap' }, [
        h('input', { ...controlAttrs(this), ref: 'input', name: undefined, required: false, 'aria-required': this.required || undefined, class: ['apple-control', this.$attrs.class], role: 'combobox', autocomplete: 'off', placeholder: this.placeholder, value: this.query, 'aria-expanded': this.opened, 'aria-controls': `${this.inputId}-list`, 'aria-autocomplete': 'list', 'aria-activedescendant': this.opened && this.activeIndex >= 0 ? `${this.inputId}-option-${this.activeIndex}` : undefined,
          onFocus: () => { this.opened = true; this.query = ''; this.activeIndex = -1 },
          onInput: (event: Event) => { this.query = stringValue(event); this.opened = true; this.activeIndex = -1; if (this.modelValue !== null) this.$emit('update:modelValue', null); this.$emit('search', this.query) }, onKeydown: this.onKeydown,
        }),
        this.loading ? spinner() : this.clearable && this.modelValue !== null ? h('button', { type: 'button', class: 'apple-field__icon', 'aria-label': '清空', title: '清空', disabled: this.disabled, onClick: () => { this.$emit('update:modelValue', null); this.$emit('change', null); this.query = ''; this.focus() } }, h(X, { size: 16 })) : h(ChevronDown, { size: 17, class: 'apple-select__chevron', 'aria-hidden': true }),
      ]),
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue ?? '', disabled: this.disabled || this.loading }) : null,
      this.opened && !this.disabled ? h('ul', { id: `${this.inputId}-list`, role: 'listbox', class: 'apple-autocomplete__list', 'aria-label': this.label || this.$attrs['aria-label'] || '选项' }, this.filteredItems.length ? this.filteredItems.map((item, index) => h('li', { id: `${this.inputId}-option-${index}`, ref: `option-${index}`, role: 'option', key: `${typeof item.value}:${item.value}`, 'aria-selected': item.value === this.modelValue, 'aria-disabled': item.disabled || undefined, class: ['apple-autocomplete__option', { 'is-active': index === this.activeIndex, 'is-disabled': item.disabled }], onMousedown: (event: MouseEvent) => event.preventDefault(), onMouseenter: () => { if (!item.disabled) this.activeIndex = index }, onClick: () => this.choose(item) }, [h('span', item.label), item.value === this.modelValue ? h(Check, { size: 16, 'aria-hidden': true }) : null])) : [h('li', { class: 'apple-autocomplete__empty', role: 'presentation' }, this.emptyText)]) : null,
    ]))
  },
})

export const AppleCheckbox = defineComponent({
  name: 'AppleCheckbox', inheritAttrs: false,
  props: { ...fieldProps, modelValue: Boolean, indeterminate: Boolean },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    return h('div', { class: ['apple-field', { 'has-error': !!this.error, 'is-disabled': this.disabled }], 'data-apple-motion': this.motion }, [
      h('label', { class: 'apple-choice', for: fieldId(this) }, [h('input', { ...controlAttrs(this), type: 'checkbox', class: ['apple-checkbox', this.$attrs.class], checked: this.modelValue, indeterminate: this.indeterminate, 'aria-checked': this.indeterminate ? 'mixed' : this.modelValue, onChange: (event: Event) => { const checked = (event.target as HTMLInputElement).checked; this.$emit('update:modelValue', checked); this.$emit('change', checked) } }), h('span', { class: 'apple-choice__label' }, this.$slots.default?.() || this.label), this.loading ? spinner() : null]),
      this.error || this.hint ? h('p', { id: `${fieldId(this)}-message`, class: ['apple-field__message', { 'is-error': !!this.error }], role: this.error ? 'alert' : undefined }, this.error || this.hint) : null,
    ])
  },
})

export const AppleRadioGroup = defineComponent({
  name: 'AppleRadioGroup', inheritAttrs: false,
  props: { ...fieldProps, ...optionProps, inline: Boolean, name: String },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    return field(this, h('div', { ...controlAttrs(this), role: 'radiogroup', class: ['apple-radio-group', this.$attrs.class, { 'is-inline': this.inline }] }, this.items.map(item => h('label', { class: ['apple-choice', { 'is-disabled': item.disabled }] }, [h('input', { type: 'radio', class: 'apple-radio', name: this.name || this.inputId, value: item.value, checked: item.value === this.modelValue, disabled: this.disabled || this.loading || item.disabled, required: this.required, onChange: () => { this.$emit('update:modelValue', item.value); this.$emit('change', item.value) } }), h('span', { class: 'apple-choice__label' }, item.label)]))))
  },
})

export const AppleSwitch = defineComponent({
  name: 'AppleSwitch', inheritAttrs: false,
  props: { ...fieldProps, modelValue: Boolean }, emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    return h('div', { class: ['apple-field', { 'has-error': !!this.error, 'is-disabled': this.disabled }], 'data-apple-motion': this.motion }, [
      h('label', { class: 'apple-switch-row', for: fieldId(this) }, [h('span', { class: 'apple-switch' }, [h('input', { ...controlAttrs(this), role: 'switch', type: 'checkbox', class: this.$attrs.class, checked: this.modelValue, 'aria-checked': this.modelValue, onChange: (event: Event) => { const checked = (event.target as HTMLInputElement).checked; this.$emit('update:modelValue', checked); this.$emit('change', checked) } }), h('span', { class: 'apple-switch__track', 'aria-hidden': true }, this.loading ? spinner() : undefined)]), h('span', { class: 'apple-choice__label' }, this.$slots.default?.() || this.label)]),
      this.error || this.hint ? h('p', { id: `${fieldId(this)}-message`, class: ['apple-field__message', { 'is-error': !!this.error }], role: this.error ? 'alert' : undefined }, this.error || this.hint) : null,
    ])
  },
})

export const AppleSlider = defineComponent({
  name: 'AppleSlider', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: Number, default: 0 }, min: { type: Number, default: 0 }, max: { type: Number, default: 100 }, step: { type: Number, default: 1 }, showValue: { type: Boolean, default: true }, formatValue: { type: Function as PropType<(value: number) => string>, default: (value: number) => String(value) } },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  render() {
    const percentage = this.max <= this.min ? 0 : Math.max(0, Math.min(100, (this.modelValue - this.min) / (this.max - this.min) * 100))
    return field(this, h('div', { class: 'apple-slider-row' }, [h('input', { ...controlAttrs(this), type: 'range', class: ['apple-slider', this.$attrs.class], min: this.min, max: this.max, step: this.step, value: this.modelValue, 'aria-valuetext': this.formatValue(this.modelValue), style: { '--apple-slider-progress': `${percentage}%` }, onInput: (event: Event) => this.$emit('update:modelValue', numericValue(event)), onChange: (event: Event) => this.$emit('change', numericValue(event)) }), this.showValue ? h('output', { for: fieldId(this), class: 'apple-slider__value' }, this.formatValue(this.modelValue)) : null]))
  },
})

export const AppleStepper = defineComponent({
  name: 'AppleStepper', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: Number, default: 0 }, min: { type: Number, default: -Infinity }, max: { type: Number, default: Infinity }, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  methods: {
    update(value: number) { if (!Number.isFinite(value) || this.disabled || this.loading) return; const next = Math.max(this.min, Math.min(this.max, Number(value.toFixed(10)))); this.$emit('update:modelValue', next); this.$emit('change', next) },
  },
  render() {
    return field(this, h('div', { class: 'apple-stepper' }, [
      h('button', { type: 'button', class: 'apple-stepper__button', disabled: this.disabled || this.loading || this.modelValue <= this.min, 'aria-label': '减少', title: '减少', onClick: () => this.update(this.modelValue - this.step) }, h(Minus, { size: 18 })),
      h('input', { ...controlAttrs(this), class: ['apple-control', this.$attrs.class], type: 'number', inputmode: 'decimal', value: this.modelValue, min: Number.isFinite(this.min) ? this.min : undefined, max: Number.isFinite(this.max) ? this.max : undefined, step: this.step, onInput: (event: Event) => { const value = numericValue(event); if (stringValue(event).trim() && Number.isFinite(value) && value >= this.min && value <= this.max) this.$emit('update:modelValue', value) }, onChange: (event: Event) => { if (stringValue(event).trim()) this.update(numericValue(event)) } }),
      h('button', { type: 'button', class: 'apple-stepper__button', disabled: this.disabled || this.loading || this.modelValue >= this.max, 'aria-label': '增加', title: '增加', onClick: () => this.update(this.modelValue + this.step) }, h(Plus, { size: 18 })),
    ]))
  },
})

export const AppleSegmentedControl = defineComponent({
  name: 'AppleSegmentedControl', inheritAttrs: false,
  props: { ...fieldProps, ...optionProps, name: String }, emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    return field(this, h('div', { ...controlAttrs(this), role: 'radiogroup', class: ['apple-segmented', this.$attrs.class] }, this.items.map(item => h('label', { class: ['apple-segmented__item', { 'is-selected': item.value === this.modelValue, 'is-disabled': this.disabled || this.loading || item.disabled }] }, [h('input', { type: 'radio', class: 'apple-visually-hidden', name: this.name || this.inputId, checked: item.value === this.modelValue, value: item.value, required: this.required, disabled: this.disabled || this.loading || item.disabled, onChange: () => { this.$emit('update:modelValue', item.value); this.$emit('change', item.value) } }), h('span', item.label)]))))
  },
})

export const AppleDatePicker = defineComponent({
  name: 'AppleDatePicker', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: String, default: '' }, min: String, max: String, type: { type: String as PropType<'date' | 'month' | 'week' | 'datetime-local'>, default: 'date' } },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  render() { return field(this, h('input', { ...controlAttrs(this), class: ['apple-control', 'apple-date-input', this.$attrs.class], type: this.type, min: this.min, max: this.max, value: this.modelValue, onInput: (event: Event) => this.$emit('update:modelValue', stringValue(event)), onChange: (event: Event) => this.$emit('change', stringValue(event)) })) },
})

export const AppleTimePicker = defineComponent({
  name: 'AppleTimePicker', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: String, default: '' }, min: String, max: String, step: { type: Number, default: 60 } },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  render() { return field(this, h('input', { ...controlAttrs(this), class: ['apple-control', 'apple-date-input', this.$attrs.class], type: 'time', min: this.min, max: this.max, step: this.step, value: this.modelValue, onInput: (event: Event) => this.$emit('update:modelValue', stringValue(event)), onChange: (event: Event) => this.$emit('change', stringValue(event)) })) },
})

export const AppleColorPicker = defineComponent({
  name: 'AppleColorPicker', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: String, default: '#0071e3' }, showValue: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  render() { return field(this, h('div', { class: 'apple-color-row' }, [h('input', { ...controlAttrs(this), class: ['apple-color-picker', this.$attrs.class], type: 'color', value: this.modelValue, onInput: (event: Event) => this.$emit('update:modelValue', stringValue(event)), onChange: (event: Event) => this.$emit('change', stringValue(event)) }), this.showValue ? h('output', { for: fieldId(this), class: 'apple-color__value' }, this.modelValue.toUpperCase()) : null])) },
})

function acceptsFile(file: File, accept: string): boolean {
  if (!accept.trim()) return true
  return accept.toLowerCase().split(',').map(value => value.trim()).some(value => value.startsWith('.') ? file.name.toLowerCase().endsWith(value) : value.endsWith('/*') ? file.type.toLowerCase().startsWith(value.slice(0, -1)) : file.type.toLowerCase() === value)
}
function formatFileSize(size: number): string { return size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1024 / 1024).toFixed(1)} MB` }

export const AppleUpload = defineComponent({
  name: 'AppleUpload', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: Array as PropType<File[]>, default: () => [] }, accept: { type: String, default: '' }, multiple: Boolean, maxSize: { type: Number, default: Infinity }, maxFiles: { type: Number, default: Infinity }, capture: { type: String as PropType<'user' | 'environment'>, default: undefined }, buttonText: { type: String, default: '选择文件' } },
  emits: ['update:modelValue', 'change', 'reject', 'remove'],
  data() { return { inputId: useId(), dragDepth: 0, localError: '' } },
  watch: { modelValue() { this.syncFiles() } },
  mounted() { this.syncFiles() },
  methods: {
    syncFiles() {
      const input = this.$refs.input as HTMLInputElement | undefined
      if (!input) return
      if (!this.modelValue.length) { input.value = ''; return }
      if (typeof DataTransfer === 'undefined') return
      const transfer = new DataTransfer()
      this.modelValue.forEach(file => transfer.items.add(file))
      input.files = transfer.files
    },
    selectFiles(files: File[]) {
      if (this.disabled || this.loading) return
      const accepted: File[] = this.multiple ? [...this.modelValue] : []
      const rejected: AppleUploadRejection[] = []
      for (const file of files) {
        if (accepted.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) continue
        let reason = ''
        if (!acceptsFile(file, this.accept)) reason = '不支持此文件类型'
        else if (file.size > this.maxSize) reason = `文件不能超过 ${formatFileSize(this.maxSize)}`
        else if (accepted.length >= Math.min(this.maxFiles, this.multiple ? Infinity : 1)) reason = '已达到文件数量上限'
        if (reason) { rejected.push({ file, reason }); continue }
        accepted.push(file)
      }
      this.localError = rejected.map(item => `${item.file.name}: ${item.reason}`).join('；')
      if (rejected.length) this.$emit('reject', rejected)
      if (accepted.length || !files.length) { this.$emit('update:modelValue', accepted); this.$emit('change', accepted) }
    },
    remove(index: number) { if (this.disabled || this.loading) return; const files = this.modelValue.filter((_, i) => i !== index); this.localError = ''; this.$emit('update:modelValue', files); this.$emit('change', files); this.$emit('remove', this.modelValue[index]) },
  },
  render() {
    return field(this, [h('div', { class: ['apple-upload', { 'is-dragging': this.dragDepth > 0 }], onDragenter: (event: DragEvent) => { event.preventDefault(); if (!this.disabled && !this.loading) this.dragDepth++ }, onDragover: (event: DragEvent) => event.preventDefault(), onDragleave: (event: DragEvent) => { event.preventDefault(); this.dragDepth = Math.max(0, this.dragDepth - 1) }, onDrop: (event: DragEvent) => { event.preventDefault(); this.dragDepth = 0; this.selectFiles(Array.from(event.dataTransfer?.files || [])) } }, [
      h('input', { ...controlAttrs(this), ref: 'input', class: ['apple-visually-hidden', this.$attrs.class], type: 'file', required: this.required && !this.modelValue.length, accept: this.accept, multiple: this.multiple, capture: this.capture, 'aria-invalid': this.error || this.localError ? true : undefined, 'aria-describedby': this.error || this.localError || this.hint ? `${fieldId(this)}-message` : undefined, onChange: (event: Event) => { const input = event.target as HTMLInputElement; this.selectFiles(Array.from(input.files || [])); this.$nextTick(this.syncFiles) } }),
      h('label', { for: fieldId(this), class: ['apple-upload__trigger', { 'is-disabled': this.disabled || this.loading }] }, [this.loading ? spinner() : h(Upload, { size: 21, 'aria-hidden': true }), h('span', this.buttonText)]),
      this.$slots.default?.(),
    ]), this.modelValue.length ? h('ul', { class: 'apple-upload__files', 'aria-label': '已选择的文件' }, this.modelValue.map((file, index) => h('li', { class: 'apple-upload__file', key: `${file.name}-${file.lastModified}-${index}` }, [h('span', { class: 'apple-upload__file-name' }, file.name), h('span', { class: 'apple-upload__file-size' }, formatFileSize(file.size)), h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': `移除 ${file.name}`, title: `移除 ${file.name}`, onClick: () => this.remove(index) }, h(X, { size: 16 }))]))) : null], '', this.error || this.localError)
  },
})

export const AppleForm = defineComponent({
  name: 'AppleForm', inheritAttrs: false,
  props: { disabled: Boolean, loading: Boolean, validator: Function as PropType<(data: FormData) => boolean | string | Promise<boolean | string>>, motion: fieldProps.motion },
  emits: ['submit', 'invalid', 'reset'],
  data() { return { validating: false, validationError: '' } },
  methods: {
    async validate(): Promise<boolean> {
      const form = this.$refs.form as HTMLFormElement
      this.validationError = ''
      if (!form.reportValidity()) { this.$emit('invalid', { type: 'native' }); return false }
      if (!this.validator) return true
      this.validating = true
      try {
        const result = await this.validator(new FormData(form))
        if (result === true) return true
        this.validationError = typeof result === 'string' ? result : '请检查表单内容'
        this.$emit('invalid', { type: 'custom', message: this.validationError }); return false
      } catch (error) { this.validationError = error instanceof Error ? error.message : '验证失败，请重试'; this.$emit('invalid', { type: 'custom', message: this.validationError }); return false }
      finally { this.validating = false }
    },
    async submit() { if (this.disabled || this.loading || this.validating) return; const data = new FormData(this.$refs.form as HTMLFormElement); if (await this.validate()) this.$emit('submit', data) },
    reset() { (this.$refs.form as HTMLFormElement).reset() },
  },
  render() { return h('form', { ...this.$attrs, ref: 'form', class: ['apple-form', this.$attrs.class], novalidate: true, 'aria-busy': this.loading || this.validating || undefined, 'data-apple-motion': this.motion, onSubmit: (event: Event) => { event.preventDefault(); void this.submit() }, onReset: () => { this.validationError = ''; this.$emit('reset') } }, [h('fieldset', { class: 'apple-form__fields', disabled: this.disabled || this.loading || this.validating }, this.$slots.default?.({ loading: this.loading || this.validating })), this.validationError ? h('p', { class: 'apple-field__message is-error', role: 'alert' }, this.validationError) : null]) },
})

export const AppleFormField = defineComponent({
  name: 'AppleFormField', inheritAttrs: false,
  props: { ...fieldProps, for: String }, data() { return { inputId: useId() } },
  render() { const id = this.for || fieldId(this); return h('div', { ...this.$attrs, class: ['apple-field', this.$attrs.class, { 'has-error': !!this.error, 'is-disabled': this.disabled }], 'data-apple-motion': this.motion }, [this.label ? h('label', { for: id, class: 'apple-field__label' }, [this.label, this.required ? h('span', { class: 'apple-field__required', 'aria-hidden': true }, ' *') : null]) : null, this.$slots.default?.({ id, disabled: this.disabled || this.loading, required: this.required, 'aria-invalid': !!this.error, 'aria-describedby': this.error || this.hint ? `${id}-message` : undefined }), this.error || this.hint ? h('p', { class: ['apple-field__message', { 'is-error': !!this.error }], id: `${id}-message`, role: this.error ? 'alert' : undefined }, this.error || this.hint) : null]) },
})

export const AppleOtpInput = defineComponent({
  name: 'AppleOtpInput', inheritAttrs: false,
  props: { ...fieldProps, label: { type: String, default: '验证码' }, modelValue: { type: String, default: '' }, length: { type: Number, default: 6, validator: (value: number) => value > 0 && value <= 12 }, numeric: { type: Boolean, default: true }, name: String, mask: Boolean },
  emits: ['update:modelValue', 'change', 'complete'], data() { return { inputId: useId() } },
  methods: {
    focus(index = 0) { (this.$refs[`digit-${Math.max(0, Math.min(this.length - 1, index))}`] as HTMLInputElement)?.focus() },
    update(value: string) { const next = value.slice(0, this.length); this.$emit('update:modelValue', next); this.$emit('change', next); if (next.length === this.length) this.$emit('complete', next) },
    enter(value: string, index: number) { const normalized = this.numeric ? value.replace(/\D/g, '') : value.replace(/\s/g, ''); if (!normalized) return; const insertionIndex = Math.min(index, this.modelValue.length); this.update(this.modelValue.slice(0, insertionIndex) + normalized + this.modelValue.slice(insertionIndex + normalized.length)); this.focus(insertionIndex + normalized.length) },
    onKeydown(event: KeyboardEvent, index: number) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); this.focus(index + (event.key === 'ArrowRight' ? 1 : -1)) }
      else if (event.key === 'Backspace') { event.preventDefault(); const target = this.modelValue[index] ? index : Math.max(0, index - 1); this.update(this.modelValue.slice(0, target) + this.modelValue.slice(target + 1)); this.focus(target) }
      else if (event.key === 'Delete') { event.preventDefault(); this.update(this.modelValue.slice(0, index) + this.modelValue.slice(index + 1)) }
      else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); this.focus(event.key === 'Home' ? 0 : this.length - 1) }
    },
  },
  render() {
    return field(this, h('div', { class: ['apple-otp', this.$attrs.class], role: 'group', 'aria-label': this.label || this.$attrs['aria-label'], style: { '--apple-otp-length': Math.min(this.length, 6) } }, [
      ...Array.from({ length: this.length }, (_, index) => h('input', { ...controlAttrs(this), id: index === 0 ? fieldId(this) : `${fieldId(this)}-${index}`, ref: `digit-${index}`, class: 'apple-control apple-otp__digit', type: this.mask ? 'password' : 'text', inputmode: this.numeric ? 'numeric' : 'text', pattern: this.numeric ? '[0-9]*' : undefined, name: undefined, maxlength: this.length, autocomplete: index === 0 ? 'one-time-code' : 'off', value: this.modelValue[index] || '', 'aria-label': `${this.label || this.$attrs['aria-label'] || '验证码'}，第 ${index + 1} 位，共 ${this.length} 位`, onFocus: (event: FocusEvent) => (event.target as HTMLInputElement).select(), onInput: (event: Event) => { const input = event.target as HTMLInputElement; this.enter(input.value, index); input.value = this.modelValue[index] || '' }, onPaste: (event: ClipboardEvent) => { event.preventDefault(); this.enter(event.clipboardData?.getData('text') || '', index) }, onKeydown: (event: KeyboardEvent) => this.onKeydown(event, index) })),
      this.name ? h('input', { type: 'hidden', name: this.name, value: this.modelValue, disabled: this.disabled || this.loading }) : null,
    ]))
  },
})

export const AppleCascader = defineComponent({
  name: 'AppleCascader', inheritAttrs: false,
  props: { ...fieldProps, modelValue: { type: Array as PropType<AppleOptionValue[]>, default: () => [] }, items: { type: Array as PropType<AppleCascaderOption[]>, default: () => [] }, placeholder: { type: String, default: '请选择' }, levelLabels: { type: Array as PropType<string[]>, default: () => [] }, name: String },
  emits: ['update:modelValue', 'change', 'complete'], data() { return { inputId: useId() } },
  computed: {
    levels(): AppleCascaderOption[][] { const levels: AppleCascaderOption[][] = [this.items]; let items = this.items; for (const value of this.modelValue) { const selected = items.find(item => item.value === value); if (!selected?.children?.length) break; items = selected.children; levels.push(items) } return levels },
  },
  methods: {
    choose(level: number, optionIndex: string) { const option = this.levels[level]?.[Number(optionIndex)]; const path = this.modelValue.slice(0, level); if (optionIndex !== '' && option && !option.disabled) path.push(option.value); this.$emit('update:modelValue', path); this.$emit('change', path); if (optionIndex !== '' && option && !option.children?.length) this.$emit('complete', path) },
  },
  render() {
    return field(this, h('div', { class: ['apple-cascader', this.$attrs.class], role: 'group', 'aria-label': this.label || this.$attrs['aria-label'] }, [
      ...this.levels.map((items, level) => { const selectedIndex = items.findIndex(item => item.value === this.modelValue[level]); return h('div', { class: 'apple-select-wrap', key: level }, [h('select', { ...controlAttrs(this), id: level === 0 ? fieldId(this) : `${fieldId(this)}-${level}`, class: 'apple-control apple-select', name: undefined, value: selectedIndex < 0 ? '' : String(selectedIndex), 'aria-label': this.levelLabels[level] || `${this.label || this.$attrs['aria-label'] || '级联选择'} 第 ${level + 1} 级`, onChange: (event: Event) => this.choose(level, stringValue(event)) }, [h('option', { value: '', disabled: this.required }, this.levelLabels[level] || this.placeholder), ...items.map((item, index) => h('option', { value: String(index), disabled: item.disabled, key: `${typeof item.value}:${item.value}` }, item.label))]), this.name ? h('input', { type: 'hidden', name: `${this.name}[${level}]`, value: this.modelValue[level] ?? '', disabled: this.disabled || this.loading }) : null, h(ChevronDown, { size: 17, class: 'apple-select__chevron', 'aria-hidden': true })]) }),
    ]))
  },
})

export const AppleRate = defineComponent({
  name: 'AppleRate', inheritAttrs: false,
  props: { ...fieldProps, label: { type: String, default: '评分' }, modelValue: { type: Number, default: 0 }, max: { type: Number, default: 5 }, readonly: Boolean, allowClear: { type: Boolean, default: true }, name: String },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId(), hovered: 0 } },
  methods: {
    update(value: number) { if (this.disabled || this.loading || this.readonly) return; this.$emit('update:modelValue', value); this.$emit('change', value) },
    onKeydown(event: KeyboardEvent, value: number) { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 1 : event.key === 'End' ? this.max : Math.max(1, Math.min(this.max, value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1))); this.update(next); (this.$refs[`rating-${next}`] as HTMLButtonElement)?.focus() },
  },
  render() {
    return field(this, h('div', { ...controlAttrs(this), class: ['apple-rate', this.$attrs.class], role: 'radiogroup', 'aria-readonly': this.readonly || undefined, onMouseleave: () => { this.hovered = 0 } }, [
      ...Array.from({ length: Math.max(1, Math.min(10, this.max)) }, (_, index) => { const value = index + 1; return h('button', { type: 'button', ref: `rating-${value}`, class: ['apple-rate__star', { 'is-filled': value <= (this.hovered || this.modelValue) }], role: 'radio', 'aria-label': `${value} 星`, title: `${value} 星`, 'aria-checked': value === this.modelValue, disabled: this.disabled || this.loading, 'aria-disabled': this.readonly || undefined, tabindex: this.readonly ? -1 : value === (this.modelValue || 1) ? 0 : -1, onMouseenter: () => { if (!this.disabled && !this.loading && !this.readonly) this.hovered = value }, onClick: () => this.update(this.allowClear && value === this.modelValue ? 0 : value), onKeydown: (event: KeyboardEvent) => this.onKeydown(event, value) }, h(Star, { size: 26, 'aria-hidden': true })) }),
      this.name ? h('input', { type: 'hidden', name: this.name, value: this.modelValue, disabled: this.disabled || this.loading }) : null,
    ]))
  },
})

export const formComponents = { AppleInput, AppleTextarea, AppleSelect, AppleAutocomplete, AppleCheckbox, AppleRadioGroup, AppleSwitch, AppleSlider, AppleStepper, AppleSegmentedControl, AppleDatePicker, AppleTimePicker, AppleColorPicker, AppleUpload, AppleForm, AppleFormField, AppleOtpInput, AppleCascader, AppleRate }

import { isTouchDevice } from '../core/device'
import { defineComponent, h, useId, withDirectives, vShow, Transition, type PropType, type Slots, type VNodeChild } from 'vue'
import { Check, ChevronDown, Eye, EyeOff, LoaderCircle, Minus, Plus, Star, Upload, X } from 'lucide-vue-next'
import { AppleSelection, motionDuration, ripple } from '../core/motion'
import { appleKey, resolveMotion, type AppleContext } from '../core/context'
import { AppleAutoSize } from './motion'
import { AppleDatePicker } from './date-picker'
import { AppleButton } from './button'

export { AppleDatePicker } from './date-picker'

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

const interruptedMenuHeights = new WeakMap<Element, number>()
function freezeMenu(element: Element, activeClass: string) {
  const el = element as HTMLElement
  // Vue clears transition classes (and v-show's display) before cancellation hooks.
  el.style.display = ''
  el.classList.add(activeClass)
  const height = el.getBoundingClientRect().height
  el.style.height = `${height}px`
  el.classList.remove(activeClass)
  return height
}
function menuTransition(content: VNodeChild, persisted = false) {
  return h(Transition, {
    name: 'apple-field-menu',
    persisted,
    onBeforeEnter: (element: Element) => {
      (element as HTMLElement).style.height = `${interruptedMenuHeights.get(element) ?? 0}px`
      interruptedMenuHeights.delete(element)
    },
    onEnter: (element: Element) => {
      const el = element as HTMLElement
      const styles = getComputedStyle(el)
      const border = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth)
      void el.offsetHeight
      el.style.height = `${el.scrollHeight + border}px`
    },
    onAfterEnter: (element: Element) => { (element as HTMLElement).style.height = '' },
    onBeforeLeave: (element: Element) => {
      const el = element as HTMLElement
      el.style.height = `${el.getBoundingClientRect().height}px`
      void el.offsetHeight
    },
    onLeave: (element: Element) => { (element as HTMLElement).style.height = '0px' },
    onEnterCancelled: (element: Element) => { freezeMenu(element, 'apple-field-menu-enter-active') },
    onLeaveCancelled: (element: Element) => { interruptedMenuHeights.set(element, freezeMenu(element, 'apple-field-menu-leave-active')) },
  }, { default: () => content })
}

const colorMenuAnimations = new WeakMap<HTMLElement, { animation: Animation; finish: () => void }>()
function freezeColorMenu(element: Element) {
  const el = element as HTMLElement
  const state = colorMenuAnimations.get(el)
  if (!state) return
  const styles = getComputedStyle(el)
  el.style.clipPath = styles.clipPath
  el.style.transform = styles.transform
  state.animation.onfinish = null
  state.animation.cancel()
  colorMenuAnimations.delete(el)
  el.style.willChange = ''
}
function animateColorMenu(element: Element, opened: boolean, done: () => void) {
  const el = element as HTMLElement
  freezeColorMenu(el)
  const styles = getComputedStyle(el)
  const from = { clipPath: styles.clipPath === 'none' ? 'inset(0 0 0% 0)' : styles.clipPath, transform: styles.transform === 'none' ? 'translateY(0px)' : styles.transform }
  const to = { clipPath: `inset(0 0 ${opened ? 0 : 100}% 0)`, transform: `translateY(${opened ? 0 : -6}px)` }
  const duration = motionDuration(el)
  if (!duration || !el.animate) { Object.assign(el.style, to); done(); return }
  // Reveal the fixed-size panel without laying out the color controls every frame.
  el.style.willChange = 'clip-path, transform'
  const animation = el.animate([from, to], { duration, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'both' })
  const finish = () => {
    Object.assign(el.style, to)
    animation.onfinish = null
    animation.cancel()
    colorMenuAnimations.delete(el)
    el.style.willChange = ''
    done()
  }
  colorMenuAnimations.set(el, { animation, finish })
  animation.onfinish = finish
}
function colorMenuTransition(content: VNodeChild) {
  const reset = (element: Element) => { const el = element as HTMLElement; el.style.clipPath = ''; el.style.transform = '' }
  return h(Transition, {
    css: false, persisted: true,
    onBeforeEnter: (element: Element) => {
      const el = element as HTMLElement
      if (!el.style.clipPath) { el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transform = 'translateY(-6px)' }
    },
    onEnter: (element: Element, done: () => void) => animateColorMenu(element, true, done),
    onLeave: (element: Element, done: () => void) => animateColorMenu(element, false, done),
    onAfterEnter: reset, onAfterLeave: reset,
    onEnterCancelled: freezeColorMenu,
    onLeaveCancelled: (element: Element) => { (element as HTMLElement).style.display = ''; freezeColorMenu(element) },
  }, { default: () => content })
}

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
      this.clearable && String(this.modelValue).length ? ripple(h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': '清空', title: '清空', onClick: () => { this.$emit('update:modelValue', ''); this.$emit('clear'); this.focus() } }, h(X, { size: 16 }))) : null,
      this.type === 'password' ? ripple(h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': this.passwordVisible ? '隐藏密码' : '显示密码', title: this.passwordVisible ? '隐藏密码' : '显示密码', 'aria-pressed': this.passwordVisible, onClick: () => { this.passwordVisible = !this.passwordVisible } }, h(this.passwordVisible ? EyeOff : Eye, { size: 18 }))) : null,
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
  data() { return { inputId: useId(), opened: false, activeIndex: -1, keyboardActive: false, outside: null as ((event: PointerEvent) => void) | null } },
  watch: { modelValue() { this.syncValidity() }, required() { this.syncValidity() }, items: { deep: true, handler() { this.syncValidity() } }, disabled(value: boolean) { if (value) this.opened = false }, loading(value: boolean) { if (value) this.opened = false } },
  mounted() {
    this.syncValidity()
    this.outside = (event: PointerEvent) => { if (!(this.$el as HTMLElement).contains(event.target as Node)) this.opened = false }
    document.addEventListener('pointerdown', this.outside)
  },
  beforeUnmount() { if (this.outside) document.removeEventListener('pointerdown', this.outside) },
  methods: {
    focus() { (this.$refs.trigger as HTMLButtonElement)?.focus() },
    syncValidity() { (this.$refs.validation as HTMLInputElement)?.setCustomValidity(this.required && !this.items.some(item => item.value === this.modelValue && !item.disabled) ? '请选择一个选项' : '') },
    choose(item: AppleOption) { if (item.disabled || this.disabled || this.loading) return; this.$emit('update:modelValue', item.value); this.$emit('change', item.value); this.opened = false; this.focus() },
    onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); this.opened = false; return }
      if (event.key === 'Tab') { this.opened = false; return }
      if (this.opened && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); const item = this.items[this.activeIndex]; if (item) this.choose(item); return }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
      event.preventDefault(); this.opened = true; this.keyboardActive = true
      const available = this.items.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0)
      if (!available.length) return
      const current = available.indexOf(this.activeIndex)
      this.activeIndex = event.key === 'Home' ? available[0]! : event.key === 'End' ? available[available.length - 1]! : current < 0 ? available[event.key === 'ArrowDown' ? 0 : available.length - 1]! : available[(current + (event.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length]!
      this.$nextTick(() => (this.$refs[`option-${this.activeIndex}`] as HTMLElement)?.scrollIntoView?.({ block: 'nearest' }))
    },
  },
  render() {
    const selected = this.items.find(item => item.value === this.modelValue)
    return field(this, h('div', { class: 'apple-select-wrap', 'data-apple-popup-open': this.opened ? true : undefined, onFocusout: (event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.opened = false } }, [
      ripple(h('button', { ...controlAttrs(this), ref: 'trigger', type: 'button', name: undefined, class: ['apple-control', 'apple-select', this.$attrs.class], role: 'combobox', 'aria-expanded': this.opened, 'aria-haspopup': 'listbox', 'aria-controls': `${this.inputId}-list`, 'aria-activedescendant': this.opened && this.activeIndex >= 0 ? `${this.inputId}-option-${this.activeIndex}` : undefined, onClick: (event: MouseEvent) => { this.keyboardActive = event.detail === 0; this.opened = !this.opened; this.activeIndex = this.items.findIndex(item => item.value === this.modelValue) }, onKeydown: this.onKeydown }, h('span', { class: { 'is-placeholder': !selected } }, selected?.label || this.placeholder))),
      h('input', { ref: 'validation', class: 'apple-visually-hidden', tabindex: -1, 'aria-hidden': true, value: selected?.label || '', required: this.required, disabled: this.disabled || this.loading, onInvalid: (event: Event) => { event.preventDefault(); this.focus() } }),
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue ?? '', disabled: this.disabled || this.loading }) : null,
      this.loading ? spinner() : h(ChevronDown, { size: 17, class: ['apple-select__chevron', { 'is-open': this.opened }], 'aria-hidden': true }),
      menuTransition(this.opened && !this.disabled && !this.loading ? h('div', { class: 'apple-field-menu' }, [h(AppleAutoSize, {}, { default: () => h('ul', { id: `${this.inputId}-list`, role: 'listbox', class: 'apple-autocomplete__list', 'aria-label': this.label || this.$attrs['aria-label'] || '选项' }, this.items.map((item, index) => ripple(h('li', { id: `${this.inputId}-option-${index}`, ref: `option-${index}`, role: 'option', key: `${typeof item.value}:${item.value}`, 'aria-selected': item.value === this.modelValue, 'aria-disabled': item.disabled || undefined, class: ['apple-autocomplete__option', { 'is-active': index === this.activeIndex, 'is-keyboard-active': this.keyboardActive && index === this.activeIndex, 'is-disabled': item.disabled }], onMousedown: (event: MouseEvent) => event.preventDefault(), onPointermove: () => { this.keyboardActive = false }, onMouseenter: () => { this.keyboardActive = false; if (!isTouchDevice.value && !item.disabled) this.activeIndex = index }, onClick: () => this.choose(item) }, [h('span', item.label), item.value === this.modelValue ? h(Check, { size: 16, 'aria-hidden': true }) : null]), !item.disabled))) })]) : null),
    ]))
  },
})

export const AppleAutocomplete = defineComponent({
  name: 'AppleAutocomplete', inheritAttrs: false,
  props: { ...fieldProps, ...optionProps, placeholder: { type: String, default: '搜索或选择' }, emptyText: { type: String, default: '没有匹配的选项' }, clearable: { type: Boolean, default: true }, filter: { type: Function as PropType<(query: string, item: AppleOption) => boolean>, default: (query: string, item: AppleOption) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()) } },
  emits: ['update:modelValue', 'change', 'search'],
  data() { return { inputId: useId(), query: '', opened: false, activeIndex: -1, keyboardActive: false } },
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
      event.preventDefault(); this.opened = true; this.keyboardActive = true
      const available = this.filteredItems.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0)
      if (!available.length) return
      const current = available.indexOf(this.activeIndex)
      this.activeIndex = current < 0 ? available[event.key === 'ArrowDown' ? 0 : available.length - 1]! : available[(current + (event.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length]!
      this.$nextTick(() => (this.$refs[`option-${this.activeIndex}`] as HTMLElement)?.scrollIntoView?.({ block: 'nearest' }))
    },
  },
  render() {
    return field(this, h('div', { class: 'apple-autocomplete', 'data-apple-popup-open': this.opened ? true : undefined, onFocusout: (event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.close() } }, [
      h('div', { class: 'apple-input-wrap' }, [
        h('input', { ...controlAttrs(this), ref: 'input', name: undefined, required: false, 'aria-required': this.required || undefined, class: ['apple-control', this.$attrs.class], role: 'combobox', autocomplete: 'off', placeholder: this.placeholder, value: this.query, 'aria-expanded': this.opened, 'aria-controls': `${this.inputId}-list`, 'aria-autocomplete': 'list', 'aria-activedescendant': this.opened && this.activeIndex >= 0 ? `${this.inputId}-option-${this.activeIndex}` : undefined,
          onFocus: () => { this.opened = true; this.query = ''; this.activeIndex = -1; this.keyboardActive = false },
          onInput: (event: Event) => { this.query = stringValue(event); this.opened = true; this.activeIndex = -1; this.keyboardActive = false; if (this.modelValue !== null) this.$emit('update:modelValue', null); this.$emit('search', this.query) }, onKeydown: this.onKeydown,
        }),
        this.loading ? spinner() : this.clearable && this.modelValue !== null ? ripple(h('button', { type: 'button', class: 'apple-field__icon', 'aria-label': '清空', title: '清空', disabled: this.disabled, onClick: () => { this.$emit('update:modelValue', null); this.$emit('change', null); this.query = ''; this.focus() } }, h(X, { size: 16 }))) : h(ChevronDown, { size: 17, class: 'apple-select__chevron', 'aria-hidden': true }),
      ]),
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue ?? '', disabled: this.disabled || this.loading }) : null,
      menuTransition(this.opened && !this.disabled && !this.loading ? h('div', { class: 'apple-field-menu' }, [h(AppleAutoSize, {}, { default: () => h('ul', { id: `${this.inputId}-list`, role: 'listbox', class: 'apple-autocomplete__list', 'aria-label': this.label || this.$attrs['aria-label'] || '选项' }, this.filteredItems.length ? this.filteredItems.map((item, index) => ripple(h('li', { id: `${this.inputId}-option-${index}`, ref: `option-${index}`, role: 'option', key: `${typeof item.value}:${item.value}`, 'aria-selected': item.value === this.modelValue, 'aria-disabled': item.disabled || undefined, class: ['apple-autocomplete__option', { 'is-active': index === this.activeIndex, 'is-keyboard-active': this.keyboardActive && index === this.activeIndex, 'is-disabled': item.disabled }], onMousedown: (event: MouseEvent) => event.preventDefault(), onPointermove: () => { this.keyboardActive = false }, onMouseenter: () => { this.keyboardActive = false; if (!isTouchDevice.value && !item.disabled) this.activeIndex = index }, onClick: () => this.choose(item) }, [h('span', item.label), item.value === this.modelValue ? h(Check, { size: 16, 'aria-hidden': true }) : null]), !item.disabled)) : [h('li', { class: 'apple-autocomplete__empty', role: 'presentation' }, this.emptyText)]) })]) : null),
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
      ripple(h('button', { type: 'button', class: 'apple-stepper__button', disabled: this.disabled || this.loading || this.modelValue <= this.min, 'aria-label': '减少', title: '减少', onClick: () => this.update(this.modelValue - this.step) }, h(Minus, { size: 18 }))),
      h('input', { ...controlAttrs(this), class: ['apple-control', this.$attrs.class], type: 'number', inputmode: 'decimal', value: this.modelValue, min: Number.isFinite(this.min) ? this.min : undefined, max: Number.isFinite(this.max) ? this.max : undefined, step: this.step, onInput: (event: Event) => { const value = numericValue(event); if (stringValue(event).trim() && Number.isFinite(value) && value >= this.min && value <= this.max) this.$emit('update:modelValue', value) }, onChange: (event: Event) => { if (stringValue(event).trim()) this.update(numericValue(event)) } }),
      ripple(h('button', { type: 'button', class: 'apple-stepper__button', disabled: this.disabled || this.loading || this.modelValue >= this.max, 'aria-label': '增加', title: '增加', onClick: () => this.update(this.modelValue + this.step) }, h(Plus, { size: 18 }))),
    ]))
  },
})

export const AppleSegmentedControl = defineComponent({
  name: 'AppleSegmentedControl', inheritAttrs: false,
  inject: { apple: { from: appleKey, default: null } },
  props: { ...fieldProps, ...optionProps, name: String }, emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId() } },
  render() {
    return field(this, withDirectives(h('div', { ...controlAttrs(this), role: 'radiogroup', 'data-apple-scheme': (this.apple as AppleContext | null)?.theme.value.current.scheme ?? 'light', class: ['apple-segmented', this.$attrs.class] }, this.items.map(item => h('label', { key: `${typeof item.value}:${item.value}`, 'data-apple-selected': item.value === this.modelValue, class: ['apple-segmented__item', { 'is-selected': item.value === this.modelValue, 'is-disabled': this.disabled || this.loading || item.disabled }] }, [h('input', { type: 'radio', class: 'apple-visually-hidden', name: this.name || this.inputId, checked: item.value === this.modelValue, value: item.value, required: this.required, disabled: this.disabled || this.loading || item.disabled, onChange: () => { this.$emit('update:modelValue', item.value); this.$emit('change', item.value) } }), h('span', item.label)]))), [[AppleSelection]]))
  },
})

export const AppleColorPicker = defineComponent({
  name: 'AppleColorPicker', inheritAttrs: false,
  inject: { apple: { from: appleKey, default: null } },
  props: { ...fieldProps, modelValue: { type: String, default: '#0071e3' }, showValue: { type: Boolean, default: true } },
  emits: ['update:modelValue', 'change'],
  data() { return { inputId: useId(), opened: false, draft: this.modelValue, draftDirty: false, hexError: '', composing: false, hsv: hexToHsv(this.modelValue), dragging: false, pointerId: null as number | null, outside: null as ((event: PointerEvent) => void) | null } },
  computed: { motionMode() { const context = this.apple as AppleContext | null; return resolveMotion(this.motion, context?.motion.value.mode, context?.motion.value.reduced) } },
  watch: {
    modelValue(value: string) { if (!this.draftDirty && !this.composing) this.draft = value; const next = hexToHsv(value); if (next.s > 0 && next.v > 0) this.hsv.h = next.h; this.hsv.s = next.s; this.hsv.v = next.v },
    disabled(value: boolean) { if (value) this.close() }, loading(value: boolean) { if (value) this.close() },
    motionMode(mode: string) { if (mode !== 'full') colorMenuAnimations.get(this.$refs.menu as HTMLElement)?.finish() },
  },
  mounted() { this.outside = (event: PointerEvent) => { if (!(this.$el as HTMLElement).contains(event.target as Node)) this.close() }; document.addEventListener('pointerdown', this.outside) },
  beforeUnmount() { this.endPlane(); freezeColorMenu(this.$refs.menu as HTMLElement); if (this.outside) document.removeEventListener('pointerdown', this.outside) },
  methods: {
    close(restoreFocus = false) { if (restoreFocus) (this.$refs.trigger as HTMLButtonElement)?.focus({ preventScroll: true }); this.opened = false; this.composing = false; this.endPlane() },
    toggle() { if (this.disabled || this.loading) return; if (this.opened) this.close(); else this.opened = true },
    endPlane(commit = false) { const dragging = this.dragging; this.dragging = false; const plane = this.$refs.plane as HTMLElement | undefined; if (this.pointerId !== null && plane?.hasPointerCapture?.(this.pointerId)) plane.releasePointerCapture(this.pointerId); this.pointerId = null; if (dragging && commit) this.update(hsvToHex(this.hsv), true) },
    update(hex: string, commit = false) { if (this.disabled || this.loading) return; const value = normalizeHex(hex); if (!value) return; this.draft = value; this.draftDirty = false; this.hexError = ''; this.$emit('update:modelValue', value); if (commit) this.$emit('change', value) },
    editHex(event: Event) { this.draft = stringValue(event); this.draftDirty = true; this.hexError = '' },
    applyHex() {
      if (this.disabled || this.loading || this.composing) return
      const value = normalizeHex(this.draft)
      if (!value) { this.hexError = '请输入 3 或 6 位 HEX 颜色，例如 #ff8800。'; this.$nextTick(() => (this.$refs.hex as HTMLInputElement)?.focus({ preventScroll: true })); return }
      const next = hexToHsv(value)
      if (next.s > 0 && next.v > 0) this.hsv.h = next.h
      this.hsv.s = next.s; this.hsv.v = next.v
      this.update(value, true)
    },
    plane(event: PointerEvent) { if (!this.opened || this.disabled || this.loading) return; if (event.type === 'pointerdown') { if (event.button !== 0) return; this.dragging = true; this.pointerId = event.pointerId; (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId) }; if (!this.dragging || event.pointerId !== this.pointerId) return; const rect = (event.currentTarget as HTMLElement).getBoundingClientRect(); if (!rect.width || !rect.height) return; this.hsv.s = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100)); this.hsv.v = Math.max(0, Math.min(100, 100 - (event.clientY - rect.top) / rect.height * 100)); this.update(hsvToHex(this.hsv)) },
    planeKey(event: KeyboardEvent) { if (!this.opened || this.disabled || this.loading || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const step = event.shiftKey ? 10 : 1; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') this.hsv.s = Math.max(0, Math.min(100, this.hsv.s + (event.key === 'ArrowRight' ? step : -step))); else this.hsv.v = Math.max(0, Math.min(100, this.hsv.v + (event.key === 'ArrowUp' ? step : -step))); this.update(hsvToHex(this.hsv), true) },
  },
  render() {
    const inactive = this.disabled || this.loading
    return field(this, h('div', { class: 'apple-color-row', 'data-apple-popup-open': this.opened ? true : undefined, onKeydown: (event: KeyboardEvent) => { if (event.key === 'Escape' && this.opened) { event.preventDefault(); event.stopPropagation(); this.close(true) } }, onFocusout: (event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.close() } }, [
      h('button', { ...controlAttrs(this), ref: 'trigger', type: 'button', name: undefined, class: ['apple-color-picker', this.$attrs.class], 'aria-expanded': this.opened, 'aria-haspopup': 'dialog', 'aria-controls': `${this.inputId}-menu`, style: { '--apple-picked-color': this.modelValue }, onClick: this.toggle }, h('span', { 'aria-hidden': true })),
      this.showValue ? h('span', { class: 'apple-color__value' }, this.modelValue.toUpperCase()) : null,
      this.$attrs.name ? h('input', { type: 'hidden', name: this.$attrs.name, value: this.modelValue, disabled: this.disabled || this.loading }) : null,
      colorMenuTransition(withDirectives(h('div', { ref: 'menu', id: `${this.inputId}-menu`, class: 'apple-field-menu apple-color-menu', role: 'dialog', 'aria-label': this.label || this.$attrs['aria-label'] || '选择颜色', 'aria-hidden': !this.opened || inactive ? true : undefined, inert: !this.opened || inactive }, h('div', { class: 'apple-color-menu__content' }, [
        h('div', { ref: 'plane', class: 'apple-color-plane', role: 'slider', tabindex: inactive ? -1 : 0, 'aria-disabled': inactive || undefined, 'aria-label': '饱和度与亮度', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(this.hsv.s), 'aria-valuetext': `饱和度 ${Math.round(this.hsv.s)}%，亮度 ${Math.round(this.hsv.v)}%`, style: { backgroundColor: `hsl(${this.hsv.h} 100% 50%)` }, onPointerdown: this.plane, onPointermove: this.plane, onPointerup: () => this.endPlane(true), onPointercancel: () => this.endPlane(), onLostpointercapture: () => this.endPlane(), onKeydown: this.planeKey }, h('span', { class: 'apple-color-plane__thumb', style: { left: `${this.hsv.s}%`, top: `${100 - this.hsv.v}%`, backgroundColor: hsvToHex(this.hsv) } })),
        h('input', { type: 'range', min: 0, max: 360, step: 1, class: 'apple-color-hue', disabled: inactive, 'aria-label': '色相', value: this.hsv.h, onInput: (event: Event) => { this.hsv.h = numericValue(event); this.update(hsvToHex(this.hsv)) }, onChange: () => this.update(hsvToHex(this.hsv), true) }),
        h('div', { class: 'apple-color-hex' }, [h('label', { for: `${this.inputId}-hex` }, 'HEX'), h('div', { class: ['apple-input-wrap', { 'has-error': !!this.hexError }] }, [
          h('input', { ref: 'hex', id: `${this.inputId}-hex`, type: 'text', class: 'apple-control', disabled: inactive, 'aria-label': 'HEX 颜色', 'aria-invalid': this.hexError ? true : undefined, 'aria-describedby': this.hexError ? `${this.inputId}-hex-error` : undefined, maxlength: 7, spellcheck: false, autocomplete: 'off', autocapitalize: 'off', value: this.draft, onInput: this.editHex, onCompositionstart: () => { this.composing = true }, onCompositionend: (event: CompositionEvent) => { this.composing = false; this.editHex(event) }, onKeydown: (event: KeyboardEvent) => { if (event.key === 'Enter' && !event.isComposing && !this.composing && event.keyCode !== 229) { event.preventDefault(); event.stopPropagation(); this.applyHex() } } }),
          h('span', { class: 'apple-input__affix' }, h(AppleButton, { size: 'small', disabled: inactive, 'aria-label': '应用 HEX 颜色', onClick: this.applyHex }, { default: () => 'Apply' })),
        ])]),
        this.hexError ? h('p', { id: `${this.inputId}-hex-error`, class: 'apple-field__message is-error', role: 'alert' }, this.hexError) : null,
        h('div', { class: 'apple-color-swatches' }, ['#0071e3', '#34c759', '#ff9f0a', '#ff453a', '#bf5af2', '#1d1d1f', '#86868b', '#ffffff'].map(color => h('button', { type: 'button', class: 'apple-color-swatch', disabled: inactive, 'aria-label': color, 'aria-pressed': this.modelValue.toLowerCase() === color, style: { backgroundColor: color }, onClick: () => { this.hsv = hexToHsv(color); this.update(color, true) } }))),
      ])), [[vShow, this.opened && !inactive]])),
    ]))
  },
})

function normalizeHex(hex: string): string | null {
  const value = hex.trim().replace(/^#?([\da-f]{3})$/i, (_, short: string) => `#${[...short].map(char => char + char).join('')}`).replace(/^([\da-f]{6})$/i, '#$1')
  return /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : null
}

function hexToHsv(hex: string) {
  const normalized = /^#[\da-f]{6}$/i.test(hex) ? hex.slice(1) : '0071e3'
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map(index => parseInt(normalized.slice(index, index + 2), 16) / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b), difference = max - min
  const hue = difference === 0 ? 0 : max === r ? ((g - b) / difference) % 6 : max === g ? (b - r) / difference + 2 : (r - g) / difference + 4
  return { h: (hue * 60 + 360) % 360, s: max ? difference / max * 100 : 0, v: max * 100 }
}
function hsvToHex({ h: hue, s: saturation, v: value }: { h: number; s: number; v: number }) {
  const s = saturation / 100, v = value / 100
  return '#' + [5, 3, 1].map(offset => { const k = (offset + hue / 60) % 6; return Math.round((v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255).toString(16).padStart(2, '0') }).join('')
}

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
    openPicker(event: MouseEvent | KeyboardEvent) {
      if (this.disabled || this.loading) return
      const target = event.target as Element
      // Slotted controls keep their own actions; the hidden input must not reopen itself.
      const control = target.closest('button, a, input, select, textarea, label, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"])')
      if (control && control !== event.currentTarget) return
      ;(this.$refs.input as HTMLInputElement | undefined)?.click()
    },
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
    return field(this, [ripple(h('div', { class: ['apple-upload', { 'is-dragging': this.dragDepth > 0, 'is-disabled': this.disabled || this.loading }], role: 'button', tabindex: this.disabled || this.loading ? -1 : 0, 'aria-label': this.label || this.$attrs['aria-label'] || this.buttonText, 'aria-disabled': this.disabled || this.loading || undefined, onClick: this.openPicker, onKeydown: (event: KeyboardEvent) => { if (event.target !== event.currentTarget || !['Enter', ' ', 'Spacebar'].includes(event.key)) return; event.preventDefault(); if (!event.repeat) this.openPicker(event) }, onDragenter: (event: DragEvent) => { event.preventDefault(); if (!this.disabled && !this.loading) this.dragDepth++ }, onDragover: (event: DragEvent) => event.preventDefault(), onDragleave: (event: DragEvent) => { event.preventDefault(); this.dragDepth = Math.max(0, this.dragDepth - 1) }, onDrop: (event: DragEvent) => { event.preventDefault(); this.dragDepth = 0; this.selectFiles(Array.from(event.dataTransfer?.files || [])) } }, [
      h('input', { ...controlAttrs(this), ref: 'input', class: ['apple-visually-hidden', this.$attrs.class], type: 'file', tabindex: -1, required: this.required && !this.modelValue.length, accept: this.accept, multiple: this.multiple, capture: this.capture, 'aria-invalid': this.error || this.localError ? true : undefined, 'aria-describedby': this.error || this.localError || this.hint ? `${fieldId(this)}-message` : undefined, onClick: (event: MouseEvent) => event.stopPropagation(), onChange: (event: Event) => { const input = event.target as HTMLInputElement; this.selectFiles(Array.from(input.files || [])); this.$nextTick(this.syncFiles) } }),
      h('span', { class: 'apple-upload__trigger' }, [this.loading ? spinner() : h(Upload, { size: 21, 'aria-hidden': true }), h('span', this.buttonText)]),
      this.$slots.default?.(),
    ]), !this.disabled && !this.loading), this.modelValue.length ? h('ul', { class: 'apple-upload__files', 'aria-label': '已选择的文件' }, this.modelValue.map((file, index) => h('li', { class: 'apple-upload__file', key: `${file.name}-${file.lastModified}-${index}` }, [h('span', { class: 'apple-upload__file-name' }, file.name), h('span', { class: 'apple-upload__file-size' }, formatFileSize(file.size)), h('button', { type: 'button', class: 'apple-field__icon', disabled: this.disabled || this.loading, 'aria-label': `移除 ${file.name}`, title: `移除 ${file.name}`, onClick: (event: MouseEvent) => { event.stopPropagation(); this.remove(index) } }, h(X, { size: 16 }))]))) : null], '', this.error || this.localError)
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
    choose(level: number, value: AppleOptionValue | null) { const option = this.levels[level]?.find(item => item.value === value); const path = this.modelValue.slice(0, level); if (option && !option.disabled) path.push(option.value); this.$emit('update:modelValue', path); this.$emit('change', path); if (option && !option.children?.length) this.$emit('complete', path) },
  },
  render() {
    return field(this, h('div', { class: ['apple-cascader', this.$attrs.class], role: 'group', 'aria-label': this.label || this.$attrs['aria-label'] }, [
      ...this.levels.map((items, level) => h(AppleSelect, { key: level, items, modelValue: this.modelValue[level] ?? null, id: level === 0 ? fieldId(this) : `${fieldId(this)}-${level}`, name: this.name ? `${this.name}[${level}]` : undefined, disabled: this.disabled, loading: this.loading, required: this.required, motion: this.motion, placeholder: this.levelLabels[level] || this.placeholder, 'aria-label': this.levelLabels[level] || `${this.label || this.$attrs['aria-label'] || '级联选择'} 第 ${level + 1} 级`, 'onUpdate:modelValue': (value: AppleOptionValue | null) => this.choose(level, value) })),
    ]))
  },
})

export const AppleRate = defineComponent({
  name: 'AppleRate', inheritAttrs: false,
  props: { ...fieldProps, label: { type: String, default: '评分' }, modelValue: { type: Number, default: 0 }, max: { type: Number, default: 5 }, readonly: Boolean, allowClear: { type: Boolean, default: true }, name: String },
  emits: ['update:modelValue', 'change'], data() { return { inputId: useId() } },
  methods: {
    update(value: number) { if (this.disabled || this.loading || this.readonly) return; this.$emit('update:modelValue', value); this.$emit('change', value) },
    onKeydown(event: KeyboardEvent, value: number) { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 1 : event.key === 'End' ? this.max : Math.max(1, Math.min(this.max, value + (event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : -1))); this.update(next); (this.$refs[`rating-${next}`] as HTMLButtonElement)?.focus() },
  },
  render() {
    return field(this, h('div', { ...controlAttrs(this), class: ['apple-rate', this.$attrs.class], role: 'radiogroup', 'aria-readonly': this.readonly || undefined }, [
      ...Array.from({ length: Math.max(1, Math.min(10, this.max)) }, (_, index) => { const value = index + 1; return h('button', { type: 'button', ref: `rating-${value}`, class: ['apple-rate__star', { 'is-filled': value <= this.modelValue }], role: 'radio', 'aria-label': `${value} 星`, title: `${value} 星`, 'aria-checked': value === this.modelValue, disabled: this.disabled || this.loading, 'aria-disabled': this.readonly || undefined, tabindex: this.readonly ? -1 : value === (this.modelValue || 1) ? 0 : -1, onClick: () => this.update(this.allowClear && value === this.modelValue ? 0 : value), onKeydown: (event: KeyboardEvent) => this.onKeydown(event, value) }, h(Star, { size: 26, 'aria-hidden': true })) }),
      this.name ? h('input', { type: 'hidden', name: this.name, value: this.modelValue, disabled: this.disabled || this.loading }) : null,
    ]))
  },
})

export const formComponents = { AppleInput, AppleTextarea, AppleSelect, AppleAutocomplete, AppleCheckbox, AppleRadioGroup, AppleSwitch, AppleSlider, AppleStepper, AppleSegmentedControl, AppleDatePicker, AppleColorPicker, AppleUpload, AppleForm, AppleFormField, AppleOtpInput, AppleCascader, AppleRate }

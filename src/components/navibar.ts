import { defineComponent, h, markRaw, nextTick, useId, type PropType } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { appleKey, motionProps, resolveMotion, type AppleContext } from '../core/context'
import type { AppleItem, AppleValue } from './content'

export const AppleNavibar = defineComponent({
  name: 'AppleNavibar',
  inject: { apple: { from: appleKey, default: null } },
  setup: () => ({ uid: useId() }),
  props: {
    ...motionProps,
    items: { type: Array as PropType<AppleItem[]>, default: () => [] },
    modelValue: [String, Number] as PropType<AppleValue>,
    brand: { type: String, default: '' },
    brandHref: { type: String, default: '/' },
    label: { type: String, default: '主导航' },
    fixed: { type: Boolean, default: true },
    breakpoint: { type: Number, default: 640 },
  },
  emits: ['update:modelValue', 'change', 'toggle'],
  data: () => ({
    collapsed: false, open: false, menuHeight: 0, localValue: undefined as AppleValue | undefined,
    observer: null as ResizeObserver | null,
  }),
  computed: {
    activeValue(): AppleValue | undefined { return this.modelValue ?? this.localValue },
  },
  watch: {
    breakpoint() { this.measure() },
    fixed() { void nextTick(this.measure) },
    modelValue() { this.close() },
    collapsed() { void nextTick(this.observeSize) },
  },
  mounted() {
    this.measure()
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = markRaw(new ResizeObserver(() => { this.measure(); this.measureMenu() }))
      this.observeSize()
    }
    window.addEventListener('resize', this.measure)
    document.addEventListener('pointerdown', this.outside)
    document.addEventListener('keydown', this.escape)
  },
  updated() { this.measureMenu() },
  beforeUnmount() {
    this.observer?.disconnect()
    window.removeEventListener('resize', this.measure)
    document.removeEventListener('pointerdown', this.outside)
    document.removeEventListener('keydown', this.escape)
  },
  methods: {
    observeSize() {
      this.observer?.disconnect()
      for (const element of [this.$refs.bar, this.$refs.links]) {
        if (element instanceof HTMLElement) this.observer?.observe(element)
      }
      this.measureMenu()
    },
    measureMenu() {
      const links = this.$refs.links as HTMLElement | undefined
      if (this.collapsed && links) this.menuHeight = links.scrollHeight
    },
    measure() {
      const bar = this.$refs.bar as HTMLElement | undefined
      if (!bar) return
      const collapsed = bar.getBoundingClientRect().width <= this.breakpoint
      if (collapsed === this.collapsed) return
      const active = bar.ownerDocument.activeElement
      const focusedInLinks = (this.$refs.links as HTMLElement | undefined)?.contains(active)
      const focusedToggle = active === this.$refs.toggle
      this.collapsed = collapsed
      this.close()
      void nextTick(() => {
        if (collapsed && focusedInLinks) (this.$refs.toggle as HTMLElement | undefined)?.focus()
        else if (!collapsed && focusedToggle) this.focusFirst()
      })
    },
    setOpen(value: boolean) {
      if (value === this.open) return
      this.open = value
      this.$emit('toggle', value)
    },
    close(restore = false) {
      this.setOpen(false)
      if (restore && this.collapsed) void nextTick(() => (this.$refs.toggle as HTMLElement | undefined)?.focus())
    },
    focusFirst() {
      (this.$refs.links as HTMLElement | undefined)?.querySelector<HTMLElement>('a[href],button:not(:disabled)')?.focus()
    },
    outside(event: PointerEvent) {
      if (event.target === this.$refs.backdrop) return
      if (this.open && !(this.$refs.bar as HTMLElement).contains(event.target as Node)) this.close()
    },
    escape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !this.open) return
      event.preventDefault()
      event.stopPropagation()
      this.close(true)
    },
    select(item: AppleItem, event: MouseEvent) {
      if (item.disabled) { event.preventDefault(); return }
      this.localValue = item.value
      this.$emit('update:modelValue', item.value)
      this.close(this.collapsed)
      this.$emit('change', item.value, item)
    },
  },
  render() {
    const context = this.apple as AppleContext | null
    const mode = resolveMotion(this.motion, context?.motion.mode, context?.motion.reduced)
    const menuLabel = `${this.open ? '关闭' : '打开'}${this.label}`
    const navigation = h('nav', { ref: 'links', id: `${this.uid}-navigation`, class: 'apple-navibar__links', 'aria-label': this.label, 'aria-hidden': this.collapsed && !this.open || undefined }, this.items.map(item => h(item.href ? 'a' : 'button', {
      key: item.value, class: ['apple-navibar__item', { 'is-active': item.value === this.activeValue }],
      type: item.href ? undefined : 'button', href: item.disabled ? undefined : item.href,
      disabled: !item.href && item.disabled || undefined, 'aria-disabled': item.disabled || undefined,
      'aria-current': item.value === this.activeValue ? 'page' : undefined,
      tabindex: item.disabled ? -1 : undefined, onClick: (event: MouseEvent) => this.select(item, event),
    }, this.$slots.item?.({ item, active: item.value === this.activeValue }) ?? item.label)))
    return h('div', { class: ['apple-navibar', { 'apple-navibar--fixed': this.fixed, 'is-collapsed': this.collapsed, 'is-open': this.open }], 'data-apple-motion': mode }, [
      this.collapsed ? h('div', { ref: 'backdrop', class: 'apple-navibar__backdrop', 'aria-hidden': true, onClick: () => this.close(true), onWheel: (event: WheelEvent) => event.preventDefault() }) : null,
      h('header', {
        ref: 'bar', class: 'apple-navibar__bar',
        onFocusout: (event: FocusEvent) => { if (event.relatedTarget && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) this.close() },
      }, [
        h('div', { class: 'apple-navibar__brand', onClick: () => this.close() }, this.$slots.brand?.() ?? (this.brand ? h('a', { href: this.brandHref }, this.brand) : [])),
        !this.collapsed ? navigation : null,
        h('div', { class: 'apple-navibar__actions' }, this.$slots.actions?.({ close: this.close })),
        h('button', {
          ref: 'toggle', type: 'button', class: 'apple-navibar__toggle', hidden: !this.collapsed,
          'aria-label': menuLabel, title: menuLabel, 'aria-expanded': this.open,
          'aria-controls': `${this.uid}-navigation`, onClick: () => this.setOpen(!this.open),
          onKeydown: (event: KeyboardEvent) => { if (event.key === 'ArrowDown') { event.preventDefault(); this.setOpen(true); void nextTick(this.focusFirst) } },
        }, [h(this.open ? X : Menu, { size: 20, 'aria-hidden': true })]),
        this.collapsed ? h('div', { class: 'apple-navibar__menu', inert: !this.open || undefined, style: { height: this.open ? `${this.menuHeight}px` : '0px' } }, [navigation]) : null,
      ]),
    ])
  },
})

export const navigationComponents = { AppleNavibar }

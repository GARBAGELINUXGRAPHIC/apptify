import { defineComponent, h, shallowRef, withDirectives, type PropType, type Component, type CSSProperties } from 'vue'
import { Ripple } from 'vuetify/directives/ripple'
import { ArrowUpRight, LoaderCircle, ImageOff, ZoomIn, X, Search } from 'lucide-vue-next'
import { appleKey, createApple, motionProps, resolveMotion, themeStyle, type AppleContext, type Motion } from '../core/context'
import { AppleOverlayHost, AppleImageViewer } from './overlays'

const providerKey: symbol = Symbol('apple-provider-scope')

export const AppleProvider = defineComponent({
  name: 'AppleProvider',
  inject: { parentApple: { from: appleKey, default: null }, nested: { from: providerKey, default: false } },
  props: { theme: String, motion: String as PropType<Motion> },
  data() {
    const parent = this.parentApple as unknown as AppleContext | null
    return { context: shallowRef(this.nested || this.theme || this.motion ? createApple({ theme: this.theme ?? parent?.theme.name, motion: this.motion ?? parent?.motion.mode, themes: parent?.theme.themes }) : (parent ?? createApple())) }
  },
  provide() { return { [appleKey as symbol]: this.context, [providerKey]: true } },
  computed: {
    inheritedTheme(): string | undefined { return this.theme ?? (this.parentApple as unknown as AppleContext | null)?.theme.name },
    inheritedMotion(): Motion | undefined { return this.motion ?? (this.parentApple as unknown as AppleContext | null)?.motion.mode },
  },
  watch: {
    'parentApple.theme.current': {
      deep: true,
      handler() {
        const parent = this.parentApple as unknown as AppleContext | null
        if (!this.theme && parent && parent !== this.context) Object.assign(this.context.theme.themes, parent.theme.themes)
      },
    },
    inheritedTheme(value: string | undefined) {
      const parent = this.parentApple as unknown as AppleContext | null
      if (parent && parent !== this.context) Object.assign(this.context.theme.themes, parent.theme.themes)
      if (value && value !== this.context.theme.name) this.context.theme.set(value)
    },
    inheritedMotion(value: Motion | undefined) { if (value && value !== this.context.motion.mode) this.context.motion.set(value) },
  },
  mounted() { this.context.portalTarget.value = this.$refs.portals as HTMLElement; this.context.attach() },
  beforeUnmount() { this.context.detach(); this.context.overlays.clear(); this.context.portalTarget.value = undefined },
  render() {
    return h('div', {
      class: 'apple-provider', style: { ...themeStyle(this.context), colorScheme: this.context.theme.current.scheme },
      'data-apple-theme': this.context.theme.resolved,
      'data-apple-motion': resolveMotion('inherit', this.context.motion.mode, this.context.motion.reduced),
    }, [this.$slots.default?.(), h('div', { ref: 'portals', 'data-apple-portals': '' }), h(AppleOverlayHost)])
  },
})

export const AppleButton = defineComponent({
  name: 'AppleButton', inheritAttrs: false,
  inject: { apple: { from: appleKey, default: null } },
  props: {
    ...motionProps,
    variant: { type: String as PropType<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>, default: 'primary' },
    size: { type: String as PropType<'small' | 'medium' | 'large'>, default: 'medium' },
    icon: [Object, Function] as PropType<Component>, iconOnly: Boolean, label: String,
    disabled: Boolean, loading: Boolean, ripple: { type: Boolean, default: true }, href: String,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  emits: ['click'],
  render() {
    const context = this.apple as AppleContext | null
    const motion = resolveMotion(this.motion, context?.motion.mode, context?.motion.reduced)
    const blocked = this.disabled || this.loading
    const node = h(this.href && !blocked ? 'a' : 'button', {
      ...this.$attrs, class: ['apple-button', `apple-button--${this.variant}`, `apple-button--${this.size}`, { 'apple-button--icon': this.iconOnly }, this.$attrs.class],
      type: this.href && !blocked ? undefined : this.type, href: blocked ? undefined : this.href,
      disabled: blocked, 'aria-disabled': blocked || undefined, 'aria-busy': this.loading || undefined,
      'aria-label': this.label ?? this.$attrs['aria-label'], title: this.iconOnly ? this.label : undefined,
      'data-apple-motion': motion,
      onClick: (event: MouseEvent) => { if (blocked) event.preventDefault(); else this.$emit('click', event) },
    }, [this.loading ? h(LoaderCircle, { size: 18, class: 'apple-spin', 'aria-hidden': true }) : this.icon ? h(this.icon, { size: 18, 'aria-hidden': true }) : null, this.$slots.default?.()])
    return withDirectives(node, [[Ripple, this.ripple && !blocked && motion === 'full']])
  },
})

export const AppleLink = defineComponent({
  name: 'AppleLink', props: { href: String, external: Boolean, disabled: Boolean },
  render() { return h('a', { class: 'apple-link', href: this.disabled ? undefined : this.href, target: this.external ? '_blank' : undefined, rel: this.external ? 'noopener noreferrer' : undefined, 'aria-disabled': this.disabled || undefined }, [this.$slots.default?.(), this.external ? h(ArrowUpRight, { size: 14, 'aria-hidden': true }) : null]) },
})

export const AppleCard = defineComponent({
  name: 'AppleCard', inject: { apple: { from: appleKey, default: null } },
  props: {
    ...motionProps, title: String, subtitle: String, text: String, eyebrow: String,
    icon: [Object, Function, String] as PropType<Component | string>, iconColor: String,
    image: String, imageAlt: { type: String, default: '' }, href: String,
    zoom: { type: String as PropType<'big' | 'small' | 'none'>, default: 'small' },
    shadow: { type: String as PropType<'normal' | 'static' | 'focused' | 'none'>, default: 'normal' },
  },
  render() {
    const ctx = this.apple as AppleContext | null
    const mode = resolveMotion(this.motion, ctx?.motion.mode, ctx?.motion.reduced)
    return h('article', { class: ['apple-card', `apple-card--shadow-${this.shadow}`, `apple-card--zoom-${this.zoom}`], 'data-apple-motion': mode }, [
      this.$slots.media?.() ?? (this.image ? h('img', { class: 'apple-card__image', src: this.image, alt: this.imageAlt, loading: 'lazy' }) : null),
      h('div', { class: 'apple-card__body' }, [
        this.eyebrow ? h('p', { class: 'apple-card__eyebrow' }, this.eyebrow) : null,
        h('div', { class: 'apple-card__heading' }, [this.$slots.icon?.() ?? (this.icon ? (typeof this.icon === 'string' ? h('img', { src: this.icon, alt: '', width: 32, height: 32 }) : h(this.icon, { size: 32, color: this.iconColor, 'aria-hidden': true })) : null), this.$slots.title?.() ?? (this.title ? h('h3', this.href ? h('a', { href: this.href }, this.title) : this.title) : null)]),
        this.subtitle ? h('p', { class: 'apple-card__subtitle' }, this.subtitle) : null,
        this.text ? h('p', { class: 'apple-card__text' }, this.text) : null,
        this.$slots.default?.(), this.$slots.actions ? h('div', { class: 'apple-card__actions' }, this.$slots.actions()) : null,
      ]),
    ])
  },
})

export const AppleImage = defineComponent({
  name: 'AppleImage', props: { ...motionProps, src: { type: String, required: true }, alt: { type: String, required: true }, preview: { type: Boolean, default: true }, gallery: { type: Array as PropType<string[]>, default: () => [] }, index: { type: Number, default: 0 }, squared: Boolean, aspectRatio: { type: [String, Number], default: '4/3' }, fit: { type: String as PropType<'contain' | 'cover'>, default: 'cover' } },
  data: () => ({ open: false, failed: false, loaded: false }),
  watch: { src() { this.failed = false; this.loaded = false } },
  render() {
    const images = this.gallery.length ? this.gallery : [{ src: this.src, alt: this.alt }]
    const index = Math.max(0, Math.min(this.index, images.length - 1))
    return h('figure', { class: 'apple-image', style: { aspectRatio: this.squared ? '1' : String(this.aspectRatio) } }, [
      h(this.preview && !this.failed ? 'button' : 'div', { class: 'apple-image__trigger', type: this.preview ? 'button' : undefined, 'aria-label': this.preview ? `放大图片：${this.alt}` : undefined, onClick: () => { if (this.preview && !this.failed) this.open = true } }, this.failed ? [h(ImageOff, { size: 28 }), h('span', '图片无法加载')] : [h('img', { src: this.src, alt: this.alt, loading: 'lazy', style: { objectFit: this.fit }, onError: () => { this.failed = true }, onLoad: () => { this.loaded = true } }), this.preview ? h('span', { class: 'apple-image__zoom' }, h(ZoomIn, { size: 18 })) : null]),
      h(AppleImageViewer, { modelValue: this.open, 'onUpdate:modelValue': (value: boolean) => { this.open = value }, images, index, motion: this.motion }),
      this.$slots.caption ? h('figcaption', this.$slots.caption()) : null,
    ])
  },
})

export const AppleSearch = defineComponent({
  name: 'AppleSearch', inheritAttrs: false,
  props: { modelValue: { type: String, default: '' }, placeholder: { type: String, default: '搜索' }, label: { type: String, default: '搜索' }, disabled: Boolean },
  emits: ['update:modelValue', 'search'],
  render() { return h('div', { class: 'apple-search' }, [h(Search, { size: 18, 'aria-hidden': true }), h('input', { ...this.$attrs, type: 'search', value: this.modelValue, placeholder: this.placeholder, 'aria-label': this.label, disabled: this.disabled, onInput: (e: Event) => this.$emit('update:modelValue', (e.target as HTMLInputElement).value), onKeydown: (e: KeyboardEvent) => { if (e.key === 'Enter') this.$emit('search', this.modelValue) } }), this.modelValue ? h('button', { type: 'button', disabled: this.disabled, 'aria-label': '清除搜索', onClick: () => this.$emit('update:modelValue', '') }, h(X, { size: 16 })) : null]) },
})

export const AppleContainer = defineComponent({ name: 'AppleContainer', props: { width: { type: [Number, String], default: 1200 } }, render() { return h('div', { class: 'apple-container', style: { maxWidth: typeof this.width === 'number' ? `${this.width}px` : this.width } }, this.$slots.default?.()) } })
export const AppleStack = defineComponent({ name: 'AppleStack', props: { direction: { type: String as PropType<'row' | 'column'>, default: 'column' }, gap: { type: [String, Number], default: 16 }, align: { type: String, default: 'stretch' }, wrap: { type: Boolean, default: true } }, render() { return h('div', { class: 'apple-stack', style: { flexDirection: this.direction, gap: typeof this.gap === 'number' ? `${this.gap}px` : this.gap, alignItems: this.align, flexWrap: this.wrap ? 'wrap' : 'nowrap' } as CSSProperties }, this.$slots.default?.()) } })
export const AppleGrid = defineComponent({ name: 'AppleGrid', props: { min: { type: Number, default: 240 }, gap: { type: Number, default: 20 } }, render() { return h('div', { class: 'apple-grid', style: { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${this.min}px), 1fr))`, gap: `${this.gap}px` } }, this.$slots.default?.()) } })

export const foundationComponents = { AppleProvider, AppleButton, AppleLink, AppleCard, AppleImage, AppleSearch, AppleContainer, AppleStack, AppleGrid }

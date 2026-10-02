import { defineComponent, h, markRaw, nextTick, ref, type PropType, type Component, type CSSProperties } from 'vue'
import { ArrowUpRight, ImageOff, X, Search } from 'lucide-vue-next'
import { appleKey, createApple, motionProps, resolveMotion, themeStyle, type AppleContext, type Motion } from '../core/context'
import { AppleOverlayHost, AppleImageViewer, type AppleViewerImage } from './overlays'
import { clamp, isTouchImageDevice, touchImageQuery, type PhotoSize } from '../core/image-geometry'
import { AppleButton } from './button'
export { AppleButton } from './button'

const providerKey: symbol = Symbol('apple-provider-scope')

export const AppleProvider = defineComponent({
  name: 'AppleProvider',
  inject: { parentApple: { from: appleKey, default: null }, nested: { from: providerKey, default: false } },
  props: { theme: String, motion: String as PropType<Motion> },
  data() {
    const parent = this.parentApple as unknown as AppleContext | null
    return { context: ref(this.nested || this.theme || this.motion ? createApple({ theme: this.theme ?? parent?.theme.value.name, motion: this.motion ?? parent?.motion.value.mode, themes: parent?.theme.value.themes }) : (parent ?? createApple())) }
  },
  provide() { return { [appleKey as symbol]: this.context, [providerKey]: true } },
  computed: {
    inheritedTheme(): string | undefined { return this.theme ?? (this.parentApple as unknown as AppleContext | null)?.theme.value.name },
    inheritedMotion(): Motion | undefined { return this.motion ?? (this.parentApple as unknown as AppleContext | null)?.motion.value.mode },
  },
  watch: {
    'parentApple.theme.value.current': {
      deep: true,
      handler() {
        const parent = this.parentApple as unknown as AppleContext | null
        if (!this.theme && parent && parent !== this.context) Object.assign(this.context.theme.value.themes, parent.theme.value.themes)
      },
    },
    inheritedTheme(value: string | undefined) {
      const parent = this.parentApple as unknown as AppleContext | null
      if (parent && parent !== this.context) Object.assign(this.context.theme.value.themes, parent.theme.value.themes)
      if (value && value !== this.context.theme.value.name) this.context.theme.value.set(value)
    },
    inheritedMotion(value: Motion | undefined) { if (value && value !== this.context.motion.value.mode) this.context.motion.value.set(value) },
  },
  mounted() { this.context.portalTarget.value = this.$refs.portals as HTMLElement; this.context.attach() },
  beforeUnmount() { this.context.detach(); this.context.overlays.clear(); this.context.portalTarget.value = undefined },
  render() {
    return h('div', {
      class: 'apple-provider', style: { ...themeStyle(this.context), colorScheme: this.context.theme.value.current.scheme },
      'data-apple-theme': this.context.theme.value.resolved,
      'data-apple-motion': resolveMotion('inherit', this.context.motion.value.mode, this.context.motion.value.reduced),
    }, [this.$slots.default?.(), h('div', { ref: 'portals', 'data-apple-portals': '' }), h(AppleOverlayHost)])
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
    const mode = resolveMotion(this.motion, ctx?.motion.value.mode, ctx?.motion.value.reduced)
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
  inject: { apple: { from: appleKey, default: null } },
  name: 'AppleImage', props: {
    ...motionProps, src: { type: String, required: true }, alt: { type: String, required: true },
    preview: { type: Boolean, default: true }, gallery: { type: Array as PropType<Array<string | AppleViewerImage>>, default: () => [] },
    galleryLayout: { type: String as PropType<'compact' | 'tiled' | 'tiled-wrap'>, default: 'compact' },
    galleryShape: { type: String as PropType<'natural' | 'square'>, default: 'natural' },
    index: { type: Number, default: 0 }, squared: Boolean, aspectRatio: { type: [String, Number], default: '4/3' },
    fit: { type: String as PropType<'contain' | 'cover'>, default: 'cover' },
  },
  emits: ['update:index', 'change'],
  data() { return {
    open: false, previewing: false, failed: false, loaded: false, previewIndex: this.index, mobile: isTouchImageDevice(),
    viewportQuery: null as MediaQueryList | null, thumbnails: markRaw(new Map<number, HTMLImageElement>()),
    galleryLoaded: {} as Record<number, boolean>, galleryFailed: {} as Record<number, boolean>,
    gallerySizes: {} as Record<string, PhotoSize>, gallerySnap: null as string | null,
    galleryDrag: null as { id: number; x: number; left: number; moved: boolean; snap: string } | null, galleryClickUntil: 0,
  } },
  computed: {
    images(): AppleViewerImage[] {
      return this.gallery.length ? this.gallery.map((image, index) => typeof image === 'string'
        ? { src: image, alt: image === this.src ? this.alt : `图片 ${index + 1}` } : image)
        : [{ src: this.src, alt: this.alt }]
    },
    grouped(): boolean { return this.gallery.length > 1 },
  },
  watch: {
    src() { this.failed = false; this.loaded = false },
    index(value: number) {
      const index = clamp(value, 0, this.images.length - 1)
      if (index === this.previewIndex) return
      this.previewIndex = index; if (!this.previewing) void nextTick(() => this.origin(index))
    },
    galleryLayout() { void nextTick(() => this.origin(this.previewIndex)) },
    galleryShape() { void nextTick(() => this.origin(this.previewIndex)) },
    gallery: { deep: true, handler() {
      this.galleryLoaded = {}; this.galleryFailed = {}; this.previewIndex = clamp(this.previewIndex, 0, this.images.length - 1)
      void nextTick(() => { this.inspectThumbnails(); this.origin(this.previewIndex) })
    } },
  },
  mounted() {
    this.viewportQuery = window.matchMedia?.(touchImageQuery) ?? null
    this.viewportQuery?.addEventListener('change', this.syncViewport)
    this.syncViewport()
    void nextTick(() => { this.inspectThumbnails(); this.origin(this.previewIndex) })
  },
  beforeUnmount() { this.viewportQuery?.removeEventListener('change', this.syncViewport) },
  methods: {
    syncViewport() { if (!this.previewing) this.mobile = isTouchImageDevice() },
    afterPreview() {
      this.previewing = false; this.syncViewport()
      const box = this.$refs.gallery as HTMLElement | undefined
      if (box && this.gallerySnap !== null) box.style.scrollSnapType = this.gallerySnap
      this.gallerySnap = null
    },
    origin(index: number, reveal = true): HTMLImageElement | null {
      const image = this.thumbnails.get(this.grouped ? index : 0) ?? null
      if (!image || !reveal || !this.grouped) return image
      const box = this.$refs.gallery as HTMLElement | undefined
      const trigger = image.parentElement
      if (this.galleryLayout === 'tiled-wrap') {
        trigger?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        return image
      }
      if (box && trigger) {
        // Center the destination, then clamp to both ends so the strip never exposes a gap.
        box.scrollLeft = clamp(trigger.offsetLeft - (box.clientWidth - trigger.offsetWidth) / 2, 0, box.scrollWidth - box.clientWidth)
      }
      return image
    },
    showImage(index: number) {
      if (this.previewing) return
      index = clamp(index, 0, this.images.length - 1)
      const box = this.$refs.gallery as HTMLElement | undefined, image = this.thumbnails.get(index)
      if (!box || !image?.parentElement) return
      const trigger = image.parentElement
      if (this.galleryLayout === 'tiled-wrap') {
        this.changed(index)
        trigger.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        return
      }
      const left = clamp(trigger.offsetLeft - (box.clientWidth - trigger.offsetWidth) / 2, 0, box.scrollWidth - box.clientWidth)
      this.changed(index)
      const ctx = this.apple as AppleContext | null
      box.scrollTo({ left, behavior: resolveMotion(this.motion, ctx?.motion.value.mode, ctx?.motion.value.reduced) === 'full' ? 'smooth' : 'auto' })
    },
    scrolled() {
      if (this.previewing) return
      const box = this.$refs.gallery as HTMLElement | undefined
      if (!box) return
      const center = box.scrollLeft + box.clientWidth / 2
      let index = this.previewIndex, nearest = Infinity
      this.thumbnails.forEach((image, i) => {
        const trigger = image.parentElement
        if (!trigger) return
        const distance = Math.abs(trigger.offsetLeft + trigger.offsetWidth / 2 - center)
        if (distance < nearest) { nearest = distance; index = i }
      })
      if (index !== this.previewIndex) this.changed(index)
    },
    galleryPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || event.button !== 0 || this.previewing || this.galleryLayout === 'tiled-wrap') return
      const box = event.currentTarget as HTMLElement
      this.galleryDrag = { id: event.pointerId, x: event.clientX, left: box.scrollLeft, moved: false, snap: box.style.scrollSnapType }
    },
    galleryPointerMove(event: PointerEvent) {
      const drag = this.galleryDrag
      if (!drag || event.pointerId !== drag.id) return
      const dx = event.clientX - drag.x
      if (Math.abs(dx) <= 6 && !drag.moved) return
      const box = event.currentTarget as HTMLElement
      event.preventDefault(); drag.moved = true; box.style.scrollSnapType = 'none'
      try { box.setPointerCapture?.(event.pointerId) } catch { /* Synthetic pointers have no capture. */ }
      box.scrollLeft = drag.left - dx
    },
    galleryPointerUp(event: PointerEvent) {
      const drag = this.galleryDrag
      if (!drag || event.pointerId !== drag.id) return
      const box = event.currentTarget as HTMLElement
      this.galleryDrag = null; box.style.scrollSnapType = drag.snap
      if (drag.moved) {
        this.galleryClickUntil = performance.now() + 400
        this.scrolled()
        if (this.galleryLayout === 'compact') this.showImage(this.previewIndex)
      }
    },
    galleryKeydown(event: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const index = clamp(event.key === 'Home' ? 0 : event.key === 'End' ? this.images.length - 1 : this.previewIndex + (event.key === 'ArrowRight' ? 1 : -1), 0, this.images.length - 1)
      this.showImage(index)
      this.thumbnails.get(index)?.parentElement?.focus({ preventScroll: true })
    },
    previewImage(index: number) {
      if (this.previewing || performance.now() < this.galleryClickUntil || !this.preview || (this.grouped ? this.galleryFailed[index] : this.failed)) return
      this.syncViewport()
      this.previewIndex = this.grouped ? index : this.index; this.previewing = true; this.open = true
      const box = this.$refs.gallery as HTMLElement | undefined
      if (box) { this.gallerySnap = box.style.scrollSnapType; box.style.scrollSnapType = 'none' }
    },
    changed(index: number) {
      this.previewIndex = index; this.$emit('update:index', index); this.$emit('change', index)
      if (this.previewing && !this.mobile) void nextTick(() => this.origin(index))
    },
    inspectThumbnails() {
      this.thumbnails.forEach((image, index) => { if (image.complete && image.naturalWidth) this.loadedThumbnail(this.images[index]?.src ?? image.src, index, image) })
    },
    loadedThumbnail(src: string, index: number, image: HTMLImageElement) {
      if (!image.naturalWidth) return
      this.gallerySizes[src] = { width: image.naturalWidth, height: image.naturalHeight }
      this.galleryLoaded[index] = true; this.loaded = true
    },
    tileRatio(image: AppleViewerImage): number {
      if (this.squared || this.galleryShape === 'square') return 1
      const size = this.gallerySizes[image.src] ?? image
      return size.width && size.height ? size.width / size.height : 1
    },
    thumbnail(image: AppleViewerImage, index: number) {
      const failed = this.grouped ? this.galleryFailed[index] : this.failed
      return h(this.preview && !failed ? 'button' : 'div', {
        key: `${index}:${image.src}`, class: 'apple-image__trigger', type: this.preview && !failed ? 'button' : undefined,
        'aria-label': this.preview && !failed ? `放大图片：${image.alt ?? `图片 ${index + 1}`}` : undefined,
        style: this.grouped && this.galleryLayout !== 'compact' ? { aspectRatio: String(this.tileRatio(image)) } : undefined,
        onClick: () => this.previewImage(index),
      }, failed ? [h(ImageOff, { size: 28 }), h('span', '图片无法加载')] : [h('img', {
        ref: (element: unknown) => { if (element) this.thumbnails.set(index, element as HTMLImageElement); else this.thumbnails.delete(index) },
        src: image.src, alt: image.alt ?? '', loading: this.grouped ? 'eager' : 'lazy', draggable: false,
        width: image.width, height: image.height,
        style: { objectFit: this.squared || this.galleryShape === 'square' ? 'cover' : this.fit },
        onError: () => { if (this.grouped) this.galleryFailed[index] = true; else this.failed = true },
        onLoad: (event: Event) => this.loadedThumbnail(image.src, index, event.target as HTMLImageElement),
      })])
    },
  },
  render() {
    const index = clamp(this.previewIndex, 0, this.images.length - 1)
    const ctx = this.apple as AppleContext | null
    const mode = resolveMotion(this.motion, ctx?.motion.value.mode, ctx?.motion.value.reduced)
    const ratio = this.squared || this.galleryShape === 'square' ? '1' : String(this.aspectRatio)
    return h('figure', {
      class: ['apple-image', { 'apple-image--loaded': this.loaded && !this.failed && !this.open, 'apple-image--group': this.grouped, 'apple-image--mobile': this.mobile }],
      'data-apple-motion': mode, 'data-gallery-layout': this.grouped ? this.galleryLayout : undefined,
      'data-gallery-shape': this.grouped ? this.squared ? 'square' : this.galleryShape : undefined, 'data-index': index,
      style: this.grouped ? undefined : { aspectRatio: ratio },
    }, [
      h('div', { class: 'apple-image__surface', style: this.grouped && this.galleryLayout === 'compact' ? { aspectRatio: ratio } : undefined }, [
        this.grouped ? h('div', {
          ref: 'gallery',
          role: 'group', tabindex: 0, 'aria-label': '图片组', class: ['apple-image__gallery', `apple-image__gallery--${this.galleryLayout}`, { 'is-dragging': this.galleryDrag?.moved }],
          onScroll: this.scrolled, onKeydown: this.galleryKeydown, onPointerdown: this.galleryPointerDown, onPointermove: this.galleryPointerMove,
          onPointerup: this.galleryPointerUp, onPointercancel: this.galleryPointerUp, onLostpointercapture: this.galleryPointerUp,
        }, this.images.map((image, i) => this.thumbnail(image, i))) : this.thumbnail({ src: this.src, alt: this.alt }, 0),
      ]),
      this.grouped && this.galleryLayout === 'compact' ? h('div', { class: 'apple-image__pagination', role: 'group', 'aria-label': '图片组分页' }, [
        h('div', { class: 'apple-image__dots' }, this.images.map((_, i) => h('button', {
          type: 'button', class: 'apple-image__dot', 'aria-label': `显示第 ${i + 1} 张图片`, 'aria-current': i === index ? 'true' : undefined,
          onClick: () => this.showImage(i),
        }, h('span', { 'aria-hidden': true })))),
        h('span', { class: 'apple-image__count', 'aria-live': 'polite', 'aria-atomic': 'true' }, `${index + 1} / ${this.images.length}`),
      ]) : null,
      h(AppleImageViewer, {
        modelValue: this.open, 'onUpdate:modelValue': (value: boolean) => { this.open = value },
        images: this.images,
        index, motion: this.motion, origin: this.origin,
        'onUpdate:index': this.changed, onAfterClose: this.afterPreview,
      }),
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
export const AppleStack = defineComponent({ name: 'AppleStack', props: { direction: { type: String as PropType<'row' | 'column'>, default: 'column' }, gap: { type: [String, Number], default: 16 }, align: { type: String, default: 'stretch' }, wrap: { type: Boolean, default: true } }, render() { return h('div', { class: 'apple-stack', style: { flexDirection: this.direction, gap: typeof this.gap === 'number' ? `${this.gap}px` : this.gap, alignItems: this.align, flexWrap: this.direction === 'row' && this.wrap ? 'wrap' : 'nowrap' } as CSSProperties }, this.$slots.default?.()) } })
export const AppleGrid = defineComponent({ name: 'AppleGrid', props: { min: { type: Number, default: 240 }, gap: { type: Number, default: 20 } }, render() { return h('div', { class: 'apple-grid', style: { gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${this.min}px), 1fr))`, gap: `${this.gap}px` } }, this.$slots.default?.()) } })

export const foundationComponents = { AppleProvider, AppleButton, AppleLink, AppleCard, AppleImage, AppleSearch, AppleContainer, AppleStack, AppleGrid }

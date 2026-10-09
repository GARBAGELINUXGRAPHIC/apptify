import { defineComponent, h, markRaw, mergeProps, nextTick, ref, useId, type PropType, type CSSProperties } from 'vue'
import { ChevronLeft, ChevronRight, ImageOff, X, Search } from 'lucide-vue-next'
import { appleKey, createApple, motionProps, resolveMotion, themeStyle, type AppleContext, type Motion } from '../core/context'
import { AppleOverlayHost, InternalImageViewer, type AppleViewerImage } from './overlays'
import { clamp, type PhotoSize } from '../core/image-geometry'
import { isVerticalScreen } from '../core/device'
import { scrollGallery, stopGalleryScroll, wheelGallery } from '../core/image-gallery-motion'
import { GalleryScrollbar } from './gallery-scrollbar'
import { AppleButton } from './button'
import { AppleLink } from './link'
export { AppleLink } from './link'
import AppleCard from './AppleCard.vue'
export { AppleCard }
export { AppleButton } from './button'

const providerKey: symbol = Symbol('apple-provider-scope')

export const AppleProvider = defineComponent({
  name: 'AppleProvider',
  inject: { parentApple: { from: appleKey, default: null }, nested: { from: providerKey, default: false } },
  props: { theme: String, motion: String as PropType<Motion> },
  data() {
    const parent = this.parentApple as unknown as AppleContext | null
    const context = this.nested || this.theme || this.motion ? createApple({ theme: this.theme ?? parent?.theme.value.name, motion: this.motion ?? parent?.motion.value.mode, ripple: parent?.ripple.value.enabled, themes: parent?.theme.value.themes }) : (parent ?? createApple())
    // Glass and ripple preferences belong to the app, including local themes.
    if (parent && parent !== context) { context.glass = parent.glass; context.ripple = parent.ripple }
    return { context: ref(context) }
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
      'data-apple-ripple-enabled': String(this.context.ripple.value.enabled),
    }, [this.$slots.default?.(), h('div', { ref: 'portals', 'data-apple-portals': '' }), h(AppleOverlayHost)])
  },
})

export interface AppleImageItem extends Omit<AppleViewerImage, 'src'> {
  src?: string
  label?: string
  value?: string | number
  description?: string
}

export const AppleImage = defineComponent({
  inheritAttrs: false,
  setup: () => ({ uid: useId(), isVerticalScreen }),
  inject: { apple: { from: appleKey, default: null } },
  name: 'AppleImage', props: {
    ...motionProps,
    preview: { type: Boolean, default: true }, gallery: { type: [Object, Array] as PropType<AppleImageItem | Array<string | AppleImageItem>>, default: () => [] },
    carousel: Boolean, disabled: Boolean, label: { type: String, default: '图片轮播' },
    autoplay: { type: Boolean, default: true }, interval: { type: Number, default: 5000 },
    galleryLayout: { type: String as PropType<'compact' | 'tiled' | 'tiled-wrap'>, default: 'compact' },
    galleryShape: { type: String as PropType<'natural' | 'square'>, default: 'natural' },
    index: { type: Number, default: 0 }, squared: Boolean, aspectRatio: { type: [String, Number], default: '4/3' },
    fit: { type: String as PropType<'contain' | 'cover'>, default: 'cover' },
  },
  emits: ['update:index', 'change'],
  data() { return {
    open: false, previewing: false, failed: false, loaded: false, previewIndex: Number.isFinite(this.index) ? Math.trunc(this.index) : 0,
    thumbnails: markRaw(new Map<number, HTMLImageElement>()),
    autoplayTimer: null as ReturnType<typeof setTimeout> | null, hovered: false, focused: false,
    pageHidden: typeof document !== 'undefined' && document.hidden, arrowCenter: null as number | null,
    galleryLoaded: {} as Record<number, boolean>, galleryFailed: {} as Record<number, boolean>,
    gallerySizes: {} as Record<string, PhotoSize>, gallerySnap: null as string | null,
    galleryTarget: null as number | null,
    galleryObserver: null as ResizeObserver | null,
    galleryDrag: null as { id: number; x: number; left: number; moved: boolean; snap: string } | null, galleryClickUntil: 0,
  } },
  computed: {
    imageMotion(): string {
      const ctx = this.apple as AppleContext | null
      return resolveMotion(this.motion, ctx?.motion.value.mode, ctx?.motion.value.reduced)
    },
    imageItems(): AppleImageItem[] {
      const items = Array.isArray(this.gallery) ? this.gallery : [this.gallery]
      return items.flatMap(item => {
        if (typeof item === 'string') return item.trim() ? [{ src: item }] : []
        if (!item || typeof item !== 'object') return []
        if (typeof item.src === 'string' && item.src.trim()) return [item]
        return this.carousel && (this.$slots.item || item.label || item.description) ? [item] : []
      })
    },
    images(): AppleViewerImage[] {
      return this.imageItems.map((item, index) => ({ ...item, src: typeof item.src === 'string' ? item.src : '', title: item.title ?? item.label, alt: item.alt ?? item.label ?? `图片 ${index + 1}` }))
    },
    grouped(): boolean { return this.images.length > 1 || this.carousel && this.images.length > 0 },
    layout(): 'compact' | 'tiled' | 'tiled-wrap' { return this.carousel ? 'compact' : this.galleryLayout },
    canAutoplay(): boolean { return this.carousel && this.autoplay && this.interval > 0 && Number.isFinite(this.interval) && this.images.length > 1 && !this.disabled && !this.previewing && !this.hovered && !this.focused && !this.pageHidden && !this.galleryDrag },
  },
  watch: {
    imageMotion(value: string) {
      if (value !== 'full') this.origin(this.galleryTarget ?? this.previewIndex)
    },
    canAutoplay() { this.restartAutoplay() },
    interval() { this.restartAutoplay() },
    previewIndex() { this.restartAutoplay(); void nextTick(this.measureArrows) },
    index(value: number) {
      const index = this.normalizeIndex(value)
      if (index === this.previewIndex) return
      this.previewIndex = index; if (!this.previewing) void nextTick(() => this.origin(index))
    },
    layout() { void nextTick(() => this.origin(this.previewIndex)) },
    carousel() { void nextTick(() => { this.origin(this.previewIndex); this.measureArrows() }) },
    galleryShape() { void nextTick(() => this.origin(this.previewIndex)) },
    gallery: { deep: true, handler() {
      this.failed = false; this.loaded = false; this.galleryLoaded = {}; this.galleryFailed = {}; this.previewIndex = this.normalizeIndex(this.previewIndex)
      if (!this.images.length) this.open = false
      this.restartAutoplay()
      void nextTick(() => { this.inspectThumbnails(); this.origin(this.previewIndex); this.observeGallery(); this.measureArrows() })
    } },
  },
  mounted() {
    this.previewIndex = this.normalizeIndex(this.previewIndex)
    document.addEventListener('visibilitychange', this.syncVisibility)
    this.restartAutoplay()
    void nextTick(() => { this.inspectThumbnails(); this.origin(this.previewIndex); this.observeGallery(); this.measureArrows() })
  },
  beforeUnmount() { this.stopAutoplay(); document.removeEventListener('visibilitychange', this.syncVisibility); this.cancelGalleryScroll(); this.galleryObserver?.disconnect() },
  methods: {
    stopAutoplay() { if (this.autoplayTimer !== null) clearTimeout(this.autoplayTimer); this.autoplayTimer = null },
    restartAutoplay() {
      this.stopAutoplay()
      if (!this.canAutoplay) return
      this.autoplayTimer = setTimeout(() => {
        this.autoplayTimer = null
        if (this.canAutoplay) this.showImage((this.previewIndex + 1) % this.images.length)
        this.restartAutoplay()
      }, this.interval)
    },
    syncVisibility() { this.pageHidden = document.hidden },
    measureArrows() {
      const surface = this.$refs.surface as HTMLElement | undefined
      const slide = (this.$refs.gallery as HTMLElement | undefined)?.children[this.previewIndex] as HTMLElement | undefined
      const picture = slide?.querySelector<HTMLElement>('.apple-image__slide-picture')
      const surfaceRect = surface?.getBoundingClientRect(), pictureRect = picture?.getBoundingClientRect()
      this.arrowCenter = surface && surfaceRect?.height && pictureRect ? (pictureRect.top - surfaceRect.top + pictureRect.height / 2) * surface.offsetHeight / surfaceRect.height : null
    },
    stepImage(direction: number) {
      this.showImage(this.carousel ? (this.previewIndex + direction + this.images.length) % this.images.length : this.previewIndex + direction)
    },
    normalizeIndex(value: number): number { return clamp(Number.isFinite(value) ? Math.trunc(value) : 0, 0, Math.max(0, this.images.length - 1)) },
    observeGallery() {
      this.galleryObserver?.disconnect()
      const box = this.$refs.gallery as HTMLElement | undefined
      if (!box || typeof ResizeObserver === 'undefined') return
      let width = box.clientWidth
      this.galleryObserver = markRaw(new ResizeObserver(() => {
        if (box.clientWidth !== width) {
          width = box.clientWidth
          this.origin(this.galleryTarget ?? this.previewIndex)
        }
        this.measureArrows()
      }))
      this.galleryObserver.observe(box)
      Array.from(box.children).forEach(slide => {
        const picture = slide.querySelector('.apple-image__slide-picture')
        if (picture) this.galleryObserver?.observe(picture)
      })
    },
    cancelGalleryScroll() {
      const box = this.$refs.gallery as HTMLElement | undefined
      if (box) stopGalleryScroll(box)
      this.galleryTarget = null
    },
    interruptGalleryScroll() { this.cancelGalleryScroll(); this.scrolled() },
    galleryWheel(event: WheelEvent) {
      if (this.layout !== 'compact') { this.interruptGalleryScroll(); return }
      if (this.previewing || event.ctrlKey) return
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX
      if (!delta || !event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta)) return
      if (this.disabled) { event.preventDefault(); return }
      const box = this.$refs.gallery as HTMLElement | undefined
      if (!box) return
      event.preventDefault()
      this.galleryTarget = null
      wheelGallery(box, delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.clientWidth : 1), this.imageMotion === 'full')
    },
    afterPreview() {
      this.previewing = false
      const box = this.$refs.gallery as HTMLElement | undefined
      if (box && this.gallerySnap !== null) box.style.scrollSnapType = this.gallerySnap
      this.gallerySnap = null
    },
    origin(index: number, reveal = true): HTMLImageElement | null {
      if (reveal) this.cancelGalleryScroll()
      const image = this.thumbnails.get(this.grouped ? index : 0) ?? null
      if (!reveal || !this.grouped) return image
      const box = this.$refs.gallery as HTMLElement | undefined
      const trigger = box?.children[index] as HTMLElement | undefined
      if (this.layout === 'tiled-wrap') {
        trigger?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        return image
      }
      if (box && trigger) {
        // Center the destination, then clamp to both ends so the strip never exposes a gap.
        box.scrollLeft = clamp(trigger.offsetLeft - (box.clientWidth - trigger.offsetWidth) / 2, 0, box.scrollWidth - box.clientWidth)
      }
      return image
    },
    showImage(index: number, snap?: string) {
      if (this.previewing || this.disabled) return
      index = this.normalizeIndex(index)
      if (index === this.galleryTarget) return
      const box = this.$refs.gallery as HTMLElement | undefined
      const trigger = box?.children[index] as HTMLElement | undefined
      if (!box || !trigger) return
      if (this.layout === 'tiled-wrap') {
        this.changed(index)
        trigger.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
        return
      }
      const left = clamp(trigger.offsetLeft - (box.clientWidth - trigger.offsetWidth) / 2, 0, box.scrollWidth - box.clientWidth)
      const adjacent = Math.abs(index - this.previewIndex) <= 1
      this.galleryTarget = index
      this.changed(index)
      scrollGallery(box, left, this.imageMotion === 'full', () => { this.galleryTarget = null }, adjacent, snap)
    },
    scrolled() {
      if (this.previewing || this.disabled || this.galleryTarget !== null) return
      const box = this.$refs.gallery as HTMLElement | undefined
      if (!box) return
      const center = box.scrollLeft + box.clientWidth / 2
      let index = this.previewIndex, nearest = Infinity
      Array.from(box.children).forEach((element, i) => {
        const trigger = element as HTMLElement
        const distance = Math.abs(trigger.offsetLeft + trigger.offsetWidth / 2 - center)
        if (distance < nearest) { nearest = distance; index = i }
      })
      if (index !== this.previewIndex) this.changed(index)
    },
    galleryPointerDown(event: PointerEvent) {
      this.interruptGalleryScroll()
      if (event.pointerType !== 'mouse' || event.button !== 0 || this.previewing || this.disabled || this.layout === 'tiled-wrap') return
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
      this.galleryDrag = null
      if (drag.moved) {
        this.galleryClickUntil = performance.now() + 400
        this.scrolled()
        if (this.layout === 'compact') this.showImage(this.previewIndex, drag.snap)
        else box.style.scrollSnapType = drag.snap
      } else box.style.scrollSnapType = drag.snap
    },
    galleryKeydown(event: KeyboardEvent) {
      if (this.disabled || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const index = this.normalizeIndex(event.key === 'Home' ? 0 : event.key === 'End' ? this.images.length - 1 : this.previewIndex + (event.key === 'ArrowRight' ? 1 : -1))
      this.showImage(index)
      const trigger = (this.$refs.gallery as HTMLElement | undefined)?.children[index] as HTMLElement | undefined
      trigger?.focus({ preventScroll: true })
    },
    previewImage(index: number) {
      if (!this.images[index]?.src || this.disabled || this.previewing || performance.now() < this.galleryClickUntil || !this.preview || (this.grouped ? this.galleryFailed[index] : this.failed)) return
      this.cancelGalleryScroll()
      this.previewIndex = this.normalizeIndex(index); this.previewing = true; this.open = true
      const box = this.$refs.gallery as HTMLElement | undefined
      if (box) { this.gallerySnap = box.style.scrollSnapType; box.style.scrollSnapType = 'none' }
    },
    changed(index: number) {
      this.previewIndex = index; this.$emit('update:index', index); this.$emit('change', index)
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
    slideLabel(index: number): string {
      const item = this.imageItems[index]
      return (typeof item === 'object' ? item.label : undefined) ?? this.images[index]?.title ?? this.images[index]?.alt ?? `图片 ${index + 1}`
    },
    thumbnail(image: AppleViewerImage, index: number) {
      const failed = this.grouped ? this.galleryFailed[index] : this.failed
      const item = this.imageItems[index] ?? image
      const metadata = typeof item === 'string' ? image as AppleImageItem : item
      const active = index === this.normalizeIndex(this.previewIndex)
      const content = this.carousel ? this.$slots.item?.({ item: metadata, index, active }) : undefined
      const picture = failed ? [h(ImageOff, { size: 28 }), h('span', '图片无法加载')] : image.src ? [h('img', {
        ref: (element: unknown) => { if (element) this.thumbnails.set(index, element as HTMLImageElement); else this.thumbnails.delete(index) },
        src: image.src, alt: image.alt ?? '', loading: this.grouped ? 'eager' : 'lazy', draggable: false,
        width: image.width, height: image.height,
        style: { objectFit: this.squared || this.galleryShape === 'square' ? 'cover' : this.fit },
        onError: () => { if (this.grouped) this.galleryFailed[index] = true; else this.failed = true },
        onLoad: (event: Event) => this.loadedThumbnail(image.src, index, event.target as HTMLImageElement),
      })] : []
      const canPreview = !!image.src && this.preview && !this.disabled && !failed
      const trigger = h(canPreview ? 'button' : 'div', {
        key: `${index}:${image.src}`, class: this.carousel ? 'apple-image__slide-picture' : 'apple-image__trigger', type: canPreview ? 'button' : undefined,
        'aria-label': canPreview ? `放大图片：${image.alt ?? `图片 ${index + 1}`}` : undefined,
        style: this.grouped && this.layout !== 'compact' ? { aspectRatio: String(this.tileRatio(image)) } : undefined,
        onClick: () => this.previewImage(index),
      }, picture)
      if (!this.carousel) return trigger
      return h('div', {
        key: metadata.value ?? `${index}:${image.src}`, class: 'apple-image__trigger apple-image__slide',
        role: 'group', 'aria-roledescription': '幻灯片', 'aria-label': `${index + 1} / ${this.images.length}：${this.slideLabel(index)}`,
        inert: !active || undefined, 'aria-hidden': !active || undefined,
      }, content ?? [trigger, metadata.label || metadata.description ? h('div', { class: 'apple-image__slide-caption' }, [metadata.label ? h('strong', metadata.label) : null, metadata.description ? h('p', metadata.description) : null]) : null])
    },
  },
  render() {
    const index = this.normalizeIndex(this.previewIndex)
    const { src: _legacySrc, alt: _legacyAlt, ...attrs } = this.$attrs
    const ctx = this.apple as AppleContext | null
    const mode = resolveMotion(this.motion, ctx?.motion.value.mode, ctx?.motion.value.reduced)
    const ratio = this.squared || this.galleryShape === 'square' ? '1' : String(this.aspectRatio)
    return h('figure', mergeProps(attrs, {
      class: ['apple-image', { 'apple-image--loaded': this.loaded && !this.failed && !this.open, 'apple-image--group': this.grouped }],
      'data-vertical-screen': this.isVerticalScreen || undefined,
      'data-apple-motion': mode, 'data-gallery-layout': this.grouped ? this.layout : undefined, 'data-carousel': this.carousel || undefined,
      role: this.carousel ? 'region' : undefined, 'aria-roledescription': this.carousel ? '轮播图' : undefined, 'aria-label': this.carousel ? this.label : undefined,
      'data-gallery-shape': this.grouped ? this.squared ? 'square' : this.galleryShape : undefined, 'data-index': index,
      style: this.grouped ? {} : { aspectRatio: ratio },
      onMouseenter: () => { this.hovered = true }, onMouseleave: () => { this.hovered = false },
      onFocusin: () => { this.focused = true },
      onFocusout: (event: FocusEvent) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.focused = false },
    }), [
      h('div', { ref: 'surface', class: 'apple-image__surface', style: this.grouped && this.layout === 'compact' ? { aspectRatio: ratio } : undefined, onWheel: this.grouped ? this.galleryWheel : undefined }, [
        this.grouped ? h('div', {
          ref: 'gallery', id: `${this.uid}-gallery`,
          role: 'group', tabindex: this.disabled ? -1 : 0, 'aria-label': this.carousel ? this.label : '图片组', class: ['apple-image__gallery', `apple-image__gallery--${this.layout}`, { 'is-dragging': this.galleryDrag?.moved }],
          style: this.disabled ? { overflowX: 'hidden' } : undefined,
          onScroll: this.scrolled, onKeydown: this.galleryKeydown, onPointerdown: this.galleryPointerDown, onPointermove: this.galleryPointerMove,
          onPointerup: this.galleryPointerUp, onPointercancel: this.galleryPointerUp, onLostpointercapture: this.galleryPointerUp,
        }, this.images.map((image, i) => this.thumbnail(image, i))) : this.images[0] ? this.thumbnail(this.images[0], 0) : h('div', { class: 'apple-image__trigger apple-image__trigger--empty', role: 'img', 'aria-label': '暂无图片' }, [h(ImageOff, { size: 28, 'aria-hidden': true }), h('span', '暂无图片')]),
        !this.isVerticalScreen && this.images.length > 1 && this.layout === 'compact' ? h('div', { class: 'apple-image__arrows', role: 'group', 'aria-label': '图片翻页', style: { top: this.arrowCenter === null ? '50%' : `${this.arrowCenter}px` } }, [
          h('button', { type: 'button', class: 'apple-image__arrow apple-image__arrow--prev', 'aria-label': '上一张图片', disabled: this.disabled || !this.carousel && index === 0, onClick: () => this.stepImage(-1) }, h(ChevronLeft, { size: 22, 'aria-hidden': true })),
          h('button', { type: 'button', class: 'apple-image__arrow apple-image__arrow--next', 'aria-label': '下一张图片', disabled: this.disabled || !this.carousel && index === this.images.length - 1, onClick: () => this.stepImage(1) }, h(ChevronRight, { size: 22, 'aria-hidden': true })),
        ]) : null,
      ]),
      this.grouped && this.layout === 'tiled' ? h(GalleryScrollbar, {
        target: () => this.$refs.gallery as HTMLElement | undefined, controls: `${this.uid}-gallery`,
        onInteraction: this.interruptGalleryScroll,
      }) : null,
      this.grouped && this.layout === 'compact' ? h('div', { class: 'apple-image__pagination', role: 'group', 'aria-label': this.carousel ? '选择幻灯片' : '图片组分页' }, [
        h('div', { class: 'apple-image__dots' }, this.images.map((_, i) => h('button', {
          type: 'button', class: 'apple-image__dot', disabled: this.disabled, 'aria-label': this.carousel ? `查看${this.slideLabel(i)}` : `显示第 ${i + 1} 张图片`, 'aria-current': i === index ? 'true' : undefined, 'aria-controls': `${this.uid}-gallery`,
          onClick: () => this.showImage(i),
        }, h('span', { 'aria-hidden': true })))),
        h('span', { class: 'apple-image__count', 'aria-live': 'polite', 'aria-atomic': 'true' }, `${index + 1} / ${this.images.length}`),
      ]) : null,
      h(InternalImageViewer, {
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

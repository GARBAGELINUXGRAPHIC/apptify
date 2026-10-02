import { overlayZIndex, imageReturnZIndex } from '../core/layers'
import { Teleport, defineComponent, h, markRaw, mergeProps, nextTick, type CSSProperties, type PropType } from 'vue'
import { CircleAlert, LoaderCircle, X } from 'lucide-vue-next'
import { appleKey, motionProps, resolveMotion, type AppleContext } from '../core/context'
import { boundPhoto, clamp, fitPhoto, thumbnailGeometry, type PhotoGeometry, type PhotoPoint, type PhotoSize } from '../core/image-geometry'
import type { AppleViewerImage } from './overlays'

type Phase = 'preparing' | 'opening' | 'open' | 'settling' | 'closing'
interface Gesture {
  mode: 'pending' | 'pan' | 'pinch' | 'swipe' | 'dismiss' | 'blocked'
  start: PhotoPoint; pan: PhotoPoint; scale: number; distance: number; anchor: PhotoPoint
  multiple: boolean; moved: boolean; lastY: number; lastTime: number; velocity: number
  swipe: number; samples: Array<{ x: number; time: number }>
}
interface Mask { image: HTMLImageElement; parent: HTMLElement; opacity: string; background: string }
interface PhotoLayer {
  element: HTMLElement; restore: HTMLElement | null; close: () => void
  top: (value: boolean, depth: number) => void; modal: boolean; trap: boolean
  persistent: () => boolean; arrows?: (event: KeyboardEvent) => void
}
const easing = 'cubic-bezier(.22,.8,.2,1)'
const tapDelay = 200
// A Hermite curve carries the release velocity into the snap and ends at rest.
// Shorten fast snaps so the curve stays monotonic rather than overshooting a page.
const pageTiming = (distance: number, velocity: number, width: number) => {
  if (Math.abs(distance) < .1) return { duration: 0, easing: 'linear' }
  let duration = clamp(220 + Math.abs(distance) / Math.max(1, width) * 160, 220, 400)
  if (velocity) duration = Math.min(duration, Math.abs(distance / velocity) * (distance * velocity > 0 ? 2.5 : 1))
  const slope = velocity * duration / distance
  return { duration, easing: `cubic-bezier(.33333333,${slope / 3},.66666667,1)` }
}
const frameStyle = (rect: PhotoGeometry): CSSProperties => ({
  left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  transform: 'none', borderRadius: `${rect.radius}px`, clipPath: `inset(${rect.inset.map(n => `${n}px`).join(' ')} round ${rect.radius}px)`,
})
const imageStyle = (rect: PhotoGeometry): CSSProperties => ({
  left: `${rect.image.left}px`, top: `${rect.image.top}px`, width: `${rect.image.width}px`, height: `${rect.image.height}px`,
})

// The factory shares the existing document layer stack without creating another stack.
export function createMobileImageViewer(registerLayer: (layer: PhotoLayer) => () => void) {
  return defineComponent({
    name: 'AppleMobileImageViewer', inheritAttrs: false,
    inject: { apple: { from: appleKey, default: undefined } },
    props: {
      ...motionProps, modelValue: Boolean, index: { type: Number, default: 0 }, loop: Boolean,
      images: { type: Array as PropType<Array<string | AppleViewerImage>>, default: () => [] },
      origin: Function as PropType<(index: number, reveal?: boolean) => HTMLImageElement | null>,
    },
    emits: ['update:modelValue', 'update:index', 'change', 'close', 'after-close', 'error'],
    data: () => ({
      present: false, current: 0, phase: 'preparing' as Phase, isTop: false, depth: 0,
      viewport: { width: 0, height: 0 } as PhotoSize,
      sizes: {} as Record<number, PhotoSize>, failures: {} as Record<number, boolean>,
      scale: 1, pan: { x: 0, y: 0 } as PhotoPoint, drag: { x: 0, y: 0 } as PhotoPoint, swipe: 0,
      paging: null as { from: number; direction: number } | null,
      zooming: false,
      flight: null as PhotoGeometry | null, background: 0, chrome: 0,
      pointers: markRaw(new Map<number, PhotoPoint>()), gesture: null as Gesture | null,
      pendingTap: null as { point: PhotoPoint; time: number; index: number } | null, tapTimer: null as number | null,
      masked: null as Mask | null, animations: markRaw([] as Animation[]), epoch: 0, suppressClickUntil: 0,
      disposeLayer: null as (() => void) | null, resizeObserver: null as ResizeObserver | null,
    }),
    computed: {
      resolvedMotion(): string {
        const context = this.apple as unknown as AppleContext | undefined
        return resolveMotion(this.motion, context?.motion.value.mode ?? 'auto', context?.motion.value.reduced ?? false)
      },
      pictures(): AppleViewerImage[] { return this.images.map(image => typeof image === 'string' ? { src: image } : image) },
      loaded(): boolean { return Boolean(this.sizes[this.current]) && !this.failures[this.current] },
      fitted(): PhotoSize { return fitPhoto(this.sizes[this.current] ?? { width: 0, height: 0 }, this.viewport) },
      dragScale(): number { return Math.max(.62, 1 - this.drag.y / Math.max(1, this.viewport.height) * .45) },
      backdropOpacity(): number { return this.phase === 'open' && this.drag.y > 0 ? Math.pow(1 - clamp(this.drag.y / (this.viewport.height * .8), 0, 1), 1.5) : this.background },
    },
    watch: {
      resolvedMotion(value: string) { if (value !== 'full') this.animations.forEach(animation => animation.finish()) },
      isTop(value: boolean) { if (!value) this.clearTap() },
      modelValue(value: boolean) { if (value) void this.openViewer(); else if (this.present) void this.closeViewer(false) },
      index(value: number) { if (this.present && this.phase === 'open' && value !== this.current) void this.select(value) },
      images: {
        deep: true,
        handler() {
          this.clearTap()
          this.sizes = {}; this.failures = {}
          this.current = clamp(this.current, 0, Math.max(0, this.images.length - 1))
          this.scale = 1; this.pan = { x: 0, y: 0 }
          if (this.present) { this.maskThumbnail(); void this.inspectImages() }
        },
      },
    },
    mounted() { if (this.modelValue) void this.openViewer() },
    beforeUnmount() { this.clearTap(); this.cancelAnimations(); this.restoreThumbnail(); this.resizeObserver?.disconnect(); this.disposeLayer?.() },
    methods: {
      clearTap() {
        if (this.tapTimer !== null) window.clearTimeout(this.tapTimer)
        this.tapTimer = null; this.pendingTap = null
      },
      tap(point: PhotoPoint) {
        if (!this.present || !this.isTop || this.phase !== 'open') return
        const previous = this.pendingTap, now = performance.now()
        const double = previous && previous.index === this.current && now - previous.time <= tapDelay && Math.hypot(point.x - previous.point.x, point.y - previous.point.y) <= 32
        this.clearTap()
        if (double) {
          this.suppressClickUntil = now + 400
          void this.toggleZoom(point)
          return
        }
        this.pendingTap = { point, time: now, index: this.current }
        this.tapTimer = window.setTimeout(() => {
          const pending = this.pendingTap
          this.clearTap()
          if (pending?.index === this.current && this.phase === 'open' && !this.pointers.size) this.close()
        }, tapDelay)
      },
      cancelAnimations() { this.epoch++; this.animations.splice(0).forEach(animation => animation.cancel()) },
      async animate(entries: Array<{ element: HTMLElement; from: Keyframe; to: Keyframe }>, duration: number, curve = easing) {
        const epoch = this.epoch
        if (!duration) return epoch === this.epoch
        const animations = entries.filter(entry => typeof entry.element.animate === 'function').map(({ element, from, to }) =>
          markRaw(element.animate([from, to], { duration, easing: curve, fill: 'both' })))
        this.animations.push(...animations)
        await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
        return epoch === this.epoch
      },
      measure() {
        const panel = this.$refs.panel as HTMLElement | undefined
        if (!panel) return
        const rect = panel.getBoundingClientRect()
        this.viewport = { width: rect.width, height: rect.height }
      },
      async openViewer() {
        if (this.present && this.phase !== 'closing') return
        this.clearTap()
        this.cancelAnimations()
        this.present = true; this.phase = 'preparing'; this.current = clamp(this.index, 0, Math.max(0, this.images.length - 1))
        this.scale = 1; this.pan = { x: 0, y: 0 }; this.drag = { x: 0, y: 0 }; this.swipe = 0
        this.paging = null; this.zooming = false
        this.flight = null; this.background = this.origin ? 0 : 1; this.chrome = 0
        this.pointers.clear(); this.gesture = null
        await nextTick()
        const panel = this.$refs.panel as HTMLElement | undefined
        if (!panel || !this.modelValue) return
        this.measure()
        if (!this.disposeLayer) this.disposeLayer = registerLayer({
          element: panel, restore: panel.ownerDocument.activeElement as HTMLElement | null,
          close: () => this.close(), persistent: () => this.phase === 'closing', modal: true, trap: true,
          top: (value, depth) => { this.isTop = value; this.depth = depth },
          arrows: event => { event.preventDefault(); if (this.phase === 'open') void this.select(this.current + (event.key === 'ArrowRight' ? 1 : -1)) },
        })
        this.resizeObserver?.disconnect()
        if (typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = markRaw(new ResizeObserver(() => {
            const before = this.viewport
            this.measure()
            if (this.phase === 'open' && (before.width !== this.viewport.width || before.height !== this.viewport.height)) {
              this.clearTap()
              this.drag = { x: 0, y: 0 }; this.swipe = 0
              this.pointers.clear(); this.gesture = null
              this.pan = boundPhoto(this.pan, this.fitted, this.viewport, this.scale)
            }
          }))
          this.resizeObserver.observe(panel)
        }
        await this.inspectImages()
        if (!this.pictures.length) { this.phase = 'open'; this.background = 1; this.chrome = 1 }
      },
      async inspectImages() {
        await nextTick()
        const panel = this.$refs.panel as HTMLElement | undefined
        panel?.querySelectorAll<HTMLImageElement>('.apple-viewer-photo').forEach(image => {
          if (image.complete && image.naturalWidth) this.imageLoaded(Number(image.dataset.index), image)
        })
      },
      imageLoaded(index: number, image: HTMLImageElement) {
        if (!image.naturalWidth || !image.naturalHeight) return
        this.sizes[index] = { width: image.naturalWidth, height: image.naturalHeight }
        this.failures[index] = false
        if (index === this.current && this.phase === 'preparing') void this.enter()
      },
      imageFailed(index: number, event: Event) {
        this.failures[index] = true
        if (index === this.current) {
          this.phase = 'open'; this.background = 1; this.chrome = 1
          this.$emit('error', event)
        }
      },
      restoreThumbnail() {
        const mask = this.masked
        if (!mask) return
        mask.image.style.opacity = mask.opacity
        mask.parent.style.backgroundColor = mask.background
        mask.parent.classList.remove('apple-image__trigger--placeholder')
        this.masked = null
      },
      maskThumbnail(reveal = true): HTMLImageElement | null {
        const image = this.origin?.(this.current, reveal) ?? null
        if (image === this.masked?.image) return image
        this.restoreThumbnail()
        if (image?.parentElement) {
          const parent = image.parentElement
          this.masked = markRaw({ image, parent, opacity: image.style.opacity, background: parent.style.backgroundColor })
          parent.style.backgroundColor = '#000'; parent.classList.add('apple-image__trigger--placeholder'); image.style.opacity = '0'
        }
        return image
      },
      normalGeometry(): PhotoGeometry {
        const scale = this.scale * this.dragScale
        const width = this.fitted.width * scale, height = this.fitted.height * scale
        return {
          left: (this.viewport.width - width) / 2 + this.pan.x + this.drag.x,
          top: (this.viewport.height - height) / 2 + this.pan.y + this.drag.y,
          width, height, image: { left: 0, top: 0, width, height }, radius: 0, inset: [0, 0, 0, 0],
        }
      },
      async fly(from: PhotoGeometry, to: PhotoGeometry, opening: boolean) {
        const liveBackdrop = this.$refs.backdrop as HTMLElement | undefined
        const liveChrome = this.$refs.chrome as HTMLElement | undefined
        const backdropFrom = liveBackdrop ? Number(getComputedStyle(liveBackdrop).opacity) : this.backdropOpacity
        const chromeFrom = liveChrome?.firstElementChild ? Number(getComputedStyle(liveChrome.firstElementChild).opacity) : this.chrome
        this.cancelAnimations()
        this.zooming = false
        const duration = this.resolvedMotion === 'none' ? 0 : this.resolvedMotion === 'reduced' ? 120 : opening ? 440 : 420
        const full = this.resolvedMotion === 'full'
        this.flight = full ? from : null
        this.background = backdropFrom; this.chrome = chromeFrom
        this.phase = opening ? 'opening' : 'closing'
        await nextTick()
        const panel = this.$refs.panel as HTMLElement | undefined
        const frame = panel?.querySelector<HTMLElement>('.apple-viewer-canvas')
        const photo = frame?.querySelector<HTMLElement>('.apple-viewer-image')
        const backdrop = this.$refs.backdrop as HTMLElement | undefined
        const header = this.$refs.chrome as HTMLElement | undefined
        const entries: Array<{ element: HTMLElement; from: Keyframe; to: Keyframe }> = []
        if (full && frame && photo) {
          entries.push({ element: frame, from: frameStyle(from) as Keyframe, to: frameStyle(to) as Keyframe })
          entries.push({ element: photo, from: imageStyle(from) as Keyframe, to: imageStyle(to) as Keyframe })
        }
        if (backdrop) entries.push({ element: backdrop, from: { opacity: backdropFrom }, to: { opacity: opening ? 1 : 0 } })
        // Fade each control, keeping the photo inside its backdrop-filter sampling area.
        if (header) Array.from(header.children).forEach(element => entries.push({ element: element as HTMLElement, from: { opacity: chromeFrom }, to: { opacity: opening ? 1 : 0 } }))
        const epoch = this.epoch
        if (!await this.animate(entries, duration) || epoch !== this.epoch) return false
        this.background = opening ? 1 : 0; this.chrome = opening ? 1 : 0
        this.flight = full ? to : null
        await nextTick()
        this.cancelAnimations()
        return true
      },
      async enter() {
        if (this.phase !== 'preparing' || !this.present) return
        // Mark synchronously so cached images cannot start two opening animations.
        this.phase = 'opening'
        await nextTick()
        if (!this.present || this.phase !== 'opening') return
        this.measure()
        const panel = this.$refs.panel as HTMLElement
        const image = this.maskThumbnail(false)
        const to = this.normalGeometry()
        const from = image ? thumbnailGeometry(image, panel.getBoundingClientRect()) ?? to : to
        if (!await this.fly(from, to, true) || !this.modelValue) return
        this.flight = null; this.phase = 'open'
        // Reposition the strip once the opening backdrop is fully opaque.
        this.maskThumbnail()
      },
      close() { if (this.present && this.phase !== 'closing' && this.isTop) void this.closeViewer(true) },
      async closeViewer(emit: boolean) {
        if (!this.present || this.phase === 'closing') return
        this.clearTap()
        const panel = this.$refs.panel as HTMLElement | undefined
        const frame = panel?.querySelector<HTMLElement>('.apple-viewer-canvas')
        const photo = frame?.querySelector<HTMLElement>('.apple-viewer-image')
        const bounds = panel?.getBoundingClientRect()
        let from = this.normalGeometry()
        if (frame && photo && bounds) {
          const rect = frame.getBoundingClientRect(), painted = photo.getBoundingClientRect()
          const css = getComputedStyle(frame)
          const values = css.clipPath.match(/^inset\(([^)]*)\)/)?.[1].split('round')[0].trim().split(/\s+/).map(value => parseFloat(value)) ?? [0]
          const inset: [number, number, number, number] = [values[0], values[1] ?? values[0], values[2] ?? values[0], values[3] ?? values[1] ?? values[0]]
          from = {
            left: rect.left - bounds.left, top: rect.top - bounds.top, width: rect.width, height: rect.height,
            image: { left: painted.left - rect.left, top: painted.top - rect.top, width: painted.width, height: painted.height },
            radius: parseFloat(css.borderRadius) || 0, inset,
          }
        }
        const thumbnail = this.maskThumbnail(this.phase !== 'preparing' && this.phase !== 'opening')
        const to = thumbnail && bounds ? thumbnailGeometry(thumbnail, bounds) ?? from : from
        this.pointers.clear(); this.gesture = null; this.suppressClickUntil = performance.now() + 400
        this.swipe = 0; this.paging = null
        // Continue from the captured photo geometry and live backdrop when interrupted.
        const flight = this.fly(from, to, false)
        if (emit) { this.$emit('update:modelValue', false); this.$emit('close') }
        if (!await flight) return
        this.restoreThumbnail(); this.present = false
        await nextTick()
        this.resizeObserver?.disconnect(); this.disposeLayer?.(); this.disposeLayer = null
        this.$emit('after-close')
      },
      async select(index: number, velocity = 0): Promise<void> {
        if (!this.present || !this.isTop || this.phase !== 'open' || !this.pictures.length) return
        this.clearTap()
        const count = this.pictures.length
        let step = index - this.current
        if (this.loop && Math.abs(step) > count / 2) step -= Math.sign(step) * count
        const direction = Math.sign(step)
        if (this.loop) index = (index % count + count) % count
        if (index < 0 || index >= count) index = this.current
        const changed = index !== this.current
        if (!changed && Math.abs(this.swipe) < .1) { await this.settlePose(); return }
        const panel = this.$refs.panel as HTMLElement
        const slides = Array.from(panel.querySelectorAll<HTMLElement>('.apple-viewer-slide'))
        const before = slides.map(slide => getComputedStyle(slide).transform)
        const frame = panel.querySelector<HTMLElement>('.apple-viewer-canvas')
        const pose = frame ? getComputedStyle(frame).transform : 'none', opacity = this.backdropOpacity
        const previous = this.current, swipe = this.swipe, stride = this.viewport.width + 20
        const timing = pageTiming((changed ? -direction * stride : 0) - swipe, velocity, this.viewport.width)
        this.cancelAnimations(); this.phase = 'settling'; this.paging = { from: previous, direction: changed ? direction : 0 }
        this.current = index; this.swipe = 0
        if (changed) {
          this.scale = 1; this.pan = { x: 0, y: 0 }
          this.maskThumbnail()
          this.$emit('update:index', index); this.$emit('change', index)
        } else {
          this.scale = clamp(this.scale, 1, 8); this.pan = boundPhoto(this.pan, this.fitted, this.viewport, this.scale)
        }
        this.drag = { x: 0, y: 0 }; this.background = 1
        await nextTick()
        const entries: Array<{ element: HTMLElement; from: Keyframe; to: Keyframe }> = changed ? [
          { element: slides[previous], from: { transform: before[previous] }, to: { transform: `translate3d(${-direction * stride}px,0,0)` } },
          { element: slides[index], from: { transform: `translate3d(${direction * stride + swipe}px,0,0)` }, to: { transform: 'translate3d(0,0,0)' } },
        ] : slides.map((slide, i) => ({ element: slide, from: { transform: before[i] }, to: { transform: getComputedStyle(slide).transform } }))
        if (!changed && frame) entries.push({ element: frame, from: { transform: pose }, to: { transform: getComputedStyle(frame).transform } })
        if (!changed) entries.push({ element: this.$refs.backdrop as HTMLElement, from: { opacity }, to: { opacity: 1 } })
        if (!await this.animate(entries, this.resolvedMotion === 'full' ? timing.duration : 0, timing.easing)) return
        this.cancelAnimations(); this.paging = null; this.phase = 'open'
        if (!this.loaded) await this.inspectImages()
      },
      slideOffset(index: number): number {
        const stride = this.viewport.width + 20
        if (this.paging?.direction && index === this.paging.from) return -this.paging.direction * stride
        let difference = index - this.current
        if (this.loop) {
          const count = this.pictures.length
          if (difference > count / 2) difference -= count
          else if (difference < -count / 2) difference += count
          if (count === 2 && difference) difference = this.swipe > 0 ? -1 : 1
        }
        return difference * stride + this.swipe
      },
      atPageEdge(offset: number): boolean {
        return !this.loop && (this.current === 0 && offset > 0 || this.current === this.pictures.length - 1 && offset < 0)
      },
      pageVelocity(gesture: Gesture): number {
        const first = gesture.samples[0], last = gesture.samples.at(-1)!
        const elapsed = last.time - first.time
        return elapsed >= 8 && performance.now() - last.time < 80 ? (last.x - first.x) / elapsed : 0
      },
      point(event: MouseEvent): PhotoPoint {
        const bounds = (this.$refs.panel as HTMLElement).getBoundingClientRect()
        return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      },
      startGesture(multiple = false) {
        const points = [...this.pointers.values()]
        const start = points.length > 1 ? { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 } : points[0]
        if (!start) return
        this.gesture = {
          mode: points.length > 1 ? 'pinch' : this.scale > 1.001 ? 'pan' : 'pending', start, pan: { ...this.pan }, scale: this.scale,
          distance: points.length > 1 ? Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)) : 1,
          anchor: { x: (start.x - this.viewport.width / 2 - this.pan.x) / this.scale, y: (start.y - this.viewport.height / 2 - this.pan.y) / this.scale },
          multiple: multiple || points.length > 1, moved: multiple, lastY: start.y, lastTime: performance.now(), velocity: 0,
          swipe: this.atPageEdge(this.swipe) ? this.swipe * 4 : this.swipe,
          samples: [{ x: this.swipe, time: performance.now() }],
        }
      },
      pointerDown(event: PointerEvent) {
        if (this.isTop && this.phase === 'settling' && (this.paging || this.zooming) && event.button <= 0) {
          const slide = (this.$refs.panel as HTMLElement).querySelector<HTMLElement>('.apple-viewer-slide.is-current')
          const offset = slide ? new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41 : 0
          if (this.zooming) {
            const frame = slide?.querySelector<HTMLElement>('.apple-viewer-canvas')
            const pose = new DOMMatrixReadOnly(frame ? getComputedStyle(frame).transform : undefined)
            this.scale = pose.a; this.pan = { x: pose.m41, y: pose.m42 }
          }
          this.cancelAnimations(); this.paging = null; this.zooming = false; this.swipe = offset; this.phase = 'open'
        }
        if (!this.isTop || this.phase !== 'open' || !this.loaded || event.button > 0) return
        event.preventDefault()
        const point = this.point(event), pending = this.pendingTap
        if (pending) {
          if (performance.now() - pending.time > tapDelay || Math.hypot(point.x - pending.point.x, point.y - pending.point.y) > 32) this.clearTap()
          else if (this.tapTimer !== null) { window.clearTimeout(this.tapTimer); this.tapTimer = null }
        }
        this.pointers.set(event.pointerId, point)
        try { (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId) } catch { /* Synthetic pointers have no browser capture. */ }
        if (this.pointers.size > 1) {
          this.clearTap()
          this.pan = { x: this.pan.x + this.drag.x + this.swipe, y: this.pan.y + this.drag.y }
          this.scale = Math.max(1, this.scale * this.dragScale)
          this.drag = { x: 0, y: 0 }; this.swipe = 0
          this.startGesture(true)
        } else this.startGesture()
      },
      pointerMove(event: PointerEvent) {
        if (!this.isTop || this.phase !== 'open' || !this.pointers.has(event.pointerId) || !this.gesture) return
        event.preventDefault()
        const point = this.point(event)
        this.pointers.set(event.pointerId, point)
        const gesture = this.gesture
        if (this.pointers.size > 1) {
          const [a, b] = [...this.pointers.values()]
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
          this.scale = clamp(gesture.scale * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance, .8, 8.5)
          this.pan = boundPhoto({ x: mid.x - this.viewport.width / 2 - gesture.anchor.x * this.scale, y: mid.y - this.viewport.height / 2 - gesture.anchor.y * this.scale }, this.fitted, this.viewport, this.scale, true)
          gesture.moved = true
          return
        }
        const dx = point.x - gesture.start.x, dy = point.y - gesture.start.y
        if (Math.hypot(dx, dy) > 6) { gesture.moved = true; this.clearTap() }
        if (gesture.mode === 'pending' && gesture.moved) {
          if (Math.abs(dx) > Math.abs(dy) * 1.1) gesture.mode = 'swipe'
          else if (Math.abs(dy) > Math.abs(dx) * 1.1) gesture.mode = dy > 0 ? 'dismiss' : 'blocked'
        }
        if (gesture.mode === 'pan') this.pan = boundPhoto({ x: gesture.pan.x + dx, y: gesture.pan.y + dy }, this.fitted, this.viewport, this.scale, true)
        else if (gesture.mode === 'swipe') {
          const offset = clamp(gesture.swipe + dx, -this.viewport.width - 20, this.viewport.width + 20)
          this.swipe = this.atPageEdge(offset) ? offset * .25 : offset
          const now = performance.now()
          gesture.samples.push({ x: this.swipe, time: now })
          while (gesture.samples.length > 2 && gesture.samples[1].time < now - 80) gesture.samples.shift()
        } else if (gesture.mode === 'dismiss') {
          this.drag = { x: dx * .75, y: Math.max(0, dy) }
          const now = performance.now(), elapsed = now - gesture.lastTime
          if (elapsed > 0) gesture.velocity = (point.y - gesture.lastY) / elapsed
          gesture.lastY = point.y; gesture.lastTime = now
        }
      },
      pointerUp(event: PointerEvent, cancelled = false) {
        if (!this.pointers.has(event.pointerId)) return
        event.preventDefault()
        this.pointers.delete(event.pointerId)
        const gesture = this.gesture
        if (cancelled) this.clearTap()
        if (this.pointers.size) { this.startGesture(true); return }
        this.gesture = null; this.suppressClickUntil = performance.now() + 400
        if (!gesture) return
        if (!cancelled && !gesture.multiple && !gesture.moved) { this.tap(this.point(event)); return }
        if (!cancelled && gesture.mode === 'dismiss' && !gesture.multiple && (this.drag.y > Math.min(140, this.viewport.height * .18) || this.drag.y > 36 && gesture.velocity > .55 && performance.now() - gesture.lastTime < 100)) {
          this.close(); return
        }
        if (gesture.mode === 'swipe' && !gesture.multiple) {
          const velocity = cancelled ? 0 : this.pageVelocity(gesture)
          const projected = this.swipe + velocity * 140
          const advance = !cancelled && Math.abs(projected) > this.viewport.width * .18 && projected * this.swipe > 0
          void this.select(this.current + (advance ? this.swipe < 0 ? 1 : -1 : 0), velocity)
        } else void this.settlePose()
      },
      async settlePose(): Promise<void> {
        const panel = this.$refs.panel as HTMLElement | undefined
        if (!panel || this.phase !== 'open') return
        if (Math.abs(this.swipe) >= .1) { await this.select(this.current); return }
        const frame = panel.querySelector<HTMLElement>('.apple-viewer-canvas')
        const slides = Array.from(panel.querySelectorAll<HTMLElement>('.apple-viewer-slide'))
        const before = frame ? getComputedStyle(frame).transform : 'none'
        const positions = slides.map(slide => getComputedStyle(slide).transform)
        const opacity = this.backdropOpacity
        this.cancelAnimations(); this.phase = 'settling'
        this.scale = clamp(this.scale, 1, 8); this.pan = boundPhoto(this.pan, this.fitted, this.viewport, this.scale)
        this.drag = { x: 0, y: 0 }; this.swipe = 0; this.background = 1
        await nextTick()
        const entries = slides.map((slide, i) => ({ element: slide, from: { transform: positions[i] }, to: { transform: getComputedStyle(slide).transform } }))
        if (frame) entries.push({ element: frame, from: { transform: before }, to: { transform: getComputedStyle(frame).transform } })
        const backdrop = this.$refs.backdrop as HTMLElement
        const duration = this.resolvedMotion === 'full' ? 240 : 0
        if (!await this.animate([...entries, { element: backdrop, from: { opacity }, to: { opacity: 1 } }], duration)) return
        this.cancelAnimations(); this.phase = 'open'
      },
      async toggleZoom(point: PhotoPoint) {
        if (!this.isTop || this.phase !== 'open' || !this.loaded) return
        this.clearTap()
        const panel = this.$refs.panel as HTMLElement
        const frame = panel.querySelector<HTMLElement>('.apple-viewer-canvas')
        if (!frame) return
        const before = getComputedStyle(frame).transform
        const slides = Array.from(panel.querySelectorAll<HTMLElement>('.apple-viewer-slide'))
        const positions = slides.map(slide => getComputedStyle(slide).transform)
        const scale = this.scale > 1.001 ? 1 : 2
        const ratio = scale / this.scale
        const pan = {
          x: point.x - this.viewport.width / 2 - (point.x - this.viewport.width / 2 - this.pan.x - this.swipe) * ratio,
          y: point.y - this.viewport.height / 2 - (point.y - this.viewport.height / 2 - this.pan.y) * ratio,
        }
        this.cancelAnimations(); this.phase = 'settling'; this.zooming = true
        this.scale = scale; this.pan = boundPhoto(pan, this.fitted, this.viewport, scale)
        this.swipe = 0; this.drag = { x: 0, y: 0 }
        await nextTick()
        const entries = slides.map((slide, i) => ({ element: slide, from: { transform: positions[i] }, to: { transform: getComputedStyle(slide).transform } }))
        entries.push({ element: frame, from: { transform: before }, to: { transform: getComputedStyle(frame).transform } })
        if (!await this.animate(entries, this.resolvedMotion === 'full' ? 240 : 0, 'cubic-bezier(.25,.1,.25,1)')) return
        this.cancelAnimations(); this.zooming = false; this.phase = 'open'
      },
      zoom(event: WheelEvent) {
        if (!this.isTop || this.phase !== 'open' || !this.loaded || !Number.isFinite(event.deltaY)) return
        event.preventDefault()
        this.clearTap()
        const point = this.point(event)
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.viewport.height : 1
        const scale = clamp(this.scale * Math.exp(-event.deltaY * unit * .002), 1, 8)
        const ratio = scale / this.scale
        this.pan = boundPhoto({ x: point.x - this.viewport.width / 2 - (point.x - this.viewport.width / 2 - this.pan.x) * ratio, y: point.y - this.viewport.height / 2 - (point.y - this.viewport.height / 2 - this.pan.y) * ratio }, this.fitted, this.viewport, scale)
        this.scale = scale
      },
    },
    render() {
      if (!this.present) return null
      const viewer = h('div', mergeProps(this.$attrs, {
        ref: 'panel', class: 'apple-image-viewer apple-image-viewer--mobile', role: 'dialog', tabindex: -1,
        'aria-label': '图片预览', 'aria-modal': this.isTop ? 'true' : undefined,
        'data-apple-motion': this.resolvedMotion, 'data-phase': this.phase, 'data-scale': this.scale,
        style: { zIndex: this.phase === 'closing' ? imageReturnZIndex(this.depth) : overlayZIndex(this.depth) }, onWheel: this.zoom,
      }), [
        h('div', { ref: 'backdrop', class: 'apple-viewer-backdrop', style: { opacity: this.backdropOpacity } }),
        h('div', {
          class: 'apple-viewer-stage', onPointerdown: this.pointerDown, onPointermove: this.pointerMove,
          onPointerup: (event: PointerEvent) => this.pointerUp(event), onPointercancel: (event: PointerEvent) => this.pointerUp(event, true),
          onClick: (event: MouseEvent) => { if (performance.now() > this.suppressClickUntil) this.tap(this.point(event)) },
          onDblclick: (event: MouseEvent) => {
            event.preventDefault()
            if (performance.now() > this.suppressClickUntil) { this.clearTap(); void this.toggleZoom(this.point(event)) }
          },
        }, this.pictures.map((picture, index) => {
          const active = index === this.current
          const fitted = fitPhoto(this.sizes[index] ?? { width: 0, height: 0 }, this.viewport)
          const offset = this.slideOffset(index)
          return h('div', {
            key: `${index}:${picture.src}`, class: ['apple-viewer-slide', { 'is-current': active }], 'aria-hidden': active ? undefined : 'true',
            style: { transform: `translate3d(${offset}px,0,0)`, visibility: !active && ['preparing', 'opening', 'closing'].includes(this.phase) ? 'hidden' : undefined },
          }, [h('div', {
            class: ['apple-viewer-photo-frame', active ? 'apple-viewer-canvas' : 'apple-viewer-neighbor-canvas'],
            style: active && this.flight ? frameStyle(this.flight) : {
              left: `${(this.viewport.width - fitted.width) / 2}px`, top: `${(this.viewport.height - fitted.height) / 2}px`,
              width: `${fitted.width}px`, height: `${fitted.height}px`,
              transform: active ? `translate3d(${this.pan.x + this.drag.x}px,${this.pan.y + this.drag.y}px,0) scale(${this.scale * this.dragScale})` : 'none',
              visibility: fitted.width && !(active && this.phase === 'preparing') ? 'visible' : 'hidden',
            },
          }, [h('img', {
            class: ['apple-viewer-photo', active ? 'apple-viewer-image' : 'apple-viewer-neighbor-image'],
            src: picture.src, alt: picture.alt ?? '', draggable: false, 'data-index': index,
            style: active && this.flight ? imageStyle(this.flight) : { left: 0, top: 0, width: `${fitted.width}px`, height: `${fitted.height}px` },
            onLoad: (event: Event) => this.imageLoaded(index, event.target as HTMLImageElement), onError: (event: Event) => this.imageFailed(index, event),
            onDragstart: (event: DragEvent) => event.preventDefault(),
          })])])
        })),
        h('div', { ref: 'chrome', class: 'apple-viewer-chrome' }, [
          h('span', { class: 'apple-viewer-count', style: { opacity: this.chrome }, 'aria-live': 'polite', 'aria-atomic': 'true' }, `${this.pictures.length ? this.current + 1 : 0} / ${this.pictures.length}`),
          h('button', { class: 'apple-overlay-icon apple-viewer-close', style: { opacity: this.chrome }, type: 'button', 'aria-label': '关闭图片预览', onClick: this.close }, [h(X, { size: 22, 'aria-hidden': true })]),
          this.pictures[this.current]?.title || this.pictures[this.current]?.alt ? h('div', { class: 'apple-viewer-title', style: { opacity: this.chrome } }, this.pictures[this.current].title || this.pictures[this.current].alt) : null,
        ]),
        !this.loaded && this.phase !== 'closing' ? h('div', { class: 'apple-viewer-status', role: 'status' }, !this.pictures.length ? '暂无图片' : this.failures[this.current]
          ? [h(CircleAlert, { size: 28 }), h('p', '图片加载失败')]
          : [h(LoaderCircle, { class: 'apple-overlay-spin', size: 32, 'aria-label': '图片加载中' })]) : null,
      ])
      const context = this.apple as unknown as AppleContext | undefined
      return context?.portalTarget.value ? h(Teleport, { to: context.portalTarget.value }, viewer) : viewer
    },
  })
}

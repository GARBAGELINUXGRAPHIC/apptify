import { overlayZIndex, imageReturnZIndex } from '../core/layers'
import { Teleport, defineComponent, h, markRaw, mergeProps, nextTick, type CSSProperties, type PropType } from 'vue'
import { ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-vue-next'
import { isVerticalScreen } from '../core/device'
import { MotionDriver } from '../core/motion-driver'
import { appleKey, motionProps, resolveMotion, type AppleContext } from '../core/context'
import { boundPhoto, clamp, fitPhoto, thumbnailGeometry, type PhotoGeometry, type PhotoPoint, type PhotoSize } from '../core/image-geometry'
import { photoEasing, photoFlightFrame, photoFlightSize, photoMotion, photoPageTiming, readPhotoGeometry } from '../core/image-motion'
import type { AppleViewerImage } from './overlays'
import { holdPreviewNavigation } from '../core/preview-navigation'

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
const tapDelay = 200
interface Pose { scale: number; pan: PhotoPoint }
interface Flight { base: PhotoSize; pose: Keyframe; rotation?: number }
const frameStyle = (flight: Flight): CSSProperties => ({
  left: 0, top: 0, width: `${flight.base.width}px`, height: `${flight.base.height}px`,
  transformOrigin: '0 0', transform: String(flight.pose.transform), clipPath: String(flight.pose.clipPath),
})

// The factory shares the existing document layer stack without creating another stack.
export function createMobileImageViewer(registerLayer: (layer: PhotoLayer) => () => void) {
  return defineComponent({
    name: 'AppleMobileImageViewer', inheritAttrs: false,
    setup: () => ({ isVerticalScreen }),
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
      viewportOrigin: { x: 0, y: 0 } as PhotoPoint,
      sizes: {} as Record<number, PhotoSize>, failures: {} as Record<number, boolean>,
      rotations: {} as Record<number, number>,
      scale: 1, pan: { x: 0, y: 0 } as PhotoPoint, drag: { x: 0, y: 0 } as PhotoPoint, swipe: 0,
      dragKind: 'dismiss' as 'pan' | 'dismiss',
      paging: null as { from: number; direction: number } | null,
      flights: {} as Record<number, Flight>, poses: {} as Record<number, Pose>, background: 0, chrome: 0,
      driver: null as MotionDriver | null,
      pointers: markRaw(new Map<number, PhotoPoint>()), gesture: null as Gesture | null,
      pendingTap: null as { point: PhotoPoint; time: number; index: number } | null, tapTimer: null as number | null,
      masked: null as Mask | null, suppressClickUntil: 0,
      disposeLayer: null as (() => void) | null, resizeObserver: null as ResizeObserver | null,
      releaseNavigation: null as (() => void) | null,
    }),
    computed: {
      resolvedMotion(): string {
        const context = this.apple as unknown as AppleContext | undefined
        return resolveMotion(this.motion, context?.motion.value.mode ?? 'auto', context?.motion.value.reduced ?? false)
      },
      pictures(): AppleViewerImage[] { return this.images.map(image => typeof image === 'string' ? { src: image } : image) },
      loaded(): boolean { return Boolean(this.sizes[this.current]) && !this.failures[this.current] },
      flight(): Flight | null { return this.flights[this.current] ?? null },
      fitted(): PhotoSize { return this.fitImage(this.current) },
      dragScale(): number { return this.dragKind === 'pan' ? 1 : Math.max(.62, 1 - this.drag.y / Math.max(1, this.viewport.height) * .45) },
      backdropOpacity(): number { return this.phase !== 'closing' && this.dragKind === 'dismiss' && this.drag.y > 0 ? this.background * Math.pow(1 - clamp(this.drag.y / (this.viewport.height * .8), 0, 1), 1.5) : this.background },
    },
    watch: {
      resolvedMotion(value: string) { if (value !== 'full') this.driver?.finish() },
      isTop(value: boolean) { if (!value) this.clearTap() },
      modelValue(value: boolean) { if (value) void this.openViewer(); else if (this.present) void this.closeViewer(false) },
      index(value: number) { if (this.present && value !== this.current) void this.select(value) },
      images: {
        deep: true,
        handler() {
          this.clearTap()
          this.driver?.cancel(); this.flights = {}; this.poses = {}
          this.pointers.clear(); this.gesture = null; this.drag = { x: 0, y: 0 }; this.swipe = 0; this.paging = null
          this.sizes = {}; this.failures = {}; this.rotations = {}
          this.current = clamp(this.current, 0, Math.max(0, this.images.length - 1))
          this.scale = 1; this.pan = { x: 0, y: 0 }
          if (this.present && !this.modelValue) { void this.finishClose(); return }
          if (this.present) { this.phase = 'open'; this.background = 1; this.chrome = 1; this.maskThumbnail(); void this.inspectImages() }
        },
      },
    },
    mounted() { this.driver = markRaw(new MotionDriver(() => this.refreshPhase())); if (this.modelValue) void this.openViewer() },
    beforeUnmount() { this.clearTap(); this.cancelAnimations(); this.restoreThumbnail(); this.resizeObserver?.disconnect(); this.disposeLayer?.(); this.releaseNavigation?.() },
    methods: {
      fitImage(index: number): PhotoSize {
        const size = this.sizes[index] ?? { width: 0, height: 0 }
        return fitPhoto((this.rotations[index] ?? 0) % 180 ? { width: size.height, height: size.width } : size, this.viewport)
      },
      clearTap() {
        if (this.tapTimer !== null) window.clearTimeout(this.tapTimer)
        this.tapTimer = null; this.pendingTap = null
      },
      tap(point: PhotoPoint) {
        if (!this.present || !this.isTop) return
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
          if (pending?.index === this.current && this.phase !== 'closing' && !this.pointers.size) this.close()
        }, tapDelay)
      },
      refreshPhase() {
        if (!this.present || this.phase === 'preparing' || this.phase === 'closing') return
        this.phase = this.driver?.has('presence') || this.driver?.has(`flight:${this.current}`) ? 'opening' : this.driver?.active ? 'settling' : 'open'
      },
      cancelAnimations() { this.driver?.cancel() },
      pose(index?: number): Pose { index ??= this.current; return index === this.current ? { scale: this.scale, pan: this.pan } : this.poses[index] ?? { scale: 1, pan: { x: 0, y: 0 } } },
      frame(index?: number): HTMLElement | null | undefined { index ??= this.current; return (this.$refs.panel as HTMLElement | undefined)?.querySelector<HTMLElement>(`.apple-viewer-slide[data-index="${index}"] .apple-viewer-photo-frame`) },
      paintedPhoto(): { geometry: PhotoGeometry; rotation: number } {
        const frame = this.frame(), photo = frame?.querySelector<HTMLElement>('img'), bounds = (this.$refs.panel as HTMLElement).getBoundingClientRect()
        let geometry = frame && photo ? readPhotoGeometry(frame, photo, bounds) : this.normalGeometry()
        let rotation = this.flight?.rotation ?? this.rotations[this.current] ?? 0
        if (frame && photo) {
          if (typeof DOMMatrixReadOnly !== 'undefined') {
            const matrix = new DOMMatrixReadOnly(getComputedStyle(photo).transform)
            rotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI
          }
          if (Math.abs(rotation) > .01) {
            const frameRect = frame.getBoundingClientRect(), photoRect = photo.getBoundingClientRect()
            const scale = frameRect.width / (parseFloat(getComputedStyle(frame).width) || frameRect.width || 1)
            const width = photo.offsetWidth * scale, height = photo.offsetHeight * scale
            geometry = { ...geometry, left: photoRect.left + photoRect.width / 2 - width / 2 - bounds.left, top: photoRect.top + photoRect.height / 2 - height / 2 - bounds.top,
              width, height, image: { left: 0, top: 0, width, height } }
          }
        }
        return { geometry, rotation }
      },
      interactive(requireLoaded = true) {
        if (!this.present || !this.isTop || requireLoaded && !this.loaded) return false
        if (this.phase === 'closing') {
          const panel = this.$refs.panel as HTMLElement, from = this.paintedPhoto()
          this.phase = 'opening'; this.$emit('update:modelValue', true)
          this.releaseNavigation ??= holdPreviewNavigation(this.origin?.(this.current, false) ?? panel)
          const index = this.current
          void this.fly(from.geometry, this.normalGeometry(), true, from.rotation, undefined, true).then(completed => { if (completed) { delete this.flights[index]; this.refreshPhase() } })
        }
        return true
      },
      measure() {
        const panel = this.$refs.panel as HTMLElement | undefined
        if (!panel) return
        const rect = panel.getBoundingClientRect()
        this.viewport = { width: rect.width, height: rect.height }
        this.viewportOrigin = { x: rect.left, y: rect.top }
      },
      async openViewer() {
        if (this.present) { if (this.phase === 'closing') this.interactive(false); return }
        this.clearTap()
        this.cancelAnimations()
        this.present = true; this.phase = 'preparing'; this.current = clamp(this.index, 0, Math.max(0, this.images.length - 1))
        this.scale = 1; this.pan = { x: 0, y: 0 }; this.drag = { x: 0, y: 0 }; this.swipe = 0
        this.rotations = {}
        this.paging = null
        this.flights = {}; this.poses = {}; this.background = this.origin ? 0 : 1; this.chrome = 0
        this.pointers.clear(); this.gesture = null
        await nextTick()
        const panel = this.$refs.panel as HTMLElement | undefined
        if (!panel || !this.modelValue) return
        this.measure()
        this.releaseNavigation ??= holdPreviewNavigation(this.origin?.(this.current, false) ?? panel.ownerDocument.activeElement ?? panel)
        if (!this.disposeLayer) this.disposeLayer = registerLayer({
          element: panel, restore: panel.ownerDocument.activeElement as HTMLElement | null,
          close: () => this.close(), persistent: () => this.phase === 'closing', modal: true, trap: true,
          top: (value, depth) => { this.isTop = value; this.depth = depth },
          arrows: event => { event.preventDefault(); void this.select(this.current + (event.key === 'ArrowRight' ? 1 : -1)) },
        })
        this.resizeObserver?.disconnect()
        if (typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = markRaw(new ResizeObserver(() => {
            const before = this.viewport
            this.measure()
            if (this.phase !== 'closing' && (before.width !== this.viewport.width || before.height !== this.viewport.height)) {
              this.clearTap(); this.driver?.cancel('page'); this.driver?.cancel(`pose:${this.current}`)
              this.paging = null
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
          parent.style.backgroundColor = 'transparent'; parent.classList.add('apple-image__trigger--placeholder'); image.style.opacity = '0'
        }
        return image
      },
      normalGeometry(index?: number): PhotoGeometry {
        index ??= this.current
        const fitted = this.fitImage(index)
        const width = fitted.width, height = fitted.height
        const image = (this.rotations[index] ?? 0) % 180 ? { width: height, height: width } : fitted
        return {
          left: (this.viewport.width - width) / 2,
          top: (this.viewport.height - height) / 2,
          width, height, image: { left: (width - image.width) / 2, top: (height - image.height) / 2, ...image }, radius: 0, inset: [0, 0, 0, 0],
        }
      },
      async fly(from: PhotoGeometry, to: PhotoGeometry, opening: boolean, rotation = 0, presence?: { background: number; chrome: number }, preserveCrop = false) {
        const liveBackdrop = this.$refs.backdrop as HTMLElement | undefined
        const liveChrome = this.$refs.chrome as HTMLElement | undefined
        const backdropFrom = presence?.background ?? (liveBackdrop ? Number(getComputedStyle(liveBackdrop).opacity) : this.backdropOpacity)
        const chromeFrom = presence?.chrome ?? (liveChrome?.firstElementChild ? Number(getComputedStyle(liveChrome.firstElementChild).opacity) : this.chrome)
        const index = this.current
        const full = this.resolvedMotion === 'full'
        const base = photoFlightSize(from, to)
        const fromPose = photoFlightFrame(from, base, preserveCrop)
        const toRotation = opening ? this.rotations[index] ?? 0 : 0
        const toPose = photoFlightFrame(to, base)
        if (toRotation) {
          const extraX = Math.max(0, base.height - base.width) / 2, extraY = Math.max(0, base.width - base.height) / 2
          toPose.clipPath = `inset(${-extraY}px ${-extraX}px ${-extraY}px ${-extraX}px round 0px)`
        }
        if (rotation && !preserveCrop) {
          const radians = rotation * Math.PI / 180, scale = from.image.width / Math.max(1, base.width)
          const extraX = Math.max(0, Math.abs(Math.cos(radians)) * from.image.width + Math.abs(Math.sin(radians)) * from.image.height - from.image.width) / 2 / scale
          const extraY = Math.max(0, Math.abs(Math.sin(radians)) * from.image.width + Math.abs(Math.cos(radians)) * from.image.height - from.image.height) / 2 / scale
          fromPose.clipPath = `inset(${-extraY}px ${-extraX}px ${-extraY}px ${-extraX}px round 0px)`
        }
        if (full) this.flights[index] = { base, pose: fromPose, rotation }; else delete this.flights[index]
        this.background = backdropFrom; this.chrome = chromeFrom
        this.phase = opening ? 'opening' : 'closing'
        if (!opening) { this.releaseNavigation?.(); this.releaseNavigation = null }
        const ownsFlight = this.driver!.prepare(`flight:${index}`), ownsPresence = this.driver!.prepare('presence')
        await nextTick()
        if (!this.present) return false
        const duration = this.resolvedMotion === 'none' ? 0 : this.resolvedMotion === 'reduced' ? 120 : opening ? photoMotion.open : photoMotion.close
        const panel = this.$refs.panel as HTMLElement | undefined
        const frame = this.frame(index)
        const photo = frame?.querySelector<HTMLElement>('img')
        const backdrop = this.$refs.backdrop as HTMLElement | undefined
        const header = this.$refs.chrome as HTMLElement | undefined
        const entries: Array<{ element: HTMLElement; from: Keyframe; to: Keyframe }> = []
        if (full && frame) {
          entries.push({ element: frame, from: fromPose, to: toPose })
          if ((rotation || toRotation) && photo) entries.push({ element: photo, from: { transform: `rotate(${rotation}deg)` }, to: { transform: `rotate(${toRotation}deg)` } })
        }
        if (backdrop) entries.push({ element: backdrop, from: { opacity: backdropFrom }, to: { opacity: opening ? 1 : 0 } })
        // Fade each control, keeping the photo inside its backdrop-filter sampling area.
        if (header) Array.from(header.children).forEach(element => entries.push({ element: element as HTMLElement, from: { opacity: chromeFrom }, to: { opacity: opening ? 1 : 0 } }))
        const geometry = entries.filter(entry => entry.element === frame || entry.element === photo)
        const controls = entries.filter(entry => entry.element !== frame && entry.element !== photo)
        const positioned = ownsFlight() ? this.driver!.animate(`flight:${index}`, geometry, duration, photoEasing).then(async completed => {
          if (!completed) return false
          if (full) this.flights[index] = { base, pose: toPose, rotation: toRotation }
          await nextTick()
          this.driver?.cancel(`flight:${index}`)
          return true
        }) : Promise.resolve(false)
        const visible = ownsPresence() ? this.driver!.animate('presence', controls, duration, photoEasing).then(async completed => {
          if (!completed) return false
          this.background = opening ? 1 : 0; this.chrome = opening ? 1 : 0
          await nextTick()
          this.driver?.cancel('presence')
          return true
        }) : Promise.resolve(false)
        const completed = await Promise.all([positioned, visible])
        this.refreshPhase()
        return completed.every(Boolean)
      },
      async enter() {
        if (this.phase !== 'preparing' || !this.present) return
        // Mark synchronously so cached images cannot start two opening animations.
        const index = this.current
        this.phase = 'opening'
        await nextTick()
        if (!this.present || (this.phase as Phase) === 'closing') return
        this.measure()
        const panel = this.$refs.panel as HTMLElement
        const image = this.maskThumbnail(false)
        const to = this.normalGeometry()
        const from = image ? thumbnailGeometry(image, panel.getBoundingClientRect()) ?? to : to
        if (!await this.fly(from, to, true) || !this.modelValue) return
        delete this.flights[index]; this.refreshPhase()
        // Reposition the strip once the opening backdrop is fully opaque.
        if (index === this.current) this.maskThumbnail()
      },
      close() { if (this.present && this.phase !== 'closing' && this.isTop) void this.closeViewer(true) },
      async closeViewer(emit: boolean) {
        if (!this.present || this.phase === 'closing') return
        this.clearTap()
        const panel = this.$refs.panel as HTMLElement | undefined
        const bounds = panel?.getBoundingClientRect()
        const { geometry: from, rotation } = this.paintedPhoto()
        const thumbnail = this.maskThumbnail(this.phase !== 'preparing' && this.phase !== 'opening')
        const to = thumbnail && bounds ? thumbnailGeometry(thumbnail, bounds) ?? from : from
        const presence = { background: Number(getComputedStyle(this.$refs.backdrop as HTMLElement).opacity), chrome: Number(getComputedStyle((this.$refs.chrome as HTMLElement).firstElementChild!).opacity) }
        this.pointers.clear(); this.gesture = null; this.suppressClickUntil = performance.now() + 400
        this.driver?.cancel(); this.poses = {}; this.scale = 1; this.pan = { x: 0, y: 0 }; this.drag = { x: 0, y: 0 }
        this.swipe = 0; this.paging = null
        // Continue from the captured photo geometry and live backdrop when interrupted.
        const flight = this.fly(from, to, false, rotation, presence)
        if (emit) { this.$emit('update:modelValue', false); this.$emit('close') }
        if (!await flight) return
        await this.finishClose()
      },
      async finishClose() {
        this.restoreThumbnail(); this.present = false
        await nextTick()
        if (this.present || this.modelValue) return
        this.releaseNavigation?.(); this.releaseNavigation = null
        this.resizeObserver?.disconnect(); this.disposeLayer?.(); this.disposeLayer = null
        this.$emit('after-close')
      },
      async select(index: number, velocity = 0): Promise<void> {
        if (!this.pictures.length || !this.interactive(false)) return
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
        const previous = this.current, swipe = this.swipe, stride = this.viewport.width + 20
        const offsets = before.map((transform, i) => typeof DOMMatrixReadOnly === 'undefined' ? this.slideOffset(i) : new DOMMatrixReadOnly(transform).m41)
        const outgoing = offsets.reduce((nearest, offset, i) => i !== index && (nearest === -1 || Math.abs(offset) < Math.abs(offsets[nearest])) ? i : nearest, -1)
        const wasPaging = this.driver?.has('page')
        const paintedOffset = wasPaging ? offsets[outgoing < 0 ? previous : outgoing] : swipe
        const speed = velocity || (wasPaging ? this.driver!.velocityX('page', slides[outgoing < 0 ? previous : outgoing]) : 0)
        const timing = photoPageTiming((changed ? -direction * stride : 0) - paintedOffset, speed, this.viewport.width)
        const ownsPage = this.driver!.prepare('page')
        this.poses[previous] = { scale: this.scale * this.dragScale, pan: { x: this.pan.x + this.drag.x, y: this.pan.y + this.drag.y } }
        this.paging = { from: outgoing < 0 ? previous : outgoing, direction: changed ? direction : 0 }
        this.current = index; this.swipe = 0
        if (changed) {
          this.pointers.clear(); this.gesture = null
          this.driver?.cancel(`pose:${index}`)
          this.scale = 1; this.pan = { x: 0, y: 0 }; delete this.poses[index]
          this.maskThumbnail()
          this.$emit('update:index', index); this.$emit('change', index)
        }
        this.drag = { x: 0, y: 0 }
        if (this.phase === 'preparing') { this.phase = 'open'; this.background = 1; this.chrome = 1 }
        await nextTick()
        if (!ownsPage() || !this.present) return
        const entries = slides.flatMap((slide, i) => i === outgoing || i === index || Math.abs(offsets[i]) < this.viewport.width ? [{ element: slide,
          from: { transform: changed && i === index && (!wasPaging || Math.abs(offsets[i]) >= this.viewport.width) ? `translate3d(${direction * stride + swipe}px,0,0)` : before[i] },
          to: { transform: `translate3d(${this.slideOffset(i)}px,0,0)` },
        }] : [])
        if (!await this.driver!.animate('page', entries, this.resolvedMotion === 'full' ? timing.duration : 0, timing.easing)) return
        this.paging = null
        await nextTick()
        this.driver?.cancel('page'); this.refreshPhase()
        if (previous !== this.current) { this.driver?.cancel(`pose:${previous}`); delete this.poses[previous] }
        if (outgoing >= 0 && outgoing !== this.current) { this.driver?.cancel(`pose:${outgoing}`); delete this.poses[outgoing] }
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
        return { x: event.clientX - this.viewportOrigin.x, y: event.clientY - this.viewportOrigin.y }
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
        if (!this.isTop || !this.present || !this.loaded || event.button > 0) return
        this.interactive()
        if (this.driver?.has('page')) {
          const slide = (this.$refs.panel as HTMLElement).querySelector<HTMLElement>('.apple-viewer-slide.is-current')
          this.swipe = slide ? new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41 : 0
          this.driver.cancel('page'); this.paging = null
        }
        const poseElement = (this.$refs.panel as HTMLElement).querySelector<HTMLElement>('.is-current > .apple-viewer-pose')
        const painted = poseElement && typeof DOMMatrixReadOnly !== 'undefined' ? new DOMMatrixReadOnly(getComputedStyle(poseElement).transform) : null
        this.driver?.cancel(`pose:${this.current}`)
        if (painted) { this.scale = painted.a / this.dragScale; this.pan = { x: painted.m41 - this.drag.x, y: painted.m42 - this.drag.y } }
        this.refreshPhase()
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
        if (!this.isTop || !this.present || !this.pointers.has(event.pointerId) || !this.gesture) return
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
        if (gesture.mode === 'pan') {
          const pan = boundPhoto({ x: this.pan.x + dx, y: this.pan.y + dy }, this.fitted, this.viewport, this.scale, true)
          this.dragKind = 'pan'; this.drag = { x: pan.x - this.pan.x, y: pan.y - this.pan.y }
        }
        else if (gesture.mode === 'swipe') {
          const offset = clamp(gesture.swipe + dx, -this.viewport.width - 20, this.viewport.width + 20)
          this.swipe = this.atPageEdge(offset) ? offset * .25 : offset
          const now = performance.now()
          gesture.samples.push({ x: this.swipe, time: now })
          while (gesture.samples.length > 2 && gesture.samples[1].time < now - 80) gesture.samples.shift()
        } else if (gesture.mode === 'dismiss') {
          this.dragKind = 'dismiss'
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
        if (!this.present) return
        if (Math.abs(this.swipe) >= .1) { await this.select(this.current); return }
        const opacity = this.backdropOpacity
        const pending = this.driver?.sample(`pose:${this.current}`)
        const scale = clamp(pending?.target[0] ?? this.scale, 1, 8)
        const pan = boundPhoto({ x: (pending?.target[1] ?? this.pan.x) + this.drag.x, y: (pending?.target[2] ?? this.pan.y) + this.drag.y }, this.fitted, this.viewport, scale)
        const from = [Math.log(Math.max(.01, this.scale * this.dragScale)), this.pan.x + this.drag.x, this.pan.y + this.drag.y]
        const shift = [Math.exp(from[0]) - this.scale, this.drag.x, this.drag.y]
        this.scale *= this.dragScale; this.pan = { x: from[1], y: from[2] }; this.drag = { x: 0, y: 0 }
        if (pending) this.driver!.shift(`pose:${this.current}`, shift)
        if (!this.driver?.has('presence') && opacity < 1) {
          this.background = opacity
          void this.driver!.to('backdrop', [opacity], [1], value => { this.background = value[0] }, { frequency: 22, epsilon: [.0001], immediate: this.resolvedMotion !== 'full' })
        }
        await this.movePose(this.current, from, [Math.log(scale), pan.x, pan.y], 20)
      },
      async movePose(index: number, from: number[], target: number[], frequency = 24) {
        const initialScale = Math.exp(from[0])
        const finished = await this.driver!.to(`pose:${index}`, [initialScale, from[1], from[2]], [Math.exp(target[0]), target[1], target[2]], value => {
          const scale = value[0], pan = { x: value[1], y: value[2] }
          if (index === this.current) { this.scale = scale; this.pan = pan }
          else this.poses[index] = { scale, pan }
          this.refreshPhase()
        }, { frequency, epsilon: [.00001, .01, .01], bounds: [[Math.min(1, initialScale), Math.max(8, initialScale)], null, null], immediate: this.resolvedMotion !== 'full' })
        if (finished) this.refreshPhase()
      },
      zoomTarget() {
        const target = this.driver?.sample(`pose:${this.current}`)?.target
        return target ? [Math.log(target[0]), target[1], target[2]] : [Math.log(Math.max(.01, this.scale)), this.pan.x, this.pan.y]
      },
      async toggleZoom(point: PhotoPoint) {
        return this.zoomTo(Math.exp(this.zoomTarget()[0]) > 1.001 ? 1 : 2, point)
      },
      stepZoom(direction: number) { void this.zoomTo(clamp(Math.exp(this.zoomTarget()[0] + direction * .2), 1, 8), { x: this.viewport.width / 2, y: this.viewport.height / 2 }) },
      async zoomTo(scale: number, point: PhotoPoint, frequency = 24) {
        if (!this.interactive()) return
        this.clearTap()
        const index = this.current, target = this.zoomTarget(), ratio = scale / Math.exp(target[0])
        const slide = (this.$refs.panel as HTMLElement).querySelector<HTMLElement>('.apple-viewer-slide.is-current')
        const offset = slide && typeof DOMMatrixReadOnly !== 'undefined' ? new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41 : this.swipe
        const x = point.x - offset - this.viewport.width / 2 - this.drag.x, y = point.y - this.viewport.height / 2 - this.drag.y
        const bounded = boundPhoto({ x: x - (x - target[1]) * ratio + this.drag.x, y: y - (y - target[2]) * ratio + this.drag.y }, this.fitted, this.viewport, scale)
        const pan = { x: bounded.x - this.drag.x, y: bounded.y - this.drag.y }
        await this.movePose(index, [Math.log(this.scale), this.pan.x, this.pan.y], [Math.log(scale), pan.x, pan.y], frequency)
      },
      async rotate(direction: number) {
        if (!this.interactive()) return
        this.clearTap()
        const index = this.current, frame = this.frame(index), photo = frame?.querySelector<HTMLElement>('img')
        if (!frame || !photo) return
        const keys = ['left', 'top', 'width', 'height', 'transform', 'clip-path'] as const
        const read = (element: HTMLElement): Keyframe => {
          const css = getComputedStyle(element)
          return Object.fromEntries(keys.map(key => [key === 'clip-path' ? 'clipPath' : key, css.getPropertyValue(key)]))
        }
        const beforeFrame = read(frame), beforePhoto = read(photo)
        this.driver?.cancel(`flight:${index}`)
        const ownsRotation = this.driver!.prepare(`rotation:${index}`)
        delete this.flights[index]
        this.rotations[index] = (this.rotations[index] ?? 0) + direction * 90
        await nextTick()
        if (!ownsRotation() || !this.present) return
        if (!await this.driver!.animate(`rotation:${index}`, [
          { element: frame, from: beforeFrame, to: read(frame) },
          { element: photo, from: beforePhoto, to: read(photo) },
        ], this.resolvedMotion === 'full' ? photoMotion.zoom : 0, photoEasing)) return
        this.driver?.cancel(`rotation:${index}`)
        const pose = this.pose(index), pending = this.driver?.sample(`pose:${index}`)?.target
        const target = pending ? [Math.log(pending[0]), pending[1], pending[2]] : [Math.log(pose.scale), pose.pan.x, pose.pan.y]
        const scale = Math.exp(target[0]), pan = boundPhoto({ x: target[1], y: target[2] }, this.fitImage(index), this.viewport, scale)
        void this.movePose(index, [Math.log(pose.scale), pose.pan.x, pose.pan.y], [target[0], pan.x, pan.y])
        this.refreshPhase()
      },
      zoom(event: WheelEvent) {
        if (!this.isTop || !this.present || !this.loaded || !Number.isFinite(event.deltaY) || !event.deltaY) return
        event.preventDefault(); this.clearTap()
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.viewport.height : 1
        const scale = clamp(Math.exp(this.zoomTarget()[0] - event.deltaY * unit * .002), 1, 8)
        void this.zoomTo(scale, this.point(event), 28)
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
          const fitted = this.fitImage(index)
          const flight = this.flights[index] ?? null
          const pose = this.pose(index)
          const rotation = flight ? flight.rotation ?? 0 : this.rotations[index] ?? 0
          const size = flight?.base ?? (rotation % 180 ? { width: fitted.height, height: fitted.width } : fitted)
          const offset = this.slideOffset(index)
          return h('div', {
            key: `${index}:${picture.src}`, 'data-index': index, class: ['apple-viewer-slide', { 'is-current': active }], 'aria-hidden': active ? undefined : 'true',
            style: { transform: `translate3d(${offset}px,0,0)`, visibility: !active && (['preparing', 'closing'].includes(this.phase) || this.phase === 'opening' && !this.paging) ? 'hidden' : undefined },
          }, [h('div', { class: 'apple-viewer-pose', style: { transform: `translate3d(${pose.pan.x + (active ? this.drag.x : 0)}px,${pose.pan.y + (active ? this.drag.y : 0)}px,0) scale(${pose.scale * (active ? this.dragScale : 1)})` } }, [h('div', {
            class: ['apple-viewer-photo-frame', active ? 'apple-viewer-canvas' : 'apple-viewer-neighbor-canvas'],
            style: flight ? frameStyle(flight) : {
              left: `${(this.viewport.width - fitted.width) / 2}px`, top: `${(this.viewport.height - fitted.height) / 2}px`,
              width: `${fitted.width}px`, height: `${fitted.height}px`,
              transform: 'none',
              visibility: fitted.width && !(active && this.phase === 'preparing') ? 'visible' : 'hidden',
            },
          }, [h('img', {
            class: ['apple-viewer-photo', active ? 'apple-viewer-image' : 'apple-viewer-neighbor-image'],
            src: picture.src, alt: picture.alt ?? '', draggable: false, 'data-index': index,
            style: { left: `${(flight ? 0 : fitted.width - size.width) / 2}px`, top: `${(flight ? 0 : fitted.height - size.height) / 2}px`, width: `${size.width}px`, height: `${size.height}px`, transform: `rotate(${rotation}deg)` },
            onLoad: (event: Event) => this.imageLoaded(index, event.target as HTMLImageElement), onError: (event: Event) => this.imageFailed(index, event),
            onDragstart: (event: DragEvent) => event.preventDefault(),
          })])])])
        })),
        h('div', { ref: 'chrome', class: 'apple-viewer-chrome' }, [
          h('span', { class: 'apple-viewer-count', style: { opacity: this.chrome }, 'aria-live': 'polite', 'aria-atomic': 'true' }, `${this.pictures.length ? this.current + 1 : 0} / ${this.pictures.length}`),
          !this.isVerticalScreen ? h('button', { class: 'apple-overlay-icon apple-viewer-close', style: { opacity: this.chrome }, type: 'button', 'aria-label': '关闭图片预览', onClick: this.close }, [h(X, { size: 22, 'aria-hidden': true })]) : null,
          !this.isVerticalScreen && this.pictures.length > 1 ? h('button', { class: 'apple-overlay-icon apple-viewer-prev', style: { opacity: this.chrome }, type: 'button', 'aria-label': '上一张', disabled: !this.loop && this.current === 0, onClick: () => this.select(this.current - 1) }, [h(ChevronLeft, { size: 22, 'aria-hidden': true })]) : null,
          !this.isVerticalScreen && this.pictures.length > 1 ? h('button', { class: 'apple-overlay-icon apple-viewer-next', style: { opacity: this.chrome }, type: 'button', 'aria-label': '下一张', disabled: !this.loop && this.current === this.pictures.length - 1, onClick: () => this.select(this.current + 1) }, [h(ChevronRight, { size: 22, 'aria-hidden': true })]) : null,
          h('div', { class: 'apple-viewer-caption apple-viewer-toolbar', style: { opacity: this.chrome } }, [
            h('button', { class: 'apple-overlay-icon', type: 'button', 'aria-label': '向左旋转90度', disabled: !this.loaded, onClick: () => this.rotate(-1) }, [h(RotateCcw, { size: 22, 'aria-hidden': true })]),
            !this.isVerticalScreen ? h('button', { class: 'apple-overlay-icon', type: 'button', 'aria-label': '缩小', disabled: !this.loaded || this.scale <= 1, onClick: () => this.stepZoom(-1) }, [h(ZoomOut, { size: 22, 'aria-hidden': true })]) : null,
            this.pictures[this.current]?.title ? h('span', { class: 'apple-viewer-title' }, this.pictures[this.current].title) : null,
            !this.isVerticalScreen ? h('button', { class: 'apple-overlay-icon', type: 'button', 'aria-label': '放大', disabled: !this.loaded || this.scale >= 8, onClick: () => this.stepZoom(1) }, [h(ZoomIn, { size: 22, 'aria-hidden': true })]) : null,
            h('button', { class: 'apple-overlay-icon', type: 'button', 'aria-label': '向右旋转90度', disabled: !this.loaded, onClick: () => this.rotate(1) }, [h(RotateCw, { size: 22, 'aria-hidden': true })]),
          ]),
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

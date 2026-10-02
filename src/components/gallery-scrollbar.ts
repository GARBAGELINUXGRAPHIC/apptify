import { defineComponent, h, markRaw, nextTick, type PropType } from 'vue'
import { clamp } from '../core/image-geometry'

// A persistent scrollbar, independent of the OS's auto-hiding overlay scrollbars.
export const GalleryScrollbar = defineComponent({
  name: 'GalleryScrollbar',
  props: {
    target: { type: Function as PropType<() => HTMLElement | undefined>, required: true },
    controls: { type: String, required: true },
  },
  emits: ['interaction'],
  data: () => ({
    box: null as HTMLElement | null, width: 0, total: 0, left: 0,
    observer: null as ResizeObserver | null, mutations: null as MutationObserver | null,
    drag: null as { id: number; x: number; left: number; snap: string } | null,
  }),
  computed: {
    maximum(): number { return Math.max(0, this.total - this.width) },
    progress(): number { return this.maximum ? clamp(this.left / this.maximum, 0, 1) : 0 },
  },
  mounted() {
    void nextTick(() => {
      const box = this.target()
      if (!box || !this.$refs.track) return
      this.box = box
      box.addEventListener('scroll', this.measure, { passive: true })
      if (typeof ResizeObserver !== 'undefined') this.observer = markRaw(new ResizeObserver(this.measure))
      if (typeof MutationObserver !== 'undefined') {
        this.mutations = markRaw(new MutationObserver(this.observe))
        this.mutations.observe(box, { childList: true })
      }
      this.observe()
    })
  },
  beforeUnmount() {
    this.end()
    this.box?.removeEventListener('scroll', this.measure)
    this.observer?.disconnect(); this.mutations?.disconnect()
  },
  methods: {
    observe() {
      this.observer?.disconnect()
      if (this.box) {
        this.observer?.observe(this.box)
        Array.from(this.box.children).forEach(child => this.observer?.observe(child))
      }
      this.measure()
    },
    measure() {
      if (!this.box) return
      this.width = this.box.clientWidth; this.total = this.box.scrollWidth; this.left = this.box.scrollLeft
    },
    scroll(left: number) {
      this.box?.scrollTo({ left: clamp(left, 0, this.maximum), behavior: 'instant' })
      this.measure()
    },
    start(event: PointerEvent) {
      if (!this.box || this.maximum <= 1 || event.button !== 0 || this.drag) return
      event.preventDefault()
      this.$emit('interaction')
      const track = this.$refs.track as HTMLElement, thumb = this.$refs.thumb as HTMLElement
      track.focus({ preventScroll: true })
      this.drag = { id: event.pointerId, x: event.clientX, left: this.box.scrollLeft, snap: this.box.style.scrollSnapType }
      this.box.style.scrollSnapType = 'none'
      if (!thumb.contains(event.target as Node)) {
        const travel = track.clientWidth - thumb.offsetWidth
        this.scroll(travel > 0 ? (event.clientX - track.getBoundingClientRect().left - thumb.offsetWidth / 2) / travel * this.maximum : 0)
        this.drag.left = this.box.scrollLeft
      }
      try { track.setPointerCapture(event.pointerId) } catch { /* Synthetic pointers have no capture. */ }
    },
    move(event: PointerEvent) {
      if (!this.drag || event.pointerId !== this.drag.id) return
      event.preventDefault()
      const travel = (this.$refs.track as HTMLElement).clientWidth - (this.$refs.thumb as HTMLElement).offsetWidth
      if (travel > 0) this.scroll(this.drag.left + (event.clientX - this.drag.x) / travel * this.maximum)
    },
    end(event?: PointerEvent) {
      if (!this.drag || event && event.pointerId !== this.drag.id) return
      const drag = this.drag
      this.drag = null
      if (this.box) this.box.style.scrollSnapType = drag.snap
      const track = this.$refs.track as HTMLElement | undefined
      if (track?.hasPointerCapture?.(drag.id)) track.releasePointerCapture(drag.id)
    },
    key(event: KeyboardEvent) {
      const destinations: Record<string, number> = {
        ArrowLeft: this.left - 40, ArrowRight: this.left + 40,
        PageUp: this.left - this.width, PageDown: this.left + this.width,
        Home: 0, End: this.maximum,
      }
      if (!(event.key in destinations) || !this.box) return
      event.preventDefault(); this.$emit('interaction')
      const snap = this.box.style.scrollSnapType
      this.box.style.scrollSnapType = 'none'
      this.scroll(destinations[event.key])
      this.box.style.scrollSnapType = snap
    },
  },
  render() {
    return h('div', {
      ref: 'track', class: ['apple-image__scrollbar', { 'is-dragging': Boolean(this.drag) }],
      hidden: this.maximum <= 1, role: 'scrollbar', tabindex: 0, 'aria-label': '图片组滚动条',
      'aria-controls': this.controls, 'aria-orientation': 'horizontal',
      'aria-valuemin': 0, 'aria-valuemax': Math.round(this.maximum), 'aria-valuenow': Math.round(clamp(this.left, 0, this.maximum)),
      onPointerdown: this.start, onPointermove: this.move,
      onPointerup: this.end, onPointercancel: this.end, onLostpointercapture: this.end, onKeydown: this.key,
    }, h('span', {
      ref: 'thumb', class: 'apple-image__scrollbar-thumb',
      style: { width: `${this.total ? this.width / this.total * 100 : 100}%`, left: `${this.progress * 100}%`, transform: `translate(${-this.progress * 100}%, -50%)` },
    }))
  },
})

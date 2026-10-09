import { createPopupPositioner, type PopupPositioner } from '../core/popup-placement'
import { animatePopup, freezePopup, preparePopup, resetPopup } from '../core/popup-motion'
import { OverlaySurface, showOverlaySurface, hideOverlaySurface } from '../core/overlay-surface'
import { overlayZIndex } from '../core/layers'
import {
  Teleport, Transition, TransitionGroup, cloneVNode, defineComponent, h, markRaw, mergeProps, nextTick, withDirectives, vShow,
  type Component, type PropType, type VNode,
} from 'vue'
import {
  Check, CheckCircle2, CircleAlert, Info, X,
} from 'lucide-vue-next'
import { appleKey, resolveMotion, type AppleContext, type OverlayEntry } from '../core/context'
import { ripple } from '../core/motion'
import { AppleButton } from './button'
import { AppleLink } from './link'
import { AppleAutoSize } from './motion'
import { createMobileImageViewer } from './mobile-image-viewer'

type Motion = 'inherit' | 'auto' | 'full' | 'reduced' | 'none'
type CloseReason = 'escape' | 'backdrop' | 'cancel' | 'confirm' | 'close'
type ModalKind = 'dialog' | 'drawer' | 'sheet'
export interface AppleMenuItem {
  label: string
  value: string | number
  disabled?: boolean
  danger?: boolean
  description?: string
  icon?: Component
}

const motionProp = { type: String as PropType<Motion>, default: 'inherit' as Motion }
const contextOf = (vm: unknown): AppleContext | undefined =>
  (vm as { apple?: AppleContext }).apple
const motionOf = (vm: unknown, value: Motion) => {
  const context = contextOf(vm)
  return resolveMotion(value, context?.motion.value.mode ?? 'auto', context?.motion.value.reduced ?? false)
}
const portal = (vm: unknown, node: VNode): VNode => {
  const target = contextOf(vm)?.portalTarget.value
  return target ? h(Teleport, { to: target }, node) : node
}
const iconButton = (label: string, icon: Component, onClick: () => void, attrs = {}) =>
  ripple(h('button', { type: 'button', class: 'apple-overlay-icon', 'aria-label': label, title: label, onClick, ...attrs }, [h(icon, { size: 20, 'aria-hidden': true })]), !(attrs as { disabled?: boolean }).disabled)

const durationOf = (motion: string) => motion === 'none' ? 0 : motion === 'reduced' ? 120 : 320
const presence = (name: string, motion: string, node: VNode | null, afterLeave: () => void, duration: number | { enter: number; leave: number } = durationOf(motion), afterEnter?: () => void) =>
  h(Transition, { name, appear: true, css: motion !== 'none', duration, onAfterLeave: afterLeave, onAfterEnter: afterEnter }, { default: () => node })

interface Layer {
  element: HTMLElement
  restore: HTMLElement | null
  close: () => void
  top: (value: boolean, depth: number) => void
  modal: boolean
  trap: boolean
  persistent: () => boolean
  arrows?: (event: KeyboardEvent) => void
}
interface LayerState {
  layers: Layer[]
  overflow: string
  padding: string
  locked: boolean
  keydown: (event: KeyboardEvent) => void
  focusin: (event: FocusEvent) => void
}
const layersByDocument = new WeakMap<Document, LayerState>()
const focusable = (element: HTMLElement): HTMLElement[] =>
  Array.from(element.querySelectorAll<HTMLElement>(
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
  )).filter(node => !node.hidden && !node.closest('[hidden],[inert]') &&
    node.ownerDocument.defaultView?.getComputedStyle(node).display !== 'none')
const focusLayer = (layer: Layer) => {
  const autofocus = layer.element.querySelector<HTMLElement>('[autofocus]')
  ;(autofocus ?? focusable(layer.element)[0] ?? layer.element).focus({ preventScroll: true })
}

// One document stack coordinates both declarative and service-created overlays.
function registerLayer(layer: Layer): () => void {
  const doc = layer.element.ownerDocument
  let state = layersByDocument.get(doc)
  if (!state) {
    const fresh: LayerState = {
      layers: [], overflow: '', padding: '', locked: false,
      keydown(event) {
        const top = fresh.layers.at(-1)
        if (!top) return
        if (event.key === 'Escape') {
          const popup = (event.target as Element | null)?.closest?.('[data-apple-popup-open="true"]')
          if (popup && top.element.contains(popup)) return
          event.preventDefault()
          event.stopImmediatePropagation()
          if (!top.persistent()) top.close()
        } else if (event.key === 'Tab') {
          const trapped = [...fresh.layers].reverse().find(entry => entry.trap)
          if (!trapped) return
          const elements = focusable(trapped.element)
          const first = elements[0]
          const last = elements.at(-1)
          if (!first || !last) {
            event.preventDefault()
            trapped.element.focus({ preventScroll: true })
          } else if (event.shiftKey && (doc.activeElement === first || !trapped.element.contains(doc.activeElement))) {
            event.preventDefault()
            last.focus({ preventScroll: true })
          } else if (!event.shiftKey && (doc.activeElement === last || !trapped.element.contains(doc.activeElement))) {
            event.preventDefault()
            first.focus({ preventScroll: true })
          }
        }
      },
      focusin(event) {
        const trapped = [...fresh.layers].reverse().find(entry => entry.trap)
        if (trapped && event.target && !trapped.element.contains(event.target as Node)) focusLayer(trapped)
      },
    }
    state = fresh
    layersByDocument.set(doc, state)
    doc.addEventListener('keydown', state.keydown, true)
    doc.addEventListener('focusin', state.focusin)
  }
  // A viewer opened above a promoted dialog must join the same rendering
  // layer. Root viewers keep their return-under-navigation behavior.
  if (layer.element.classList.contains('apple-image-viewer') && state.layers.some(entry => entry.element.closest('[data-apple-overlay-surface]'))) {
    showOverlaySurface(layer.element)
  }
  state.layers.push(layer)
  const arrows = (event: KeyboardEvent) => {
    if (state!.layers.at(-1) !== layer || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    // Keep the lightbox engine's document keyboard listener away from lower layers.
    event.stopPropagation()
    layer.arrows?.(event)
  }
  layer.element.addEventListener('keydown', arrows)
  const update = () => {
    state!.layers.forEach((entry, depth) => entry.top(depth === state!.layers.length - 1, depth))
    const shouldLock = state!.layers.some(entry => entry.modal)
    if (shouldLock && !state!.locked) {
      state!.overflow = doc.body.style.overflow
      state!.padding = doc.body.style.paddingRight
      const scrollbar = Math.max(0, (doc.defaultView?.innerWidth ?? 0) - doc.documentElement.clientWidth)
      doc.body.style.overflow = 'hidden'
      if (scrollbar > 0 && doc.documentElement.clientWidth > 0) {
        const original = Number.parseFloat(doc.defaultView?.getComputedStyle(doc.body).paddingRight ?? '0') || 0
        doc.body.style.paddingRight = `${original + scrollbar}px`
      }
      state!.locked = true
    } else if (!shouldLock && state!.locked) {
      doc.body.style.overflow = state!.overflow
      doc.body.style.paddingRight = state!.padding
      state!.locked = false
    }
  }
  update()
  if (layer.trap) focusLayer(layer)
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    layer.element.removeEventListener('keydown', arrows)
    const wasTop = state!.layers.at(-1) === layer
    state!.layers.splice(state!.layers.indexOf(layer), 1)
    state!.layers.forEach(entry => {
      if (entry.restore && layer.element.contains(entry.restore)) entry.restore = layer.restore
    })
    update()
    if (!state!.layers.length) {
      doc.removeEventListener('keydown', state!.keydown, true)
      doc.removeEventListener('focusin', state!.focusin)
      layersByDocument.delete(doc)
    }
    if (wasTop && layer.trap) {
      const top = state!.layers.at(-1)
      if (layer.restore?.isConnected && (!top?.trap || top.element.contains(layer.restore))) {
        layer.restore.focus({ preventScroll: true })
      } else if (top?.trap) focusLayer(top)
    }
  }
}

function createModal(name: string, kind: ModalKind) {
  return defineComponent({
    name,
    inheritAttrs: false,
    inject: { apple: { from: appleKey, default: undefined } },
    props: {
      modelValue: { type: Boolean, default: false },
      title: { type: String, default: '' },
      message: { type: String, default: '' },
      ariaLabel: { type: String, default: '对话框' },
      persistent: Boolean,
      loading: Boolean,
      closeOnConfirm: { type: Boolean, default: true },
      confirmText: { type: String, default: '确定' },
      cancelText: { type: String, default: '取消' },
      showFooter: { type: Boolean, default: kind === 'dialog' },
      closable: { type: Boolean, default: true },
      width: { type: [String, Number], default: kind === 'dialog' ? 480 : 440 },
      placement: { type: String as PropType<'left' | 'right' | 'bottom'>, default: kind === 'sheet' ? 'bottom' : 'right' },
      tone: { type: String, default: 'default' },
      motion: motionProp,
    },
    emits: ['update:modelValue', 'close', 'confirm', 'cancel', 'open', 'after-close'],
    data() { return { disposeLayer: null as (() => void) | null, isTop: false, depth: 0, present: this.modelValue } },
    computed: {
      resolvedMotion(): string { return motionOf(this, this.motion) },
    },
    watch: {
      modelValue(value: boolean) { if (value) this.present = true; void this.syncLayer() },
    },
    mounted() { void this.syncLayer() },
    beforeUnmount() {
      const backdrop = (this.$refs.panel as HTMLElement | undefined)?.parentElement
      if (backdrop) freezePopup(backdrop)
      this.disposeLayer?.()
    },
    methods: {
      async syncLayer() {
        if (!this.modelValue) return
        await nextTick()
        const element = this.$refs.panel as HTMLElement | undefined
        if (!this.modelValue || this.disposeLayer || !element) return
        this.disposeLayer = registerLayer({
          element,
          restore: element.ownerDocument.activeElement as HTMLElement | null,
          close: () => this.dismiss('escape'),
          persistent: () => !this.modelValue || this.persistent || this.loading,
          modal: true, trap: true,
          top: (value, depth) => { this.isTop = value; this.depth = depth },
        })
        this.$emit('open')
      },
      afterClose() {
        if (this.modelValue) return
        this.present = false
        this.disposeLayer?.()
        this.disposeLayer = null
        this.$emit('after-close')
      },
      dismiss(reason: CloseReason = 'close', value?: unknown) {
        if (!this.modelValue || this.loading || ((reason === 'backdrop' || reason === 'escape') && this.persistent)) return
        this.$emit('update:modelValue', false)
        this.$emit('close', value, reason)
      },
      confirm() {
        if (this.loading) return
        this.$emit('confirm', true)
        if (this.closeOnConfirm) this.dismiss('confirm', true)
      },
      cancel() {
        if (this.loading) return
        this.$emit('cancel', false)
        this.dismiss('cancel', false)
      },
    },
    render() {
      const heading = this.$slots.title?.() ?? this.title
      const panel = h('section', mergeProps(this.$attrs, {
        ref: 'panel', role: 'dialog', tabindex: -1,
        'aria-modal': this.isTop ? 'true' : undefined,
        'aria-label': this.title || this.ariaLabel,
        'aria-busy': this.loading || undefined,
        'data-apple-motion': this.resolvedMotion,
        class: ['apple-modal', `apple-${kind}`, `apple-${kind}--${this.placement}`, `apple-overlay-tone--${this.tone}`],
        style: { '--apple-overlay-width': typeof this.width === 'number' ? `${this.width}px` : this.width },
      }), [
        heading || this.closable ? h('header', { class: 'apple-modal-header' }, [
          h('div', { class: 'apple-modal-heading' }, heading ? [h('h2', heading)] : []),
          this.closable ? iconButton('关闭', X, () => this.dismiss(), { disabled: this.loading }) : null,
        ]) : null,
        h('div', { class: 'apple-modal-body' }, [h(AppleAutoSize, { motion: this.motion }, { default: () => this.$slots.default?.({ close: (value?: unknown) => this.dismiss('close', value) }) ?? (this.message ? [h('p', this.message)] : []) })]),
        this.showFooter || this.$slots.footer ? h('footer', { class: 'apple-modal-footer' }, this.$slots.footer?.({ close: (value?: unknown) => this.dismiss('close', value), confirm: this.confirm, cancel: this.cancel }) ?? [
          this.cancelText ? h(AppleButton, { variant: 'secondary', disabled: this.loading, motion: this.motion, onClick: this.cancel }, { default: () => this.cancelText }) : null,
          this.confirmText ? h(AppleButton, { variant: this.tone === 'danger' ? 'danger' : 'primary', loading: this.loading, disabled: this.loading, motion: this.motion, onClick: this.confirm }, { default: () => this.confirmText }) : null,
        ]) : null,
      ])
      const backdrop = this.present ? withDirectives(h('div', {
        class: ['apple-overlay-backdrop', `apple-overlay-backdrop--${kind}`],
        'data-apple-motion': this.resolvedMotion,
        style: { zIndex: overlayZIndex(this.depth), '--apple-overlay-duration': `${durationOf(this.resolvedMotion)}ms` },
        onClick: (event: MouseEvent) => { if (event.target === event.currentTarget && this.isTop) this.dismiss('backdrop') },
      }, [panel]), [[vShow, this.modelValue], [OverlaySurface]]) : null
      const clearMotion = (element: Element) => {
        element.classList.remove('apple-modal-presence-enter-active', 'apple-modal-presence-leave-active')
        resetPopup(element)
      }
      return portal(this, h(Transition, {
        css: false, appear: true, persisted: true,
        onBeforeEnter: (element: Element) => preparePopup(element),
        onEnter: (element: Element, done: () => void) => {
          showOverlaySurface(element as HTMLElement)
          element.classList.add('apple-modal-presence-enter-active')
          animatePopup(element, true, done)
        },
        onLeave: (element: Element, done: () => void) => {
          element.classList.add('apple-modal-presence-leave-active')
          animatePopup(element, false, done)
        },
        onAfterEnter: clearMotion,
        onAfterLeave: (element: Element) => { hideOverlaySurface(element as HTMLElement); clearMotion(element); this.afterClose() },
        onEnterCancelled: (element: Element) => { freezePopup(element); element.classList.remove('apple-modal-presence-enter-active') },
        onLeaveCancelled: (element: Element) => { freezePopup(element); element.classList.remove('apple-modal-presence-leave-active') },
      }, { default: () => backdrop }))
    },
  })
}

export const AppleDialog = createModal('AppleDialog', 'dialog')
export const AppleDrawer = createModal('AppleDrawer', 'drawer')
export const AppleSheet = createModal('AppleSheet', 'sheet')

export const AppleSnackbar = defineComponent({
  name: 'AppleSnackbar',
  inheritAttrs: false,
  inject: { apple: { from: appleKey, default: undefined } },
  props: {
    modelValue: { type: Boolean, default: true },
    message: { type: String, default: '' },
    title: { type: String, default: '' },
    tone: { type: String as PropType<'default' | 'info' | 'success' | 'warning' | 'danger' | 'error'>, default: 'default' },
    duration: { type: Number, default: 4000 },
    action: { type: String, default: '' },
    closable: { type: Boolean, default: true },
    motion: motionProp,
  },
  emits: ['update:modelValue', 'close', 'action', 'after-close'],
  data: () => ({ timer: null as ReturnType<typeof setTimeout> | null, remaining: 0, started: 0, hovered: false, focused: false }),
  watch: {
    modelValue() { this.restart() },
    duration() { this.restart() },
    message() { this.restart() },
  },
  mounted() { this.restart() },
  beforeUnmount() { this.clear() },
  methods: {
    clear() { if (this.timer) clearTimeout(this.timer); this.timer = null },
    restart() {
      this.clear()
      this.remaining = this.duration
      if (this.modelValue && !this.hovered && !this.focused) this.resume()
    },
    pause() {
      if (this.timer) this.remaining = Math.max(0, this.remaining - (Date.now() - this.started))
      this.clear()
    },
    resume() {
      this.clear()
      if (!this.modelValue || this.duration <= 0 || this.hovered || this.focused) return
      this.started = Date.now()
      this.timer = setTimeout(() => this.close('timeout'), Math.max(0, this.remaining))
    },
    close(reason = 'close') {
      this.clear()
      this.$emit('update:modelValue', false)
      this.$emit('close', undefined, reason)
    },
  },
  render() {
    const motion = motionOf(this, this.motion)
    const glyph = this.tone === 'success' ? CheckCircle2 : ['error', 'danger', 'warning'].includes(this.tone) ? CircleAlert : Info
    const notification = this.modelValue ? h('div', mergeProps(this.$attrs, {
      class: ['apple-snackbar', `apple-snackbar--${this.tone}`],
      role: ['error', 'danger'].includes(this.tone) ? 'alert' : 'status',
      'aria-atomic': true, 'data-apple-motion': motion,
      style: { '--apple-overlay-duration': `${durationOf(motion)}ms` },
      onMouseenter: () => { this.hovered = true; this.pause() },
      onMouseleave: () => { this.hovered = false; this.resume() },
      onFocusin: () => { this.focused = true; this.pause() },
      onFocusout: (event: FocusEvent) => {
        if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) { this.focused = false; this.resume() }
      },
    }), [
      h(glyph, { class: 'apple-snackbar-symbol', size: 21, 'aria-hidden': true }),
      h('div', { class: 'apple-snackbar-content' }, this.$slots.default?.() ?? [this.title ? h('strong', this.title) : null, h('span', this.message)]),
      this.action ? h(AppleLink, { as: 'button', class: 'apple-snackbar-action', onClick: () => this.$emit('action') }, { default: () => this.action }) : null,
      this.closable ? iconButton('关闭通知', X, () => this.close()) : null,
    ]) : null
    return presence('apple-toast', motion, notification, () => this.$emit('after-close'))
  },
})

export const AppleOverlayHost = defineComponent({
  name: 'AppleOverlayHost',
  inject: { apple: { from: appleKey, default: undefined } },
  data: () => ({ present: [] as Array<{ entry: OverlayEntry; open: boolean }> }),
  computed: {
    activeEntries(): OverlayEntry[] { return [...(contextOf(this)?.overlays.entries.value ?? [])] },
  },
  watch: {
    activeEntries: {
      immediate: true,
      handler(entries: OverlayEntry[]) {
        const active = new Set(entries.map(entry => entry.id))
        this.present.forEach(item => { item.open = active.has(item.entry.id) })
        entries.forEach(entry => {
          const item = this.present.find(item => item.entry.id === entry.id)
          if (item) item.entry = entry
          else this.present.push({ entry, open: true })
        })
      },
    },
  },
  methods: {
    remove(id: string) { this.present = this.present.filter(item => item.entry.id !== id) },
  },
  render() {
    const context = contextOf(this)
    if (!context) return null
    const modals = this.present.filter(item => item.entry.kind !== 'snackbar')
    const notifications = this.present.filter(item => item.entry.kind === 'snackbar')
    const dialogs = modals.map(({ entry, open }) => {
      const close = (value?: unknown) => context.overlays.close(entry.id, value)
      const sendMessage = (channel: string, payload?: unknown) => entry.onMessage
        ? entry.onMessage(channel, payload)
        : context.messages.sendMessage(channel, payload)
      return h(entry.kind === 'drawer' ? AppleDrawer : entry.kind === 'sheet' ? AppleSheet : AppleDialog, {
        key: entry.id, modelValue: open, title: entry.title, message: entry.message,
        persistent: entry.persistent, confirmText: entry.confirmText, cancelText: entry.cancelText,
        tone: entry.tone, onClose: close, onAfterClose: () => this.remove(entry.id),
      }, entry.component ? {
        default: () => h(entry.component as Component, { ...entry.props, close, sendMessage }),
      } : undefined)
    })
    const snackbar = portal(this, h('div', { class: 'apple-snackbar-stack', 'aria-label': '通知' }, [
      h(AppleAutoSize, null, { default: () => h(TransitionGroup, { name: 'apple-toast-stack', tag: 'div', class: 'apple-snackbar-list' }, {
        default: () => notifications.map(({ entry, open }) => h('div', { key: entry.id, class: 'apple-snackbar-position' }, [
          h(AppleSnackbar, {
            modelValue: open, title: entry.title, message: entry.message,
            tone: entry.tone as 'default', duration: entry.duration,
            onClose: () => context.overlays.close(entry.id), onAfterClose: () => this.remove(entry.id),
          }),
        ])),
      }) }),
    ]))
    return h('div', { class: 'apple-overlay-host' }, [...dialogs, snackbar])
  },
})

export const ApplePopover = defineComponent({
  name: 'ApplePopover',
  inheritAttrs: false,
  inject: { apple: { from: appleKey, default: undefined } },
  props: {
    modelValue: { type: Boolean, default: undefined },
    label: { type: String, default: '更多' },
    disabled: Boolean,
    placement: { type: String as PropType<'top' | 'bottom' | 'left' | 'right'>, default: 'bottom' },
    align: { type: String as PropType<'start' | 'center' | 'end'>, default: 'start' },
    role: { type: String, default: 'dialog' },
    width: { type: [Number, String], default: 280 },
    openOnHover: Boolean,
    trapFocus: { type: Boolean, default: true },
    panelClass: { type: String, default: '' },
    motion: motionProp,
  },
  emits: ['update:modelValue', 'open', 'close', 'after-close'],
  data() { return {
    internalOpen: false, depth: 0, isTop: false,
    present: !!this.modelValue && !this.disabled,
    disposeLayer: null as (() => void) | null,
    disposePosition: null as (() => void) | null,
    hoverTimer: null as ReturnType<typeof setTimeout> | null,
    positioned: false,
    positioner: null as PopupPositioner | null,
    positionPanel: null as HTMLElement | null,
  } },
  computed: {
    opened(): boolean { return !this.disabled && (this.modelValue ?? this.internalOpen) },
  },
  watch: {
    opened(value: boolean) { if (value) this.present = true; this.position(); void this.syncLayer() },
    placement() { this.position() }, align() { this.position() },
  },
  mounted() { void this.syncLayer() },
  beforeUnmount() {
    this.disposeLayer?.(); this.disposePosition?.()
    this.positioner?.destroy()
    if (this.positionPanel) freezePopup(this.positionPanel)
    if (this.hoverTimer) clearTimeout(this.hoverTimer)
  },
  methods: {
    setOpen(open: boolean) {
      if (!open) this.position()
      if (open && this.disabled) return
      this.internalOpen = open
      this.$emit('update:modelValue', open)
    },
    hover(open: boolean) {
      if (!this.openOnHover) return
      if (this.hoverTimer) clearTimeout(this.hoverTimer)
      if (open) this.setOpen(true)
      else this.hoverTimer = setTimeout(() => this.setOpen(false), 100)
    },
    preparePosition(panel: HTMLElement) {
      const anchor = this.$refs.anchor as HTMLElement | undefined
      if (!anchor) return
      showOverlaySurface(panel)
      if (this.positionPanel !== panel) {
        this.disposeLayer?.(); this.disposeLayer = null
        this.disposePosition?.(); this.disposePosition = null
        this.positioner?.destroy()
        this.positionPanel = panel
        this.positioner = createPopupPositioner(panel, { anchor, fixed: true, placement: () => this.placement, align: () => this.align })
      }
      this.position()
      panel.style.visibility = 'visible'
      this.positioned = true
    },
    position() { this.positioner?.update() },
    async syncLayer() {
      if (!this.opened) return
      await nextTick()
      const panel = this.$refs.panel as HTMLElement | undefined
      const anchor = this.$refs.anchor as HTMLElement | undefined
      if (!this.opened || !panel || !anchor || this.disposeLayer) return
      this.preparePosition(panel)
      this.disposeLayer = registerLayer({
        element: panel, restore: panel.ownerDocument.activeElement as HTMLElement | null,
        close: () => this.setOpen(false), persistent: () => !this.opened, modal: false, trap: this.trapFocus,
        top: (top, depth) => { this.isTop = top; this.depth = depth },
      })
      const doc = panel.ownerDocument
      const outside = (event: Event) => {
        if (this.opened && this.isTop && !panel.contains(event.target as Node) && !anchor.contains(event.target as Node)) this.setOpen(false)
      }
      doc.addEventListener('pointerdown', outside, true)
      this.disposePosition = () => {
        doc.removeEventListener('pointerdown', outside, true)
      }
      this.$emit('open')
    },
    afterClose() {
      if (this.opened) return
      this.present = false
      this.disposeLayer?.(); this.disposeLayer = null
      this.disposePosition?.(); this.disposePosition = null
      this.positioner?.destroy(); this.positioner = null; this.positionPanel = null
      this.positioned = false
      this.$emit('close')
      this.$emit('after-close')
    },
  },
  render() {
    const id = `apple-popover-${this.$.uid}`
    const activatorProps = this.role === 'tooltip'
      ? { 'aria-describedby': this.opened ? id : undefined }
      : { 'aria-expanded': this.opened, 'aria-haspopup': this.role, 'aria-controls': this.opened ? id : undefined, disabled: this.disabled, onClick: () => this.setOpen(!this.opened) }
    const activator = this.$slots.activator?.({ props: activatorProps, open: () => this.setOpen(true), close: () => this.setOpen(false), isOpen: this.opened })
    const trigger = activator
      ? activator.map((node, index) => index === 0 ? cloneVNode(node, activatorProps) : node)
      : [h(AppleButton, { variant: 'secondary', ...activatorProps }, { default: () => this.label })]
    const motion = motionOf(this, this.motion)
    const panel = this.present ? withDirectives(h('div', mergeProps(this.$attrs, {
      id, ref: 'panel', role: this.role, tabindex: this.role === 'tooltip' ? undefined : -1,
      'aria-label': this.role === 'tooltip' ? undefined : this.label,
      'data-apple-motion': motion,
      class: ['apple-popover', this.panelClass],
      style: {
        zIndex: overlayZIndex(this.depth),
        width: typeof this.width === 'number' ? `${this.width}px` : this.width,
        '--apple-overlay-duration': `${durationOf(motion)}ms`,
        visibility: this.positioned ? 'visible' : 'hidden',
      },
      onMouseenter: () => this.hover(true), onMouseleave: () => this.hover(false),
    }), [h(AppleAutoSize, { motion: this.motion }, { default: () => this.$slots.default?.({ close: () => this.setOpen(false) }) })]), [[vShow, this.opened]]) : null
    const clearMotion = (element: Element) => {
      element.classList.remove('apple-popover-presence-enter-active', 'apple-popover-presence-leave-active')
      resetPopup(element)
    }
    const popup = portal(this, h(Transition, {
      css: false, appear: true, persisted: true,
      onBeforeEnter: (element: Element) => preparePopup(element),
      onEnter: (element: Element, done: () => void) => {
        this.preparePosition(element as HTMLElement)
        element.classList.add('apple-popover-presence-enter-active')
        animatePopup(element, true, done)
      },
      onBeforeLeave: () => this.position(),
      onLeave: (element: Element, done: () => void) => {
        element.classList.add('apple-popover-presence-leave-active')
        animatePopup(element, false, done)
      },
      onAfterEnter: clearMotion,
      onAfterLeave: (element: Element) => {
        hideOverlaySurface(element as HTMLElement)
        clearMotion(element); this.afterClose()
      },
      onEnterCancelled: (element: Element) => { freezePopup(element); element.classList.remove('apple-popover-presence-enter-active') },
      onLeaveCancelled: (element: Element) => { freezePopup(element); element.classList.remove('apple-popover-presence-leave-active') },
    }, { default: () => panel }))
    return h('span', {
      ref: 'anchor', class: 'apple-popover-anchor',
      onMouseenter: () => this.hover(true), onMouseleave: () => this.hover(false),
      onFocusin: () => { if (this.openOnHover) this.setOpen(true) },
      onFocusout: (event: FocusEvent) => {
        if (this.openOnHover && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) this.setOpen(false)
      },
    }, [...trigger, popup])
  },
})

export const AppleTooltip = defineComponent({
  name: 'AppleTooltip',
  props: {
    text: { type: String, required: true },
    placement: { type: String as PropType<'top' | 'bottom' | 'left' | 'right'>, default: 'top' },
    disabled: Boolean,
    motion: motionProp,
  },
  render() {
    return h(ApplePopover, {
      ...this.$attrs, role: 'tooltip', label: this.text, placement: this.placement,
      align: 'center', width: 'max-content', panelClass: 'apple-tooltip',
      openOnHover: true, trapFocus: false, disabled: this.disabled, motion: this.motion,
    }, { activator: this.$slots.default, default: () => this.text })
  },
})

export const AppleMenu = defineComponent({
  name: 'AppleMenu',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    label: { type: String, default: '操作' },
    items: { type: Array as PropType<AppleMenuItem[]>, default: () => [] },
    selected: { type: [String, Number], default: undefined },
    disabled: Boolean,
    motion: motionProp,
  },
  emits: ['update:modelValue', 'select'],
  data: () => ({ internalOpen: false }),
  methods: {
    setOpen(value: boolean) { this.internalOpen = value; this.$emit('update:modelValue', value) },
    select(item: AppleMenuItem) {
      if (item.disabled) return
      this.$emit('select', item.value, item)
      this.setOpen(false)
    },
    navigate(event: KeyboardEvent) {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
      const root = event.currentTarget as HTMLElement
      const items = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'))
      if (!items.length) return
      event.preventDefault()
      const current = items.indexOf(root.ownerDocument.activeElement as HTMLButtonElement)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]?.focus()
    },
  },
  render() {
    return h(ApplePopover, {
      ...this.$attrs, modelValue: this.modelValue ?? this.internalOpen,
      'onUpdate:modelValue': this.setOpen, label: this.label, disabled: this.disabled,
      role: 'menu', panelClass: 'apple-menu', motion: this.motion,
      onKeydown: this.navigate,
    }, {
      activator: this.$slots.activator,
      default: () => this.items.map(item => ripple(h('button', {
        key: item.value, type: 'button', role: 'menuitem', disabled: item.disabled,
        class: ['apple-menu-item', { 'apple-menu-item--danger': item.danger }],
        onClick: () => this.select(item),
      }, this.$slots.item?.({ item }) ?? [
        item.icon ? h(item.icon, { size: 18, 'aria-hidden': true }) : null,
        h('span', { class: 'apple-menu-copy' }, [h('span', item.label), item.description ? h('small', item.description) : null]),
        this.selected === item.value ? h(Check, { size: 17, 'aria-hidden': true }) : null,
      ]), !item.disabled)),
    })
  },
})

export const AppleActionSheet = defineComponent({
  name: 'AppleActionSheet',
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    items: { type: Array as PropType<AppleMenuItem[]>, default: () => [] },
    cancelText: { type: String, default: '取消' },
    motion: motionProp,
  },
  emits: ['update:modelValue', 'select', 'close'],
  methods: {
    select(item: AppleMenuItem) {
      if (item.disabled) return
      this.$emit('select', item.value, item)
      this.$emit('update:modelValue', false)
      this.$emit('close', item.value, 'select')
    },
    close(value?: unknown) {
      this.$emit('update:modelValue', false)
      this.$emit('close', value, 'close')
    },
  },
  render() {
    return h(AppleSheet, {
      ...this.$attrs, modelValue: this.modelValue, title: this.title,
      ariaLabel: this.title || '选择操作', motion: this.motion, showFooter: false,
      class: 'apple-action-sheet',
      'onUpdate:modelValue': (value: boolean) => this.$emit('update:modelValue', value),
      onClose: (value: unknown, reason: string) => this.$emit('close', value, reason),
    }, {
      default: () => [
        this.message ? h('p', { class: 'apple-action-sheet-message' }, this.message) : null,
        this.$slots.default?.({ select: this.select, close: this.close }) ?? h('div', { class: 'apple-action-sheet-items' }, this.items.map(item => ripple(h('button', {
          key: item.value, type: 'button', disabled: item.disabled,
          class: ['apple-action-sheet-item', { 'apple-action-sheet-item--danger': item.danger }],
          onClick: () => this.select(item),
        }, [item.icon ? h(item.icon, { size: 21, 'aria-hidden': true }) : null, h('span', [item.label, item.description ? h('small', item.description) : null])]), !item.disabled))),
        this.cancelText ? h(AppleButton, {
          variant: 'secondary', class: 'apple-action-sheet-cancel',
          onClick: () => { this.$emit('update:modelValue', false); this.$emit('close', undefined, 'cancel') },
        }, { default: () => this.cancelText }) : null,
      ],
    })
  },
})

export interface AppleViewerImage { src: string; alt?: string; title?: string; width?: number; height?: number }
const AppleMobileImageViewer = createMobileImageViewer(registerLayer)
export const InternalImageViewer = defineComponent({
  name: 'AppleImageViewer', inheritAttrs: false,
  inject: { apple: { from: appleKey, default: undefined } },
  props: {
    modelValue: Boolean, images: { type: Array as PropType<Array<string | AppleViewerImage>>, default: () => [] },
    index: { type: Number, default: 0 }, loop: Boolean, motion: motionProp,
    origin: Function as PropType<(index: number, reveal?: boolean) => HTMLImageElement | null>,
  },
  emits: ['update:modelValue', 'update:index', 'change', 'close', 'after-close', 'error'],
  computed: { resolvedMotion(): string { return motionOf(this, this.motion) } },
  watch: {
    resolvedMotion(value: string) {
      const panel = (this.$refs.mobileViewer as { $el?: HTMLElement } | undefined)?.$el
      if (value !== 'full') panel?.getAnimations?.({ subtree: true }).forEach(animation => {
        if (Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))) animation.finish()
      })
    },
  },
  render() {
    return h(AppleMobileImageViewer, {
      ...this.$attrs, ...this.$props, ref: 'mobileViewer',
      'onUpdate:modelValue': (value: boolean) => this.$emit('update:modelValue', value),
      'onUpdate:index': (value: number) => this.$emit('update:index', value),
      onChange: (value: number) => this.$emit('change', value), onClose: () => this.$emit('close'),
      onAfterClose: () => this.$emit('after-close'), onError: (event: Event) => this.$emit('error', event),
    })
  },
})

export const overlayComponents = {
  AppleDialog, AppleDrawer, AppleSheet, AppleSnackbar, AppleOverlayHost,
  ApplePopover, AppleTooltip, AppleMenu, AppleActionSheet,
}

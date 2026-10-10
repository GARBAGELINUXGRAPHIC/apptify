import { computed, defineComponent, getCurrentInstance, h, inject, onBeforeUnmount, onMounted, Teleport, useId, watch, type Component, type PropType, type VNodeChild } from 'vue'
import { Menu } from 'lucide-vue-next'
import { appleKey } from '../core/context'
import { useSpeedDialEntry, type SpeedDialEntry } from '../core/speed-dial'
import { AppleButton } from './button'
import { AppleBackTop, AppleFloatingGroup } from './content'
import { AppleDialog } from './overlays'
import { AppleTabBar } from './tabs'

function entryPanel(entry: SpeedDialEntry) {
  return h('div', { key: entry.id, class: 'apple-speed-dial-entry', ref: element => {
    if (element instanceof HTMLElement && entry.target.parentElement !== element) element.appendChild(entry.target)
  } })
}

export const AppleSpeedDial = defineComponent({
  name: 'AppleSpeedDial',
  props: {
    backTop: { type: Boolean, default: true },
    target: { type: String, default: '' },
    threshold: { type: Number, default: 300 },
    label: { type: String, default: '快捷操作' },
  },
  setup(props) {
    const registry = inject(appleKey, null)?.speedDial
    const id = useId()
    let depth = 0
    for (let instance = getCurrentInstance(); instance; instance = instance.parent) depth++
    let media: MediaQueryList | undefined
    const ownsHost = computed(() => registry?.host.value === id)
    const syncMedia = () => { if (registry && media && ownsHost.value) { registry.mobile.value = media.matches; if (!media.matches) registry.open.value = false } }
    onMounted(() => {
      if (!registry) return
      if (registry.host.value) {
        if (import.meta.env.DEV) console.warn('AppleSpeedDial: only one app host is allowed. Use AppleSpeedDialItem in child pages.')
        if (depth >= registry.hostDepth.value) return
      }
      registry.host.value = id
      registry.hostDepth.value = depth
      if (typeof matchMedia === 'function') { media = matchMedia('(max-width: 900px)'); syncMedia(); media.addEventListener('change', syncMedia) }
    })
    watch(ownsHost, value => { if (!value) media?.removeEventListener('change', syncMedia) })
    onBeforeUnmount(() => {
      media?.removeEventListener('change', syncMedia)
      if (registry && ownsHost.value) { registry.host.value = undefined; registry.hostDepth.value = Infinity; registry.mobile.value = false; registry.open.value = false }
    })
    const directories = computed(() => registry?.entries.value.filter(entry => entry.kind === 'directory') ?? [])
    const active = computed(() => directories.value.find(entry => entry.id === registry?.activeDirectory.value) ?? directories.value[0])
    watch(directories, () => { if (registry && !directories.value.length) registry.open.value = false })
    return (): VNodeChild => {
      if (!registry || !ownsHost.value) return null
      const directoryContent = directories.value.length > 1
        ? h(AppleTabBar, { items: directories.value.map(entry => ({ label: entry.label, value: entry.id })), modelValue: active.value?.id, label: '页面目录', 'onUpdate:modelValue': value => { registry.activeDirectory.value = String(value) }, motion: 'none' }, Object.fromEntries(directories.value.map(entry => [`panel-${entry.id}`, () => entryPanel(entry)])))
        : active.value ? entryPanel(active.value) : null
      return [
        h(AppleFloatingGroup, { backTop: false, label: props.label, class: 'apple-speed-dial' }, { default: () => [
          props.backTop ? h(AppleBackTop, { target: props.target, threshold: props.threshold }) : null,
          ...registry.entries.value.filter(entry => entry.kind === 'action').map(entryPanel),
          registry.mobile.value && directories.value.length ? h(AppleButton, { class: 'apple-speed-dial-directory', variant: 'primary', iconOnly: true, icon: Menu, label: '展开目录', 'aria-haspopup': 'dialog', 'aria-expanded': registry.open.value, onClick: () => { registry.open.value = true } }) : null,
        ] }),
        h(AppleDialog, { modelValue: registry.open.value, 'onUpdate:modelValue': value => { registry.open.value = value }, title: directories.value.length > 1 ? '页面目录' : active.value?.label ?? '页面目录', showFooter: false, width: '480px', class: 'apple-directory-dialog' }, { default: () => directoryContent }),
      ]
    }
  },
})

export const AppleSpeedDialItem = defineComponent({
  name: 'AppleSpeedDialItem',
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    icon: [Object, Function] as PropType<Component>,
    disabled: Boolean,
    visible: { type: Boolean, default: true },
    variant: { type: String as PropType<'primary' | 'secondary' | 'outline' | 'danger'>, default: 'primary' },
  },
  emits: ['click'],
  setup(props, { attrs, slots, emit }) {
    const entry = useSpeedDialEntry('action', () => props.label, () => props.visible)
    return (): VNodeChild => {
      if (!props.visible) return null
      const button = h(AppleButton, { ...attrs, label: props.label, icon: props.icon, iconOnly: Boolean(props.icon && !slots.default), disabled: props.disabled, variant: props.variant, class: ['apple-speed-dial-item', attrs.class], onClick: (event: MouseEvent) => emit('click', event) }, slots.default || props.icon ? slots : { default: () => props.label })
      return h(Teleport, { to: entry.target.value ?? 'body', disabled: !entry.hosted.value }, button)
    }
  },
})

export const speedDialComponents = { AppleSpeedDial, AppleSpeedDialItem }

import { computed, inject, markRaw, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { appleKey } from './context'

export interface SpeedDialEntry {
  id: string
  kind: 'directory' | 'action'
  label: string
  target: HTMLElement
}

export function createSpeedDialRegistry() {
  const entries = shallowRef<SpeedDialEntry[]>([])
  const host = ref<string>()
  const hostDepth = ref(Infinity)
  const mobile = ref(false)
  const open = ref(false)
  const activeDirectory = ref<string>()
  return markRaw({
    entries, host, hostDepth, mobile, open, activeDirectory,
    register(entry: SpeedDialEntry) {
      const previous = entries.value.find(item => item.id === entry.id)
      entries.value = previous ? entries.value.map(item => item.id === entry.id ? entry : item) : [...entries.value, entry]
    },
    unregister(id: string) {
      entries.value = entries.value.filter(item => item.id !== id)
      if (activeDirectory.value === id) activeDirectory.value = undefined
      if (!entries.value.some(item => item.kind === 'directory')) open.value = false
    },
  })
}

export function useSpeedDialEntry(kind: SpeedDialEntry['kind'], label: () => string, enabled: () => boolean = () => true) {
  const registry = inject(appleKey, null)?.speedDial
  const id = useId()
  const target = shallowRef<HTMLElement>()
  const active = ref(false)
  onMounted(() => { target.value = document.createElement('div'); active.value = true })
  onActivated(() => { active.value = true })
  onDeactivated(() => { active.value = false })
  onBeforeUnmount(() => { active.value = false; registry?.unregister(id) })
  watch([active, target, enabled, label], () => {
    if (registry && target.value && active.value && enabled()) registry.register({ id, kind, label: label(), target: target.value })
    else registry?.unregister(id)
  }, { immediate: true })
  const hosted = computed(() => Boolean(registry?.host.value && active.value && enabled() && target.value && (kind === 'action' || registry.mobile.value)))
  return { target, hosted, close: () => { if (hosted.value && registry) registry.open.value = false } }
}

import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface NavigationState {
  previews: Set<symbol>
  listeners: Set<(active: boolean) => void>
}

const scopes = new WeakMap<Node, NavigationState>()
function stateFor(element: Element): NavigationState {
  // Teleported previews use their source, so a dialog only hides its own navigation.
  const scope = element.closest('.apple-modal,[data-apple-navigation-scope]') ?? element.ownerDocument
  let state = scopes.get(scope)
  if (!state) {
    state = { previews: new Set(), listeners: new Set() }
    scopes.set(scope, state)
  }
  return state
}

// Each viewer holds navigation while open and releases it when its exit starts.
export function holdPreviewNavigation(source: Element): () => void {
  const state = stateFor(source), token = Symbol()
  state.previews.add(token)
  state.listeners.forEach(listener => listener(true))
  return () => {
    if (!state.previews.delete(token)) return
    state.listeners.forEach(listener => listener(state.previews.size > 0))
  }
}

export function usePreviewNavigation() {
  const previewRoot = shallowRef<HTMLElement>()
  const previewActive = ref(false)
  let dispose = () => {}
  onMounted(() => {
    if (!previewRoot.value) return
    const state = stateFor(previewRoot.value)
    const update = (active: boolean) => { previewActive.value = active }
    state.listeners.add(update)
    update(state.previews.size > 0)
    dispose = () => { state.listeners.delete(update) }
  })
  onBeforeUnmount(() => dispose())
  return { previewRoot, previewActive }
}

import { readonly, ref } from 'vue'

export const touchDeviceQuery = '(any-pointer: coarse)'
export const detectTouchDevice = () => typeof window !== 'undefined' &&
  (window.navigator.maxTouchPoints > 0 || (window.matchMedia?.(touchDeviceQuery).matches ?? false))

const touchDevice = ref(detectTouchDevice())
/** Shared across apps, components and teleported overlays. */
export const isTouchDevice = readonly(touchDevice)
const verticalScreen = ref(typeof window !== 'undefined' && window.innerHeight > window.innerWidth)
export const isVerticalScreen = readonly(verticalScreen)
export function syncVerticalScreen() {
  if (typeof window !== 'undefined') verticalScreen.value = window.innerHeight > window.innerWidth
}

let media: MediaQueryList | undefined
export function syncTouchDevice() {
  if (typeof window === 'undefined') return
  touchDevice.value = detectTouchDevice()
  document.documentElement.toggleAttribute('data-apple-touch', touchDevice.value)
}

if (typeof window !== 'undefined') {
  syncTouchDevice()
  media = window.matchMedia?.(touchDeviceQuery)
  media?.addEventListener?.('change', syncTouchDevice)
  window.addEventListener('pageshow', syncTouchDevice)
  window.addEventListener('resize', syncVerticalScreen)
  window.addEventListener('orientationchange', syncVerticalScreen)
  window.addEventListener('pageshow', syncVerticalScreen)
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  media?.removeEventListener?.('change', syncTouchDevice)
  window.removeEventListener('pageshow', syncTouchDevice)
  window.removeEventListener('resize', syncVerticalScreen)
  window.removeEventListener('orientationchange', syncVerticalScreen)
  window.removeEventListener('pageshow', syncVerticalScreen)
})

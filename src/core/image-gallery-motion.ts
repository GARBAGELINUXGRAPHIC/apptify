import { photoPageTiming } from './image-motion'

interface ScrollMotion {
  overlay: HTMLElement | null
  snap: string
  velocity: number
  stop: (retain?: boolean) => HTMLElement | null
}
const motions = new WeakMap<HTMLElement, ScrollMotion>()

export function stopGalleryScroll(box: HTMLElement) { motions.get(box)?.stop() }

// Adjacent compact pages retain their painted position and velocity on retarget.
// Distant destinations travel only one viewport instead of sweeping through all pages.
export function scrollGallery(box: HTMLElement, left: number, animated: boolean, complete: () => void, adjacent = false) {
  const old = motions.get(box)
  const snap = old?.snap ?? box.style.scrollSnapType
  const velocity = old?.velocity ?? 0
  const outgoing = old?.stop(animated) ?? null
  const start = box.scrollLeft, width = box.clientWidth
  if (!animated || typeof box.animate !== 'function' || Math.abs(left - start) < 1 && !outgoing) {
    outgoing?.remove()
    box.scrollTo({ left, behavior: 'instant' }); box.style.scrollSnapType = snap; complete()
    return
  }
  let overlay: HTMLElement | null = null, frame = 0
  const animations: Animation[] = []
  const opacity = box.style.opacity
  let stopped = false
  const state: ScrollMotion = {
    overlay, snap, velocity: 0,
    stop(retain = false) {
      if (stopped) return null
      stopped = true
      cancelAnimationFrame(frame)
      // Freeze painted transforms before cancelling, so a new selection can
      // carry the entire partially completed composition into its next slide.
      if (retain && overlay) Array.from(overlay.children).forEach(child => {
        (child as HTMLElement).style.transform = getComputedStyle(child).transform
      })
      animations.forEach(animation => animation.cancel())
      box.scrollTo({ left: box.scrollLeft, behavior: 'instant' })
      box.style.opacity = opacity
      // Restoring mandatory snap between two animations jumps to a nearby page.
      if (!retain) box.style.scrollSnapType = snap
      if (motions.get(box) === state) motions.delete(box)
      if (!retain) overlay?.remove()
      return retain ? overlay : null
    },
  }
  motions.set(box, state)
  const finish = () => {
    if (motions.get(box) !== state) return
    state.stop(); complete()
  }
  const compact = box.classList.contains('apple-image__gallery--compact')
  if (compact && !outgoing && (adjacent || Math.abs(left - start) <= width * 1.5)) {
    box.style.scrollSnapType = 'none'
    const distance = left - start, began = performance.now()
    const timing = photoPageTiming(distance, velocity, width)
    const [x1, y1, x2, y2] = timing.easing.match(/-?\d*\.?\d+/g)!.map(Number)
    const bezier = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3
    const derivative = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t * t * (1 - b)
    const step = (now: number) => {
      const progress = Math.min(1, (now - began) / timing.duration)
      let low = 0, high = 1
      for (let i = 0; i < 24; i++) {
        const middle = (low + high) / 2
        if (bezier(middle, x1, x2) < progress) low = middle
        else high = middle
      }
      const t = (low + high) / 2
      state.velocity = distance / timing.duration * derivative(t, y1, y2) / Math.max(.0001, derivative(t, x1, x2))
      box.scrollTo({ left: progress === 1 ? left : start + distance * bezier(t, y1, y2), behavior: 'instant' })
      if (progress === 1) finish()
      else frame = requestAnimationFrame(step)
    }
    state.velocity = velocity
    frame = requestAnimationFrame(step)
    return
  }
  if (!outgoing && !compact) {
    box.scrollTo({ left, behavior: 'smooth' })
    const check = () => {
      if (Math.abs(box.scrollLeft - left) < 1) finish()
      else frame = requestAnimationFrame(check)
    }
    frame = requestAnimationFrame(check)
    return
  }
  overlay = document.createElement('div')
  overlay.className = 'apple-image__jump'
  overlay.setAttribute('aria-hidden', 'true'); overlay.inert = true
  Object.assign(overlay.style, { position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none' })
  state.overlay = overlay
  const snapshot = () => {
    const clone = box.cloneNode(true) as HTMLElement
    clone.removeAttribute('id'); clone.removeAttribute('tabindex')
    Object.assign(clone.style, { opacity: opacity || '1', scrollSnapType: 'none', scrollBehavior: 'auto', pointerEvents: 'none' })
    return clone
  }
  const from = outgoing ?? snapshot(), to = snapshot()
  overlay.append(from, to); box.after(overlay)
  if (!outgoing) from.scrollLeft = start
  to.scrollLeft = left
  box.style.scrollSnapType = 'none'; box.style.opacity = '0'
  box.scrollTo({ left, behavior: 'instant' })
  const direction = Math.sign(left - start) || 1, stride = width + 8
  const timing = photoPageTiming(stride, 0, width)
  animations.push(from.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * stride}px)` }], { ...timing, fill: 'both' }))
  animations.push(to.animate([{ transform: `translateX(${direction * stride}px)` }, { transform: 'translateX(0)' }], { ...timing, fill: 'both' }))
  void Promise.all(animations.map(animation => animation.finished.catch(() => undefined))).then(finish)
}

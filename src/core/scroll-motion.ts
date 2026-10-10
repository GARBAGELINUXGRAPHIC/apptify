export interface MotionScroll { finished: Promise<void>; cancel: () => void }
const active = new WeakMap<HTMLElement | Window, { top: number; run: MotionScroll }>()

export function cancelMotionScroll(target: HTMLElement | Window) { active.get(target)?.run.cancel() }

export function scrollToWithMotion(target: HTMLElement | Window, destination: number | (() => number), animated = true): MotionScroll {
  const readTop = () => Math.max(0, typeof destination === 'function' ? destination() : destination)
  const top = readTop()
  const previous = active.get(target)
  if (animated && previous?.top === top) return previous.run
  previous?.run.cancel()
  const start = target === window ? window.scrollY : (target as HTMLElement).scrollTop
  const distance = top - start
  if (!animated || !distance) {
    target.scrollTo({ top, behavior: 'instant' })
    return { finished: Promise.resolve(), cancel() {} }
  }
  const duration = Math.min(2000, Math.max(180, Math.sqrt(Math.abs(distance)) * 20))
  const started = performance.now()
  let frame = 0, done = false
  let resolve!: () => void
  const finished = new Promise<void>(complete => { resolve = complete })
  const cancel = () => {
    if (done) return
    done = true
    cancelAnimationFrame(frame)
    active.delete(target)
    for (const type of ['wheel', 'touchstart', 'keydown']) window.removeEventListener(type, interrupt, true)
    resolve()
  }
  const interrupt = (event: Event) => {
    if (event.type !== 'keydown' || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'].includes((event as KeyboardEvent).key)) cancel()
  }
  const tick = (now: number) => {
    if (done) return
    const progress = Math.min(1, Math.max(0, (now - started) / duration))
    // Instant frame writes avoid stacking a browser-controlled smooth scroll.
    state.top = readTop()
    target.scrollTo({ top: progress === 1 ? state.top : state.top - (state.top - start) * (1 - progress) ** 3, behavior: 'instant' })
    if (progress < 1) frame = requestAnimationFrame(tick)
    else cancel()
  }
  const run = { finished, cancel }
  const state = { top, run }
  active.set(target, state)
  for (const type of ['wheel', 'touchstart', 'keydown']) window.addEventListener(type, interrupt, { capture: true, passive: true })
  frame = requestAnimationFrame(tick)
  return run
}

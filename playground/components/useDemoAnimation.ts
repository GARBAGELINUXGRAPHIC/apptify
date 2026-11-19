import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const resumeDelay = 6000

export function useDemoAnimation(
  update: (delta: number, automatic: boolean, interacting: boolean) => void,
  enabled: () => boolean = () => true,
) {
  const automatic = ref(true)
  const interacting = ref(false)
  let resumeAt = 0
  let pointerId: number | undefined
  let frame = 0
  let previous: number | undefined
  let mounted = false

  function takeOver() {
    automatic.value = false
    resumeAt = performance.now() + resumeDelay
  }

  function pointerDown(event: PointerEvent) {
    if (event.isPrimary === false || event.button !== 0) return
    pointerId = event.pointerId
    interacting.value = true
    takeOver()
  }

  function pointerEnd(event?: PointerEvent) {
    if (pointerId === undefined || event && event.pointerId !== pointerId) return
    pointerId = undefined
    interacting.value = false
    takeOver()
  }

  function keyDown(event: KeyboardEvent) {
    takeOver()
    const input = event.target
    if (!(input instanceof HTMLInputElement) || input.type !== 'range') return
    const direction = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key]
    if (!direction) return
    event.preventDefault()
    input.value = String(Math.min(Number(input.max), Math.max(Number(input.min), Math.round(input.valueAsNumber) + direction * (event.shiftKey ? 10 : 1))))
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function tick(now: number) {
    let delta = previous === undefined ? 0 : now - previous
    previous = now
    if (!automatic.value && !interacting.value && now >= resumeAt) {
      automatic.value = true
      delta = 0
    }
    update(delta, automatic.value, interacting.value)
    frame = requestAnimationFrame(tick)
  }

  function sync() {
    cancelAnimationFrame(frame)
    previous = undefined
    if (document.hidden) pointerEnd()
    if (mounted && !document.hidden && enabled()) frame = requestAnimationFrame(tick)
  }

  watch(enabled, sync)
  onMounted(() => {
    mounted = true
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pointerup', pointerEnd, true)
    window.addEventListener('pointercancel', pointerEnd, true)
    window.addEventListener('blur', blur)
    sync()
  })
  function blur() { pointerEnd() }
  onBeforeUnmount(() => {
    mounted = false
    cancelAnimationFrame(frame)
    document.removeEventListener('visibilitychange', sync)
    window.removeEventListener('pointerup', pointerEnd, true)
    window.removeEventListener('pointercancel', pointerEnd, true)
    window.removeEventListener('blur', blur)
  })

  return {
    automatic,
    takeOver,
    interaction: {
      onPointerdownCapture: pointerDown,
      onLostpointercaptureCapture: pointerEnd,
      onKeydownCapture: keyDown,
      onInputCapture: takeOver,
      onClickCapture: takeOver,
      onFocusinCapture: takeOver,
    },
  }
}

export function useDemoSweep(initial: number, min: number, max: number, duration: number, enabled: () => boolean) {
  const value = ref(initial)
  let from = initial
  let target = max
  let elapsed = 0
  const animation = useDemoAnimation((delta, automatic) => {
    if (!automatic) return
    elapsed += delta
    const progress = Math.min(1, elapsed / duration)
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
    value.value = from + (target - from) * eased
    if (progress === 1) {
      from = target
      target = target === max ? min : max
      elapsed = 0
    }
  }, enabled)
  watch(value, current => {
    if (animation.automatic.value) return
    from = current
    elapsed = 0
    if (from === target) target = target === max ? min : max
  }, { flush: 'sync' })
  watch(animation.automatic, automatic => {
    if (!automatic) { from = value.value; elapsed = 0 }
  }, { flush: 'sync' })
  return { value, ...animation }
}

import { defineComponent, onBeforeUnmount, onMounted, watch, type PropType } from 'vue'
import { attachScrollBar, installScrollBars, type ScrollBarAxis } from '../core/scrollbar'

export const AppleScrollBar = defineComponent({
  name: 'AppleScrollBar',
  props: {
    target: { type: [String, Object, Function] as PropType<string | HTMLElement | (() => HTMLElement | undefined)>, default: '' },
    axis: { type: String as PropType<ScrollBarAxis>, default: 'both' },
    label: { type: String, default: '' },
    controls: { type: String, default: '' },
  },
  emits: ['interaction'],
  setup(props, { emit, expose }) {
    let dispose: (() => void) | undefined, refresh = () => {}
    let boundTarget: HTMLElement | null | undefined, signature = ''
    function connect() {
      const target = !props.target ? null : typeof props.target === 'function' ? props.target() : typeof props.target === 'string' ? document.querySelector<HTMLElement>(props.target) : props.target
      const nextSignature = `${props.axis}\n${props.label}\n${props.controls}`
      if (dispose && target === boundTarget && signature === nextSignature) return
      dispose?.(); dispose = undefined; refresh = () => {}
      boundTarget = target; signature = nextSignature
      if (!props.target) { dispose = installScrollBars(document.querySelector<HTMLElement>('.apple-provider') ?? document.body); return }
      if (!target) return
      const binding = attachScrollBar(target, { axis: props.axis, label: props.label, controls: props.controls, interaction: () => emit('interaction') })
      dispose = binding.dispose; refresh = binding.refresh
    }
    onMounted(connect)
    watch(() => [props.target, props.axis, props.label, props.controls], connect, { flush: 'post' })
    onBeforeUnmount(() => dispose?.())
    expose({ refresh: () => refresh() })
    return () => null
  },
})

export const scrollBarComponents = { AppleScrollBar }

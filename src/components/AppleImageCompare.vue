<template>
  <div class="apple-image-compare" :class="{ 'is-disabled': disabled, 'is-dragging': dragging }"
    :style="{ '--apple-compare-position': `${position}%` }"
    @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd($event)"
    @pointercancel="pointerEnd($event, true)" @lostpointercapture="pointerEnd($event, true)">
    <div ref="surface" class="apple-image-compare__surface" :style="{ aspectRatio }">
      <div class="apple-image-compare__frame">
        <img class="apple-image-compare__image" :src="after" :alt="afterAlt" :style="{ objectFit: fit }" draggable="false" />
        <div class="apple-image-compare__before">
          <img class="apple-image-compare__image" :src="before" :alt="beforeAlt" :style="{ objectFit: fit }" draggable="false" />
        </div>
        <span v-if="beforeLabel" class="apple-image-compare__label apple-image-compare__label--before" aria-hidden="true">{{ beforeLabel }}</span>
        <span v-if="afterLabel" class="apple-image-compare__label apple-image-compare__label--after" aria-hidden="true">{{ afterLabel }}</span>
        <div class="apple-image-compare__divider" aria-hidden="true" />
      </div>
      <div ref="handle" class="apple-image-compare__handle" role="slider" :tabindex="disabled ? -1 : 0"
        :aria-label="label" aria-orientation="horizontal" :aria-valuemin="0" :aria-valuemax="100"
        :aria-valuenow="position" :aria-valuetext="`${beforeLabel || '之前'} ${position}% · ${afterLabel || '之后'} ${100 - position}%`"
        :aria-disabled="disabled" @keydown="keyDown">
        <span class="apple-image-compare__grip" aria-hidden="true">
          <IconChevronLeft :size="14" :stroke-width="1.75" /><IconChevronRight :size="14" :stroke-width="1.75" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'

const normalize = (value: number) => Number.isFinite(value) ? Math.round(Math.min(100, Math.max(0, value))) : 50

export default defineComponent({
  name: 'AppleImageCompare',
  components: { IconChevronLeft, IconChevronRight },
  props: {
    before: { type: String, required: true },
    after: { type: String, required: true },
    beforeAlt: { type: String, default: '调整前的图片' },
    afterAlt: { type: String, default: '调整后的图片' },
    beforeLabel: { type: String, default: '之前' },
    afterLabel: { type: String, default: '之后' },
    modelValue: { type: Number, default: 50 },
    label: { type: String, default: '图片对比' },
    aspectRatio: { type: [String, Number], default: '4/3' },
    fit: { type: String as PropType<'contain' | 'cover'>, default: 'cover' },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const surface = ref<HTMLElement>()
    const handle = ref<HTMLElement>()
    const position = ref(normalize(props.modelValue))
    const dragging = ref(false)
    let drag: { id: number; start: number } | undefined
    watch(() => props.modelValue, value => { position.value = normalize(value) })
    watch(() => props.disabled, value => { if (value) finish() })

    function update(value: number) {
      const next = normalize(value)
      if (next === position.value) return
      position.value = next
      emit('update:modelValue', next)
    }
    function move(event: PointerEvent) {
      const rect = surface.value?.getBoundingClientRect()
      if (rect?.width) update((event.clientX - rect.left) / rect.width * 100)
    }
    function pointerDown(event: PointerEvent) {
      if (props.disabled || drag || event.isPrimary === false || event.button !== 0) return
      event.stopPropagation()
      drag = { id: event.pointerId, start: position.value }
      dragging.value = true
      handle.value?.focus({ preventScroll: true })
      surface.value?.setPointerCapture?.(event.pointerId)
      move(event)
    }
    function pointerMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.id) return
      event.stopPropagation()
      move(event)
    }
    function finish() {
      if (!drag) return
      const { id, start } = drag
      drag = undefined
      dragging.value = false
      if (position.value !== start) emit('change', position.value)
      if (surface.value?.hasPointerCapture?.(id)) surface.value.releasePointerCapture(id)
    }
    function pointerEnd(event: PointerEvent, interrupted = false) {
      if (!drag || event.pointerId !== drag.id) return
      event.stopPropagation()
      if (!interrupted) move(event)
      finish()
    }
    function keyDown(event: KeyboardEvent) {
      if (props.disabled) return
      const step = event.shiftKey ? 10 : 1
      const values: Record<string, number> = {
        ArrowLeft: position.value - step, ArrowDown: position.value - step,
        ArrowRight: position.value + step, ArrowUp: position.value + step,
        PageDown: position.value - 10, PageUp: position.value + 10, Home: 0, End: 100,
      }
      if (!(event.key in values)) return
      event.preventDefault()
      event.stopPropagation()
      const previous = position.value
      update(values[event.key])
      if (previous !== position.value) emit('change', position.value)
    }
    return { surface, handle, position, dragging, pointerDown, pointerMove, pointerEnd, keyDown }
  },
})
</script>

<style>
.apple-image-compare { display: grid; place-items: stretch; width: 100%; min-width: 0; box-sizing: border-box; padding-inline: 28px; overflow: clip; isolation: isolate; border-radius: 12px; cursor: default; touch-action: pan-y; user-select: none; -webkit-user-select: none; }
.apple-image-compare__surface { position: relative; min-width: 0; min-height: 0; border-radius: inherit; }
.apple-image-compare__frame { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; background: var(--apple-surface-alt, #f5f5f7); }
.apple-image-compare__image { position: absolute; inset: 0; display: block; width: 100%; height: 100%; max-width: none; pointer-events: none; }
.apple-image-compare__before { position: absolute; inset: 0; clip-path: inset(0 calc(100% - var(--apple-compare-position)) 0 0); }
.apple-image-compare__label { position: absolute; top: 12px; padding: 5px 9px; border: 1px solid rgb(0 0 0 / 6%); border-radius: 6px; background: rgb(255 255 255 / 92%); color: #303034; font-size: 11px; line-height: 1.4; pointer-events: none; }
.apple-image-compare__label--before { left: 12px; }
.apple-image-compare__label--after { right: 12px; }
.apple-image-compare__divider { position: absolute; top: 0; bottom: 0; left: var(--apple-compare-position); width: 3px; transform: translateX(-50%); background: #007aff; pointer-events: none; }
.apple-image-compare__handle { position: absolute; top: 50%; left: var(--apple-compare-position); display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; box-sizing: border-box; border: 1px solid rgb(255 255 255 / 80%); border-radius: 50%; background: rgb(255 255 255 / 58%); color: #18181b; -webkit-backdrop-filter: blur(12px) saturate(1.4); backdrop-filter: blur(12px) saturate(1.4); box-shadow: inset 0 1px 1px rgb(255 255 255 / 70%), 0 3px 12px rgb(0 0 0 / 18%); transform: translate(-50%, -50%); cursor: ew-resize; touch-action: none; }
.apple-image-compare__grip { display: inline-flex; align-items: center; justify-content: center; pointer-events: none; }
.apple-image-compare__handle { transition: transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease, color 160ms ease; }
@media (hover: hover) {
  .apple-image-compare:not(.is-disabled) .apple-image-compare__handle:hover { transform: translate(-50%, -50%) scale(1.08); background: rgb(255 255 255 / 78%); box-shadow: inset 0 1px 1px rgb(255 255 255 / 80%), 0 5px 16px rgb(0 0 0 / 24%); }
}
.apple-image-compare.is-dragging:not(.is-disabled) .apple-image-compare__handle { transform: translate(-50%, -50%) scale(.96); background: rgb(255 255 255 / 90%); color: #007aff; box-shadow: inset 0 1px 1px rgb(255 255 255 / 80%), 0 2px 8px rgb(0 0 0 / 18%), 0 0 0 4px rgb(0 122 255 / 14%); }
@media (prefers-reduced-motion: reduce) {
  .apple-image-compare__handle { transition: none; }
}
.apple-image-compare__grip > svg { flex: none; margin-inline: -1px; }
.apple-image-compare__handle:focus-visible { outline: 3px solid #007aff; outline-offset: 3px; }
.apple-image-compare.is-disabled { cursor: default; }
.apple-image-compare.is-disabled .apple-image-compare__handle { opacity: .6; cursor: default; }
</style>

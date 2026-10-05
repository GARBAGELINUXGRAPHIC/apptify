<template>
  <div ref="root" class="masonry-feed"><slot /></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ layout: [] }>()
const root = ref<HTMLElement>()
let observer: ResizeObserver | undefined
let frame = 0
const gap = 20

function layout() {
  frame = 0
  const container = root.value
  if (!container || !container.clientWidth) return
  const cards = Array.from(container.children) as HTMLElement[]
  const columns = Math.max(1, Math.floor((container.clientWidth + gap) / (400 + gap)))
  const width = (container.clientWidth - gap * (columns - 1)) / columns
  const heights = Array<number>(columns).fill(0)
  for (const card of cards) card.style.width = `${width}px`
  for (const card of cards) {
    const column = heights.indexOf(Math.min(...heights))
    card.style.position = 'absolute'
    card.style.left = `${column * (width + gap)}px`
    card.style.top = `${heights[column]}px`
    heights[column] += card.offsetHeight + gap
  }
  container.style.height = `${Math.max(...heights)}px`
  emit('layout')
}

function scheduleLayout() {
  if (!frame) frame = requestAnimationFrame(layout)
}

onMounted(() => {
  observer = new ResizeObserver(scheduleLayout)
  observer.observe(root.value!)
  for (const card of root.value!.children) observer.observe(card)
  layout()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
.masonry-feed { position: relative; }
</style>

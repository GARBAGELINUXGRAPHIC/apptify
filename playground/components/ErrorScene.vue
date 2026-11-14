<template>
  <div class="error-scene">
    <component :is="scenes[code]" ref="scene" :theme="theme" :motion="motion" :paused="paused" />
    <div v-if="motion === 'full' && scene" class="error-scene__controls" role="group" aria-label="动画控制">
      <apple-button variant="borderless" icon-only :icon="paused ? Play : Pause"
        :label="paused ? '继续动画' : '暂停动画'" :aria-pressed="paused" @click="paused = !paused" />
      <apple-button variant="borderless" icon-only :icon="RotateCcw"
        label="重新播放动画" @click="replay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { Pause, Play, RotateCcw } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import type { ErrorCode } from '../error-pages'

defineProps<{ code: ErrorCode }>()
const scenes = {
  400: defineAsyncComponent(() => import('./bad-request-paper-scene.vue')),
  403: defineAsyncComponent(() => import('./forbidden-paper-scene.vue')),
  404: defineAsyncComponent(() => import('./not-found-paper-scene.vue')),
  429: defineAsyncComponent(() => import('./hamster-429-scene.vue')),
  500: defineAsyncComponent(() => import('./server-fire-paper-scene.vue')),
  502: defineAsyncComponent(() => import('./gateway-paper-scene.vue')),
  503: defineAsyncComponent(() => import('./unavailable-paper-scene.vue')),
}

const apple = useApple()
const theme = computed(() => apple.theme.value.current.scheme)
const motion = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced))
const paused = ref(false)
const scene = ref<{ replay(): void } | null>(null)

function replay() {
  scene.value?.replay()
  paused.value = false
}
</script>

<style scoped>
.error-scene { min-width: 0; }
.error-scene__controls { display: flex; justify-content: flex-end; gap: 2px; }
.error-scene__controls .apple-button { color: var(--apple-secondary); }
</style>

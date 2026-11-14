<template>
  <section ref="section" aria-labelledby="error-pages-heading">
    <header class="feed-group-heading"><h2 id="error-pages-heading">错误页面</h2></header>
    <div class="error-previews__grid">
      <apple-card v-for="(page, code) in errorPages" :key="code" class="error-preview">
        <template #title>
          <h3>
            <router-link :to="`/${code}`" class="error-preview__link">
              {{ code }} · {{ page.title }}
              <ArrowUpRight :size="16" aria-hidden="true" />
            </router-link>
          </h3>
        </template>
        <p class="error-preview__copy">{{ page.copy[0] }}<br />{{ page.copy[1] }}</p>
        <div class="error-preview__scene" :data-code="code">
          <component v-if="visibleScenes.has(String(code))" :is="scenes[code]" v-bind="sceneProps(code)" />
        </div>
      </apple-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import { errorPages } from '../error-pages'

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
const preferences = computed(() => ({
  theme: apple.theme.value.current.scheme,
  reducedMotion: resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) !== 'full',
}))
function sceneProps(code: keyof typeof errorPages) {
  return code === 400 || code === 429 || code === 503 ? preferences.value : {}
}

const section = ref<HTMLElement>()
const visibleScenes = ref(new Set<string>())
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    visibleScenes.value = new Set(Object.keys(errorPages))
    return
  }
  observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      visibleScenes.value.add(target.getAttribute('data-code')!)
      observer?.unobserve(target)
    }
  }, { rootMargin: '300px 0px' })
  section.value?.querySelectorAll('[data-code]').forEach(scene => observer?.observe(scene))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.error-previews__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
  gap: 20px;
}
.error-preview h3 { width: 100%; margin: 0; font-size: 16px; font-weight: 600; }
.error-preview__link { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: inherit; text-decoration: none; }
.error-preview__link svg { flex-shrink: 0; color: var(--apple-secondary); }
.error-preview__link:hover { color: var(--apple-accent); }
.error-preview__link::after { position: absolute; inset: 0; content: ''; }
.error-preview__link:focus-visible::after { outline: 2px solid var(--apple-accent); outline-offset: -4px; border-radius: 18px; }
.error-preview__copy { margin: 8px 0 12px; color: var(--apple-secondary); font-size: 13px; line-height: 1.7; }
.error-preview__scene { display: grid; padding-bottom: 18px; }
.error-preview__scene::before { grid-area: 1 / 1; aspect-ratio: 3 / 2; content: ''; }
.error-preview__scene :deep(figure) { grid-area: 1 / 1; align-self: start; position: relative; z-index: 1; pointer-events: none; }
.error-preview__scene :deep(button) { pointer-events: auto; }
</style>

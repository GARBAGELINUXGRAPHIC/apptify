<template>
  <div ref="previews">
    <MasonryFeed class="feed-cards" @layout="emit('layout')">
      <apple-card v-for="code in errorCodes" :id="errorPreviewId(code)" :key="code"
        class="component-card error-preview feed-anchor" data-group="error-pages"
        :aria-labelledby="`${errorPreviewId(code)}-heading`">
        <header class="component-card-heading">
          <div>
            <h3 :id="`${errorPreviewId(code)}-heading`">
              <router-link :to="`/${code}`" class="error-preview__link">
                {{ code }} · {{ errorPages[code].title }} <ArrowUpRight :size="14" aria-hidden="true" />
              </router-link>
            </h3>
            <p>{{ errorPages[code].copy[0] }}<br />{{ errorPages[code].copy[1] }}</p>
          </div>
        </header>
        <div class="error-preview__scene" :data-code="code">
          <ErrorScene v-if="visibleScenes.has(String(code))" :code="code" />
        </div>
        <ComponentDocumentLink class="error-preview__footer" :href="`/${code}`" label="查看完整页面" />
      </apple-card>
    </MasonryFeed>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { errorCodes, errorPages, errorPreviewId } from '../error-pages'
import ComponentDocumentLink from '../editor/ComponentDocumentLink.vue'
import ErrorScene from './ErrorScene.vue'
import MasonryFeed from './MasonryFeed.vue'

const emit = defineEmits<{ layout: [] }>()
const previews = ref<HTMLElement>()
const visibleScenes = ref(new Set<string>())
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    visibleScenes.value = new Set(errorCodes.map(String))
    return
  }
  observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      visibleScenes.value.add(target.getAttribute('data-code')!)
      observer?.unobserve(target)
    }
  }, { rootMargin: '300px 0px' })
  previews.value?.querySelectorAll('[data-code]').forEach(scene => observer?.observe(scene))
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.error-preview { padding: 0; }
.error-preview__link::after { position: absolute; inset: 0; z-index: 1; content: ''; }
.error-preview__link:focus-visible::after { outline: 2px solid var(--apple-accent); outline-offset: -4px; border-radius: inherit; }
.error-preview__scene { display: grid; grid-template-columns: minmax(0, 1fr); padding: 12px 24px 16px; }
.error-preview__scene::before { grid-area: 1 / 1; aspect-ratio: 5 / 3; content: ''; }
.error-preview__scene :deep(.error-scene) { grid-area: 1 / 1; align-self: start; }
.error-preview__scene :deep(.error-scene__controls) { position: relative; z-index: 2; width: fit-content; margin-left: auto; }
.error-preview__footer { position: relative; z-index: 2; }
@media (max-width: 520px) { .error-preview__scene { padding-inline: 16px; } }
</style>

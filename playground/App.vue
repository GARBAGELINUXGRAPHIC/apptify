<template>
  <apple-provider>
    <apple-navibar class="site-nav" :model-value="$route.path" :items="navigation" @click.capture="navigate">
      <template #brand>
        <router-link class="brand" to="/" aria-label="Apptify 首页"><span class="brand-symbol">a</span><span>Apptify</span></router-link>
      </template>
      <template #actions><UserMenu /></template>
    </apple-navibar>
    <router-view v-slot="{ Component, route }">
      <div ref="routePage" class="route-page">
        <component :is="Component" :key="route.path" />
      </div>
    </router-view>
  </apple-provider>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApple } from '../src'
import { animateEntrance } from '../src/core/motion'
import UserMenu from './components/UserMenu.vue'

const router = useRouter()
const route = useRoute()
const apple = useApple()
watch(() => [apple.theme.value.current.tokens.bg, apple.theme.value.current.scheme], ([background, scheme]) => {
  document.documentElement.style.setProperty('--app-page-bg', background)
  document.documentElement.style.colorScheme = scheme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
}, { immediate: true, flush: 'sync' })
const routePage = ref<HTMLElement>()
let entrances: Animation[] = []
let entranceFrame = 0

function cancelEntrance() {
  cancelAnimationFrame(entranceFrame)
  entrances.forEach(animation => animation.cancel())
  entrances = []
}
function queueEntrance() {
  cancelEntrance()
  // Let the router restore the scroll position before animating the page.
  // Animate the fixed sidebar itself so it shares the entrance without changing its containing block.
  entranceFrame = requestAnimationFrame(() => {
    const targets = [routePage.value?.querySelector<HTMLElement>('main'), routePage.value?.querySelector<HTMLElement>('.sidebar')]
    targets.forEach((element, index) => {
      if (!element) return
      const animation = animateEntrance(element, index === 1 ? 'x' : 'y')
      if (animation) entrances.push(animation)
    })
  })
}
watch(() => route.path, queueEntrance, { flush: 'post' })
watch(() => [apple.motion.value.mode, apple.motion.value.reduced], () => {
  if (apple.motion.value.reduced || ['none', 'reduced'].includes(apple.motion.value.mode)) cancelEntrance()
})
onMounted(queueEntrance)
onBeforeUnmount(cancelEntrance)
const navigation = [
  { label: '首页', value: '/', href: '/' },
  { label: '组件', value: '/components', href: '/components' },
  { label: '设置', value: '/settings', href: '/settings' },
]

function navigate(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.apple-navibar__item')
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  void router.push(link.getAttribute('href')!)
}
</script>

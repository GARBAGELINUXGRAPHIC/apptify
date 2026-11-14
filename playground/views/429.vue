<template>
  <main class="main-content paper-429-page">
    <apple-card class="paper-429-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-429-heading">
          <p class="paper-429-number" aria-hidden="true">429</p>
          <h1><span class="paper-429-sr-only">429 · </span>{{ page.title }}</h1>
        </div>
      </template>
      <p class="paper-429-copy">{{ page.copy[0] }}<br />{{ page.copy[1] }}</p>
      <div class="paper-429-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>
    <Hamster429Scene class="paper-429-illustration" :theme="scheme" :reduced-motion="reducedMotion" />
  </main>
</template>

<route lang="json">
{ "alias": "/error/429", "meta": { "title": "请求过于频繁" } }
</route>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import Hamster429Scene from '../components/hamster-429-scene.vue'

import { errorPages } from '../error-pages'

const page = errorPages[429]
const router = useRouter()
const apple = useApple()
const scheme = computed(() => apple.theme.value.current.scheme)
const reducedMotion = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) !== 'full')
function goBack() {
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-429-page { max-width:1360px; display:grid; grid-template-columns:minmax(260px,.78fr) minmax(0,1.65fr); align-content:center; align-items:center; column-gap:16px; padding-top:38px; padding-bottom:calc(38px + 64px); }
.paper-429-card { background:transparent; border:0; overflow:visible; }
.paper-429-card :deep(.apple-card__body) { padding:0 0 0 8px; }
.paper-429-card :deep(.apple-card__heading) { margin:0; }
.paper-429-heading { width:100%; }
.paper-429-number { color:var(--apple-text); font-family:Georgia,'Times New Roman',serif; font-size:clamp(78px,8.2vw,118px); line-height:.9; letter-spacing:-.075em; margin:0 0 28px; font-weight:429; }
.paper-429-heading h1 { font-size:clamp(26px,2.7vw,35px); line-height:1.35; letter-spacing:-.035em; font-weight:600; margin:0 0 17px; }
.paper-429-copy { font-size:13px; line-height:1.95; color:var(--apple-secondary); margin:0; text-wrap:pretty; }
.paper-429-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:27px; }
.paper-429-actions .apple-link { font-size:12px; padding-inline:8px; color:var(--apple-secondary); }
.paper-429-illustration { min-width:0; }
.paper-429-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media(max-width:880px) {
  .paper-429-page { grid-template-columns:minmax(0,1fr); max-width:680px; padding-top:18px; }
  .paper-429-illustration { grid-row:1; }
  .paper-429-card { margin-top:36px; }
  .paper-429-card :deep(.apple-card__body) { padding:0; text-align:center; }
  .paper-429-number { font-size:70px; margin-bottom:18px; }
  .paper-429-heading h1 { font-size:26px; margin-bottom:12px; }
  .paper-429-actions { justify-content:center; margin-top:18px; }
}
@media(max-width:420px) {
  .paper-429-page { padding-inline:18px; padding-top:12px; }
  .paper-429-copy { font-size:12px; }
  .paper-429-card { margin-top:30px; }
}
</style>

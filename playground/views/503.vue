<template>
  <main class="main-content paper-503-page">
    <apple-card class="paper-503-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-503-heading">
          <p class="paper-503-number" aria-hidden="true">503</p>
          <h1><span class="paper-503-sr-only">503 · </span>{{ page.title }}</h1>
        </div>
      </template>
      <p class="paper-503-copy">{{ page.copy[0] }}<br />{{ page.copy[1] }}</p>
      <div class="paper-503-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>
    <ErrorScene class="paper-503-illustration" :code="503" />
  </main>
</template>

<route lang="json">
{ "alias": "/error/503", "meta": { "title": "服务暂时不可用" } }
</route>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ErrorScene from '../components/ErrorScene.vue'

import { errorPages } from '../error-pages'

const page = errorPages[503]
const router = useRouter()

function goBack() {
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-503-page { max-width: 1360px; display: grid; grid-template-columns: minmax(260px, .78fr) minmax(0, 1.65fr); align-content: center; align-items: center; column-gap: 16px; padding-top: 38px; padding-bottom: calc(38px + 64px); }
.paper-503-card { background: transparent; border: 0; overflow: visible; }
.paper-503-card :deep(.apple-card__body) { padding: 0 0 0 8px; }
.paper-503-card :deep(.apple-card__heading) { margin: 0; }
.paper-503-heading { width: 100%; }
.paper-503-number { color: var(--apple-text); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(78px, 8.2vw, 118px); line-height: .9; letter-spacing: -.075em; margin: 0 0 28px; font-weight: 400; }
.paper-503-heading h1 { font-size: clamp(26px, 2.7vw, 35px); line-height: 1.35; letter-spacing: -.035em; font-weight: 600; margin: 0 0 17px; }
.paper-503-copy { font-size: 13px; line-height: 1.95; color: var(--apple-secondary); margin: 0; text-wrap: pretty; }
.paper-503-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 27px; }
.paper-503-actions .apple-link { font-size: 12px; padding-inline: 8px; color: var(--apple-secondary); }
.paper-503-illustration { min-width: 0; }
.paper-503-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 880px) {
  .paper-503-page { grid-template-columns: minmax(0, 1fr); max-width: 680px; padding-top: 18px; }
  .paper-503-illustration { grid-row: 1; }
  .paper-503-card { margin-top: 26px; }
  .paper-503-card :deep(.apple-card__body) { padding: 0; text-align: center; }
  .paper-503-number { font-size: 70px; margin-bottom: 18px; }
  .paper-503-heading h1 { font-size: 26px; margin-bottom: 12px; }
  .paper-503-actions { justify-content: center; margin-top: 18px; }
}
@media (max-width: 420px) {
  .paper-503-page { padding-inline: 18px; padding-top: 12px; }
  .paper-503-copy { font-size: 12px; }
  .paper-503-card { margin-top: 22px; }
}
</style>

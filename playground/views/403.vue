<template>
  <main class="main-content paper-403-page">
    <apple-card class="paper-403-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-403-heading">
          <p class="paper-403-number" aria-hidden="true">403</p>
          <h1>无权访问</h1>
        </div>
      </template>
      <p class="paper-403-copy">这只鸡腿，可不能随便拿。<br />你暂时没有访问此页面的权限。</p>
      <div class="paper-403-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>
    <ForbiddenPaperScene class="paper-403-illustration" />
  </main>
</template>

<route lang="json">
{ "alias": "/error/403", "meta": { "title": "无权访问" } }
</route>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ForbiddenPaperScene from '../components/forbidden-paper-scene.vue'

const router = useRouter()
function goBack() {
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-403-page { max-width: 1360px; display: grid; grid-template-columns: minmax(260px, .78fr) minmax(0, 1.65fr); align-content: center; align-items: center; column-gap: 16px; padding-top: 38px; padding-bottom: calc(38px + 64px); }
.paper-403-card { background: transparent; border: 0; overflow: visible; }
.paper-403-card :deep(.apple-card__body) { padding: 0 0 0 8px; }
.paper-403-card :deep(.apple-card__heading) { margin: 0; }
.paper-403-heading { width: 100%; }
.paper-403-number { color: var(--apple-text); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(78px, 8.2vw, 118px); line-height: .9; letter-spacing: -.075em; margin: 0 0 28px; font-weight: 400; }
.paper-403-heading h1 { font-size: clamp(26px, 2.7vw, 35px); line-height: 1.35; letter-spacing: -.035em; font-weight: 600; margin: 0 0 17px; }
.paper-403-copy { font-size: 13px; line-height: 1.95; color: var(--apple-secondary); margin: 0; text-wrap: pretty; }
.paper-403-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 27px; }
.paper-403-actions .apple-link { font-size: 12px; padding-inline: 8px; color: var(--apple-secondary); }
.paper-403-illustration { min-width: 0; }
@media (max-width: 880px) {
  .paper-403-page { grid-template-columns: minmax(0, 1fr); max-width: 680px; padding-top: 18px; }
  .paper-403-illustration { grid-row: 1; }
  .paper-403-card { margin-top: 26px; }
  .paper-403-card :deep(.apple-card__body) { padding: 0; text-align: center; }
  .paper-403-number { font-size: 70px; margin-bottom: 18px; }
  .paper-403-heading h1 { font-size: 26px; margin-bottom: 12px; }
  .paper-403-actions { justify-content: center; margin-top: 18px; }
}
@media (max-width: 420px) {
  .paper-403-page { padding-inline: 18px; padding-top: 12px; }
  .paper-403-copy { font-size: 12px; }
  .paper-403-card { margin-top: 22px; }
}
</style>

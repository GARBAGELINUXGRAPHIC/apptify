<template>
  <main class="main-content not-found-page paper-404-page">
    <apple-card class="paper-404-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-404-heading">
          <p class="paper-404-number" aria-hidden="true">404</p>
          <h1>页面不存在</h1>
        </div>
      </template>
      <p class="paper-404-copy">有些东西，悄悄溜走了。<br />就像松鼠的橡果，这一页也不知漂去了哪里。</p>
      <div class="paper-404-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>
    <NotFoundPaperScene class="paper-404-illustration" />
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import NotFoundPaperScene from '../components/not-found-paper-scene.vue'

const router = useRouter()
function goBack() {
  // A direct visit has no in-app predecessor; keep its escape route useful.
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-404-page { max-width: 1360px; display: grid; grid-template-columns: minmax(260px, .78fr) minmax(0, 1.65fr); align-content: center; align-items: center; column-gap: 16px; padding-top: 38px; padding-bottom: calc(38px + 64px); }
.paper-404-card { background: transparent; border: 0; overflow: visible; }
.paper-404-card :deep(.apple-card__body) { padding: 0 0 0 8px; }
.paper-404-card :deep(.apple-card__heading) { margin: 0; }
.paper-404-heading { width: 100%; }
.paper-404-kicker { color: var(--apple-secondary); font-size: 10px; letter-spacing: .1em; margin: 0 0 40px; }
.paper-404-number { display: flex; align-items: center; gap: 18px; color: var(--apple-text); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(78px, 8.2vw, 118px); line-height: .9; letter-spacing: -.075em; margin: 0 0 28px; font-weight: 400; }
.paper-404-number span { writing-mode: vertical-rl; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 10px; letter-spacing: .22em; color: var(--apple-secondary); padding-top: 8px; }
.paper-404-heading h1 { font-size: clamp(26px, 2.7vw, 35px); line-height: 1.35; letter-spacing: -.035em; font-weight: 600; margin: 0 0 17px; }
.paper-404-copy { font-size: 13px; line-height: 1.95; color: var(--apple-secondary); margin: 0; text-wrap: pretty; }
.paper-404-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 27px; }
.paper-404-actions .apple-link { font-size: 12px; padding-inline: 8px; color: var(--apple-secondary); }
.paper-404-illustration { min-width: 0; }
.paper-404-footnote { grid-column: 1 / -1; text-align: center; font-size: 10px; letter-spacing: .09em; color: var(--apple-secondary); margin: 48px 0 0; }
@media (max-width: 880px) {
  .paper-404-page { grid-template-columns: minmax(0, 1fr); max-width: 680px; padding-top: 18px; }
  .paper-404-illustration { grid-row: 1; }
  .paper-404-card { margin-top: 26px; }
  .paper-404-card :deep(.apple-card__body) { padding: 0; text-align: center; }
  .paper-404-kicker { display: none; }
  .paper-404-number { justify-content: center; font-size: 70px; margin-bottom: 18px; }
  .paper-404-number span { font-size: 9px; }
  .paper-404-heading h1 { font-size: 26px; margin-bottom: 12px; }
  .paper-404-actions { justify-content: center; margin-top: 18px; }
  .paper-404-footnote { margin-top: 32px; }
}
@media (max-width: 420px) {
  .paper-404-page { padding-inline: 18px; padding-top: 12px; }
  .paper-404-copy { font-size: 12px; }
  .paper-404-card { margin-top: 22px; }
}
</style>

<template>
  <main class="main-content paper-400-page">
    <apple-card class="paper-400-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-400-heading">
          <p class="paper-400-number" aria-hidden="true">400</p>
          <h1><span class="paper-400-sr-only">400 · </span>{{ page.title }}</h1>
        </div>
      </template>
      <p class="paper-400-copy">{{ page.copy[0] }}<br />{{ page.copy[1] }}</p>
      <div class="paper-400-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>
    <ErrorScene class="paper-400-illustration" :code="400" />
  </main>
</template>

<route lang="json">
{ "alias": "/error/400", "meta": { "title": "请求有误" } }
</route>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ErrorScene from '../components/ErrorScene.vue'

import { errorPages } from '../error-pages'

const page = errorPages[400]
const router = useRouter()
function goBack() {
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-400-page { max-width:1360px; display:grid; grid-template-columns:minmax(260px,.78fr) minmax(0,1.65fr); align-content:center; align-items:center; column-gap:16px; padding-top:38px; padding-bottom:calc(38px + 64px); }
.paper-400-card { background:transparent; border:0; overflow:visible; }
.paper-400-card :deep(.apple-card__body) { padding:0 0 0 8px; }
.paper-400-card :deep(.apple-card__heading) { margin:0; }
.paper-400-heading { width:100%; }
.paper-400-number { color:var(--apple-text); font-family:Georgia,'Times New Roman',serif; font-size:clamp(78px,8.2vw,118px); line-height:.9; letter-spacing:-.075em; margin:0 0 28px; font-weight:400; }
.paper-400-heading h1 { font-size:clamp(26px,2.7vw,35px); line-height:1.35; letter-spacing:-.035em; font-weight:600; margin:0 0 17px; }
.paper-400-copy { font-size:13px; line-height:1.95; color:var(--apple-secondary); margin:0; text-wrap:pretty; }
.paper-400-actions { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:27px; }
.paper-400-actions .apple-link { font-size:12px; padding-inline:8px; color:var(--apple-secondary); }
.paper-400-illustration { min-width:0; }
.paper-400-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media(max-width:880px) {
  .paper-400-page { grid-template-columns:minmax(0,1fr); max-width:680px; padding-top:18px; }
  .paper-400-illustration { grid-row:1; }
  .paper-400-card { margin-top:36px; }
  .paper-400-card :deep(.apple-card__body) { padding:0; text-align:center; }
  .paper-400-number { font-size:70px; margin-bottom:18px; }
  .paper-400-heading h1 { font-size:26px; margin-bottom:12px; }
  .paper-400-actions { justify-content:center; margin-top:18px; }
}
@media(max-width:420px) {
  .paper-400-page { padding-inline:18px; padding-top:12px; }
  .paper-400-copy { font-size:12px; }
  .paper-400-card { margin-top:30px; }
}
</style>

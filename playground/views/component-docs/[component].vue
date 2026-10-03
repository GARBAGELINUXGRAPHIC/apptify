<template>
  <main class="documentation-page">
    <template v-if="registration">
      <apple-breadcrumbs :items="breadcrumbs" label="组件文档路径" @click="navigateBreadcrumb" />
      <header class="documentation-heading"><div><span class="page-kicker">{{ registration.group }} / COMPONENT API</span><h1>{{ registration.label }}<span>{{ registration.name }}</span></h1><p>{{ registration.description }}</p></div></header>
      <div class="documentation-layout">
        <aside class="documentation-index" aria-label="API 导航"><span>本页接口</span><apple-tree v-model="selectedApi" v-model:expanded="expandedSections" :items="apiTree" label="组件 API 树" @select="navigateApi" /></aside>
        <div class="documentation-content">
          <apple-card title="组件演示" subtitle="在下面的 API 中展开示例，调整代码并立即查看效果。" class="component-overview"><component :is="registration.preview" v-if="registration.preview" /></apple-card>
          <ComponentWorkshop v-if="doc" :doc="doc" />
          <apple-alert v-else-if="failed" tone="danger" title="文档加载失败"><apple-button variant="secondary" @click="loadDocument">重试</apple-button></apple-alert>
          <apple-spinner v-else label="正在加载组件 API" />
        </div>
      </div>
    </template>
    <apple-empty v-else title="组件文档尚未开放" description="当前阶段仅开放 AppleInput 样板。"><router-link to="/components" custom v-slot="{ href, navigate }"><apple-link :href="href" @click="navigate">返回组件目录</apple-link></router-link></apple-empty>
    <PageFooter />
  </main>
</template>
<script setup lang="ts">
import { computed, shallowRef, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppleItem, AppleTreeItem, AppleValue } from '../../../src'
import { componentDocuments } from '../../editor/documents'
import type { ComponentDocument } from '../../editor/contract'
import { documentSections } from '../../editor/sections'
import ComponentWorkshop from '../../editor/ComponentWorkshop.vue'
import PageFooter from '../../components/PageFooter.vue'
const route = useRoute()
const router = useRouter()
const breadcrumbs = computed(() => [
  { label: '组件', value: 'components', href: '/components' },
  { label: registration.value?.group || '组件', value: 'group', href: `/components#${String(route.params.component)}` },
  { label: registration.value?.label || '', value: 'current' },
])
function navigateBreadcrumb(item: AppleItem, event: MouseEvent) {
  if (!item.href || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  void router.push(item.href)
}
const registration = computed(() => componentDocuments[String(route.params.component)])
const doc = shallowRef<ComponentDocument>()
const failed = ref(false)
let loadVersion = 0
async function loadDocument() {
  const version = ++loadVersion
  doc.value = undefined; failed.value = false
  const current = registration.value
  if (!current) return
  try { const result = await current.load(); if (version === loadVersion) doc.value = result.default }
  catch { if (version === loadVersion) failed.value = true }
}
watch(registration, loadDocument, { immediate: true })
onBeforeUnmount(() => { loadVersion++ })
const selectedApi = ref<AppleValue>('props')
const expandedSections = ref<AppleValue[]>(['props', 'events', 'slots', 'methods'])
const apiTree = computed<AppleTreeItem[]>(() => doc.value ? [
  ...documentSections(doc.value).map(section => ({
    value: section.id, label: section.title,
    children: section.entries.map(entry => ({ value: entry.id, label: entry.name })),
  })),
  ...(doc.value.notes.length ? [{ value: 'accessibility', label: '交互与无障碍' }] : []),
] : [])
watch(() => [route.hash, doc.value] as const, () => {
  const id = route.hash.slice(1)
  const group = apiTree.value.find(item => item.children?.some(child => child.value === id))
  if (!group && !apiTree.value.some(item => item.value === id)) return
  selectedApi.value = id
  if (group && !expandedSections.value.includes(group.value)) expandedSections.value.push(group.value)
}, { immediate: true })
async function navigateApi(item: AppleTreeItem) {
  const id = String(item.value)
  await router.replace({ hash: `#${id}` })
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}

</script>
<style scoped>
.documentation-page { max-width: 1440px; margin: 0 auto; padding: 40px; }
.documentation-page > :deep(.apple-link) { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
.documentation-heading { margin: 36px 0 42px; }
.documentation-heading h1 { margin: 12px 0; font-size: clamp(32px, 4vw, 48px); letter-spacing: -.04em; }
.documentation-heading h1 span { display: inline-block; margin-left: 18px; color: var(--apple-secondary); font-weight: 400; font-size: 24px; letter-spacing: -.02em; }
.documentation-heading p { color: var(--apple-secondary); font-size: 15px; line-height: 1.7; }
.documentation-layout { display: grid; grid-template-columns: 224px minmax(0, 1fr); gap: 32px; align-items: start; }
.documentation-index { position: sticky; top: 100px; max-height: calc(100dvh - 120px); overflow: auto; padding-top: 16px; font-size: 13px; }
.documentation-index > span { color: var(--apple-secondary); font-size: 12px; display: block; margin: 0 0 12px 8px; }
.documentation-index :deep(.apple-tree__row) { min-height: 34px; }
.documentation-index :deep(.apple-tree__row > span:last-child) { min-width: 0; overflow-wrap: anywhere; }
.documentation-content { min-width: 0; }
.component-overview { margin-bottom: 32px;  }
@media (max-width: 900px) { .documentation-layout { grid-template-columns: minmax(0, 1fr); gap: 20px; } .documentation-index { position: static; max-height: 280px; padding-top: 0; } .documentation-index > span { display: none; } }
@media (max-width: 720px) { .documentation-page { padding: 40px; } .documentation-heading { margin: 24px 0; } .documentation-heading h1 span { display: block; margin: 8px 0 0; font-size: 20px; } }
</style>

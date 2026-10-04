<template>
  <apple-container style="padding-top: 12px; padding-bottom: 24px">
    <template v-if="registration">
      <apple-breadcrumbs :items="breadcrumbs" label="组件文档路径" @click="navigateBreadcrumb" />
      <header class="documentation-heading"><div><span class="page-kicker">{{ registration.group }} / COMPONENT API</span><h1>{{ registration.label }}<span>{{ registration.name }}</span></h1><p>{{ registration.description }}</p></div></header>
      <div class="documentation-layout directory-layout">
        <aside ref="documentationIndex" class="documentation-index directory-index" aria-label="API 导航"><span>本页接口</span><apple-tree v-model="selectedApi" v-model:expanded="expandedSections" :items="apiTree" label="组件 API 树" @select="navigateApi" /></aside>
        <div ref="documentationContent" class="documentation-content">
          <section class="component-overview" aria-label="组件演示"><component :is="registration.preview" v-if="registration.preview" /></section>
          <ComponentWorkshop v-if="doc" :doc="doc" />
          <apple-alert v-else-if="failed" tone="danger" title="文档加载失败"><apple-button variant="secondary" @click="loadDocument">重试</apple-button></apple-alert>
          <apple-spinner v-else label="正在加载组件 API" />
        </div>
      </div>
    </template>
    <apple-empty v-else title="组件文档尚未开放" description="当前阶段仅开放 AppleInput 样板。"><router-link to="/components" custom v-slot="{ href, navigate }"><apple-link :href="href" @click="navigate">返回组件目录</apple-link></router-link></apple-empty>
  </apple-container>
  <DirectoryDialog v-if="registration" v-model="mobileIndex" title="本页接口">
    <apple-tree v-model="selectedApi" v-model:expanded="expandedSections" :items="apiTree" label="组件 API 树" @select="navigateApi" />
  </DirectoryDialog>
</template>
<script setup lang="ts">
import { computed, shallowRef, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AppleItem, AppleTreeItem, AppleValue } from '../../../src'
import { componentDocuments } from '../../editor/documents'
import type { ComponentDocument } from '../../editor/contract'
import { documentSections } from '../../editor/sections'
import ComponentWorkshop from '../../editor/ComponentWorkshop.vue'
import DirectoryDialog from '../../components/DirectoryDialog.vue'
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
const documentationIndex = ref<HTMLElement>()
const documentationContent = ref<HTMLElement>()
const mobileIndex = ref(false)
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
  selectApi(id)
}, { immediate: true })
function selectApi(id: AppleValue) {
  selectedApi.value = id
}

let scrollFrame = 0
let contentObserver: ResizeObserver | undefined
let indexObserver: ResizeObserver | undefined
function syncScrollSelection() {
  scrollFrame = 0
  const content = documentationContent.value
  if (!content) return
  const targets = apiTree.value.flatMap(section => [section, ...(section.children || [])])
    .map(item => ({ id: item.value, element: document.getElementById(String(item.value)) }))
    .filter(target => target.element && content.contains(target.element))
  if (!targets.length) return
  let active = targets[0].id
  for (const target of targets) {
    const offset = Math.max(100, parseFloat(getComputedStyle(target.element!).scrollMarginTop) || 0)
    if (target.element!.getBoundingClientRect().top > offset + 1) break
    active = target.id
  }
  // The final section may be too short to reach the reading line above the footer.
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    active = targets[targets.length - 1].id
  }
  selectApi(active)
}
function queueScrollSelection() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScrollSelection)
}
function revealSelection() {
  const index = documentationIndex.value
  const row = index?.querySelector<HTMLElement>('.apple-tree__row.is-selected')
  if (!index || !row) return
  const bounds = index.getBoundingClientRect(), selected = row.getBoundingClientRect()
  if (selected.top < bounds.top) index.scrollTop += selected.top - bounds.top
  else if (selected.bottom > bounds.bottom) index.scrollTop += selected.bottom - bounds.bottom
}
watch([selectedApi, expandedSections], async () => {
  await nextTick()
  revealSelection()
}, { deep: true })
watch(doc, async () => {
  await nextTick()
  contentObserver?.disconnect()
  if (documentationContent.value) contentObserver?.observe(documentationContent.value)
  queueScrollSelection()
}, { flush: 'post' })
onMounted(() => {
  window.addEventListener('scroll', queueScrollSelection, { passive: true })
  window.addEventListener('resize', queueScrollSelection)
  contentObserver = new ResizeObserver(queueScrollSelection)
  if (documentationContent.value) contentObserver.observe(documentationContent.value)
  indexObserver = new ResizeObserver(revealSelection)
  const tree = documentationIndex.value?.querySelector<HTMLElement>('.apple-tree-size')
  if (tree) indexObserver.observe(tree)
  queueScrollSelection()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', queueScrollSelection)
  window.removeEventListener('resize', queueScrollSelection)
  contentObserver?.disconnect()
  indexObserver?.disconnect()
  cancelAnimationFrame(scrollFrame)
})

async function navigateApi(item: AppleTreeItem) {
  if (item.children?.length) return
  mobileIndex.value = false
  const id = String(item.value)
  await nextTick()
  await router.replace({ hash: `#${id}` })
  await nextTick()
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}

</script>
<style scoped>
.documentation-page { max-width: 1440px; margin: 0 auto; padding: 40px; }
.documentation-page > :deep(.apple-link) { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; }
.documentation-heading { margin: 12px 0 36px 0; }
.documentation-heading h1 { margin: 12px 0; font-size: clamp(32px, 4vw, 48px); letter-spacing: -.04em; }
.documentation-heading h1 span { display: inline-block; margin-left: 18px; color: var(--apple-secondary); font-weight: 400; font-size: 24px; letter-spacing: -.02em; }
.documentation-heading p { color: var(--apple-secondary); font-size: 15px; line-height: 1.7; }
.documentation-content { min-width: 0; }
.component-overview { margin-bottom: 32px;  }
@media (max-width: 720px) { .documentation-page { padding: 40px; } .documentation-heading { margin: 24px 0; } .documentation-heading h1 span { display: block; margin: 8px 0 0; font-size: 20px; } }
</style>

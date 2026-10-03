<template>
  <apple-aside class="sidebar" aria-label="组件目录">
    <div class="sidebar-heading"><strong>组件目录</strong><span>点击定位，直接预览</span></div>
    <div class="directory-search"><apple-search v-model="directorySearch" label="搜索组件目录" placeholder="名称、标签或描述" /></div>
    <ComponentIndex :active-group="activeGroup" :active-id="activeId" :search="directorySearch" />
  </apple-aside>
  <main class="main-content components-page">
    <header class="page-heading"><div><div class="page-kicker">COMPONENTS</div><h1>组件<span>。</span></h1><p>{{ catalog.length }} 个组件，完整呈现。向下浏览，直接体验。</p></div></header>
    <div class="feed-toolbar">
      <apple-button class="mobile-index-toggle" variant="ghost" size="small" :icon="PanelLeft" @click="mobileIndex = true">组件目录</apple-button>
      <span class="feed-count">全部组件 <small>{{ catalog.length }}</small></span>
      <div class="preview-controls" role="group" aria-label="预览尺寸">
        <apple-button variant="ghost" size="small" icon-only :icon="Monitor" :class="{ active: previewMode === 'desktop' }" :aria-pressed="previewMode === 'desktop'" label="桌面预览" @click="previewMode = 'desktop'" />
        <apple-button variant="ghost" size="small" icon-only :icon="Smartphone" :class="{ active: previewMode === 'mobile' }" :aria-pressed="previewMode === 'mobile'" label="手机预览" @click="previewMode = 'mobile'" />
      </div>
    </div>
    <div ref="feed" class="component-feed">
      <section v-for="(section, index) in sections" :id="section.id" :key="section.id" class="feed-group feed-anchor" :data-group="section.id" :aria-labelledby="`${section.id}-heading`">
        <header class="feed-group-heading"><span>0{{ index + 1 }}</span><h2 :id="`${section.id}-heading`">{{ section.label }}</h2><small>{{ section.items.length }} 个组件</small></header>
        <apple-card v-for="item in section.items" :id="componentId(item.name)" :key="item.name" class="component-card feed-anchor" :data-group="section.id" :aria-labelledby="`${componentId(item.name)}-heading`">
          <header class="component-card-heading"><div><h3 :id="`${componentId(item.name)}-heading`"><router-link :to="`#${componentId(item.name)}`">{{ item.label }}<Hash :size="14" /></router-link></h3><p>{{ item.description }}</p></div><code>{{ componentId(item.name) }}</code></header>
          <section class="detail-preview" :class="{ 'mobile-preview': previewMode === 'mobile' }" :aria-label="`${item.label}预览`"><ComponentDemo :name="item.name" @navigate="navigateGroup" /></section>
          <ComponentDocumentLink v-if="documentPaths[item.name]" :href="documentPaths[item.name]" label="代码与 API" />
          <apple-accordion v-else class="component-source" :items="sourceSections">
            <template #item>
              <div class="code-view"><div class="code-toolbar"><span>使用示例</span><apple-button variant="ghost" size="small" @click="copy(item.code)">复制代码</apple-button></div><pre><code>{{ item.code }}</code></pre><h4>接口</h4><p class="api-line">{{ item.api }}</p></div>
            </template>
          </apple-accordion>
        </apple-card>
      </section>
    </div>
    <PageFooter />
  </main>
  <apple-drawer v-model="mobileIndex" title="组件目录" placement="left" width="290px">
    <div class="directory-search"><apple-search v-model="directorySearch" label="搜索组件目录" placeholder="名称、标签或描述" /></div>
    <ComponentIndex :active-group="activeGroup" :active-id="activeId" :search="directorySearch" @navigate="mobileIndex = false" />
  </apple-drawer>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Hash, Monitor, PanelLeft, Smartphone } from 'lucide-vue-next'
import { useApple } from '../../src'
import { catalog, sections, componentId } from '../catalog'
import ComponentDemo from '../ComponentDemo.vue'
import ComponentIndex from '../components/ComponentIndex.vue'
import PageFooter from '../components/PageFooter.vue'
import ComponentDocumentLink from '../editor/ComponentDocumentLink.vue'
import { componentDocuments, componentDocumentPath } from '../editor/documents'

const documentPaths = Object.fromEntries(Object.entries(componentDocuments).map(([slug, document]) => [document.name, componentDocumentPath(slug)]))
const route = useRoute()
const router = useRouter()
const apple = useApple()
const feed = ref<HTMLElement>()
const activeGroup = ref(sections[0].id)
const activeId = ref('')
const previewMode = ref('desktop')
const mobileIndex = ref(false)
const directorySearch = ref('')
const sourceSections = [{ label: '代码与 API', value: 'source' }]
let anchors: HTMLElement[] = []
let frame = 0
let observer: ResizeObserver | undefined

function updatePosition() {
  frame = 0
  let current: HTMLElement | undefined
  for (const anchor of anchors) {
    if (anchor.getBoundingClientRect().top > 128) break
    if (!current || Math.abs(anchor.getBoundingClientRect().top - current.getBoundingClientRect().top) > 1) current = anchor
    else if (anchor.id === route.hash.slice(1) || (current.id !== route.hash.slice(1) && anchor.id === activeId.value)) current = anchor
  }
  activeId.value = current?.id ?? ''
  activeGroup.value = current?.dataset.group ?? sections[0].id
}
function schedulePosition() {
  if (!frame) frame = requestAnimationFrame(updatePosition)
}
function navigateGroup(label: string) {
  const section = sections.find(section => section.label === label)
  void router.push(section ? `/components#${section.id}` : '/components')
}
async function copy(value: string) {
  try { await navigator.clipboard.writeText(value); apple.notify('已复制', { tone: 'success' }) }
  catch { apple.notify('无法访问剪贴板，请手动选择代码复制', { tone: 'warning' }) }
}
watch(() => route.hash, () => { mobileIndex.value = false; schedulePosition() })
watch(activeId, async () => {
  await nextTick()
  const sidebar = document.querySelector<HTMLElement>('.sidebar')
  const current = sidebar?.querySelector<HTMLElement>('[aria-current="location"]')
  if (!sidebar || !current) return
  const item = current.getBoundingClientRect(), bounds = sidebar.getBoundingClientRect()
  if (item.top < bounds.top + 16) sidebar.scrollTop -= bounds.top + 16 - item.top
  else if (item.bottom > bounds.bottom - 16) sidebar.scrollTop += item.bottom - bounds.bottom + 16
})
onMounted(() => {
  anchors = Array.from(feed.value!.querySelectorAll<HTMLElement>('.feed-anchor'))
  window.addEventListener('scroll', schedulePosition, { passive: true })
  window.addEventListener('resize', schedulePosition)
  observer = new ResizeObserver(schedulePosition)
  observer.observe(feed.value!)
  schedulePosition()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedulePosition)
  window.removeEventListener('resize', schedulePosition)
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
.directory-search { min-width: 0; margin: 0 4px 16px; }
.directory-search :deep(.apple-field__label) { font-size: 11px; }
.directory-search :deep(input) { min-width: 0; font-size: 12px; }
.components-page > * { max-width: none; }
.feed-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: 20px; align-items: start; }
.feed-group-heading { grid-column: 1 / -1; padding-bottom: 0; }
.component-card { margin-bottom: 0; padding: 0; }
.component-card :deep(> .apple-card__body) { padding: 0; border-radius: inherit; }
.component-card :deep(> .apple-card__body > .documentation-entry),
.component-card :deep(> .apple-card__body > .component-source) { border-radius: 0 0 18px 18px; overflow: hidden; }
.component-source :deep(.apple-accordion__item) { border: 0; }
.component-source :deep(.apple-accordion__item > h3) { font-size: 11px; font-weight: 400; }
.component-source :deep(.apple-accordion__item > h3 > button) { min-height: 44px; gap: 8px; padding: 13px 28px; color: var(--apple-secondary); }
.component-source :deep(.apple-accordion__content) { padding: 0; }
@media (max-width: 800px) {
  .component-source :deep(.apple-accordion__item > h3 > button) { padding-inline: 18px; }
}
</style>

<template>
  <div class="workshop" data-testid="component-document">
    <div class="api-document">
      <section v-for="section in apiSections" :key="section.id" :id="section.id" class="api-section">
        <header class="section-heading"><div><span class="section-kicker">{{ section.kicker }}</span><h2>{{ section.title }}</h2></div><span class="section-count">{{ section.entries.length }} 项接口</span></header>
        <apple-card v-for="entry in section.entries" :key="entry.id" :id="entry.id" class="api-entry" :data-api="entry.id">
          <div class="api-summary">
          <header class="api-heading"><h3><code>{{ entry.name }}</code></h3><span v-if="entry.default !== undefined" class="api-default">默认 <code>{{ entry.default }}</code></span></header>
          <code class="api-type">{{ entry.type }}</code>
          <p class="api-description">{{ entry.description }}</p>
          </div>
          <apple-accordion v-if="entry.example" class="api-accordion" :model-value="activeApi === entry.id ? entry.id : []" :items="[{ label: '交互示例', value: entry.id }]" @update:model-value="value => toggleExample(entry.id, value)">
            <template #item="{ open }">
              <div v-if="open && activeApi === entry.id" class="api-example">
                <div class="example-introduction"><span class="example-eyebrow">TRY IT</span><h4>{{ entry.example.title }}</h4><p>{{ entry.example.description }}</p></div>
                <LiveVueEditor :key="entry.id" :files="apiFiles(entry)" :baseline-files="{ 'App.vue': entry.example.code }" active-file="App.vue" @save="files => saveApi(entry.id, files)" />
              </div>
            </template>
          </apple-accordion>
        </apple-card>
      </section>
      <section id="accessibility" class="api-section">
        <header class="section-heading"><div><span class="section-kicker">GUIDELINES</span><h2>交互与无障碍</h2></div></header>
        <apple-card><ul class="api-notes"><li v-for="note in doc.notes" :key="note">{{ note }}</li></ul></apple-card>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import type { ApiEntry, ComponentDocument } from './contract'
import { documentSections } from './sections'
const props = defineProps<{ doc: ComponentDocument }>()
// Document pages do not download the compiler/editor until a library example opens.
const LiveVueEditor = defineAsyncComponent(() => import('./LiveVueEditor.vue'))
const activeApi = ref<string>()
const apiDrafts = new Map<string, Record<string, string>>()
const apiSections = computed(() => documentSections(props.doc))
function toggleExample(id: string, value: unknown) { activeApi.value = value === id ? id : undefined }
function apiFiles(entry: ApiEntry) { return apiDrafts.get(entry.id) || { 'App.vue': entry.example!.code } }
function saveApi(id: string, files: Record<string, string>) { apiDrafts.set(id, files) }
</script>
<style scoped>
.workshop { min-width: 0; }
.api-document { line-height: 1.7; }
.api-section { scroll-margin-top: 100px; margin-top: 44px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 18px; }
.section-kicker, .example-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .12em; color: var(--apple-secondary); }
.section-heading h2 { margin: 4px 0 0; font-size: 24px; }
.section-count { color: var(--apple-secondary); font-size: 13px; }
.api-entry { scroll-margin-top: 90px; margin: 16px 0; padding: 0; }
.api-entry :deep(> .apple-card__body) { padding: 0; border-radius: inherit; }
.api-accordion { border-radius: 0 0 18px 18px; overflow: hidden; }
.api-summary { padding: 24px; }
.api-heading { display: flex; align-items: baseline; flex-wrap: wrap; justify-content: space-between; gap: 8px; }
.api-heading h3 { margin: 0 0 6px; font-size: 17px; }
.api-type { color: var(--apple-secondary); font-size: 13px; overflow-wrap: anywhere; }
.api-default { font-size: 12px; color: var(--apple-secondary); }
.api-description { margin: 14px 0 0; font-size: 14px; }
.api-accordion { margin: 0; }
.api-accordion :deep(.apple-accordion__item) { border-bottom: 0; }
.api-accordion :deep(.apple-accordion__item > h3) { margin: 0; }
.api-accordion :deep(.apple-accordion__item > h3 > button) { padding: 16px 24px; font-size: 13px; }
.api-accordion :deep(.apple-accordion__content) { padding: 0 24px 24px; }
.example-introduction { padding: 16px 0 8px; }
.example-introduction h4 { margin: 4px 0 6px; font-size: 17px; }
.example-introduction p { margin: 0; color: var(--apple-secondary); font-size: 13px; }
.api-notes { padding-left: 20px; margin: 0; font-size: 14px; }
.api-notes li + li { margin-top: 16px; }
@media (max-width: 720px) {
  .api-summary { padding: 18px; }
  .api-accordion :deep(.apple-accordion__content) { padding: 0 14px 18px; }
  .section-heading h2 { font-size: 21px; }
}
</style>

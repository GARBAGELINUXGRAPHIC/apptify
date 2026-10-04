<template>
  <div class="workshop" data-testid="component-document">
    <section v-for="section in apiSections" :key="section.id" :id="section.id" class="api-section">
      <header class="section-heading"><h2>{{ section.title }}</h2><span>{{ section.entries.length }} 项接口</span></header>
      <div class="api-group">
        <article v-for="entry in section.entries" :key="entry.id" :id="entry.id" class="api-entry" :data-api="entry.id">
          <div class="api-summary">
            <div class="api-signature">
              <h3><code>{{ entry.name }}</code></h3>
              <code class="api-type">{{ entry.type }}</code>
              <div v-if="entry.default !== undefined" class="api-default"><span>默认值</span><code>{{ entry.default }}</code></div>
            </div>
            <p class="api-description">{{ entry.description }}</p>
          </div>
          <apple-accordion v-if="entry.example" class="api-accordion" :model-value="activeApi === entry.id ? entry.id : []" :items="[{ label: '交互示例', value: entry.id }]" @update:model-value="value => toggleExample(entry.id, value)">
            <template #item="{ open }">
              <div v-if="open && activeApi === entry.id" class="api-example">
                <div class="example-introduction"><h4>{{ entry.example.title }}</h4><p>{{ entry.example.description }}</p></div>
                <LiveVueEditor :key="entry.id" :files="apiFiles(entry)" :baseline-files="{ 'App.vue': entry.example.code }" active-file="App.vue" @save="files => saveApi(entry.id, files)" />
              </div>
            </template>
          </apple-accordion>
        </article>
      </div>
    </section>
    <section id="accessibility" class="api-section">
      <header class="section-heading"><h2>交互与无障碍</h2></header>
      <ul class="api-notes"><li v-for="note in doc.notes" :key="note">{{ note }}</li></ul>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import type { ApiEntry, ComponentDocument } from './contract'
import { documentSections } from './sections'
const props = defineProps<{ doc: ComponentDocument }>()
// Additional editors are mounted only for examples not covered by the main demo.
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
.api-section { scroll-margin-top: 100px; margin-top: 40px; }
.section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.section-heading h2 { margin: 0; font-size: 22px; letter-spacing: -.02em; }
.section-heading > span { color: var(--apple-secondary); font-size: 12px; }
.api-group { border-top: 1px solid var(--apple-border); }
.api-entry { scroll-margin-top: 100px; }
.api-entry + .api-entry { border-top: 1px solid var(--apple-border); }
.api-summary { display: grid; grid-template-columns: minmax(0, 220px) minmax(0, 1fr); gap: 28px; padding: 24px 0; }
.api-signature { min-width: 0; }
.api-signature h3 { margin: 0 0 8px; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.api-signature code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.api-type { display: block; color: var(--apple-secondary); font-size: 12px; line-height: 1.65; overflow-wrap: anywhere; }
.api-default { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-top: 12px; font-size: 12px; }
.api-default > span { color: var(--apple-secondary); }
.api-default > code { padding: 2px 6px; border-radius: 4px; background: var(--apple-surface-alt); overflow-wrap: anywhere; }
.api-description { margin: 0; font-size: 14px; line-height: 1.85; overflow-wrap: anywhere; }
.api-accordion { margin: 0; }
.api-accordion :deep(.apple-accordion__item) { border-bottom: 0; }
.api-accordion :deep(.apple-accordion__item > h3) { margin: 0; }
.api-accordion :deep(.apple-accordion__item > h3 > button) { padding: 16px 24px; font-size: 13px; }
.api-accordion :deep(.apple-accordion__content) { padding: 0 24px 24px; }
.example-introduction { padding: 16px 0 8px; }
.example-introduction h4 { margin: 0 0 6px; font-size: 16px; }
.example-introduction p { margin: 0; color: var(--apple-secondary); font-size: 13px; line-height: 1.7; }
.api-notes { padding-left: 18px; margin: 0; font-size: 14px; line-height: 1.85; }
.api-notes li + li { margin-top: 14px; }
@media (max-width: 1100px) { .api-summary { grid-template-columns: minmax(0, 180px) minmax(0, 1fr); gap: 20px; } }
@media (max-width: 720px) {
  .api-summary { grid-template-columns: minmax(0, 1fr); padding: 20px 0; gap: 14px; }
  .api-default { margin-top: 8px; }
  .section-heading h2 { font-size: 20px; }
  .api-accordion :deep(.apple-accordion__content) { padding: 0 20px 20px; }
}
</style>

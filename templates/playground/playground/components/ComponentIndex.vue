<template>
  <nav class="component-index" aria-label="组件定位">
    <AppleTree :items="treeItems" :model-value="activeId || activeGroup" :expanded="expandedGroups" label="组件目录树" @update:expanded="expanded = $event" @select="navigate">
      <template #item="{ item }">
        <router-link :to="`/components#${item.value}`" :class="['index-link', { 'index-group': item.children, active: activeId === item.value || (item.children && activeGroup === item.value) }]" :aria-current="activeId === item.value ? 'location' : undefined" tabindex="-1" @click.prevent>
          <component :is="icons[item.label]" v-if="item.children" :size="15" aria-hidden="true" />
          <span>{{ item.label }}</span><small v-if="item.children">{{ item.children.length }}</small>
        </router-link>
      </template>
    </AppleTree>
    <p v-if="!treeItems.length" class="index-empty" role="status">未找到组件，请尝试其他关键词。</p>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Box, MousePointer2, Smartphone, Table2, TextCursorInput } from 'lucide-vue-next'
import { AppleTree } from 'apptify'
import type { AppleTreeItem, AppleValue } from 'apptify'
import { sections, componentId } from '../catalog'

const props = defineProps<{ activeGroup: string; activeId: string; search?: string }>()
const emit = defineEmits<{ navigate: [] }>()
const router = useRouter()
const route = useRoute()
const expanded = ref<AppleValue[]>([props.activeGroup])
const icons: Record<string, typeof Box> = { '基础': Box, '表单': TextCursorInput, '导航': MousePointer2, '数据展示': Table2, '反馈': Bell, '移动交互': Smartphone }
const query = computed(() => props.search?.trim().toLocaleLowerCase() ?? '')
const treeItems = computed<AppleTreeItem[]>(() => sections.flatMap(section => {
  const groupMatches = section.label.toLocaleLowerCase().includes(query.value)
  const items = section.items.filter(item => groupMatches || `${item.label} ${item.name} ${componentId(item.name)} ${item.description}`.toLocaleLowerCase().includes(query.value))
  return items.length ? [{ label: section.label, value: section.id, children: items.map(item => ({ label: item.label, value: componentId(item.name) })) }] : []
}))
const expandedGroups = computed(() => query.value ? treeItems.value.map(item => item.value) : expanded.value)
watch(() => props.activeGroup, group => {
  if (!expanded.value.includes(group)) expanded.value = [...expanded.value, group]
})
function navigate(item: AppleTreeItem) {
  const hash = `#${item.value}`
  if (route.hash === hash) {
    const target = document.getElementById(String(item.value))
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 96, behavior: 'instant' })
  } else void router.push(`/components${hash}`)
  emit('navigate')
}
</script>

<style scoped>
.component-index { min-width: 0; }
.component-index :deep(.apple-tree__row) { min-height: 38px; gap: 0; font-size: 12px; border-radius: 6px; }
.component-index :deep(.apple-tree__toggle), .component-index :deep(.apple-tree__spacer) { flex-basis: 24px; width: 24px; height: 34px; }
.component-index .index-link { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; padding: 8px 4px; font-size: 12px; color: inherit; text-decoration: none; }
.component-index .index-group { border-radius: 0; }
/* The tree row owns the fade; avoid a second, smaller hover background on its link. */
.component-index .index-link:hover { background: transparent; }
.index-link > span { flex: 1; overflow-wrap: anywhere; }
.index-link > svg { flex-shrink: 0; }
.index-link.active { color: var(--apple-text); font-weight: 600; }
.index-link small { font-size: 10px; color: var(--apple-secondary); font-variant-numeric: tabular-nums; }
.index-empty { margin: 12px 8px; font-size: 12px; line-height: 1.7; color: var(--apple-secondary); }
</style>

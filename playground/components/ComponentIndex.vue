<template>
  <nav class="component-index" aria-label="组件定位">
    <AppleTree :items="treeItems" :model-value="activeId || activeGroup" :expanded="expandedGroups" label="组件目录树" @update:expanded="expanded = $event" @select="navigate" />
    <p v-if="!treeItems.length" class="index-empty" role="status">未找到组件，请尝试其他关键词。</p>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppleTree } from '../../src'
import type { AppleTreeItem, AppleValue } from '../../src/components/content'
import { sections, componentId } from '../catalog'

const props = defineProps<{ activeGroup: string; activeId: string; search?: string }>()
const emit = defineEmits<{ navigate: [] }>()
const router = useRouter()
const route = useRoute()
const expanded = defineModel<AppleValue[]>('expanded', { default: () => sections.map(section => section.id) })
const query = computed(() => props.search?.trim().toLocaleLowerCase() ?? '')
const treeItems = computed<AppleTreeItem[]>(() => sections.flatMap(section => {
  const groupMatches = section.label.toLocaleLowerCase().includes(query.value)
  const items = section.items.filter(item => groupMatches || `${item.label} ${item.name} ${componentId(item.name)} ${item.description}`.toLocaleLowerCase().includes(query.value))
  return items.length ? [{ label: section.label, value: section.id, children: items.map(item => ({ label: item.label, value: componentId(item.name) })) }] : []
}))
const expandedGroups = computed(() => query.value ? treeItems.value.map(item => item.value) : expanded.value)
function navigate(item: AppleTreeItem) {
  if (item.children?.length) return
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
.component-index :deep(.apple-tree__row) { min-height: 34px; }
.component-index :deep(.apple-tree__row > span:last-child) { min-width: 0; overflow-wrap: anywhere; }
.index-empty { margin: 12px 8px; font-size: 12px; line-height: 1.7; color: var(--apple-secondary); }
</style>

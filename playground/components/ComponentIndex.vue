<template>
  <nav class="component-index" aria-label="组件定位">
    <AppleTree :items="treeItems" :model-value="activeId || activeGroup" :expanded="expanded" label="组件目录树" @update:expanded="expanded = $event" @select="navigate" />
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { scrollToWithMotion } from '../../src/core/motion'
import { AppleTree } from '../../src'
import type { AppleTreeItem, AppleValue } from '../../src/components/content'
import { sections, componentId } from '../catalog'

defineProps<{ activeGroup: string; activeId: string }>()
const emit = defineEmits<{ navigate: [] }>()
const router = useRouter()
const route = useRoute()
const expanded = defineModel<AppleValue[]>('expanded', { default: () => sections.map(section => section.id) })
const treeItems: AppleTreeItem[] = sections.map(section => ({ label: section.label, value: section.id, children: section.items.map(item => ({ label: item.label, value: componentId(item.name), description: `${item.name} ${item.description}` })) }))
function navigate(item: AppleTreeItem) {
  if (item.children?.length) return
  const hash = `#${item.value}`
  if (route.hash === hash) {
    const target = document.getElementById(String(item.value))
    if (target) {
      const motion = document.querySelector('#app > .apple-provider')?.getAttribute('data-apple-motion')
      const top = () => Math.min(target.getBoundingClientRect().top + window.scrollY - 96, Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
      scrollToWithMotion(window, top, motion === 'full')
    }
  } else void router.push(`/components${hash}`)
  emit('navigate')
}
</script>

<style scoped>
.component-index { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.component-index :deep(.apple-tree__row) { min-height: 34px; }
.component-index :deep(.apple-tree__row > span:last-child) { min-width: 0; overflow-wrap: anywhere; }
</style>

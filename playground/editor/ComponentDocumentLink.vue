<template>
  <footer class="documentation-entry">
    <router-link :to="href" custom v-slot="{ href: target, navigate }">
      <apple-link :href="target" @click="navigate"><span>{{ label || '代码与 API' }}</span><ArrowUpRight :size="16" :stroke-width="1.5" aria-hidden="true" /></apple-link>
    </router-link>
  </footer>
</template>
<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
defineProps<{ href: string; label?: string }>()
</script>
<style scoped>
.documentation-entry { border-top: 1px solid color-mix(in srgb, var(--apple-border) 45%, transparent); border-radius: 0 0 18px 18px; overflow: hidden; }
.documentation-entry :deep(.apple-link) { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; gap: 8px; padding: 13px 28px; color: var(--apple-secondary); font-size: 11px; font-weight: 400; line-height: 1.25; transition: color var(--apple-fast), background-color var(--apple-fast); }
.documentation-entry :deep(.apple-link__content) { width: 100%; justify-content: space-between; }
.documentation-entry :deep(.apple-link:hover) { color: var(--apple-secondary); background: var(--apple-hover); }
.documentation-entry :deep(.apple-link:active) { background: var(--apple-pressed); }
@media (max-width: 800px) { .documentation-entry :deep(.apple-link) { padding-inline: 18px; } }
</style>

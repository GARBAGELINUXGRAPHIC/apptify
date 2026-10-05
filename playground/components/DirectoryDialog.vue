<template>
  <apple-floating-group label="页面导航">
    <apple-button class="directory-toggle" variant="secondary" icon-only :icon="Menu" :label="`展开${title}`" aria-haspopup="dialog" :aria-expanded="modelValue" @click="modelValue = true" />
  </apple-floating-group>
  <apple-dialog v-model="modelValue" :title="title" :show-footer="false" width="480px">
    <div class="directory-dialog-content"><slot /></div>
  </apple-dialog>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
defineProps<{ title: string }>()
const modelValue = defineModel<boolean>({ default: false })
</script>

<style scoped>
.directory-toggle { display: none; order: 1001; width: 44px; height: 44px; padding: 0; border-radius: 50%; background-color: rgb(var(--apple-glass-rgb, 255 255 255) / var(--apple-glass-opacity, .5)); -webkit-backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); box-shadow: var(--apple-shadow); }
.directory-dialog-content { min-width: 0; }
@media (max-width: 900px) { .directory-toggle { display: inline-flex; } }
</style>

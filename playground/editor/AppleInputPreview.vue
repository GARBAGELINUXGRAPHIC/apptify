<template>
  <div class="input-preview"><apple-input v-model="value" label="姓名" placeholder="怎么称呼你" hint="用于在应用中显示你的名称。" clearable /><span class="preview-caption">试着输入、清空或点击标签。</span></div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const value = ref('')
</script>
<style scoped>
.input-preview { max-width: 440px; margin: 28px auto 12px; }
.preview-caption { display: block; margin-top: 16px; color: var(--apple-secondary); font-size: 12px; }
</style>

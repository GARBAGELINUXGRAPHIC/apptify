<template>
  <apple-image-compare v-model="position" :before="imageUrl('clash-verge-before.png')" :after="imageUrl('clash-verge-after.png')"
    before-alt="Clash Verge 原版代理组界面" after-alt="使用 Apptify Design 的 Clash Verge 代理组界面"
    before-label="Material UI" after-label="Apptify" label="Clash Verge 界面对比" :aspect-ratio="1864 / 1480" fit="contain" />
</template>

<script setup lang="ts">
import { imageUrl } from '../images'

const position = defineModel<number>({ default: 50 })
</script>

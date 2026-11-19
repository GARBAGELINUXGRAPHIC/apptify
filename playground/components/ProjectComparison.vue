<template>
  <div class="project-comparison" v-bind="mergeProps($attrs, interaction)">
    <ImageCompareDemo v-model="position" />
    <div class="comparison-footer">
      <span>Material UI</span>
      <apple-button class="comparison-expand" variant="borderless" :icon="IconMaximize" icon-only
        label="放大图片对比" @click="expanded = true" />
      <span>Apptify</span>
    </div>
  </div>
  <apple-dialog v-model="expanded" class="comparison-dialog" title="Clash Verge Rev Fork" :width="1100" :show-footer="false">
    <div class="project-comparison project-comparison--expanded" v-bind="interaction">
      <ImageCompareDemo v-model="position" />
      <div class="comparison-footer comparison-footer--expanded">
        <span>Material UI</span>
        <span>Apptify</span>
      </div>
    </div>
  </apple-dialog>
</template>

<script setup lang="ts">
import { mergeProps, ref } from 'vue'
import { IconMaximize } from '@tabler/icons-vue'
import { resolveMotion, useApple } from '../../src'
import ImageCompareDemo from './ImageCompareDemo.vue'
import { useDemoSweep } from './useDemoAnimation'

defineOptions({ inheritAttrs: false })

const apple = useApple()
const { value: position, interaction } = useDemoSweep(50, 10, 90, 7000,
  () => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) === 'full')
const expanded = ref(false)
</script>

<style scoped>
.project-comparison { flex: none; width: 100%; max-width: 320px; min-width: 0; min-height: 0; margin-inline: auto; padding-top: 24px; border-radius: 12px; background: var(--apple-surface); }
.project-comparison :deep(.apple-image-compare__label) { display: none; }
.comparison-footer { display: grid; grid-template-columns: minmax(0, 1fr) 32px minmax(0, 1fr); align-items: center; gap: 4px; min-height: 44px; margin-inline: 28px; padding-inline: 10px; border-radius: 0 0 12px 12px; background: var(--apple-surface); color: var(--apple-text); font-size: 11px; line-height: 1.4; }
.comparison-footer > :last-child { text-align: right; }
.comparison-expand { width: 32px; min-width: 32px; height: 36px; min-height: 36px; padding: 6px; color: var(--apple-text); }
:global(.comparison-dialog .apple-modal-body) { padding: 8px 0 16px; }
.project-comparison--expanded { max-width: calc((100dvh - 200px) * 1864 / 1480 + 56px); padding-top: 0; }
.comparison-footer--expanded { grid-template-columns: 1fr 1fr; padding-inline: 16px; font-size: 13px; }
</style>

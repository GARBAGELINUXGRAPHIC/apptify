<template>
  <div class="configurable-editor">
    <div class="mode-selector"><AppleTabs v-model="mode" :items="[{ label: '低代码', value: 'controls' }, { label: 'App.vue', value: 'code' }]" label="编辑模式" /><slot name="actions" /></div>
    <div v-show="mode === 'controls'" class="controls-pane"><slot /></div>
    <div v-show="mode === 'code'" class="source-pane"><CodeMirror ref="editor" v-bind="editorAttrs" :value="String(editorAttrs.value ?? '')" :filename="String(editorAttrs.filename ?? 'App.vue')" /></div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import CodeMirror from '@vue/repl/codemirror-editor'
import { AppleTabs } from '../../src'
defineProps<{ editorAttrs: Record<string, unknown> }>()
const mode = ref('controls')
const editor = ref<InstanceType<typeof CodeMirror>>()
watch(mode, async mode => {
  await nextTick()
  if (mode === 'code') editor.value?.getEditorIns<'codemirror'>()?.refresh()
})
defineExpose({ getEditorIns: () => editor.value?.getEditorIns() })
</script>
<style scoped>
.configurable-editor { height: 100%; display: flex; flex-direction: column; min-height: 0; background: var(--apple-surface); }
.mode-selector { box-sizing: border-box; flex: 0 0 var(--header-height, 49px); display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--apple-border); }
.mode-selector :deep(.apple-tabs__list) { border-bottom: 0; }
.mode-selector :deep(.apple-tabs__viewport) { display: none; }
.controls-pane { flex: 1; min-height: 0; overflow: auto; padding: 20px; }
/* Vue REPL resets every descendant button, including the library select trigger. */
.controls-pane :deep(.apple-select) { border: 1px solid var(--apple-border); background: var(--apple-surface); }
.controls-pane :deep(.apple-select:hover:not(:disabled)) { border-color: color-mix(in srgb, var(--apple-secondary) 60%, var(--apple-border)); }
.controls-pane :deep(.apple-select:active:not(:disabled)) { background: color-mix(in srgb, var(--apple-text) 7%, var(--apple-surface)); }
.controls-pane :deep(.apple-select:focus) { border-color: var(--apple-accent); }
.controls-pane :deep(.apple-field.has-error .apple-select) { border-color: var(--apple-danger); }
.controls-pane :deep(.apple-select:disabled) { border-color: var(--apple-surface-alt); background: var(--apple-surface-alt); cursor: not-allowed; }
.source-pane { flex: 1; min-height: 0; position: relative; }
</style>

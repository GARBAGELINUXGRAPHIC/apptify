<template>
  <div ref="editorRoot" class="live-editor" :class="{ dark: theme === 'dark', 'has-configuration': !!slots.configuration }">
    <EditorActions v-if="!slots.configuration" />
    <Repl ref="repl" :store="store" :editor="slots.configuration ? configuredEditor : CodeMirror" layout="horizontal" layout-reverse preview-theme :theme="theme" :show-import-map="false" :show-ts-config="false" :show-compile-output="false" :show-ssr-output="false" :auto-resize="false" :clear-console="false" :preview-options="previewOptions" :editor-options="{ showErrorText: slots.configuration ? false : '显示错误', autoSaveText: false }" />
    <p class="editor-status" role="status">{{ copied ? '已复制当前文件' : '实时预览 · Vue 源码 · 自动编译' }}</p>
  </div>
</template>
<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, useSlots, watch, nextTick } from 'vue'
import { File, Repl, useStore } from '@vue/repl'
import CodeMirror from '@vue/repl/codemirror-editor'
import ConfigurableEditor from './ConfigurableEditor.vue'
import { AppleLink, AppleTooltip, useApple } from '../../src'
import { Copy, RefreshCw, RotateCcw } from 'lucide-vue-next'
const props = defineProps<{ files: Record<string, string>; activeFile?: string; resetLabel?: string; baselineFiles?: Record<string, string>; previewSurface?: boolean }>()
const emit = defineEmits<{ close: []; save: [files: Record<string, string>]; restore: [] }>()
const slots = useSlots()
const configuredEditor = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, expose }) {
    const pane = ref<InstanceType<typeof ConfigurableEditor>>()
    expose({ getEditorIns: () => pane.value?.getEditorIns() })
    return () => h(ConfigurableEditor, { ref: pane, editorAttrs: attrs }, { default: slots.configuration, actions: () => h(EditorActions) })
  },
})
const EditorActions = () => h('div', { class: 'editor-actions', role: 'group', 'aria-label': '示例操作' }, [
  { label: '重新运行', icon: RefreshCw, click: rerun },
  { label: props.resetLabel || '恢复示例', icon: RotateCcw, click: restore },
  { label: '复制当前文件', icon: Copy, click: copyCode },
].map(action => {
  const button = () => h(AppleLink, {
  as: 'button', iconOnly: !!slots.configuration,
  icon: slots.configuration ? action.icon : undefined,
  label: action.label, onClick: action.click,
  }, { default: () => slots.configuration ? null : action.label })
  return slots.configuration ? h(AppleTooltip, { text: action.label }, { default: button }) : button()
}))
const apple = useApple()
const theme = computed(() => apple.theme.value.current.scheme === 'dark' ? 'dark' : 'light')
const repl = ref<InstanceType<typeof Repl>>()
const editorRoot = ref<HTMLElement>()
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
const url = (name: string) => new URL(`${import.meta.env.BASE_URL}assets/editor/${name}`, location.origin).href
const importMap = { imports: { vue: url('vue.js'), apptify: url('runtime.js'), 'lucide-vue-next': url('runtime.js') } }
const normalize = (name: string) => name.startsWith('src/') ? name : `src/${name}`
const initialFiles: Record<string, File> = Object.fromEntries(Object.entries(props.files)
  .filter(([name]) => name.endsWith('.vue'))
  .map(([name, code]) => [normalize(name), new File(normalize(name), code)]))
// REPL reads the map synchronously during useStore/init and after setFiles.
// Seed it before either call, rather than allowing a missing-map error to linger.
initialFiles['import-map.json'] = new File('import-map.json', JSON.stringify(importMap), true)
const store = useStore({
  files: ref(initialFiles), mainFile: ref('src/App.vue'),
  template: ref({ welcomeSFC: props.files['App.vue'] || props.files['src/App.vue'], newSFC: '<template></template>' }),
  activeFilename: ref('src/App.vue'),
  builtinImportMap: ref(importMap), vueVersion: ref(null),
  resourceLinks: ref({ esModuleShims: url('shims.js') }),
})
let disposed = false
let applying = Promise.resolve(true)
const previewOptions = computed(() => ({
  headHTML: `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob: ${location.origin}; style-src 'unsafe-inline' blob: ${location.origin}; connect-src blob: ${location.origin}; img-src data: blob:; font-src data:; form-action 'none'; base-uri 'none'"><link rel="stylesheet" href="${url('runtime.css')}"><script>window.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); parent.postMessage({ action: 'apptify-workshop-close' }, '*') } })<\/script><style>body{margin:0;background:var(${props.previewSurface ? '--apple-surface' : '--apple-bg'});color:var(--apple-text);min-height:100vh}html{min-height:100%}</style>`,
  customCode: { importCode: "import { watchEffect } from 'vue'; import { createAppleUI, themeStyle, resolveMotion } from 'apptify'", useCode: `const ui = createAppleUI(${JSON.stringify({ theme: 'preview', themes: { preview: apple.theme.value.current }, persist: false, motion: apple.motion.value.mode })}); app.use(ui); ui.attach(); document.documentElement.classList.add('apple-provider'); const stopPreviewPreferences = watchEffect(() => { for (const [key, value] of Object.entries(themeStyle(ui))) document.documentElement.style.setProperty(key, value); document.documentElement.style.colorScheme = ui.theme.value.current.scheme; document.documentElement.dataset.appleMotion = resolveMotion('inherit', ui.motion.value.mode, ui.motion.value.reduced); }); app.onUnmount(() => { stopPreviewPreferences(); ui.detach(); });` },
  showRuntimeError: true, showRuntimeWarning: true,
}))
function apply(files: Record<string, string>) {
  // Serialize restores so rapid clicks cannot install an older compilation last.
  applying = applying.then(async () => {
    if (disposed) return false
    const editable = Object.keys(store.files).filter(name => name.endsWith('.vue'))
    const incoming = Object.keys(files).filter(name => name.endsWith('.vue'))
    if (editable.length === incoming.length && incoming.every(name => store.files[normalize(name)])) {
      // Editing the existing File lets REPL compile once without rebuilding its iframe.
      for (const name of incoming) store.files[normalize(name)].code = files[name]
    } else {
      await store.setFiles({ ...files, 'import-map.json': JSON.stringify(importMap) }, 'App.vue')
    }
    if (!disposed && props.activeFile && store.files[normalize(props.activeFile)]) store.setActive(normalize(props.activeFile))
    return !disposed
  }).catch(error => { if (!disposed) store.errors = [error instanceof Error ? error : String(error)]; return false })
  return applying
}
function rerun() {
  if (!repl.value) return
  try { repl.value.reload(); apple.notify('正在重新运行示例', { tone: 'info' }) }
  catch { apple.notify('重新运行失败，请查看编辑器中的错误', { tone: 'danger' }) }
}
async function restore() {
  emit('restore')
  await nextTick()
  const restored = await apply(props.baselineFiles || props.files)
  if (!disposed) apple.notify(restored ? (slots.configuration ? '已恢复默认配置和代码' : '已恢复示例代码') : '恢复失败，请查看编辑器中的错误', { tone: restored ? 'success' : 'danger' })
}
watch(() => props.files, () => apply(props.files))
async function copyCode() {
  try { await navigator.clipboard.writeText(store.activeFile.code); apple.notify('已复制当前文件代码', { tone: 'success' }); copied.value = true; clearTimeout(copyTimer); copyTimer = setTimeout(() => copied.value = false, 2000) }
  catch { apple.notify('无法访问剪贴板，请在编辑器中选择代码复制', { tone: 'warning' }) }
}
function previewMessage(event: MessageEvent) {
  const frame = editorRoot.value?.querySelector<HTMLIFrameElement>('.vue-repl iframe')
  if (frame && event.source === frame.contentWindow && event.data?.action === 'apptify-workshop-close') emit('close')
}
onMounted(() => {
  // init() compiles the active file and skips mainFile in its remaining loop.
  // Start on App.vue so the preview entry is compiled, then reveal the source.
  if (props.activeFile) store.setActive(normalize(props.activeFile))
  window.addEventListener('message', previewMessage)
})
onBeforeUnmount(() => { disposed = true; clearTimeout(copyTimer); window.removeEventListener('message', previewMessage); emit('save', store.getFiles()) })
</script>
<style scoped>
.has-configuration :deep(.vue-repl) { --header-height: 49px; height: 780px; }
.has-configuration :deep(.tab-buttons button) { height: 100%; display: inline-flex; align-items: center; }
.has-configuration :deep(.split-pane > .right .file-selector) { display: none; }
.has-configuration :deep(.split-pane > .right .editor-container) { height: 100%; }
.editor-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.has-configuration .editor-actions { flex-wrap: nowrap; gap: 2px; margin: 0; }
.editor-status { margin: 8px 0; color: var(--apple-secondary); font-size: 12px; }
:deep(.vue-repl) { height: 580px; border: 1px solid var(--apple-separator); border-radius: 12px; overflow: hidden; }

@media (max-width: 720px) {
  :deep(.vue-repl) { height: 740px; }
  .has-configuration :deep(.vue-repl) { height: 1200px; }
  .live-editor:not(.has-configuration) .editor-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
  .editor-actions :deep(button) { padding-inline: 8px; font-size: 12px; min-height: 36px; }
  :deep(.split-pane) { display: flex !important; flex-direction: column !important; }
  :deep(.split-pane > .left), :deep(.split-pane > .right) { position: relative !important; inset: auto !important; z-index: 0 !important; pointer-events: auto !important; display: block !important; height: 50% !important; width: 100% !important; }
  :deep(.split-pane > .left) { height: 55% !important; }
  :deep(.split-pane > .right) { height: 45% !important; }
  :deep(.split-pane .toggler) { display: none !important; }
}
</style>

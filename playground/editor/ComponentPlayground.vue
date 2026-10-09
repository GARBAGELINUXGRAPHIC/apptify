<template>
  <div data-testid="component-playground" :data-component="doc.name">
    <LiveVueEditor :files="files" :baseline-files="baselineFiles" active-file="App.vue" preview-surface reset-label="恢复当前配置" @restore="reset">
      <template #configuration>
        <section class="configuration" role="region" :aria-label="`${doc.name} 配置`">
          <div class="config-heading"><h3>配置 {{ doc.name }}</h3><AppleLink as="button" @click="reset">重置</AppleLink></div>
          <div class="config-grid">
            <div v-for="entry in doc.props" :key="entry.name" class="prop-control" :data-prop-control="entry.name">
              <AppleCheckbox v-if="entry.default === 'undefined' && !entry.required" v-model="config.props[entry.name].enabled" :label="`使用 ${entry.name}`" />
              <AppleSwitch v-if="controls[entry.name].kind === 'boolean'" :model-value="config.props[entry.name].value === true" @update:model-value="config.props[entry.name].value = $event" :label="entry.name" :disabled="!config.props[entry.name].enabled" />
              <AppleSelect v-else-if="controls[entry.name].kind === 'select'" :model-value="String(config.props[entry.name].value)" @update:model-value="config.props[entry.name].value = String($event)" :items="controls[entry.name].options.map(value => ({ label: value, value }))" :label="entry.name" :disabled="!config.props[entry.name].enabled" />
              <AppleTextarea v-else-if="['json', 'expression'].includes(controls[entry.name].kind)" :model-value="String(config.props[entry.name].value)" @update:model-value="config.props[entry.name].value = String($event)" :label="entry.name" :hint="controls[entry.name].kind === 'json' ? 'JSON' : 'JavaScript 表达式'" :rows="3" :error="errors[entry.name] || ''" :disabled="!config.props[entry.name].enabled" />
              <AppleInput v-else :model-value="String(config.props[entry.name].value)" @update:model-value="config.props[entry.name].value = String($event)" :label="entry.name" :error="errors[entry.name] || ''" :disabled="!config.props[entry.name].enabled" />
            </div>
          </div>
          <AppleAccordion v-if="doc.slots.length" :items="[{ label: '插槽', value: 'slots' }]">
            <template #item>
              <div class="slot-controls">
                <div v-for="entry in doc.slots" :key="entry.name" class="slot-control">
                  <AppleSwitch v-model="config.slots[entry.name].enabled" :label="entry.name" />
                  <template v-if="config.slots[entry.name].enabled">
                    <AppleInput v-if="entry.name.includes('${')" v-model="config.slots[entry.name].name" :label="`${entry.name} 名称`" />
                    <AppleTextarea v-model="config.slots[entry.name].code" :label="`${entry.name} 模板`" :rows="4" />
                  </template>
                </div>
              </div>
            </template>
          </AppleAccordion>
          <AppleAlert v-if="compileError" tone="danger" title="配置有误" :message="compileError" />
        </section>
      </template>
    </LiveVueEditor>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc'
import { AppleAccordion, AppleAlert, AppleCheckbox, AppleInput, AppleLink, AppleSelect, AppleSwitch, AppleTextarea } from '../../src'
import type { ComponentDocument } from './contract'
import { createPlaygroundConfig, generateComponentCode, propControl, propExpression } from './component-playground'

const props = defineProps<{ doc: ComponentDocument }>()
const LiveVueEditor = defineAsyncComponent(() => import('./LiveVueEditor.vue'))
const config = reactive(createPlaygroundConfig(props.doc))
const baselineFiles = { 'App.vue': generateComponentCode(props.doc, createPlaygroundConfig(props.doc)) }
const files = shallowRef(baselineFiles)
const errors = ref<Record<string, string>>({})
const compileError = ref('')
const controls = computed(() => Object.fromEntries(props.doc.props.map(entry => [entry.name, propControl(entry)])))
let updateTimer: ReturnType<typeof setTimeout> | undefined

function update() {
  errors.value = {}
  for (const entry of props.doc.props) {
    if (!config.props[entry.name].enabled) continue
    try { propExpression(entry, config.props[entry.name]) }
    catch (error) { errors.value[entry.name] = error instanceof Error ? error.message : String(error) }
  }
  if (Object.keys(errors.value).length) { compileError.value = '请修正标记的属性。'; return }
  try {
    const code = generateComponentCode(props.doc, config)
    const { descriptor, errors: parseErrors } = parse(code, { filename: 'App.vue' })
    if (parseErrors.length) throw parseErrors[0]
    const script = compileScript(descriptor, { id: 'component-playground' })
    const template = compileTemplate({ source: descriptor.template!.content, filename: 'App.vue', id: 'component-playground', compilerOptions: { bindingMetadata: script.bindings } })
    if (template.errors.length) throw template.errors[0]
    compileError.value = ''
    files.value = { 'App.vue': code }
  } catch (error) { compileError.value = error instanceof Error ? error.message : String(error) }
}
watch(config, () => { clearTimeout(updateTimer); updateTimer = setTimeout(update, 150) }, { deep: true })
function reset() {
  clearTimeout(updateTimer)
  Object.assign(config, createPlaygroundConfig(props.doc))
  update()
}
onBeforeUnmount(() => clearTimeout(updateTimer))
</script>

<style scoped>
.configuration, .slot-controls, .slot-control { display: grid; gap: 20px; min-width: 0; }
.config-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.config-heading h3 { margin: 0; font-size: 16px; overflow-wrap: anywhere; }
.config-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.prop-control { display: grid; align-content: start; gap: 10px; min-width: 0; }
.slot-control + .slot-control { border-top: 1px solid var(--apple-border); padding-top: 20px; }
@media (max-width: 1100px) { .config-grid { grid-template-columns: minmax(0, 1fr); } }
</style>

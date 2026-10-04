<template>
  <div class="input-playground" data-testid="input-playground">
    <LiveVueEditor :files="files" :baseline-files="baselineFiles" reset-label="恢复当前配置" active-file="App.vue" preview-surface @restore="reset">
      <template #configuration>
    <section class="configuration" role="region" aria-label="输入框配置">
      <div class="config-heading"><h3>配置输入框</h3><AppleLink as="button" @click="reset">重置</AppleLink></div>
        <div class="preset-segments"><AppleSegmentedControl :model-value="preset" label="快速场景" :items="presets" @update:model-value="applyPreset(String($event))" /></div>
        <div class="preset-select"><AppleSelect :model-value="preset" label="快速场景" :items="presets" @update:model-value="applyPreset(String($event))" /></div>
        <AppleSegmentedControl v-model="config.type" label="输入类型" :items="types" />
        <div class="config-grid">
          <AppleInput v-model="config.label" label="标签" hint="label" />
          <AppleInput v-model="config.placeholder" label="占位文字" hint="placeholder" />
          <AppleInput v-model="config.hint" label="帮助文字" hint="hint" />
          <AppleInput v-model="config.error" label="错误信息" hint="error" placeholder="留空恢复正常" />
        </div>
        <div class="switch-grid">
          <AppleSwitch v-for="toggle in toggles" :key="toggle.key" v-model="config[toggle.key]" :label="toggle.label" :hint="toggle.key" />
        </div>
        <AppleAccordion class="advanced-config" :items="[{ label: '插槽、原生属性与动效', value: 'advanced' }]">
          <template #item>
          <div class="config-grid">
            <AppleSegmentedControl v-model="config.prefixMode" label="前缀插槽" hint="prefix" :items="affixModes" />
            <AppleInput v-if="config.prefixMode === 'text'" v-model="config.prefix" label="前缀文字" placeholder="例如 ¥" />
            <AppleInput v-if="config.prefixMode === 'icon'" v-model="config.prefixIcon" label="前缀图标代号" placeholder="Mail" hint="Lucide 代号，例如 Mail、User、Search。" :error="iconCodeError(config.prefixIcon)" />
            <AppleSegmentedControl v-model="config.suffixMode" label="后缀插槽" hint="suffix" :items="affixModes" />
            <AppleInput v-if="config.suffixMode === 'text'" v-model="config.suffix" label="后缀文字" placeholder="例如 kg" />
            <AppleInput v-if="config.suffixMode === 'icon'" v-model="config.suffixIcon" label="后缀图标代号" placeholder="Search" hint="Lucide 代号，例如 Search、Check、ArrowRight。" :error="iconCodeError(config.suffixIcon)" />
            <AppleSelect v-model="config.motion" label="动效" hint="motion" :items="motions" />
            <AppleInput v-model="config.name" label="表单字段" hint="name" />
            <AppleInput v-model="config.ariaLabel" label="可访问名称" hint="aria-label" />
            <AppleInput v-model="config.maxlength" label="最大长度" hint="maxlength" type="number" min="0" placeholder="不限制" />
            <AppleSelect v-model="config.autocomplete" label="自动填充" hint="autocomplete" :items="autocompletes" />
            <AppleInput v-model="config.min" label="最小值" hint="min" type="number" :disabled="config.type !== 'number'" />
            <AppleInput v-model="config.max" label="最大值" hint="max" type="number" :disabled="config.type !== 'number'" />
            <AppleInput v-model="config.step" label="步长" hint="step" type="number" min="0" :disabled="config.type !== 'number'" />
          </div>
          </template>
        </AppleAccordion>
    </section>
      </template>
    </LiveVueEditor>
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref } from 'vue'
import { AppleInput, AppleButton, AppleLink, AppleSelect, AppleSegmentedControl, AppleSwitch, AppleAccordion } from '../../src'
import { createInputConfig, generateInputCode, iconCodeError } from './input-playground'
const LiveVueEditor = defineAsyncComponent(() => import('./LiveVueEditor.vue'))
const baselineFiles = { 'App.vue': generateInputCode(createInputConfig(), 'Apptify') }
const config = reactive(createInputConfig())
const value = ref<string | number>('Apptify')
const preset = ref('basic')
const options = (values: string[]) => values.map(value => ({ label: value, value }))
const presets = [{ label: '基础', value: 'basic' }, { label: '密码', value: 'password' }, { label: '邮箱', value: 'email' }, { label: '金额', value: 'amount' }]
const types = [{ label: '文本', value: 'text' }, { label: '密码', value: 'password' }, { label: '数字', value: 'number' }, { label: '邮箱', value: 'email' }, { label: '搜索', value: 'search' }, { label: '电话', value: 'tel' }, { label: '网址', value: 'url' }]
const affixModes = [{ label: '无', value: 'none' }, { label: '文字', value: 'text' }, { label: '图标', value: 'icon' }]
const motions = options(['inherit', 'auto', 'full', 'reduced', 'none'])
const autocompletes = options(['off', 'on', 'name', 'email', 'username', 'current-password', 'new-password', 'tel', 'url'])
const toggles = [{ key: 'clearable', label: '允许清空' }, { key: 'disabled', label: '禁用' }, { key: 'loading', label: '加载' }, { key: 'required', label: '必填' }] as const
function applyPreset(next: string) {
  Object.assign(config, createInputConfig())
  preset.value = next
  value.value = 'Apptify'
  if (next === 'password') { Object.assign(config, { type: 'password', label: '密码', placeholder: '请输入密码', hint: '点击眼睛切换密码可见性。', autocomplete: 'current-password' }); value.value = 'apple123' }
  if (next === 'email') { Object.assign(config, { type: 'email', label: '电子邮箱', placeholder: 'name@example.com', hint: '提交时体验原生邮箱校验。', required: true, autocomplete: 'email', prefixMode: 'icon', prefixIcon: 'Mail' }); value.value = '' }
  if (next === 'amount') { Object.assign(config, { type: 'number', label: '金额', placeholder: '0.00', hint: '数字输入事件仍返回字符串。', prefixMode: 'text', prefix: '¥', suffixMode: 'text', suffix: '元', min: '0', step: '0.01' }); value.value = 128 }
}
function reset() { applyPreset('basic') }
const files = computed(() => ({ 'App.vue': generateInputCode(config, value.value) }))
</script>
<style scoped>
.input-playground { display: grid; gap: 24px; min-width: 0; }
.preset-select { display: none; }
.configuration { display: grid; gap: 20px; }
.config-heading { display: flex; align-items: center; justify-content: space-between; }
.config-heading h3 { margin: 0; font-size: 16px; }
.config-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.switch-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.advanced-config :deep(.apple-accordion__item > h3) { font-size: 14px; }
.advanced-config :deep(.apple-accordion__content) { padding: 8px 12px 20px; }
@media (max-width: 1100px) { .preset-segments { display: none; } .preset-select { display: block; } .config-grid, .switch-grid { grid-template-columns: minmax(0, 1fr); } }
</style>

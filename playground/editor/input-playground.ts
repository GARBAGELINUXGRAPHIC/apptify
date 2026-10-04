import { icons } from 'lucide-vue-next'
import exampleSource from './AppleInputExample.vue?raw'

export function createInputConfig() {
  return {
    type: 'text', label: '姓名', placeholder: '怎么称呼你', hint: '用于在应用中显示你的名称。', error: '',
    clearable: true, disabled: false, loading: false, required: false,
    prefixMode: 'none', prefix: '', prefixIcon: 'Mail', suffixMode: 'none', suffix: '', suffixIcon: 'Search', motion: 'inherit' as 'inherit' | 'auto' | 'full' | 'reduced' | 'none',
    name: 'name', ariaLabel: '', maxlength: '', autocomplete: 'off', min: '', max: '', step: '',
  }
}
export type InputConfig = ReturnType<typeof createInputConfig>
export function buildInputProps(config: InputConfig) {
  return {
    type: config.type, label: config.label, placeholder: config.placeholder, hint: config.hint, error: config.error,
    clearable: config.clearable, disabled: config.disabled, loading: config.loading, required: config.required,
    motion: config.motion, name: config.name || undefined,
    'aria-label': config.ariaLabel || (!config.label ? '演示输入框' : undefined),
    maxlength: config.maxlength !== '' && Number.isInteger(Number(config.maxlength)) && Number(config.maxlength) >= 0 ? Number(config.maxlength) : undefined,
    autocomplete: config.autocomplete,
    min: config.type === 'number' && config.min !== '' ? config.min : undefined,
    max: config.type === 'number' && config.max !== '' ? config.max : undefined,
    step: config.type === 'number' && Number(config.step) > 0 ? config.step : undefined,
  }
}
const iconNames = new Map(Object.keys(icons).map(name => [name.toLowerCase(), name]))
export function resolveIconName(code: string): string | undefined {
  return iconNames.get(code.trim().replace(/-/g, '').toLowerCase())
}
export function iconCodeError(code: string): string {
  return resolveIconName(code) ? '' : '请输入有效图标代号，例如 Mail、Search、ArrowRight。'
}
// This Vue source is both the editable file and the compiled preview.
const literal = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
const attribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const text = (value: string) => attribute(value).replace(/{/g, '&#123;').replace(/}/g, '&#125;')
export function generateInputCode(config: InputConfig, value: string | number) {
  const attrs = Object.entries(buildInputProps(config)).flatMap(([name, next]) => {
    if (next === undefined || next === '' || next === false) return []
    return [typeof next === 'boolean' ? `          ${name}` : typeof next === 'number' ? `          :${name}="${next}"` : `          ${name}="${attribute(next)}"`]
  }).join('\n')
  const prefixIcon = config.prefixMode === 'icon' ? resolveIconName(config.prefixIcon) : undefined
  const suffixIcon = config.suffixMode === 'icon' ? resolveIconName(config.suffixIcon) : undefined
  const usedIcons = [...new Set([prefixIcon, suffixIcon].filter((name): name is string => !!name))]
  const affix = (slot: string, mode: string, value: string, icon?: string) => {
    if (mode === 'icon' && icon) return `<template #${slot}><${icon} :size="18" aria-hidden="true" /></template>`
    return mode === 'text' ? `<template #${slot}><span>${text(value)}</span></template>` : ''
  }
  const prefix = affix('prefix', config.prefixMode, config.prefix, prefixIcon)
  const suffix = affix('suffix', config.suffixMode, config.suffix, suffixIcon)
  return exampleSource
    .replace("import { Mail } from 'lucide-vue-next'", () => usedIcons.length ? `import { ${usedIcons.join(', ')} } from 'lucide-vue-next'` : '')
    .replace(/, Mail(?= })/, () => usedIcons.length ? ', ' + usedIcons.join(', ') : '')
    .replace("value: 'Apptify'", () => `value: ${literal(value)}`)
    .replace(/(v-model="value"\n)[\s\S]*?(\n\s+@update:model-value)/, (_, start, end) => `${start}${attrs}${end}`)
    .replace('<!-- prefix -->', () => prefix)
    .replace('<!-- suffix -->', () => suffix)
    .replace(':disabled="false"', () => config.disabled || config.loading ? 'disabled' : '')
}

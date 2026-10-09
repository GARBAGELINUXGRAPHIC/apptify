import type { ApiEntry, ComponentDocument } from './contract'
import { playgroundExample, slotExample } from './playground-examples'

export type ControlKind = 'boolean' | 'text' | 'number' | 'select' | 'json' | 'expression'
export interface PropControl { name: string; kind: ControlKind; options: string[]; required: boolean }
export interface PropValue { enabled: boolean; value: string | boolean }
export interface SlotValue { enabled: boolean; name: string; scope?: string; code: string }
export interface PlaygroundConfig { props: Record<string, PropValue>; slots: Record<string, SlotValue> }

export function propControl(entry: ApiEntry): PropControl {
  const options = [...entry.type.matchAll(/'([^']+)'/g)].map(match => match[1])
  const enumType = options.length > 0 && /^('[^']+'\s*(\|\s*('[^']+'|undefined)\s*)*)$/.test(entry.type)
  const kind: ControlKind = entry.type === 'boolean' ? 'boolean'
    : enumType ? 'select' : entry.type === 'string' ? 'text' : entry.type === 'number' ? 'number'
    : /=>|Component|File\[\]/.test(entry.type) ? 'expression'
    : /\[\]|Record</.test(entry.type) && !entry.type.includes('undefined') ? 'json' : 'expression'
  return { name: entry.name, kind, options, required: !!entry.required }
}

function editableValue(control: PropControl, expression: string): string | boolean {
  if (control.kind === 'boolean') return expression === 'true'
  if (control.kind === 'text' || control.kind === 'select') {
    if (expression === 'undefined') return ''
    try { return String(JSON.parse(expression)) } catch { return expression.replace(/^'|'$/g, '') }
  }
  if (control.kind === 'json') {
    try { return JSON.stringify(JSON.parse(expression), null, 2) } catch { return expression === 'undefined' ? '[]' : expression }
  }
  return expression === 'undefined' ? '' : expression
}

export function createPlaygroundConfig(doc: ComponentDocument): PlaygroundConfig {
  const example = playgroundExample(doc.name)
  return {
    props: Object.fromEntries(doc.props.map(entry => {
      const expression = example.props?.[entry.name] ?? entry.default ?? 'undefined'
      return [entry.name, { enabled: expression !== 'undefined' || !!entry.required, value: editableValue(propControl(entry), expression) }]
    })),
    slots: Object.fromEntries(doc.slots.map(entry => {
      const example = slotExample(doc.name, entry.name)
      const name = entry.name.replace('${value}', 'first').replace('${key}', 'name')
      return [entry.name, { ...example, enabled: !!example.enabled, name }]
    })),
  }
}

const scriptLiteral = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
const attr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const kebab = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export function propExpression(entry: ApiEntry, input: PropValue): string {
  const control = propControl(entry)
  if (control.kind === 'boolean') return String(input.value === true)
  if (control.kind === 'text' || control.kind === 'select') return scriptLiteral(String(input.value))
  if (control.kind === 'json') return scriptLiteral(JSON.parse(String(input.value)))
  const expression = String(input.value).trim()
  if (control.kind === 'number' && !/^-?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)$/i.test(expression)) throw new Error(`${entry.name}：请输入数字或 Infinity。`)
  if (!expression) throw new Error(`${entry.name}：请输入 JavaScript 表达式，或关闭该属性。`)
  return expression.replace(/<\/script/gi, '<\\/script')
}

export function generateComponentCode(doc: ComponentDocument, config: PlaygroundConfig): string {
  const example = playgroundExample(doc.name)
  const enabledProps = doc.props.filter(entry => config.props[entry.name].enabled)
  const expressions = enabledProps.map(entry => `        ${scriptLiteral(entry.name)}: (${propExpression(entry, config.props[entry.name])})`).join(',\n')
  const bindings = enabledProps.map(entry => `        :${kebab(entry.name)}="props.${entry.name}"`)
  const listeners = doc.events.map(entry => {
    let handler = `(...args) => record('${entry.name}', ...args)`
    if (entry.name.startsWith('update:')) handler = `(value) => { props.${entry.name.slice(7)} = value; record('${entry.name}', value) }`
    if (['refresh', 'load', 'retry'].includes(entry.name)) handler = `(done) => finishBatch('${entry.name}', done)`
    if (doc.name === 'AppleForm' && entry.name === 'reset') handler = `() => { fieldValue = ''; record('reset') }`
    return `        @${kebab(entry.name)}="${attr(handler)}"`
  })
  const slots = Object.values(config.slots).filter(slot => slot.enabled).map(slot => {
    if (!/^[\w-]+$/.test(slot.name)) throw new Error('插槽名称只能包含字母、数字、下划线和连字符。')
    return `        <template #${slot.name}${slot.scope ? `="${attr(slot.scope)}"` : ''}>${slot.code}</template>`
  }).join('\n')
  const component = `      <${doc.name}\n        ref="demo"\n${[...bindings, ...listeners].join('\n')}\n      >\n${slots}\n      </${doc.name}>`
  const names = [...new Set([doc.name, 'AppleButton', 'AppleInput', 'AppleLink', 'AppleTextarea'])]
  const methods = doc.methods.map(method => ({ label: method.name, expression: `$refs.demo.${method.name.split('(')[0]}()` }))
  const modal = ['AppleDialog', 'AppleDrawer', 'AppleSheet', 'AppleActionSheet', 'AppleSnackbar', 'AppleAlert'].includes(doc.name)
  const actions = [...(modal ? [{ label: '打开 / 重新显示', expression: 'props.modelValue = true' }] : []), ...methods, ...(example.actions || [])]
  const actionButtons = actions.length ? `      <div class="actions">${actions.map(action => `<AppleLink as="button" @click="${attr(action.expression)}">${attr(action.label)}</AppleLink>`).join('')}</div>` : ''
  const modelProps = doc.props.filter(prop => doc.events.some(event => event.name === `update:${prop.name}`))
  const modelReadout = modelProps.map(prop => `<output>${prop.name} = {{ display(props.${prop.name}) }}</output>`).join('\n      ')
  return `<script>
import { ${names.join(', ')} } from 'apptify'
import { markRaw } from 'vue'
import { Mail, Star, Check, Search, ArrowRight } from 'lucide-vue-next'

;[Mail, Star, Check, Search, ArrowRight].forEach(markRaw)

export default {
  components: { ${names.join(', ')}, Mail, Star, Check, Search, ArrowRight },
  data() {
    return {
      props: {
${expressions}
      },
      fieldValue: 'Apptify', expanded: false, batches: 0, events: [], eventId: 0,
    }
  },
  computed: {
    eventLog() { return this.events.join('\\n') },
  },
  methods: {
    display(value) {
      if (value === undefined) return 'undefined'
      const seen = new WeakSet()
      return JSON.stringify(value, (_, current) => {
        if (typeof current === 'function') return '[function]'
        if (current instanceof FormData) return Object.fromEntries(current.entries())
        if (current instanceof File) return { name: current.name, size: current.size, type: current.type }
        if (current instanceof Event) return { type: current.type }
        if (current && typeof current === 'object') { if (seen.has(current)) return '[circular]'; seen.add(current) }
        return current
      })
    },
    record(name, ...args) {
      this.events.push(++this.eventId + '. ' + name + ' ' + (args.length ? args.map(this.display).join(' · ') : '无参数'))
      if (this.events.length > 12) this.events.shift()
    },
    finishBatch(name, done) {
      this.record(name, done)
      this.batches++
      if (name !== 'refresh' && this.batches >= 3) this.props.finished = true
      if (name === 'retry') this.props.error = false
      if (typeof done === 'function') done()
    },
  },
}
<\/script>

<template>
  <div class="example">
    <section class="component-section" aria-label="${doc.name} 示例">
      ${example.before || ''}
${actionButtons}
${component}
      ${modelReadout}
    </section>
    <section v-if="${doc.events.length > 0}" class="events-section" aria-label="事件记录">
      <div class="event-heading"><h3>事件记录</h3><AppleLink as="button" @click="events = []">清除记录</AppleLink></div>
      <AppleTextarea :model-value="eventLog" readonly :rows="6" :resize="false" aria-label="事件记录内容" placeholder="等待操作…" />
    </section>
  </div>
</template>

<style scoped>
.example { display: grid; gap: 28px; padding: 28px 24px; min-width: 0; }
.component-section { display: grid; gap: 20px; min-width: 0; }
.actions { display: flex; flex-wrap: wrap; gap: 20px; }
.events-section { border-top: 1px solid var(--apple-border); padding-top: 20px; min-width: 0; }
.event-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
h3 { margin: 0; font-size: 14px; }
output { color: var(--apple-secondary); font: 12px/1.6 ui-monospace, monospace; overflow-wrap: anywhere; }
.tile { padding: 20px; border-radius: 8px; background: var(--apple-surface-alt); min-width: 0; }
.scroll-demo { height: 220px; overflow: auto; padding: 16px; border: 1px solid var(--apple-border); border-radius: 8px; }
.example :deep(.apple-provider) { padding: 20px; display: grid; gap: 16px; border-radius: 8px; }
@media (max-width: 480px) { .example { padding: 24px 16px; } }
</style>`
}

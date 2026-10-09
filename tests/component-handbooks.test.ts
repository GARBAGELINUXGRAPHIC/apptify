import { describe, expect, it } from 'vitest'
import { parse, compileScript, compileTemplate } from 'vue/compiler-sfc'
import { components } from '../src'
import { catalog, componentId } from '../playground/catalog'
import { componentDocuments } from '../playground/editor/documents'
import { createPlaygroundConfig, generateComponentCode, propControl } from '../playground/editor/component-playground'
import type { ComponentDocument } from '../playground/editor/contract'

function compile(code: string) {
  const { descriptor, errors } = parse(code, { filename: 'App.vue' })
  expect(errors).toEqual([])
  const script = compileScript(descriptor, { id: 'handbook' })
  expect(compileTemplate({ source: descriptor.template!.content, filename: 'App.vue', id: 'handbook', compilerOptions: { bindingMetadata: script.bindings } }).errors).toEqual([])
}

describe('component handbooks', () => {
  it('covers the complete public registry and every gallery entry', () => {
    expect(catalog.map(item => item.name).sort()).toEqual(Object.keys(components).sort())
    expect(Object.values(componentDocuments).map(item => item.name).sort()).toEqual(Object.keys(components).sort())
    for (const item of catalog) expect(componentDocuments[componentId(item.name)].load).toBeTypeOf('function')
  })

  for (const [name, component] of Object.entries(components)) {
    it(`${name}: matches declared props, defaults and emitted events`, async () => {
      const doc = (await componentDocuments[componentId(name)].load()).default
      const runtime = component as unknown as { props?: Record<string, unknown>; emits?: string[] }
      const names = doc.props.map(prop => prop.name === 'modelValue / v-model' ? 'modelValue' : prop.name)
      expect(names.sort()).toEqual(Object.keys(runtime.props || {}).sort())
      expect(doc.events.map(event => event.name).sort()).toEqual([...(runtime.emits || [])].sort())
      const ids = [...doc.props, ...doc.events, ...doc.slots, ...doc.methods].map(entry => entry.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const entry of [...doc.props, ...doc.events, ...doc.slots, ...doc.methods]) {
        expect(entry.description.length).toBeGreaterThan(3)
        expect(entry.type).not.toBe('unknown')
      }
      for (const prop of doc.props) {
        const raw = runtime.props?.[prop.name === 'modelValue / v-model' ? 'modelValue' : prop.name]
        const definition = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as { default?: unknown; type?: unknown } : { type: raw }
        const types = Array.isArray(definition.type) ? definition.type : [definition.type]
        const value = 'default' in definition ? definition.default : types.includes(Boolean) ? false : undefined
        if (typeof value === 'function') {
          if (types.includes(Array)) expect(prop.default).toBe('[]')
          else expect(prop.default?.replace(/\s+/g, '')).toBe(String(value).replace(/\s+/g, ''))
        } else if (typeof value === 'string') {
          expect(prop.default === JSON.stringify(value) || prop.default === `'${value}'`).toBe(true)
        } else expect(prop.default).toBe(String(value))
      }
    })

    if (name === 'AppleInput') continue
    it(`${name}: compiles the default playground and all slot examples`, async () => {
      const doc = (await componentDocuments[componentId(name)].load()).default
      const config = createPlaygroundConfig(doc)
      expect(Object.keys(config.props).sort()).toEqual(doc.props.map(prop => prop.name).sort())
      compile(generateComponentCode(doc, config))
      for (const entry of doc.slots) {
        const next = createPlaygroundConfig(doc)
        next.slots[entry.name].enabled = true
        compile(generateComponentCode(doc, next))
      }
      for (const entry of doc.props) {
        if (propControl(entry).kind === 'text') config.props[entry.name].value = '</script><template>"&{{ value }}'
      }
      compile(generateComponentCode(doc, config))
    })
  }

  it('keeps read-only Progress out of v-model and preserves event payloads', async () => {
    const get = async (slug: string): Promise<ComponentDocument> => (await componentDocuments[slug].load()).default
    expect((await get('apple-progress')).events).toEqual([])
    expect((await get('apple-steps')).events.find(event => event.name === 'change')?.type).toBe('(value: number) => void')
    expect((await get('apple-breadcrumbs')).events[0].type).toContain('item: AppleItem, event: MouseEvent')
    expect((await get('apple-action-sheet')).slots[0].type).toContain('select: (item: AppleMenuItem)')
    expect((await get('apple-table')).props.find(prop => prop.name === 'page')?.default).toBe('undefined')
  })

  it('rejects malformed JSON and numeric inputs without evaluating expressions', async () => {
    const doc = (await componentDocuments['apple-table'].load()).default
    const config = createPlaygroundConfig(doc)
    config.props.rows.value = '{'
    expect(() => generateComponentCode(doc, config)).toThrow()
    config.props.rows.value = '[]'
    config.props.pageSize.value = 'window.alert(1)'
    expect(() => generateComponentCode(doc, config)).toThrow('pageSize')
  })
})

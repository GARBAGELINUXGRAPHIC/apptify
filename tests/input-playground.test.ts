import { describe, expect, it } from 'vitest'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { buildInputProps, createInputConfig, generateInputCode, resolveIconName } from '../playground/editor/input-playground'

describe('input playground copyable code', () => {
  it('compiles combined props and slots, including arbitrary user text', () => {
    const config = Object.assign(createInputConfig(), {
      type: 'number', required: true, loading: true, prefixMode: 'text', prefix: '<script>&"{{ example }}',
      suffixMode: 'text', suffix: '</template>确认', label: '"&<姓名', error: '输入错误',
      min: '0', max: '100', step: '0.01', maxlength: '20',
    })
    const code = generateInputCode(config, '</script>\n"&')
    const { descriptor, errors } = parse(code)
    expect(errors).toEqual([])
    const script = compileScript(descriptor, { id: 'input-playground' })
    expect(compileTemplate({ source: descriptor.template!.content, filename: 'App.vue', id: 'input-playground', compilerOptions: { bindingMetadata: script.bindings } }).errors).toEqual([])
    expect(code).toContain('          loading\n')
    expect(code).toContain('min="0"')
    expect(code).not.toContain('</script>\n"&')
    expect(code).toContain('export default {')
    expect(code).not.toContain('v-bind=')
    expect(code).not.toContain('<script setup>')
  })
  it('resolves icon codes, registers both icons and excludes invalid input from source', () => {
    const config = Object.assign(createInputConfig(), { prefixMode: 'icon', prefixIcon: 'mail', suffixMode: 'icon', suffixIcon: 'arrow-right' })
    const code = generateInputCode(config, '')
    expect(code).toContain("import { Mail, ArrowRight } from 'lucide-vue-next'")
    expect(code).toContain('<template #prefix><Mail')
    expect(code).toContain('<template #suffix><ArrowRight')
    expect(parse(code).errors).toEqual([])
    expect(resolveIconName('<script>')).toBeUndefined()
    config.suffixIcon = '<script>'
    expect(generateInputCode(config, '')).not.toContain('<template #suffix>')
    config.prefixMode = 'none'
    expect(generateInputCode(config, '')).not.toContain("from 'lucide-vue-next'")
  })
  it('omits inapplicable native constraints and supplies an accessible name without a label', () => {
    const config = Object.assign(createInputConfig(), { label: '', maxlength: '-1', min: '0', max: '10', step: '2' })
    expect(buildInputProps(config)).toMatchObject({ 'aria-label': '演示输入框', maxlength: undefined, min: undefined, max: undefined, step: undefined })
    const code = generateInputCode(config, 0)
    expect(code).toContain('value: 0')
    expect(code).not.toContain(':min=')
    expect(code).not.toContain('    disabled')
  })
})

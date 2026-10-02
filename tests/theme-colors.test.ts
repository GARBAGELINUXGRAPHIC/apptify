import { describe, expect, it } from 'vitest'
import { builtInThemes, createApple } from '../src/core/context'

describe('theme color identity', () => {
  it('uses the same complete semantic palette in light and dark while changing neutral surfaces', () => {
    const colors = { accent: '#0071e3', success: '#34c759', warning: '#ffaa00', danger: '#c93830', 'accent-text': '#ffffff' }
    for (const [name, color] of Object.entries(colors)) {
      expect(builtInThemes.light.tokens[name]).toBe(color)
      expect(builtInThemes.dark.tokens[name]).toBe(color)
    }
    for (const name of ['bg', 'surface', 'surface-alt', 'text', 'secondary', 'border']) {
      expect(builtInThemes.dark.tokens[name]).not.toBe(builtInThemes.light.tokens[name])
    }
  })

  it('preserves explicit custom colors in either scheme and inherits all remaining semantic colors', () => {
    const context = createApple()
    const colors = { accent: '#805ad5', success: '#268455', warning: '#ad6c10', danger: '#b73540', info: '#247ba0', custom: '#c75c86' }
    context.theme.value.register('custom-light', colors, 'light')
    context.theme.value.register('custom-dark', colors, 'dark')
    for (const theme of ['custom-light', 'custom-dark']) {
      context.theme.value.set(theme)
      for (const [name, color] of Object.entries(colors)) expect(context.theme.value.current.tokens[name]).toBe(color)
    }
    context.theme.value.register('inherited-dark', { custom: '#c75c86' }, 'dark')
    context.theme.value.set('inherited-dark')
    for (const name of ['accent', 'success', 'warning', 'danger']) {
      expect(context.theme.value.current.tokens[name]).toBe(builtInThemes.light.tokens[name])
    }
  })
})

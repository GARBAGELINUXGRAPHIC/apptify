import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { createAppleUI } from '../src'
import { AppleProvider } from '../src/components/foundation'
import { appleKey, builtInThemes, createApple, useApple } from '../src/core/context'

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('theme initialization', () => {
  it.each(['dark', 'graphite', 'rose'])('renders saved %s preferences on the first component render', savedTheme => {
    localStorage.setItem('apptify:preferences', JSON.stringify({ theme: savedTheme, motion: 'none', glass: { opacity: 73, blur: 18 } }))
    const renders: string[] = []
    const Child = defineComponent({
      setup() {
        const apple = useApple()
        return () => {
          renders.push(`${apple.theme.value.resolved}:${apple.motion.value.mode}:${apple.glass.value.opacity}`)
          return h('span')
        }
      },
    })
    const wrapper = mount(AppleProvider, {
      global: { plugins: [createAppleUI({ theme: 'light', persist: true })] },
      slots: { default: () => h(Child) },
    })
    expect(renders).toEqual([`${savedTheme}:none:73`])
    expect(wrapper.attributes('data-apple-theme')).toBe(savedTheme)
    wrapper.unmount()
  })

  it('persists per-theme colors and transparency without mutating defaults', () => {
    const apple = createApple({ theme: 'light', persist: true })
    apple.theme.value.setTokens({ accent: '#123456', border: '#d2d2d780' })
    apple.theme.value.set('dark')
    expect(apple.theme.value.current.tokens.accent).toBe(builtInThemes.dark.tokens.accent)
    apple.theme.value.setTokens({ accent: '#abcdef' })
    const restored = createApple({ persist: true })
    expect(restored.theme.value.current.tokens.accent).toBe('#abcdef')
    restored.theme.value.set('light')
    expect(restored.theme.value.current.tokens).toMatchObject({ accent: '#123456', border: '#d2d2d780' })
    expect(builtInThemes.light.tokens.accent).toBe('#0071e3')
    expect(createApple().theme.value.themes.light.tokens.accent).toBe('#0071e3')
    restored.theme.value.resetTokens()
    expect(createApple({ persist: true }).theme.value.current.tokens.border).toBe(builtInThemes.light.tokens.border)
  })

  it('propagates edited colors and resets into an inherited nested provider', async () => {
    const apple = createApple({ theme: 'light' })
    const wrapper = mount(AppleProvider, {
      global: { provide: { [appleKey as symbol]: apple } },
      slots: { default: () => h(AppleProvider, {}, () => h('span', 'Nested')) },
    })
    apple.theme.value.setTokens({ accent: '#123456' })
    await nextTick()
    expect(wrapper.findAll('.apple-provider').at(-1)?.attributes('style')).toContain('--apple-accent: #123456')
    apple.theme.value.resetTokens()
    await nextTick()
    expect(wrapper.findAll('.apple-provider').at(-1)?.attributes('style')).toContain('--apple-accent: #0071e3')
    wrapper.unmount()
  })

  it('synchronizes color edits and resets from another tab', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const apple = createApple({ theme: 'light', persist: true })
    apple.attach()
    window.dispatchEvent(new StorageEvent('storage', { key: 'apptify:preferences', newValue: JSON.stringify({ themeTokens: { light: { accent: '#123456', border: '#d2d2d780', text: 42 }, missing: { accent: 'red' } } }) }))
    expect(apple.theme.value.current.tokens).toMatchObject({ accent: '#123456', border: '#d2d2d780', text: builtInThemes.light.tokens.text })
    window.dispatchEvent(new StorageEvent('storage', { key: 'apptify:preferences', newValue: '{}' }))
    expect(apple.theme.value.current.tokens.accent).toBe(builtInThemes.light.tokens.accent)
    apple.dispose()
  })

  it('ignores saved colors when persistence is disabled', () => {
    localStorage.setItem('apptify:preferences', JSON.stringify({ themeTokens: { light: { accent: '#123456' } } }))
    expect(createApple({ theme: 'light' }).theme.value.current.tokens.accent).toBe(builtInThemes.light.tokens.accent)
  })

  it('resolves a saved system theme and reduced motion before mounting', () => {
    localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'system' }))
    const addEventListener = vi.fn()
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener, removeEventListener: vi.fn() }))
    const apple = createApple({ theme: 'light', persist: true })
    expect(apple.theme.value.resolved).toBe('dark')
    expect(apple.motion.value.reduced).toBe(true)
    expect(apple.ripple.value.enabled).toBe(false)
    expect(addEventListener).not.toHaveBeenCalled()
  })

  it.each(['{', 'null', '{"theme":"missing"}'])('keeps the default when storage contains %s', stored => {
    localStorage.setItem('apptify:preferences', stored)
    expect(createApple({ theme: 'light', persist: true }).theme.value.resolved).toBe('light')
  })

  it('keeps the default when storage is unavailable and ignores storage without persistence', () => {
    localStorage.setItem('apptify:preferences', '{"theme":"dark"}')
    expect(createApple({ theme: 'light' }).theme.value.resolved).toBe('light')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable') })
    expect(createApple({ theme: 'light', persist: true }).theme.value.resolved).toBe('light')
  })
})

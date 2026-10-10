import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createAppleUI } from '../src'
import { AppleProvider } from '../src/components/foundation'
import { createApple, useApple } from '../src/core/context'

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

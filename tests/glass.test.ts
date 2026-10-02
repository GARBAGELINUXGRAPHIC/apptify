import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { AppleProvider } from '../src/components/foundation'
import { appleKey, createApple, defaultGlassSettings, themeStyle, useApple, type AppleContext } from '../src/core/context'

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals() })

describe('glass preferences', () => {
  it('keeps precise defaults and normalizes only finite supplied values', () => {
    const app = createApple()
    expect(app.glass.value.opacity).toBe(80 / 255 * 100)
    expect(themeStyle(app)['--apple-glass-blur']).toBe('12px')
    expect(themeStyle(app)['--apple-glass-rgb']).toBe('255 255 255')
    app.theme.value.set('dark')
    expect(themeStyle(app)['--apple-glass-rgb']).toBe('0 0 0')
    app.glass.value.set({ opacity: 140, blur: 2.7 })
    expect(app.glass.value).toMatchObject({ opacity: 100, blur: 3 })
    app.glass.value.set({ opacity: -1, blur: 99 })
    expect(app.glass.value).toMatchObject({ opacity: 0, blur: 22 })
    app.glass.value.set({ opacity: NaN, blur: Infinity })
    expect(app.glass.value).toMatchObject({ opacity: 0, blur: 22 })
    app.glass.value.set({ blur: 1 })
    expect(app.glass.value.blur).toBe(2)
    app.glass.value.reset()
    expect(app.glass.value).toMatchObject(defaultGlassSettings)
    expect(Number(themeStyle(app)['--apple-glass-opacity'])).toBeCloseTo(80 / 255, 12)
  })

  it('persists with theme and motion and restores through a reload', () => {
    const first = createApple({ persist: true })
    first.theme.value.set('dark')
    first.motion.value.set('none')
    first.glass.value.set({ opacity: 63.2, blur: 19 })
    const second = createApple({ persist: true })
    second.attach()
    expect(second.theme.value.name).toBe('dark')
    expect(second.motion.value.mode).toBe('none')
    expect(second.glass.value).toMatchObject({ opacity: 63.2, blur: 19 })
    second.glass.value.reset()
    expect(JSON.parse(localStorage.getItem('apptify:preferences')!)).toEqual({ theme: 'dark', motion: 'none', glass: defaultGlassSettings })
    second.dispose()
  })

  it('accepts old preferences and ignores malformed glass fields', () => {
    for (const glass of [undefined, null, 'bad', { opacity: '99', blur: false }]) {
      localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'rose', glass }))
      const app = createApple({ persist: true })
      app.attach()
      expect(app.theme.value.name).toBe('rose')
      expect(app.glass.value).toMatchObject(defaultGlassSettings)
      app.dispose()
    }
  })

  it('synchronizes storage changes without writing back or leaking listeners', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const app = createApple({ persist: true })
    app.attach()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    window.dispatchEvent(new StorageEvent('storage', { key: 'apptify:preferences', newValue: JSON.stringify({ glass: { opacity: 77, blur: 15 } }) }))
    expect(app.glass.value).toMatchObject({ opacity: 77, blur: 15 })
    expect(write).not.toHaveBeenCalled()
    app.dispose()
    window.dispatchEvent(new StorageEvent('storage', { key: 'apptify:preferences', newValue: JSON.stringify({ glass: { opacity: 1, blur: 2 } }) }))
    expect(app.glass.value).toMatchObject({ opacity: 77, blur: 15 })
    write.mockRestore()
  })

  it('shares material preferences through nested local themes and their portals', async () => {
    const app = createApple({ theme: 'light', persist: true })
    let child: AppleContext | undefined
    const Probe = defineComponent({ setup() { child = useApple(); return () => h('span', 'Nested') } })
    const wrapper = mount(AppleProvider, {
      global: { provide: { [appleKey as symbol]: app } },
      slots: { default: () => h(AppleProvider, { theme: 'dark' }, () => h(Probe)) },
    })
    expect(child!.glass).toBe(app.glass)
    child!.glass.value.set({ opacity: 45, blur: 18 })
    await nextTick()
    const providers = wrapper.findAll('.apple-provider')
    expect(providers.map(provider => provider.attributes('data-apple-theme'))).toEqual(['light', 'dark'])
    expect(providers.every(provider => provider.attributes('style').includes('--apple-glass-opacity: 0.45') && provider.attributes('style').includes('--apple-glass-blur: 18px'))).toBe(true)
    expect(JSON.parse(localStorage.getItem('apptify:preferences')!).glass).toEqual({ opacity: 45, blur: 18 })
    app.glass.value.reset()
    await nextTick()
    expect(child!.glass.value.blur).toBe(12)
    wrapper.unmount()
  })
})

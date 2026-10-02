import { describe, expect, it, vi } from 'vitest'
import { isRef, watchEffect } from 'vue'
import { createApple, createMessageBus, createOverlayService, resolveMotion } from '../src/core/context'

describe('motion policy', () => {
  it('resolves inheritance and all caps', () => {
    expect(resolveMotion('inherit', 'auto', false)).toBe('full')
    expect(resolveMotion('inherit', 'auto', true)).toBe('reduced')
    expect(resolveMotion('full', 'none', false)).toBe('none')
    expect(resolveMotion('full', 'reduced', false)).toBe('reduced')
    expect(resolveMotion('full', 'full', true)).toBe('reduced')
    expect(resolveMotion('none', 'full', false)).toBe('none')
  })
})

describe('theme and messages', () => {
  it('exposes shared state as refs and tracks updates through destructured refs', () => {
    const app = createApple({ theme: 'light' })
    const { theme, motion, portalTarget } = app
    expect([theme, motion, portalTarget, app.overlays.entries].every(isRef)).toBe(true)
    let observed = ''
    const stop = watchEffect(() => { observed = `${theme.value.name}:${motion.value.mode}:${app.overlays.entries.value.length}` }, { flush: 'sync' })
    theme.value.set('dark')
    motion.value.set('none')
    app.notify('Saved')
    expect(observed).toBe('dark:none:1')
    stop()
    app.dispose()
  })
  it('registers arbitrary token themes and updates immediately', () => {
    const app = createApple()
    app.theme.value.register('brand', { accent: '#123456' }, 'dark')
    app.theme.value.set('brand')
    expect(app.theme.value.current.tokens.accent).toBe('#123456')
    expect(app.theme.value.current.scheme).toBe('dark')
    expect(app.theme.value.current.tokens.bg).toBeTruthy()
    expect(() => app.theme.value.set('unknown')).toThrow()
    expect(() => app.theme.value.register('system', {})).toThrow()
  })
  it('does not leak custom theme changes across apps', () => {
    const a = createApple(), b = createApple()
    a.theme.value.register('local', {accent:'#abc'})
    expect(b.theme.value.themes.local).toBeUndefined()
    a.theme.value.themes.light.tokens.accent = '#123456'
    expect(b.theme.value.themes.light.tokens.accent).toBe('#0071e3')
  })
  it('returns response values and unsubscribes', () => {
    const bus = createMessageBus()
    const listener = vi.fn((value: number) => value * 2)
    const off = bus.onMessage('save', listener)
    expect(bus.sendMessage('save', 4)).toEqual([8])
    off()
    expect(bus.sendMessage('save', 4)).toEqual([])
    expect(listener).toHaveBeenCalledTimes(1)
  })
  it('keeps old snackbar entry names scoped', () => {
    const a = createApple(), b = createApple()
    a.sendMessage('showSnackBar', {text:'Saved', type:'success'})
    expect(a.overlays.entries.value[0]?.message).toBe('Saved')
    expect(b.overlays.entries.value).toHaveLength(0)
    a.dispose()
    expect(a.overlays.entries.value).toHaveLength(0)
  })
  it('follows system theme and reduced motion changes without a reload', () => {
    const handlers = new Map<string, () => void>()
    const queries = new Map<string, {matches:boolean;addEventListener:ReturnType<typeof vi.fn>;removeEventListener:ReturnType<typeof vi.fn>}>()
    vi.stubGlobal('matchMedia', (query:string) => {
      const media={matches:false,addEventListener:vi.fn((_event:string, handler:() => void)=>handlers.set(query,handler)),removeEventListener:vi.fn()}
      queries.set(query,media);return media
    })
    const app=createApple({theme:'system'})
    app.attach()
    expect(app.theme.value.resolved).toBe('light')
    queries.get('(prefers-color-scheme: dark)')!.matches=true
    queries.get('(prefers-reduced-motion: reduce)')!.matches=true
    handlers.get('(prefers-color-scheme: dark)')!()
    expect(app.theme.value.resolved).toBe('dark')
    expect(app.motion.value.reduced).toBe(true)
    app.detach()
    expect(queries.get('(prefers-color-scheme: dark)')!.removeEventListener).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

describe('overlay service', () => {
  it('stacks, updates and resolves independently', async () => {
    const service=createOverlayService()
    const a=service.open({title:'One'}), b=service.open({title:'Two'})
    b.update({message:'Updated'})
    expect(service.entries.value[1]?.message).toBe('Updated')
    service.closeTop('accepted')
    expect(await b.result).toBe('accepted')
    expect(service.entries.value).toHaveLength(1)
    a.close(false)
    expect(await a.result).toBe(false)
  })
  it('closeTop ignores notifications and clear settles outstanding promises', async () => {
    const service=createOverlayService()
    const modal=service.open({title:'One'}), notice=service.open({kind:'snackbar',message:'hello'})
    service.closeTop(true)
    expect(await modal.result).toBe(true)
    expect(service.entries.value[0]?.kind).toBe('snackbar')
    service.clear()
    expect(await notice.result).toBeUndefined()
  })
})

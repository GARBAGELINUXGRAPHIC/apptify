import { describe, expect, it, vi } from 'vitest'
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
  it('registers arbitrary token themes and updates immediately', () => {
    const app = createApple()
    app.theme.register('brand', { accent: '#123456' }, 'dark')
    app.theme.set('brand')
    expect(app.theme.current.tokens.accent).toBe('#123456')
    expect(app.theme.current.scheme).toBe('dark')
    expect(app.theme.current.tokens.bg).toBeTruthy()
    expect(() => app.theme.set('unknown')).toThrow()
    expect(() => app.theme.register('system', {})).toThrow()
  })
  it('does not leak custom theme changes across apps', () => {
    const a = createApple(), b = createApple()
    a.theme.register('local', {accent:'#abc'})
    expect(b.theme.themes.local).toBeUndefined()
    a.theme.themes.light.tokens.accent = '#123456'
    expect(b.theme.themes.light.tokens.accent).toBe('#0071e3')
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
    expect(a.overlays.entries[0]?.message).toBe('Saved')
    expect(b.overlays.entries).toHaveLength(0)
    a.dispose()
    expect(a.overlays.entries).toHaveLength(0)
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
    expect(app.theme.resolved).toBe('light')
    queries.get('(prefers-color-scheme: dark)')!.matches=true
    queries.get('(prefers-reduced-motion: reduce)')!.matches=true
    handlers.get('(prefers-color-scheme: dark)')!()
    expect(app.theme.resolved).toBe('dark')
    expect(app.motion.reduced).toBe(true)
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
    expect(service.entries[1]?.message).toBe('Updated')
    service.closeTop('accepted')
    expect(await b.result).toBe('accepted')
    expect(service.entries).toHaveLength(1)
    a.close(false)
    expect(await a.result).toBe(false)
  })
  it('closeTop ignores notifications and clear settles outstanding promises', async () => {
    const service=createOverlayService()
    const modal=service.open({title:'One'}), notice=service.open({kind:'snackbar',message:'hello'})
    service.closeTop(true)
    expect(await modal.result).toBe(true)
    expect(service.entries[0]?.kind).toBe('snackbar')
    service.clear()
    expect(await notice.result).toBeUndefined()
  })
})

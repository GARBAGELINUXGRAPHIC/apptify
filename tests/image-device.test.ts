import { afterEach, describe, expect, it, vi } from 'vitest'
import { isTouchImageDevice } from '../src/core/image-geometry'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('image touch capability detection', () => {
  it('detects touch on a device whose primary pointer is a mouse', () => {
    vi.stubGlobal('navigator', { maxTouchPoints: 5 })
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    expect(isTouchImageDevice()).toBe(true)
  })
  it('uses any coarse pointer as the fallback', () => {
    vi.stubGlobal('navigator', { maxTouchPoints: 0 })
    const matchMedia = vi.fn(() => ({ matches: true }))
    vi.stubGlobal('matchMedia', matchMedia)
    expect(isTouchImageDevice()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(any-pointer: coarse)')
  })
  it('does not treat a narrow viewport as a touch device when matchMedia is unavailable', () => {
    vi.stubGlobal('navigator', { maxTouchPoints: 0 })
    vi.stubGlobal('innerWidth', 320)
    vi.stubGlobal('matchMedia', undefined)
    expect(isTouchImageDevice()).toBe(false)
  })
  it('can be evaluated during server rendering', () => {
    vi.stubGlobal('window', undefined)
    expect(isTouchImageDevice()).toBe(false)
  })
})

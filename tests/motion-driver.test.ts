import { afterEach, describe, expect, it, vi } from 'vitest'
import { MotionDriver, sampleSpring } from '../src/core/motion-driver'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('independent motion channels', () => {
  it('invalidates deferred work only on its own channel and discards it on disposal', () => {
    const driver = new MotionDriver()
    const firstPage = driver.prepare('page'), rotation = driver.prepare('rotation')
    const nextPage = driver.prepare('page')
    expect(firstPage()).toBe(false)
    expect(nextPage()).toBe(true)
    expect(rotation()).toBe(true)
    driver.cancel()
    expect(nextPage()).toBe(false)
    expect(rotation()).toBe(false)
  })
  it('samples the same position and velocity regardless of frame frequency', () => {
    const whole = sampleSpring(0, 12, 100, .4, 24)
    for (const frames of [24, 48, 96]) {
      let value = 0, velocity = 12
      for (let i = 0; i < frames; i++) ({ value, velocity } = sampleSpring(value, velocity, 100, .4 / frames, 24))
      expect(value).toBeCloseTo(whole.value, 9)
      expect(velocity).toBeCloseTo(whole.velocity, 9)
    }
  })
  it('accumulates high frequency input and carries live velocity through retargets and reversals', async () => {
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.stubGlobal('requestAnimationFrame', () => 1); vi.stubGlobal('cancelAnimationFrame', vi.fn())
    const driver = new MotionDriver(), update = vi.fn()
    const first = driver.to('wheel', [0], [100], update)
    now = 50
    const before = driver.sample('wheel')!
    const second = driver.to('wheel', [0], [150], update)
    expect(await first).toBe(false)
    expect(driver.sample('wheel')!.value[0]).toBeCloseTo(before.value[0], 9)
    expect(driver.sample('wheel')!.velocity[0]).toBeCloseTo(before.velocity[0], 9)
    for (let i = 0; i < 100; i++) {
      const target = driver.sample('wheel')!.target[0] + .5
      void driver.to('wheel', [0], [target], update)
    }
    expect(driver.sample('wheel')!.target[0]).toBe(200)
    now = 100
    const reversing = driver.sample('wheel')!
    void driver.to('wheel', [0], [-50], update)
    expect(driver.sample('wheel')!.value[0]).toBeCloseTo(reversing.value[0], 9)
    expect(driver.sample('wheel')!.velocity[0]).toBeCloseTo(reversing.velocity[0], 9)
    expect(await second).toBe(false)
    driver.finish()
    expect(update).toHaveBeenLastCalledWith([-50])
    driver.cancel()
  })
  it('cancels one channel while another continues, then releases the animation frame on disposal', async () => {
    vi.stubGlobal('requestAnimationFrame', () => 42)
    const cancelFrame = vi.fn(); vi.stubGlobal('cancelAnimationFrame', cancelFrame)
    const driver = new MotionDriver(), pose = vi.fn(), page = vi.fn()
    const posed = driver.to('pose', [1], [2], pose)
    const paged = driver.to('page', [0], [400], page)
    driver.cancel('pose')
    expect(await posed).toBe(false)
    expect(driver.has('page')).toBe(true)
    driver.finish()
    expect(await paged).toBe(true)
    expect(page).toHaveBeenLastCalledWith([400])
    expect(cancelFrame).toHaveBeenCalledWith(42)
    driver.cancel()
    expect(driver.active).toBe(false)
  })
})

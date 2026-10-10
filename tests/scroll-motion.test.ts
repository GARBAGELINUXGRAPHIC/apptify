// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cancelMotionScroll, scrollToWithMotion } from '../src/core/scroll-motion'
let callbacks: Map<number, FrameRequestCallback>, now: number, id: number, target: HTMLElement
beforeEach(() => {
  callbacks = new Map(); now = 0; id = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.set(++id, callback); return id })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => callbacks.delete(key))
  target = document.createElement('div')
  target.scrollTo = vi.fn(options => { target.scrollTop = (options as ScrollToOptions).top! })
})
afterEach(() => { cancelMotionScroll(target); vi.restoreAllMocks(); vi.unstubAllGlobals() })
function frame(time: number) { now = time; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(time)) }
it('animates downward and caps a long distance at two seconds', async () => {
  const run = scrollToWithMotion(target, 90000)
  frame(1000); expect(target.scrollTop).toBe(78750)
  frame(2000); expect(target.scrollTop).toBe(90000)
  await run.finished; expect(callbacks.size).toBe(0)
})
it('changes duration with distance before reaching the cap', async () => {
  let run = scrollToWithMotion(target, 100)
  frame(200); await run.finished; expect(target.scrollTop).toBe(100)
  run = scrollToWithMotion(target, 500)
  frame(400); expect(target.scrollTop).toBeLessThan(500)
  frame(600); await run.finished; expect(target.scrollTop).toBe(500)
})
it('replaces a different destination and settles the previous promise', async () => {
  const previous = scrollToWithMotion(target, 90000)
  frame(200)
  const replacement = scrollToWithMotion(target, 0)
  await previous.finished; expect(callbacks.size).toBe(1)
  expect(scrollToWithMotion(target, 0)).toBe(replacement)
  frame(2200); await replacement.finished; expect(target.scrollTop).toBe(0)
})
it('user input cancels an anchor without forcing its final position', async () => {
  const run = scrollToWithMotion(target, 90000)
  frame(100); const stopped = target.scrollTop
  window.dispatchEvent(new Event('wheel'))
  await run.finished; frame(2000); expect(target.scrollTop).toBe(stopped)
  expect(callbacks.size).toBe(0)
})
it('skips animation when motion is disabled', async () => {
  const run = scrollToWithMotion(target, 90000, false)
  await run.finished; expect(target.scrollTop).toBe(90000)
  expect(callbacks.size).toBe(0)
  expect(target.scrollTo).toHaveBeenCalledWith({ top: 90000, behavior: 'instant' })
})

it('follows a moving anchor without extending the original deadline', async () => {
  let top = 90000
  const run = scrollToWithMotion(target, () => top)
  frame(1000); expect(target.scrollTop).toBe(78750)
  top += 58
  frame(2000); await run.finished
  expect(target.scrollTop).toBe(90058); expect(callbacks.size).toBe(0)
})

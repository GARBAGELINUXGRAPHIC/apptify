// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { AppleBackTop } from '../src/components/content'
let callbacks: Map<number, FrameRequestCallback>, now: number, id: number
const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => {
  now = 0; id = 0; callbacks = new Map()
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callbacks.set(++id, callback); return id })
  vi.stubGlobal('cancelAnimationFrame', (key: number) => callbacks.delete(key))
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn(function(this: HTMLElement, options: ScrollToOptions) { this.scrollTop = options.top ?? this.scrollTop }) })
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = '' })
async function fixture(distance = 90000) {
  const target = document.createElement('div'); target.id = 'area'; target.scrollTop = distance; document.body.append(target)
  const wrapper = mount(AppleBackTop, { props: { target: '#area', threshold: 0, motion: 'full' } }); wrappers.push(wrapper)
  await nextTick()
  return { target, wrapper }
}
function frame(time: number) { now = time; const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(time)) }
it('finishes a long distance at the exact 2000ms deadline and never stacks callbacks', async () => {
  const { target, wrapper } = await fixture()
  await wrapper.get('button').trigger('click'); expect(callbacks.size).toBe(1)
  frame(1000); expect(target.scrollTop).toBe(11250)
  await wrapper.get('button').trigger('click'); expect(callbacks.size).toBe(1)
  frame(1999); expect(target.scrollTop).toBeGreaterThan(0)
  frame(2000); expect(target.scrollTop).toBe(0); expect(callbacks.size).toBe(0)
})
it('uses a shorter duration for a short distance', async () => {
  const { target, wrapper } = await fixture(100)
  await wrapper.get('button').trigger('click'); frame(100); expect(target.scrollTop).toBe(12.5)
  frame(200); expect(target.scrollTop).toBe(0); expect(callbacks.size).toBe(0)
})
for (const event of ['wheel', 'touchstart', 'keydown']) it(`clears frame work after ${event}`, async () => {
  const { target, wrapper } = await fixture()
  await wrapper.get('button').trigger('click'); frame(200)
  window.dispatchEvent(event === 'keydown' ? new KeyboardEvent(event, { key: 'ArrowDown' }) : new Event(event))
  const stopped = target.scrollTop; frame(2000); expect(target.scrollTop).toBe(stopped); expect(callbacks.size).toBe(0)
})
it('cleans up on unmount, target changes and disabled changes', async () => {
  const { target, wrapper } = await fixture()
  await wrapper.get('button').trigger('click'); frame(200)
  await wrapper.setProps({ disabled: true }); expect(callbacks.size).toBe(0)
  await wrapper.setProps({ disabled: false }); await wrapper.get('button').trigger('click')
  await wrapper.setProps({ target: '#missing' }); expect(callbacks.size).toBe(0)
  await wrapper.setProps({ target: '#area' }); await wrapper.get('button').trigger('click')
  wrapper.unmount(); expect(callbacks.size).toBe(0)
  const stopped = target.scrollTop; window.dispatchEvent(new Event('wheel')); frame(2000); expect(target.scrollTop).toBe(stopped)
})

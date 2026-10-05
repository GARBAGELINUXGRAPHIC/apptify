import { afterEach, expect, it, vi } from 'vitest'
import { createPaperStory } from '../playground/components/not-found-paper-story'
const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, 'animate')
afterEach(() => { vi.restoreAllMocks(); if (originalAnimate) Object.defineProperty(Element.prototype, 'animate', originalAnimate); else delete (Element.prototype as any).animate })
it('keeps the squirrel visible, releases the drifting acorns and masks drifting resets geometrically', () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  for (const part of ['camera','squirrel','drifters','actor-shadow','tail','head','body','front-foot','arm','cradle','held-acorn','eyelid','brow','splash','breath','current']) {
    const el = document.createElementNS(svg.namespaceURI, 'g'); el.setAttribute('data-part', part); svg.append(el)
  }
  for(let i=0;i<5;i++) { const el = document.createElementNS(svg.namespaceURI,'g');el.setAttribute('data-drifter',String(i));svg.append(el) }
  const recorded: {id: string; frames: any[]; cancel: ReturnType<typeof vi.fn>}[] = []
  if (!Element.prototype.animate) Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: () => {} })
  vi.spyOn(Element.prototype,'animate').mockImplementation(function(frames: any) {
    const animation = {id:'', frames, cancel:vi.fn(), pause:vi.fn(), play:vi.fn(), playState:'running', currentTime:0, onfinish:null}
    recorded.push(animation); return animation as any
  })
  const story = createPaperStory(svg, document.createElement('div'), true, vi.fn())
  const frames = (name:string) => recorded.find(a=>a.id===`paper-story-${name}`)!.frames
  expect(frames('squirrel').every(f=>f.opacity===undefined || f.opacity===1)).toBe(true)
  expect(frames('release')[0].visibility).toBe('hidden')
  expect(frames('release').at(-1).visibility).toBe('visible')
  expect(frames('squirrel').length).toBeGreaterThan(40)
  for(const animation of recorded) {
    if(animation.id.startsWith('paper-loop-acorn')) expect(animation.frames.every(f=>f.opacity===undefined)).toBe(true)
    const offsets = animation.frames.map(f=>f.offset).filter(v=>v!==undefined)
    expect(offsets).toEqual([...offsets].sort((a,b)=>a-b))
  }
  story.dispose(); expect(recorded.every(a=>a.cancel.mock.calls.length===1)).toBe(true)
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import { choosePopupSide, applyPopupSide, mountFieldPopup, updateFieldPopup, FieldPopupPlacement } from '../src/core/popup-placement'
const viewport = { width: 800, height: 600 }, size = { width: 200, height: 180 }
describe('live popup placement', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.restoreAllMocks() })
  it('flips to available space and returns to preferred placement', () => {
    expect(choosePopupSide('bottom', { top: 480, bottom: 520, left: 20, right: 80 }, size, viewport)).toBe('top')
    expect(choosePopupSide('bottom', { top: 100, bottom: 140, left: 20, right: 80 }, size, viewport)).toBe('bottom')
    expect(choosePopupSide('top', { top: 30, bottom: 70, left: 20, right: 80 }, size, viewport)).toBe('bottom')
    expect(choosePopupSide('right', { top: 200, bottom: 240, left: 700, right: 740 }, size, viewport)).toBe('left')
  })
  it('updates the closing direction after scroll without remounting', () => {
    const anchor = document.createElement('div'), menu = document.createElement('div'); anchor.append(menu); document.body.append(anchor)
    let top = 50
    vi.spyOn(anchor, 'getBoundingClientRect').mockImplementation(() => ({ top, bottom: top + 40, left: 0, right: 200, height: 40, width: 200, x: 0, y: top, toJSON() {} }))
    Object.defineProperty(menu, 'scrollHeight', { value: 180 }); Object.defineProperty(menu, 'offsetWidth', { value: 200 }); Object.defineProperty(menu, 'offsetHeight', { value: 180 })
    mountFieldPopup(menu)
    expect(menu.dataset.placement).toBe('bottom')
    top = window.innerHeight - 60; document.dispatchEvent(new Event('scroll'))
    expect(menu.dataset.placement).toBe('top'); expect(parseFloat(menu.style.top)).toBe(top - 180 - 8); expect(menu.style.getPropertyValue('--apple-popup-y')).toBe('8px')
    updateFieldPopup(menu) // same operation used immediately before leave
    expect(menu.dataset.placement).toBe('top')
    menu.remove()
    ;(FieldPopupPlacement as any).unmounted(menu)
    top = 50; document.dispatchEvent(new Event('scroll'))
    expect(menu.dataset.placement).toBe('top')
  })
  it('uses opposite translation and matching origins for all four sides', () => {
    const menu = document.createElement('div')
    for (const [side, origin, x, y] of [['top','center bottom','0px','8px'],['bottom','center top','0px','-8px'],['left','right center','8px','0px'],['right','left center','-8px','0px']] as const) {
      applyPopupSide(menu, side)
      expect(menu.style.transformOrigin).toBe(origin); expect(menu.style.getPropertyValue('--apple-popup-x')).toBe(x); expect(menu.style.getPropertyValue('--apple-popup-y')).toBe(y)
    }
  })
})

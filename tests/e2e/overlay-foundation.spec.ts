import { expect, test, type Page } from '@playwright/test'

const surfaces = '.apple-field-menu:visible, .apple-date-menu:visible, .apple-popover:visible, .apple-modal:visible'
async function open(page: Page, kind: string, long = false) {
  await page.goto(`/tests/e2e/fixtures/overlay-foundation.html?kind=${kind}${long ? '&long' : ''}`)
  const selector = kind === 'color' ? '.apple-color-picker' : ['date', 'time'].includes(kind) ? '.apple-field__icon' : ['select', 'autocomplete'].includes(kind) ? '[role=combobox]' : 'button'
  await page.locator(selector).first().click()
  const panel = page.locator(surfaces).first()
  await expect(panel).toBeVisible()
  await page.waitForTimeout(380)
  return panel
}

for (const width of [390, 1280]) for (const kind of ['select', 'autocomplete', 'color', 'date', 'time', 'popover', 'menu', 'dialog', 'drawer', 'sheet']) {
  test(`${kind} uses the ${width}px viewport beyond a transformed, clipping container`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    const panel = await open(page, kind)
    const result = await panel.evaluate(el => {
      const rect = el.getBoundingClientRect(), port = document.querySelector('.container')!.getBoundingClientRect()
      const x = Math.min(rect.right - 10, Math.max(rect.left + 10, port.right + 10))
      const y = Math.min(rect.bottom - 10, Math.max(rect.top + 10, port.bottom + 10))
      return { width: rect.width, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, portWidth: port.width, hit: el.contains(document.elementFromPoint(x, y)) }
    })
    expect(result.left).toBeGreaterThanOrEqual(-.5)
    expect(result.right).toBeLessThanOrEqual(width + .5)
    expect(result.top).toBeGreaterThanOrEqual(-.5)
    expect(result.bottom).toBeLessThanOrEqual(800.5)
    if (!['select', 'autocomplete'].includes(kind)) expect(result.width).toBeGreaterThan(result.portWidth + 20)
    expect(result.hit).toBe(true)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  })
}

for (const kind of ['select', 'autocomplete', 'popover', 'menu', 'dialog', 'drawer', 'sheet']) {
  test(`${kind} has one scrolling surface and retains its offset during placement and updates`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 })
    const panel = await open(page, kind, true)
    const scrolls = () => panel.evaluate(el => [el, ...el.querySelectorAll('*')].filter(node => {
      const box = node as HTMLElement
      return /auto|scroll/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight + 2
    }).map(el => el.className))
    expect(await scrolls()).toHaveLength(1)
    const scroll = panel.locator('[data-apple-popup-scroll], .apple-modal-body').first()
    const target = await scroll.count() ? scroll : panel
    await target.hover()
    await page.mouse.wheel(0, 160)
    await expect.poll(() => target.evaluate(el => el.scrollTop)).toBeGreaterThan(80)
    const before = await target.evaluate(el => el.scrollTop)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('resize'))
      document.querySelector('.container')!.dispatchEvent(new Event('scroll'))
      ;(window as any).overlayHarness.change()
    })
    await page.setViewportSize({ width: 920, height: 650 })
    await page.waitForTimeout(380)
    expect(await target.evaluate(el => el.scrollTop)).toBeCloseTo(before, 0)
    expect(await scrolls()).toHaveLength(1)
    expect(await page.locator('.container').evaluate(el => el.scrollTop)).toBe(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })
}

for (const kind of ['select', 'autocomplete', 'color', 'date', 'popover']) {
  test(`${kind} never flashes an unclipped full surface during repeated enter/leave reversals`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 })
    await page.goto(`/tests/e2e/fixtures/overlay-foundation.html?kind=${kind}`)
    const frames = await page.evaluate(async kind => {
      const trigger = document.querySelector<HTMLElement>(kind === 'color' ? '.apple-color-picker' : kind === 'date' ? '.apple-field__icon' : ['select', 'autocomplete'].includes(kind) ? '[role=combobox]' : 'button')!
      const read = () => {
        const el = document.querySelector<HTMLElement>('.apple-field-menu, .apple-date-menu, .apple-popover')
        if (!el || getComputedStyle(el).display === 'none') return null
        const css = getComputedStyle(el)
        return { opacity: Number(css.opacity), shadow: css.boxShadow, clip: css.clipPath, height: el.offsetHeight }
      }
      trigger.focus({ preventScroll: true })
      const runs = []
      for (const action of ['open', 'close', 'open', 'close', 'open', 'close']) {
        if (action === 'close') trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        else if (kind === 'autocomplete') trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
        else trigger.click()
        await Promise.resolve(); await Promise.resolve()
        const values = [], start = performance.now()
        do { const value = read(); if (value) values.push(value); await new Promise(requestAnimationFrame) } while (performance.now() - start < 85)
        runs.push({ action, values })
      }
      return runs
    }, kind)
    expect(frames[0].values[0].opacity).toBeLessThan(.01)
    for (let run = 0; run < frames.length; run++) {
      const { action, values } = frames[run]
      expect(values.length).toBeGreaterThan(1)
      for (let i = 0; i < values.length; i++) {
        expect(values[i].clip).toBe('none')
        expect(values[i].shadow).not.toBe('none')
        if (i) expect((values[i].opacity - values[i - 1].opacity) * (action === 'open' ? 1 : -1)).toBeGreaterThanOrEqual(-.002)
      }
      if (run) expect(Math.abs(values[0].opacity - frames[run - 1].values.at(-1)!.opacity)).toBeLessThan(.2)
    }
    await expect(page.locator(surfaces)).toHaveCount(0)
  })
}

for (const kind of ['dialog', 'drawer', 'sheet', 'popover']) test(`${kind} preserves the panel and its scroll position when a close is reversed`, async ({ page }) => {
  const panel = await open(page, kind, true)
  const scroller = kind === 'popover' ? panel : panel.locator('.apple-modal-body')
  await scroller.evaluate(el => { el.scrollTop = 130 })
  const before = await panel.evaluateHandle(el => el)
  const progress = await page.evaluate(async kind => {
    const sample = () => {
      const element = document.querySelector(kind === 'popover' ? '.apple-popover' : '.apple-overlay-backdrop')!
      const css = getComputedStyle(element)
      return Number(kind === 'popover' ? css.opacity : css.getPropertyValue('--apple-modal-progress'))
    }
    ;(window as any).overlayHarness.toggle(false)
    await new Promise(resolve => setTimeout(resolve, 70))
    // Pause at an exact rendered frame so compositor clock drift between the
    // read and Vue's update cannot masquerade as a discontinuity in WebKit.
    document.querySelector(kind === 'popover' ? '.apple-popover' : '.apple-overlay-backdrop')!.getAnimations().forEach(animation => animation.pause())
    await new Promise(requestAnimationFrame)
    const closing = sample()
    ;(window as any).overlayHarness.toggle(true)
    await Promise.resolve(); await Promise.resolve()
    const reopened = sample(), frames = []
    for (let i = 0; i < 24; i++) { frames.push(sample()); await new Promise(requestAnimationFrame) }
    return { closing, reopened, frames }
  }, kind)
  expect(progress.closing).toBeGreaterThan(.01)
  expect(progress.closing).toBeLessThan(.99)
  expect(Math.abs(progress.reopened - progress.closing)).toBeLessThan(.03)
  for (let i = 1; i < progress.frames.length; i++) expect(progress.frames[i]).toBeGreaterThanOrEqual(progress.frames[i - 1] - .001)
  await page.waitForTimeout(400)
  expect(await panel.evaluate((el, previous) => el === previous, before)).toBe(true)
  expect(await scroller.evaluate(el => el.scrollTop)).toBe(130)
  if (kind !== 'popover') expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('the same shadow surrounds the panel during motion and after completion', async ({ page }, info) => {
  await page.setViewportSize({ width: 800, height: 650 })
  await page.goto('/tests/e2e/fixtures/overlay-foundation.html?kind=color')
  await page.locator('.apple-color-picker').click()
  const panel = page.locator('.apple-color-menu')
  await panel.evaluate(el => {
    const animation = el.getAnimations()[0]
    animation.pause(); animation.currentTime = 150
  })
  await page.screenshot({ path: info.outputPath('opening-shadow.png') })
  const shadow = await panel.evaluate(el => getComputedStyle(el).boxShadow)
  await panel.evaluate(el => el.getAnimations().forEach(animation => animation.finish()))
  await expect.poll(() => panel.evaluate(el => el.getAnimations().length)).toBe(0)
  await page.screenshot({ path: info.outputPath('settled-shadow.png') })
  expect(await panel.evaluate(el => getComputedStyle(el).boxShadow)).toBe(shadow)
  expect(await panel.evaluate(el => getComputedStyle(el).clipPath)).toBe('none')
})

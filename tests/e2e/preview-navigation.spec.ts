import { expect, test, webkit, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

async function openPhoto(page: Page, hasTouch: boolean, id = 'origin') {
  await page.locator(`#${id} .apple-image__trigger`).dispatchEvent('click')
  const viewer = page.locator('.apple-image-viewer').last()
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  return viewer
}

// Sample actual browser frames across the return, DOM handoff and navigation fade.
async function sampleClose(page: Page, dismiss = false) {
  return page.evaluate(async dismiss => {
    const nav = document.querySelector('#page-nav .apple-navibar__bar')!
    const aside = document.querySelector('#page-aside')!
    const thumbnail = document.querySelector('#origin img')!
    const samples = [], start = performance.now()
    if (dismiss) document.querySelector('.apple-viewer-stage')!.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', clientX: 195, clientY: 650, button: 0, bubbles: true }))
    else document.querySelector('.apple-image-viewer')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    do {
      await new Promise(requestAnimationFrame)
      const viewer = document.querySelector('.apple-image-viewer')
      const frame = viewer?.querySelector('.apple-viewer-return-photo,.apple-viewer-canvas')
      const rect = frame?.getBoundingClientRect()
      samples.push({
        time: performance.now() - start, viewer: !!viewer,
        z: viewer ? Number(getComputedStyle(viewer).zIndex) : null,
        nav: Number(getComputedStyle(nav).opacity), aside: Number(getComputedStyle(aside).opacity),
        thumbnail: Number(getComputedStyle(thumbnail).opacity),
        navY: new DOMMatrixReadOnly(getComputedStyle(nav).transform).m42,
        width: rect?.width ?? null,
      })
    } while (performance.now() - start < 550)
    return samples
  }, dismiss)
}

for (const hasTouch of [false, true]) {
  for (const overlap of ['clear', 'nav', 'aside', 'covered']) {
    test(`navigation fades in during image return frame by frame: touch=${hasTouch}, overlap=${overlap}`, async ({ browser, baseURL }, testInfo) => {
      const context = await browser.newContext({ baseURL, hasTouch, viewport: { width: hasTouch ? 390 : 960, height: 900 } })
      const page = await context.newPage()
      try {
        await page.goto(`/tests/e2e/fixtures/preview-navigation.html?overlap=${overlap}`)
        const before = await page.locator('#origin').boundingBox()
        await openPhoto(page, hasTouch)
        await expect(page.locator('#page-nav')).toHaveAttribute('inert', '')
        await expect(page.locator('#page-aside')).toHaveCSS('opacity', '0')
        const frames = await sampleClose(page)
        await testInfo.attach('painted-frame-samples', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
        const returning = frames.filter(frame => frame.viewer)
        expect(returning.length).toBeGreaterThan(5)
        for (let i = 1; i < returning.length; i++) expect(returning[i].width!).toBeLessThanOrEqual(returning[i - 1].width! + .1)
        expect(returning.every(frame => frame.z === 30 && frame.thumbnail === 0)).toBe(true)
        expect(returning.some(frame => frame.navY > -12 && frame.navY < 0)).toBe(true)
        const restored = frames.filter(frame => !frame.viewer)
        expect(returning.some(frame => frame.nav > 0 && frame.nav < 1)).toBe(true)
        expect(restored[0].nav).toBeCloseTo(1, 2)
        expect(restored.every(frame => frame.thumbnail === 1)).toBe(true)
        for (const surface of ['nav', 'aside'] as const) {
          expect(returning.filter(frame => frame[surface] > 0 && frame[surface] < 1).length).toBeGreaterThanOrEqual(3)
          for (let i = 1; i < frames.length; i++) {
            expect(frames[i][surface]).toBeGreaterThanOrEqual(frames[i - 1][surface])
            expect(frames[i][surface] - frames[i - 1][surface]).toBeLessThan(.5)
          }
          expect(restored.at(-1)![surface]).toBe(1)
        }
        expect(await page.locator('#origin').boundingBox()).toEqual(before)
      } finally { await context.close() }
    })
  }

  test(`preview navigation survives reopen, stacking and unmount: touch=${hasTouch}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, hasTouch, viewport: { width: 960, height: 900 } })
    const page = await context.newPage()
    try {
      await page.goto('/tests/e2e/fixtures/preview-navigation.html?overlap=nav&controlled')
      await openPhoto(page, hasTouch)
      await page.evaluate(async () => {
        document.querySelector<HTMLButtonElement>('.apple-image-viewer [aria-label="关闭图片预览"]')!.click()
        await new Promise(requestAnimationFrame)
        document.querySelector<HTMLButtonElement>('#origin .apple-image__trigger')!.click()
      })
      await expect(page.locator('.apple-image-viewer')).toHaveCount(1)
      await expect(page.locator('.apple-image-viewer')).toHaveAttribute('data-phase', 'open')
      await expect(page.locator('#page-nav .apple-navibar__bar')).toHaveCSS('opacity', '0')
      await openPhoto(page, hasTouch, 'second')
      await page.locator('.apple-image-viewer').last().getByRole('button', { name: '关闭图片预览' }).click()
      await expect(page.locator('.apple-image-viewer')).toHaveCount(1)
      await expect(page.locator('#page-nav')).toHaveAttribute('inert', '')
      await page.locator('#remove').dispatchEvent('click')
      await expect(page.locator('.apple-image-viewer')).toHaveCount(0)
      await expect(page.locator('#page-nav .apple-navibar__bar')).toHaveCSS('opacity', '1')
      await expect(page.locator('#page-nav')).not.toHaveAttribute('inert')
      await page.locator('#dialog').click()
      await expect(page.locator('.apple-modal-presence-enter-active')).toHaveCount(0)
      const viewer = await openPhoto(page, hasTouch, 'dialog-photo')
      await expect(page.locator('#dialog-nav')).toHaveAttribute('inert', '')
      await expect(page.locator('#page-nav .apple-navibar__bar')).toHaveCSS('opacity', '1')
      await expect(page.locator('#page-aside')).toHaveCSS('opacity', '1')
      await viewer.getByRole('button', { name: '关闭图片预览' }).click()
      await expect(viewer).toHaveCount(0)
      await expect(page.locator('#dialog-nav')).not.toHaveAttribute('inert')
    } finally { await context.close() }
  })
}

test('touch dismissal restores navigation as the return starts after dragging and cancellation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, hasTouch: true, viewport: { width: 390, height: 900 } })
  const page = await context.newPage()
  try {
    await page.goto('/tests/e2e/fixtures/preview-navigation.html?overlap=nav')
    const viewer = await openPhoto(page, true), stage = viewer.locator('.apple-viewer-stage')
    const pointer = { pointerId: 7, pointerType: 'touch', clientX: 195, button: 0, bubbles: true }
    for (const cancelled of [true, false]) {
      await stage.dispatchEvent('pointerdown', { ...pointer, clientY: 350 })
      await stage.dispatchEvent('pointermove', { ...pointer, clientY: 650 })
      expect(await viewer.locator('.apple-viewer-backdrop').evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.5)
      await expect(page.locator('#page-nav .apple-navibar__bar')).toHaveCSS('opacity', '0')
      await expect(page.locator('#page-aside')).toHaveCSS('opacity', '0')
      if (cancelled) {
        await stage.dispatchEvent('pointercancel', { ...pointer, clientY: 650 })
        await expect(viewer).toHaveAttribute('data-phase', 'open')
      }
    }
    const frames = await sampleClose(page, true)
    expect(frames.filter(frame => frame.viewer).every(frame => frame.z === 30)).toBe(true)
    expect(frames.some(frame => frame.viewer && frame.nav > 0 && frame.nav < 1)).toBe(true)
    expect(frames.at(-1)!.nav).toBe(1)
  } finally { await context.close() }
})

for (const motion of ['none', 'reduced']) {
  test(`navigation does not animate with ${motion} motion`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/preview-navigation.html?motion=${motion}`)
    const viewer = await openPhoto(page, false)
    await viewer.getByRole('button', { name: '关闭图片预览' }).click()
    await expect(viewer).toHaveCount(0)
    await expect(page.locator('#page-nav .apple-navibar__bar')).toHaveCSS('transition-duration', '0s')
    await expect(page.locator('#page-aside')).toHaveCSS('opacity', '1')
  })
}

// Deterministic screenshots complement the live rAF assertions above. Only the
// test freezes animations; every screenshot uses the real DOM, blur and clipping.
async function captureFrames(page: Page, hasTouch: boolean, name: string) {
  await openPhoto(page, hasTouch)
  await expect(page.locator('#page-aside')).toHaveCSS('opacity', '0')
  await page.evaluate(() => {
    const state = window as unknown as { flights: Animation[]; fade: Animation[] }
    state.flights = []; state.fade = []
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args)
      if (this.closest('.apple-image-viewer')) { animation.pause(); state.flights.push(animation) }
      return animation
    }
    document.querySelector('.apple-image-viewer')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  })
  await expect.poll(() => page.evaluate(() => (window as unknown as { flights: Animation[] }).flights.length)).toBeGreaterThan(0)
  const path = `/tmp/apptify-checks/preview-navigation/${name}`
  await mkdir(path, { recursive: true })
  const samples = []
  await page.evaluate(async () => {
    const state = window as unknown as { fade: Animation[] }
    state.fade = ['#page-nav .apple-navibar__bar', '#page-aside'].flatMap(selector => document.querySelector(selector)!.getAnimations())
    state.fade.forEach(animation => animation.pause())
    await Promise.all(state.fade.map(animation => animation.ready))
    state.fade.forEach(animation => { animation.currentTime = 0 })
  })
  for (const time of [0, 50, 100, 200, 299]) {
    await page.evaluate(time => { const state = window as unknown as { flights: Animation[]; fade: Animation[] }; [...state.flights, ...state.fade].forEach(animation => { animation.currentTime = time }) }, time)
    await page.screenshot({ path: `${path}/return-${time}.png` })
    samples.push({ phase: 'return', time })
  }
  await page.evaluate(async () => {
    const state = window as unknown as { flights: Animation[]; fade: Animation[] }
    state.flights.forEach(animation => animation.finish()); state.fade.forEach(animation => animation.finish())
    while (document.querySelector('.apple-image-viewer')) await new Promise(requestAnimationFrame)
    state.fade = ['#page-nav .apple-navibar__bar', '#page-aside'].flatMap(selector => document.querySelector(selector)!.getAnimations())
    state.fade.forEach(animation => { animation.pause(); animation.currentTime = 0 })
  })
  for (const time of [0, 35, 70, 140]) {
    await page.evaluate(time => (window as unknown as { fade: Animation[] }).fade.forEach(animation => { animation.currentTime = time }), time)
    await page.screenshot({ path: `${path}/navigation-${time}.png` })
    samples.push({ phase: 'navigation', time })
  }
  await writeFile(`${path}/frames.json`, JSON.stringify(samples, null, 2))
}

test('capture desktop, touch and WebKit return and navigation frames', async ({ browser, baseURL }) => {
  test.setTimeout(60000)
  for (const hasTouch of [false, true]) {
    const context = await browser.newContext({ baseURL, hasTouch, viewport: { width: hasTouch ? 390 : 960, height: 900 }, deviceScaleFactor: 1 })
    try {
      const page = await context.newPage()
      for (const overlap of ['nav', 'aside']) {
        await page.goto(`/tests/e2e/fixtures/preview-navigation.html?overlap=${overlap}`)
        await captureFrames(page, hasTouch, `${hasTouch ? 'touch' : 'desktop'}-${overlap}`)
      }
    } finally { await context.close() }
  }
  const safari = await webkit.launch({ channel: '' })
  try {
    const page = await safari.newPage({ baseURL, hasTouch: true, viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 })
    await page.goto('/tests/e2e/fixtures/preview-navigation.html?overlap=nav')
    await captureFrames(page, true, 'webkit-nav')
  } finally { await safari.close() }
})

import { expect, test, webkit, type Locator } from '@playwright/test'

async function samplePage(viewer: Locator, previous = false) {
  return viewer.evaluate(async (panel, previous) => {
    panel.querySelector<HTMLButtonElement>(previous ? '[aria-label="上一张"]' : '[aria-label="下一张"]')!.click()
    let slide: Element | null = null, animation: Animation | undefined
    for (let frame = 0; frame < 30 && !animation; frame++) {
      await new Promise(requestAnimationFrame)
      slide = panel.querySelector('.apple-viewer-page:not([class*="-leave-"])')
      if (slide) { getComputedStyle(slide).transform; animation = slide.getAnimations()[0] }
    }
    if (!animation || !slide) throw new Error('The page did not start an animated transition')
    const duration = Number(animation.effect!.getTiming().duration)
    animation.pause()
    const positions = [0, .1, .25, .5, .75, 1].map(fraction => {
      animation!.currentTime = fraction * duration
      return Math.abs(new DOMMatrixReadOnly(getComputedStyle(slide!).transform).m41)
    })
    animation.currentTime = 0; animation.play()
    return { duration, progress: positions.map(x => 1 - x / positions[0]) }
  }, previous)
}

for (const width of [390, 1440]) {
  test(`fullscreen paging follows the compact scroll cadence at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/tests/e2e/fixtures/mobile-images.html')
    const compact = await page.locator('#compact').evaluate(async figure => {
      const strip = figure.querySelector('.apple-image__gallery')!
      const target = (strip.children[1] as HTMLElement).offsetLeft
      const values = [{ time: 0, x: strip.scrollLeft }], start = performance.now()
      figure.querySelector<HTMLButtonElement>('[aria-label="下一张图片"]')!.click()
      while (performance.now() - start < 1200) {
        await new Promise(requestAnimationFrame)
        values.push({ time: performance.now() - start, x: strip.scrollLeft })
        if (Math.abs(strip.scrollLeft - target) < 1) break
      }
      return { values, target }
    })
    expect(compact.values.at(-1)!.x).toBeCloseTo(compact.target, 0)
    await page.locator('#compact .apple-image__trigger').nth(1).click()
    const viewer = page.locator('.apple-image-viewer')
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    for (const previous of [false, true]) {
      const full = await samplePage(viewer, previous)
      // Equal time slices must show an acceleration phase and a soft landing.
      expect(full.progress[1]).toBeLessThan(.08)
      expect(full.progress[2]).toBeGreaterThan(.25)
      expect(full.progress[2]).toBeLessThan(.5)
      expect(full.progress[3]).toBeGreaterThan(.7)
      expect(full.progress[4]).toBeGreaterThan(.94)
      expect(full.progress[5]).toBeCloseTo(1, 4)
      const nativeDuration = compact.values.at(-1)!.time
      expect(full.duration / nativeDuration).toBeGreaterThan(.7)
      expect(full.duration / nativeDuration).toBeLessThan(1.3)
      for (const [fraction, progress] of [[.25, full.progress[2]], [.5, full.progress[3]], [.75, full.progress[4]]]) {
        const nearest = compact.values.reduce((a, b) => Math.abs(a.time - nativeDuration * fraction) < Math.abs(b.time - nativeDuration * fraction) ? a : b)
        expect(Math.abs(progress - nearest.x / compact.target)).toBeLessThan(.16)
      }
      await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
    }
  })
}

test('WebKit fullscreen paging accelerates and decelerates in both directions', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await page.goto(`${baseURL}/tests/e2e/fixtures/mobile-images.html`)
    await page.locator('#compact .apple-image__trigger').first().click()
    const viewer = page.locator('.apple-image-viewer')
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    for (const previous of [false, true]) {
      const { progress } = await samplePage(viewer, previous)
      expect(progress[1]).toBeLessThan(.08)
      expect(progress[2]).toBeGreaterThan(.25)
      expect(progress[2]).toBeLessThan(.5)
      expect(progress[3]).toBeGreaterThan(.7)
      expect(progress[4]).toBeGreaterThan(.94)
      await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
    }
  } finally { await browser.close() }
})

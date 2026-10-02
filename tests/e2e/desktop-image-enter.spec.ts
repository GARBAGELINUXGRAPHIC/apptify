import { test, expect, webkit } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { samplePhotoFlight } from './image-gestures'

for (const engine of ['chromium', 'webkit']) {
  for (const index of [0, 1, 3]) {
    test(`desktop origin flight matches crop and full image: ${engine}, image=${index}`, async ({ browser }) => {
      const own = engine === 'webkit' ? await webkit.launch({ channel: '' }) : null
      const context = await (own ?? browser).newContext({ viewport: { width: 1440, height: 1000 } })
      const page = await context.newPage()
      try {
        await page.goto('/tests/e2e/fixtures/mobile-images.html?shape=square')
        await page.evaluate(() => {
          const animate = Element.prototype.animate
          Element.prototype.animate = function (...args) {
            const animation = animate.apply(this, args)
            if (this.closest('.apple-image-viewer')) { animation.pause(); animation.currentTime = 0 }
            return animation
          }
        })
        const source = page.locator('#tiled .apple-image__trigger').nth(index)
        await source.scrollIntoViewIfNeeded()
        const original = await source.locator('img').boundingBox()
        await source.click()
        const flight = page.locator('.apple-viewer-enter-photo')
        await expect(flight).toHaveCount(1)
        const samples = await flight.evaluate(samplePhotoFlight)
        expect(samples.duration).toBe(360)
        expect(samples.properties).toEqual(['clipPath', 'transform'])
        const visible = samples.frame.map(frame => Object.fromEntries(Object.entries(frame).map(([key,value]) => [key,parseFloat(value)])))
        expect(visible[0].left).toBeCloseTo(original!.x, 0)
        expect(visible[0].top).toBeCloseTo(original!.y, 0)
        expect(visible[0].width).toBeCloseTo(original!.width, 0)
        expect(visible[0].height).toBeCloseTo(original!.height, 0)
        const target = await page.locator('.apple-viewer-image').boundingBox()
        expect(visible[2].left).toBeCloseTo(target!.x, 0)
        expect(visible[2].top).toBeCloseTo(target!.y, 0)
        expect(visible[2].width).toBeCloseTo(target!.width, 0)
        expect(visible[2].height).toBeCloseTo(target!.height, 0)
        expect(visible[1].width).toBeGreaterThan(visible[0].width)
        await expect(page.locator('.apple-viewer-pages')).toHaveCSS('opacity', '0')
        await expect(source.locator('img')).toHaveCSS('opacity', '0')
        await mkdir(`/tmp/apptify-checks/desktop-enter/${engine}-${index}`, { recursive: true })
        for (const time of [0, 60, 120, 240, 360]) {
          await page.locator('.apple-image-viewer').evaluate((panel, time) => {
            panel.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = time })
          }, time)
          await page.screenshot({ path: `/tmp/apptify-checks/desktop-enter/${engine}-${index}/${time}.png`, animations: 'allow' })
        }
        await page.locator('.apple-image-viewer').evaluate(panel => panel.getAnimations({ subtree: true }).filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))).forEach(animation => animation.finish()))
        await expect(flight).toHaveCount(0)
        await expect(page.locator('.apple-viewer-pages')).toHaveCSS('opacity', '1')
      } finally { await context.close(); await own?.close() }
    })
  }
}

test('closing during desktop entry continues from the painted crop', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  await page.evaluate(() => {
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args)
      if (this.closest('.apple-image-viewer')) { animation.pause(); animation.currentTime = this.classList.contains('apple-viewer-enter-photo') ? 80 : 0 }
      return animation
    }
  })
  await page.locator('#compact .apple-image__trigger').first().click()
  const before = await page.locator('.apple-viewer-enter-photo').evaluate(element => ({ rect: element.getBoundingClientRect().toJSON(), clip: getComputedStyle(element).clipPath }))
  await page.keyboard.press('Escape')
  const returning = page.locator('.apple-viewer-return-photo')
  await expect(returning).toHaveCount(1)
  const after = await returning.evaluate(element => ({ rect: element.getBoundingClientRect().toJSON(), clip: getComputedStyle(element).clipPath }))
  for (const key of ['x','y','width','height']) expect(after.rect[key]).toBeCloseTo(before.rect[key], 0)
  expect(after.clip).toBe(before.clip)
  await page.locator('.apple-image-viewer').evaluate(panel => panel.getAnimations({ subtree: true }).filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))).forEach(animation => animation.finish()))
  await expect(page.locator('.apple-image-viewer')).toHaveCount(0)
  await expect(page.locator('#compact .apple-image__trigger img').first()).toHaveCSS('opacity', '1')
})

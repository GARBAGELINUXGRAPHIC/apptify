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
        await source.hover()
        await page.waitForTimeout(400)
        const original = await source.boundingBox()
        await source.click()
        const flight = page.locator('.apple-viewer-canvas')
        await expect(flight).toHaveCount(1)
        const samples = await flight.evaluate(samplePhotoFlight)
        expect(samples.duration).toBe(360)
        expect(samples.properties).toEqual(['clipPath', 'transform'])
        const visible = samples.frame.map(frame => Object.fromEntries(Object.entries(frame).map(([key,value]) => [key,parseFloat(value)])))
        expect(visible[0].left).toBeCloseTo(original!.x, 0)
        expect(visible[0].top).toBeCloseTo(original!.y, 0)
        expect(visible[0].width).toBeCloseTo(original!.width, 0)
        expect(visible[0].height).toBeCloseTo(original!.height, 0)
        await flight.evaluate(frame => frame.getAnimations().forEach(animation => { animation.currentTime = Number(animation.effect!.getTiming().duration) }))
        const target = await page.locator('.apple-viewer-image').boundingBox()
        expect(visible[2].left).toBeCloseTo(target!.x, 0)
        expect(visible[2].top).toBeCloseTo(target!.y, 0)
        expect(visible[2].width).toBeCloseTo(target!.width, 0)
        expect(visible[2].height).toBeCloseTo(target!.height, 0)
        expect(visible[1].width).toBeGreaterThan(visible[0].width)
        await expect(page.locator('.apple-image-viewer')).toHaveAttribute('data-phase', 'opening')
        await expect(page.locator('.apple-viewer-photo')).toHaveCount(5)
        await expect(source.locator('img')).toHaveCSS('opacity', '0')
        await mkdir(`/tmp/apptify-checks/desktop-enter/${engine}-${index}`, { recursive: true })
        for (const time of [0, 60, 120, 240, 360]) {
          await page.locator('.apple-image-viewer').evaluate((panel, time) => {
            panel.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = time })
          }, time)
          await page.screenshot({ path: `/tmp/apptify-checks/desktop-enter/${engine}-${index}/${time}.png`, animations: 'allow' })
        }
        await page.locator('.apple-image-viewer').evaluate(panel => panel.getAnimations({ subtree: true }).filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))).forEach(animation => animation.finish()))
        await expect(page.locator('.apple-image-viewer')).toHaveAttribute('data-phase', 'open')
        await expect(flight).toHaveCount(1)
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
      if (this.closest('.apple-image-viewer')) { animation.pause(); animation.currentTime = this.classList.contains('apple-viewer-canvas') && !this.closest('[data-phase=closing]') ? 80 : 0 }
      return animation
    }
  })
  await page.locator('#compact .apple-image__trigger').first().click()
  const painted = (element: Element) => {
    const rect = element.getBoundingClientRect(), photo = element.querySelector('img')!.getBoundingClientRect()
    const inset = getComputedStyle(element).clipPath.match(/^inset\(([^)]*)/)![1].split('round')[0].trim().split(/\s+/).map(parseFloat)
    const scale = rect.width / (element as HTMLElement).offsetWidth
    const [top, right = top, bottom = top, left = right] = inset.map(value => value * scale)
    return { left: rect.left + left, top: rect.top + top, width: rect.width - left - right, height: rect.height - top - bottom, photo: photo.toJSON() }
  }
  const before = await page.locator('.apple-viewer-canvas').evaluate(painted)
  await page.keyboard.press('Escape')
  const returning = page.locator('.apple-viewer-canvas')
  await expect(page.locator('.apple-image-viewer')).toHaveAttribute('data-phase', 'closing')
  const after = await returning.evaluate(painted)
  for (const key of ['left','top','width','height'] as const) expect(after[key]).toBeCloseTo(before[key], 0)
  for (const key of ['x','y','width','height']) expect(after.photo[key]).toBeCloseTo(before.photo[key], 0)
  await page.locator('.apple-image-viewer').evaluate(panel => panel.getAnimations({ subtree: true }).filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))).forEach(animation => animation.finish()))
  await expect(page.locator('.apple-image-viewer')).toHaveCount(0)
  await expect(page.locator('#compact .apple-image__trigger img').first()).toHaveCSS('opacity', '1')
})

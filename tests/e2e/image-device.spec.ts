import { test, expect } from '@playwright/test'

for (const hasTouch of [false, true]) {
  for (const width of [390, 1440]) {
    test(`AppleImage selects by touch capability: touch=${hasTouch}, width=${width}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch })
      const page = await context.newPage()
      try {
        await page.goto('/tests/e2e/fixtures/mobile-images.html')
        const image = page.locator('#compact')
        await expect(image).toHaveClass(hasTouch ? /apple-image--mobile/ : /^(?!.*apple-image--mobile)/)
        await image.locator('.apple-image__trigger').first().click()
        const viewer = page.locator('.apple-image-viewer')
        await expect(viewer).toBeVisible()
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
        await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 })
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
        await page.keyboard.press('Escape')
        await expect(viewer).toHaveCount(0)
        await image.locator('.apple-image__trigger').first().click()
        await expect(viewer).toBeVisible()
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
      } finally {
        await context.close()
      }
    })
  }
}

for (const hasTouch of [false, true]) {
  test(`image return goes below navigation while full preview stays above: touch=${hasTouch}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch })
    const page = await context.newPage()
    try {
      await page.goto('/')
      await page.locator('.media-specimen .apple-image__trigger').first().click()
      const viewer = page.locator('.apple-image-viewer')
      await expect(viewer).toBeVisible()
      if (hasTouch) await expect(viewer).toHaveAttribute('data-phase', 'open')
      const navZ = await page.locator('.apple-navibar__bar').first().evaluate(element => Number(getComputedStyle(element).zIndex))
      expect(await viewer.evaluate(element => Number(getComputedStyle(element).zIndex))).toBeGreaterThan(navZ)
      const closing = await viewer.evaluate(async element => {
        element.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
        return { z: Number(getComputedStyle(element).zIndex), returning: element.getAttribute('data-phase') === 'closing' || element.classList.contains('apple-viewer-presence-leave-active') }
      })
      expect(closing.returning).toBe(true)
      expect(closing.z).toBeLessThan(navZ)
      await expect(viewer).toHaveCount(0)
    } finally { await context.close() }
  })
}

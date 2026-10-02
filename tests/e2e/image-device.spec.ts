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

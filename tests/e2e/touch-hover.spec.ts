import { test, expect } from '@playwright/test'

for (const hasTouch of [false, true]) {
  test(`hover styles respect global touch capability: ${hasTouch}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch })
    try {
      const page = await context.newPage()
      await page.goto('/tests/e2e/fixtures/mobile-images.html')
      await expect(page.locator('#compact')).toBeVisible()
      await page.evaluate(() => {
        const link = document.createElement('a')
        link.className = 'apple-link'
        link.id = 'hover-probe'
        link.href = '#'
        link.textContent = 'Hover probe'
        document.querySelector('.apple-provider')!.prepend(link)
        const buttons = document.createElement('div')
        buttons.className = 'apple-provider'
        buttons.innerHTML = '<button class="apple-button apple-button--secondary">Secondary</button><button class="apple-button apple-button--outline">Outline</button>'
        document.body.prepend(buttons)
      })
      for (const variant of ['secondary', 'outline']) {
        const button = page.locator(`.apple-button--${variant}`).first()
        await button.hover()
        await expect(button).toHaveCSS('background-color', hasTouch ? 'rgba(0, 0, 0, 0)' : 'rgb(0, 113, 227)')
        await expect(button).toHaveCSS('color', hasTouch ? 'rgb(0, 113, 227)' : 'rgb(255, 255, 255)')
      }
      const link = page.locator('#hover-probe')
      await page.mouse.move(0, 0)
      const before = await link.evaluate(element => getComputedStyle(element).color)
      await link.hover()
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      if (hasTouch) await expect(link).toHaveCSS('color', before)
      else await expect.poll(() => link.evaluate(element => getComputedStyle(element).color)).not.toBe(before)
      if (hasTouch) await expect(page.locator('html')).toHaveAttribute('data-apple-touch', '')
      else await expect(page.locator('html')).not.toHaveAttribute('data-apple-touch')
    } finally { await context.close() }
  })
}

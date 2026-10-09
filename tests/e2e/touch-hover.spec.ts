import { test, expect } from '@playwright/test'

for (const hasTouch of [false, true]) {
  test(`mouse hover styles work regardless of touch capability: ${hasTouch}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: false })
    try {
      await context.addInitScript(touch => {
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => touch ? 5 : 0 })
        const matchMedia = window.matchMedia.bind(window)
        window.matchMedia = query => {
          const media = matchMedia(query)
          if (query === '(any-pointer: coarse)') Object.defineProperty(media, 'matches', { value: false })
          return media
        }
      }, hasTouch)
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
        await expect(button).toHaveCSS('background-color', 'rgb(0, 113, 227)')
        await expect(button).toHaveCSS('color', 'rgb(255, 255, 255)')
      }
      const link = page.locator('#hover-probe')
      await page.mouse.move(0, 0)
      const before = await link.evaluate(element => getComputedStyle(element).color)
      await link.hover()
      await expect(link).toHaveCSS('text-decoration-line', 'none')
      await expect.poll(() => link.evaluate(element => getComputedStyle(element).color)).not.toBe(before)
      if (hasTouch) await expect(page.locator('html')).toHaveAttribute('data-apple-touch', '')
      else await expect(page.locator('html')).not.toHaveAttribute('data-apple-touch')
      await page.goto('/tests/e2e/fixtures/card.html?zoom=big')
      const card = page.locator('.apple-card')
      await card.hover()
      await expect.poll(() => card.evaluate(element => Number(new DOMMatrixReadOnly(getComputedStyle(element).transform).a.toFixed(2)))).toBe(1.04)
    } finally { await context.close() }
  })
}

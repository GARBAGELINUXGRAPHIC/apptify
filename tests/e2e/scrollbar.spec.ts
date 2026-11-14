import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/scrollbar.html')
})

test('native scrollbars follow the provider theme and respect opt-outs', async ({ page }) => {
  const port = page.locator('#port')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(port).toHaveCSS('scrollbar-width', 'thin')
  await expect(port).toHaveCSS('scrollbar-color', 'rgba(0, 0, 0, 0.32) rgba(0, 0, 0, 0)')
  await expect(page.locator('#dark')).toHaveCSS('scrollbar-color', 'rgba(255, 255, 255, 0.32) rgba(0, 0, 0, 0)')
  await expect(page.locator('#ignored')).toHaveCSS('scrollbar-width', 'auto')
  await expect(page.locator('#ignored')).toHaveCSS('scrollbar-color', 'auto')
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'thin')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(port).toHaveCSS('scrollbar-color', 'rgba(255, 255, 255, 0.32) rgba(0, 0, 0, 0)')
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(port).toHaveCSS('scrollbar-width', 'auto')
  await expect(port).toHaveCSS('scrollbar-color', 'auto')
})

test('scrolling stays on its own container across resizing and overlays', async ({ page }) => {
  const port = page.locator('#port')
  await port.press('End')
  await expect.poll(() => port.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop)).toBe(0)
  await port.press('Home')
  await expect.poll(() => port.evaluate(el => el.scrollTop)).toBe(0)
  await port.hover()
  await page.mouse.wheel(80, 120)
  await expect.poll(() => port.evaluate(el => [el.scrollLeft, el.scrollTop])).toEqual([80, 120])

  const dynamic = page.locator('#dynamic')
  const overflow = () => dynamic.evaluate(el => el.scrollHeight - el.clientHeight)
  expect(await overflow()).toBe(0)
  await page.locator('#grow').click()
  expect(await overflow()).toBe(500)

  await page.getByRole('button', { name: '打开浮层' }).click()
  const popover = page.locator('.apple-popover')
  await popover.hover()
  await page.mouse.wheel(0, 160)
  await expect.poll(() => popover.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
  await page.keyboard.press('Escape')

  await page.locator('#open').click()
  const body = page.getByRole('dialog').locator('.apple-modal-body')
  await body.hover()
  await page.mouse.wheel(0, 160)
  await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
  expect(await port.evaluate(el => el.scrollTop)).toBe(120)
  await expect(page.locator('.apple-scroll-bar, [data-apple-scrollbar-native]')).toHaveCount(0)
})

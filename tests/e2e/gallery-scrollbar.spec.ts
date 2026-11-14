import { expect, test, webkit, type Page } from '@playwright/test'

const fixture = '/tests/e2e/fixtures/mobile-images.html'

async function checkTiledScroll(page: Page) {
  await page.goto(fixture)
  const strip = page.locator('#tiled .apple-image__gallery')
  await strip.scrollIntoViewIfNeeded()
  const overflow = () => strip.evaluate(el => el.scrollWidth - el.clientWidth)
  expect(await overflow()).toBeGreaterThan(0)
  await expect(strip).toHaveCSS('scrollbar-width', 'thin')
  await expect(page.locator('#compact .apple-image__gallery')).toHaveCSS('scrollbar-width', 'none')
  await expect(page.locator('#tiled [role=scrollbar]')).toHaveCount(0)

  await strip.hover()
  await page.mouse.wheel(180, 0)
  await expect.poll(() => strip.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  await strip.press('End')
  await expect.poll(() => strip.evaluate(el => el.scrollWidth - el.clientWidth - el.scrollLeft)).toBe(0)

  await page.setViewportSize({ width: 1920, height: 1000 })
  await expect.poll(overflow).toBe(0)
}

test('tiled gallery scrolls natively with a horizontal wheel and keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  await checkTiledScroll(page)
})

test('tiled gallery updates its index when a smooth scroll is interrupted', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(fixture)
  const gallery = page.locator('#tiled')
  const strip = gallery.locator('.apple-image__gallery')
  const firstVisible = await strip.evaluate(el => {
    const center = el.clientWidth / 2
    const distances = Array.from(el.children, child => {
      const tile = child as HTMLElement
      return Math.abs(tile.offsetLeft + tile.offsetWidth / 2 - center)
    })
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }))
    el.scrollTo({ left: 0, behavior: 'instant' })
    return String(distances.indexOf(Math.min(...distances)))
  })
  await expect(gallery).toHaveAttribute('data-index', firstVisible)
  await strip.hover()
  await page.mouse.wheel(400, 0)
  await expect.poll(() => strip.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
  await expect(gallery).not.toHaveAttribute('data-index', firstVisible)
})

test('WebKit scrolls the tiled gallery natively', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    await checkTiledScroll(await browser.newPage({ baseURL, viewport: { width: 800, height: 900 } }))
  } finally { await browser.close() }
})

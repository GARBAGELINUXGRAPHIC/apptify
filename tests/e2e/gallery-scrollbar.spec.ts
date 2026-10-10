import { expect, test, webkit, type Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  const bar = page.getByRole('scrollbar', { name: '图片组滚动条' })
  await expect(bar).toBeVisible()
  await bar.scrollIntoViewIfNeeded()
  return bar
}

async function dragScrollbar(page: Page) {
  const bar = await ready(page), strip = page.locator('#tiled .apple-image__gallery')
  const thumb = bar.locator('.apple-scroll-bar__thumb')
  const trackBox = (await bar.boundingBox())!, thumbBox = (await thumb.boundingBox())!
  const startX = thumbBox.x + thumbBox.width / 2, y = thumbBox.y + thumbBox.height / 2
  await page.mouse.move(startX, y)
  await page.mouse.down()
  await page.mouse.move(startX + (trackBox.width - thumbBox.width) / 2, y, { steps: 12 })
  const middle = await strip.evaluate(box => ({ left: box.scrollLeft, max: box.scrollWidth - box.clientWidth }))
  expect(middle.left / middle.max).toBeCloseTo(.5, 1)
  await expect(bar).toHaveAttribute('aria-valuenow', String(Math.round(middle.left)))
  await page.mouse.up()
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeCloseTo(middle.left, 0)
  const next = (await thumb.boundingBox())!
  await page.mouse.move(next.x + next.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(trackBox.x + trackBox.width + 200, y + 50, { steps: 12 })
  await page.mouse.up()
  await expect.poll(() => strip.evaluate(box => box.scrollLeft / (box.scrollWidth - box.clientWidth))).toBeCloseTo(1, 3)
  expect((await thumb.boundingBox())!.x + (await thumb.boundingBox())!.width).toBeCloseTo(trackBox.x + trackBox.width, 0)
  await expect(page.locator('.apple-image-viewer')).toHaveCount(0)
}

test('tiled scrollbar drags proportionally, holds its position and captures outside the track', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  await dragScrollbar(page)
})

test('tiled scrollbar supports track clicks, keyboard and native scroll synchronization', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  const bar = await ready(page), strip = page.locator('#tiled .apple-image__gallery')
  const controls = await bar.getAttribute('aria-controls')
  expect(await strip.getAttribute('id')).toBe(controls)
  const rect = (await bar.boundingBox())!
  await page.mouse.click(rect.x + rect.width - 4, rect.y + rect.height / 2)
  await expect.poll(() => strip.evaluate(box => box.scrollLeft / (box.scrollWidth - box.clientWidth))).toBeCloseTo(1, 3)
  await bar.press('Home')
  await expect(bar).toHaveAttribute('aria-valuenow', '0')
  await bar.press('ArrowRight')
  await expect(bar).toHaveAttribute('aria-valuenow', '40')
  await bar.press('End')
  await expect.poll(() => bar.getAttribute('aria-valuenow')).toBe(await bar.getAttribute('aria-valuemax'))
  await strip.evaluate(box => { box.scrollLeft = 150 })
  await expect(bar).toHaveAttribute('aria-valuenow', '150')
  const layout = await bar.evaluate(element => {
    const track = element.getBoundingClientRect(), thumb = element.firstElementChild!.getBoundingClientRect()
    return { progress: (thumb.left - track.left) / (track.width - thumb.width) }
  })
  expect(layout.progress).toBeCloseTo(150 / Number(await bar.getAttribute('aria-valuemax')), 3)
})

test('overflow and content resizing update scrollbar visibility and thumb size', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  const bar = await ready(page)
  await page.setViewportSize({ width: 1920, height: 1000 })
  await expect(bar).toBeHidden()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(bar).toBeVisible()
  const before = await bar.locator('span').evaluate(element => element.getBoundingClientRect().width)
  await page.locator('#tiled').evaluate(element => (element as HTMLElement).style.setProperty('--apple-image-tile-height', '220px'))
  await expect.poll(() => bar.locator('span').evaluate(element => element.getBoundingClientRect().width)).toBeLessThan(before)
  await expect(page.locator('#compact [role=scrollbar]')).toHaveCount(0)
  await page.goto('/tests/e2e/fixtures/mobile-images.html?layout=tiled-wrap')
  await expect(page.locator('#tiled [role=scrollbar]')).toHaveCount(0)
})

test('scrollbar matches light and dark themes, including its focused and drag states', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 })
  const bar = await ready(page)
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme })
    await expect(page.locator('.apple-provider')).toHaveAttribute('data-apple-theme', colorScheme)
    await page.mouse.move(1, 1)
    await page.locator('#tiled').screenshot({ path: `/tmp/apptify-checks/tiled-scrollbar-${colorScheme}.png` })
  }
  await bar.focus()
  await expect(bar).toHaveCSS('outline-style', 'none')
  await expect(bar.locator('span')).toHaveCSS('box-shadow', 'none')
  await expect.poll(() => bar.locator('span').evaluate(element => getComputedStyle(element).backgroundColor)).toMatch(/0\.64\)/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(bar.locator('span')).toHaveCSS('transition-duration', '0s')
})

test('WebKit renders and drags the custom tiled scrollbar', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ baseURL, viewport: { width: 800, height: 900 } })
    await dragScrollbar(page)
    await page.locator('#tiled').screenshot({ path: '/tmp/apptify-checks/tiled-scrollbar-webkit.png' })
  } finally { await browser.close() }
})

import { expect, test, webkit, type Page } from '@playwright/test'
import { activeCard, openComponent } from './component-navigation'

async function freeSmallPreview(page: Page, placement: 'center' | 'previous' | 'next' | 'previous-edge') {
  await openComponent(page, 'apple-image')
  const figure = activeCard(page).locator('.demo-image .apple-image[data-gallery-layout="compact"]')
  const strip = figure.locator('.apple-image__gallery--compact')
  await expect.poll(() => figure.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
  const metrics = await strip.evaluate(box => ({ stride: (box.children[1] as HTMLElement).offsetLeft, count: box.children.length, max: box.scrollWidth - box.clientWidth }))
  await figure.evaluate(figure => {
    const box = figure.querySelector('.apple-image__gallery--compact')!
    const events: Array<{ x: number; y: number; trusted: boolean; arrow: boolean; surface: boolean }> = []
    document.addEventListener('wheel', event => {
      if (event.composedPath().includes(figure)) events.push({ x: event.clientX, y: event.clientY, trusted: event.isTrusted, arrow: !!(event.target as Element).closest('.apple-image__arrow'), surface: event.composedPath().includes(figure.querySelector('.apple-image__surface')!) })
    }, { capture: true, passive: true })
    ;(figure as any).__freeWheel = { box, events }
  })
  const target = placement === 'center' ? strip : figure.locator(placement.startsWith('previous') ? '.apple-image__arrow--prev' : '.apple-image__arrow--next')
  const bounds = (await target.boundingBox())!
  const x = placement === 'previous-edge' ? bounds.x + bounds.width - .5 : bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y) // Only once: neither the direction changes nor new rounds move it.
  // One uninterrupted burst must travel through more than one photo.
  for (let i = 0; i < 20; i++) await page.mouse.wheel(metrics.stride * .3, 0)
  await expect.poll(async () => Number(await figure.getAttribute('data-index'))).toBeGreaterThanOrEqual(2)
  await page.mouse.wheel(metrics.max * 2, 0)
  await expect(figure).toHaveAttribute('data-index', String(metrics.count - 1))
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeCloseTo(metrics.max, 0)
  // Reverse at exactly the same point, then repeat without requiring idle or mousemove.
  for (let i = 0; i < 20; i++) await page.mouse.wheel(-metrics.stride * .3, 0)
  await page.mouse.wheel(-metrics.max * 2, 0)
  await expect(figure).toHaveAttribute('data-index', '0')
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBe(0)
  await page.mouse.wheel(metrics.stride * 2.5, 0)
  await expect.poll(async () => Number(await figure.getAttribute('data-index'))).toBeGreaterThanOrEqual(2)
  const result = await figure.evaluate(figure => {
    const recorded = (figure as any).__freeWheel
    return { sameBox: recorded.box === figure.querySelector('.apple-image__gallery--compact'), events: recorded.events as Array<{ x: number; y: number; trusted: boolean; arrow: boolean; surface: boolean }> }
  })
  expect(result.sameBox).toBe(true)
  expect(result.events).toHaveLength(43)
  expect(new Set(result.events.map(event => `${event.x},${event.y}`)).size).toBe(1)
  expect(result.events.every(event => event.trusted && event.surface)).toBe(true)
  expect(result.events.every(event => event.arrow)).toBe(placement !== 'center')
  await expect(strip).toHaveCSS('scroll-snap-type', 'x mandatory')
}

for (const placement of ['center', 'previous', 'next', 'previous-edge'] as const) {
  test(`compact preview freely crosses photos with a fixed cursor over ${placement}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await freeSmallPreview(page, placement)
  })
}

test('WebKit small preview freely crosses photos with a fixed cursor', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ baseURL, viewport: { width: 1440, height: 1000 } })
    await freeSmallPreview(page, 'center')
  } finally { await browser.close() }
})

test('ordinary tiled previews retain native scrolling', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  await page.setViewportSize({ width: 800, height: 900 })
  const strip = page.locator('#tiled .apple-image__gallery')
  await strip.scrollIntoViewIfNeeded()
  const bounds = await strip.boundingBox()
  await page.mouse.move(bounds!.x + 80, bounds!.y + 60)
  await page.mouse.wheel(150, 0)
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeGreaterThan(0)
  const first = await strip.evaluate(box => box.scrollLeft)
  await page.mouse.wheel(150, 0)
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeGreaterThan(first)
})

test('free compact scrolling keeps arrows, full-view opening and closing usable', async ({ page }) => {
  await openComponent(page, 'apple-image')
  const figure = activeCard(page).locator('.demo-image .apple-image'), strip = figure.locator('.apple-image__gallery')
  const stride = await strip.evaluate(box => (box.children[1] as HTMLElement).offsetLeft)
  const bounds = (await strip.boundingBox())!
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.wheel(stride * 2, 0)
  await expect(figure).toHaveAttribute('data-index', '2')
  await figure.getByRole('button', { name: '下一张图片', exact: true }).click()
  await expect(figure).toHaveAttribute('data-index', '3')
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeCloseTo(stride * 3, 0)
  await strip.locator('.apple-image__trigger').nth(3).click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toBeVisible()
  await viewer.getByRole('button', { name: '上一张', exact: true }).click()
  await expect(viewer.locator('.apple-viewer-count')).toContainText('3 /')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(figure).toHaveAttribute('data-index', '2')
  await expect(strip).toHaveCSS('scroll-snap-type', 'x mandatory')
})

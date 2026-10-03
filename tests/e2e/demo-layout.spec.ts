import { expect, test, type Page } from '@playwright/test'
import { catalog } from '../../playground/catalog'

const activeCard = (page: Page) => page.locator(new URL(page.url()).hash)

async function openDemo(page: Page, name: string) {
  const tag = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  await page.locator(`.component-card-heading a[href$="#${tag}"]`).click()
  await expect(page).toHaveURL(new RegExp(`#${tag}$`))
  await expect(activeCard(page).locator('.component-demo')).toHaveAttribute('data-component', name)
}

for (const viewport of [
  { width: 1440, height: 1000, mode: 'desktop' },
  { width: 768, height: 1024, mode: 'desktop' },
  { width: 390, height: 844, mode: 'desktop' },
  { width: 320, height: 740, mode: 'desktop' },
  { width: 1440, height: 1000, mode: 'mobile' },
]) {
  test(`all component demos fit at ${viewport.width}px in ${viewport.mode} preview`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/components')
    if (viewport.mode === 'mobile') await page.getByRole('button', { name: '手机预览', exact: true }).click()
    for (const item of catalog) {
      await test.step(item.name, async () => {
        await openDemo(page, item.name)
        const demo = activeCard(page).locator('.component-demo')
        await expect(demo).toBeVisible()
        // Inspect descendants as well as document width: overflow-x:clip on main
        // can conceal broken layouts without causing a document scrollbar.
        await expect.poll(() => demo.evaluate(root => {
          const bounds = root.getBoundingClientRect()
          const stage = root.closest('.detail-preview')!.getBoundingClientRect()
          const ignored = '.apple-table__viewport, .apple-table__scroll, .apple-table__body, .apple-image__gallery, [data-apple-portals], .apple-snackbar-list, .apple-content-sr'
          const overflowing = [...root.querySelectorAll<HTMLElement>('*')].filter(element => {
            if (element.closest(ignored + ', [aria-hidden="true"], [inert]') || !element.checkVisibility({ visibilityProperty: true }) || getComputedStyle(element).position === 'fixed') return false
            const rect = element.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0 && (rect.left < bounds.left - 2 || rect.right > bounds.right + 2 || rect.bottom > bounds.bottom + 2)
          }).map(element => `${element.tagName}.${element.className}`)
          if (bounds.left < stage.left || bounds.right > stage.right || bounds.bottom > stage.bottom) overflowing.push('demo outside preview')
          return overflowing
        }), { message: `${item.name} has clipped or overflowing content` }).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width + 1)
      })
    }
    expect(errors).toEqual([])
  })
}

test('layout and media controls retain their shape after switching', async ({ page }) => {
  await page.goto('/components')
  await openDemo(page, 'AppleGrid')
  await expect(activeCard(page).locator('.demo-layout-tile')).toHaveCount(3)
  const heights = await activeCard(page).locator('.demo-layout-tile').evaluateAll(tiles => tiles.map(tile => tile.getBoundingClientRect().height))
  expect(heights.every(height => height >= 100 && height <= 140)).toBe(true)
  await openDemo(page, 'AppleStack')
  await activeCard(page).locator('.component-demo').getByText('纵向', { exact: true }).click()
  await expect(activeCard(page).locator('.component-demo > .apple-stack > .apple-stack')).toHaveCSS('flex-direction', 'column')
  await activeCard(page).locator('.component-demo').getByText('横向', { exact: true }).click()
  await expect(activeCard(page).locator('.component-demo > .apple-stack > .apple-stack')).toHaveCSS('flex-direction', 'row')
  await openDemo(page, 'AppleImage')
  await expect(activeCard(page).locator('.component-demo .apple-image__trigger img')).toHaveCount(12)
  await expect.poll(() => activeCard(page).locator('.component-demo .apple-image__trigger img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
  await expect(activeCard(page).locator('.component-demo .apple-segmented')).toHaveCSS('display', 'flex')
  await activeCard(page).locator('.component-demo').getByText('平铺', { exact: true }).click()
  await expect(activeCard(page).locator('.component-demo .apple-image')).toHaveAttribute('data-gallery-layout', 'tiled')
  await activeCard(page).locator('.component-demo').getByText('换行平铺', { exact: true }).click()
  await expect(activeCard(page).locator('.component-demo .apple-image')).toHaveAttribute('data-gallery-layout', 'tiled-wrap')
  const tiles = activeCard(page).locator('.component-demo .apple-image__trigger')
  const natural = await tiles.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect(), image = element.querySelector('img')!
    return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, bottom: rect.bottom, ratio: image.naturalWidth / image.naturalHeight }
  }))
  expect(Math.max(...natural.map(tile => tile.width)) - Math.min(...natural.map(tile => tile.width))).toBeLessThan(1)
  expect(new Set(natural.map(tile => Math.round(tile.top))).size).toBeGreaterThan(1)
  for (const tile of natural) expect(tile.width / tile.height).toBeCloseTo(tile.ratio, 1)
  expect(natural.some(tile => tile.ratio < 0.75)).toBe(true)
  expect(natural.some(tile => tile.ratio > 2)).toBe(true)
  for (const left of new Set(natural.map(tile => Math.round(tile.left)))) {
    const column = natural.filter(tile => Math.round(tile.left) === left).sort((a, b) => a.top - b.top)
    for (let index = 1; index < column.length; index++) {
      expect(column[index].top - column[index - 1].bottom).toBeCloseTo(8, 0)
    }
  }
  await activeCard(page).getByRole('switch', { name: '强制 1:1（裁剪）' }).click()
  const squares = await tiles.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect()
    return { width: rect.width, height: rect.height, fit: getComputedStyle(element.querySelector('img')!).objectFit }
  }))
  for (const tile of squares) {
    expect(Math.abs(tile.width - tile.height)).toBeLessThan(1)
    expect(tile.fit).toBe('cover')
  }
  await activeCard(page).locator('.component-demo').getByText('省空间', { exact: true }).click()
  await expect(activeCard(page).locator('.component-demo .apple-image')).toHaveAttribute('data-gallery-layout', 'compact')
  await openDemo(page, 'AppleImage')
  await activeCard(page).locator('.apple-image__trigger').first().click()
  await expect(page.getByRole('dialog', { name: '图片预览', exact: true })).toBeVisible()
  await page.getByRole('button', { name: '关闭图片预览', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '图片预览', exact: true })).toHaveCount(0)
})

for (const layout of ['tiled', 'tiled-wrap']) {
test(`desktop ${layout} images zoom individually and respect reduced motion`, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/tests/e2e/fixtures/mobile-images.html?layout=${layout}`)
  const gallery = page.locator('#tiled')
  const images = gallery.locator('img')
  await expect(gallery).toHaveClass(/apple-image--loaded/)
  await images.first().hover()
  await expect(gallery.locator('.apple-image__surface')).toHaveCSS('transform', 'none')
  await expect(images.first()).toHaveCSS('transform', 'matrix(1.04, 0, 0, 1.04, 0, 0)')
  await expect(images.nth(1)).toHaveCSS('transform', 'none')
  await images.nth(1).hover()
  await expect(images.first()).toHaveCSS('transform', 'none')
  await expect(images.nth(1)).toHaveCSS('transform', 'matrix(1.04, 0, 0, 1.04, 0, 0)')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(images.nth(1)).toHaveCSS('transform', 'none')
})

}

for (const width of [320, 390]) {
  test(`wrapped tiles fit at ${width}px and crop square images even with fit=contain`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true })
    const page = await context.newPage()
    try {
      await page.goto('/tests/e2e/fixtures/mobile-images.html?layout=tiled-wrap&shape=square')
      const gallery = page.locator('#tiled')
      await expect(gallery).toHaveClass(/apple-image--loaded/)
      const dimensions = await gallery.locator('.apple-image__trigger').evaluateAll(tiles => tiles.map(tile => {
        const box = tile.getBoundingClientRect()
        return { width: box.width, height: box.height, right: box.right, fit: getComputedStyle(tile.querySelector('img')!).objectFit }
      }))
      for (const tile of dimensions) {
        expect(Math.abs(tile.width - tile.height)).toBeLessThan(1)
        expect(tile.right).toBeLessThanOrEqual(width)
        expect(tile.fit).toBe('cover')
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await gallery.locator('.apple-image__trigger').last().click()
      await expect(page.locator('.apple-image-viewer')).toBeVisible()
      await expect(page.locator('.apple-viewer-count')).toHaveText('5 / 5')
    } finally {
      await context.close()
    }
  })
}


test('compact hover reveals working arrows without scaling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  const compact = page.locator('#compact')
  await compact.locator('img').first().hover()
  await expect(compact.locator('.apple-image__surface')).toHaveCSS('transform', 'none')
  await expect(compact.locator('.apple-image__arrows')).toHaveCSS('opacity', '1')
  await expect(compact.getByRole('button', { name: '上一张图片', exact: true })).toBeDisabled()
  await compact.getByRole('button', { name: '下一张图片', exact: true }).click()
  await expect(compact).toHaveAttribute('data-index', '1')
  await compact.getByRole('button', { name: '上一张图片', exact: true }).click()
  await expect(compact).toHaveAttribute('data-index', '0')
  await expect(page.locator('.apple-image-viewer')).toHaveCount(0)
})

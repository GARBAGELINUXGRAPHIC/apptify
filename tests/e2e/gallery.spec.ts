import { catalog } from '../../playground/catalog'
import { activeCard, openComponent } from './component-navigation'
import { expect, test, webkit, type Page } from '@playwright/test'
import { swipeImage } from './image-gestures'



async function expectNoDocumentOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    overflowing: [...document.querySelectorAll<HTMLElement>('main *')]
      .filter(element => element.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(element).position !== 'fixed')
      .slice(0, 8).map(element => `${element.tagName}.${element.className}`),
  }))
  expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport + 1)
}

async function loadOverviewImages(page: Page) {
  await expect(page.locator('.media-specimen .apple-image')).not.toHaveClass(/apple-image--mobile/)
  const images = page.locator('.home-page .apple-image img')
  expect(await images.count()).toBeGreaterThanOrEqual(1)
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(element => {
      const image = element as HTMLImageElement
      return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
    })).toBe(true)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
})

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 740 },
  { name: 'tablet', width: 768, height: 1024 },
]) {
  test(`overview renders loaded assets without horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await expect(page.locator('.specimen')).toHaveCount(6)
    await loadOverviewImages(page)
    await expectNoDocumentOverflow(page)
    await expect(page.locator('.specimen-product')).toHaveCount(0)
    await expect(page.getByRole('button', { name: '继续探索', exact: true })).toBeVisible()
    const screenshot = await page.screenshot({ path: `/tmp/apptify-checks/${viewport.name}.png`, fullPage: false, animations: 'disabled' })
    expect(screenshot.byteLength).toBeGreaterThan(30_000)
  })
}

test('theme changes immediately on the settings route and supports named themes', async ({ page }) => {
  await page.goto('/settings')
  const provider = page.locator('#app > .apple-provider')
  const background = await provider.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-bg'))
  let navigationCount = 0
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigationCount++ })
  await page.getByRole('button', { name: '深色', exact: true }).click()
  await expect(provider).toHaveAttribute('data-apple-theme', 'dark')
  await expect.poll(() => provider.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-bg'))).not.toBe(background)
  await page.getByRole('button', { name: '玫瑰', exact: true }).click()
  await expect(provider).toHaveAttribute('data-apple-theme', 'rose')
  expect(navigationCount).toBe(0)
})

test('manual motion levels and operating-system reduced motion stop continuous animation', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('radiogroup', { name: '全局动效' }).getByText('关闭', { exact: true }).click()
  await openComponent(page, 'apple-spinner')
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-motion', 'none')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await page.goto('/settings')
  await page.getByRole('radiogroup', { name: '全局动效' }).getByText('完整', { exact: true }).click()
  await openComponent(page, 'apple-spinner')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('apple-spin')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-motion', 'reduced')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
})

for (const width of [1440, 320]) {
  test(`every catalog entry renders a real nonempty demo without unresolved components or page errors at ${width}px`, async ({ page }) => {
    test.setTimeout(240_000)
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.stack ?? error.message))
    page.on('console', message => {
      if (message.type() === 'warning' && /Failed to resolve component|Unhandled error/.test(message.text())) errors.push(message.text())
    })
    await page.goto('/components')
    await expect(page.locator('.component-card-heading > code')).toHaveCount(catalog.length)
    const tags = await page.locator('.component-card-heading > code').allTextContents()
    expect(tags).toHaveLength(catalog.length)
    expect(new Set(tags).size).toBe(tags.length)
    for (const tag of tags) {
      await test.step(tag, async () => {
        await openComponent(page, tag)
        const demo = activeCard(page).locator('.component-demo')
        await expect(demo).toBeVisible()
        await expect.poll(() => demo.evaluate(element => [...element.children].some(child => {
          const rect = child.getBoundingClientRect()
          return rect.width > 0 && rect.height > 0 && getComputedStyle(child).display !== 'none'
        })), { message: `${tag} should have visible demo content` }).toBe(true)
        const unresolved = await demo.evaluate(element => [...element.querySelectorAll('*')].map(child => child.tagName.toLowerCase()).filter(name => name.startsWith('apple-')))
        expect(unresolved, tag).toEqual([])
        for (const image of await demo.locator('img').all()) {
          await image.scrollIntoViewIfNeeded()
          await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true)
        }
        await expectNoDocumentOverflow(page)
        expect(errors, tag).toEqual([])
      })
    }
  })
}

test('stacked dialogs close only the top layer and retain the scroll lock and focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openComponent(page, 'apple-dialog')
  const initialOverflow = await page.evaluate(() => document.body.style.overflow)
  await page.getByRole('button', { name: '多层对话框', exact: true }).click()
  const first = page.locator('[role="dialog"][aria-label="第一层对话框"]')
  const second = page.locator('[role="dialog"][aria-label="第二层对话框"]')
  await expect(first).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await first.getByRole('button', { name: '打开第二层', exact: true }).click()
  await expect(second).toBeVisible()
  await expect(page.locator('.apple-modal[role="dialog"]')).toHaveCount(2)
  await expect(second).toHaveAttribute('aria-modal', 'true')
  await expect(first).not.toHaveAttribute('aria-modal', 'true')
  await expect.poll(() => second.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await page.screenshot({ path: '/tmp/apptify-checks/dialog-stack.png', fullPage: false, animations: 'disabled' })
  await page.keyboard.press('Escape')
  await expect(second).toHaveCount(0)
  await expect(first).toBeVisible()
  await expect(first).toHaveAttribute('aria-modal', 'true')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expect(first.getByRole('button', { name: '打开第二层', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('.apple-modal[role="dialog"]')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(initialOverflow)
  await expect(page.getByRole('button', { name: '多层对话框', exact: true })).toBeFocused()
})

test('image lightbox loads real images, zooms, navigates, and returns focus after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const trigger = page.locator('.media-specimen').getByRole('button', { name: '放大图片：山间湖泊和木屋', exact: true })
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toBeVisible()
  await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0))).toBe(true)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('1 / 2')
  const transforms = () => viewer.locator('.apple-viewer-canvas, .apple-viewer-image').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform).join('|'))
  const beforeZoom = await transforms()
  await viewer.getByRole('button', { name: '放大', exact: true }).click()
  await expect.poll(transforms).not.toBe(beforeZoom)
  await viewer.getByRole('button', { name: '下一张', exact: true }).click()
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 2')
  await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
  await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0 && image.src.includes('airpods')))).toBe(true)
  await expect(viewer.locator('.apple-viewer-image')).toHaveAttribute('src', /airpods/)
  await expect(viewer.locator('.apple-viewer-image')).toBeVisible()
  await expect.poll(() => viewer.locator('.apple-viewer-image').evaluate(element => getComputedStyle(element).opacity)).toBe('1')
  await page.screenshot({ path: '/tmp/apptify-checks/lightbox.png', animations: 'disabled' })
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('forms validate native constraints and submit valid values', async ({ page }) => {
  await openComponent(page, 'apple-form')
  const demo = activeCard(page).locator('.component-demo')
  const name = demo.getByRole('textbox', { name: '姓名', exact: true })
  const email = demo.getByRole('textbox', { name: '邮箱', exact: true })
  await name.fill('')
  await email.fill('')
  await demo.getByRole('button', { name: '提交', exact: true }).click()
  expect(await name.evaluate(element => (element as HTMLInputElement).validity.valueMissing)).toBe(true)
  await expect(name).toBeFocused()
  await name.fill('林初')
  await email.fill('not-an-email')
  await demo.getByRole('button', { name: '提交', exact: true }).click()
  expect(await email.evaluate(element => (element as HTMLInputElement).validity.typeMismatch)).toBe(true)
  await email.fill('lin@example.com')
  await demo.getByRole('button', { name: '提交', exact: true }).click()
  await expect(page.getByText('表单提交成功', { exact: true })).toBeVisible()
})

test('input clearing and autocomplete keyboard selection work', async ({ page }) => {
  await openComponent(page, 'apple-input')
  await activeCard(page).locator('.component-demo').getByRole('textbox', { name: '姓名', exact: true }).fill('测试输入')
  await activeCard(page).locator('.component-demo').getByRole('button', { name: '清空', exact: true }).click()
  await expect(activeCard(page).locator('.component-demo').getByRole('textbox', { name: '姓名', exact: true })).toHaveValue('')
  await openComponent(page, 'apple-autocomplete')
  const input = activeCard(page).locator('.component-demo').getByRole('combobox')
  await input.fill('iPad')
  await expect(page.getByRole('option', { name: 'iPad Pro' })).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(input).toHaveValue('iPad Pro')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})

test('upload accepts images, rejects invalid types, and removes selected files', async ({ page }) => {
  await openComponent(page, 'apple-upload')
  const input = activeCard(page).locator('.component-demo input[type="file"]')
  await input.setInputFiles({ name: 'demo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6iO0AAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('list', { name: '已选择的文件' })).toContainText('demo.png')
  await input.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
  await expect(activeCard(page).locator('.component-demo [role="alert"]')).toContainText('不支持此文件类型')
  await expect(page.getByRole('list', { name: '已选择的文件' })).not.toContainText('invalid.txt')
  await page.getByRole('button', { name: '移除 demo.png', exact: true }).click()
  await expect(page.getByRole('list', { name: '已选择的文件' })).toHaveCount(0)
  await expect(input).toHaveJSProperty('value', '')
})

test('table sorting, page selection, and pagination update visible rows', async ({ page }) => {
  await openComponent(page, 'apple-table')
  const table = page.locator('.apple-table')
  await expect(table.locator('tbody tr')).toHaveCount(3)
  await table.getByRole('button', { name: '名称', exact: true }).click()
  await expect(table.locator('th[aria-sort="ascending"]')).toContainText('名称')
  const ascending = await table.locator('tbody tr td:nth-child(2)').allTextContents()
  expect(ascending).toEqual(['Apple Card', 'Apple Dialog', 'Apple Image'])
  await table.getByRole('checkbox', { name: '选择当前页全部行' }).check()
  await expect(table.locator('tbody tr.is-selected')).toHaveCount(3)
  await table.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(table.locator('tbody tr')).toHaveCount(1)
  await expect(table.locator('tbody')).toContainText('Apple Input')
  await expect(table.getByRole('checkbox', { name: '选择当前页全部行' })).not.toBeChecked()
  await table.getByRole('button', { name: '上一页', exact: true }).click()
  await expect(table.locator('tbody tr.is-selected')).toHaveCount(3)
  await table.getByRole('button', { name: '名称', exact: true }).click()
  await expect(table.locator('th[aria-sort="descending"]')).toContainText('名称')
  await expect(table.locator('tbody tr').first()).toContainText('Apple Input')
})

test('mobile component index locates and dismisses without filtering previews', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/components')
  await page.getByRole('button', { name: '展开目录', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: '组件目录树', exact: true })
  await expect(drawer).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  await page.getByRole('button', { name: '展开目录', exact: true }).click()
  await drawer.getByRole('treeitem', { name: '选择器', exact: true }).click()
  await expect(drawer).toHaveCount(0)
  await expect(page.locator('#apple-select')).toBeInViewport()
  await expect(page.locator('.component-demo')).toHaveCount(catalog.length)
  await expectNoDocumentOverflow(page)
})

test('WebKit mobile smoke covers layout, input, layered overlays, and image viewing', async ({ baseURL }) => {
  test.setTimeout(60_000)
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.stack ?? error.message))
    await page.goto(baseURL!)
    await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
    await loadOverviewImages(page)
    await expectNoDocumentOverflow(page)
    await page.screenshot({ path: '/tmp/apptify-checks/webkit-mobile.png', fullPage: false, animations: 'disabled' })
    await openComponent(page, 'apple-input')
    await activeCard(page).locator('.component-demo').getByRole('textbox', { name: '姓名', exact: true }).fill('移动端输入')
    await expect(activeCard(page).locator('.component-demo').getByRole('textbox', { name: '姓名', exact: true })).toHaveValue('移动端输入')
    await openComponent(page, 'apple-dialog')
    await page.getByRole('button', { name: '多层对话框', exact: true }).click()
    await page.getByRole('button', { name: '打开第二层', exact: true }).click()
    await expect(page.locator('.apple-modal[role="dialog"]')).toHaveCount(2)
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-modal[role="dialog"]')).toHaveCount(1)
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-modal[role="dialog"]')).toHaveCount(0)
    await openComponent(page, 'apple-image')
    const previews = activeCard(page).locator('.component-demo .apple-image__trigger'), count = await previews.count()
    expect(count).toBeGreaterThan(1)
    await previews.first().click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toBeVisible()
    await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0))).toBe(true)
    await swipeImage(viewer)
    await expect(viewer.locator('.apple-viewer-count')).toHaveText(`2 / ${count}`)
    await viewer.getByRole('button', { name: '关闭图片预览', exact: true }).click()
    await expect(viewer).toHaveCount(0)
    await expectNoDocumentOverflow(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('.apple-provider').first()).toHaveAttribute('data-apple-motion', 'reduced')
    expect(errors).toEqual([])
  } finally {
    await browser.close()
  }
})

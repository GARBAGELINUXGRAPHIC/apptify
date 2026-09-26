import { expect, test, webkit, type Page } from '@playwright/test'

async function openComponent(page: Page, tag: string) {
  const navigationToggle = page.getByRole('button', { name: '打开组件导航', exact: true })
  if (await navigationToggle.isVisible() && !await page.locator('.sidebar').evaluate(element => element.classList.contains('is-open'))) {
    await navigationToggle.click()
  }
  await page.getByRole('searchbox', { name: '搜索组件' }).fill(tag)
  if (await navigationToggle.isVisible() && await page.locator('.sidebar').evaluate(element => element.classList.contains('is-open'))) {
    await navigationToggle.click()
  }
  await page.locator('.catalog-item').filter({ has: page.getByText(tag, { exact: true }) }).click()
  await expect(page.locator('.gallery-page')).toHaveCount(1)
  await expect(page.locator('.detail-preview')).toBeVisible()
  await expect(page.locator('.detail-footer')).toContainText(`<${tag} />`)
}

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
  const images = page.locator('.overview .apple-image img')
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
  await expect(page.getByRole('heading', { name: '组件总览。' })).toBeVisible()
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
    const screenshot = await page.screenshot({ path: `artifacts/${viewport.name}.png`, fullPage: true, animations: 'disabled' })
    expect(screenshot.byteLength).toBeGreaterThan(30_000)
  })
}

test('theme changes immediately without navigation and supports named themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const provider = page.locator('.apple-provider').first()
  const background = await provider.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-bg'))
  let navigationCount = 0
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigationCount++ })
  await page.getByRole('button', { name: '切换明暗主题', exact: true }).click()
  await expect(provider).toHaveAttribute('data-apple-theme', 'dark')
  await expect.poll(() => provider.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-bg'))).not.toBe(background)
  expect(navigationCount).toBe(0)
  await loadOverviewImages(page)
  await page.screenshot({ path: 'artifacts/desktop-dark.png', fullPage: true, animations: 'disabled' })
  await page.getByRole('button', { name: '外观设置', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: '外观与动效' })
  await drawer.getByRole('combobox', { name: '主题', exact: true }).click()
  await drawer.getByRole('option', { name: '玫瑰', exact: true }).click()
  await expect(provider).toHaveAttribute('data-apple-theme', 'rose')
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
  expect(navigationCount).toBe(0)
})

test('manual motion levels and operating-system reduced motion stop continuous animation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openComponent(page, 'apple-spinner')
  await page.getByRole('button', { name: '外观设置', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: '外观与动效' })
  await drawer.getByRole('combobox', { name: '动效等级', exact: true }).click()
  await drawer.getByRole('option', { name: '关闭', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('.apple-provider').first()).toHaveAttribute('data-apple-motion', 'none')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await page.getByRole('button', { name: '外观设置', exact: true }).click()
  await drawer.getByRole('combobox', { name: '动效等级', exact: true }).click()
  await drawer.getByRole('option', { name: '完整', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('apple-spin')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.apple-provider').first()).toHaveAttribute('data-apple-motion', 'reduced')
  await expect.poll(() => page.locator('.apple-spinner svg').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await openComponent(page, 'apple-marquee')
  await expect.poll(() => page.locator('.apple-marquee__track').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await expect.poll(() => page.locator('.apple-marquee__track > span').first().evaluate(element => getComputedStyle(element).whiteSpace)).toBe('normal')
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
    await page.getByRole('tab', { name: /^全部组件/ }).click()
    const tags = await page.locator('.catalog-item code').allTextContents()
    expect(tags).toHaveLength(66)
    expect(new Set(tags).size).toBe(tags.length)
    for (const tag of tags) {
      await test.step(tag, async () => {
        await openComponent(page, tag)
        const demo = page.locator('.component-demo')
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
  await expect(page.locator('[role="dialog"]')).toHaveCount(2)
  await expect(second).toHaveAttribute('aria-modal', 'true')
  await expect(first).not.toHaveAttribute('aria-modal', 'true')
  await expect.poll(() => second.evaluate(element => element.contains(document.activeElement))).toBe(true)
  await page.screenshot({ path: 'artifacts/dialog-stack.png', fullPage: true, animations: 'disabled' })
  await page.keyboard.press('Escape')
  await expect(second).toHaveCount(0)
  await expect(first).toBeVisible()
  await expect(first).toHaveAttribute('aria-modal', 'true')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expect(first.getByRole('button', { name: '打开第二层', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(initialOverflow)
  await expect(page.getByRole('button', { name: '多层对话框', exact: true })).toBeFocused()
})

test('image lightbox loads real images, zooms, navigates, and returns focus after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const trigger = page.locator('.media-specimen .apple-image__trigger')
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toBeVisible()
  await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0))).toBe(true)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('1 / 2')
  const transforms = () => viewer.locator('.vel-img-wrapper, .vel-img').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform).join('|'))
  const beforeZoom = await transforms()
  await viewer.getByRole('button', { name: '放大', exact: true }).click()
  await expect.poll(transforms).not.toBe(beforeZoom)
  await viewer.getByRole('button', { name: '下一张', exact: true }).click()
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 2')
  await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0 && image.src.includes('airpods')))).toBe(true)
  await expect(viewer.locator('.vel-img')).toHaveAttribute('src', /airpods/)
  await expect(viewer.locator('.vel-img')).toBeVisible()
  await expect(viewer.locator('.vel-fade-enter-active, .vel-fade-leave-active')).toHaveCount(0)
  await expect.poll(() => viewer.locator('.vel-img').evaluate(element => getComputedStyle(element).opacity)).toBe('1')
  await page.screenshot({ path: 'artifacts/lightbox.png', animations: 'disabled' })
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test('forms validate native constraints and submit valid values', async ({ page }) => {
  await openComponent(page, 'apple-form')
  const demo = page.locator('.component-demo')
  const name = demo.getByLabel('姓名', { exact: true })
  const email = demo.getByLabel('邮箱', { exact: true })
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
  await page.locator('.component-demo').getByLabel('姓名', { exact: true }).fill('测试输入')
  await page.locator('.component-demo').getByRole('button', { name: '清空', exact: true }).click()
  await expect(page.locator('.component-demo').getByLabel('姓名', { exact: true })).toHaveValue('')
  await openComponent(page, 'apple-autocomplete')
  const input = page.locator('.component-demo').getByRole('combobox')
  await input.fill('iPad')
  await expect(page.getByRole('option', { name: 'iPad Pro' })).toBeVisible()
  await input.press('ArrowDown')
  await input.press('Enter')
  await expect(input).toHaveValue('iPad Pro')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})

test('upload accepts images, rejects invalid types, and removes selected files', async ({ page }) => {
  await openComponent(page, 'apple-upload')
  const input = page.locator('.component-demo input[type="file"]')
  await input.setInputFiles({ name: 'demo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6iO0AAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('list', { name: '已选择的文件' })).toContainText('demo.png')
  await input.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') })
  await expect(page.locator('.component-demo [role="alert"]')).toContainText('不支持此文件类型')
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

test('mobile navigation and search can open, filter, select, and dismiss', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: '打开组件导航', exact: true }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/is-open/)
  const search = page.getByRole('searchbox', { name: '搜索组件' })
  await search.fill('no-such-component')
  const scrim = page.getByRole('button', { name: '关闭导航', exact: true })
  const scrimBox = await scrim.boundingBox()
  expect(scrimBox).not.toBeNull()
  await scrim.click({ position: { x: scrimBox!.width - 12, y: 20 } })
  await expect(page.getByRole('heading', { name: '没有找到相关组件' })).toBeVisible()
  await openComponent(page, 'apple-tabs')
  await expect(page.locator('.sidebar')).not.toHaveClass(/is-open/)
  await page.locator('.component-demo').getByRole('tab', { name: '技术规格', exact: true }).click()
  await expect(page.locator('.component-demo [role="tabpanel"]:not([aria-hidden="true"])')).toContainText('这里是技术规格。')
  await expectNoDocumentOverflow(page)
  await page.getByRole('button', { name: '打开组件导航', exact: true }).click()
  await page.getByRole('button', { name: '清除搜索', exact: true }).click()
  await expect(search).toHaveValue('')
  await page.locator('.sidebar').getByRole('button', { name: /^表单/ }).click()
  await expect(page.locator('.sidebar')).not.toHaveClass(/is-open/)
  await expect(page.getByRole('heading', { name: '表单。' })).toBeVisible()
  expect(await page.locator('.catalog-item').count()).toBeGreaterThan(10)
  await page.screenshot({ path: 'artifacts/mobile-catalog.png', fullPage: true, animations: 'disabled' })
})

test('WebKit mobile smoke covers layout, input, layered overlays, and image viewing', async ({ baseURL }) => {
  test.setTimeout(60_000)
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.stack ?? error.message))
    await page.goto(baseURL!)
    await expect(page.getByRole('heading', { name: '组件总览。' })).toBeVisible()
    await loadOverviewImages(page)
    await expectNoDocumentOverflow(page)
    await page.screenshot({ path: 'artifacts/webkit-mobile.png', fullPage: true, animations: 'disabled' })
    await openComponent(page, 'apple-input')
    await page.locator('.component-demo').getByLabel('姓名', { exact: true }).fill('移动端输入')
    await expect(page.locator('.component-demo').getByLabel('姓名', { exact: true })).toHaveValue('移动端输入')
    await openComponent(page, 'apple-dialog')
    await page.getByRole('button', { name: '多层对话框', exact: true }).click()
    await page.getByRole('button', { name: '打开第二层', exact: true }).click()
    await expect(page.locator('[role="dialog"]')).toHaveCount(2)
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).toHaveCount(1)
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
    await openComponent(page, 'apple-image')
    await page.locator('.component-demo .apple-image__trigger').click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toBeVisible()
    await expect.poll(() => viewer.locator('img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth > 0))).toBe(true)
    await viewer.getByRole('button', { name: '下一张', exact: true }).click()
    await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 2')
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

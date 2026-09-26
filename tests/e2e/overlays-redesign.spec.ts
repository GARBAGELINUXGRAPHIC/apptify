import { expect, test, type Page } from '@playwright/test'

async function openComponent(page: Page, tag: string) {
  const navigation = page.getByRole('button', { name: '打开组件导航', exact: true })
  if (await navigation.isVisible()) await navigation.click()
  await page.getByRole('searchbox', { name: '搜索组件' }).fill(tag)
  if (await navigation.isVisible()) await navigation.click()
  await expect(page.locator('.gallery-page.apple-page-leave-active, .gallery-view.apple-slide-x-leave-active')).toHaveCount(0)
  await page.locator('.catalog-item').filter({ has: page.getByText(tag, { exact: true }) }).click()
  await expect(page.locator('.gallery-page.apple-page-leave-active, .gallery-view.apple-slide-x-leave-active')).toHaveCount(0)
  await expect(page.locator('.detail-footer')).toContainText(`<${tag} />`)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '组件总览。' })).toBeVisible()
})

for (const width of [1440, 390]) {
  for (const example of [
    { tag: 'apple-dialog', trigger: '打开对话框', title: '保存更改？', axis: 'y' },
    { tag: 'apple-drawer', trigger: '打开抽屉', title: '偏好设置', axis: 'x' },
    { tag: 'apple-sheet', trigger: '打开底部面板', title: '分享这份灵感', axis: 'y' },
  ]) {
    test(`${example.tag} keeps its DOM and scroll lock during a moving exit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await openComponent(page, example.tag)
      const trigger = page.getByRole('button', { name: example.trigger, exact: true })
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: example.title, exact: true })
      await expect(dialog).toBeVisible()
      await expect(page.locator('.apple-modal-presence-enter-active')).toHaveCount(0)
      await page.keyboard.press('Escape')
      await expect(page.locator('.apple-modal-presence-leave-active')).toHaveCount(1)
      expect(await dialog.count()).toBe(1)
      expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
      const moving = await dialog.evaluate(async (element, axis) => {
        await new Promise(resolve => setTimeout(resolve, 80))
        const style = getComputedStyle(element)
        const matrix = new DOMMatrixReadOnly(style.transform)
        return { offset: axis === 'x' ? matrix.m41 : matrix.m42, opacity: style.opacity }
      }, example.axis)
      expect(moving.offset).toBeGreaterThan(0)
      expect(moving.opacity).toBe('1')
      await expect(dialog).toHaveCount(0)
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
      await expect(trigger).toBeFocused()
    })
  }

  test(`image viewer uses wheel zoom and fades out without releasing its lock early at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openComponent(page, 'apple-image-viewer')
    const trigger = page.getByRole('button', { name: '浏览照片', exact: true })
    await trigger.click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toBeVisible()
    await expect(viewer.locator('.vel-img')).toBeVisible()
    await expect.poll(() => viewer.locator('.vel-img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    const before = await viewer.locator('.vel-img-wrapper').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)
    await viewer.locator('.vel-img').hover()
    await page.mouse.wheel(0, -120)
    await expect.poll(() => viewer.locator('.vel-img-wrapper').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeGreaterThan(before)
    await viewer.getByRole('button', { name: '下一张', exact: true }).click()
    await expect(viewer.locator('.vel-img')).toHaveAttribute('src', /airpods-max-orange/)
    await expect(viewer.locator('.vel-img')).toBeVisible()
    await expect(viewer.locator('.vel-fade-enter-active, .vel-fade-leave-active')).toHaveCount(0)
    const displayed = await viewer.locator('.vel-img').evaluate(element => {
      const image = element as HTMLImageElement
      const rect = image.getBoundingClientRect()
      return { width: rect.width, height: rect.height, naturalWidth: image.naturalWidth, opacity: Number(getComputedStyle(image.parentElement!).opacity) }
    })
    expect(displayed.width).toBeGreaterThan(250)
    expect(displayed.height).toBeGreaterThan(250)
    expect(displayed.naturalWidth).toBeGreaterThan(0)
    expect(displayed.opacity).toBe(1)
    await page.screenshot({ path: `artifacts/lightbox-redesign-${width}.png` })
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-viewer-presence-leave-active')).toHaveCount(1)
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    const fading = await viewer.evaluate(async element => {
      await new Promise(resolve => setTimeout(resolve, 80))
      return Number(getComputedStyle(element).opacity)
    })
    expect(fading).toBeGreaterThan(0)
    expect(fading).toBeLessThan(1)
    await expect(viewer).toHaveCount(0)
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
    await expect(trigger).toBeFocused()
  })
}

test('service toasts slide left into position and slide right out, without an opacity fade', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openComponent(page, 'apple-snackbar')
  await page.getByRole('button', { name: '成功提示', exact: true }).click()
  const toast = page.locator('.apple-snackbar').filter({ hasText: '你的更改已保存' })
  await expect(toast).toHaveCount(1)
  const entering = await toast.evaluate(element => ({ x: new DOMMatrixReadOnly(getComputedStyle(element).transform).m41, opacity: getComputedStyle(element).opacity }))
  expect(entering.x).toBeGreaterThan(0)
  expect(entering.opacity).toBe('1')
  await expect(page.locator('.apple-toast-enter-active')).toHaveCount(0)
  expect(await toast.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41)).toBe(0)
  await toast.getByRole('button', { name: '关闭通知' }).click()
  await expect(page.locator('.apple-toast-leave-active')).toHaveCount(1)
  const leaving = await toast.evaluate(async element => {
    await new Promise(resolve => setTimeout(resolve, 80))
    return { x: new DOMMatrixReadOnly(getComputedStyle(element).transform).m41, opacity: getComputedStyle(element).opacity }
  })
  expect(leaving.x).toBeGreaterThan(0)
  expect(leaving.opacity).toBe('1')
  await expect(toast).toHaveCount(0)
})

test('popover uses translucent backdrop filtering and retains its panel through leave', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openComponent(page, 'apple-popover')
  const trigger = page.getByRole('button', { name: '更多选项', exact: true })
  await trigger.click()
  const popover = page.locator('.apple-popover')
  await expect(popover).toBeVisible()
  const glass = await popover.evaluate(element => {
    const style = getComputedStyle(element)
    return { filter: style.backdropFilter, background: style.backgroundColor }
  })
  expect(glass.filter).toContain('blur(')
  expect(glass.background).toMatch(/(?:0\.82|82%)/)
  await page.keyboard.press('Escape')
  await expect(page.locator('.apple-popover-presence-leave-active')).toHaveCount(1)
  await expect(popover).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('closing a nested dialog does not expose the lower layer to a second Escape until leave finishes', async ({ page }) => {
  await openComponent(page, 'apple-dialog')
  await page.getByRole('button', { name: '多层对话框', exact: true }).click()
  await page.getByRole('button', { name: '打开第二层', exact: true }).click()
  const top = page.getByRole('dialog', { name: '第二层对话框', exact: true })
  const lower = page.getByRole('dialog', { name: '第一层对话框', exact: true })
  await expect(top).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await expect(top).toHaveCount(0)
  await expect(lower).toBeVisible()
  await expect(lower).toHaveAttribute('aria-modal', 'true')
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(lower).toHaveCount(0)
})

test('Escape closes the theme list before its containing preferences drawer', async ({ page }) => {
  await page.getByRole('button', { name: '外观设置', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: '外观与动效', exact: true })
  const theme = drawer.getByRole('combobox', { name: '主题', exact: true })
  await theme.click()
  await expect(drawer.getByRole('listbox')).toBeVisible()
  await theme.press('Escape')
  await expect(drawer.getByRole('listbox')).toHaveCount(0)
  await expect(drawer).toBeVisible()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await theme.press('Escape')
  await expect(drawer).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

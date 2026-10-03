import { activeCard, openComponent } from './component-navigation'
import { expect, test, type Page } from '@playwright/test'



test('image wheel zoom responds to tiny deltas and preserves its focal point across event batches', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openComponent(page, 'apple-image')
  await activeCard(page).locator('.apple-image__trigger').first().click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  const image = viewer.locator('.apple-viewer-image')
  const canvas = viewer.locator('.apple-viewer-canvas')
  await expect(image).toBeVisible()
  await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
  const scale = () => canvas.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)
  const original = (await image.boundingBox())!
  const point = { x: original.x + original.width * 0.3, y: original.y + original.height * 0.4 }
  await viewer.dispatchEvent('wheel', { deltaY: -0.5, clientX: point.x, clientY: point.y })
  await expect.poll(scale).toBeCloseTo(Math.exp(0.001), 5)
  await viewer.evaluate((element, point) => {
    for (let i = 0; i < 24; i++) element.dispatchEvent(new WheelEvent('wheel', { deltaY: -10, clientX: point.x, clientY: point.y, bubbles: true, cancelable: true }))
  }, point)
  await expect.poll(scale).toBeCloseTo(Math.exp(0.481), 5)
  const zoomed = (await image.boundingBox())!
  expect(zoomed.x + zoomed.width * 0.3).toBeCloseTo(point.x, 1)
  expect(zoomed.y + zoomed.height * 0.4).toBeCloseTo(point.y, 1)
  await page.waitForTimeout(150)
  await expect.poll(scale).toBeCloseTo(Math.exp(0.481), 5)
  await viewer.dispatchEvent('wheel', { deltaY: 240.5, clientX: point.x, clientY: point.y })
  await expect.poll(scale).toBeCloseTo(1, 5)
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await page.mouse.move(point.x + 40, point.y + 30, { steps: 5 })
  await page.mouse.up()
  await expect.poll(async () => (await image.boundingBox())!.x).toBeCloseTo(original.x + 40, 1)
  await viewer.getByRole('button', { name: '旋转', exact: true }).click()
  await expect(image).toHaveCSS('transform', 'matrix(0, -1, 1, 0, 0, 0)')
  await page.screenshot({ path: '/tmp/apptify-checks/image-continuous-zoom.png' })
  await viewer.getByRole('button', { name: '下一张', exact: true }).click()
  await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
  await expect(image).toHaveAttribute('src', /airpods/)
  await expect(image).toBeVisible()
  await expect.poll(scale).toBeCloseTo(1, 5)
  await expect(image).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})

for (const width of [390, 1440]) {
  test(`compact image hover keeps its surface and layout stationary at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openComponent(page, 'apple-image')
    const figure = activeCard(page).locator('.component-demo .apple-image').first()
    const surface = figure.locator('.apple-image__surface')
    await expect(figure).toHaveClass(/apple-image--loaded/)
    await figure.scrollIntoViewIfNeeded()
    const bounds = await figure.boundingBox()
    const footer = await activeCard(page).locator('.component-source').boundingBox()
    // Move the pointer without Playwright scrolling the layout during the measurement.
    const surfaceBounds = (await surface.boundingBox())!
    await page.mouse.move(surfaceBounds.x + surfaceBounds.width / 2, surfaceBounds.y + surfaceBounds.height / 2)
    await expect(surface).toHaveCSS('transform', 'none')
    expect(await figure.boundingBox()).toEqual(bounds)
    expect(await activeCard(page).locator('.component-source').boundingBox()).toEqual(footer)
    expect(await figure.evaluate(element => getComputedStyle(element).transform)).toBe('none')
    await page.screenshot({ path: `/tmp/apptify-checks/image-hover-${width}.png` })
    await figure.locator('.apple-image__trigger').first().click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toBeVisible()
    const viewerBounds = await viewer.boundingBox()
    expect(viewerBounds?.width).toBe(width)
    expect(viewerBounds?.height).toBe(900)
    await page.keyboard.press('Escape')
    await expect(viewer).toHaveCount(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await surface.hover()
    await expect.poll(() => surface.evaluate(element => getComputedStyle(element).transform)).toBe('none')
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
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
      if (example.tag === 'apple-dialog') {
        expect(Number(moving.opacity)).toBeGreaterThan(0)
        expect(Number(moving.opacity)).toBeLessThan(1)
      } else expect(moving.opacity).toBe('1')
      await expect(dialog).toHaveCount(0)
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
      await expect(trigger).toBeFocused()
    })
  }

  test(`image preview uses wheel zoom and returns to its thumbnail while retaining its lock at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openComponent(page, 'apple-image')
    const trigger = activeCard(page).locator('.apple-image__trigger').first()
    await trigger.click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toBeVisible()
    await expect(viewer.locator('.apple-viewer-image')).toBeVisible()
    await expect.poll(() => viewer.locator('.apple-viewer-image').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    const before = await viewer.locator('.apple-viewer-canvas').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)
    await viewer.hover()
    await page.mouse.wheel(0, -120)
    await expect.poll(() => viewer.locator('.apple-viewer-canvas').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeGreaterThan(before)
    await viewer.getByRole('button', { name: '下一张', exact: true }).click()
    await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
    await expect(viewer.locator('.apple-viewer-image')).toHaveAttribute('src', /airpods-max-orange/)
    await expect(viewer.locator('.apple-viewer-image')).toBeVisible()
    const displayed = await viewer.locator('.apple-viewer-image').evaluate(element => {
      const image = element as HTMLImageElement
      const rect = image.getBoundingClientRect()
      return { width: rect.width, height: rect.height, naturalWidth: image.naturalWidth, opacity: Number(getComputedStyle(image.parentElement!).opacity) }
    })
    expect(displayed.width).toBeGreaterThan(250)
    expect(displayed.height).toBeGreaterThan(250)
    expect(displayed.naturalWidth).toBeGreaterThan(0)
    expect(displayed.opacity).toBe(1)
    await page.screenshot({ path: `/tmp/apptify-checks/lightbox-redesign-${width}.png` })
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-viewer-presence-leave-active')).toHaveCount(1)
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    // AppleImage supplies an origin: its loaded photo flies back to the
    // thumbnail, while the panel itself stays opaque until the flight ends.
    await expect(viewer.locator('.apple-viewer-return-photo')).toHaveCount(1)
    const returning = await viewer.locator('.apple-viewer-return-photo').evaluate(element => {
      const animation = element.getAnimations()[0]!
      const frames = (animation.effect as KeyframeEffect).getKeyframes()
      return { duration: animation.effect!.getTiming().duration, from: frames[0]!.transform, to: frames.at(-1)!.transform }
    })
    expect(returning.duration).toBe(300)
    expect(returning.from).not.toBe(returning.to)
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
  expect(glass.filter).toBe('blur(12px) saturate(2)')
  expect(glass.background).toBe('rgba(255, 255, 255, 0.314)')
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

test('account example replaces its popup and Escape returns to the page', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '打开用户菜单', exact: true })
  await trigger.click()
  const popup = page.getByRole('dialog', { name: '用户菜单', exact: true })
  await popup.getByRole('button', { name: /Login/ }).click()
  const dialog = page.getByRole('dialog', { name: '登录示例', exact: true })
  await expect(dialog).toBeVisible()
  await expect(popup).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

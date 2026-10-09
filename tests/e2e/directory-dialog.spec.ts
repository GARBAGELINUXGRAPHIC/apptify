import { waitForPageLayout } from './component-navigation'
import { test, expect } from '@playwright/test'

for (const [path, title, treeName, itemName, hash] of [
  ['/components', '组件目录', '组件目录树', '按钮', '#apple-button'],
  ['/component-docs/apple-input', '本页接口', '组件 API 树', 'clearable', '#prop-clearable'],
]) {
  test(`${title} uses a dialog below backtop when the sidebar cannot fit`, async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 720 })
    await page.goto(path)
    await waitForPageLayout(page)
    const toggle = page.getByRole('button', { name: `展开${title}` })
    await expect(toggle).toBeVisible()
    await expect(page.locator('.directory-index')).toBeHidden()
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
    const backtop = page.getByRole('group', { name: '页面导航' }).getByRole('button', { name: '回到顶部' })
    await expect(backtop).toBeVisible()
    if (path === '/components') {
      const preview = page.locator('#apple-floating-group .demo-floating-preview')
      await expect(preview.locator('.apple-floating-group')).toHaveCSS('position', 'relative')
      await expect(preview.getByRole('button', { name: '回到顶部' })).toHaveCount(1)
      await expect(page.locator('.apple-floating-group').filter({ has: page.locator('.directory-toggle') })).toHaveCount(1)
      expect(await page.locator('.apple-floating-group').evaluateAll(groups => groups.filter(group => getComputedStyle(group).position === 'fixed').length)).toBe(1)
    }
    await expect.poll(async () => {
      const topBounds = await backtop.boundingBox()
      const toggleBounds = await toggle.boundingBox()
      return toggleBounds!.y >= topBounds!.y + topBounds!.height + 9
    }).toBe(true)
    await toggle.click()
    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('tree', { name: treeName }).getByRole('treeitem', { name: itemName, exact: true }).click()
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(new RegExp(`${hash}$`))
    await expect.poll(() => page.locator(hash).evaluate(element => Math.abs(element.getBoundingClientRect().top - 96))).toBeLessThanOrEqual(2)
    await toggle.click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(toggle).toBeFocused()
    await page.setViewportSize({ width: 390, height: 720 })
    await toggle.click()
    await expect(dialog).toBeVisible()
    await waitForPageLayout(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(toggle).toBeHidden()
    await expect(page.locator('.directory-index')).toBeVisible()
    expect(await page.locator('.directory-index').evaluate(element => getComputedStyle(element).position)).toBe('sticky')
  })
}

test('the floating menu shares the navigation layer and fades in left during image return', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 720 })
  await page.goto('/components#apple-image')
  await waitForPageLayout(page)
  const menu = page.locator('.apple-floating-group').filter({ has: page.locator('.directory-toggle') })
  await page.locator('#apple-image .apple-image__trigger').first().click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await expect(menu).toHaveAttribute('inert', '')
  await expect(menu).toHaveCSS('opacity', '0')
  await expect(menu).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 12, 0)')
  const returning = await viewer.evaluate(async panel => {
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    const toggle = document.querySelector('.directory-toggle')!, menu = toggle.closest('.apple-floating-group')!
    for (let frame = 0; frame < 30 && !menu.getAnimations().length; frame++) await new Promise(requestAnimationFrame)
    const animations = [...panel.getAnimations({ subtree: true }), ...menu.getAnimations()]
    animations.forEach(animation => { animation.pause(); animation.currentTime = 150 })
    const css = getComputedStyle(menu), bounds = toggle.getBoundingClientRect()
    const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
    const result = { phase: panel.getAttribute('data-phase'), z: Number(css.zIndex), navZ: Number(getComputedStyle(document.querySelector('.apple-navibar__bar')!).zIndex),
      viewerZ: Number(getComputedStyle(panel).zIndex), x: new DOMMatrixReadOnly(css.transform).m41, opacity: Number(css.opacity), onTop: hit?.closest('.apple-floating-group') === menu }
    animations.forEach(animation => animation.play())
    return result
  })
  expect(returning.phase).toBe('closing')
  expect(returning.z).toBe(returning.navZ)
  expect(returning.z).toBeGreaterThan(returning.viewerZ)
  expect(returning.x).toBeGreaterThan(0)
  expect(returning.x).toBeLessThan(12)
  expect(returning.opacity).toBeGreaterThan(0)
  expect(returning.opacity).toBeLessThan(1)
  expect(returning.onTop).toBe(true)
  await expect(viewer).toHaveCount(0)
  await expect(menu).toHaveCSS('opacity', '1')
  await expect(menu).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await expect(menu).not.toHaveAttribute('inert')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(menu).toHaveCSS('transition-duration', '0s')
})

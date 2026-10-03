import { openComponent } from './component-navigation'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.goto('/') })

test('mobile menu animates height, dims the page, and reverses cleanly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  const navibar = page.locator('.apple-navibar').first()
  const panel = navibar.locator('.apple-navibar__menu')
  const backdrop = navibar.locator('.apple-navibar__backdrop')
  const sample = await navibar.evaluate(async element => {
    const panel = element.querySelector<HTMLElement>('.apple-navibar__menu')!
    const backdrop = element.querySelector<HTMLElement>('.apple-navibar__backdrop')!
    element.querySelector<HTMLButtonElement>('.apple-navibar__toggle')!.click()
    await new Promise(resolve => setTimeout(resolve, 80))
    return { height: panel.getBoundingClientRect().height, target: parseFloat(panel.style.height), opacity: Number(getComputedStyle(backdrop).opacity), transition: getComputedStyle(panel).transitionProperty }
  })
  expect(sample.transition).toContain('height')
  expect(sample.height).toBeGreaterThan(0)
  expect(sample.height).toBeLessThan(sample.target)
  expect(sample.opacity).toBeGreaterThan(0)
  expect(sample.opacity).toBeLessThan(1)
  await expect(backdrop).toHaveCSS('opacity', '1')
  await page.screenshot({ path: '/tmp/apptify-checks/navibar-dimmed.png', animations: 'disabled' })
  const closing = await navibar.evaluate(async element => {
    const panel = element.querySelector<HTMLElement>('.apple-navibar__menu')!
    const before = panel.getBoundingClientRect().height
    element.querySelector<HTMLElement>('.apple-navibar__backdrop')!.click()
    await new Promise(resolve => setTimeout(resolve, 80))
    return { before, height: panel.getBoundingClientRect().height, inert: panel.inert }
  })
  expect(closing.height).toBeGreaterThan(0)
  expect(closing.height).toBeLessThan(closing.before)
  expect(closing.inert).toBe(true)
  await expect(panel).toBeHidden()
  await expect(backdrop).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await navibar.locator('.apple-navibar__toggle').click()
  await expect(panel).toHaveCSS('transition-duration', '0s')
  await expect(backdrop).toHaveCSS('opacity', '1')
  await page.keyboard.press('Escape')
  await expect(backdrop).toBeHidden()
})

for (const width of [320, 390, 768, 1440]) {
  test(`navibar stays fixed and fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const bar = page.locator('.apple-navibar__bar').first()
    const toggle = bar.getByRole('button', { name: '打开主导航', exact: true })
    if (width <= 640) await expect(toggle).toBeVisible()
    else await expect(toggle).toBeHidden()
    await expect(bar).toHaveCSS('position', 'fixed')
    await expect(bar).toHaveCSS('backdrop-filter', 'none')
    const before = (await bar.boundingBox())!
    await expect.poll(async () => (await bar.boundingBox())!.width).toBe(width)
    expect(before.height).toBe(width <= 640 ? 58 : 64)
    const boxes = await bar.locator('.brand, .user-trigger, .apple-navibar__toggle:not([hidden])').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().toJSON()).sort((a, b) => a.left - b.left))
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.left).toBeGreaterThanOrEqual(boxes[i - 1]!.right)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 500) })
    expect((await bar.boundingBox())!.y).toBe(0)
    expect((await bar.boundingBox())!.height).toBe(before.height)
    await page.screenshot({ path: `/tmp/apptify-checks/navibar-${width}.png`, animations: 'disabled' })
  })
}

test('mobile disclosure selects routes, handles Escape and outside clicks, and resets on resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  const bar = page.locator('.apple-navibar__bar').first()
  const toggle = bar.locator('.apple-navibar__toggle')
  const nav = bar.getByRole('navigation', { name: '主导航' })
  await toggle.click()
  await expect(nav).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await toggle.press('ArrowDown')
  await expect(nav.getByRole('link', { name: '首页', exact: true })).toBeFocused()
  await page.screenshot({ path: '/tmp/apptify-checks/navibar-mobile-open.png', animations: 'disabled' })
  await nav.getByRole('link', { name: '设置', exact: true }).click()
  await expect(nav).toBeHidden()
  await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeVisible()
  await toggle.focus()
  await page.keyboard.press('ArrowDown')
  await expect(nav.getByRole('link', { name: '首页', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(nav).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await page.mouse.click(380, 500)
  await expect(nav).toBeHidden()
  await toggle.click()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(toggle).toBeHidden()
  await expect(nav).toBeVisible()
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(nav).toBeHidden()
})

test('embedded navibar collapses by container width without fixing itself to the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openComponent(page, 'apple-navibar')
  const demo = page.locator('.component-demo .apple-navibar')
  await expect(demo).toBeVisible()
  await expect(demo.locator('.apple-navibar__bar')).toHaveCSS('position', 'relative')
  await demo.evaluate(element => { (element as HTMLElement).style.width = '350px' })
  const toggle = demo.getByRole('button', { name: '打开示例导航' })
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(demo.getByRole('navigation', { name: '示例导航' })).toBeVisible()
  await page.screenshot({ path: '/tmp/apptify-checks/navibar-embedded.png', animations: 'disabled' })
})

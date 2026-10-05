import { expect, test, type Locator, type Page } from '@playwright/test'
import { openComponent, waitForPageLayout } from './component-navigation'

const alpha = async (panel: Locator) => panel.evaluate(el => {
  const match = getComputedStyle(el).backgroundColor.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
  return match ? Number(match[1]) : 1
})
async function setSlider(slider: Locator, value: number) {
  await slider.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement
    input.value = String(nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}
async function preview(page: Page) {
  const combo = page.getByRole('combobox', { name: '点击查看效果', exact: true })
  if (await combo.getAttribute('aria-expanded') !== 'true') await combo.click()
  const menu = page.locator('#setting-glass .apple-field-menu')
  await expect(menu).toBeVisible()
  return menu
}

test('glass defaults reach the real dropdown and correctly labeled sliders', async ({ page }) => {
  await page.goto('/settings')
  const opacity = page.getByRole('slider', { name: '玻璃不透明度', exact: true })
  const blur = page.getByRole('slider', { name: '玻璃模糊', exact: true })
  await expect(opacity).toHaveAttribute('min', '0')
  await expect(opacity).toHaveAttribute('max', '100')
  await expect(opacity).toHaveAttribute('aria-valuetext', '50%')
  await expect(blur).toHaveValue('12')
  await expect(blur).toHaveAttribute('min', '2')
  await expect(blur).toHaveAttribute('max', '22')
  await expect(blur).toHaveAttribute('step', '1')
  await expect(blur).toHaveClass(/apple-slider/)
  const menu = await preview(page)
  await expect(menu).toHaveCSS('backdrop-filter', 'blur(12px) saturate(2)')
  expect(await alpha(menu)).toBeCloseTo(.5, 3)
  await page.getByRole('option', { name: 'Item 2', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '点击查看效果' })).toContainText('Item 2')
})

test('glass sliders update the dropdown, persist across routes and reset with all preferences', async ({ page }) => {
  await page.goto('/settings')
  await setSlider(page.getByRole('slider', { name: '玻璃不透明度' }), 72.5)
  await setSlider(page.getByRole('slider', { name: '玻璃模糊' }), 19)
  const menu = await preview(page)
  await expect(menu).toHaveCSS('backdrop-filter', 'blur(19px) saturate(2)')
  expect(await alpha(menu)).toBeCloseTo(.725, 3)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '深色', exact: true }).click()
  await page.getByRole('radiogroup', { name: '全局动效' }).getByText('关闭', { exact: true }).click()
  await page.goto('/')
  await page.goto('/settings')
  await page.reload()
  await expect(page.getByRole('slider', { name: '玻璃不透明度' })).toHaveValue('72.5')
  await expect(page.getByRole('slider', { name: '玻璃模糊' })).toHaveValue('19')
  await expect(page.getByRole('button', { name: '深色', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '恢复默认设置', exact: true }).click()
  await expect(page.getByRole('slider', { name: '玻璃不透明度' })).toHaveAttribute('aria-valuetext', '50%')
  await expect(page.getByRole('slider', { name: '玻璃模糊' })).toHaveValue('12')
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-theme', 'light')
  await page.reload()
  expect(await alpha(await preview(page))).toBeCloseTo(.5, 3)
})

test('opacity endpoints are not inverted and blur supports keyboard bounds', async ({ page }) => {
  await page.goto('/settings')
  const opacity = page.getByRole('slider', { name: '玻璃不透明度' })
  const blur = page.getByRole('slider', { name: '玻璃模糊' })
  await opacity.focus()
  await opacity.press('Home')
  await expect(opacity).toHaveAttribute('aria-valuetext', '0%')
  expect(await alpha(await preview(page))).toBe(0)
  await opacity.focus()
  await opacity.press('End')
  await expect(opacity).toHaveAttribute('aria-valuetext', '100%')
  expect(await alpha(await preview(page))).toBe(1)
  await blur.focus()
  await blur.press('Home')
  await expect(blur).toHaveValue('2')
  await blur.press('ArrowRight')
  await expect(blur).toHaveValue('3')
  await blur.press('End')
  await expect(blur).toHaveValue('22')
  await blur.press('ArrowRight')
  await expect(blur).toHaveValue('22')
})

test('glass dropdown variables reach select, date and popover while navbar and account surfaces stay solid', async ({ page }) => {
  await page.goto('/settings')
  await setSlider(page.getByRole('slider', { name: '玻璃不透明度', exact: true }), 60)
  await setSlider(page.getByRole('slider', { name: '玻璃模糊', exact: true }), 22)
  const navbar = page.locator('.apple-navibar__bar')
  for (const [theme, background] of [['浅色', 'rgb(255, 255, 255)'], ['深色', 'rgb(0, 0, 0)']]) {
    await page.getByRole('button', { name: theme, exact: true }).click()
    await expect(navbar).toHaveCSS('backdrop-filter', 'none')
    await expect(navbar).toHaveCSS('background-color', background)
    expect(await alpha(navbar)).toBe(1)
  }
  await openComponent(page, 'apple-select')
  await page.locator('#apple-select').getByRole('combobox').click()
  const select = page.locator('#apple-select .apple-field-menu')
  await expect(select).toHaveCSS('backdrop-filter', 'blur(22px) saturate(2)')
  expect(await alpha(select)).toBeCloseTo(.6, 3)
  await openComponent(page, 'apple-date-picker')
  await page.locator('#apple-date-picker').getByRole('button', { name: '打开日历', exact: true }).click()
  const date = page.locator('#apple-date-picker .apple-date-menu')
  await expect(date).toHaveCSS('backdrop-filter', 'blur(22px) saturate(2)')
  expect(await alpha(date)).toBeCloseTo(.6, 3)
  await openComponent(page, 'apple-popover')
  await page.locator('#apple-popover').getByRole('button').first().click()
  const activePopover = page.locator('.apple-popover:not(.user-popup)')
  await expect(activePopover).toHaveCSS('backdrop-filter', 'blur(22px) saturate(2)')
  expect(await alpha(activePopover)).toBeCloseTo(.6, 3)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '打开用户菜单', exact: true }).click()
  const account = page.getByRole('dialog', { name: '用户菜单', exact: true })
  await expect(account).toHaveCSS('backdrop-filter', 'none')
  expect(await alpha(account)).toBe(1)
  await account.getByRole('button', { name: /登录.*Login/ }).click()
  const login = page.locator('.user-auth-dialog')
  await expect(login).toBeVisible()
  await expect(login).toHaveCSS('backdrop-filter', 'none')
  expect(await alpha(login)).toBe(1)
})

for (const width of [320, 1440]) {
  test(`glass controls and dropdown fit at ${width}px in light and dark themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/settings')
    for (const theme of ['浅色', '深色']) {
      await page.getByRole('button', { name: theme, exact: true }).click()
      const menu = await preview(page)
      await waitForPageLayout(page)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      const bounds = (await menu.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await page.screenshot({ path: `/tmp/apptify-glass-${width}-${theme === '深色' ? 'dark' : 'light'}.png` })
    }
  })
}

for (const width of [320, 1440]) {
  test(`dark dropdown keeps light text on black glass across opacity values at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/settings')
    await page.getByRole('button', { name: '深色', exact: true }).click()
    const opacity = page.getByRole('slider', { name: '玻璃不透明度' })
    for (const value of [0, 31.4, 60, 100]) {
      await setSlider(opacity, value)
      const menu = await preview(page)
      await expect(menu).toHaveCSS('color', 'rgb(238, 238, 239)')
      await expect(menu.getByRole('option').first()).toHaveCSS('color', 'rgb(238, 238, 239)')
      expect(await alpha(menu)).toBeCloseTo(value / 100, 3)
      await expect(menu).toHaveCSS('background-color', value === 100 ? 'rgb(0, 0, 0)' : `rgba(0, 0, 0, ${value / 100})`)
      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
    }
    await page.getByRole('button', { name: '恢复默认设置', exact: true }).click()
    await expect(opacity).toHaveAttribute('aria-valuetext', '50%')
    await expect(page.getByRole('slider', { name: '玻璃模糊' })).toHaveValue('12')
  })
}

test('the moving color sample follows motion policy while real dropdown blur updates in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/settings')
  const blur = page.getByRole('slider', { name: '玻璃模糊' })
  await expect(page.locator('.glass-sample-colors > span')).toHaveCount(3)
  for (const theme of ['浅色', '深色']) {
    await page.getByRole('button', { name: theme, exact: true }).click()
    for (const value of [2, 12, 22]) {
      await setSlider(blur, value)
      await expect(await preview(page)).toHaveCSS('backdrop-filter', `blur(${value}px) saturate(2)`)
      await page.keyboard.press('Escape')
    }
  }
  await page.getByRole('radiogroup', { name: '全局动效' }).getByText('完整', { exact: true }).click()
  await expect(page.locator('.glass-sample-colors')).toHaveCSS('animation-name', /sample-glass/)
  await page.getByRole('radiogroup', { name: '全局动效' }).getByText('关闭', { exact: true }).click()
  await expect(page.locator('.glass-sample-colors')).toHaveCSS('animation-name', 'none')
})

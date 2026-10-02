import { expect, test, type Locator } from '@playwright/test'
import { openComponent } from './component-navigation'

const alpha = async (panel: Locator) => panel.evaluate(el => {
  const color = getComputedStyle(el).backgroundColor
  const match = color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
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

test('glass defaults preserve the old alpha and expose correctly labeled library sliders', async ({ page }) => {
  await page.goto('/settings')
  const opacity = page.getByRole('slider', { name: '玻璃不透明度', exact: true })
  const blur = page.getByRole('slider', { name: '玻璃模糊', exact: true })
  await expect(opacity).toHaveAttribute('min', '0')
  await expect(opacity).toHaveAttribute('max', '100')
  await expect(opacity).toHaveAttribute('aria-valuetext', '31.4%')
  await expect(blur).toHaveValue('12')
  await expect(blur).toHaveAttribute('min', '2')
  await expect(blur).toHaveAttribute('max', '22')
  await expect(blur).toHaveAttribute('step', '1')
  await expect(blur).toHaveClass(/apple-slider/)
  await expect(page.locator('.glass-preview-panel')).toHaveCSS('backdrop-filter', 'blur(12px) saturate(2)')
  expect(await alpha(page.locator('.glass-preview-panel'))).toBeCloseTo(80 / 255, 3)
})

test('glass sliders update the live preview, persist across routes and reset with all preferences', async ({ page }) => {
  await page.goto('/settings')
  await setSlider(page.getByRole('slider', { name: '玻璃不透明度', exact: true }), 72.5)
  await setSlider(page.getByRole('slider', { name: '玻璃模糊', exact: true }), 19)
  await expect(page.locator('.glass-preview-panel')).toHaveCSS('backdrop-filter', 'blur(19px) saturate(2)')
  expect(await alpha(page.locator('.glass-preview-panel'))).toBeCloseTo(.725, 3)
  await page.getByRole('combobox', { name: '打开下拉查看实际效果', exact: true }).click()
  await expect(page.locator('.glass-preview-select .apple-field-menu')).toHaveCSS('backdrop-filter', 'blur(19px) saturate(2)')
  expect(await alpha(page.locator('.glass-preview-select .apple-field-menu'))).toBeCloseTo(.725, 3)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '深色', exact: true }).click()
  await page.getByRole('radiogroup', { name: '全局动效', exact: true }).getByText('关闭', { exact: true }).click()
  await page.goto('/')
  await page.goto('/settings')
  await page.reload()
  await expect(page.getByRole('slider', { name: '玻璃不透明度', exact: true })).toHaveValue('72.5')
  await expect(page.getByRole('slider', { name: '玻璃模糊', exact: true })).toHaveValue('19')
  await expect(page.getByRole('button', { name: '深色', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '恢复默认设置', exact: true }).click()
  await expect(page.getByRole('slider', { name: '玻璃不透明度', exact: true })).toHaveAttribute('aria-valuetext', '31.4%')
  await expect(page.getByRole('slider', { name: '玻璃模糊', exact: true })).toHaveValue('12')
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-theme', 'light')
  await page.reload()
  await expect(page.getByRole('slider', { name: '玻璃模糊', exact: true })).toHaveValue('12')
  expect(await alpha(page.locator('.glass-preview-panel'))).toBeCloseTo(80 / 255, 3)
})

test('opacity endpoints are not inverted and blur supports keyboard bounds', async ({ page }) => {
  await page.goto('/settings')
  const opacity = page.getByRole('slider', { name: '玻璃不透明度', exact: true })
  const blur = page.getByRole('slider', { name: '玻璃模糊', exact: true })
  await opacity.focus()
  await page.keyboard.press('Home')
  expect(await alpha(page.locator('.glass-preview-panel'))).toBe(0)
  await expect(opacity).toHaveAttribute('aria-valuetext', '0%')
  await page.keyboard.press('End')
  expect(await alpha(page.locator('.glass-preview-panel'))).toBe(1)
  await expect(opacity).toHaveAttribute('aria-valuetext', '100%')
  await blur.focus()
  await page.keyboard.press('Home')
  await expect(blur).toHaveValue('2')
  await page.keyboard.press('ArrowRight')
  await expect(blur).toHaveValue('3')
  await page.keyboard.press('End')
  await expect(blur).toHaveValue('22')
  await page.keyboard.press('ArrowRight')
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
  test(`glass controls and preview fit at ${width}px in light and dark themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/settings')
    for (const theme of ['浅色', '深色']) {
      await page.getByRole('button', { name: theme, exact: true }).click()
      await expect(page.locator('.glass-preview-panel')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.locator('#app > .apple-provider').evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))) })
      await page.screenshot({ path: `/tmp/apptify-glass-${width}-${theme === '深色' ? 'dark' : 'light'}.png`, fullPage: true })
    }
  })
}

for (const width of [320, 1440]) {
  test(`dark glass previews keep light text on black glass across opacity values at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/settings')
    await page.getByRole('button', { name: '深色', exact: true }).click()
    const provider = page.locator('#app > .apple-provider')
    const preview = page.locator('.glass-preview-panel')
    const region = page.getByRole('region', { name: '玻璃效果', exact: true })
    const control = page.getByRole('combobox', { name: '打开下拉查看实际效果', exact: true })
    const opacity = page.getByRole('slider', { name: '玻璃不透明度', exact: true })
    for (const value of [0, 31.4, 60, 100]) {
      await setSlider(opacity, value)
      await provider.evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))) })
      await expect(preview.locator('.apple-list__item').first()).toHaveCSS('color', 'rgb(238, 238, 239)')
      await expect(preview.locator('.apple-list__description').first()).toHaveCSS('color', 'rgb(170, 170, 176)')
      await expect(control).toHaveCSS('color', 'rgb(238, 238, 239)')
      expect(await alpha(preview)).toBeCloseTo(value / 100, 3)
      await expect(preview).toHaveCSS('background-color', value === 100 ? 'rgb(0, 0, 0)' : `rgba(0, 0, 0, ${value / 100})`)
      await expect(page.locator('.glass-preview-backdrop')).toHaveCSS('background-image', /data:image\/svg\+xml/)
      await region.screenshot({ path: `/tmp/apptify-glass-dark-opacity-${value}-${width}.png` })
      if (value >= 60) {
        await expect(preview.locator('.apple-list__item').first()).toHaveCSS('color', 'rgb(238, 238, 239)')
        await control.click()
        const popup = page.locator('.glass-preview-select .apple-field-menu')
        await expect(popup).toHaveCSS('color', 'rgb(238, 238, 239)')
        await expect(popup.getByRole('option').first()).toHaveCSS('color', 'rgb(238, 238, 239)')
        expect(await alpha(popup)).toBeCloseTo(value / 100, 3)
        await popup.screenshot({ path: `/tmp/apptify-glass-dark-select-${value}-${width}.png` })
        await page.keyboard.press('Escape')
      }
    }
    await page.getByRole('button', { name: '恢复默认设置', exact: true }).click()
    await expect(opacity).toHaveAttribute('aria-valuetext', '31.4%')
    await expect(page.getByRole('slider', { name: '玻璃模糊', exact: true })).toHaveValue('12')
  })
}

test('the self-contained small-object pattern shows blur changes in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto('/settings')
  const blur = page.getByRole('slider', { name: '玻璃模糊', exact: true })
  const backdrop = page.locator('.glass-preview-backdrop')
  const panel = page.locator('.glass-preview-panel')
  const pattern = await backdrop.evaluate(el => getComputedStyle(el).backgroundImage)
  expect(pattern).toContain('data:image/svg+xml,')
  for (const theme of ['浅色', '深色']) {
    await page.getByRole('button', { name: theme, exact: true }).click()
    for (const value of [2, 12, 22]) {
      await setSlider(blur, value)
      await expect(panel).toHaveCSS('backdrop-filter', `blur(${value}px) saturate(2)`)
      await expect(backdrop).toHaveCSS('background-image', pattern)
      await page.locator('#app > .apple-provider').evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))) })
      await page.locator('.glass-preview').screenshot({ path: `/tmp/apptify-glass-pattern-${theme === '深色' ? 'dark' : 'light'}-${value}px.png` })
    }
  }
})

import { expect, test } from '@playwright/test'
import { catalog } from '../../playground/catalog'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('account menu retains dark theme colors at full glass opacity', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('button', { name: '深色', exact: true }).click()
  const opacity = page.getByRole('slider', { name: '玻璃不透明度', exact: true })
  await opacity.focus()
  await opacity.press('End')
  await expect(opacity).toHaveValue('100')
  await page.getByRole('button', { name: '打开用户菜单', exact: true }).click()
  const popup = page.getByRole('dialog', { name: '用户菜单', exact: true })
  await expect(popup).toHaveCSS('background-color', 'rgb(34, 34, 36)')
  await expect(popup).toHaveCSS('color', 'rgb(238, 238, 239)')
  await expect(popup).toHaveCSS('backdrop-filter', 'none')
  await expect(popup.locator('.user-summary small')).toHaveCSS('background-color', 'rgb(43, 43, 46)')
  await expect(popup.getByText('lin.chu@example.com', { exact: true })).toHaveCSS('color', 'rgb(170, 170, 176)')
})

for (const motion of ['auto', 'none']) {
  test(`code disclosure preserves accessible state, content and copying with ${motion} motion`, async ({ page }) => {
    if (motion === 'none') {
      await page.goto('/settings')
      await page.getByRole('radiogroup', { name: '全局动效', exact: true }).getByText('关闭', { exact: true }).click()
    }
    await page.goto('/components#apple-textarea')
    const card = page.locator('#apple-textarea')
    const disclosure = card.locator('.component-source')
    const trigger = disclosure.getByRole('button', { name: '代码与 API', exact: true })
    const regionId = await trigger.getAttribute('aria-controls')
    expect(regionId).toBeTruthy()
    const region = page.locator(`[id="${regionId}"]`)
    await expect(disclosure).toHaveClass(/apple-accordion/)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(region).toHaveAttribute('role', 'region')
    await expect(region).toHaveAttribute('aria-labelledby', await trigger.getAttribute('id') as string)
    await expect(region).toHaveAttribute('aria-hidden', 'true')
    await expect(region).toHaveJSProperty('inert', true)
    await expect.poll(async () => (await region.boundingBox())!.height).toBeLessThan(1)
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(region).toHaveAttribute('aria-hidden', 'false')
    await expect(region).toHaveJSProperty('inert', false)
    const item = catalog.find(item => item.name === 'AppleTextarea')!
    await expect(region.locator('pre code')).toHaveText(item.code)
    await expect(region.locator('.api-line')).toHaveText(item.api)
    await expect.poll(async () => (await region.boundingBox())!.height).toBeGreaterThan(50)
    await region.locator('.code-toolbar .apple-link').filter({ hasText: '复制代码' }).click()
    await expect(page.getByText('已复制', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(item.code)
    await card.getByRole('textbox', { name: '个人简介', exact: true }).fill('披露切换保留输入')
    await trigger.focus()
    await page.keyboard.press('Space')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(region).toHaveJSProperty('inert', true)
    await expect.poll(async () => (await region.boundingBox())!.height).toBeLessThan(1)
    await expect(card.getByRole('textbox', { name: '个人简介', exact: true })).toHaveValue('披露切换保留输入')
    if (motion === 'none') await expect(region).toHaveCSS('transition-duration', '0s')
  })
}

for (const width of [320, 1440]) {
  test(`library site controls retain actions and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/components')
    if (width === 320) {
      const directory = page.getByRole('button', { name: '展开组件目录', exact: true })
      await expect(directory).toHaveClass(/apple-button/)
      await directory.click()
      await expect(page.getByRole('dialog', { name: '组件目录', exact: true })).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(directory).toBeFocused()
    }
    for (const [label, mobile] of [['手机预览', true], ['桌面预览', false]] as const) {
      const button = page.locator('.preview-controls').getByLabel(label, { exact: true })
      await expect(button).toHaveClass(/apple-link/)
      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.detail-preview.mobile-preview')).toHaveCount(mobile ? catalog.length : 0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.goto('/missing-audit-page')
    const home = page.getByRole('link', { name: '返回首页', exact: true })
    await expect(home).toHaveClass(/apple-button/)
    await expect(home).toHaveAttribute('href', '/')
    await home.click()
    await expect(page).toHaveURL('/')
    const trigger = page.getByRole('button', { name: '打开用户菜单', exact: true })
    await expect(trigger).toHaveClass(/apple-link/)
    await trigger.click()
    const popup = page.getByRole('dialog', { name: '用户菜单', exact: true })
    await expect(popup).toHaveCSS('border-radius', '24px')
    await expect(popup).toHaveCSS('backdrop-filter', 'none')
    await expect(popup.locator('.user-menu-list button.apple-link')).toHaveCount(3)
    await expect(popup.locator('.user-menu-list').first().locator('.lucide-arrow-up-right-icon')).toHaveCount(2)
    await popup.getByRole('button', { name: '个人资料', exact: true }).click()
    await expect(page.getByRole('dialog', { name: '个人资料', exact: true })).toBeVisible()
  })
}

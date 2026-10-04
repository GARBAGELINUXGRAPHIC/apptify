import { expect, test } from '@playwright/test'

test('home navigation uses library controls and preserves link semantics', async ({ page }) => {
  await page.goto('/')
  const browse = page.getByRole('link', { name: '浏览全部组件', exact: true })
  await expect(browse).toHaveClass(/apple-button--primary/)
  await expect(browse).toHaveAttribute('href', '/components')
  const preferences = page.getByRole('link', { name: '调整外观与动效', exact: true })
  await expect(preferences).toHaveClass(/apple-link/)
  await preferences.click()
  await expect(page).toHaveURL(/\/settings$/)
  await page.goBack()
  await browse.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/components$/)
  await page.goBack()
  const all = page.getByRole('link', { name: '查看全部组件', exact: true })
  await expect(all).toHaveClass(/apple-link/)
  await all.click()
  await expect(page).toHaveURL(/\/components$/)
})

test('home search, pressed favorite, valid form and feedback are interactive', async ({ page }) => {
  await page.goto('/')
  const list = page.getByRole('list', { name: '设置导航示例', exact: true })
  await expect(list.getByRole('listitem')).toHaveCount(3)
  await page.getByRole('searchbox', { name: '搜索设置', exact: true }).fill('安全')
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await page.getByRole('searchbox', { name: '搜索设置', exact: true }).fill('联系方式')
  await expect(list.getByRole('listitem')).toHaveCount(1)
  await expect(list).toContainText('个人资料')
  await page.getByRole('searchbox', { name: '搜索设置', exact: true }).fill('找不到')
  await expect(page.getByRole('status').filter({ hasText: '没有匹配的设置' })).toBeVisible()
  await page.getByRole('searchbox', { name: '搜索设置', exact: true }).fill('  ')
  await expect(list.getByRole('listitem')).toHaveCount(3)
  await page.getByRole('button', { name: '收藏', exact: true }).click()
  await expect(page.getByRole('button', { name: '取消收藏', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('你的名字', { exact: true }).fill('测试朋友')
  await page.getByLabel('电子邮箱', { exact: true }).fill('friend@example.com')
  await page.getByRole('button', { name: '加入我们', exact: true }).click()
  await expect(page.getByText('你好，测试朋友！', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '打开对话框', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '一切，就从这里开始。' })).toBeVisible()
  await page.getByRole('button', { name: '好的', exact: true }).click()
})

test('theme library buttons persist and follow motion preferences', async ({ page }) => {
  await page.goto('/settings')
  for (const [label, value] of [['浅色', 'light'], ['深色', 'dark'], ['石墨', 'graphite'], ['玫瑰', 'rose']]) {
    const theme = page.getByRole('button', { name: label, exact: true })
    await expect(theme).toHaveClass(/apple-link/)
    await theme.click()
    await expect(theme).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-theme', value)
  }
  await page.reload()
  await expect(page.getByRole('button', { name: '玫瑰', exact: true })).toHaveAttribute('aria-pressed', 'true')
  const motion = page.getByRole('radiogroup', { name: '全局动效', exact: true })
  await motion.getByText('完整', { exact: true }).click()
  await motion.getByText('关闭', { exact: true }).click()
  await expect(page.locator('.theme-choice').first()).toHaveCSS('transition-duration', '0s')
  await page.getByRole('button', { name: '恢复默认设置', exact: true }).click()
  await expect(page.getByRole('button', { name: '浅色', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('library links hover by color alone and follow global motion timing', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: '调整外观与动效', exact: true })
  await page.locator('main').evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))) })
  const before = await link.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor, rect: el.getBoundingClientRect().toJSON() }))
  await expect(link).toHaveCSS('transition-property', 'color')
  await link.hover()
  await expect(link).not.toHaveCSS('color', before.color)
  await expect(link).toHaveCSS('text-decoration-line', 'none')
  await expect(link).toHaveCSS('background-color', before.background)
  expect(await link.evaluate(el => el.getBoundingClientRect().toJSON())).toEqual(before.rect)
  await link.click()
  await page.getByRole('radiogroup', { name: '全局动效', exact: true }).getByText('关闭', { exact: true }).click()
  await page.goto('/')
  await expect(page.getByRole('link', { name: '调整外观与动效', exact: true })).toHaveCSS('transition-duration', '0s')
})

for (const width of [320, 390, 768, 1440]) {
  test(`home and settings library controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/settings']) {
      await page.goto(route)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await expect(page.locator('.page-footer')).toBeVisible()
      if (width === 320 || width === 1440) {
        await page.locator('main').evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))) })
        await page.screenshot({ path: `/tmp/apptify-${route === '/' ? 'home' : 'settings'}-${width}.png`, fullPage: true })
      }
      if (route === '/') {
        const browse = await page.getByRole('link', { name: '浏览全部组件', exact: true }).boundingBox()
        expect(browse!.height).toBeGreaterThanOrEqual(44)
      } else {
        await page.getByRole('button', { name: '深色', exact: true }).click()
        await expect(page.getByRole('button', { name: '深色', exact: true })).toHaveAttribute('aria-pressed', 'true')
      }
    }
  })
}

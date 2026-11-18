import { expect, test } from '@playwright/test'

test('home navigation uses library controls and preserves link semantics', async ({ page }) => {
  await page.goto('/')
  const browse = page.getByRole('link', { name: '浏览全部组件', exact: true })
  await expect(browse).toHaveClass(/apple-button--primary/)
  await expect(browse).toHaveAttribute('href', '/components')
  const preferences = page.locator('.home-actions').getByRole('link', { name: '设置', exact: true })
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

test('the six home features use live controls and link to their resources', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.specimen h3')).toHaveText([
    '美观简洁，灵动易用', '跨端复杂组件，不只基础', '界面风格，随你设定',
    '启动框架，一应俱全', '低代码示例，易学易用', '看看实例',
  ])
  const player = page.locator('.mini-player')
  await player.getByRole('button', { name: '播放', exact: true }).click()
  await expect(player.getByRole('button', { name: '暂停', exact: true })).toBeVisible()
  await expect.poll(() => player.getByRole('slider', { name: '播放进度' }).inputValue()).not.toBe('42')
  await player.getByRole('button', { name: '暂停', exact: true }).click()
  await player.getByRole('button', { name: '下一首', exact: true }).click()
  await expect(player.getByRole('heading')).toHaveText('山间回声')
  await player.getByRole('button', { name: '上一首', exact: true }).click()
  await expect(player.getByRole('heading')).toHaveText('海岸来信')
  await player.getByRole('button', { name: '喜欢', exact: true }).click()
  await expect(player.getByRole('button', { name: '取消喜欢', exact: true })).toHaveAttribute('aria-pressed', 'true')

  const showcase = page.locator('.showcase-carousel')
  await expect(showcase.getByRole('heading', { name: 'Clash Verge Rev Fork' })).toBeVisible()
  await expect(showcase.getByRole('link', { name: '查看项目' })).toHaveAttribute('href', 'https://github.com/GARBAGELINUXGRAPHIC/clash-verge-rev-fork')
  await expect(showcase.getByRole('group', { name: '选择幻灯片' })).toBeHidden()

  await page.getByRole('link', { name: 'API 文档与低代码编辑器' }).click()
  await expect(page).toHaveURL(/\/component-docs\/apple-container$/)
  await expect(page.getByRole('tab', { name: '低代码', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '复制当前文件', exact: true })).toBeVisible()
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
  const link = page.locator('.home-actions').getByRole('link', { name: '设置', exact: true })
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
  await expect(link).toHaveCSS('transition-duration', '0s')
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

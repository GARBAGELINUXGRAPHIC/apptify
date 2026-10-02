import { expect, test } from '@playwright/test'

test('root and body match the active theme on reload, system changes and navigation', async ({ page }) => {
  await page.goto('/settings')
  const check = async (color: string, scheme: string) => {
    await expect(page.locator('html')).toHaveCSS('background-color', color)
    await expect(page.locator('body')).toHaveCSS('background-color', color)
    await expect(page.locator('html')).toHaveCSS('color-scheme', scheme)
    expect(await page.locator('html').evaluate(el => getComputedStyle(el).overscrollBehavior)).not.toBe('none')
  }
  await page.getByRole('button', { name: '深色', exact: true }).click()
  await check('rgb(22, 22, 23)', 'dark')
  await page.reload()
  await check('rgb(22, 22, 23)', 'dark')
  await page.getByRole('button', { name: '跟随系统', exact: true }).click()
  await page.emulateMedia({ colorScheme: 'light' })
  await check('rgb(245, 245, 247)', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await check('rgb(22, 22, 23)', 'dark')
  await page.locator('.site-nav').getByRole('link', { name: '首页', exact: true }).click()
  await check('rgb(22, 22, 23)', 'dark')
  await page.goBack()
  await check('rgb(22, 22, 23)', 'dark')
  await page.getByRole('button', { name: '浅色', exact: true }).click()
  await check('rgb(245, 245, 247)', 'light')
})

for (const width of [320, 1440, 1920]) {
  test(`tag demo wraps and centers the add button within its card at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/components#apple-tag')
    const card = page.locator('#apple-tag')
    const row = card.locator('.demo-tag-row')
    await card.getByRole('button', { name: '移除设计系统', exact: true }).click()
    const add = card.getByRole('button', { name: '添加标签', exact: true })
    await expect(add).toBeVisible()
    const geometry = await row.evaluate(el => {
      const parent = el.getBoundingClientRect()
      const boxes = [...el.children].map(child => child.getBoundingClientRect().toJSON())
      return { parent: parent.toJSON(), boxes, wrap: getComputedStyle(el).flexWrap }
    })
    expect(geometry.wrap).toBe('wrap')
    const typography = await row.evaluate(el => {
      const targets = [...el.children] as HTMLElement[]
      return targets.map(target => {
        const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
        let node: Node | null
        while ((node = walker.nextNode())) {
          if (!node.textContent?.trim()) continue
          const range = document.createRange(); range.selectNodeContents(node)
          const bounds = range.getBoundingClientRect(), style = getComputedStyle(target)
          return { textY: bounds.y, textHeight: bounds.height, fontSize: style.fontSize, lineHeight: style.lineHeight, box: target.getBoundingClientRect().toJSON() }
        }
        throw new Error('Tag or button has no visible text')
      })
    })
    for (const item of typography) { expect(item.fontSize).toBe('11px'); expect(item.lineHeight).toBe('16.5px') }
    for (const first of typography) for (const second of typography) {
      if (Math.abs(first.box.y + first.box.height / 2 - second.box.y - second.box.height / 2) < 1) {
        expect(Math.abs(first.textY - second.textY)).toBeLessThan(1)
        expect(first.textHeight).toBe(second.textHeight)
      }
    }
    expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44)

    for (const box of geometry.boxes) {
      expect(box.left).toBeGreaterThanOrEqual(geometry.parent.left - 1)
      expect(box.right).toBeLessThanOrEqual(geometry.parent.right + 1)
    }
    for (const first of geometry.boxes) for (const second of geometry.boxes) {
      if (Math.min(first.bottom, second.bottom) > Math.max(first.top, second.top)) {
        expect(Math.abs(first.y + first.height / 2 - second.y - second.height / 2)).toBeLessThan(1)
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await card.screenshot({ path: `/Users/quitsense/Documents/Codex/2026-10-02/task/tag-demo-${width}.png` })
    await add.click()
    await expect(card.getByRole('button', { name: '移除设计系统', exact: true })).toBeVisible()
  })
}

test('saved canvas theme is correct before the application bundle loads', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'dark' })))
  let blocked = false
  await page.route(url => url.pathname.endsWith('/playground/main.ts'), route => { blocked = true; return route.abort() })
  await page.goto('/')
  expect(blocked).toBe(true)
  await expect(page.locator('#app')).toBeEmpty()
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(22, 22, 23)')
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 22, 23)')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
})

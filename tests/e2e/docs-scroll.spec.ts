import { test, expect } from '@playwright/test'

test('API tree follows reading position while preserving collapsed groups', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/component-docs/apple-input')
  await expect(page.getByTestId('component-document').locator('.api-entry')).toHaveCount(17)
  await page.waitForFunction(() => !document.getAnimations().some(animation => animation.playState === 'running' && Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))))
  const tree = page.getByRole('tree', { name: '组件 API 树' })
  const scrollTo = async (id: string) => {
    await page.locator(`#${id}`).evaluate(element => {
      const offset = parseFloat(getComputedStyle(element).scrollMarginTop)
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' })
    })
  }
  const assertSelected = async (name: string) => {
    const item = tree.getByRole('treeitem', { name, exact: true })
    await expect(item).toHaveAttribute('aria-selected', 'true')
    await expect.poll(() => item.locator(':scope > .apple-tree__row').evaluate(row => {
      const index = row.closest('.documentation-index')!.getBoundingClientRect()
      const bounds = row.getBoundingClientRect()
      return bounds.top >= index.top - 1 && bounds.bottom <= index.bottom + 1
    })).toBe(true)
  }
  await scrollTo('prop-clearable')
  await assertSelected('clearable')
  await expect(page).toHaveURL(/\/apple-input$/)
  await scrollTo('slot-prefix')
  await assertSelected('prefix')
  await scrollTo('prop-placeholder')
  await assertSelected('placeholder')

  const events = tree.getByRole('treeitem', { name: '事件', exact: true })
  await events.focus()
  const beforeToggle = await page.evaluate(() => ({ hash: location.hash, y: scrollY }))
  await events.locator(':scope > .apple-tree__row').click()
  await expect(events).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => ({ hash: location.hash, y: scrollY }))).toEqual(beforeToggle)
  await scrollTo('event-change')
  await assertSelected('事件')
  await expect(events).toHaveAttribute('aria-expanded', 'false')
  await events.focus()
  await page.keyboard.press('Enter')
  await expect(events).toHaveAttribute('aria-expanded', 'true')
  await assertSelected('change')

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await assertSelected('交互与无障碍')
  await tree.getByRole('treeitem', { name: 'clearable', exact: true }).click()
  await expect(page).toHaveURL(/#prop-clearable$/)
  await assertSelected('clearable')
  await expect.poll(() => page.locator('#prop-clearable').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(96)
  await assertSelected('clearable')
  await scrollTo('slot-prefix')
  await assertSelected('prefix')
  await expect(page).toHaveURL(/#prop-clearable$/)
})

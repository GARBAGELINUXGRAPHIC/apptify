import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/select-tab-motion.html')
})

test('repeated pointer activation closes selects without reopening and preserves keyboard and blur behavior', async ({ page }) => {
  for (const id of ['standalone-select', 'tab-select']) {
    const select = page.locator(`#${id}`)
    for (let repeat = 0; repeat < 2; repeat++) {
      await select.tap()
      await expect(select).toHaveAttribute('aria-expanded', 'true')
      await select.tap()
      await expect(select).toHaveAttribute('aria-expanded', 'false')
    }
    await select.focus()
    await select.press('ArrowDown')
    await expect(select).toHaveAttribute('aria-expanded', 'true')
    await select.press('Escape')
    await expect(select).toHaveAttribute('aria-expanded', 'false')
    await select.tap()
    await page.locator('#outside').focus()
    await expect(select).toHaveAttribute('aria-expanded', 'false')
  }
  await expect(page.locator('#changes')).toHaveText('0')
  await page.locator('#tab-select').tap()
  await page.getByRole('option', { name: 'Two', exact: true }).tap()
  await expect(page.locator('#tab-select')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#changes')).toHaveText('1')
})

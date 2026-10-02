import { expect, test } from '@playwright/test'

test('file routes survive direct entry and browser history', async ({ page }) => {
  await page.goto('/missing/nested/page')
  await expect(page.getByText('页面不存在', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: '返回首页' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
  await page.goBack()
  await expect(page.getByText('页面不存在', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('页面不存在', { exact: true })).toBeVisible()
  await page.goForward()
  await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
})

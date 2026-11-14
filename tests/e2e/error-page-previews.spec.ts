import { expect, test } from '@playwright/test'
import { errorPages } from '../../playground/error-pages'

test('error previews show each scene and open its matching page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components')
  await page.getByRole('link', { name: '错误页面', exact: true }).click()
  await expect(page).toHaveURL('/components#error-pages')

  const previews = page.getByRole('region', { name: '错误页面' })
  for (const [code, error] of Object.entries(errorPages)) {
    const card = previews.getByRole('article').filter({ has: page.getByRole('link', { name: `${code} · ${error.title}` }) })
    await card.scrollIntoViewIfNeeded()
    await expect(card.getByText(error.copy[0], { exact: false })).toBeVisible()
    const scene = card.getByRole('img')
    await expect(scene).toBeVisible()
    await scene.scrollIntoViewIfNeeded()
    const bounds = (await scene.boundingBox())!
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await expect(page).toHaveURL(`/${code}`)
    await expect(page.getByRole('heading', { level: 1, name: error.title })).toBeVisible()
    await page.getByRole('button', { name: '返回上一页' }).click()
    await expect(page).toHaveURL('/components#error-pages')
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('error cards keep animation controls separate from navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/components#error-pages')
  const link = page.getByRole('link', { name: '403 · 无权访问' })
  const card = page.getByRole('article').filter({ has: link })
  const pause = card.getByRole('button', { name: '暂停动画' })
  await pause.click()
  await expect(pause).toHaveCount(0)
  await expect(card.getByRole('button', { name: '继续动画' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL('/components#error-pages')
  await link.press('Enter')
  await expect(page).toHaveURL('/403')
})

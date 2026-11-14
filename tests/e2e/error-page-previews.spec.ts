import { expect, test } from '@playwright/test'
import { errorPages } from '../../playground/error-pages'

test('error previews show each scene and open its matching page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/components#error-pages')

  const previews = page.getByRole('region', { name: '错误页面' })
  await expect(page.locator('#error-pages + #mobile')).toHaveCount(1)
  for (const [code, error] of Object.entries(errorPages)) {
    const card = previews.getByRole('article').filter({ has: page.getByRole('link', { name: `${code} · ${error.title}` }) })
    await card.scrollIntoViewIfNeeded()
    await expect(card.getByText(error.copy[0], { exact: false })).toBeVisible()
    const fullPage = card.getByRole('link', { name: '查看完整页面', exact: true })
    await expect(fullPage).toHaveAttribute('href', `/${code}`)
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
  await page.goto('/components')
  const directory = page.getByRole('complementary', { name: '组件目录' })
  await directory.getByRole('treeitem', { name: '403 · 无权访问', exact: true }).click()
  await expect(page).toHaveURL('/components#error-403')
  const link = page.getByRole('link', { name: '403 · 无权访问' })
  const card = page.getByRole('article').filter({ has: link })
  const pause = card.getByRole('button', { name: '暂停动画' })
  await pause.click()
  await expect(pause).toHaveCount(0)
  await expect(card.getByRole('button', { name: '继续动画' })).toHaveAttribute('aria-pressed', 'true')
  await card.getByRole('button', { name: '重新播放动画' }).click()
  await expect(pause).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL('/components#error-403')
  await card.getByRole('link', { name: '查看完整页面', exact: true }).click()
  await expect(page).toHaveURL('/403')
})

for (const code of Object.keys(errorPages)) {
  test(`${code} preview and page share playback controls`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    for (const path of [`/components#error-${code}`, `/${code}`]) {
      await page.goto(path)
      const scene = page.locator(path.startsWith('/components') ? `#error-${code} .error-scene` : 'main .error-scene')
      const animation = scene.getByRole('img')
      const svg = () => animation.evaluate(element => element.innerHTML)
      const animationTimes = () => animation.evaluate(element => element.getAnimations({ subtree: true }).map(value => Number(value.currentTime)))
      const snapshot = async () => ({ svg: await svg(), animationTimes: await animationTimes() })
      const pause = scene.getByRole('button', { name: '暂停动画' })
      const resume = scene.getByRole('button', { name: '继续动画' })
      const replay = scene.getByRole('button', { name: '重新播放动画' })

      await pause.scrollIntoViewIfNeeded()
      await expect(async () => {
        const before = await snapshot()
        await expect.poll(snapshot, { timeout: 500 }).not.toEqual(before)
      }).toPass({ timeout: 5000 })
      await pause.click()
      await expect(resume).toHaveAttribute('aria-pressed', 'true')
      // Let the browser finish committing a pending Web Animations pause.
      await animation.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const stopped = await snapshot()
      await page.waitForTimeout(180)
      expect(await snapshot()).toEqual(stopped)
      await resume.click()
      await expect.poll(snapshot).not.toEqual(stopped)

      await pause.click()
      await replay.click()
      await expect(pause).toHaveAttribute('aria-pressed', 'false')
      await expect(page).toHaveURL(path)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(scene.getByRole('group', { name: '动画控制' })).toHaveCount(0)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
    }
  })
}

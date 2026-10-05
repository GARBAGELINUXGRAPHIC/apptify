import { expect, test, type Page } from '@playwright/test'

const scene = '.meal-scene'
const snapshot = (page: Page) => page.locator(`${scene} .meal-scene__art`).evaluate(element => element.outerHTML)
const point = (page: Page, part: string, x: number, y: number) => page.locator(`[data-part="${part}"]`).evaluate((element, { x, y }) => {
  const point = new DOMPoint(x, y).matrixTransform((element as SVGGraphicsElement).getCTM()!)
  return { x: point.x, y: point.y }
}, { x, y })

test('hunger close-up reveals the scene once, then the paw reaches and recoils', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/403')
  await expect(page.getByRole('heading', { name: '无权访问', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /小狗与够不到的鸡腿/ })).toBeVisible()
  await expect(page.locator(scene)).toHaveAttribute('data-phase', 'hungry')
  await page.screenshot({ path: 'artifacts/403-intro.png' })
  await expect(page.locator(scene)).toHaveAttribute('data-phase', 'reveal', { timeout: 5000 })
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'loop', { timeout: 5000 })
  const count = await page.locator(`${scene} *`).count()
  await expect(page.locator(scene)).toHaveAttribute('data-phase', 'reaching', { timeout: 3000 })
  const pawBefore = await point(page, 'dog-paw', 0, 0)
  await expect.poll(async () => (await point(page, 'dog-paw', 0, 0)).y).toBeLessThan(pawBefore.y - 60)
  await expect(page.locator(scene)).toHaveAttribute('data-phase', 'recovering', { timeout: 4000 })
  await page.screenshot({ path: 'artifacts/403-loop.png' })
  await page.waitForTimeout(6500)
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'loop')
  await expect(page.locator('[data-part="camera"]')).toHaveAttribute('transform', 'translate(0 0) scale(1)')
  expect(await page.locator(`${scene} *`).count()).toBe(count)
  expect(errors).toEqual([])
})

test('the blocking hand meets the paw and rigid arm joints stay attached', async ({ page }) => {
  await page.goto('/403')
  await page.getByRole('button', { name: '暂停动画', exact: true }).click()
  for (const time of [0, 1500, 2700, 3000, 3140, 3980, 6399]) {
    await page.locator(`${scene} .meal-scene__art`).evaluate(async (art, time) => {
      const path = '/playground/components/forbidden-paper-story.ts'
      const { createForbiddenRenderer } = await import(/* @vite-ignore */ path)
      createForbiddenRenderer(art).draw(5400 + time)
    }, time)
    if (time === 0 || time === 2700) await page.screenshot({ path: `artifacts/403-arm-${time}.png` })
    const elbow = await point(page, 'deny-upper-group', 0, 135)
    const forearm = await point(page, 'deny-forearm-group', 0, 0)
    expect(Math.hypot(elbow.x - forearm.x, elbow.y - forearm.y)).toBeLessThan(.02)
    if (time === 3000) {
      const paw = await point(page, 'dog-paw', 0, -10)
      const hand = await point(page, 'deny-hand', 0, 0)
      expect(Math.hypot(paw.x - hand.x, paw.y - hand.y)).toBeLessThan(.1)
      await page.screenshot({ path: 'artifacts/403-contact.png' })
    }
  }
})

test('pause and page visibility preserve the story, preferences render a still scene', async ({ page }) => {
  await page.goto('/error/403')
  await expect(page).toHaveTitle('无权访问 · Apptify')
  await page.getByRole('button', { name: '暂停动画', exact: true }).click()
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'false')
  const stopped = await snapshot(page)
  await page.waitForTimeout(200)
  expect(await snapshot(page)).toEqual(stopped)
  await page.getByRole('button', { name: '继续动画', exact: true }).click()
  await expect.poll(() => snapshot(page)).not.toEqual(stopped)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'false')
  const hidden = await snapshot(page)
  await page.waitForTimeout(200)
  expect(await snapshot(page)).toEqual(hidden)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
  const still = await snapshot(page)
  await page.waitForTimeout(200)
  expect(await snapshot(page)).toEqual(still)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'loop')
  await page.getByRole('link', { name: '返回首页', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/403')
  await page.getByRole('button', { name: '返回上一页', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
})

for (const motion of ['none', 'reduced']) {
  test(`${motion} motion keeps the complete dark scene still`, async ({ page }) => {
    await page.addInitScript(motion => localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'dark', motion })), motion)
    await page.goto('/403')
    await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
    await expect(page.locator(scene)).toHaveClass(/meal-scene--dark/)
    const still = await snapshot(page)
    await page.waitForTimeout(200)
    expect(await snapshot(page)).toEqual(still)
    await expect(page.getByRole('button', { name: '暂停动画' })).toHaveCount(0)
    if (motion === 'none') await page.screenshot({ path: 'artifacts/403-dark.png' })
  })
}

for (const width of [320, 390, 768, 1440]) {
  test(`403 and its navigation fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/403')
    await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await expect(page.getByRole('link', { name: '返回首页', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '返回上一页', exact: true })).toBeVisible()
    if (width === 390 || width === 1440) await page.screenshot({ path: `artifacts/403-${width}.png` })
  })
}

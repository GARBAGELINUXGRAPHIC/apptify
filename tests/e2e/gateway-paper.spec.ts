import { expect, test, type Page } from '@playwright/test'
import type { GatewayStory } from '../../playground/components/gateway-paper-story'

const scene = '.gateway-scene__art'
type Art = SVGSVGElement & { gatewayStory: GatewayStory }
const snapshot = (page: Page) => page.locator(scene).evaluate(element => element.outerHTML)
const state = (page: Page) => page.locator(scene).evaluate(element => (element as Art).gatewayStory.getState())
const seek = (page: Page, seconds: number) => page.locator(scene).evaluate((element, seconds) => (element as Art).gatewayStory.seek(seconds), seconds)

test('the courier is intercepted continuously, swallowed, and loops in a fixed wide shot', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto('/502')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle('网关错误 · Apptify')
  await expect(page.getByRole('heading', { name: '网关错误', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /青蛙与送往城镇的包裹/ })).toBeVisible()
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'intro')
  expect((await seek(page, 0)).zoom).toBeGreaterThan(3)
  await page.screenshot({ path: 'artifacts/502-intro.png' })
  const timing = await page.locator(scene).evaluate(element => (element as Art).gatewayStory.timing)
  const contact = timing.contact - timing.initialPhase
  const before = await seek(page, contact - .01)
  const hit = await seek(page, contact)
  expect(hit.bug.x - before.bug.x).toBeCloseTo(1.74, 4)
  expect(Math.hypot(hit.bug.x - hit.tip.x, hit.bug.y - hit.tip.y)).toBeLessThan(.0001)
  const grounded = await page.locator('[data-part="frog-legs"]').getAttribute('transform')
  for (const progress of [.1, .5, .78, .95]) {
    const frame = await seek(page, contact + .37 * progress)
    expect(frame.bug.captured).toBe(true)
    expect(frame.bug.x).toBeCloseTo(frame.tip.x, 6)
    expect(frame.bug.y).toBeCloseTo(frame.tip.y, 6)
    if (progress < .79) expect(frame.bug.scale).toBe(1)
    else expect(frame.bug.scale).toBeLessThan(.5)
    expect(await page.locator('[data-part="frog-legs"]').getAttribute('transform')).toBe(grounded)
  }
  expect((await seek(page, timing.retractEnd - timing.initialPhase + .001)).bug.visible).toBe(false)
  for (let cycle = 0; cycle < 16; cycle++) {
    const start = await seek(page, timing.introEnd + timing.period * cycle + .001)
    expect(start.zoom).toBe(1)
    expect(start.bug.x).toBeLessThan(-120)
    expect((await seek(page, timing.introEnd + timing.period * cycle + 2.7)).zoom).toBe(1)
  }
  await page.screenshot({ path: 'artifacts/502-wide.png' })
  expect(errors).toEqual([])
})

test('playback suspends when paused, hidden or offscreen, and route exit disposes it', async ({ page }) => {
  await page.goto('/error/502')
  await page.getByRole('button', { name: '暂停动画', exact: true }).click()
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'false')
  const paused = await snapshot(page)
  await page.waitForTimeout(150)
  expect(await snapshot(page)).toBe(paused)
  await page.getByRole('button', { name: '继续动画', exact: true }).click()
  await expect.poll(() => snapshot(page)).not.toBe(paused)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'false')
  const hidden = await snapshot(page)
  await page.waitForTimeout(150)
  expect(await snapshot(page)).toBe(hidden)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    document.body.style.minHeight = '3000px'
    window.scrollTo(0, 2200)
  })
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'false')
  const offscreen = await snapshot(page)
  await page.waitForTimeout(150)
  expect(await snapshot(page)).toBe(offscreen)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(page.locator(scene)).toHaveAttribute('data-playing', 'true')
  const old = await page.locator(scene).evaluateHandle(element => ({ art: element as Art, player: (element as Art).gatewayStory }))
  await page.getByRole('link', { name: '返回首页', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(await old.evaluate(({ art }) => art.gatewayStory === undefined)).toBe(true)
  const stopped = await old.evaluate(({ player }) => player.getState())
  await page.waitForTimeout(150)
  expect(await old.evaluate(({ player }) => player.getState())).toEqual(stopped)
  await page.goto('/502')
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'intro')
  await page.getByRole('button', { name: '返回上一页', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
})

for (const motion of ['none', 'reduced']) {
  test(`${motion} preference renders a still dark scene`, async ({ page }) => {
    await page.addInitScript(motion => localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'dark', motion })), motion)
    await page.goto('/502')
    await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
    await expect(page.locator('.gateway-scene')).toHaveClass(/gateway-scene--dark/)
    expect((await state(page)).zoom).toBe(1)
    const still = await snapshot(page)
    await page.waitForTimeout(150)
    expect(await snapshot(page)).toBe(still)
    await expect(page.getByRole('button', { name: '暂停动画', exact: true })).toHaveCount(0)
    await page.screenshot({ path: `artifacts/502-dark-${motion}.png` })
  })
}

test('OS reduced motion stops the story and restoring motion resumes the wide shot', async ({ page }) => {
  await page.goto('/502')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
  const still = await snapshot(page)
  await page.waitForTimeout(150)
  expect(await snapshot(page)).toBe(still)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator(scene)).toHaveAttribute('data-story', 'loop')
  expect((await state(page)).zoom).toBe(1)
})

for (const width of [320, 390, 768, 1440]) {
  test(`502 fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/502')
    await expect(page.locator(scene)).toHaveAttribute('data-story', 'static')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await expect(page.getByRole('link', { name: '返回首页', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '返回上一页', exact: true })).toBeVisible()
    if (width === 390) await page.screenshot({ path: 'artifacts/502-mobile.png', fullPage: true })
  })
}

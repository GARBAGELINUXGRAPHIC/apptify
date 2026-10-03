import { expect, test, type Page } from '@playwright/test'

const route = '/forest/the-missing-acorn'
const paper = '.paper-scene'
async function paperAnimations(page: Page) {
  return page.locator(paper).evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.id.startsWith('paper-')).map(animation => ({ id: animation.id, state: animation.playState, time: Number(animation.currentTime) })))
}
async function seek(page: Page, time: number) {
  await page.locator(paper).evaluate((element, value) => {
    element.getAnimations({ subtree: true }).filter(animation => animation.id.startsWith('paper-')).forEach(animation => { animation.pause(); animation.currentTime = value })
  }, time)
}
async function pose(page: Page, part: string) {
  return page.locator(`[data-part="${part}"]`).evaluate(element => {
    const style = getComputedStyle(element), matrix = new DOMMatrixReadOnly(style.transform)
    return { x: matrix.e, y: matrix.f, scale: Math.hypot(matrix.a, matrix.b), scaleY: Math.hypot(matrix.c, matrix.d), opacity: Number(style.opacity) }
  })
}

test('the squirrel keeps its last acorn, stops at the tree and bows before the reveal', async ({ page }) => {
  await page.goto(route)
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'intro')
  await expect(page.getByRole('heading', { name: '页面不存在', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /松鼠与漂走的橡果/ })).toBeVisible()
  await seek(page, 1000)
  expect((await pose(page, 'squirrel')).y).toBeLessThan(380)
  expect((await pose(page, 'camera')).scale).toBeGreaterThan(1.6)
  expect((await pose(page, 'held-acorn')).opacity).toBe(1)
  await expect(page.locator('[data-part="pantry"]')).toHaveCount(0)
  await expect(page.locator('[data-part="tree"] use')).toHaveCount(0)
  for (const time of [0, 1270, 2430, 3800, 5500, 8200, 13_000]) {
    await seek(page, time)
    expect((await pose(page, 'squirrel')).opacity).toBe(1)
    expect((await pose(page, 'held-acorn')).opacity).toBe(1)
    if (time >= 2430) {
      expect((await pose(page, 'squirrel')).x).toBe(462)
      expect((await pose(page, 'squirrel')).y).toBe(428)
    }
  }
  await seek(page, 8200)
  expect((await pose(page, 'camera')).scale).toBeLessThan(1.2)
  expect(await page.locator('[data-part=drifters]').evaluate(el => getComputedStyle(el).visibility)).toBe('visible')
  expect(await page.locator('[data-drifter]').evaluateAll(elements => elements.every(element => Number(getComputedStyle(element).opacity) === 1))).toBe(true)
  await seek(page, 13_000)
  expect((await pose(page, 'camera')).scale).toBe(1)
  expect((await pose(page, 'squirrel')).y).toBe(428)
  expect((await pose(page, 'eyelid')).opacity).toBe(1)
})

test('both bounds compress, push off, tuck and absorb landing with grounded toes', async ({ page }) => {
  await page.goto(route)
  const toe = () => page.locator('[data-part="front-foot"]').evaluate(element => {
    // Measure in the SVG viewport so the app's separate route entrance cannot
    // move the reference ground between two animation samples.
    const point = new DOMPoint(18, 5).matrixTransform((element as SVGGraphicsElement).getCTM()!)
    return { x: point.x, y: point.y }
  })
  await seek(page, 0)
  const ground = (await toe()).y
  for (const [crouch, push, flight, contact, compression] of [[430, 550, 760, 1270, 1380], [1730, 1830, 2020, 2430, 2550]]) {
    await seek(page, crouch)
    expect((await pose(page, 'body')).scaleY).toBeLessThan(.85)
    expect((await toe()).y).toBeCloseTo(ground, 1)
    await seek(page, push)
    expect((await pose(page, 'body')).scaleY).toBeGreaterThan(1.04)
    expect((await toe()).y).toBeCloseTo(ground, 1)
    await seek(page, flight)
    expect((await toe()).y).toBeLessThan(ground - 35)
    expect((await pose(page, 'front-foot')).y).toBeLessThan(-10)
    await seek(page, contact)
    expect((await toe()).y).toBeCloseTo(ground, 1)
    await seek(page, compression)
    expect((await pose(page, 'body')).scaleY).toBeLessThan(.85)
    expect((await toe()).y).toBeCloseTo(ground, 1)
  }
})

test('the neck joint stays attached and both arms carry the same acorn through every pose', async ({ page }) => {
  await page.goto(route)
  for (const time of [0, 430, 550, 760, 980, 1270, 1380, 1730, 1830, 2200, 2430, 2550, 3250, 4050, 5500, 13_900]) {
    await seek(page, time)
    const joints = await page.locator(paper).evaluate(element => {
      const head = element.querySelector<SVGGraphicsElement>('[data-part="head"]')!
      const neck = element.querySelector<SVGGraphicsElement>('[data-part="neck"]')!
      const body = element.querySelector('[data-part="body"]')!
      const cradle = element.querySelector('[data-part="cradle"]')!
      const a = new DOMPoint(-19, -88).matrixTransform(head.getScreenCTM()!)
      const b = new DOMPoint(-19, -88).matrixTransform(neck.getScreenCTM()!)
      return { separation: Math.hypot(a.x - b.x, a.y - b.y), headAttached: body.contains(head), handsAndAcornTogether: cradle.contains(element.querySelector('[data-part="held-acorn"]')) && cradle.contains(element.querySelector('[data-part="arm"]')) }
    })
    expect(joints.separation).toBeLessThan(.02)
    expect(joints.headAttached && joints.handsAndAcornTogether).toBe(true)
  }
})

test('the story really finishes once and the ambient cast stays bounded for another full cycle', async ({ page }) => {
  test.setTimeout(48_000)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(route)
  const nodeCount = await page.locator(`${paper} *`).count()
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'settled', { timeout: 18_000 })
  expect((await paperAnimations(page)).map(animation => animation.id).sort()).toEqual(['paper-loop-acorn-0', 'paper-loop-acorn-1', 'paper-loop-acorn-2', 'paper-loop-acorn-3', 'paper-loop-acorn-4', 'paper-loop-breath', 'paper-loop-river'])
  const before = await page.locator('[data-drifter="0"]').evaluate(element => getComputedStyle(element).transform)
  await page.waitForTimeout(21_000)
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'settled')
  expect(await page.locator(`${paper} *`).count()).toBe(nodeCount)
  expect((await paperAnimations(page)).length).toBe(7)
  expect((await pose(page, 'camera')).scale).toBe(1)
  expect(await page.locator('[data-drifter="0"]').evaluate(element => getComputedStyle(element).transform)).not.toBe(before)
  expect(errors).toEqual([])
})

test('pause, visibility and offscreen suspension preserve the timeline; replay is explicit', async ({ page }) => {
  await page.goto(route)
  await page.getByRole('button', { name: '暂停动画', exact: true }).click()
  const stopped = await paperAnimations(page)
  expect(stopped.every(animation => animation.state === 'paused')).toBe(true)
  await page.waitForTimeout(180)
  expect(await paperAnimations(page)).toEqual(stopped)
  await page.getByRole('button', { name: '继续动画', exact: true }).click()
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator(paper)).toHaveAttribute('data-playing', 'false')
  expect((await paperAnimations(page)).every(animation => animation.state === 'paused')).toBe(true)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    document.body.style.minHeight = '3000px'
    window.scrollTo(0, 2200)
  })
  await expect(page.locator(paper)).toHaveAttribute('data-playing', 'false')
  expect((await paperAnimations(page)).every(animation => animation.state === 'paused')).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(page.locator(paper)).toHaveAttribute('data-playing', 'true')
  await page.getByRole('button', { name: '重看故事', exact: true }).click()
  const replayed = await paperAnimations(page)
  expect(replayed.find(animation => animation.id === 'paper-story-clock')!.time).toBeLessThan(1000)
  expect(replayed.filter(animation => animation.id === 'paper-story-clock')).toHaveLength(1)
})

for (const motion of ['none', 'reduced']) {
  test(`library motion ${motion} shows the static ending`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('apptify:preferences', JSON.stringify({ theme: 'dark', motion: value })), motion)
    await page.goto(route)
    await expect(page.locator(paper)).toHaveAttribute('data-story', 'static')
    await expect(page.locator(paper)).toHaveClass(/paper-scene--dark/)
    expect(await paperAnimations(page)).toEqual([])
    expect((await pose(page, 'squirrel')).opacity).toBe(1)
    expect((await pose(page, 'held-acorn')).opacity).toBe(1)
    expect((await pose(page, 'camera')).scale).toBe(1)
    await expect(page.getByRole('button', { name: '重看故事' })).toHaveCount(0)
  })
}

test('OS reduced motion stops an active story and restoring motion does not replay it', async ({ page }) => {
  await page.goto(route)
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'intro')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'static')
  expect(await paperAnimations(page)).toEqual([])
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator(paper)).toHaveAttribute('data-story', 'settled')
  expect((await paperAnimations(page)).every(animation => animation.id.startsWith('paper-loop-'))).toBe(true)
})

test('rapid replay replaces the previous cast without retaining old effects', async ({ page }) => {
  await page.goto(route)
  const nodeCount = await page.locator(`${paper} *`).count()
  const count = (await paperAnimations(page)).length
  for (let index = 0; index < 4; index++) {
    const previous = await page.locator(paper).evaluateHandle(element => element.getAnimations({ subtree: true }).filter(animation => animation.id.startsWith('paper-')))
    await page.getByRole('button', { name: '重看故事', exact: true }).click()
    expect(await previous.evaluate(animations => animations.every(animation => animation.playState === 'idle'))).toBe(true)
    expect((await paperAnimations(page)).length).toBe(count)
    expect(await page.locator(`${paper} *`).count()).toBe(nodeCount)
  }
})

test('route exit cancels detached effects and direct-entry back falls back to home', async ({ page }) => {
  await page.goto(route)
  const oldAnimations = await page.locator(paper).evaluateHandle(element => element.getAnimations({ subtree: true }).filter(animation => animation.id.startsWith('paper-')))
  const home = page.getByRole('link', { name: '返回首页', exact: true })
  await expect(home).toHaveClass(/apple-link/)
  await home.click()
  await expect(page).toHaveURL(/\/$/)
  expect(await oldAnimations.evaluate(animations => animations.every(animation => animation.playState === 'idle'))).toBe(true)
  expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.id.startsWith('paper-')).length)).toBe(0)
  await page.goto(route)
  await page.getByRole('button', { name: '返回上一页', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
})

for (const width of [320, 390, 768, 1440]) {
  test(`404 layout and navigation fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(route)
    await expect(page.locator(paper)).toHaveAttribute('data-story', 'static')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await expect(page.getByRole('link', { name: '返回首页', exact: true })).toBeVisible()
    const caption = await page.locator('.paper-caption--last').boundingBox()
    const controls = await page.locator('.paper-scene__controls').boundingBox()
    expect(caption!.x + caption!.width).toBeLessThanOrEqual(controls!.x)
  })
}

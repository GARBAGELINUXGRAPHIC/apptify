import { expect, test, webkit, type Page } from '@playwright/test'

async function checkJump(page: Page) {
  const figure = page.locator('#compact')
  await expect(figure.locator('img').first()).toBeVisible()
  await figure.getByRole('button', { name: '显示第 5 张图片', exact: true }).click()
  await expect(figure).toHaveAttribute('data-index', '4')
  const motion = await figure.evaluate(element => {
    const overlay = element.querySelector('.apple-image__jump')!
    const [from, to] = Array.from(overlay.children) as HTMLElement[]
    const animation = to.getAnimations()[0]
    const duration = Number(animation.effect!.getTiming().duration)
    for (const child of [from, to]) { child.getAnimations()[0].pause(); child.getAnimations()[0].currentTime = duration * .5 }
    const frames = (animation.effect as KeyframeEffect).getKeyframes()
    return {
      distance: new DOMMatrixReadOnly(frames[0].transform as string).m41,
      width: overlay.clientWidth, source: from.scrollLeft, target: to.scrollLeft,
      current: element.querySelector('.apple-image__dot[aria-current=true]')!.getAttribute('aria-label'),
      left: to.getBoundingClientRect().left, duration,
    }
  })
  expect(motion.distance).toBeCloseTo(motion.width + 8, 1)
  expect(motion.source).toBe(0)
  expect(motion.target).toBeGreaterThan(motion.width * 3)
  expect(motion.current).toBe('显示第 5 张图片')
  expect(motion.duration).toBeLessThanOrEqual(620)
  // Retarget without flashing back to an endpoint or replaying intermediate pages.
  const continuity = await figure.evaluate(async element => {
    const old = element.querySelector<HTMLElement>('.apple-image__jump')!
    const image = old.lastElementChild!
    const before = image.getBoundingClientRect().left
    element.querySelector<HTMLButtonElement>('[aria-label="显示第 2 张图片"]')!.click()
    await Promise.resolve()
    const overlay = element.querySelector<HTMLElement>(':scope > .apple-image__surface > .apple-image__jump')!
    Array.from(overlay.children).forEach(child => { const animation = child.getAnimations()[0]; animation.pause(); animation.currentTime = 0 })
    const after = image.getBoundingClientRect().left
    const retained = overlay.firstElementChild === old
    Array.from(overlay.children).forEach(child => child.getAnimations()[0].play())
    return { before, after, retained }
  })
  expect(continuity.retained).toBe(true)
  expect(continuity.after).toBeCloseTo(continuity.before, 1)
  await expect(figure).toHaveAttribute('data-index', '1')
  await expect(figure.locator('.apple-image__jump')).toHaveCount(0)
  const landing = await figure.locator('.apple-image__gallery').evaluate(box => ({ left: box.scrollLeft, width: box.clientWidth, opacity: getComputedStyle(box).opacity, snap: getComputedStyle(box).scrollSnapType }))
  expect(landing.left).toBeCloseTo(landing.width + 8, 1)
  expect(landing.opacity).toBe('1')
  expect(landing.snap).toBe('x mandatory')
  await expect(figure.getByRole('button', { name: '显示第 2 张图片', exact: true })).toHaveAttribute('aria-current', 'true')
}

for (const width of [390, 1440]) {
  test(`distant compact dots slide directly and can be retargeted at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/tests/e2e/fixtures/mobile-images.html')
    await checkJump(page)
  })
}

test('a distant dot lands immediately when motion is disabled during the transition', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  const figure = page.locator('#compact')
  await figure.getByRole('button', { name: '显示第 5 张图片', exact: true }).click()
  await expect(figure.locator('.apple-image__jump')).toHaveCount(1)
  await page.locator('#none').dispatchEvent('click')
  await expect(figure.locator('.apple-image__jump')).toHaveCount(0)
  await expect(figure).toHaveAttribute('data-index', '4')
  const end = await figure.locator('.apple-image__gallery').evaluate(box => ({ left: box.scrollLeft, max: box.scrollWidth - box.clientWidth, opacity: getComputedStyle(box).opacity }))
  expect(end.left).toBeCloseTo(end.max, 1)
  expect(end.opacity).toBe('1')
})

test('WebKit compact dots skip intermediate photos and accept a new destination', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    await page.goto(`${baseURL}/tests/e2e/fixtures/mobile-images.html`)
    await checkJump(page)
  } finally { await browser.close() }
})

test('resizing or removing a compact gallery cleans up an unfinished jump', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  const figure = page.locator('#compact')
  await figure.getByRole('button', { name: '显示第 5 张图片', exact: true }).click()
  await expect(figure.locator('.apple-image__jump')).toHaveCount(1)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(figure.locator('.apple-image__jump')).toHaveCount(0)
  const landing = await figure.locator('.apple-image__gallery').evaluate(box => ({ left: box.scrollLeft, end: box.scrollWidth - box.clientWidth }))
  expect(landing.left).toBeCloseTo(landing.end, 1)
  await expect(figure).toHaveAttribute('data-index', '4')
  await figure.getByRole('button', { name: '显示第 1 张图片', exact: true }).click()
  await expect(figure.locator('.apple-image__jump')).toHaveCount(1)
  await page.locator('#remove').click()
  await expect(page.locator('.apple-image__jump')).toHaveCount(0)
})

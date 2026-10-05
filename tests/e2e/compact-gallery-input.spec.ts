import { expect, test, webkit, type Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  await expect.poll(() => page.locator('#compact img').first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
}

async function wheelGesture(page: Page, direction: number) {
  // A continuous burst may now cross several photos, including its momentum tail.
  const width = await page.locator('#compact .apple-image__gallery').evaluate(box => box.clientWidth)
  for (let i = 0; i < 42; i++) {
    await page.mouse.wheel(direction * width * (i < 12 ? .3 : Math.max(2, 42 - i) * .002), 0)
  }
}

async function trackpad(page: Page) {
  const figure = page.locator('#compact'), strip = figure.locator('.apple-image__gallery')
  const stride = await strip.evaluate(box => (box.children[1] as HTMLElement).offsetLeft)
  await page.mouse.move(200, 180) // Hold this position across both directions.
  await wheelGesture(page, 1)
  await expect.poll(async () => Number(await figure.getAttribute('data-index'))).toBeGreaterThanOrEqual(2)
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeGreaterThanOrEqual(stride * 2 - 1)
  const waitForSnap = async () => {
    let previous = -1, stableSince = Date.now()
    await expect.poll(async () => {
      const position = await strip.evaluate(box => box.scrollLeft)
      if (Math.abs(position - previous) > .5) stableSince = Date.now()
      previous = position
      return Date.now() - stableSince >= 250 && Math.abs(position - Math.round(position / stride) * stride) <= 1
    }).toBe(true)
  }
  await waitForSnap()
  const forwardIndex = Number(await figure.getAttribute('data-index'))
  const forwardPosition = await strip.evaluate(box => box.scrollLeft)
  await wheelGesture(page, -1)
  await expect.poll(async () => Number(await figure.getAttribute('data-index'))).toBeLessThanOrEqual(forwardIndex - 2)
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeLessThanOrEqual(forwardPosition - stride * 2 + 1)
  await waitForSnap()
  const finalIndex = Number(await figure.getAttribute('data-index'))
  expect(await strip.evaluate(box => box.scrollLeft)).toBeCloseTo(stride * finalIndex, 0)
}

async function rapidClicks(page: Page, reverse: boolean) {
  const result = await page.locator('#compact').evaluate(async (figure, reverse) => {
    const strip = figure.querySelector<HTMLElement>('.apple-image__gallery')!
    const stride = (strip.children[1] as HTMLElement).offsetLeft
    const samples: Array<{ time: number; x: number }> = [], handoffs: Array<{ before: number; after: number }> = []
    const click = (previous = false) => {
      const before = strip.scrollLeft
      figure.querySelector<HTMLButtonElement>(previous ? '[aria-label="上一张图片"]' : '[aria-label="下一张图片"]')!.click()
      handoffs.push({ before, after: strip.scrollLeft })
    }
    const start = performance.now()
    click()
    for (let frame = 0; frame < 90; frame++) {
      await new Promise(requestAnimationFrame)
      samples.push({ time: performance.now() - start, x: strip.scrollLeft })
      if (frame === 5) click(reverse)
      if (frame === 9) click()
      if (frame === 13 && !reverse) click()
    }
    return { samples, handoffs, stride, index: figure.getAttribute('data-index'), overlays: figure.querySelectorAll('.apple-image__jump').length, snap: getComputedStyle(strip).scrollSnapType }
  }, reverse)
  for (const handoff of result.handoffs) expect(Math.abs(handoff.after - handoff.before)).toBeLessThanOrEqual(1)
  expect(result.index).toBe(reverse ? '1' : '4')
  expect(result.samples.at(-1)!.x).toBeCloseTo(result.stride * (reverse ? 1 : 4), 0)
  expect(result.overlays).toBe(0)
  expect(result.snap).toBe('x mandatory')
  for (let i = 1; i < result.samples.length; i++) {
    const previous = result.samples[i - 1], sample = result.samples[i]
    if (!reverse) expect(sample.x).toBeGreaterThanOrEqual(previous.x - 1)
    // Reject a page-sized jump between frames, allowing for actual frame duration.
    expect(Math.abs(sample.x - previous.x) / Math.max(1, sample.time - previous.time) / result.stride).toBeLessThan(.025)
  }
  return result
}

test('a desktop trackpad burst can cross multiple compact photos without moving the cursor', async ({ page }) => {
  await ready(page)
  await trackpad(page)
})

for (const reverse of [false, true]) {
  test(`rapid compact arrows preserve the painted position and settle: reverse=${reverse}`, async ({ page }, testInfo) => {
    await ready(page)
    const frames = await rapidClicks(page, reverse)
    await testInfo.attach('paging-frames', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
  })
}

test('compact wheel input preserves vertical scrolling and handles shift and line units', async ({ page }) => {
  await ready(page)
  const figure = page.locator('#compact')
  await page.mouse.move(200, 180)
  await page.mouse.wheel(0, 200)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await expect(figure).toHaveAttribute('data-index', '0')
  const width = await figure.locator('.apple-image__gallery').evaluate(box => box.clientWidth)
  await figure.locator('.apple-image__gallery').dispatchEvent('wheel', { deltaY: width * 2.5 / 16, deltaMode: 1, shiftKey: true })
  await expect.poll(async () => Number(await figure.getAttribute('data-index'))).toBeGreaterThanOrEqual(2)
  const index = await figure.getAttribute('data-index')
  await figure.locator('.apple-image__gallery').dispatchEvent('wheel', { deltaX: 300, ctrlKey: true })
  await expect(figure).toHaveAttribute('data-index', index!)
})

test('WebKit compact trackpad scrolls freely and rapid arrows keep their motion', async ({ baseURL }, testInfo) => {
  test.setTimeout(60000)
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 900 } })
    await ready(page)
    await trackpad(page)
    await ready(page)
    const frames = await rapidClicks(page, false)
    await testInfo.attach('webkit-paging-frames', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
  } finally { await browser.close() }
})

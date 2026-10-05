import { test, expect } from '@playwright/test'

for (const hasTouch of [false, true]) {
  for (const width of [390, 1440]) {
    test(`AppleImage selects by touch capability: touch=${hasTouch}, width=${width}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch })
      const page = await context.newPage()
      try {
        await page.goto('/tests/e2e/fixtures/mobile-images.html')
        const image = page.locator('#compact')
        await expect(image).toHaveClass(hasTouch ? /apple-image--mobile/ : /^(?!.*apple-image--mobile)/)
        await image.locator('.apple-image__trigger').first().click()
        const viewer = page.locator('.apple-image-viewer')
        await expect(viewer).toBeVisible()
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
        await page.setViewportSize({ width: width === 390 ? 1440 : 390, height: 900 })
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
        await page.keyboard.press('Escape')
        await expect(viewer).toHaveCount(0)
        await image.locator('.apple-image__trigger').first().click()
        await expect(viewer).toBeVisible()
        await expect(viewer).toHaveClass(hasTouch ? /apple-image-viewer--mobile/ : /^(?!.*apple-image-viewer--mobile)/)
      } finally {
        await context.close()
      }
    })
  }
}

for (const hasTouch of [false, true]) {
  test(`image returns below navigation while the sticky directory stays behind the viewer: touch=${hasTouch}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch })
    const page = await context.newPage()
    try {
      await page.goto('/components#apple-image')
      await page.locator('#apple-image .apple-image__trigger').first().click()
      const viewer = page.locator('.apple-image-viewer')
      await expect(viewer).toBeVisible()
      if (hasTouch) await expect(viewer).toHaveAttribute('data-phase', 'open')
      const navZ = await page.locator('.apple-navibar__bar').first().evaluate(element => Number(getComputedStyle(element).zIndex))
      await expect(page.locator('.apple-navibar__bar').first()).toHaveCSS('opacity', '0')
      await expect(page.locator('.sidebar')).toHaveCSS('opacity', '1')
      expect(await viewer.evaluate(element => Number(getComputedStyle(element).zIndex))).toBeGreaterThan(0)
      expect(await viewer.evaluate(element => Number(getComputedStyle(element).zIndex))).toBeGreaterThan(navZ)
      const closing = await viewer.evaluate(async element => {
        element.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()
        await new Promise(requestAnimationFrame)
        await new Promise(requestAnimationFrame)
        return { z: Number(getComputedStyle(element).zIndex), returning: element.getAttribute('data-phase') === 'closing' || element.classList.contains('apple-viewer-presence-leave-active') }
      })
      expect(closing.returning).toBe(true)
      expect(closing.z).toBeLessThan(navZ)
      await expect(viewer).toHaveCount(0)
      await expect(page.locator('.apple-navibar__bar').first()).toHaveCSS('opacity', '1')
      await expect(page.locator('.sidebar')).toHaveCSS('opacity', '1')
    } finally { await context.close() }
  })
}

test('desktop paging preserves outgoing zoom and resets the new and revisited photos', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  await page.locator('#compact .apple-image__trigger').first().click()
  const viewer = page.locator('.apple-image-viewer')
  const active = viewer.locator('.apple-viewer-page:not([class*="-leave-"])')
  await expect(active.locator('img')).toHaveCSS('visibility', 'visible')
  await viewer.getByRole('button', { name: '放大', exact: true }).click()
  await expect.poll(() => active.locator('.apple-viewer-canvas').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeCloseTo(Math.exp(.2), 4)
  const zoomed = await active.locator('.apple-viewer-canvas').evaluate(element => getComputedStyle(element).transform)
  const outgoing = await viewer.evaluate(async element => {
    element.querySelector<HTMLButtonElement>('[aria-label="下一张"]')!.click()
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    await new Promise(resolve => setTimeout(resolve, 80))
    const leaving = element.querySelector('.apple-viewer-page-next-leave-active')!
    return { zoom: getComputedStyle(leaving.querySelector('.apple-viewer-canvas')!).transform, visibility: getComputedStyle(leaving.querySelector('img')!).visibility, slide: getComputedStyle(leaving).transform }
  })
  expect(outgoing.zoom).toBe(zoomed)
  expect(outgoing.visibility).toBe('visible')
  expect(outgoing.slide).not.toBe('none')
  await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
  await expect(active.locator('.apple-viewer-canvas')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await viewer.getByRole('button', { name: '上一张', exact: true }).click()
  await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
  await expect(active.locator('.apple-viewer-canvas')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await expect(active.locator('img')).toHaveAttribute('alt', '横图')
})

test('desktop zoom interpolates and a drag catches the visible pose without jumping to its target', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
  await page.locator('#compact .apple-image__trigger').first().click()
  const viewer = page.locator('.apple-image-viewer'), canvas = viewer.locator('.apple-viewer-canvas')
  await expect(viewer.locator('.apple-viewer-image')).toHaveCSS('visibility', 'visible')
  await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
  const sample = await viewer.evaluate(async panel => {
    const canvas = panel.querySelector('.apple-viewer-canvas')!
    panel.querySelector<HTMLButtonElement>('[aria-label="放大"]')!.click()
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    const animation = canvas.getAnimations()[0]
    animation.pause(); animation.currentTime = 60
    const before = new DOMMatrixReadOnly(getComputedStyle(canvas).transform)
    canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 720, clientY: 500, bubbles: true }))
    await new Promise(requestAnimationFrame)
    const caught = new DOMMatrixReadOnly(getComputedStyle(canvas).transform)
    document.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 744, clientY: 500, bubbles: true }))
    await new Promise(requestAnimationFrame)
    const moved = new DOMMatrixReadOnly(getComputedStyle(canvas).transform)
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 744, clientY: 500, bubbles: true }))
    return { before: before.a, caught: caught.a, moved: moved.a, distance: moved.m41 - caught.m41 }
  })
  expect(sample.before).toBeGreaterThan(1)
  expect(sample.before).toBeLessThan(Math.exp(.2))
  expect(sample.caught).toBeCloseTo(sample.before, 4)
  expect(sample.moved).toBeCloseTo(sample.before, 4)
  expect(sample.distance).toBeCloseTo(24, 1)
  await expect.poll(() => canvas.evaluate(element => element.getAnimations().length)).toBe(0)
})

for (const motion of ['reduced', 'none']) {
  test(`desktop paging respects ${motion} motion`, async ({ page }) => {
    if (motion === 'reduced') await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/tests/e2e/fixtures/mobile-images.html')
    if (motion === 'none') await page.locator('#none').click()
    await page.locator('#compact .apple-image__trigger').first().click()
    const viewer = page.locator('.apple-image-viewer')
    await expect(viewer.locator('.apple-viewer-image')).toHaveCSS('visibility', 'visible')
    await viewer.getByRole('button', { name: '下一张', exact: true }).click()
    await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
    await expect.poll(() => viewer.locator('.apple-viewer-page').evaluateAll(elements => elements.every(element => getComputedStyle(element).transform === 'none'))).toBe(true)
    await expect(viewer.locator('.apple-viewer-page')).toHaveCount(1)
    await expect(viewer.locator('.apple-viewer-image')).toHaveCSS('visibility', 'visible')
    await viewer.getByRole('button', { name: '放大', exact: true }).click()
    await expect.poll(() => viewer.locator('.apple-viewer-canvas').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeCloseTo(Math.exp(.2), 4)
    expect(await viewer.locator('.apple-viewer-canvas').evaluate(element => element.getAnimations().length)).toBe(0)
  })
}

for (const hasTouch of [false, true]) {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`opening aligns the original strip without paging: touch=${hasTouch}, motion=${reducedMotion}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 }, hasTouch, reducedMotion })
      const page = await context.newPage()
      try {
        await page.goto('/tests/e2e/fixtures/mobile-images.html')
        const strip = page.locator('#compact .apple-image__gallery')
        await expect.poll(() => strip.locator('img').first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
        await strip.evaluate(box => { (box as HTMLElement).style.scrollSnapType = 'none'; box.scrollLeft = box.clientWidth / 2 })
        await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBeGreaterThan(0)
        await strip.locator('button').first().dispatchEvent('click')
        const viewer = page.locator('.apple-image-viewer')
        await expect(viewer).toBeVisible()
        await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBe(0)
        await page.keyboard.press('Escape')
        await expect(viewer).toHaveCount(0)
        await expect(strip.locator('img').first()).toHaveCSS('opacity', '1')
        expect(await strip.evaluate(box => box.scrollLeft)).toBe(0)
      } finally { await context.close() }
    })
  }
}

for (const rotated of [false, true]) {
  test(`desktop return flies from the live photo into its thumbnail: rotated=${rotated}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/tests/e2e/fixtures/mobile-images.html')
    const thumbnail = page.locator('#compact .apple-image__trigger img').first()
    await thumbnail.click()
    const viewer = page.locator('.apple-image-viewer')
    await expect(viewer.locator('.apple-viewer-image')).toBeVisible()
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    await viewer.getByRole('button', { name: '放大', exact: true }).click()
    if (rotated) await viewer.getByRole('button', { name: '旋转', exact: true }).click()
    await expect.poll(() => viewer.locator('.apple-viewer-canvas').evaluate(canvas => canvas.getAnimations().length)).toBe(0)
    await expect.poll(() => viewer.locator('.apple-viewer-image').evaluate(image => image.getAnimations().length)).toBe(0)
    const before = (await viewer.locator('.apple-viewer-image').boundingBox())!
    const target = (await thumbnail.boundingBox())!
    const poses = await viewer.evaluate(panel => {
      panel.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()
      return new Promise<{ start: { x: number; y: number; width: number; height: number }; end: { x: number; y: number; width: number; height: number } }>(resolve => {
        requestAnimationFrame(() => {
          const flight = panel.querySelector<HTMLElement>('.apple-viewer-return-photo')!
          const animations = panel.getAnimations({ subtree: true })
          animations.forEach(animation => { animation.pause(); animation.currentTime = 0 })
          const start = flight.querySelector('img')!.getBoundingClientRect().toJSON()
          animations.forEach(animation => { animation.currentTime = Number(animation.effect!.getTiming().duration) })
          const end = flight.getBoundingClientRect().toJSON()
          const inset = getComputedStyle(flight).clipPath.match(/^inset\(([^)]*)/)![1].split('round')[0].trim().split(/\s+/).map(parseFloat)
          const scale = end.width / flight.offsetWidth
          end.x += (inset[3] ?? inset[1] ?? inset[0]) * scale; end.y += inset[0] * scale
          animations.forEach(animation => { animation.currentTime = 0; animation.play() })
          resolve({ start, end })
        })
      })
    })
    expect(poses.start.x).toBeCloseTo(before.x, 0)
    expect(poses.start.y).toBeCloseTo(before.y, 0)
    expect(poses.start.width).toBeCloseTo(before.width, 0)
    expect(poses.start.height).toBeCloseTo(before.height, 0)
    expect(poses.end.x).toBeCloseTo(target.x, 0)
    expect(poses.end.y).toBeCloseTo(target.y, 0)
    await expect(thumbnail).toHaveCSS('opacity', '0')
    await expect(viewer).toHaveCount(0)
    await expect(thumbnail).toHaveCSS('opacity', '1')
    await expect(page.locator('.apple-viewer-return-photo')).toHaveCount(0)
  })
}

import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
})

test('high frequency fractional wheels keep one continuous target and reverse without snapping', async ({ page }) => {
  await page.locator('#standalone').click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const sample = await viewer.evaluate(async panel => {
    const scale = () => Number(panel.getAttribute('data-scale'))
    const send = (deltaY: number) => panel.dispatchEvent(new WheelEvent('wheel', { deltaY, clientX: 640, clientY: 360, bubbles: true, cancelable: true }))
    for (let i = 0; i < 100; i++) send(-.5)
    const immediate = scale()
    await new Promise(resolve => setTimeout(resolve, 60))
    const moving = scale()
    for (let i = 0; i < 100; i++) send(-.5)
    const handoff = scale()
    await new Promise(resolve => setTimeout(resolve, 80))
    const beforeReverse = scale()
    for (let i = 0; i < 50; i++) send(.5)
    const afterReverse = scale()
    return { immediate, moving, handoff, beforeReverse, afterReverse }
  })
  expect(sample.immediate).toBeLessThan(1.002)
  expect(sample.moving).toBeGreaterThan(1)
  expect(sample.moving).toBeLessThan(Math.exp(.1))
  expect(Math.abs(sample.handoff - sample.moving)).toBeLessThan(.015)
  expect(Math.abs(sample.afterReverse - sample.beforeReverse)).toBeLessThan(.015)
  await expect.poll(async () => Number(await viewer.getAttribute('data-scale'))).toBeCloseTo(Math.exp(.15), 4)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
})

test('wheel, rotation and repeated navigation compose while pages remain clipped to their own viewport', async ({ page }) => {
  await page.locator('#compact .apple-image__trigger').first().click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'opening')
  await viewer.dispatchEvent('wheel', { deltaY: -450, clientX: 640, clientY: 360 })
  await viewer.getByRole('button', { name: '向右旋转90度', exact: true }).dispatchEvent('click')
  await viewer.getByRole('button', { name: '下一张', exact: true }).dispatchEvent('click')
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
  await expect(viewer).toHaveAttribute('data-phase', /opening|settling/)
  await viewer.dispatchEvent('wheel', { deltaY: -300, clientX: 900, clientY: 360 })
  await viewer.getByRole('button', { name: '向左旋转90度', exact: true }).dispatchEvent('click')
  await viewer.getByRole('button', { name: '下一张', exact: true }).dispatchEvent('click')
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('3 / 5')
  await viewer.dispatchEvent('wheel', { deltaY: -500, clientX: 640, clientY: 360 })
  await expect.poll(async () => Number(await viewer.getAttribute('data-scale'))).toBeCloseTo(Math.exp(1), 4)
  await viewer.getByRole('button', { name: '下一张', exact: true }).click()
  const clipping = await viewer.evaluate(async panel => {
    await new Promise(requestAnimationFrame)
    const outgoing = panel.querySelector('.apple-viewer-slide[data-index="2"]')!
    const animation = panel.getAnimations({ subtree: true }).find(animation => (animation.effect as KeyframeEffect).target === outgoing)!
    animation.pause(); animation.currentTime = Number(animation.effect!.getTiming().duration) * .4
    const picture = outgoing.querySelector('img')!
    const image = picture.getBoundingClientRect()
    const bounds = outgoing.getBoundingClientRect()
    const x = bounds.left > 2 ? bounds.left - 2 : bounds.right + 2
    picture.style.pointerEvents = 'auto'
    const outside = document.elementFromPoint(x, innerHeight / 2)
    picture.style.pointerEvents = ''
    animation.play()
    return { overflow: getComputedStyle(outgoing).overflow, enlarged: image.width > bounds.width || image.height > bounds.height,
      leaks: outside?.closest('.apple-viewer-slide') === outgoing }
  })
  expect(clipping.overflow).toBe('hidden')
  expect(clipping.enlarged).toBe(true)
  expect(clipping.leaks).toBe(false)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('wheel input reverses a rotated closing photo from its painted geometry and retains the scroll lock', async ({ page }) => {
  await page.locator('#compact .apple-image__trigger').first().click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await viewer.getByRole('button', { name: '向右旋转90度', exact: true }).click()
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const continuity = await viewer.evaluate(async panel => {
    panel.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()
    await new Promise(requestAnimationFrame)
    panel.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 120 })
    const before = panel.querySelector('.apple-viewer-image')!.getBoundingClientRect().toJSON()
    panel.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, clientX: 640, clientY: 360, bubbles: true, cancelable: true }))
    await Promise.resolve(); await Promise.resolve()
    panel.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 0 })
    const after = panel.querySelector('.apple-viewer-image')!.getBoundingClientRect().toJSON()
    panel.getAnimations({ subtree: true }).forEach(animation => animation.play())
    return { before, after, lock: document.body.style.overflow }
  })
  for (const axis of ['x', 'y', 'width', 'height']) expect(continuity.after[axis]).toBeCloseTo(continuity.before[axis], 0)
  expect(continuity.lock).toBe('hidden')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await expect(viewer.locator('.apple-viewer-image')).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
})

test('navigation fades in and slides down while the photo is returning', async ({ page }) => {
  await page.goto('/components#apple-image')
  await page.locator('#apple-image .apple-image__trigger').first().click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const nav = page.locator('.apple-navibar__bar').first()
  await expect(nav).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, -12)')
  const transition = await viewer.evaluate(async panel => {
    panel.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()
    const header = document.querySelector('.apple-navibar__bar')!
    for (let frame = 0; frame < 30; frame++) {
      await new Promise(requestAnimationFrame)
      const css = getComputedStyle(header), opacity = Number(css.opacity), y = new DOMMatrixReadOnly(css.transform).m42
      if (opacity > 0 && opacity < 1 && y > -12 && y < 0) return { phase: panel.getAttribute('data-phase'), opacity, y }
    }
    throw new Error('Navigation did not fade and slide during the photo return')
  })
  expect(transition.phase).toBe('closing')
  expect(transition.opacity).toBeGreaterThan(0)
  expect(transition.opacity).toBeLessThan(1)
  expect(transition.y).toBeGreaterThan(-12)
  expect(transition.y).toBeLessThan(0)
  await expect(nav).toHaveCSS('opacity', '1')
  await expect(nav).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})

test('compact wheel bursts interpolate, accumulate and can be interrupted by a dot selection', async ({ page }) => {
  const strip = page.locator('#compact .apple-image__surface > .apple-image__gallery')
  const width = await strip.evaluate(element => element.clientWidth)
  const positions = await strip.evaluate(async element => {
    for (let i = 0; i < 8; i++) element.dispatchEvent(new WheelEvent('wheel', { deltaX: 120, bubbles: true, cancelable: true }))
    const immediate = element.scrollLeft
    await new Promise(resolve => setTimeout(resolve, 70))
    const moving = element.scrollLeft
    const began = performance.now()
    for (let i = 0; i < 8; i++) element.dispatchEvent(new WheelEvent('wheel', { deltaX: 120, bubbles: true, cancelable: true }))
    return { immediate, moving, handoff: element.scrollLeft, elapsed: performance.now() - began }
  })
  expect(positions.immediate).toBeLessThan(20)
  expect(positions.moving).toBeGreaterThan(20)
  expect(positions.moving).toBeLessThan(960)
  expect(Math.abs(positions.handoff - positions.moving)).toBeLessThan(2 + 1920 * 24 / Math.E * (positions.elapsed + 1000 / 60) / 1000)
  await page.locator('#compact .apple-image__dot').nth(3).click()
  await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeCloseTo((width + 8) * 3, 0)
  await expect(strip).toHaveCSS('scroll-snap-type', 'x mandatory')
})

test('compact wheel retains accumulated intent when the next event interrupts idle snapping', async ({ page }) => {
  const strip = page.locator('#compact .apple-image__surface > .apple-image__gallery')
  const width = await strip.evaluate(element => element.clientWidth)
  await strip.evaluate(async element => {
    const deltaX = element.clientWidth * .31
    element.dispatchEvent(new WheelEvent('wheel', { deltaX, bubbles: true, cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 160))
    element.dispatchEvent(new WheelEvent('wheel', { deltaX, bubbles: true, cancelable: true }))
  })
  await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeCloseTo(width + 8, 0)
  await expect(strip).toHaveCSS('scroll-snap-type', 'x mandatory')
})

test('a distant compact jump hands its painted composition to the wheel and back to a dot', async ({ page }) => {
  const figure = page.locator('#compact')
  await figure.getByRole('button', { name: '显示第 5 张图片', exact: true }).click()
  const continuity = await figure.evaluate(async element => {
    const box = element.querySelector<HTMLElement>('.apple-image__surface > .apple-image__gallery')!
    const overlay = element.querySelector<HTMLElement>('.apple-image__jump')!
    overlay.getAnimations({ subtree: true }).forEach(animation => { animation.pause(); animation.currentTime = 120 })
    const incoming = overlay.lastElementChild!, before = incoming.getBoundingClientRect().left
    box.dispatchEvent(new WheelEvent('wheel', { deltaX: -200, bubbles: true, cancelable: true }))
    const after = incoming.getBoundingClientRect().left, initialOpacity = Number(getComputedStyle(overlay).opacity)
    await new Promise(resolve => setTimeout(resolve, 70))
    const fadingOpacity = Number(getComputedStyle(overlay).opacity)
    element.querySelector<HTMLButtonElement>('[aria-label="显示第 2 张图片"]')!.click()
    await Promise.resolve()
    const retained = overlay.isConnected
    return { before, after, initialOpacity, fadingOpacity, retained }
  })
  expect(continuity.after).toBeCloseTo(continuity.before, 1)
  expect(continuity.initialOpacity).toBeCloseTo(1, 3)
  expect(continuity.fadingOpacity).toBeGreaterThan(0)
  expect(continuity.fadingOpacity).toBeLessThan(1)
  expect(continuity.retained).toBe(true)
  await expect(figure.locator('.apple-image__jump')).toHaveCount(0)
  const box = figure.locator('.apple-image__surface > .apple-image__gallery')
  await expect.poll(() => box.evaluate(element => element.scrollLeft - element.clientWidth - 8)).toBeCloseTo(0, 0)
  await expect(box).toHaveCSS('opacity', '1')
  await expect(box).toHaveCSS('scroll-snap-type', 'x mandatory')
})

test('wheel interpolation keeps the photo point under the cursor fixed', async ({ page }) => {
  await page.locator('#standalone').click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const samples = await viewer.evaluate(async panel => {
    const photo = panel.querySelector('.apple-viewer-image')!, x = 820, y = 440
    const before = photo.getBoundingClientRect(), u = (x - before.left) / before.width, v = (y - before.top) / before.height
    panel.dispatchEvent(new WheelEvent('wheel', { deltaY: -450, clientX: x, clientY: y, bubbles: true, cancelable: true }))
    const samples = []
    for (let frame = 0; frame < 24; frame++) {
      await new Promise(requestAnimationFrame)
      const bounds = photo.getBoundingClientRect()
      samples.push({ x: bounds.left + bounds.width * u, y: bounds.top + bounds.height * v })
    }
    return samples
  })
  for (const point of samples) { expect(point.x).toBeCloseTo(820, 1); expect(point.y).toBeCloseTo(440, 1) }
})

test('drag translation composes with a continuing wheel zoom and release preserves its target', async ({ page }) => {
  await page.locator('#standalone').click()
  const viewer = page.locator('.apple-image-viewer')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await viewer.dispatchEvent('wheel', { deltaY: -Math.log(2) / .002, clientX: 640, clientY: 360 })
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const translated = await viewer.evaluate(async panel => {
    const stage = panel.querySelector('.apple-viewer-stage')!
    const pointer = (type: string, clientX: number, clientY: number) => stage.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'mouse', button: 0, clientX, clientY, bubbles: true }))
    pointer('pointerdown', 640, 360)
    panel.dispatchEvent(new WheelEvent('wheel', { deltaY: -300, clientX: 640, clientY: 360, bubbles: true, cancelable: true }))
    await new Promise(resolve => setTimeout(resolve, 60))
    pointer('pointermove', 710, 390)
    await new Promise(resolve => setTimeout(resolve, 60))
    const bounds = panel.querySelector('.apple-viewer-image')!.getBoundingClientRect()
    pointer('pointerup', 710, 390)
    return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
  })
  expect(translated.x).toBeCloseTo(710, 1)
  expect(translated.y).toBeCloseTo(390, 1)
  await expect.poll(async () => Number(await viewer.getAttribute('data-scale'))).toBeCloseTo(2 * Math.exp(.6), 4)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
})

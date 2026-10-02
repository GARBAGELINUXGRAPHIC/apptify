import { expect, test, webkit, type Locator, type Page } from '@playwright/test'
import { swipeImage } from './image-gestures'

test.use({ hasTouch: true })

async function openPhoto(page: Page, group = '#compact', index = 0) {
  const trigger = page.locator(`${group} .apple-image__trigger`).nth(index)
  await trigger.scrollIntoViewIfNeeded()
  await expect.poll(() => trigger.locator('img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await trigger.click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  return viewer
}
async function pointer(viewer: Locator, type: string, id: number, x: number, y: number) {
  await viewer.locator('.apple-viewer-stage').dispatchEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, button: 0, bubbles: true })
}
async function tapReturn(viewer: Locator) {
  const flight = viewer.evaluate(panel => new Promise<{
    frame: ComputedKeyframe[]; image: ComputedKeyframe[]; opacity: string; locked: string; placeholder: string; duration: number
  }>(resolve => {
    const observer = new MutationObserver(() => {
      if (panel.getAttribute('data-phase') !== 'closing') return
      observer.disconnect()
      requestAnimationFrame(() => {
        const frame = panel.querySelector('.apple-viewer-canvas')!, image = frame.querySelector('img')!
        const animation = frame.getAnimations()[0]
        resolve({
          frame: (animation.effect as KeyframeEffect).getKeyframes(), image: (image.getAnimations()[0].effect as KeyframeEffect).getKeyframes(),
          opacity: getComputedStyle(image).opacity, locked: document.body.style.overflow,
          placeholder: getComputedStyle(document.querySelector('.apple-image__trigger--placeholder img')!).opacity,
          duration: Number(animation.effect!.getTiming().duration),
        })
      })
    })
    observer.observe(panel, { attributes: true, attributeFilter: ['data-phase'] })
  }))
  await viewer.locator('.apple-viewer-stage').click({ position: { x: 195, y: 422 } })
  return await flight
}
async function expectGlass(viewer: Locator) {
  const materials = await viewer.locator('button, .apple-viewer-toolbar').evaluateAll(elements => elements.map(element => {
    const css = getComputedStyle(element)
    return { filter: css.backdropFilter || css.getPropertyValue('-webkit-backdrop-filter'), background: css.backgroundColor }
  }))
  expect(materials.length).toBeGreaterThan(0)
  for (const material of materials) {
    expect(material.filter).toMatch(/blur\([1-9]\d*px\) saturate\((2|200%)\)/)
    const opacity = Number(material.background.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)?.[1])
    expect(opacity).toBeGreaterThan(.2)
    expect(opacity).toBeLessThan(.8)
  }
}
async function bounded(viewer: Locator) {
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const bounds = await viewer.evaluate(panel => {
    const viewport = panel.getBoundingClientRect(), image = panel.querySelector('.apple-viewer-image')!.getBoundingClientRect()
    return { viewport: { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height }, image: { x: image.x, y: image.y, width: image.width, height: image.height } }
  })
  for (const [origin, size] of [['x','width'],['y','height']] as const) {
    if (bounds.image[size] >= bounds.viewport[size] - 1) {
      expect(bounds.image[origin]).toBeLessThanOrEqual(bounds.viewport[origin] + 1)
      expect(bounds.image[origin] + bounds.image[size]).toBeGreaterThanOrEqual(bounds.viewport[origin] + bounds.viewport[size] - 1)
    } else expect(bounds.image[origin] + bounds.image[size] / 2).toBeCloseTo(bounds.viewport[origin] + bounds.viewport[size] / 2, 1)
  }
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/tests/e2e/fixtures/mobile-images.html')
})

test('a single tap waits for the double-tap window before starting its return flight', async ({ page }) => {
  const viewer = await openPhoto(page)
  const timing = await viewer.evaluate(async panel => {
    const stage = panel.querySelector('.apple-viewer-stage')!
    const started = performance.now()
    const closing = new Promise<number>(resolve => {
      const observer = new MutationObserver(() => {
        if (panel.getAttribute('data-phase') === 'closing') { observer.disconnect(); resolve(performance.now() - started) }
      })
      observer.observe(panel, { attributes: true, attributeFilter: ['data-phase'] })
    })
    for (const type of ['pointerdown', 'pointerup']) stage.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', clientX: 140, clientY: 422, button: 0, bubbles: true }))
    await Promise.resolve()
    const immediate = panel.getAttribute('data-phase')
    await new Promise(resolve => setTimeout(resolve, 100))
    const waiting = panel.getAttribute('data-phase')
    return { immediate, waiting, elapsed: await closing }
  })
  expect(timing.immediate).toBe('open')
  expect(timing.waiting).toBe('open')
  expect(timing.elapsed).toBeGreaterThanOrEqual(190)
  await expect(viewer).toHaveAttribute('data-phase', 'closing')
  await expect(page.locator('#compact .apple-image__trigger img').first()).toHaveCSS('opacity', '0')
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expect(viewer).toHaveCount(0)
})

test('the tap decision uses exactly 200ms, including when motion is disabled', async ({ page }) => {
  await page.locator('#none').click()
  const viewer = await openPhoto(page)
  await page.clock.install({ time: new Date('2026-10-01T00:00:00Z') })
  await page.clock.pauseAt(new Date('2026-10-01T00:00:01Z'))
  await pointer(viewer, 'pointerdown', 1, 140, 422)
  await pointer(viewer, 'pointerup', 1, 140, 422)
  await page.clock.runFor(199)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await pointer(viewer, 'pointerdown', 2, 140, 422)
  await pointer(viewer, 'pointerup', 2, 140, 422)
  await expect(viewer).toHaveAttribute('data-scale', '2')
  await page.clock.runFor(500)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  const reopened = await openPhoto(page)
  await pointer(reopened, 'pointerdown', 3, 140, 422)
  await pointer(reopened, 'pointerup', 3, 140, 422)
  await page.clock.runFor(199)
  await expect(reopened).toHaveAttribute('data-phase', 'open')
  await page.clock.runFor(1)
  await expect(reopened).toHaveCount(0)
})

for (const reduced of [false, true]) {
  test(`a browser double-click zooms around its focal point and toggles back without dismissing${reduced ? ' with reduced motion' : ''}`, async ({ page }) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' })
    const viewer = await openPhoto(page, '#tiled', 1)
    const image = viewer.locator('.apple-viewer-image')
    const original = (await image.boundingBox())!
    const point = { x: 140, y: 300 }
    await viewer.locator('.apple-viewer-stage').dblclick({ position: point, delay: 60 })
    await bounded(viewer)
    await expect(viewer).toHaveAttribute('data-scale', '2')
    const enlarged = (await image.boundingBox())!
    expect(enlarged.width).toBeCloseTo(original.width * 2, 1)
    expect(enlarged.x + enlarged.width * ((point.x - original.x) / original.width)).toBeCloseTo(point.x, 1)
    expect(enlarged.y + enlarged.height * ((point.y - original.y) / original.height)).toBeCloseTo(point.y, 1)
    await page.waitForTimeout(350)
    await expect(viewer).toHaveAttribute('data-phase', 'open')
    await viewer.locator('.apple-viewer-stage').dblclick({ position: point, delay: 60 })
    await bounded(viewer)
    await expect(viewer).toHaveAttribute('data-scale', '1')
    const restored = (await image.boundingBox())!
    expect(restored.x).toBeCloseTo(original.x, 1)
    expect(restored.y).toBeCloseTo(original.y, 1)
    expect(restored.width).toBeCloseTo(original.width, 1)
    await viewer.locator('.apple-viewer-stage').click({ position: point })
    await expect(viewer).toHaveAttribute('data-phase', 'open')
    await expect(viewer).toHaveCount(0)
  })
}

test('real touch double-taps zoom, and a following pinch cancels a pending single-tap exit', async ({ page }) => {
  const viewer = await openPhoto(page)
  const session = await page.context().newCDPSession(page)
  const touch = async (type: string, points: Array<{ id: number; x: number; y: number }>) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points })
  for (let i = 0; i < 2; i++) {
    await touch('touchStart', [{ id: 1, x: 140, y: 422 }])
    await touch('touchEnd', [])
    if (!i) await page.waitForTimeout(60)
  }
  await bounded(viewer)
  await expect(viewer).toHaveAttribute('data-scale', '2')
  await touch('touchStart', [{ id: 1, x: 140, y: 422 }])
  await touch('touchEnd', [])
  await touch('touchStart', [{ id: 1, x: 140, y: 422 }, { id: 2, x: 240, y: 422 }])
  await touch('touchMove', [{ id: 1, x: 120, y: 422 }, { id: 2, x: 260, y: 422 }])
  await touch('touchEnd', [])
  await bounded(viewer)
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await expect.poll(() => viewer.getAttribute('data-scale').then(Number)).toBeGreaterThan(2)
})

test('dragging and holding a second touch cancel the first tap instead of dismissing mid-gesture', async ({ page }) => {
  const viewer = await openPhoto(page)
  await pointer(viewer, 'pointerdown', 1, 300, 422)
  await pointer(viewer, 'pointerup', 1, 300, 422)
  await pointer(viewer, 'pointerdown', 2, 300, 422)
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await pointer(viewer, 'pointermove', 2, 100, 422)
  await pointer(viewer, 'pointerup', 2, 100, 422)
  await bounded(viewer)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
})

test('double-click fallback and delayed exits clean up across layers and immediate close/reopen', async ({ page }) => {
  await page.locator('#none').click()
  const viewer = await openPhoto(page)
  const stage = viewer.locator('.apple-viewer-stage')
  const click = { clientX: 140, clientY: 422, bubbles: true }
  await stage.dispatchEvent('click', { ...click, detail: 1 })
  await stage.dispatchEvent('click', { ...click, detail: 2 })
  await stage.dispatchEvent('dblclick', { ...click, detail: 2 })
  await expect(viewer).toHaveAttribute('data-scale', '2')
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await pointer(viewer, 'pointerdown', 1, 140, 422)
  await pointer(viewer, 'pointerup', 1, 140, 422)
  await page.locator('#stack').dispatchEvent('click')
  const dialog = page.getByRole('dialog', { name: '上层对话框', exact: true })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await pointer(viewer, 'pointerdown', 2, 140, 422)
  await pointer(viewer, 'pointerup', 2, 140, 422)
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  const reopened = await openPhoto(page)
  await page.waitForTimeout(350)
  await expect(reopened).toHaveAttribute('data-phase', 'open')
})

test('a touch can catch a double-tap zoom in place and continue panning', async ({ page }) => {
  const viewer = await openPhoto(page, '#tiled', 1)
  await viewer.locator('.apple-viewer-stage').dblclick({ position: { x: 140, y: 300 }, delay: 40 })
  await expect(viewer).toHaveAttribute('data-phase', 'settling')
  const stopped = await viewer.locator('.apple-viewer-canvas').evaluate(frame => {
    const animation = frame.getAnimations()[0]
    animation.pause(); animation.currentTime = Number(animation.effect!.getTiming().duration) * .45
    const rect = frame.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width }
  })
  await pointer(viewer, 'pointerdown', 1, 140, 300)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const caught = (await viewer.locator('.apple-viewer-image').boundingBox())!
  expect(caught.x).toBeCloseTo(stopped.x, 1)
  expect(caught.y).toBeCloseTo(stopped.y, 1)
  expect(caught.width).toBeCloseTo(stopped.width, 1)
  await pointer(viewer, 'pointermove', 1, 164, 300)
  await pointer(viewer, 'pointerup', 1, 164, 300)
  await bounded(viewer)
  await page.waitForTimeout(350)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
})

test.describe('non-touch viewer', () => {
  test.use({ hasTouch: false })

  test('desktop double-click keeps its existing zoom toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.locator('#standalone').click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    const image = viewer.locator('.apple-viewer-image')
    await expect(image).toBeVisible()
    await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
    const scale = () => viewer.locator('.apple-viewer-canvas').evaluate(canvas => new DOMMatrixReadOnly(getComputedStyle(canvas).transform).a)
    await image.dblclick()
    await expect.poll(scale).toBeCloseTo(2, 4)
    await image.dblclick()
    await expect.poll(scale).toBeCloseTo(1, 4)
  })

})

for (const { name, step, interval, moves } of [
  { name: 'slow drag', step: 20, interval: 40, moves: 5 },
  { name: 'short flick', step: 24, interval: 20, moves: 2 },
  { name: 'fast drag', step: 50, interval: 20, moves: 4 },
]) {
  test(`paging carries the release speed through a ${name} without a velocity jump`, async ({ page }) => {
    const viewer = await openPhoto(page)
    const motion = await viewer.evaluate(async (panel, { step, interval, moves }) => {
      const stage = panel.querySelector('.apple-viewer-stage')!
      const send = (type: string, x: number) => stage.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: 422, button: 0, bubbles: true, cancelable: true }))
      const samples = [{ x: 300, time: performance.now() }]
      send('pointerdown', 300)
      for (let i = 1; i <= moves; i++) {
        await new Promise(resolve => setTimeout(resolve, interval))
        samples.push({ x: 300 - step * i, time: performance.now() })
        send('pointermove', 300 - step * i)
      }
      await Promise.resolve()
      const before = new DOMMatrixReadOnly(getComputedStyle(panel.querySelector('.is-current')!).transform).m41
      send('pointerup', 300 - step * moves)
      await new Promise(requestAnimationFrame)
      const slide = panel.querySelector<HTMLElement>('.is-current')!
      const animations = panel.getAnimations({ subtree: true })
      animations.forEach(animation => animation.pause())
      const animation = slide.getAnimations()[0]
      const duration = Number(animation?.effect?.getTiming().duration)
      const positions = [0, 1, 16, 40, duration].map(time => {
        animations.forEach(animation => { animation.currentTime = time })
        return new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41
      })
      const opacity = getComputedStyle(slide.querySelector('img')!).opacity
      const current = panel.querySelector('.apple-viewer-count')!.textContent
      animations.forEach(animation => { animation.currentTime = 0; animation.play() })
      const recent = samples.filter(sample => sample.time >= samples.at(-1)!.time - 100)
      const speed = (recent.at(-1)!.x - recent[0].x) / (recent.at(-1)!.time - recent[0].time)
      return { before, positions, speed, duration, opacity, current }
    }, { step, interval, moves })
    expect(motion.current).toBe('2 / 5')
    expect(motion.positions[0]).toBeCloseTo(410 + motion.before, 2)
    const initialSpeed = motion.positions[1] - motion.positions[0]
    expect(initialSpeed / motion.speed).toBeGreaterThan(.8)
    expect(initialSpeed / motion.speed).toBeLessThan(1.25)
    expect(motion.positions.at(-1)).toBeCloseTo(0, 2)
    expect(motion.opacity).toBe('1')
    if (name === 'fast drag') {
      const nextSpeed = (motion.positions[3] - motion.positions[2]) / 24
      expect(Math.abs(nextSpeed)).toBeLessThan(Math.abs(initialSpeed))
    }
    await expect(viewer).toHaveAttribute('data-phase', 'open')
    await expect(viewer.locator('.is-current')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })
}

test('a new touch catches a paging animation in place and closes from that live photo position', async ({ page }) => {
  const viewer = await openPhoto(page)
  await pointer(viewer, 'pointerdown', 1, 300, 422)
  await pointer(viewer, 'pointermove', 1, 200, 422)
  await pointer(viewer, 'pointerup', 1, 200, 422)
  await expect(viewer).toHaveAttribute('data-phase', 'settling')
  const stopped = await viewer.locator('.is-current').evaluate(slide => {
    const animation = slide.getAnimations()[0]
    animation.pause(); animation.currentTime = Number(animation.effect!.getTiming().duration) * .45
    return { x: new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41, source: slide.querySelector('img')!.src }
  })
  await pointer(viewer, 'pointerdown', 2, 195, 422)
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await expect.poll(() => viewer.locator('.is-current').evaluate(slide => new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41)).toBeCloseTo(stopped.x, 2)
  await pointer(viewer, 'pointermove', 2, 219, 422)
  await expect.poll(() => viewer.locator('.is-current').evaluate(slide => new DOMMatrixReadOnly(getComputedStyle(slide).transform).m41)).toBeCloseTo(stopped.x + 24, 2)
  await expect(viewer.locator('.apple-viewer-image')).toHaveAttribute('src', stopped.source)
  const live = (await viewer.locator('.apple-viewer-image').boundingBox())!
  const preview = page.locator('#compact .apple-image__trigger img').nth(1)
  const destination = (await preview.boundingBox())!
  await expect(preview).toHaveCSS('opacity', '0')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveAttribute('data-phase', 'closing')
  const flight = await viewer.locator('.apple-viewer-canvas').evaluate(frame => (frame.getAnimations()[0].effect as KeyframeEffect).getKeyframes())
  expect(parseFloat(flight[0].left as string)).toBeCloseTo(live.x, 1)
  expect(parseFloat(flight[0].top as string)).toBeCloseTo(live.y, 1)
  expect(parseFloat(flight.at(-1)!.left as string)).toBeCloseTo(destination.x, 1)
  await expect(viewer).toHaveCount(0)
  await expect(preview).toHaveCSS('opacity', '1')
})

test('a caught page restores its canvas and backdrop after a cancelled downward drag', async ({ page }) => {
  const viewer = await openPhoto(page)
  await pointer(viewer, 'pointerdown', 1, 300, 422)
  await pointer(viewer, 'pointermove', 1, 200, 422)
  await pointer(viewer, 'pointerup', 1, 200, 422)
  await expect(viewer).toHaveAttribute('data-phase', 'settling')
  await viewer.locator('.is-current').evaluate(slide => {
    const animation = slide.getAnimations()[0]
    animation.pause(); animation.currentTime = Number(animation.effect!.getTiming().duration) * .45
  })
  await pointer(viewer, 'pointerdown', 2, 195, 422)
  await pointer(viewer, 'pointermove', 2, 195, 450)
  await expect.poll(() => viewer.locator('.apple-viewer-backdrop').evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(1)
  await pointer(viewer, 'pointercancel', 2, 195, 450)
  await bounded(viewer)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
  await expect(viewer.locator('.apple-viewer-backdrop')).toHaveCSS('opacity', '1')
  await swipeImage(viewer, 'right')
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('1 / 5')
})

for (const count of [2, 5]) {
  test(`looping ${count} photos moves only adjacent pages across the boundary`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/mobile-images.html?loop&count=${count}&index=${count - 1}`)
    await page.locator('#standalone').click()
    const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
    await expect(viewer).toHaveAttribute('data-phase', 'open')
    await pointer(viewer, 'pointerdown', 1, 300, 422)
    await pointer(viewer, 'pointermove', 1, 170, 422)
    await pointer(viewer, 'pointerup', 1, 170, 422)
    await expect(viewer).toHaveAttribute('data-phase', 'settling')
    const path = await viewer.locator('.apple-viewer-slide').evaluateAll(slides => slides.map(slide => {
      const animation = slide.getAnimations()[0]
      if (!animation) return null
      const frames = (animation.effect as KeyframeEffect).getKeyframes()
      return { from: new DOMMatrixReadOnly(frames[0].transform as string).m41, to: new DOMMatrixReadOnly(frames.at(-1)!.transform as string).m41 }
    }).filter(Boolean))
    expect(path).toHaveLength(2)
    expect(path).toContainEqual({ from: -130, to: -410 })
    expect(path).toContainEqual({ from: 280, to: 0 })
    await expect(viewer).toHaveAttribute('data-phase', 'open')
    await expect(viewer.locator('.apple-viewer-count')).toHaveText(`1 / ${count}`)
    await swipeImage(viewer, 'right')
    await expect(viewer.locator('.apple-viewer-count')).toHaveText(`${count} / ${count}`)
  })
}

for (const width of [390, 1440]) {
  test.describe(`viewer controls at ${width}px`, () => {
    test.use({ hasTouch: width === 390 })
    test(`all image viewer controls use translucent blur and 200% saturation at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.locator('#standalone').click()
      const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
      await expect(viewer.locator('.apple-viewer-image')).toBeVisible()
      if (width === 390) await expect(viewer).toHaveAttribute('data-phase', 'open')
      else await expect(page.locator('.apple-viewer-presence-enter-active')).toHaveCount(0)
      await expectGlass(viewer)
      await viewer.dispatchEvent('wheel', { deltaY: -750, clientX: width / 2, clientY: 450 })
      await page.screenshot({ path: `artifacts/image-viewer-glass-${width}.png` })
      const close = viewer.getByRole('button', { name: '关闭图片预览', exact: true })
      const box = (await close.boundingBox())!
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await expect(close).toHaveCSS('background-color', 'rgba(28, 28, 30, 0.72)')
      await expectGlass(viewer)
      await page.mouse.up()
      await expect(viewer).toHaveCount(0)
    })
  })
}

test('mobile groups mount every preview, page without arrows and keep a black destination until landing', async ({ page }) => {
  const group = page.locator('#compact'), previews = group.locator('.apple-image__trigger > img')
  await expect(previews).toHaveCount(5)
  const viewer = await openPhoto(page)
  await expect(viewer.locator('.apple-viewer-photo')).toHaveCount(5)
  await expect(viewer.locator('.apple-viewer-prev, .apple-viewer-next')).toHaveCount(0)
  await expect(viewer.locator('.apple-viewer-chrome > .apple-viewer-count')).toHaveText('1 / 5')
  await expect(previews.nth(0)).toHaveCSS('opacity', '0')
  await swipeImage(viewer)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
  await expect(previews.nth(0)).toHaveCSS('opacity', '1')
  await expect(previews.nth(1)).toHaveCSS('opacity', '0')
  await expect(group.locator('.apple-image__trigger').nth(1)).toHaveCSS('background-color', 'rgb(0, 0, 0)')
  const destination = (await previews.nth(1).boundingBox())!
  const strip = (await group.locator('.apple-image__gallery').boundingBox())!
  expect(destination.x).toBeCloseTo(strip.x, 1)
  const flight = await tapReturn(viewer), end = flight.frame.at(-1)!
  expect(flight.opacity).toBe('1')
  expect(parseFloat(end.left as string)).toBeCloseTo(destination.x, 1)
  expect(parseFloat(end.top as string)).toBeCloseTo(destination.y, 1)
  expect(parseFloat(end.width as string)).toBeCloseTo(destination.width, 1)
  expect(flight.duration).toBe(420)
  expect(flight.locked).toBe('hidden')
  expect(flight.placeholder).toBe('0')
  await expect(viewer).toHaveCount(0)
  await expect(previews.nth(1)).toHaveCSS('opacity', '1')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('a real two-finger pinch pans at the same time and clamps both axes after all fingers lift', async ({ page }) => {
  const viewer = await openPhoto(page)
  const session = await page.context().newCDPSession(page)
  const touch = async (type: string, points: Array<{ id: number; x: number; y: number }>) => session.send('Input.dispatchTouchEvent', { type, touchPoints: points })
  await touch('touchStart', [{ id: 1, x: 145, y: 422 }, { id: 2, x: 245, y: 422 }])
  await touch('touchMove', [{ id: 1, x: 45, y: 442 }, { id: 2, x: 345, y: 442 }])
  await expect.poll(() => viewer.getAttribute('data-scale').then(Number)).toBeCloseTo(3, 1)
  const before = (await viewer.locator('.apple-viewer-image').boundingBox())!
  await touch('touchMove', [{ id: 1, x: 80, y: 467 }, { id: 2, x: 380, y: 467 }])
  await expect.poll(async () => (await viewer.locator('.apple-viewer-image').boundingBox())!.x - before.x).toBeCloseTo(35, 0)
  const moved = (await viewer.locator('.apple-viewer-image').boundingBox())!
  expect(moved.x - before.x).toBeCloseTo(35, 0)
  await touch('touchMove', [{ id: 1, x: 20, y: 600 }, { id: 2, x: 380, y: 800 }])
  await touch('touchEnd', [])
  await bounded(viewer)
  await pointer(viewer, 'pointerdown', 3, 190, 430)
  await pointer(viewer, 'pointermove', 3, 1000, -800)
  await pointer(viewer, 'pointerup', 3, 1000, -800)
  await bounded(viewer)
  await viewer.locator('.apple-viewer-stage').dispatchEvent('click')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
})

test('upward drags stay open, small downward drags recover and a downward dismissal fades only its backdrop', async ({ page }) => {
  const viewer = await openPhoto(page)
  await pointer(viewer, 'pointerdown', 1, 195, 422)
  await pointer(viewer, 'pointermove', 1, 195, 200)
  await pointer(viewer, 'pointerup', 1, 195, 200)
  await bounded(viewer)
  await pointer(viewer, 'pointerdown', 2, 195, 422)
  await pointer(viewer, 'pointermove', 2, 205, 450)
  await expect.poll(() => viewer.locator('.apple-viewer-backdrop').evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(1)
  await pointer(viewer, 'pointercancel', 2, 205, 450)
  await bounded(viewer)
  await expect(viewer.locator('.apple-viewer-backdrop')).toHaveCSS('opacity', '1')
  await pointer(viewer, 'pointerdown', 3, 195, 422)
  await pointer(viewer, 'pointermove', 3, 230, 640)
  const dragged = (await viewer.locator('.apple-viewer-image').boundingBox())!
  await pointer(viewer, 'pointerup', 3, 230, 640)
  await expect(viewer).toHaveAttribute('data-phase', 'closing')
  const leaving = await viewer.evaluate(panel => {
    const frame = panel.querySelector('.apple-viewer-canvas')!, animation = frame.getAnimations()[0]
    return { start: (animation.effect as KeyframeEffect).getKeyframes()[0], opacity: getComputedStyle(panel.querySelector('.apple-viewer-image')!).opacity, background: Number(getComputedStyle(panel.querySelector('.apple-viewer-backdrop')!).opacity) }
  })
  expect(parseFloat(leaving.start.top as string)).toBeCloseTo(dragged.y, 0)
  expect(leaving.opacity).toBe('1')
  expect(leaving.background).toBeGreaterThan(0)
  expect(leaving.background).toBeLessThan(1)
  await expect(viewer).toHaveCount(0)
})

test('tiled contain images keep their aspect ratio during the flight, including an exit from a zoomed portrait', async ({ page }) => {
  const previews = page.locator('#tiled .apple-image__trigger img')
  await expect(previews).toHaveCount(5)
  for (const preview of await previews.all()) {
    await preview.scrollIntoViewIfNeeded()
    await expect(preview).toBeInViewport()
  }
  const viewer = await openPhoto(page, '#tiled', 1)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('2 / 5')
  await viewer.dispatchEvent('wheel', { deltaY: -450, clientX: 195, clientY: 422 })
  await bounded(viewer)
  const enlarged = (await viewer.locator('.apple-viewer-image').boundingBox())!
  const flight = await tapReturn(viewer), frames = flight.image
  expect(parseFloat(frames[0].width as string)).toBeCloseTo(enlarged.width, 1)
  for (const key of frames) expect(parseFloat(key.width as string) / parseFloat(key.height as string)).toBeCloseTo(.5, 4)
  await expect(viewer).toHaveCount(0)
  await expect(previews.nth(1)).toHaveCSS('opacity', '1')
})

test('opening preserves the photo node and cover crop, and interruption continues from the live frame', async ({ page }) => {
  const preview = page.locator('#compact .apple-image__trigger img').first()
  await expect.poll(() => preview.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  const source = (await preview.boundingBox())!
  await preview.click()
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toHaveAttribute('data-phase', 'opening')
  const opening = await viewer.locator('.apple-viewer-canvas').evaluate(async frame => {
    const image = frame.querySelector('img')!
    const animation = frame.getAnimations()[0]
    const start = (animation.effect as KeyframeEffect).getKeyframes()[0]
    const samples: Array<{ same: boolean; opacity: string; ratio: number; masked: boolean; chrome: string; control: number }> = []
    for (let i = 0; i < 4; i++) {
      await new Promise(requestAnimationFrame)
      const rect = image.getBoundingClientRect()
      samples.push({ same: frame.querySelector('img') === image, opacity: getComputedStyle(image).opacity, ratio: rect.width / rect.height, masked: Boolean(document.querySelector('#compact .apple-image__trigger--placeholder')), chrome: getComputedStyle(document.querySelector('.apple-viewer-chrome')!).opacity, control: Number(getComputedStyle(document.querySelector('.apple-viewer-close')!).opacity) })
    }
    const rect = frame.getBoundingClientRect()
    return { start, samples, rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, backdrop: Number(getComputedStyle(document.querySelector('.apple-viewer-backdrop')!).opacity) }
  })
  expect(parseFloat(opening.start.left as string)).toBeCloseTo(source.x, 1)
  expect(parseFloat(opening.start.top as string)).toBeCloseTo(source.y, 1)
  expect(parseFloat(opening.start.width as string)).toBeCloseTo(source.width, 1)
  for (const sample of opening.samples) {
    expect(sample.same).toBe(true); expect(sample.opacity).toBe('1'); expect(sample.ratio).toBeCloseTo(1.5, 3); expect(sample.masked).toBe(true)
    expect(sample.chrome).toBe('1')
  }
  expect(opening.samples.some(sample => sample.control > 0 && sample.control < 1)).toBe(true)
  expect(opening.backdrop).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveAttribute('data-phase', 'closing')
  const continuation = await viewer.evaluate(panel => ({
    from: (panel.querySelector('.apple-viewer-canvas')!.getAnimations()[0].effect as KeyframeEffect).getKeyframes()[0],
    backdrop: Number((panel.querySelector('.apple-viewer-backdrop')!.getAnimations()[0].effect as KeyframeEffect).getKeyframes()[0].opacity),
  }))
  expect(parseFloat(continuation.from.width as string)).toBeGreaterThanOrEqual(opening.rect.width - 1)
  expect(continuation.backdrop).toBeGreaterThanOrEqual(opening.backdrop)
  await expect(preview).toHaveCSS('opacity', '0')
  await expect(viewer).toHaveCount(0)
  await expect(preview).toHaveCSS('opacity', '1')
})

test('320px paging reaches both strip edges and an offscreen zoomed image returns to the final thumbnail', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const viewer = await openPhoto(page)
  const strip = page.locator('#compact .apple-image__gallery')
  await swipeImage(viewer, 'right')
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('1 / 5')
  for (let i = 0; i < 4; i++) await swipeImage(viewer)
  await expect(viewer.locator('.apple-viewer-count')).toHaveText('5 / 5')
  const position = await strip.evaluate(box => ({ left: box.scrollLeft, end: box.scrollWidth - box.clientWidth }))
  expect(position.left).toBeCloseTo(position.end, 1)
  await viewer.dispatchEvent('wheel', { deltaY: -600, clientX: 160, clientY: 370 })
  await pointer(viewer, 'pointerdown', 1, 160, 370)
  await pointer(viewer, 'pointermove', 1, 160, -800)
  await pointer(viewer, 'pointerup', 1, 160, -800)
  await bounded(viewer)
  const photo = (await viewer.locator('.apple-viewer-image').boundingBox())!
  expect(photo.y).toBeLessThan(0)
  const destination = (await strip.locator('img').last().boundingBox())!
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveAttribute('data-phase', 'closing')
  const frames = await viewer.locator('.apple-viewer-canvas').evaluate(frame => (frame.getAnimations()[0].effect as KeyframeEffect).getKeyframes())
  expect(parseFloat(frames[0].top as string)).toBeCloseTo(photo.y, 0)
  expect(parseFloat(frames.at(-1)!.left as string)).toBeCloseTo(destination.x, 1)
  expect(parseFloat(frames.at(-1)!.top as string)).toBeCloseTo(destination.y, 1)
  await expect(viewer).toHaveCount(0)
})

test('a partly clipped preview opens from its visible position before its strip is centered under black', async ({ page }) => {
  const strip = page.locator('#compact .apple-image__gallery')
  const preview = strip.locator('img').first()
  await expect.poll(() => preview.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await strip.evaluate(box => { (box as HTMLElement).style.scrollSnapType = 'none'; box.scrollLeft = box.clientWidth / 2 })
  const source = (await preview.boundingBox())!
  expect(source.x).toBeLessThan(0)
  await page.mouse.click(source.x + 280, source.y + 120)
  const viewer = page.getByRole('dialog', { name: '图片预览', exact: true })
  await expect(viewer).toHaveAttribute('data-phase', 'opening')
  const start = await viewer.locator('.apple-viewer-canvas').evaluate(frame => (frame.getAnimations()[0].effect as KeyframeEffect).getKeyframes()[0])
  expect(parseFloat(start.left as string)).toBeCloseTo(source.x, 1)
  expect(start.clipPath).toContain('171px')
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  await expect.poll(() => strip.evaluate(box => box.scrollLeft)).toBe(0)
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(viewer).toHaveCount(0)
  await expect(preview).toHaveCSS('opacity', '1')
})

test('cancelled pinches, orientation changes, reduced motion and unmount clean up without releasing a live layer', async ({ page }) => {
  const viewer = await openPhoto(page)
  await pointer(viewer, 'pointerdown', 1, 120, 400)
  await pointer(viewer, 'pointerdown', 2, 240, 400)
  await pointer(viewer, 'pointermove', 2, 140, 400)
  await pointer(viewer, 'pointercancel', 2, 140, 400)
  await pointer(viewer, 'pointerup', 1, 120, 400)
  await bounded(viewer)
  await expect(viewer).toHaveAttribute('data-scale', '1')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(viewer).toHaveClass(/--mobile/)
  await expect.poll(async () => { const image = (await viewer.locator('.apple-viewer-image').boundingBox())!; return image.x + image.width / 2 }).toBeCloseTo(422, 1)
  await bounded(viewer)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(viewer).toHaveAttribute('data-apple-motion', 'reduced')
  await page.keyboard.press('Escape')
  await expect(viewer).toHaveCount(0)
  await expect(page.locator('.apple-image__trigger--placeholder')).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('#none').click()
  const instant = await openPhoto(page)
  await page.keyboard.press('Escape')
  await expect(instant).toHaveCount(0)
  const again = await openPhoto(page)
  await page.locator('#remove').dispatchEvent('click')
  await expect(again).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('WebKit phone follows the same pinch, paging, placeholder and dismissal path', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: '' })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${baseURL}/tests/e2e/fixtures/mobile-images.html`)
    const viewer = await openPhoto(page)
    await expectGlass(viewer)
    await swipeImage(viewer)
    for (const scale of ['2', '1']) {
      await page.touchscreen.tap(140, 300)
      await page.waitForTimeout(60)
      await page.touchscreen.tap(140, 300)
      await bounded(viewer)
      await expect(viewer).toHaveAttribute('data-scale', scale)
      await page.waitForTimeout(350)
      await expect(viewer).toHaveAttribute('data-phase', 'open')
    }
    await pointer(viewer, 'pointerdown', 1, 120, 400)
    await pointer(viewer, 'pointerdown', 2, 240, 400)
    await pointer(viewer, 'pointermove', 1, 20, 420)
    await pointer(viewer, 'pointermove', 2, 370, 450)
    await pointer(viewer, 'pointerup', 2, 370, 450)
    await pointer(viewer, 'pointerup', 1, 20, 420)
    await bounded(viewer)
    await viewer.locator('.apple-viewer-stage').click({ position: { x: 195, y: 422 } })
    await expect(viewer).toHaveCount(0)
    await expect(page.locator('#compact .apple-image__trigger img').nth(1)).toHaveCSS('opacity', '1')
    expect(errors).toEqual([])
  } finally { await browser.close() }
})

import { expect, test, webkit } from '@playwright/test'

test('home player runs silently, seeks, pauses and advances to the next track', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', {
      get() { throw new Error('The silent player accessed Web Audio') },
    })
  })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const player = page.locator('.mini-player')
  const progress = player.getByRole('slider', { name: '播放进度' })
  const title = player.getByRole('heading', { name: '海岸来信' })
  await expect(title).toBeVisible()
  await page.clock.install()
  await player.getByRole('button', { name: '播放', exact: true }).press('Space')
  await page.clock.fastForward(2100)
  await expect(progress).not.toHaveValue('42')
  await player.getByRole('button', { name: '暂停' }).click()
  const pausedAt = await progress.inputValue()
  await page.clock.fastForward(2000)
  await expect(progress).toHaveValue(pausedAt)
  await player.getByRole('button', { name: '喜欢', exact: true }).click()
  await expect(player.getByRole('button', { name: '取消喜欢' })).toHaveAttribute('aria-pressed', 'true')
  await player.getByRole('button', { name: '上一首' }).click()
  await expect(player.getByRole('heading', { name: '晴日慢调' })).toBeVisible()
  await player.getByRole('button', { name: '下一首' }).click()
  await expect(title).toBeVisible()
  await player.getByRole('button', { name: '播放', exact: true }).click()
  await progress.fill('167')
  await page.clock.fastForward(1500)
  await expect(player.getByRole('heading', { name: '山间回声' })).toBeVisible()
  await expect(progress).toHaveValue('0')
  await expect(player.getByRole('button', { name: '暂停' })).toBeVisible()
  expect(errors).toEqual([])
})

test('home appearance controls update and persist the shared settings', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('.appearance-specimen')
  const theme = card.getByRole('radiogroup', { name: '主题', exact: true })
  const ripple = card.getByRole('switch', { name: '点击波纹' })
  const rippleTest = card.getByRole('button', { name: '测试点击波纹' })
  await theme.getByText('深色', { exact: true }).click()
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-theme', 'dark')
  await ripple.uncheck()
  await rippleTest.click()
  await expect(rippleTest.locator('.v-ripple__animation')).toHaveCount(0)
  await ripple.check()
  await rippleTest.hover()
  await page.mouse.down()
  await expect(rippleTest.locator('.v-ripple__animation')).toHaveCount(1)
  await page.mouse.up()
  await card.getByRole('slider', { name: '玻璃模糊' }).fill('18')
  await card.getByRole('slider', { name: '不透明度' }).fill('65')
  await expect(card.locator('.glass-panel')).toHaveCSS('backdrop-filter', 'blur(18px) saturate(1.4)')
  await expect(page).toHaveURL(/\/$/)
  await page.reload()
  await expect(theme.getByRole('radio', { name: '深色' })).toBeChecked()
  await expect(ripple).toBeChecked()
  await expect(card.getByRole('slider', { name: '玻璃模糊' })).toHaveValue('18')
  await expect(card.getByRole('slider', { name: '不透明度' })).toHaveValue('65')
  await page.goto('/settings')
  await expect(page.getByRole('button', { name: '深色', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('slider', { name: '玻璃模糊' })).toHaveValue('18')
})

test('container preview resizes and copies the currently displayed example', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { (window as any).__copied = value } } })
  })
  await page.goto('/')
  const card = page.locator('.editor-specimen')
  const preview = card.locator('.container-preview')
  const before = (await preview.boundingBox())!.width
  await card.getByRole('slider', { name: '容器宽度' }).fill('40')
  expect((await preview.boundingBox())!.width).toBeLessThan(before * .7)
  await card.getByRole('button', { name: '复制示例代码' }).click()
  expect(await page.evaluate(() => (window as any).__copied)).toBe('<apple-container width="40%">\n  内容\n</apple-container>')
})

for (const width of [320, 1440]) {
  test(`home comparison opens an enlarged dialog and preserves position at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const showcase = page.locator('.showcase-specimen')
    const comparison = showcase.locator('.apple-image-compare')
    const handle = comparison.getByRole('slider')
    const expand = showcase.getByRole('button', { name: '放大图片对比' })
    await comparison.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())))
    await expect(comparison.locator('.apple-image-compare__label:visible')).toHaveCount(0)
    await expect(showcase.locator('.comparison-footer')).toContainText('Material UI')
    await expect(showcase.locator('.comparison-footer')).toContainText('Apptify')
    await handle.press('Home')
    await handle.press('PageUp')
    await handle.press('PageUp')
    await handle.press('PageUp')
    const inlineWidth = (await comparison.locator('.apple-image-compare__surface').boundingBox())!.width
    await showcase.screenshot({ path: `/tmp/apptify-compare-footer-${width}.png` })
    await expand.click()
    const dialog = page.getByRole('dialog', { name: 'Clash Verge Rev Fork', exact: true })
    await expect(dialog).toBeVisible()
    const enlarged = dialog.getByRole('slider', { name: 'Clash Verge 界面对比' })
    await expect(enlarged).toHaveAttribute('aria-valuenow', '30')
    const enlargedWidth = (await dialog.locator('.apple-image-compare__surface').boundingBox())!.width
    expect(enlargedWidth).toBeGreaterThan(inlineWidth * 1.3)
    const bounds = (await dialog.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
    await dialog.screenshot({ path: `/tmp/apptify-compare-dialog-${width}.png` })
    await enlarged.press('End')
    await expect(enlarged).toHaveAttribute('aria-valuenow', '100')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(handle).toHaveAttribute('aria-valuenow', '100')
    await expect(expand).toBeFocused()
    await expand.click()
    await expect(enlarged).toHaveAttribute('aria-valuenow', '100')
    await dialog.getByRole('button', { name: '关闭', exact: true }).click()
    await expect(dialog).toBeHidden()
  })
}

test('comparison drags across the whole image, supports keyboard and keeps both images aligned', async ({ page }) => {
  await page.goto('/')
  const comparison = page.locator('.showcase-carousel .apple-image-compare')
  const handle = comparison.getByRole('slider')
  await comparison.scrollIntoViewIfNeeded()
  const bounds = (await comparison.boundingBox())!
  const box = (await comparison.locator('.apple-image-compare__surface').boundingBox())!
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * .8, box.y + box.height * .5, { steps: 5 })
  await page.mouse.up()
  await expect(handle).toHaveAttribute('aria-valuenow', '80')
  const rects = await comparison.locator('img').evaluateAll(images => images.map(image => image.getBoundingClientRect().toJSON()))
  expect(rects[0]).toEqual(rects[1])
  const divider = comparison.locator('.apple-image-compare__divider')
  for (const [key, value] of [['Home', '0'], ['ArrowRight', '1'], ['End', '100'], ['ArrowLeft', '99']]) {
    await handle.press(key)
    await expect(handle).toHaveAttribute('aria-valuenow', value)
    const thumb = (await handle.boundingBox())!
    const line = (await divider.boundingBox())!
    expect(thumb.x + thumb.width / 2).toBeCloseTo(line.x + line.width / 2, 1)
    expect(thumb.x).toBeGreaterThanOrEqual(bounds.x)
    expect(thumb.x + thumb.width).toBeLessThanOrEqual(bounds.x + bounds.width)
  }
  await expect(divider).toHaveCSS('background-color', 'rgb(0, 122, 255)')
})

test('comparison keeps its last position after capture loss and a fast subsequent drag', async ({ page }) => {
  await page.goto('/')
  const comparison = page.locator('.showcase-carousel .apple-image-compare')
  await comparison.scrollIntoViewIfNeeded()
  await comparison.evaluate(el => el.addEventListener('pointerdown', event => { (el as HTMLElement).dataset.pointerId = String((event as PointerEvent).pointerId) }, { once: true }))
  const surface = comparison.locator('.apple-image-compare__surface')
  const box = (await surface.boundingBox())!
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width * .5, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * .8, y)
  await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '80')
  await surface.evaluate(el => el.releasePointerCapture(Number((el.closest('.apple-image-compare') as HTMLElement).dataset.pointerId)))
  await page.mouse.move(box.x + box.width * .8, y + 1)
  await page.mouse.up()
  await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '80')
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * .1, y)
  await page.mouse.up()
  await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '10')
})

test('single-project comparison passes horizontal trackpad scrolling through', async ({ page }) => {
  await page.goto('/')
  const carousel = page.locator('.showcase-carousel')
  const handle = carousel.getByRole('slider')
  await expect(carousel.locator('.apple-image__gallery')).toHaveCSS('overscroll-behavior-x', 'auto')
  const uncancelled = await handle.evaluate(element => [-80, 80].map(deltaX =>
    element.dispatchEvent(new WheelEvent('wheel', { deltaX, bubbles: true, cancelable: true })),
  ))
  expect(uncancelled).toEqual([true, true])
  await expect(handle).toHaveAttribute('aria-valuenow', '50')
})

test('comparison handles real touch dragging without horizontal page overflow', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  try {
    await page.goto(test.info().project.use.baseURL!)
    const comparison = page.locator('.showcase-carousel .apple-image-compare')
    await comparison.scrollIntoViewIfNeeded()
    const box = (await comparison.locator('.apple-image-compare__surface').boundingBox())!
    const client = await context.newCDPSession(page)
    const point = (fraction: number) => [{ x: box.x + box.width * fraction, y: box.y + box.height / 2 }]
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(.5) })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(.7) })
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '70')
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(.7) })
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(.2) })
    await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '20')
    await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
    await expect(comparison.getByRole('slider')).toHaveAttribute('aria-valuenow', '20')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await context.close() }
})

test('WebKit displays the new home controls and comparison on mobile', async ({ baseURL }) => {
  const browser = await webkit.launch({ channel: undefined })
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' })
    await page.goto(baseURL!)
    const handle = page.locator('.showcase-carousel').getByRole('slider')
    await handle.focus()
    await handle.press('ArrowRight')
    await expect(handle).toHaveAttribute('aria-valuenow', '51')
    await expect(page.locator('.mini-player')).toBeVisible()
    await expect(page.getByRole('slider', { name: '容器宽度' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await browser.close() }
})

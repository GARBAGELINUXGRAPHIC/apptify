import { createRequire } from 'node:module'
import { expect, test, type Locator, type Page } from '@playwright/test'

const require = createRequire(import.meta.url)
const { PNG } = require('playwright-core/lib/utilsBundle')
type Box = { x: number; y: number; width: number; height: number }
type Shape = Box & { radii: number[][] }

async function shapeOf(locator: Locator): Promise<Shape> {
  return locator.evaluate(element => {
    const box = element.getBoundingClientRect(), style = getComputedStyle(element)
    const radii = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(key => {
      const values = style[key as keyof CSSStyleDeclaration].toString().split(' ')
      return [values[0]!, values[1] ?? values[0]!].map((value, index) => parseFloat(value) * (value.endsWith('%') ? (index ? box.height : box.width) / 100 : 1))
    })
    const scale = Math.min(1, box.width / (radii[0]![0]! + radii[1]![0]!), box.width / (radii[3]![0]! + radii[2]![0]!), box.height / (radii[0]![1]! + radii[3]![1]!), box.height / (radii[1]![1]! + radii[2]![1]!))
    return { x: box.x, y: box.y, width: box.width, height: box.height, radii: radii.map(pair => pair.map(value => value * scale)) }
  })
}

function outside(shape: Shape, x: number, y: number) {
  x -= shape.x; y -= shape.y
  if (x < -1 || y < -1 || x > shape.width + 1 || y > shape.height + 1) return true
  const positions = [[0, 0], [shape.width, 0], [shape.width, shape.height], [0, shape.height]]
  return shape.radii.some(([rx, ry], index) => {
    if (rx! < 2 || ry! < 2) return false
    const dx = Math.abs(x - positions[index]![0]!), dy = Math.abs(y - positions[index]![1]!)
    // Stay clear of the anti-aliased curved edge. Any feedback in this area is
    // outside the host, not a platform-dependent rounding pixel.
    return dx < rx! && dy < ry! && ((dx - rx!) / rx!) ** 2 + ((dy - ry!) / ry!) ** 2 > 1.3
  })
}

function pixelDiff(before: Buffer, after: Buffer, clip: Box, shape: Shape) {
  const a = PNG.sync.read(before), b = PNG.sync.read(after)
  expect([b.width, b.height]).toEqual([a.width, a.height])
  const scale = a.width / clip.width
  let changed = 0, escaped = 0, checked = 0
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const index = (y * a.width + x) * 4
    const difference = Math.max(...[0, 1, 2].map(c => Math.abs(a.data[index + c] - b.data[index + c])))
    const excluded = outside(shape, clip.x + (x + .5) / scale, clip.y + (y + .5) / scale)
    if (excluded) checked++
    if (difference > 2) { changed++; if (excluded) escaped++ }
  }
  return { changed, escaped, checked }
}

async function frameClip(locator: Locator): Promise<Box> {
  const box = (await locator.boundingBox())!
  return { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.x + box.width) - Math.floor(box.x), height: Math.ceil(box.y + box.height) - Math.floor(box.y) }
}

async function checkWave(page: Page, control: Locator, label: string) {
  await control.hover()
  await page.waitForTimeout(160)
  await page.mouse.down()
  const wave = control.locator(':scope > .v-ripple__container > .v-ripple__animation')
  await expect(wave, label).toHaveCount(1)
  await expect(wave).toHaveClass(/--in/)
  // Freeze ancestor focus/background transitions too, so the PNG comparison
  // isolates only the ripple instead of a simultaneously interpolating ring.
  await page.evaluate(() => document.getAnimations().forEach(animation => animation.pause()))
  const shape = await shapeOf(control), clip = await frameClip(control)
  const container = control.locator(':scope > .v-ripple__container')
  await expect(container).toHaveCSS('border-radius', await control.evaluate(element => getComputedStyle(element).borderRadius))
  await expect(container).toHaveCSS('z-index', '-1')
  await expect(container).toHaveCSS('pointer-events', 'none')
  await expect(wave).toHaveCSS('background-color', 'rgb(128, 128, 128)')
  for (const time of [70, 230]) {
    await wave.evaluate((element, time) => element.getAnimations().forEach(animation => { animation.currentTime = time }), time)
    const visible = await page.screenshot({ clip, animations: 'allow' })
    await container.evaluate(element => (element as HTMLElement).style.visibility = 'hidden')
    const hidden = await page.screenshot({ clip, animations: 'allow' })
    const diff = pixelDiff(hidden, visible, clip, shape)
    expect(diff.changed, `${label} has a visible wave at ${time}ms`).toBeGreaterThan(0)
    expect(diff.escaped, `${label} stays within the rounded host at ${time}ms`).toBe(0)
    if (label === '#layering') {
      // A saturated, opaque foreground swatch must not be recolored by feedback.
      const a = PNG.sync.read(hidden), b = PNG.sync.read(visible)
      let solidPixels = 0
      for (let i = 0; i < a.data.length; i += 4) if ((a.data[i] === 239 && a.data[i + 1] === 35 && a.data[i + 2] === 18) || (a.data[i] === 23 && a.data[i + 1] === 207 && a.data[i + 2] === 40)) {
        solidPixels++; expect([...b.data.subarray(i, i + 3)]).toEqual([...a.data.subarray(i, i + 3)])
      }
      expect(solidPixels).toBeGreaterThan(100)
    }
    await container.evaluate(element => (element as HTMLElement).style.visibility = '')
  }
  await page.evaluate(() => document.getAnimations().forEach(animation => animation.play()))
  // Releasing outside avoids activating buttons whose content/selection changes.
  await page.mouse.move(0, 0); await page.mouse.up()
  await expect(container).toHaveCount(0)
}

for (const theme of ['light', 'dark']) for (const width of [390, 1440]) {
  test(`all shared callers clip neutral feedback at ${theme} ${width}`, async ({ page }) => {
    test.setTimeout(90000)
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(`/tests/e2e/fixtures/ripple-clipping.html?theme=${theme}`)
    for (const selector of ['#pill', '#layering', '#suffix .apple-button', '#prefix .apple-button', '#stepper button:first-child', '#stepper button:last-child', '#steps .apple-steps__number', '#pagination button[aria-label="第 1 页"]', '#accordion > section:last-child h3 button', '#list li:last-child .apple-list__item', '#tree .apple-tree__row', '#table .apple-table__sort', '#teleported']) {
      await checkWave(page, page.locator(selector).first(), selector)
    }
    // Native hover geometry must also reach the rounded group edges.
    await expect(page.locator('#accordion > section:last-child h3 button')).toHaveCSS('border-radius', '0px 0px 18px 18px')
    await expect(page.locator('#list li:last-child .apple-list__item')).toHaveCSS('border-radius', '0px 0px 18px 18px')
    for (const id of ['prefix', 'suffix']) {
      // Joined controls own their corners; the wrapper must leave room for the
      // button's keyboard outline instead of clipping it to hide effect leaks.
      await expect(page.locator(`#${id} .apple-input-wrap`)).toHaveCSS('overflow', 'visible')
    }
    await page.locator('#accordion > section:last-child h3 button').click()
    await expect(page.locator('#accordion > section:last-child h3 button')).toHaveCSS('border-radius', '0px')
    await expect(page.locator('#disabled')).toHaveCSS('opacity', '0.45')
    await page.locator('#ghost').hover(); await page.mouse.down()
    await expect(page.locator('#ghost .v-ripple__container')).toHaveCount(0)
    await page.mouse.up()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })

  test(`actual rounded card footer stays inside its border on hover and press at ${theme} ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.addInitScript(theme => localStorage.setItem('apptify:preferences', JSON.stringify({ theme, motion: 'full' })), theme)
    await page.goto('/components#apple-input')
    const card = page.locator('#apple-input'), trigger = card.locator('.component-source h3 button')
    await trigger.scrollIntoViewIfNeeded(); await page.waitForTimeout(600)
    await page.mouse.move(0, 0)
    const shape = await shapeOf(card), clip = await frameClip(card)
    const idle = await page.screenshot({ clip })
    await trigger.hover(); await page.waitForTimeout(160)
    const hovered = await page.screenshot({ clip })
    const hoverDiff = pixelDiff(idle, hovered, clip, shape)
    expect(hoverDiff.changed).toBeGreaterThan(0); expect(hoverDiff.checked).toBeGreaterThan(20); expect(hoverDiff.escaped).toBe(0)
    await page.mouse.down(); await page.waitForTimeout(140)
    const pressed = await page.screenshot({ clip, path: testInfo.outputPath(`card-${theme}-${width}-midframe.png`) })
    expect(pixelDiff(idle, pressed, clip, shape).escaped).toBe(0)
    await expect(trigger).toHaveCSS('overflow', 'visible')
    await expect(card).toHaveCSS('overflow', 'visible')
    await page.mouse.move(0, 0); await page.mouse.up()
    await trigger.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab')
    expect(await trigger.evaluate(element => getComputedStyle(element).outlineStyle)).toBe('solid')
  })
}

test('nested controls, rapid presses, pointer cancellation and live motion changes leave no waves', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/ripple-clipping.html')
  const parent = page.locator('#nested'), child = page.locator('#nested-child'), probe = page.locator('#layering')
  await child.hover(); await page.mouse.down()
  await expect(child.locator(':scope > .v-ripple__container')).toHaveCount(1)
  await expect(parent.locator(':scope > .v-ripple__container')).toHaveCount(0)
  await page.mouse.move(0, 0); await page.mouse.up()
  await expect(child.locator('.v-ripple__container')).toHaveCount(0)
  await probe.scrollIntoViewIfNeeded()
  const before = await probe.boundingBox()
  for (let i = 0; i < 8; i++) await probe.click()
  await page.mouse.move(0, 0)
  await expect(probe.locator('.v-ripple__container')).toHaveCount(0)
  expect(await probe.boundingBox()).toEqual(before)
  await expect(page.locator('#commits')).toHaveText('8')
  await probe.hover(); await page.mouse.down(); await probe.dispatchEvent('pointercancel')
  await expect(probe.locator('.v-ripple__container')).toHaveCount(0); await page.mouse.up()
  await probe.focus(); await page.keyboard.down('Space')
  await expect(probe.locator('.v-ripple__container')).toHaveCount(1)
  await page.locator('#none').evaluate(element => (element as HTMLElement).click())
  await expect(probe.locator('.v-ripple__container')).toHaveCount(0)
  await page.keyboard.up('Space')
  await page.locator('#full').evaluate(element => (element as HTMLElement).click())
  await probe.focus(); await page.keyboard.down('Space')
  await expect(probe.locator('.v-ripple__container')).toHaveCount(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(probe.locator('.v-ripple__container')).toHaveCount(0)
  await page.keyboard.up('Space')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await probe.hover(); await page.mouse.down()
  await page.locator('#unmount-probe').evaluate(element => (element as HTMLElement).click())
  await page.mouse.up(); await expect(probe).toHaveCount(0)
  await expect(page.locator('.v-ripple__container')).toHaveCount(0)
})

test('menu, select and calendar effects remain bounded in floating layers', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/ripple-clipping.html?theme=dark')
  await page.locator('#menu-trigger').click()
  const menu = page.getByRole('menu', { name: '浮层菜单' })
  await expect(menu).toBeVisible()
  await checkWave(page, menu.getByRole('menuitem').first(), 'menuitem')
  await page.keyboard.press('Escape')
  await page.getByRole('combobox', { name: '选择项目' }).click()
  await checkWave(page, page.getByRole('option').first(), 'select option')
  await page.getByRole('combobox', { name: '选择项目' }).focus()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: '打开日历' }).click()
  await expect.poll(() => page.locator('.apple-date-menu').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0)
  await checkWave(page, page.locator('.apple-calendar__day:not(:disabled)').first(), 'calendar day')
})

test('touch scroll/cancel and high-density circle clipping', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  try {
    await page.goto('http://127.0.0.1:' + (process.env.APPTIFY_TEST_PORT || '5173') + '/tests/e2e/fixtures/ripple-clipping.html?theme=dark')
    const probe = page.locator('#layering'); await probe.scrollIntoViewIfNeeded()
    const box = (await probe.boundingBox())!, x = box.x + box.width / 2, y = box.y + box.height / 2
    const session = await context.newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
    await page.waitForTimeout(120); await expect(probe.locator('.v-ripple__container')).toHaveCount(0)
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 40 }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(probe.locator('.v-ripple__container')).toHaveCount(0)
    await checkWave(page, page.locator('#steps .apple-steps__number').first(), 'retina circle')
  } finally { await context.close() }
})

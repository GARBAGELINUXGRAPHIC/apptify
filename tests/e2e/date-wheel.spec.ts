import { expect, test, type Page } from '@playwright/test'

async function open(page: Page, query = '') {
  await page.goto(`/tests/e2e/fixtures/date-wheel.html?${query}`)
  await page.locator('.apple-date-input button').click()
  await expect(page.locator('.apple-date-menu')).toBeVisible()
}
async function time(page: Page) {
  const tab = page.getByRole('tab', { name: '时间', exact: true })
  if (await tab.count()) await tab.click()
  await expect(page.getByRole('listbox', { name: '时', exact: true })).toBeVisible()
  await expect.poll(() => page.locator('.apple-date-menu').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0)
}
async function centers(page: Page) {
  return page.locator('.apple-calendar__time-column').evaluateAll(columns => columns.map(column => {
    const wheel = column.querySelector<HTMLElement>('[role=listbox]')!, selected = wheel.querySelector<HTMLElement>('[aria-selected=true]')!
    const viewport = wheel.getBoundingClientRect(), row = selected.getBoundingClientRect(), part = column.getAttribute('data-time-part')!
    return { part, value: Number(selected.textContent), index: Number(wheel.dataset.centerIndex), centerError: row.y + row.height / 2 - viewport.y - viewport.height / 2, scrollTop: wheel.scrollTop, count: wheel.querySelectorAll('[role=option]').length, external: Number(document.querySelector<HTMLInputElement>(`.apple-date-segment[data-part=${part}]`)!.value), scrollbar: getComputedStyle(wheel).scrollbarWidth, border: getComputedStyle(wheel).borderWidth }
  }))
}
async function expectCentered(page: Page) {
  await expect.poll(async () => (await centers(page)).every(row => Math.abs(row.centerError) < .75 && row.value === row.external)).toBe(true)
}

for (const theme of ['light', 'dark']) for (const width of [320, 390, 1440]) {
  test(`${theme} date and cyclic time geometry at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 })
    await open(page, `theme=${theme}&motion=none`)
    const geometry = await page.locator('.apple-calendar__tabs').evaluate(el => {
      const style = getComputedStyle(el), box = el.getBoundingClientRect(), menu = el.closest('.apple-date-menu')!.getBoundingClientRect()
      return { margin: style.margin, inset: box.x - menu.x, width: box.width, menuWidth: menu.width, right: menu.right, x: menu.x }
    })
    expect(geometry.margin).toBe('0px'); expect(geometry.inset).toBe(1)
    expect(geometry.width).toBe(geometry.menuWidth - 2)
    expect(geometry.x).toBeGreaterThanOrEqual(0); expect(geometry.right).toBeLessThanOrEqual(width)
    const selected = page.locator('.apple-calendar__day.is-selected')
    await expect(selected).toHaveAttribute('data-date', '2026-10-03')
    const selection = await selected.evaluate(el => { const s = getComputedStyle(el); return { background: s.backgroundColor, primary: s.getPropertyValue('--apple-accent').trim(), decoration: s.textDecorationLine, dot: getComputedStyle(el, '::after').content } })
    expect(selection.background).toBe('rgb(0, 113, 227)')
    expect(selection.decoration).toBe('none'); expect(selection.dot).toBe('none')
    expect(await page.locator('.apple-calendar__tabs .apple-selection-indicator').evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(selection.background)
    await page.screenshot({ path: info.outputPath('date.png') })
    await time(page)
    await expect(page.locator('.apple-calendar__time input')).toHaveCount(0)
    await expectCentered(page)
    const rows = await centers(page)
    for (const row of rows) { expect(row.index).toBeGreaterThanOrEqual(420); expect(row.index).toBeLessThanOrEqual(480); expect(row.count).toBeLessThan(25); expect(row.scrollbar).toBe('none'); expect(row.border).toBe('0px') }
    const band = await page.locator('.apple-calendar__time-wheels').evaluate(el => getComputedStyle(el, '::before').backgroundColor)
    expect(band).toBe(theme === 'light' ? 'rgb(240, 240, 242)' : 'rgb(43, 43, 46)')
    await expect(page.locator('#value')).toHaveText('2026-10-03T12:30:15')
    await expect(page.locator('#updates')).toHaveText('[]')
    await page.screenshot({ path: info.outputPath('time.png') })
  })
}

test('wheel crosses cycles and recenters near track edges without changing the visible value', async ({ page }) => {
  await open(page, 'motion=none&format=HH:mm:ss&value=23:59:07')
  await time(page)
  const hour = page.getByRole('listbox', { name: '时', exact: true })
  await hour.hover(); await page.mouse.wheel(0, 80)
  await expect(hour).toHaveAttribute('data-center-value', '1')
  await expectCentered(page)
  const minute = page.getByRole('listbox', { name: '分', exact: true })
  await minute.hover(); await page.mouse.wheel(0, 7280)
  await expect(minute).toHaveAttribute('data-center-value', '1')
  await expectCentered(page)
  await minute.hover(); await page.mouse.wheel(0, -22000)
  await expect.poll(async () => { const index = Number(await minute.getAttribute('data-center-index')); return index >= 420 && index <= 480 }).toBe(true)
  await expectCentered(page)
  expect(Number(await minute.getAttribute('data-center-index'))).toBeLessThanOrEqual(480)
})

for (const motion of ['none', 'reduced', 'full']) {
  test(`${motion} click centers the chosen row and keyboard selection stays synchronized`, async ({ page }, info) => {
    await open(page, `motion=${motion}`); await time(page)
    const samples = await page.getByRole('listbox', { name: '分', exact: true }).evaluate(async el => {
      const wheel = el as HTMLElement, index = Number(wheel.dataset.centerIndex), samples: { t: number; position: number; value: number; model: string }[] = []
      const start = performance.now()
      ;(wheel.querySelector(`[data-time-index="${index + 2}"]`) as HTMLElement).click()
      await new Promise<void>(resolve => {
        function sample() { samples.push({ t: performance.now() - start, position: wheel.scrollTop, value: Number(wheel.dataset.centerValue), model: document.querySelector('#value')!.textContent! }); if (performance.now() - start < 400) requestAnimationFrame(sample); else resolve() }
        requestAnimationFrame(sample)
      })
      return samples
    })
    await info.attach('click-frames', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' })
    await expectCentered(page)
    await expect(page.locator('#value')).toHaveText('2026-10-03T12:32:15')
    expect(samples.every(sample => Number(sample.model.split(':')[1]) === sample.value)).toBe(true)
    if (motion === 'none') expect(new Set(samples.map(sample => sample.position)).size).toBe(1)
    else expect(new Set(samples.map(sample => sample.position)).size).toBeGreaterThan(1)
    const minute = page.getByRole('listbox', { name: '分', exact: true })
    await minute.focus(); await minute.press('End'); await expectCentered(page)
    await expect(minute).toHaveAttribute('data-center-value', '59')
    await minute.press('ArrowDown'); await expectCentered(page)
    await expect(minute).toHaveAttribute('data-center-value', '0')
    await minute.press('Escape'); await expect(page.locator('.apple-date-menu')).toHaveCount(0)
    await expect(page.locator('.apple-date-segment[data-part=minute]')).toBeFocused()
  })
}

test('datetime bounds constrain scroll selection and disabled/loading close the picker', async ({ page }) => {
  await open(page, 'motion=none&value=2026-10-03T12:30:15&min=2026-10-03T10:45:00&max=2026-10-03T14:15:00')
  await expect(page.locator('[data-date="2026-10-02"]')).toBeDisabled()
  await time(page)
  const hour = page.getByRole('listbox', { name: '时', exact: true })
  await expect(hour.locator('[data-time-value="9"]')).toHaveAttribute('aria-disabled', 'true')
  await hour.locator('[data-time-value="10"]').click()
  await expect(page.locator('#value')).toHaveText('2026-10-03T10:45:00')
  await expectCentered(page)
  await page.evaluate(() => { (window as any).dateWheelDemo.disabled = true })
  await expect(page.locator('.apple-date-menu')).toHaveCount(0)
  await expect(page.locator('.apple-date-input button')).toBeDisabled()
  await page.evaluate(() => { (window as any).dateWheelDemo.disabled = false })
  await page.locator('.apple-date-input button').click(); await time(page)
  await page.evaluate(() => { (window as any).dateWheelDemo.loading = true })
  await expect(page.locator('.apple-date-menu')).toHaveCount(0)
})

test('Now reads the current clock, while opening and clearing preserve user intent', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-03T10:20:30') })
  await open(page, 'motion=none')
  await expect(page.locator('#value')).toHaveText('2026-10-03T12:30:15')
  await page.clock.setSystemTime(new Date('2026-10-03T11:22:33'))
  await page.getByRole('button', { name: '现在', exact: true }).click()
  await expect(page.locator('#value')).toHaveText('2026-10-03T11:22:33')
  await time(page); await expectCentered(page)
  await page.getByRole('button', { name: '清除', exact: true }).click()
  await expect(page.locator('#value')).toHaveText('')
  await page.clock.runFor(500)
  await expect(page.locator('#value')).toHaveText('')
})

test('Now and Clear cancel a pending scroll target even when the central value has not changed yet', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-03T12:30:15'))
  await open(page); await time(page)
  for (const action of ['现在', '清除']) {
    await page.getByRole('listbox', { name: '分', exact: true }).evaluate((el, action) => {
      const index = Number((el as HTMLElement).dataset.centerIndex)
      ;(el.querySelector(`[data-time-index="${index + 2}"]`) as HTMLElement).click()
      ;([...document.querySelectorAll<HTMLButtonElement>('.apple-calendar__text')].find(button => button.textContent === action)!).click()
    }, action)
    await page.waitForTimeout(420)
    await expect(page.locator('#value')).toHaveText(action === '现在' ? '2026-10-03T12:30:15' : '')
    if (action === '现在') await expectCentered(page)
  }
})

test('switching tabs during a time scroll retains the last visible model when the wheel is recreated', async ({ page }) => {
  await open(page); await time(page)
  await page.getByRole('listbox', { name: '分', exact: true }).evaluate(el => {
    const index = Number((el as HTMLElement).dataset.centerIndex)
    ;(el.querySelector(`[data-time-index="${index + 2}"]`) as HTMLElement).click()
  })
  await page.waitForTimeout(65)
  await page.getByRole('tab', { name: '日期', exact: true }).click()
  const value = await page.locator('#value').textContent()
  await page.waitForTimeout(350)
  await expect(page.locator('#value')).toHaveText(value!)
  await time(page); await expectCentered(page)
  await expect(page.locator('#value')).toHaveText(value!)
})

test('native touch scrolling settles the central value without horizontal page overflow', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 900 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const page = await context.newPage()
  try {
    await page.goto('/tests/e2e/fixtures/date-wheel.html?motion=none')
    await page.locator('.apple-date-input button').tap(); await time(page)
    const minute = page.getByRole('listbox', { name: '分', exact: true }), bounds = (await minute.boundingBox())!
    const client = await context.newCDPSession(page), x = bounds.x + bounds.width / 2, y = bounds.y + bounds.height / 2 + 50
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let step = 1; step <= 8; step++) { await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 15 }] }); await page.waitForTimeout(20) }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(minute).not.toHaveAttribute('data-center-value', '30')
    await expectCentered(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await context.close() }
})

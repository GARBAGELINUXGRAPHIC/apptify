import { expect, test, type Page } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

async function open(page: Page, query = '') {
  await page.goto(`/tests/e2e/fixtures/date-tabs.html${query}`)
  await page.getByRole('button', { name: '打开日历' }).click()
  await expect(page.getByRole('tab', { name: '日期', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.waitForTimeout(320)
}

async function frames(page: Page, reverse = false) {
  return page.evaluate(async reverse => {
    const host = document.querySelector('.apple-calendar__tabs')!
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role=tab]')
    const samples: { t: number; x: number; indicatorWidth: number; height: number; menuWidth: number; menuHeight: number; panels: { label: string | null; x: number; width: number; inert: boolean }[] }[] = []
    const start = performance.now()
    tabs[1]!.click()
    let reversed = false
    await new Promise<void>(resolve => {
      function tick() {
        const t = performance.now() - start
        if (reverse && !reversed && t >= 90) { tabs[0]!.click(); reversed = true }
        const indicator = host.querySelector('.apple-selection-indicator')!
        const indicatorBox = indicator.getBoundingClientRect(), menuBox = host.closest('.apple-date-menu')!.getBoundingClientRect()
        samples.push({ t, x: indicatorBox.x, indicatorWidth: indicatorBox.width, height: host.querySelector('.apple-tabs__viewport')!.getBoundingClientRect().height, menuWidth: menuBox.width, menuHeight: menuBox.height, panels: Array.from(host.querySelectorAll<HTMLElement>('[role=tabpanel]')).map(el => ({ label: el.getAttribute('aria-labelledby'), x: new DOMMatrixReadOnly(getComputedStyle(el).transform).m41, width: el.getBoundingClientRect().width, inert: el.hasAttribute('inert') })) })
        if (t < 600) requestAnimationFrame(tick); else resolve()
      }
      requestAnimationFrame(tick)
    })
    return samples
  }, reverse)
}

test('direct date-picker ESM entry initializes without a forms import cycle', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/date-tabs-entry.html')
  await expect(page.locator('#entry')).toHaveText('AppleDatePicker')
})

test('captures the native indicator and both panels during the slide', async ({ page }, testInfo) => {
  await open(page)
  await page.getByRole('tab', { name: '时间', exact: true }).click()
  await page.waitForTimeout(65)
  await page.screenshot({ path: testInfo.outputPath('slide-intermediate.png') })
  await expect(page.locator('.apple-calendar__tabs [role=tabpanel]')).toHaveCount(2)
  await page.waitForTimeout(350)
  await page.getByRole('tab', { name: '时间', exact: true }).press('ArrowLeft')
  await page.waitForTimeout(65)
  await page.screenshot({ path: testInfo.outputPath('return-intermediate.png') })
})

for (const width of [1100, 390]) {
  test(`TabBar panels stay present and size continuously at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await open(page)
    const samples = await frames(page)
    await writeFile(testInfo.outputPath('forward-frames.json'), JSON.stringify(samples, null, 2))
    expect(samples.every(frame => frame.panels.some(panel => !panel.inert))).toBe(true)
    expect(Math.min(...samples.map(frame => frame.height))).toBeGreaterThan(230)
    expect(samples.some(frame => frame.panels.length === 2)).toBe(true)
    const startX = samples[0]!.x, endX = samples.at(-1)!.x
    expect(endX - startX).toBeGreaterThan(70)
    expect(samples.some(frame => frame.x > startX + 5 && frame.x < endX - 5)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('time-panel.png') })
    await expect(page.locator('#value')).toHaveText('2026-09-26T12:30')
    await page.getByRole('tab', { name: '时间', exact: true }).press('ArrowLeft')
    await expect(page.getByRole('tab', { name: '日期', exact: true })).toBeFocused()
    await expect(page.locator('.apple-calendar__day.is-selected')).toHaveAttribute('data-date', '2026-09-26')
  })
}

test('rapid reversal retains current panels and the selected value', async ({ page }, testInfo) => {
  await open(page)
  const samples = await frames(page, true)
  await writeFile(testInfo.outputPath('reversal-frames.json'), JSON.stringify(samples, null, 2))
  expect(samples.every(frame => frame.panels.length > 0)).toBe(true)
  expect(Math.min(...samples.map(frame => frame.height))).toBeGreaterThan(230)
  // Reused panels must reverse from their rendered pose, not restart offscreen.
  for (let i = 1; i < samples.length; i++) {
    for (const panel of samples[i]!.panels) {
      const previous = samples[i - 1]!.panels.find(item => item.label === panel.label)
      if (previous) expect(Math.abs(panel.x - previous.x)).toBeLessThan(panel.width * .25)
    }
  }
  await expect(page.getByRole('tab', { name: '日期', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#value')).toHaveText('2026-09-26T12:30')
})

for (const mode of ['none', 'reduced', 'full']) {
  test(`${mode} follows provider motion and date selection advances the shared tab`, async ({ page }) => {
    await open(page, `?motion=${mode}`)
    await page.locator('[data-date="2026-09-27"]').click()
    await expect(page.getByRole('tab', { name: '时间', exact: true })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.apple-calendar__time')).toBeVisible()
    await expect(page.locator('#value')).toHaveText('2026-09-27T12:30')
    const duration = await page.locator('.apple-tabs__viewport').evaluate(el => getComputedStyle(el).getPropertyValue('--apple-duration').trim())
    const providerDuration = await page.locator('.apple-provider').evaluate(el => getComputedStyle(el).getPropertyValue('--apple-duration').trim())
    expect(duration).toBe(providerDuration)
    if (mode !== 'full') expect(duration).toBe(mode === 'none' ? '0ms' : '80ms')
  })
}

test('system reduced motion shortens the shared slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, '?motion=auto')
  await page.getByRole('tab', { name: '日期', exact: true }).press('End')
  await expect(page.getByRole('tab', { name: '时间', exact: true })).toBeFocused()
  expect(await page.locator('.apple-tabs__viewport').evaluate(el => getComputedStyle(el).getPropertyValue('--apple-duration').trim())).toBe('80ms')
  await page.getByRole('tab', { name: '时间', exact: true }).press('Home')
  await expect(page.getByRole('tab', { name: '日期', exact: true })).toBeFocused()
})

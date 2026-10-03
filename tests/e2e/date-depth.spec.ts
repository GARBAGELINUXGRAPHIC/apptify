import { expect, test, type Page } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { activeCard, openComponent } from './component-navigation'

async function openReal(page: Page, theme = 'light', width = 390) {
  await page.setViewportSize({ width, height: 1100 })
  await page.goto('/settings')
  await page.getByRole('button', { name: theme === 'dark' ? '深色' : '浅色', exact: true }).click()
  await page.getByRole('radiogroup', { name: '全局动效', exact: true }).getByText('完整', { exact: true }).click()
  await openComponent(page, 'apple-date-picker')
  const card = activeCard(page)
  await card.getByRole('combobox').click()
  await page.getByRole('option', { name: '日期与时分秒', exact: true }).click()
  await expect(card.locator('.apple-field-menu')).toHaveCount(0)
  const field = card.locator('.apple-date-field')
  for (const [part, value] of Object.entries({ year: '2026', month: '10', day: '03', hour: '12', minute: '30', second: '15' })) await field.locator(`[data-part=${part}]`).fill(value)
  await field.getByRole('button', { name: '打开日历', exact: true }).click()
  await expect.poll(() => field.locator('.apple-date-menu').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0)
  return field
}

type Action = { at: number; name: 'next' | 'previous' | 'heading' | 'month' | 'year' }
async function recordPages(page: Page, actions: Action[]) {
  return page.locator('.apple-calendar').evaluate(async (calendar, actions) => {
    const samples: { t: number; height: number; width: number; panels: { key: string; x: number; width: number; inert: boolean }[] }[] = []
    const viewport = calendar.querySelector('.apple-calendar__viewport')!
    const start = performance.now()
    let actionIndex = 0
    function sample() {
      samples.push({ t: performance.now() - start, height: viewport.getBoundingClientRect().height, width: viewport.getBoundingClientRect().width, panels: [...calendar.querySelectorAll<HTMLElement>('.apple-calendar__page')].map(el => ({ key: el.dataset.calendarPage!, x: el.getBoundingClientRect().left - viewport.getBoundingClientRect().left, width: el.getBoundingClientRect().width, inert: el.hasAttribute('inert') })) })
    }
    sample()
    await new Promise<void>(resolve => {
      async function tick() {
        const t = performance.now() - start
        while (actionIndex < actions.length && t >= actions[actionIndex]!.at) {
          const name = actions[actionIndex++]!.name
          const selector = name === 'heading' ? '.apple-calendar__heading' : name === 'next' ? '.apple-calendar__header > button:last-child' : name === 'previous' ? '.apple-calendar__header > button:first-child' : '.apple-calendar__page:not([inert]) .apple-calendar__choice'
          const buttons = [...calendar.querySelectorAll<HTMLButtonElement>(selector)]
          const target = name === 'month' ? buttons.find(button => button.textContent === '10月') : name === 'year' ? buttons.find(button => button.textContent === '2026') : buttons[0]
          target!.click()
        }
        await Promise.resolve()
        sample()
        if (t < actions.at(-1)!.at + 500) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })
    return samples
  }, actions)
}

function expectContinuous(samples: Awaited<ReturnType<typeof recordPages>>) {
  for (const frame of samples) {
    expect(frame.panels.some(panel => !panel.inert)).toBe(true)
    expect(frame.height).toBeGreaterThan(190)
    // At least one page covers the middle of the calendar on every frame.
    expect(frame.panels.some(panel => panel.x <= frame.width / 2 + 1 && panel.x + panel.width >= frame.width / 2 - 1)).toBe(true)
  }
  for (let index = 1; index < samples.length; index++) {
    for (const panel of samples[index]!.panels) {
      const previous = samples[index - 1]!.panels.find(item => item.key === panel.key)
      if (previous) expect(Math.abs(panel.x - previous.x)).toBeLessThan(panel.width * .32)
    }
  }
}

for (const theme of ['light', 'dark']) for (const width of [320, 390, 1280]) {
  test(`real ${theme} picker has a compact centered heading and one perspective wheel band at ${width}px`, async ({ page }, info) => {
    const field = await openReal(page, theme, width)
    const heading = await field.locator('.apple-calendar__header').evaluate(el => {
      const buttons = [...el.querySelectorAll('button')], box = el.getBoundingClientRect(), title = buttons[1]!.getBoundingClientRect()
      return { labels: buttons.map(button => button.getAttribute('aria-label') || button.textContent), icons: buttons[1]!.querySelectorAll('svg').length, width: title.width, headerWidth: box.width, centerError: title.x + title.width / 2 - box.x - box.width / 2 }
    })
    expect(heading.labels).toEqual(['上个月', '2026年10月', '下个月'])
    expect(heading.icons).toBe(0); expect(heading.width).toBeLessThan(heading.headerWidth * .65)
    expect(Math.abs(heading.centerError)).toBeLessThan(.75)
    await field.locator('.apple-date-menu').screenshot({ path: info.outputPath('date.png') })
    await field.getByRole('tab', { name: '时间', exact: true }).click()
    await expect.poll(() => field.locator('.apple-date-menu').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0)
    const geometry = await field.locator('.apple-calendar__time-wheels').evaluate(el => {
      const band = getComputedStyle(el, '::before'), wheel = el.querySelector<HTMLElement>('[role=listbox]')!, center = Number(wheel.dataset.centerIndex)
      const depths = [0, 1, 2, 3].map(offset => {
        const option = wheel.querySelector<HTMLElement>(`[data-time-index="${center + offset}"]`)!, style = getComputedStyle(option), transform = new DOMMatrixReadOnly(style.transform)
        return { height: option.getBoundingClientRect().height, opacity: Number(style.opacity), depth: transform.m43, tilt: transform.m23, filter: style.filter }
      })
      return { bandWidth: parseFloat(band.width), width: el.getBoundingClientRect().width, bandHeight: parseFloat(band.height), columns: el.querySelectorAll('.apple-calendar__time-column').length, columnBands: [...el.querySelectorAll('.apple-calendar__time-wheel')].map(w => getComputedStyle(w, '::before').content), depths }
    })
    expect(geometry.columns).toBe(3)
    expect(geometry.bandWidth).toBe(geometry.width); expect(geometry.bandHeight).toBe(40)
    expect(geometry.columnBands).toEqual(['none', 'none', 'none'])
    expect(geometry.depths[0]!.tilt).toBe(0)
    for (let index = 1; index < geometry.depths.length; index++) {
      expect(geometry.depths[index]!.height).toBeLessThan(geometry.depths[index - 1]!.height)
      expect(geometry.depths[index]!.opacity).toBeLessThan(geometry.depths[index - 1]!.opacity)
      expect(geometry.depths[index]!.depth).toBeLessThan(0)
      expect(geometry.depths[index]!.tilt).not.toBe(0)
      expect(geometry.depths[index]!.filter).toBe('none')
    }
    await field.locator('.apple-date-menu').screenshot({ path: info.outputPath('time.png') })
    await page.screenshot({ path: info.outputPath('real-page.png') })
    const minute = field.getByRole('listbox', { name: '分', exact: true })
    await minute.locator('[data-time-value="32"]').click()
    await expect(minute).toHaveAttribute('data-center-value', '32')
    await expect(field.locator('[data-part=minute]')).toHaveValue('32')
    await expect.poll(() => minute.evaluate(el => { const a = el.querySelector('[aria-selected=true]')!.getBoundingClientRect(), b = el.getBoundingClientRect(); return Math.abs(a.y + a.height / 2 - b.y - b.height / 2) })).toBeLessThan(.75)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('real month pages travel a full panel in each direction without a blank frame', async ({ page }, info) => {
  await openReal(page)
  for (const [name, sign] of [['next', 1], ['previous', -1]] as const) {
    const samples = await recordPages(page, [{ at: 0, name }])
    await writeFile(info.outputPath(`${name}-frames.json`), JSON.stringify(samples, null, 2))
    expectContinuous(samples)
    const incoming = samples.flatMap(frame => frame.panels).filter(panel => !panel.inert && panel.key !== samples[0]!.panels[0]!.key)
    expect(incoming.some(panel => panel.x * sign > panel.width * .85)).toBe(true)
    expect(Math.abs(incoming.at(-1)!.x)).toBeLessThan(.5)
  }
  await expect(page.locator('.apple-calendar__heading')).toHaveText('2026年10月')
  await expect(page.locator('.apple-calendar__day.is-selected')).toHaveAttribute('data-date', '2026-10-03')
})

test('real month and view reversals preserve painted poses and the chosen date', async ({ page }, info) => {
  await openReal(page)
  const immediate = await recordPages(page, [{ at: 0, name: 'next' }, { at: 15, name: 'previous' }, { at: 45, name: 'next' }, { at: 75, name: 'previous' }])
  await writeFile(info.outputPath('immediate-reversal-frames.json'), JSON.stringify(immediate, null, 2))
  expectContinuous(immediate)
  const rapid = await recordPages(page, [{ at: 0, name: 'next' }, { at: 90, name: 'previous' }, { at: 155, name: 'next' }, { at: 215, name: 'previous' }])
  await writeFile(info.outputPath('rapid-month-frames.json'), JSON.stringify(rapid, null, 2))
  expectContinuous(rapid)
  const views = await recordPages(page, [{ at: 0, name: 'heading' }, { at: 90, name: 'month' }, { at: 155, name: 'heading' }, { at: 215, name: 'heading' }, { at: 285, name: 'year' }, { at: 355, name: 'month' }])
  await writeFile(info.outputPath('rapid-view-frames.json'), JSON.stringify(views, null, 2))
  expectContinuous(views)
  expect(views.some(frame => frame.panels.some(panel => panel.key.startsWith('months') && panel.x < -panel.width * .8))).toBe(true)
  expect(views.some(frame => frame.panels.some(panel => panel.key.startsWith('years') && panel.x < -panel.width * .8))).toBe(true)
  await expect(page.locator('.apple-calendar__page')).toHaveCount(1)
  await expect(page.locator('.apple-calendar__day.is-selected')).toHaveAttribute('data-date', '2026-10-03')
})

test('real calendar page and view slides have visible intermediate content', async ({ page }, info) => {
  const field = await openReal(page)
  for (const [name, action] of [['month-slide', '下个月'], ['view-slide', 'heading']] as const) {
    if (action === 'heading') await field.locator('.apple-calendar__heading').click()
    else await field.getByRole('button', { name: action, exact: true }).click()
    await page.waitForTimeout(75)
    // Freeze the actual in-flight frame only while taking its review screenshot.
    const poses = await field.locator('.apple-calendar__viewport').evaluate(el => {
      for (const animation of el.getAnimations({ subtree: true })) animation.pause()
      return [...el.querySelectorAll<HTMLElement>('.apple-calendar__page')].map(page => ({ key: page.dataset.calendarPage, x: page.getBoundingClientRect().left - el.getBoundingClientRect().left }))
    })
    expect(poses.length).toBe(2)
    expect(poses.every(pose => Math.abs(pose.x) > 5)).toBe(true)
    await field.locator('.apple-date-menu').screenshot({ path: info.outputPath(`${name}.png`) })
    await field.locator('.apple-calendar__viewport').evaluate(el => { for (const animation of el.getAnimations({ subtree: true })) animation.play() })
    await expect(field.locator('.apple-calendar__page')).toHaveCount(1)
  }
})

test('keyboard focus stays in the active calendar page across and after month slides', async ({ page }) => {
  const field = await openReal(page)
  await field.locator('[data-date="2026-10-31"]').focus()
  await page.keyboard.press('ArrowRight')
  const active = field.locator('.apple-calendar__page:not([inert])')
  await expect(active.locator('[data-date="2026-11-01"]')).toBeFocused()
  await expect(field.locator('.apple-calendar__page')).toHaveCount(1)
  await page.keyboard.press('ArrowRight')
  await expect(active.locator('[data-date="2026-11-02"]')).toBeFocused()
  await page.keyboard.press('PageUp')
  await expect(active.locator('[data-date="2026-10-02"]')).toBeFocused()
  await expect(field.locator('.apple-calendar__page')).toHaveCount(1)
  await expect(field.locator('[data-part=day]')).toHaveValue('03')
})

for (const motion of ['none', 'reduced']) {
  test(`${motion} applies to calendar page motion and keeps one active page`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/date-wheel.html?motion=${motion}`)
    await page.getByRole('button', { name: '打开日历', exact: true }).click()
    const duration = await page.locator('.apple-calendar').evaluate(async el => {
      ;(el.querySelector('.apple-calendar__header > button:last-child') as HTMLButtonElement).click()
      await Promise.resolve(); await Promise.resolve()
      return el.querySelector('.apple-calendar__pages')!.getAnimations().map(animation => Number(animation.effect!.getTiming().duration))
    })
    if (motion === 'none') expect(duration).toEqual([])
    else { expect(duration.length).toBe(1); expect(duration[0]).toBeLessThanOrEqual(80) }
    await expect(page.locator('.apple-calendar__page')).toHaveCount(1)
    await expect(page.locator('.apple-calendar__heading')).toHaveText('2026年11月')
  })
}

test('switching to system reduced motion finishes a running calendar slide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/tests/e2e/fixtures/date-wheel.html?motion=auto')
  await page.getByRole('button', { name: '打开日历', exact: true }).click()
  await page.getByRole('button', { name: '下个月', exact: true }).click()
  await expect(page.locator('.apple-calendar__page')).toHaveCount(2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.apple-calendar__page')).toHaveCount(1)
  await expect(page.locator('.apple-calendar__heading')).toHaveText('2026年11月')
  expect(await page.locator('.apple-calendar__pages').evaluate(el => el.getAnimations().length)).toBe(0)
})

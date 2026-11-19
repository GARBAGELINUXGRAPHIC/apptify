import { test, expect } from '@playwright/test'

test('API tree follows reading position while preserving collapsed groups', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/component-docs/apple-input')
  await expect(page.getByTestId('component-document').locator('.api-entry')).toHaveCount(17)
  await page.waitForFunction(() => !document.getAnimations().some(animation => animation.playState === 'running' && Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))))
  const tree = page.getByRole('tree', { name: '组件 API 树' })
  const scrollTo = async (id: string) => {
    await page.locator(`#${id}`).evaluate(element => {
      window.dispatchEvent(new WheelEvent('wheel'))
      const offset = parseFloat(getComputedStyle(element).scrollMarginTop)
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' })
    })
  }
  const assertSelected = async (name: string) => {
    const item = tree.getByRole('treeitem', { name, exact: true })
    await expect(item).toHaveAttribute('aria-selected', 'true')
    await expect.poll(() => item.locator(':scope > .apple-tree__row').evaluate(row => {
      const index = row.closest('.documentation-index')!.getBoundingClientRect()
      const bounds = row.getBoundingClientRect()
      return bounds.top >= index.top - 1 && bounds.bottom <= index.bottom + 1
    })).toBe(true)
  }
  await scrollTo('prop-clearable')
  await assertSelected('clearable')
  await expect(page).toHaveURL(/\/apple-input$/)
  await scrollTo('slot-prefix')
  await assertSelected('prefix')
  await scrollTo('prop-placeholder')
  await assertSelected('placeholder')

  const events = tree.getByRole('treeitem', { name: '事件', exact: true })
  await events.focus()
  const beforeToggle = await page.evaluate(() => ({ hash: location.hash, y: scrollY }))
  await events.locator(':scope > .apple-tree__row').click()
  await expect(events).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => ({ hash: location.hash, y: scrollY }))).toEqual(beforeToggle)
  await scrollTo('event-change')
  await assertSelected('事件')
  await expect(events).toHaveAttribute('aria-expanded', 'false')
  await events.focus()
  await page.keyboard.press('Enter')
  await expect(events).toHaveAttribute('aria-expanded', 'true')
  await assertSelected('change')

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await assertSelected('交互与无障碍')
  await tree.getByRole('treeitem', { name: 'clearable', exact: true }).click()
  await expect(page).toHaveURL(/#prop-clearable$/)
  await assertSelected('clearable')
  await expect.poll(() => page.locator('#prop-clearable').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(96)
  await assertSelected('clearable')
  await scrollTo('slot-prefix')
  await assertSelected('prefix')
  await expect(page).toHaveURL(/#prop-clearable$/)
})


test('API tree animates between anchors and returns to the current hash without an initial jump', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/component-docs/apple-input')
  await expect(page.getByTestId('component-document').locator('.api-entry')).toHaveCount(17)
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-motion', 'full')
  await page.waitForFunction(() => !document.getAnimations().some(animation => animation.playState === 'running' && Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))))
  for (const [name, id] of [['clearable', 'prop-clearable'], ['prefix', 'slot-prefix'], ['prefix', 'slot-prefix']]) {
    if (id === 'slot-prefix' && new URL(page.url()).hash === '#slot-prefix') {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    }
    const start = await page.evaluate(() => scrollY)
    const destination = await page.locator(`#${id}`).evaluate(element => element.getBoundingClientRect().top + scrollY - 96)
    await page.evaluate(() => {
      const samples: number[] = [scrollY]
      ;(window as any).__apiScrollSamples = samples
      const scrollTo = window.scrollTo.bind(window)
      const scrollIntoView = Element.prototype.scrollIntoView
      window.scrollTo = ((...args: Parameters<typeof window.scrollTo>) => { scrollTo(...args); samples.push(scrollY) }) as typeof window.scrollTo
      Element.prototype.scrollIntoView = function(options) { scrollIntoView.call(this, options); samples.push(scrollY) }
      ;(window as any).__restoreApiScroll = () => { window.scrollTo = scrollTo; Element.prototype.scrollIntoView = scrollIntoView }
    })
    await page.getByRole('tree', { name: '组件 API 树' }).getByRole('treeitem', { name, exact: true }).locator(':scope > .apple-tree__row').evaluate((row: HTMLElement) => row.click())
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(Math.round(destination))
    const samples = await page.evaluate(() => {
      ;(window as any).__restoreApiScroll()
      return (window as any).__apiScrollSamples as number[]
    })
    const steps = samples.slice(1).map((value, index) => Math.abs(value - samples[index]))
    expect(Math.max(...steps)).toBeLessThan(Math.abs(destination - start) / 2)
    expect(samples.some(value => Math.abs(value - start) > 20 && Math.abs(value - destination) > 20)).toBe(true)
  }
})

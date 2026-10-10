import { expect, test, type Page } from '@playwright/test'
import { directoryItem, waitForPageLayout } from './component-navigation'

async function recordScroll(page: Page) {
  await page.evaluate(() => {
    const state = window as typeof window & { scrollSamples: { time: number; top: number }[] }
    state.scrollSamples = []
    const original = window.scrollTo.bind(window)
    window.scrollTo = ((options: ScrollToOptions) => {
      if (typeof options === 'object' && typeof options.top === 'number') state.scrollSamples.push({ time: performance.now(), top: options.top })
      original(options)
    }) as typeof window.scrollTo
  })
}
async function expectAnimatedLanding(page: Page) {
  await expect.poll(() => page.locator('#apple-infinite-scroll').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(96)
  const samples = await page.evaluate(() => (window as typeof window & { scrollSamples: { time: number; top: number }[] }).scrollSamples)
  expect(samples.length).toBeGreaterThan(3)
  expect(new Set(samples.map(sample => Math.round(sample.top))).size).toBeGreaterThan(3)
  expect(samples.at(-1)!.time - samples[0]!.time).toBeLessThan(2100)
}

test('auto mode animates a cross-page anchor within two seconds', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/component-docs/apple-infinite-scroll')
  await waitForPageLayout(page)
  await expect(page.locator('#app > .apple-provider')).toHaveAttribute('data-apple-motion', 'full')
  await recordScroll(page)
  await page.locator('a[href="/components#apple-infinite-scroll"]').click()
  await expectAnimatedLanding(page)
  await recordScroll(page)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await recordScroll(page)
  await directoryItem(page, 'apple-infinite-scroll').click()
  await expectAnimatedLanding(page)
})

test('the example return-to-top button shares the two-second cap', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/components#apple-back-top')
  await expect.poll(() => page.locator('#apple-back-top').evaluate(element => Math.round(element.getBoundingClientRect().top))).toBe(96)
  await recordScroll(page)
  await page.locator('#apple-back-top').getByRole('button', { name: '回到顶部', exact: true }).first().click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  const samples = await page.evaluate(() => (window as typeof window & { scrollSamples: { time: number; top: number }[] }).scrollSamples)
  expect(samples.length).toBeGreaterThan(3)
  expect(samples.at(-1)!.time - samples[0]!.time).toBeLessThan(2100)
})

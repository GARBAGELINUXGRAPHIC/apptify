import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })
test.beforeEach(async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/select-tab-motion.html')
})

test('repeated pointer activation closes selects without reopening and preserves keyboard and blur behavior', async ({ page }) => {
  for (const id of ['standalone-select', 'tab-select']) {
    const select = page.locator(`#${id}`)
    for (let repeat = 0; repeat < 2; repeat++) {
      await select.tap()
      await expect(select).toHaveAttribute('aria-expanded', 'true')
      await select.tap()
      await expect(select).toHaveAttribute('aria-expanded', 'false')
    }
    await select.focus()
    await select.press('ArrowDown')
    await expect(select).toHaveAttribute('aria-expanded', 'true')
    await select.press('Escape')
    await expect(select).toHaveAttribute('aria-expanded', 'false')
    await select.tap()
    await page.locator('#outside').focus()
    await expect(select).toHaveAttribute('aria-expanded', 'false')
  }
  await expect(page.locator('#changes')).toHaveText('0')
  await page.locator('#tab-select').tap()
  await page.getByRole('option', { name: 'Two', exact: true }).tap()
  await expect(page.locator('#tab-select')).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#changes')).toHaveText('1')
})

test('scrollbar follows each frame of a tab transition and its reversal', async ({ page }) => {
  for (const name of ['Orders', 'Scene']) {
    await page.getByRole('tab', { name, exact: true }).click()
    const samples = await page.evaluate(async () => {
      const samples: number[] = []
      const start = performance.now()
      while (performance.now() - start < 800) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        const viewport = document.querySelector('.sidebar .apple-tabs__viewport')!.getBoundingClientRect()
        for (const bar of document.querySelectorAll<HTMLElement>('.apple-scroll-bar--vertical')) {
          const target = document.getElementById(bar.getAttribute('aria-controls')!)
          if (bar.hidden || !target?.matches('.panel-content') || !target.parentElement?.classList.contains('apple-tab-panel-enter-active')) continue
          const bounds = target.getBoundingClientRect()
          const right = Math.min(bounds.right, viewport.right, innerWidth)
          if (right > viewport.left) samples.push(Math.abs(bar.getBoundingClientRect().right - right))
        }
      }
      return samples
    })
    expect(samples.length).toBeGreaterThan(5)
    expect(Math.max(...samples)).toBeLessThan(2)
  }
  await page.evaluate(() => (window as unknown as { unmount(): void }).unmount())
  await expect(page.locator('.apple-scroll-bar')).toHaveCount(0)
})

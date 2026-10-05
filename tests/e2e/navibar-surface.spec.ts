import { expect, test } from '@playwright/test'

for (const [theme, label, base] of [['light', '浅色', '255, 255, 255'], ['dark', '深色', '0, 0, 0']]) {
  test(`navigation stays opaque ${theme} independently of glass preferences`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await page.goto('/settings')
    await page.getByRole('button', { name: label!, exact: true }).click()
    const bar = page.locator('.site-nav .apple-navibar__bar')
    const toggle = bar.locator('.apple-navibar__toggle')
    const check = async () => {
      await expect(bar).toHaveCSS('background-color', `rgb(${base})`)
      await expect(bar).toHaveCSS('backdrop-filter', 'none')
      expect(await bar.evaluate(el => getComputedStyle(el).transitionProperty)).not.toContain('background')
    }
    await check()
    await page.getByRole('slider', { name: '玻璃不透明度', exact: true }).press('Home')
    await page.getByRole('slider', { name: '玻璃模糊', exact: true }).press('End')
    await check()
    await toggle.click()
    await expect(bar.locator('.apple-navibar__links')).toHaveCSS('background-color', `rgb(${base})`)
    await expect(bar.locator('.apple-navibar__links')).toHaveCSS('backdrop-filter', 'none')
    await expect.poll(() => bar.locator('.apple-navibar__menu').evaluate(element => Math.abs(element.getBoundingClientRect().height - Number.parseFloat((element as HTMLElement).style.height)))).toBeLessThan(.5)
    await expect.poll(() => page.locator('.apple-provider').first().evaluate(element => element.getAnimations({ subtree: true }).filter(animation => Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)) && animation.playState === 'running').length)).toBe(0)
    await expect(bar.getByRole('link', { name: '首页', exact: true })).toBeVisible()
    await page.screenshot({ path: test.info().outputPath(`mobile-nav-${theme}.png`) })
    await page.keyboard.press('Escape')
    await check()
    await toggle.evaluate(async element => {
      for (let count = 0; count < 8; count++) { (element as HTMLButtonElement).click(); await new Promise(resolve => setTimeout(resolve, 25)) }
    })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await check()
    await toggle.click()
    await page.mouse.click(380, 550)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await check()
    await toggle.click()
    await bar.getByRole('link', { name: '首页', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await check()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await toggle.click()
    await expect(bar).toHaveCSS('transition-duration', '0s')
    await check()
    await page.setViewportSize({ width: 1440, height: 900 })
    await check()
  })
}

test('selection indicators stay inside the layout throughout a desktop to mobile resize', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  await page.setViewportSize({ width: 320, height: 900 })
  const widths = await page.evaluate(async () => {
    const samples: number[] = []
    for (let i = 0; i < 24; i++) { await new Promise(requestAnimationFrame); samples.push(document.documentElement.scrollWidth) }
    return samples
  })
  expect(Math.max(...widths)).toBe(320)
})

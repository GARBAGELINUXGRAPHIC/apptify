import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  for (const kind of ['dialog', 'drawer', 'sheet']) {
    test(`${kind} completes its entire exit before removal at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/tests/e2e/fixtures/modal-motion.html?kind=${kind}`)
      await page.locator('#open').focus()
      await page.locator('#open').press('Enter')
      await expect(page.locator('.apple-modal-presence-enter-active')).toHaveCount(0)
      const frames = await page.locator('.apple-overlay-backdrop').evaluate(async (backdrop) => {
        const panel = backdrop.querySelector<HTMLElement>('.apple-modal')!
        const values: { time: number; top: number; left: number; scrim: number; locked: boolean; opacity: string }[] = []
        const start = performance.now()
        panel.querySelector<HTMLButtonElement>('[aria-label="关闭"]')!.click()
        while (backdrop.isConnected && performance.now() - start < 1500) {
          const rect = panel.getBoundingClientRect()
          values.push({ time: performance.now() - start, top: rect.top, left: rect.left, scrim: Number(getComputedStyle(backdrop, '::before').opacity), locked: document.body.style.overflow === 'hidden', opacity: getComputedStyle(panel).opacity })
          await new Promise(requestAnimationFrame)
        }
        return values
      })
      await info.attach('every-rendered-frame', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
      expect(frames.length).toBeGreaterThan(8)
      expect(frames.every(frame => frame.locked)).toBe(true)
      for (let i = 1; i < frames.length; i++) {
        expect(frames[i].scrim).toBeLessThanOrEqual(frames[i - 1].scrim + .001)
        expect(frames[i][kind === 'drawer' ? 'left' : 'top']).toBeGreaterThanOrEqual(frames[i - 1][kind === 'drawer' ? 'left' : 'top'] - .1)
      }
      const last = frames.at(-1)!
      expect(last.scrim).toBeLessThan(.005)
      if (kind === 'dialog') {
        expect(Number(last.opacity)).toBeLessThan(.005)
        expect(last.top - frames[0].top).toBeGreaterThan(30)
        expect(last.top - frames[0].top).toBeLessThan(40)
        for (let i = 1; i < frames.length; i++) expect(Number(frames[i].opacity)).toBeLessThanOrEqual(Number(frames[i - 1].opacity) + .001)
      } else {
        expect(frames.every(frame => frame.opacity === '1')).toBe(true)
        expect(last[kind === 'drawer' ? 'left' : 'top']).toBeGreaterThanOrEqual((kind === 'drawer' ? width : 900) - 1)
      }
      await expect(page.locator('.apple-modal')).toHaveCount(0)
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
      await expect(page.locator('#open')).toBeFocused()
    })
  }
}

for (const motion of ['reduced', 'none']) {
  test(`${motion} motion avoids moving the dialog`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/modal-motion.html?motion=${motion}`)
    await page.locator('#open').click()
    await expect(page.locator('.apple-modal-presence-enter-active')).toHaveCount(0)
    await expect(page.locator('.apple-modal')).toHaveCSS('transform', 'none')
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-modal')).toHaveCount(0)
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  })
}

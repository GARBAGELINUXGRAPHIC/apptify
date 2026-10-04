import { expect, test } from '@playwright/test'

for (const [zoom, scale, offset] of [['big', 1.04, -4.16], ['small', 1.01, 0], ['none', 1, 0]] as const) {
  test(`original ${zoom} card hover`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/card.html${zoom === 'none' ? '' : `?zoom=${zoom}`}`)
    const card = page.locator('.apple-card')
    await expect(card).toHaveCSS('border-radius', '18px')
    await expect(card).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.08) 2px 4px 12px 0px')
    await expect(card).toHaveCSS('transition-timing-function', 'cubic-bezier(0, 0, 0.5, 1)')
    await expect(card).toHaveCSS('transition-duration', '0.3s')
    await card.hover()
    await expect.poll(() => card.evaluate(el => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
      return [Number(matrix.a.toFixed(2)), Number(matrix.d.toFixed(2)), Number(matrix.f.toFixed(2))]
    })).toEqual([scale, scale, offset])
    await expect(card).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.16) 2px 4px 16px 0px')
    await page.getByRole('button', { name: '内部按钮' }).click()
    await page.mouse.move(0, 0)
    await expect(card).toHaveCSS('transform', 'none')
  })
}

for (const [shadow, expected] of [['static', 'rgba(0, 0, 0, 0.08) 2px 4px 12px 0px'], ['focused', 'rgba(0, 0, 0, 0.16) 2px 4px 16px 0px'], ['none', 'none']] as const) {
  test(`original ${shadow} shadow stays unchanged on hover`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/card.html?shadow=${shadow}`)
    const card = page.locator('.apple-card')
    await expect(card).toHaveCSS('box-shadow', expected)
    await card.hover()
    await expect(card).toHaveCSS('box-shadow', expected)
  })
}

for (const motion of ['reduced', 'none']) {
  test(`${motion} card does not zoom`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/card.html?motion=${motion}`)
    const card = page.locator('.apple-card')
    await card.hover()
    await expect(card).toHaveCSS('transform', 'none')
    if (motion === 'none') await expect(card).toHaveCSS('transition-duration', '0s')
  })
}

test('page card shells use AppleCard', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.specimen.apple-card')).toHaveCount(6)
  await page.goto('/settings')
  await expect(page.locator('.settings-section.apple-card')).toHaveCount(4)
  await page.goto('/components')
  await expect(page.locator('.component-card:not(.apple-card)')).toHaveCount(0)
  expect(await page.locator('.component-card.apple-card').count()).toBeGreaterThan(0)
})

test('touch devices suppress hover zoom', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('/tests/e2e/fixtures/card.html')
  const card = page.locator('.apple-card')
  await card.tap()
  await expect(card).toHaveCSS('transform', 'none')
  await context.close()
})

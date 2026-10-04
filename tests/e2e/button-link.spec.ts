import { expect, test } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  test(`action links retain their color when pressed and button icons follow labels in ${theme}`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/ripple-clipping.html?theme=${theme}`)
    const link = page.locator('#text-link')
    await expect(link).toHaveClass('apple-link')
    await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await link.hover()
    await expect(link).toHaveCSS('color', 'color(srgb 0 0.35451 0.712157)')
    const hoverColor = await link.evaluate(el => getComputedStyle(el).color)
    await page.mouse.down()
    await expect(link).toHaveCSS('color', hoverColor)
    await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(link.locator('.v-ripple__container')).toHaveCount(0)
    await page.mouse.up()
    const iconFollowsLabel = await page.locator('#pill .apple-button__content').evaluate(el => {
      const text = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE)!
      const range = document.createRange()
      range.selectNode(text)
      return el.querySelector('svg')!.getBoundingClientRect().left >= range.getBoundingClientRect().right
    })
    expect(iconFollowsLabel).toBe(true)
  })
}

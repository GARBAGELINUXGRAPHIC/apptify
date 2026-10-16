import { expect, test } from '@playwright/test'

test('button sizes survive provider styles and icon-only buttons stay square on mobile', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/button-behavior.html')
  for (const [size, height, fontSize] of [['small', '36px', '13px'], ['medium', '44px', '15px'], ['large', '50px', '17px']]) {
    await expect(page.locator(`#${size}`)).toHaveCSS('height', height)
    await expect(page.locator(`#${size}`)).toHaveCSS('font-size', fontSize)
    const icon = page.locator(`#${size}-icon`)
    await expect(icon).toHaveText('')
    await expect(icon).toHaveCSS('width', height)
    await expect(icon).toHaveCSS('height', height)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('#small')).toHaveCSS('font-size', '13px')
  await expect(page.locator('#small-icon')).toHaveCSS('width', '44px')
  await expect(page.locator('#small-icon')).toHaveCSS('height', '44px')
})

test('button type performs native form actions and href navigates when available', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/button-behavior.html')
  const name = page.getByRole('textbox', { name: 'Name', exact: true })
  await name.fill('Changed')
  await page.getByRole('button', { name: 'button', exact: true }).click()
  await expect(page.locator('#form-events')).toHaveText('0 submits, 0 resets')
  await page.getByRole('button', { name: 'submit', exact: true }).click()
  await expect(page.locator('#form-events')).toHaveText('1 submits, 0 resets')
  await page.getByRole('button', { name: 'reset', exact: true }).click()
  await expect(name).toHaveValue('Initial')
  await expect(page.locator('#form-events')).toHaveText('1 submits, 1 resets')
  for (const label of ['Disabled link', 'Loading link']) {
    const blocked = page.getByRole('button', { name: label, exact: true })
    await expect(blocked).toBeDisabled()
    await expect(blocked).not.toHaveAttribute('href')
  }
  const link = page.getByRole('link', { name: 'Navigate', exact: true })
  await expect(link).not.toHaveAttribute('type')
  await link.click()
  await expect(page).toHaveURL(/#destination$/)
})

test('button playground shows compact sizes and hides slot text when an icon is selected', async ({ page }) => {
  await page.goto('/component-docs/apple-button')
  const config = page.getByRole('region', { name: 'AppleButton 配置' })
  const frame = page.frameLocator('.vue-repl iframe')
  const button = frame.getByRole('button', { name: '继续', exact: true })
  await expect(button).toBeVisible()
  await config.getByRole('combobox', { name: 'size', exact: true }).click()
  await page.getByRole('option', { name: 'small', exact: true }).click()
  await expect(button).toHaveCSS('font-size', '13px')
  const compactSize = await button.evaluate(el => el.ownerDocument.defaultView!.innerWidth <= 600 ? '44px' : '36px')
  await expect(button).toHaveCSS('height', compactSize)
  expect(await button.evaluate(el => el.getBoundingClientRect().width)).toBeLessThan(150)
  await config.getByRole('checkbox', { name: '使用 icon', exact: true }).check()
  await config.getByRole('textbox', { name: 'icon', exact: true }).fill('Mail')
  await config.getByRole('checkbox', { name: '使用 label', exact: true }).check()
  await config.getByRole('textbox', { name: 'label', exact: true }).fill('继续')
  await config.getByRole('switch', { name: 'iconOnly', exact: true }).check()
  await expect(button).toHaveText('')
  await expect(button.locator('svg')).toHaveCount(1)
  await expect(button).toHaveCSS('width', compactSize)
  await config.getByRole('button', { name: '插槽', exact: true }).click()
  await config.getByRole('textbox', { name: 'default 模板', exact: true }).fill('<span>Custom default text</span>')
  await expect(button).toHaveText('')
  await config.getByRole('switch', { name: 'iconOnly', exact: true }).uncheck()
  await expect(button).toHaveText('Custom default text')
  await config.getByRole('switch', { name: 'iconOnly', exact: true }).check()
  await expect(button).toHaveText('')
})

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

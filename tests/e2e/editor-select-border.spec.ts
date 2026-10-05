import { test, expect } from '@playwright/test'

test('select borders survive the Vue REPL button reset in configuration controls', async ({ page }) => {
  await page.goto('/component-docs/apple-input')
  const config = page.getByRole('region', { name: '输入框配置' })
  await config.getByRole('radiogroup', { name: '输入类型', exact: true }).getByText('电话', { exact: true }).click()
  const frame = page.frameLocator('[data-testid="input-playground"] .vue-repl iframe')
  await expect(frame.getByRole('textbox', { name: '姓名', exact: true })).toHaveAttribute('type', 'tel')
  await config.getByRole('button', { name: '插槽、原生属性与动效', exact: true }).click()
  const select = config.getByRole('combobox', { name: '动效', exact: true })
  await expect(select).toHaveCSS('border-top-width', '1px')
  await expect(select).toHaveCSS('border-top-style', 'solid')
  const token = (name: string) => select.evaluate((el, name) => {
    const probe = document.createElement('span')
    probe.style.color = `var(${name})`
    el.append(probe)
    const value = getComputedStyle(probe).color
    probe.remove()
    return value
  }, name)
  await expect(select).toHaveCSS('border-top-color', await token('--apple-border'))
  await select.focus()
  await expect(select).toHaveCSS('border-top-color', await token('--apple-accent'))
  await select.click()
  await page.getByRole('option', { name: 'none', exact: true }).click()
  await expect(select).toContainText('none')
  const step = config.getByRole('spinbutton', { name: '最小值' })
  await expect(step).toBeDisabled()
  const suffix = config.getByRole('combobox', { name: '动效', exact: true })
  await expect(suffix).toHaveCSS('border-top-width', '1px')
  await expect(suffix).toHaveCSS('border-top-style', 'solid')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(config.getByRole('radiogroup', { name: '输入类型', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const preset = config.locator('.preset-select').getByRole('combobox')
  await expect(preset).toHaveCSS('border-top-width', '1px')
  await expect(preset).toHaveCSS('border-top-style', 'solid')
})

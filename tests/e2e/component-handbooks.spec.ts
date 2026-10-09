import { test, expect } from '@playwright/test'
import { catalog, componentId } from '../../playground/catalog'

for (const item of catalog.filter(item => item.name !== 'AppleInput')) {
  test(`${item.name} handbook renders one configurable playground above its API`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.text().includes('[Vue warn]') || (message.type() === 'error' && !message.text().includes('Failed to load resource:'))) errors.push(message.text()) })
    await page.goto(`/component-docs/${componentId(item.name)}`)
    const playground = page.getByTestId('component-playground')
    const document = page.getByTestId('component-document')
    await expect(playground).toHaveAttribute('data-component', item.name)
    const frame = page.frameLocator('.vue-repl iframe')
    await expect(frame.getByRole('region', { name: `${item.name} 示例` })).toBeVisible({ timeout: 20000 })
    await expect(page.locator('.vue-repl iframe')).toHaveCount(1)
    await expect(document.locator('.vue-repl, iframe, .CodeMirror')).toHaveCount(0)
    const propNames = await document.locator('#props .api-entry h3').allTextContents()
    expect(await playground.locator('[data-prop-control]').evaluateAll(elements => elements.map(element => element.getAttribute('data-prop-control')))).toEqual(propNames)
    expect(await playground.evaluate(element => !!(element.compareDocumentPosition(document.querySelector('[data-testid="component-document"]')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
    await expect(page).toHaveTitle(new RegExp(`${item.name} · Apptify`))
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(errors).toEqual([])
  })
}

test('every gallery card links to its own handbook', async ({ page }) => {
  await page.goto('/components')
  await expect(page.locator('.documentation-entry a')).toHaveCount(catalog.length)
  for (const item of catalog) await expect(page.locator(`#${componentId(item.name)} .documentation-entry a`)).toHaveAttribute('href', `/component-docs/${componentId(item.name)}`)
  await expect(page.locator('.component-source')).toHaveCount(0)
})

test('table models, JSON validation, scoped slots and reset work in the live preview', async ({ page }) => {
  await page.goto('/component-docs/apple-table')
  const frame = page.frameLocator('.vue-repl iframe')
  await frame.getByRole('button', { name: '评分', exact: true }).click()
  await expect(frame.locator('tbody tr').first()).toContainText('Alex')
  await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/update:sortBy "score"/)
  await frame.getByRole('checkbox', { name: '选择当前页全部行' }).check()
  await expect(frame.locator('tbody tr.is-selected')).toHaveCount(3)
  await frame.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(frame.locator('tbody tr')).toHaveCount(1)
  const configuration = page.getByRole('region', { name: 'AppleTable 配置' })
  const rows = configuration.getByRole('textbox', { name: 'rows', exact: true })
  await rows.fill('{')
  await expect(configuration.getByRole('alert').filter({ hasText: '配置有误' })).toContainText('请修正')
  await expect(frame.locator('tbody tr')).toHaveCount(1)
  await rows.fill('[{"id":1,"name":"新数据","score":100}]')
  await expect(configuration.getByRole('alert')).toHaveCount(0)
  await expect(frame.locator('tbody')).toContainText('新数据')
  await configuration.getByRole('button', { name: '插槽', exact: true }).click()
  await configuration.getByRole('switch', { name: 'cell-${key}', exact: true }).check()
  await expect(frame.locator('tbody strong')).toHaveText('新数据')
  await configuration.getByRole('button', { name: '重置', exact: true }).click()
  await expect(frame.locator('tbody tr')).toHaveCount(3)
  await expect(frame.locator('tbody strong')).toHaveCount(0)
  await page.setViewportSize({ width: 1440, height: 1200 })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.screenshot({ path: 'test-results/table-handbook-desktop.png' })
})

for (const slug of ['apple-select', 'apple-autocomplete']) {
  test(`${slug} preserves option value types and exposes emitted payloads`, async ({ page }) => {
    await page.goto(`/component-docs/${slug}`)
    const frame = page.frameLocator('.vue-repl iframe')
    const input = frame.getByRole('combobox')
    if (slug === 'apple-autocomplete') await input.fill('第二')
    else await input.click()
    await frame.getByRole('option', { name: '第二项', exact: true }).click()
    await expect(frame.locator('output')).toContainText('"second"')
    await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/update:modelValue "second"/)
  })
}

for (const slug of ['apple-dialog', 'apple-drawer', 'apple-sheet']) {
  test(`${slug} documents confirmation and closing with actual result payloads`, async ({ page }) => {
    await page.goto(`/component-docs/${slug}`)
    const frame = page.frameLocator('.vue-repl iframe')
    await page.getByRole('switch', { name: 'showFooter', exact: true }).check()
    await page.getByRole('switch', { name: 'modelValue', exact: true }).check()
    const dialog = frame.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: '确定', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/confirm true/)
    await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/close true · "confirm"/)
  })
}

test('form validator, scoped loading, public methods and FormData work', async ({ page }) => {
  await page.goto('/component-docs/apple-form')
  const frame = page.frameLocator('.vue-repl iframe')
  await frame.getByRole('textbox', { name: '姓名', exact: true }).fill('林初')
  await frame.getByRole('button', { name: '提交', exact: true }).click()
  await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/submit {"name":"林初"}/)
  await frame.getByRole('button', { name: 'reset()', exact: true }).click()
  await expect(frame.getByRole('textbox', { name: '姓名', exact: true })).toHaveValue('')
  await frame.getByRole('button', { name: 'validate()', exact: true }).click()
  await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/invalid {"type":"native"}/)
})

import { test, expect } from '@playwright/test'

test('custom editor fills its pane and shares the preview header height', async ({ page }) => {
  await page.goto('/component-docs/apple-input')
  const playground = page.getByTestId('input-playground')
  await expect(playground.getByRole('tab', { name: '低代码', exact: true })).toBeVisible()
  const geometry = () => playground.evaluate(root => {
    const bounds = (selector: string) => root.querySelector(selector)!.getBoundingClientRect()
    const pane = bounds('.split-pane > .right')
    const editor = bounds('.split-pane > .right .editor-container')
    const header = bounds('.mode-selector')
    const previewHeader = bounds('.tab-buttons')
    return { bottomGap: pane.bottom - editor.bottom, headerDifference: header.height - previewHeader.height, previewButtonGap: previewHeader.bottom - 1 - bounds('.tab-buttons button.active').bottom }
  })
  await expect.poll(geometry).toEqual({ bottomGap: 0, headerDifference: 0, previewButtonGap: 0 })
  await playground.getByRole('tab', { name: 'App.vue', exact: true }).click()
  await expect(playground.locator('.CodeMirror')).toBeVisible()
  await expect.poll(geometry).toEqual({ bottomGap: 0, headerDifference: 0, previewButtonGap: 0 })
  await playground.scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/editor-height-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(geometry).toEqual({ bottomGap: 0, headerDifference: 0, previewButtonGap: 0 })
  await playground.getByRole('tab', { name: '低代码', exact: true }).click()
  await expect.poll(geometry).toEqual({ bottomGap: 0, headerDifference: 0, previewButtonGap: 0 })
  await page.screenshot({ path: 'test-results/editor-height-mobile.png' })
})


test('editor action icons show tooltips on hover', async ({ page }) => {
  await page.goto('/component-docs/apple-input')
  const toolbar = page.getByTestId('input-playground').getByRole('group', { name: '示例操作' })
  for (const name of ['重新运行', '恢复当前配置', '复制当前文件']) {
    await toolbar.getByRole('button', { name, exact: true }).hover()
    await expect(page.getByRole('tooltip', { name, exact: true })).toBeVisible()
    await page.getByRole('heading', { name: '输入框 AppleInput' }).hover()
    await expect(page.getByRole('tooltip', { name, exact: true })).not.toBeVisible()
  }
})


test('editor actions show notification feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/component-docs/apple-input')
  const playground = page.getByTestId('input-playground')
  const frame = page.frameLocator('[data-testid="input-playground"] .vue-repl iframe')
  await expect(frame.getByRole('textbox', { name: '姓名', exact: true })).toHaveValue('Apptify')
  const toolbar = playground.getByRole('group', { name: '示例操作' })
  for (const [button, message] of [
    ['重新运行', '正在重新运行示例'],
    ['恢复当前配置', '已恢复默认配置和代码'],
    ['复制当前文件', '已复制当前文件代码'],
  ]) {
    await toolbar.getByRole('button', { name: button, exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: message })).toBeVisible()
  }
})

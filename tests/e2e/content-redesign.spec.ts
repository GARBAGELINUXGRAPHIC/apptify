import { activeCard, openComponent } from './component-navigation'
import { expect, test, type Page } from '@playwright/test'



test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /让界面自然，\s*让细节动人。/ })).toBeVisible()
})

test('virtual table keeps a bounded DOM, scrolls through all records, and resizes columns by dragging', async ({ page }) => {
  await openComponent(page, 'apple-table')
  await page.getByRole('switch', { name: '虚拟滚动 · 5000 行' }).check()
  const table = page.locator('.apple-table')
  const visibleRows = table.locator('tbody tr[aria-rowindex]')
  await expect(table.locator('table')).toHaveAttribute('aria-rowcount', '5001')
  await expect.poll(() => visibleRows.count()).toBeGreaterThan(0)
  expect(await visibleRows.count()).toBeLessThan(25)
  await table.locator('.apple-table__scroll').evaluate(element => { element.scrollTop = 48_000 })
  await expect.poll(async () => Number(await visibleRows.first().getAttribute('aria-rowindex'))).toBeGreaterThan(900)
  expect(await visibleRows.count()).toBeLessThan(30)
  await expect(visibleRows.first()).toContainText('组件')
  const header = table.locator('th[data-column-key="name"]')
  const initial = (await header.boundingBox())!.width
  const handle = table.getByRole('separator', { name: '调整名称列宽' })
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 6 })
  await page.mouse.up()
  await expect.poll(async () => (await header.boundingBox())!.width).toBeGreaterThan(initial + 65)
  await table.getByRole('button', { name: '名称', exact: true }).click()
  await expect.poll(() => table.locator('.apple-table__scroll').evaluate(element => element.scrollTop)).toBe(0)
  await expect(visibleRows.first()).toContainText('组件 0001')
  await page.screenshot({ path: '/tmp/apptify-checks/content-virtual-table.png' })
})

test('tree row clicks expand and selection uses a static flat background like the sidebar', async ({ page }) => {
  await openComponent(page, 'apple-tree')
  const tree = activeCard(page).getByRole('tree', { name: '树形列表', exact: true })
  await tree.locator('.apple-tree__row').filter({ hasText: '设计资源' }).click()
  await expect(tree.getByRole('treeitem', { name: '组件', exact: true })).toBeVisible()
  await expect(tree.locator('.apple-selection-indicator')).toHaveCount(0)
  const sampling = await tree.evaluate(async element => {
    const target = [...element.querySelectorAll<HTMLElement>('.apple-tree__row')].find(row => row.textContent === '项目文件')!
    target.click()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    const style = getComputedStyle(target)
    return { transform: style.transform, transition: style.transitionProperty, radius: style.borderRadius }
  })
  expect(sampling.transition).not.toContain('transform')
  expect(sampling.transform).toBe('none')
  expect(sampling.radius).toBe('0px')
  await expect(tree.getByRole('treeitem', { name: '项目文件', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(tree.locator('.is-selected')).toHaveCount(1)
  const sidebarColor = await page.locator('.sidebar .apple-tree__row.is-selected').evaluate(element => getComputedStyle(element).backgroundColor)
  await expect(tree.locator('.is-selected')).toHaveCSS('background-color', sidebarColor)
  await expect(tree.locator('.apple-selection-indicator')).toHaveCount(0)
  await tree.evaluate(async element => { await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined))) })
  await page.screenshot({ path: '/tmp/apptify-checks/content-tree-selection.png', animations: 'disabled' })
})

test('tabs translate the panel and selection indicator instead of fading', async ({ page }) => {
  await openComponent(page, 'apple-tabs')
  const tabs = activeCard(page).locator('.component-demo .apple-tabs')
  await tabs.getByRole('tab', { name: '概览', exact: true }).hover()
  await page.mouse.down()
  await expect(tabs.locator('.v-ripple__container')).toHaveCount(0)
  await page.mouse.up()
  await expect(tabs.getByRole('tab', { name: '概览', exact: true })).toHaveAttribute('aria-selected', 'true')
  const sample = await tabs.evaluate(async element => {
    const target = [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(tab => tab.textContent === '技术规格')!
    target.click()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    const panel = element.querySelector<HTMLElement>('.apple-tab-panel-enter-active')!
    const indicator = element.querySelector<HTMLElement>('.apple-selection-indicator')!
    return { panelTransform: panel ? getComputedStyle(panel).transform : 'missing', panelOpacity: panel ? getComputedStyle(panel).opacity : 'missing', transition: panel ? getComputedStyle(panel).transitionProperty : 'missing', indicatorX: new DOMMatrix(getComputedStyle(indicator).transform).m41 }
  })
  expect(sample.transition).toBe('transform')
  expect(sample.panelTransform).not.toBe('none')
  expect(sample.panelOpacity).toBe('1')
  expect(sample.indicatorX).toBeGreaterThan(0)
  await expect(tabs.getByRole('tabpanel')).toContainText('这里是技术规格。')
})

test('accordion animates measured height and retains inert content on close', async ({ page }) => {
  await openComponent(page, 'apple-accordion')
  const accordion = activeCard(page).locator('.component-demo .apple-accordion')
  const region = accordion.getByRole('region', { includeHidden: true }).first()
  const opening = await accordion.evaluate(async element => {
    const region = element.querySelector<HTMLElement>('.apple-accordion__region')!
    const before = region.getBoundingClientRect().height
    element.querySelector<HTMLButtonElement>('h3 button')!.click()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    return { before, during: region.getBoundingClientRect().height, transition: getComputedStyle(region).transitionProperty }
  })
  expect(opening.before).toBe(0)
  expect(opening.transition).toContain('grid-template-rows')
  expect(opening.during).toBeGreaterThan(0)
  await expect.poll(() => region.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(opening.during + 1)
  await expect(region).toHaveAttribute('aria-hidden', 'false')
  await accordion.locator('h3 button').first().click()
  await expect(region).toHaveAttribute('inert', '')
  await expect.poll(() => region.evaluate(element => element.getBoundingClientRect().height)).toBe(0)
  await expect(region).not.toHaveAttribute('hidden')
})

test('pagination remains square on a narrow viewport', async ({ page }) => {
  await openComponent(page, 'apple-pagination')
  await page.setViewportSize({ width: 320, height: 740 })
  const buttons = activeCard(page).locator('.component-demo .apple-pagination__pages > button')
  for (const button of await buttons.all()) {
    const rect = (await button.boundingBox())!
    expect(rect.width).toBeCloseTo(44, 3)
    expect(rect.height).toBeCloseTo(44, 3)
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('floating actions stay inside their feed preview and retain their provider theme', async ({ page }) => {
  await openComponent(page, 'apple-floating-group')
  const group = page.getByRole('group', { name: '快捷操作', exact: true })
  await expect(group).toBeVisible()
  expect(await group.evaluate(element => element.parentElement?.hasAttribute('data-apple-portals'))).toBe(true)
  const bounds = (await activeCard(page).boundingBox())!
  const buttons = await group.getByRole('button').all()
  for (const button of buttons) {
    const rect = (await button.boundingBox())!
    expect(rect.x).toBeGreaterThanOrEqual(bounds.x)
    expect(rect.y).toBeGreaterThanOrEqual(bounds.y)
    expect(rect.x + rect.width).toBeLessThanOrEqual(bounds.x + bounds.width)
    expect(rect.y + rect.height).toBeLessThanOrEqual(bounds.y + bounds.height)
  }
  expect(await group.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-surface').trim())).not.toBe('')
})

import { expect, test, type Page } from '@playwright/test'

async function openComponent(page: Page, tag: string) {
  await page.getByRole('searchbox', { name: '搜索组件' }).fill(tag)
  await page.locator('.catalog-item').filter({ has: page.getByText(tag, { exact: true }) }).click()
  await expect(page.locator('.detail-footer')).toContainText(`<${tag} />`)
  await expect(page.locator('.component-demo')).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '组件总览。' })).toBeVisible()
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
  await page.screenshot({ path: 'artifacts/content-virtual-table.png' })
})

test('tree row clicks expand and the neutral selection indicator moves vertically', async ({ page }) => {
  await openComponent(page, 'apple-tree')
  const tree = page.getByRole('tree')
  await tree.locator('.apple-tree__row').filter({ hasText: '设计资源' }).click()
  await expect(tree.getByRole('treeitem', { name: '组件', exact: true })).toBeVisible()
  const indicator = tree.locator(':scope > .apple-selection-indicator')
  await expect(indicator).toBeVisible()
  const start = await indicator.evaluate(element => new DOMMatrix(getComputedStyle(element).transform).m42)
  const sampling = await tree.evaluate(async element => {
    const target = [...element.querySelectorAll<HTMLElement>('.apple-tree__row')].find(row => row.textContent === '项目文件')!
    target.click()
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    const marker = element.querySelector<HTMLElement>(':scope > .apple-selection-indicator')!
    const style = getComputedStyle(marker)
    return { y: new DOMMatrix(style.transform).m42, transition: style.transitionProperty, color: style.backgroundColor, opacity: style.opacity }
  })
  expect(sampling.transition).toContain('transform')
  expect(sampling.y).toBeGreaterThan(start)
  expect(sampling.opacity).toBe('1')
  const rgb = sampling.color.match(/[\d.]+/g)!.slice(0, 3).map(Number)
  expect(Math.max(...rgb) - Math.min(...rgb)).toBeLessThan(12)
  await expect(tree.getByRole('treeitem', { name: '项目文件', exact: true })).toHaveAttribute('aria-selected', 'true')
  await tree.evaluate(async element => { await Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => undefined))) })
  await page.screenshot({ path: 'artifacts/content-tree-selection.png', animations: 'disabled' })
})

test('tabs translate the panel and selection indicator instead of fading', async ({ page }) => {
  await openComponent(page, 'apple-tabs')
  const tabs = page.locator('.component-demo .apple-tabs')
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
  const accordion = page.locator('.apple-accordion')
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
  const buttons = page.locator('.component-demo .apple-pagination button')
  for (const button of await buttons.all()) {
    const rect = (await button.boundingBox())!
    expect(rect.width).toBeCloseTo(44, 3)
    expect(rect.height).toBeCloseTo(44, 3)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('floating actions escape transformed content while retaining their provider theme and bottom order', async ({ page }) => {
  await openComponent(page, 'apple-floating-group')
  const group = page.getByRole('group', { name: '快捷操作', exact: true })
  await expect(group).toBeVisible()
  expect(await group.evaluate(element => element.parentElement?.hasAttribute('data-apple-portals'))).toBe(true)
  const backTop = group.getByRole('button', { name: '回到顶部', exact: true })
  const bell = group.getByRole('button', { name: '查看通知', exact: true })
  await expect.poll(async () => { const rect = (await backTop.boundingBox())!; return Math.abs(rect.y + rect.height - 980) }).toBeLessThan(.1)
  const rect = (await backTop.boundingBox())!
  expect(rect.y).toBeGreaterThan((await bell.boundingBox())!.y)
  expect(rect.x + rect.width).toBeCloseTo(1440 - 20, 1)
  expect(rect.y + rect.height).toBeCloseTo(1000 - 20, 1)
  await page.locator('main').evaluate(element => { element.style.transform = 'translateY(80px)' })
  const shifted = (await backTop.boundingBox())!
  expect(shifted.y).toBeCloseTo(rect.y, 1)
  expect(await group.evaluate(element => getComputedStyle(element).getPropertyValue('--apple-surface').trim())).not.toBe('')
})

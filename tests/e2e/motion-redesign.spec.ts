import { activeCard, openComponent } from './component-navigation'
import { expect, test, type Page } from '@playwright/test'



test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/'); await expect(page.locator('.specimen')).toHaveCount(6) })

test('anchor navigation keeps one feed and preserves every preview', async ({ page }) => {
  await openComponent(page, 'apple-input')
  const input = activeCard(page).getByRole('textbox', { name: '姓名', exact: true })
  await input.fill('保留输入')
  const count = await page.locator('.component-demo').count()
  await page.locator('.sidebar a[href="/components#navigation"]').click()
  await expect(page.locator('#navigation')).toBeInViewport()
  await expect(page.locator('.component-feed')).toHaveCount(1)
  await expect(page.locator('.component-demo')).toHaveCount(count)
  await expect(input).toHaveValue('保留输入')
  expect(await page.locator('main').evaluate(el => el.getAnimations().length)).toBe(0)
})

test('inline code disclosure does not replay page entrance or reset the demo', async ({ page }) => {
  await openComponent(page, 'apple-input')
  const input = activeCard(page).getByRole('textbox', { name: '姓名', exact: true })
  await input.fill('保留输入')
  for (let i = 0; i < 2; i++) {
    await activeCard(page).locator('.component-source').getByRole('button', { name: '代码与 API', exact: true }).click()
    expect(await page.locator('main').evaluate(el => el.getAnimations().length)).toBe(0)
  }
  await expect(input).toHaveValue('保留输入')
})

test('text tabs change text color without hover or pressed backgrounds', async ({ page }) => {
  const check = async (selector: string) => {
    const tab = activeCard(page).locator(selector).last()
    await page.mouse.move(0, 0)
    const before = await tab.evaluate(el => getComputedStyle(el).color)
    await tab.hover()
    await expect.poll(() => tab.evaluate(el => getComputedStyle(el).color)).not.toBe(before)
    expect(await tab.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    await page.mouse.down()
    expect(await tab.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    await page.mouse.up()
  }
  for (const tag of ['apple-tabs', 'apple-tab-bar', 'apple-segmented-control']) {
    await openComponent(page, tag)
    await check(tag === 'apple-segmented-control' ? '.component-demo .apple-segmented__item:not(.is-selected)' : '.component-demo [role=tab]:not([aria-selected=true])')
  }
})

test('sliding component tabs only animate their own content', async ({ page }) => {
  for (const tag of ['apple-tabs', 'apple-tab-bar', 'apple-segmented-control']) {
    await openComponent(page, tag)
    const main = page.locator('main')
    await expect.poll(() => main.evaluate(el => el.getAnimations().length)).toBe(0)
    const demo = activeCard(page).locator('.component-demo')
    if (tag === 'apple-segmented-control') await demo.getByText('日', { exact: true }).click()
    else await demo.getByRole('tab', { name: '技术规格', exact: true }).click()
    expect(await main.evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(page.locator('.component-feed')).toHaveCount(1)
  }
})

test('component locator uses a static active highlight and does not filter', async ({ page }) => {
  await openComponent(page, 'apple-input')
  const styles = await page.locator('.sidebar .apple-tree__row.is-selected').evaluate(el => {
    const s = getComputedStyle(el)
    return { transform: s.transform, background: s.backgroundColor }
  })
  expect(styles.transform).toBe('none')
  expect(styles.background).not.toBe('rgba(0, 0, 0, 0)')
  await expect(page.locator('.sidebar .apple-selection-indicator')).toHaveCount(0)
})

test('Ripple stays translucent and action links never create it', async ({ page }) => {
  const button = page.getByRole('button', { name: '继续探索', exact: true })
  await button.hover(); await page.mouse.down()
  const wave = button.locator('.v-ripple__animation')
  await expect(wave).toHaveCount(1)
  await expect.poll(() => wave.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0)
  expect(await wave.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThanOrEqual(.11)
  await page.mouse.up()
  await openComponent(page, 'apple-button')
  const link = activeCard(page).locator('.component-demo .apple-link')
  await link.hover(); await page.mouse.down()
  await expect(link.locator('.v-ripple__container')).toHaveCount(0)
  await page.mouse.up()
  const secondary = activeCard(page).locator('.component-demo .apple-button--secondary')
  expect(await secondary.evaluate(el => getComputedStyle(el).borderTopStyle)).toBe('solid')
  for (const variant of ['secondary', 'outline']) {
    const outlined = activeCard(page).locator(`.component-demo .apple-button--${variant}`)
    await outlined.hover()
    await expect.poll(() => outlined.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(0, 113, 227)')
    await expect.poll(() => outlined.evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)')
    await page.mouse.down()
    await expect.poll(() => outlined.evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)')
    await page.mouse.up()
    await page.mouse.move(0, 0)
    await expect.poll(() => outlined.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  }
})

test('search has a single animated focus ring and theme colors interpolate', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: '搜索设置' })
  await search.focus()
  expect(await search.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none')
  expect(await search.evaluate(el => getComputedStyle(el.parentElement!).transitionProperty)).toContain('box-shadow')
  const provider = page.locator('.apple-provider').first()
  await page.getByRole('navigation', { name: '主导航', exact: true }).getByRole('link', { name: '设置', exact: true }).click()
  await page.getByRole('button', { name: '深色', exact: true }).evaluate(el => (el as HTMLElement).click())
  const animation = await provider.evaluate(async el => {
    await new Promise(requestAnimationFrame)
    const transition = el.getAnimations().find(a => a instanceof CSSTransition && a.transitionProperty === '--apple-bg')
    if (!transition) return null
    transition.pause(); transition.currentTime = 130
    const color = getComputedStyle(el).backgroundColor
    transition.finish()
    return color
  })
  expect(animation).not.toBeNull(); expect(animation).not.toBe('rgb(245, 245, 247)'); expect(animation).not.toBe('rgb(22, 22, 23)')
})

test('size wrapper animates actual height and demo breadcrumbs navigate back', async ({ page }) => {
  await openComponent(page, 'apple-auto-size')
  const wrapper = activeCard(page).locator('.component-demo .apple-auto-size').first()
  const before = (await wrapper.boundingBox())!.height
  await activeCard(page).locator('.component-demo').getByRole('switch').click()
  await expect.poll(() => wrapper.evaluate(el => el.getAnimations().length)).toBeGreaterThan(0)
  await expect.poll(async () => (await wrapper.boundingBox())!.height).toBeLessThan(before - 30)
  await openComponent(page, 'apple-breadcrumbs')
  await activeCard(page).locator('.component-demo').getByRole('button', { name: '导航', exact: true }).click()
  await expect(page.locator('.component-feed')).toHaveCount(1)
  await expect(page.locator('#navigation-heading')).toBeVisible()
})

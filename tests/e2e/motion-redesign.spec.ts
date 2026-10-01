import { expect, test, type Page } from '@playwright/test'

async function openComponent(page: Page, tag: string) {
  await page.getByRole('searchbox', { name: '搜索组件' }).fill(tag)
  await page.locator('.catalog-item').filter({ has: page.getByText(tag, { exact: true }) }).click()
  await expect(page.locator('.gallery-page')).toHaveCount(1)
  await expect(page.locator('.detail-preview')).toBeVisible()
}

test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/'); await expect(page.locator('.specimen')).toHaveCount(6) })

test('global entrance fades in with one upward movement, one page and no leave phase', async ({ page }) => {
  await page.locator('.sidebar-groups').getByRole('button', { name: /^表单/ }).evaluate(el => (el as HTMLElement).click())
  const frames = await page.locator('main').evaluate(async el => {
    await new Promise(requestAnimationFrame)
    return el.getAnimations().flatMap(animation => (animation.effect as KeyframeEffect).getKeyframes())
  })
  expect(frames).toHaveLength(2)
  expect(frames.map(frame => frame.transform)).toEqual(['translateY(14px)', 'translateY(0px)'])
  expect(frames.map(frame => Number(frame.opacity))).toEqual([0, 1])
  await expect(page.locator('.gallery-page')).toHaveCount(1)
  await expect(page.locator('[class*="leave-active"]')).toHaveCount(0)
  await page.locator('.sidebar-groups').getByRole('button', { name: /^导航/ }).click()
  await page.locator('.sidebar-groups').getByRole('button', { name: /^基础/ }).click()
  await expect(page.getByRole('heading', { name: '基础。', exact: true })).toBeVisible()
  await expect(page.locator('.gallery-page')).toHaveCount(1)
})

test('preview tabs do not replay page entrance or reset the demo', async ({ page }) => {
  await openComponent(page, 'apple-input')
  const input = page.locator('.component-demo').getByRole('textbox', { name: '姓名', exact: true })
  await input.fill('保留输入')
  const main = page.locator('main')
  await expect.poll(() => main.evaluate(el => el.getAnimations().length)).toBe(0)
  let navigations = 0
  page.on('framenavigated', frame => { if (frame === page.mainFrame()) navigations++ })
  const tabs = page.getByRole('tablist', { name: '浏览视图', exact: true })
  for (const name of ['代码与 API', '预览']) {
    await tabs.getByRole('tab', { name, exact: true }).click()
    expect(await main.evaluate(el => el.getAnimations().length)).toBe(0)
  }
  await expect(input).toHaveValue('保留输入')
  expect(navigations).toBe(0)
})

test('text tabs change text color without hover or pressed backgrounds', async ({ page }) => {
  const check = async (selector: string) => {
    const tab = page.locator(selector).last()
    await page.mouse.move(0, 0)
    const before = await tab.evaluate(el => getComputedStyle(el).color)
    await tab.hover()
    await expect.poll(() => tab.evaluate(el => getComputedStyle(el).color)).not.toBe(before)
    expect(await tab.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    await page.mouse.down()
    expect(await tab.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)')
    await page.mouse.up()
  }
  await check('.view-tabs button')
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
    const demo = page.locator('.component-demo')
    if (tag === 'apple-segmented-control') await demo.getByText('日', { exact: true }).click()
    else await demo.getByRole('tab', { name: '技术规格', exact: true }).click()
    expect(await main.evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(page.locator('.gallery-page')).toHaveCount(1)
  }
})

test('flat sidebar selection does not move and has no margin, rounding or primary tint', async ({ page }) => {
  await page.locator('.sidebar-groups').getByRole('button', { name: /^表单/ }).click()
  await expect(page.locator('.sidebar-groups > .apple-selection-indicator')).toHaveCount(0)
  const styles = await page.locator('.nav-item.active').evaluate(el => { const s = getComputedStyle(el); return { radius: s.borderRadius, margin: s.marginLeft, color: s.color, transform: s.transform, background: s.backgroundColor } })
  expect(styles.radius).toBe('0px'); expect(styles.margin).toBe('0px'); expect(styles.color).not.toBe('rgb(0, 113, 227)')
  expect(styles.transform).toBe('none'); expect(styles.background).not.toBe('rgba(0, 0, 0, 0)')
})

test('Ripple stays translucent and ghost buttons never create it', async ({ page }) => {
  const button = page.getByRole('button', { name: '继续探索', exact: true })
  await button.hover(); await page.mouse.down()
  const wave = button.locator('.v-ripple__animation')
  await expect(wave).toHaveCount(1)
  await expect.poll(() => wave.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0)
  expect(await wave.evaluate(el => Number(getComputedStyle(el).opacity))).toBeLessThanOrEqual(.11)
  await page.mouse.up()
  await openComponent(page, 'apple-button')
  const ghost = page.locator('.component-demo .apple-button--ghost')
  await ghost.hover(); await page.mouse.down()
  await expect(ghost.locator('.v-ripple__container')).toHaveCount(0)
  await page.mouse.up()
  const secondary = page.locator('.component-demo .apple-button--secondary')
  expect(await secondary.evaluate(el => getComputedStyle(el).borderTopStyle)).toBe('solid')
  for (const variant of ['secondary', 'outline']) {
    const outlined = page.locator(`.component-demo .apple-button--${variant}`)
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
  const search = page.getByRole('searchbox', { name: '搜索组件' })
  await search.focus()
  expect(await search.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none')
  expect(await search.evaluate(el => getComputedStyle(el.parentElement!).transitionProperty)).toContain('box-shadow')
  const provider = page.locator('.apple-provider').first()
  await page.getByRole('button', { name: '切换明暗主题', exact: true }).evaluate(el => (el as HTMLElement).click())
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
  const wrapper = page.locator('.component-demo .apple-auto-size').first()
  const before = (await wrapper.boundingBox())!.height
  await page.locator('.component-demo').getByRole('switch').click()
  await expect.poll(() => wrapper.evaluate(el => el.getAnimations().length)).toBeGreaterThan(0)
  await expect.poll(async () => (await wrapper.boundingBox())!.height).toBeLessThan(before - 30)
  await openComponent(page, 'apple-breadcrumbs')
  await page.locator('.component-demo').getByRole('button', { name: '导航', exact: true }).click()
  await expect(page.locator('.gallery-page')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: '导航。', exact: true })).toBeVisible()
})

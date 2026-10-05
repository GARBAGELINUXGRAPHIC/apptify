import { expect, test, type Page } from '@playwright/test'

async function assertReadingOrder(page: Page) {
  const groups = await page.locator('.feed-cards').evaluateAll(feeds => feeds.map(feed =>
    Array.from(feed.children).map(card => {
      const rect = card.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
    }),
  ))
  for (const cards of groups) {
    const columns = [...new Set(cards.map(card => card.left))].sort((a, b) => a - b)
    const bottoms = columns.map(() => cards[0].top)
    for (const card of cards) {
      const shortest = bottoms.indexOf(Math.min(...bottoms))
      expect(card.left).toBeCloseTo(columns[shortest], 0)
      expect(Math.abs(card.top - bottoms[shortest])).toBeLessThanOrEqual(1)
      bottoms[shortest] = card.bottom + 20
    }
    for (let index = 1; index < cards.length; index++) {
      expect(cards[index].top).toBeGreaterThanOrEqual(cards[index - 1].top - 1)
    }
    for (let index = 0; index < cards.length; index++) {
      for (const previous of cards.slice(0, index)) {
        if (Math.abs(previous.left - cards[index].left) < 1) {
          expect(cards[index].top - previous.bottom).toBeGreaterThanOrEqual(19)
        }
      }
    }
  }
}

test('component masonry keeps reading order through card expansion and responsive resize', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.goto('/components')
  await page.waitForTimeout(1200)
  await assertReadingOrder(page)
  expect(await page.locator('.feed-cards').first().evaluate(feed => new Set(
    Array.from(feed.children).map(card => (card as HTMLElement).style.left),
  ).size)).toBe(2)

  await page.locator('#apple-transition .component-source > .apple-accordion__item > h3 > button').click()
  await page.waitForTimeout(700)
  await assertReadingOrder(page)

  const cards = page.locator('.feed-group').first().locator('.component-card')
  const positions = await cards.evaluateAll(elements => elements.map(el => ({
    label: el.querySelector('h3')!.textContent!.trim(), top: el.getBoundingClientRect().top + scrollY,
  })))
  const selectedIndexes: number[] = []
  for (const top of [...new Set(positions.map(position => Math.round(position.top)))]) {
    await page.evaluate(y => window.scrollTo({ top: y - 110, behavior: 'instant' }), top)
    await page.waitForTimeout(60)
    const selected = await page.locator('.sidebar [role="treeitem"][aria-selected="true"]').getAttribute('aria-label')
    const index = positions.findIndex(position => position.label === selected)
    expect(index).toBeGreaterThanOrEqual(0)
    selectedIndexes.push(index)
  }
  expect(selectedIndexes).toEqual([...selectedIndexes].sort((a, b) => a - b))

  await page.goto('/components#apple-transition')
  await page.waitForTimeout(1200)
  await expect(page.locator('.sidebar').getByRole('treeitem', { name: '动效容器', exact: true })).toHaveAttribute('aria-selected', 'true')
  expect(await page.locator('#apple-transition').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(96)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(700)
  await assertReadingOrder(page)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(await page.locator('.feed-cards').first().evaluate(feed => new Set(
    Array.from(feed.children).map(card => (card as HTMLElement).style.left),
  ).size)).toBe(1)
})

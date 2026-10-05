import { expect, type Page } from '@playwright/test'
import { catalog, componentId } from '../../playground/catalog'

export const activeCard = (page: Page) => page.locator(new URL(page.url()).hash)

export async function openComponent(page: Page, tag: string) {
  const path = `/components#${tag}`
  await page.goto(page.url().startsWith('http') ? new URL(path, page.url()).href : path)
  await expect(activeCard(page).locator('.component-demo')).toBeVisible()
  await expect(activeCard(page)).toBeInViewport()
  await waitForPageLayout(page)
}

export async function waitForPageLayout(page: Page) {
  const surface = page.locator('.route-page, main').first()
  await expect(surface).toBeVisible()
  await surface.evaluate(async element => {
    await document.fonts.ready
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    await Promise.all(element.getAnimations({ subtree: true })
      .filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => {})))
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
}

export function directoryItem(page: Page, tag: string) {
  const entry = catalog.find(item => componentId(item.name) === tag)
  if (!entry) throw new Error(`Unknown component: ${tag}`)
  return page.locator('.sidebar').getByRole('treeitem', { name: entry.label, exact: true })
}

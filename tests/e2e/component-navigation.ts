import { expect, type Page } from '@playwright/test'

export const activeCard = (page: Page) => page.locator(new URL(page.url()).hash)

export async function openComponent(page: Page, tag: string) {
  const path = `/components#${tag}`
  await page.goto(page.url().startsWith('http') ? new URL(path, page.url()).href : path)
  await expect(activeCard(page).locator('.component-demo')).toBeVisible()
  await expect(activeCard(page)).toBeInViewport()
  await expect.poll(() => page.locator('main').evaluate(element => element.getAnimations().length)).toBe(0)
}

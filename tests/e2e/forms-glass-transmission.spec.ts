import { createRequire } from 'node:module'
import { expect, test, type Locator, type Page } from '@playwright/test'

const require = createRequire(import.meta.url)
const { PNG } = require('playwright-core/lib/utilsBundle')
type Region = { x: number; y: number; width: number; height: number }

test.use({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 })

async function setSlider(slider: Locator, value: number) {
  await slider.evaluate((element, next) => {
    const input = element as HTMLInputElement
    input.value = String(next)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
}

async function setGlass(page: Page, opacity: number, blur: number) {
  await page.goto('/settings')
  await setSlider(page.getByRole('slider', { name: '玻璃不透明度', exact: true }), opacity)
  await setSlider(page.getByRole('slider', { name: '玻璃模糊', exact: true }), blur)
  await page.goto('/components')
  const card = page.locator('#apple-autocomplete')
  await expect(card.locator('.component-demo').getByRole('combobox')).toBeVisible()
  await card.evaluate(element => window.scrollTo(0, scrollY + element.getBoundingClientRect().top - 105))
  await page.mouse.move(1590, 980)
  return card
}

async function darkestRed(page: Page, region: Region, name: string) {
  const screenshot = await page.screenshot({ clip: region })
  await test.info().attach(name, { body: screenshot, contentType: 'image/png' })
  const png = PNG.sync.read(screenshot)
  let darkest = 255
  for (let offset = 0; offset < png.data.length; offset += 4) darkest = Math.min(darkest, png.data[offset])
  return darkest
}

test.beforeEach(async ({ page }) => {
  // These preferences belong to this isolated test context, never the user's tab.
  await page.addInitScript(() => {
    const preferences = JSON.parse(localStorage.getItem('apptify:preferences') || '{}')
    localStorage.setItem('apptify:preferences', JSON.stringify({ ...preferences, theme: 'light', motion: 'none' }))
  })
})

test('actual three-column Autocomplete transmits underlying code glyphs as opacity changes', async ({ page }) => {
  const samples: number[] = []
  const errors: string[] = []
  page.on('pageerror', error => errors.push(String(error)))
  for (const opacity of [0, 80 / 255 * 100, 60, 100]) {
    const card = await setGlass(page, opacity, 2)
    const columns = await card.evaluate(element => getComputedStyle(element.parentElement!).gridTemplateColumns.split(' ').length)
    expect(columns).toBe(3)
    const combo = card.locator('.component-demo').getByRole('combobox')
    const footer = (await card.locator('.component-source').boundingBox())!
    const input = (await combo.boundingBox())!
    // The first part of the underlying code-footer glyph lies before the menu's
    // foreground option text, so these pixels measure actual backdrop transmission.
    const region = { x: input.x + 1, y: footer.y + 17, width: 15, height: 17 }
    const closed = await darkestRed(page, region, `${opacity}-closed-code`)
    expect(closed).toBeLessThan(160)
    const scroll = await page.evaluate(() => scrollY)
    await combo.focus()
    const menu = card.locator('.apple-field-menu')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('backdrop-filter', 'blur(2px) saturate(2)')
    expect(await page.evaluate(() => scrollY)).toBe(scroll)
    expect((await card.locator('.component-source').boundingBox())!.y).toBe(footer.y)
    const opened = await darkestRed(page, region, `${opacity}-opened-code`)
    samples.push(opened)
    expect(opened).toBeGreaterThan(closed)
    await combo.press('Escape')
    await expect(menu).toHaveCount(0)
  }
  expect(samples[0]).toBeLessThan(225)
  expect(samples[1]).toBeGreaterThan(samples[0]!)
  expect(samples[2]).toBeGreaterThan(samples[1]!)
  expect(samples[2]).toBeLessThan(250)
  expect(samples[3]).toBe(255)
  expect(errors).toEqual([])
})

test('actual code and divider pixels are softened by blur without adding an opaque inner surface', async ({ page }) => {
  const glyphs: number[] = [], lines: number[] = []
  for (const blur of [2, 12]) {
    const card = await setGlass(page, 80 / 255 * 100, blur)
    const footer = (await card.locator('.component-source').boundingBox())!
    const combo = card.locator('.component-demo').getByRole('combobox')
    const input = (await combo.boundingBox())!
    await combo.focus()
    const menu = card.locator('.apple-field-menu')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS('backdrop-filter', `blur(${blur}px) saturate(2)`)
    glyphs.push(await darkestRed(page, { x: input.x + 1, y: footer.y + 17, width: 15, height: 17 }, `${blur}-code`))
    lines.push(await darkestRed(page, { x: input.x + 215, y: footer.y - 6, width: 100, height: 14 }, `${blur}-divider`))
    const inner = await menu.locator('.apple-auto-size, .apple-auto-size__inner, ul, li').evaluateAll(elements => elements.map(element => getComputedStyle(element).backgroundColor))
    expect(inner.every(background => background === 'rgba(0, 0, 0, 0)')).toBe(true)
    await combo.press('Escape')
    await expect(menu).toHaveCount(0)
  }
  expect(glyphs[1]! - glyphs[0]!).toBeGreaterThan(15)
  expect(glyphs[1]).toBeLessThan(255)
  expect(lines[1]).toBeGreaterThanOrEqual(lines[0]!)
})

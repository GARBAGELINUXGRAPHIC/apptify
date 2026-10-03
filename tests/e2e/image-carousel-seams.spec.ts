import { expect, test } from '@playwright/test'
import { activeCard, openComponent } from './component-navigation'

for (const theme of ['light', 'dark']) for (const width of [320, 1440]) {
  test(`carousel photos meet without exposed strips: ${theme}, ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 })
    await page.goto(`/tests/e2e/fixtures/image-carousel.html?theme=${theme}`)
    const figure = page.locator('#photos'), strip = figure.locator('.apple-image__gallery')
    await expect.poll(() => figure.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
    const geometry = await strip.evaluate(element => {
      const slides = [...element.children] as HTMLElement[]
      return {
        trackGap: getComputedStyle(element).columnGap,
        vertical: slides.map(slide => slide.querySelector('.apple-image__slide-caption')!.getBoundingClientRect().top - slide.querySelector('.apple-image__slide-picture')!.getBoundingClientRect().bottom),
        horizontal: slides.slice(1).map((slide, index) => slide.getBoundingClientRect().left - slides[index]!.getBoundingClientRect().right),
        radii: slides.map(slide => getComputedStyle(slide).borderRadius),
      }
    })
    expect(geometry.trackGap).toBe('0px')
    geometry.vertical.forEach(gap => expect(Math.abs(gap)).toBeLessThan(.1))
    geometry.horizontal.forEach(gap => expect(Math.abs(gap)).toBeLessThan(.1))
    expect(geometry.radii.every(radius => radius === '0px')).toBe(true)
    await expect(figure.locator('.apple-image__slide-caption').first()).toContainText('山间清晨')
    await expect(figure.locator('.apple-image__arrows')).toHaveCount(1)
    await expect(figure.locator('.apple-image__dot')).toHaveCount(4)
    for (const [stage, fraction] of [['first', 0], ['between', .5], ['last', 3]] as const) {
      await strip.evaluate((element, fraction) => {
        const track = element as HTMLElement
        track.style.scrollSnapType = 'none'
        track.scrollLeft = track.clientWidth * fraction
      }, fraction)
      await figure.screenshot({ path: `/tmp/apptify-carousel-seams/${theme}-${width}-${stage}.png` })
    }
    const bounds = (await strip.boundingBox())!
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    const stride = await strip.evaluate(element => element.clientWidth)
    await page.mouse.wheel(-stride * 2.25, 0)
    await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeLessThan(stride * 1.5)
    await figure.getByRole('button', { name: '查看一场聆听', exact: true }).click()
    await expect(figure).toHaveAttribute('data-index', '1')
    await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeCloseTo(stride, 0)
    await figure.getByRole('button', { name: '下一张图片', exact: true }).click()
    await expect(figure).toHaveAttribute('data-index', '2')
    await expect.poll(() => strip.evaluate(element => element.scrollLeft)).toBeCloseTo(stride * 2, 0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('component demo lake and headphones remain flush during carousel scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 })
  await openComponent(page, 'apple-image')
  await activeCard(page).getByRole('switch', { name: '轮播模式', exact: true }).click()
  const figure = activeCard(page).locator('.component-demo .apple-image')
  await expect.poll(() => figure.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true)
  for (const [stage, fraction] of [['first', 0], ['between', .5], ['last', 1]] as const) {
    await figure.locator('.apple-image__gallery').evaluate((element, fraction) => {
      const track = element as HTMLElement
      track.style.scrollSnapType = 'none'
      track.scrollLeft = track.clientWidth * fraction
    }, fraction)
    await figure.screenshot({ path: `/tmp/apptify-carousel-seams/demo-${stage}.png` })
  }
  await expect(figure.locator('.apple-image__dot')).toHaveCount(2)
  await expect(figure.getByRole('button', { name: '下一张图片', exact: true })).toBeDisabled()
})

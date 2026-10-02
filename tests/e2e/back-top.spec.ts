import { expect, test } from '@playwright/test'
const fixture = '/tests/e2e/fixtures/back-top.html'

for (const target of ['窗口', '容器']) {
  for (const distance of [300, 90000]) {
    test(`${target} ${distance}px return is smooth and bounded by two seconds`, async ({ page }) => {
      await page.goto(fixture)
      const result = await page.evaluate(async ({ target, distance }) => {
        const area = target === '容器' ? document.querySelector<HTMLElement>('#scroll-area')! : window
        const position = () => area === window ? scrollY : (area as HTMLElement).scrollTop
        area.scrollTo({ top: distance, behavior: 'instant' })
        const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${target}回顶"]`)!
        const start = performance.now(), samples: number[] = []
        button.click()
        await new Promise<void>(resolve => {
          const check = () => { samples.push(position()); if (position() === 0 || performance.now() - start > 2400) resolve(); else requestAnimationFrame(check) }
          requestAnimationFrame(check)
        })
        return { elapsed: performance.now() - start, samples }
      }, { target, distance })
      expect(result.samples.at(-1)).toBe(0)
      expect(result.samples.some(value => value > 0 && value < distance)).toBe(true)
      expect(result.samples.every((value, i) => !i || value <= result.samples[i - 1]!)).toBe(true)
      expect(result.elapsed).toBeLessThan(2100) // One rendering frame and scheduling tolerance.
      if (distance === 300) expect(result.elapsed).toBeLessThan(600)
      else expect(result.elapsed).toBeGreaterThan(1800)
    })
  }
}

for (const event of ['wheel', 'touchstart', 'keydown']) {
  test(`${event} interrupts the active scroll without later jumps`, async ({ page }) => {
    await page.goto(fixture)
    await page.evaluate(() => scrollTo({ top: 90000, behavior: 'instant' }))
    await page.getByRole('button', { name: '窗口回顶', exact: true }).click()
    await page.waitForTimeout(150)
    const stopped = await page.evaluate(event => {
      window.dispatchEvent(event === 'keydown' ? new KeyboardEvent(event, { key: 'PageDown', bubbles: true }) : new Event(event, { bubbles: true }))
      return scrollY
    }, event)
    expect(stopped).toBeGreaterThan(0)
    await page.waitForTimeout(250)
    expect(await page.evaluate(() => scrollY)).toBe(stopped)
  })
}

test('repeated clicks share one deadline and unmount clears pending frames', async ({ page }) => {
  await page.goto(fixture)
  const duration = await page.evaluate(async () => {
    scrollTo({ top: 90000, behavior: 'instant' })
    const button = document.querySelector<HTMLButtonElement>('[aria-label="窗口回顶"]')!, start = performance.now()
    button.click()
    const repeat = setInterval(() => button.click(), 200)
    await new Promise<void>(resolve => { const check = () => scrollY === 0 || performance.now() - start > 2300 ? resolve() : requestAnimationFrame(check); requestAnimationFrame(check) })
    clearInterval(repeat)
    return performance.now() - start
  })
  expect(duration).toBeLessThan(2100)
  await page.evaluate(() => scrollTo({ top: 90000, behavior: 'instant' }))
  await page.getByRole('button', { name: '窗口回顶', exact: true }).click()
  await page.waitForTimeout(150)
  await page.getByRole('button', { name: '挂载切换' }).click()
  const stopped = await page.evaluate(() => scrollY)
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => scrollY)).toBe(stopped)
})

for (const mode of ['none', 'reduced']) {
  test(`${mode} skips animated scrolling on both targets`, async ({ page }) => {
    await page.goto(`${fixture}?motion=${mode}`)
    const positions = await page.evaluate(() => {
      scrollTo({ top: 90000, behavior: 'instant' })
      const area = document.querySelector<HTMLElement>('#scroll-area')!
      area.scrollTo({ top: 90000, behavior: 'instant' })
      document.querySelector<HTMLButtonElement>('[aria-label="窗口回顶"]')!.click()
      document.querySelector<HTMLButtonElement>('[aria-label="容器回顶"]')!.click()
      return [scrollY, area.scrollTop]
    })
    expect(positions).toEqual([0, 0])
  })
}

test('system reduced-motion and live global policy changes are respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(fixture)
  await page.evaluate(() => { scrollTo({ top: 90000, behavior: 'instant' }); document.querySelector<HTMLButtonElement>('[aria-label="窗口回顶"]')!.click() })
  expect(await page.evaluate(() => scrollY)).toBe(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => scrollTo({ top: 90000, behavior: 'instant' }))
  await page.getByRole('button', { name: '窗口回顶', exact: true }).click()
  await page.waitForTimeout(100)
  await page.getByRole('button', { name: 'none', exact: true }).click()
  const stopped = await page.evaluate(() => scrollY)
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => scrollY)).toBe(stopped)
})

test('native wheel and keyboard scroll take control of an active return', async ({ page }) => {
  await page.goto(fixture)
  for (const input of ['wheel', 'keyboard']) {
    await page.evaluate(() => scrollTo({ top: 80000, behavior: 'instant' }))
    await page.getByRole('button', { name: '窗口回顶', exact: true }).click()
    await page.waitForTimeout(150)
    if (input === 'wheel') await page.mouse.wheel(0, 500)
    else await page.keyboard.press('PageDown')
    await page.waitForTimeout(400)
    const stopped = await page.evaluate(() => scrollY)
    expect(stopped).toBeGreaterThan(0)
    await page.waitForTimeout(250)
    expect(await page.evaluate(() => scrollY)).toBe(stopped)
  }
})

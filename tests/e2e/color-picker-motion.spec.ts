import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`color picker reveals and clips a fixed-size panel smoothly at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/tests/e2e/fixtures/color-motion.html')
    const frames = await page.evaluate(async () => {
      const button = document.querySelector<HTMLButtonElement>('.apple-color-picker')!
      const result: Record<string, { time: number; height: number; layoutHeight: number; plane: number }[]> = {}
      for (const action of ['open', 'close']) {
        button.click()
        await Promise.resolve()
        const start = performance.now()
        result[action] = []
        do {
          const menu = document.querySelector<HTMLElement>('.apple-color-menu')
          if (menu && getComputedStyle(menu).display !== 'none') {
            const layoutHeight = menu.getBoundingClientRect().height
            const clip = getComputedStyle(menu).clipPath
            const bottom = clip === 'none' ? 0 : parseFloat(clip.slice(6, -1).split(/\s+/)[2] || '0')
            result[action]!.push({ time: performance.now() - start, height: layoutHeight * (1 - bottom / 100), layoutHeight, plane: menu.querySelector('.apple-color-plane')!.getBoundingClientRect().height })
          }
          await new Promise(requestAnimationFrame)
        } while (performance.now() - start < 500)
      }
      return result
    })
    await info.attach('every-rendered-frame', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
    const open = frames.open!, close = frames.close!
    expect(open[0]!.height).toBeLessThanOrEqual(2)
    expect(close.at(-1)!.height).toBeLessThanOrEqual(2.1)
    expect(open.at(-1)!.height).toBeGreaterThan(300)
    for (const [direction, values] of [[1, open], [-1, close]] as const) {
      expect(values.length).toBeGreaterThan(3)
      for (let i = 1; i < values.length; i++) {
        expect(direction * (values[i]!.height - values[i - 1]!.height)).toBeGreaterThanOrEqual(-.1)
        expect(values[i]!.plane).toBeCloseTo(170, 2)
        expect(values[i]!.layoutHeight).toBeCloseTo(open.at(-1)!.layoutHeight, 2)
      }
    }
    await expect(page.locator('.apple-color-menu')).toBeHidden()
  })
}

test('reopening a closing color picker preserves its current reveal', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  await page.locator('.apple-color-picker').click()
  await expect.poll(() => page.locator('.apple-color-menu').evaluate(el => el.getAnimations().length)).toBe(0)
  const reversal = await page.evaluate(async () => {
    const button = document.querySelector<HTMLButtonElement>('.apple-color-picker')!
    button.click()
    await Promise.resolve()
    const menu = document.querySelector<HTMLElement>('.apple-color-menu')!
    const visibleHeight = () => {
      const clip = getComputedStyle(menu).clipPath
      return menu.getBoundingClientRect().height * (1 - (clip === 'none' ? 0 : parseFloat(clip.slice(6, -1).split(/\s+/)[2] || '0')) / 100)
    }
    while (visibleHeight() > 250) await new Promise(requestAnimationFrame)
    const before = visibleHeight()
    button.click()
    await Promise.resolve()
    return { before, after: visibleHeight() }
  })
  expect(reversal.before).toBeGreaterThan(2)
  expect(reversal.after).toBeCloseTo(reversal.before, 1)
  await expect.poll(() => page.locator('.apple-color-menu').evaluate(el => el.getAnimations().length)).toBe(0)
  await expect(page.locator('.apple-color-menu')).toHaveCSS('height', '336px')
})

test('closing during expansion preserves its current reveal', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  const reversal = await page.evaluate(async () => {
    const button = document.querySelector<HTMLButtonElement>('.apple-color-picker')!
    button.click()
    await Promise.resolve()
    const menu = document.querySelector<HTMLElement>('.apple-color-menu')!
    const visibleHeight = () => {
      const clip = getComputedStyle(menu).clipPath
      return menu.getBoundingClientRect().height * (1 - (clip === 'none' ? 0 : parseFloat(clip.slice(6, -1).split(/\s+/)[2] || '0')) / 100)
    }
    while (visibleHeight() < 100) await new Promise(requestAnimationFrame)
    const before = visibleHeight()
    button.click()
    await Promise.resolve()
    return { before, after: visibleHeight() }
  })
  expect(reversal.before).toBeLessThan(336)
  expect(reversal.after).toBeCloseTo(reversal.before, 1)
  await expect(page.locator('.apple-color-menu')).toBeHidden()
})

for (const motion of ['none', 'reduced']) {
  test(`color picker completes opening and closing with ${motion} motion`, async ({ page }) => {
    await page.goto(`/tests/e2e/fixtures/color-motion.html?motion=${motion}`)
    await page.locator('.apple-color-picker').click()
    await expect.poll(() => page.locator('.apple-color-menu').evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(page.locator('.apple-color-menu')).toHaveCSS('height', '336px')
    await page.keyboard.press('Escape')
    await expect(page.locator('.apple-color-menu')).toBeHidden()
  })
}

test('rapid toggles reuse one panel and keep color edits, keyboard focus and close semantics', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  const trigger = page.locator('.apple-color-picker')
  const menu = page.locator('.apple-color-menu')
  await trigger.click()
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
  const identity = await menu.elementHandle()
  expect(await menu.evaluate(el => el.style.height)).toBe('')
  await expect(trigger).toHaveAttribute('aria-controls', await menu.getAttribute('id') as string)
  await page.keyboard.press('Tab')
  const plane = page.getByRole('slider', { name: '饱和度与亮度' })
  await expect(plane).toBeFocused()
  const saturation = Number(await plane.getAttribute('aria-valuenow'))
  await page.keyboard.press('ArrowLeft')
  await expect(plane).toHaveAttribute('aria-valuenow', String(saturation - 1))
  await page.getByRole('textbox', { name: 'HEX 颜色' }).fill('#ff0000')
  await page.getByRole('button', { name: '应用 HEX 颜色' }).click()
  await expect(page.locator('.apple-color__value')).toHaveText('#FF0000')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toHaveAttribute('aria-hidden', 'true')
  expect(await menu.evaluate(el => el.inert)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.locator('#outside')).toBeFocused()
  await expect(menu).toBeHidden()
  await page.evaluate(async () => {
    const trigger = document.querySelector<HTMLButtonElement>('.apple-color-picker')!
    for (let i = 0; i < 20; i++) { trigger.click(); await new Promise(resolve => setTimeout(resolve, 15)) }
  })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeHidden()
  await trigger.click()
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
  expect(await menu.evaluate((el, original) => el === original, identity)).toBe(true)
  await expect(page.getByRole('textbox', { name: 'HEX 颜色' })).toHaveValue('#ff0000')
  expect(await menu.evaluate(el => el.inert)).toBe(false)
  await page.locator('#outside').click()
  await expect(menu).toBeHidden()
})

for (const control of ['disabled', 'loading']) {
  test(`color picker closes during animation when ${control} and reopens after recovery`, async ({ page }) => {
    await page.goto('/tests/e2e/fixtures/color-motion.html')
    const trigger = page.locator('.apple-color-picker')
    const menu = page.locator('.apple-color-menu')
    await trigger.click()
    await page.evaluate(id => document.querySelector<HTMLButtonElement>(`#${id}`)!.click(), control)
    await expect(trigger).toBeDisabled()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeHidden()
    expect(await menu.evaluate(el => el.inert)).toBe(true)
    await page.evaluate(id => document.querySelector<HTMLButtonElement>(`#${id}`)!.click(), control)
    await trigger.click()
    await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(menu).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })
}

test('changing motion policy settles an active reveal and unmount cancels its animation', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  const trigger = page.locator('.apple-color-picker')
  const menu = page.locator('.apple-color-menu')
  await trigger.click()
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(1)
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('#motion')!.click())
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('#motion')!.click())
  await trigger.click()
  const animation = await menu.evaluateHandle(el => el.getAnimations()[0])
  await page.evaluate(() => document.querySelector<HTMLButtonElement>('#unmount')!.click())
  await expect(trigger).toHaveCount(0)
  expect(await animation.evaluate(animation => animation.playState)).toBe('idle')
})

test('color plane drag commits once and closing releases a captured drag', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  const trigger = page.locator('.apple-color-picker')
  const menu = page.locator('.apple-color-menu')
  const plane = page.locator('.apple-color-plane')
  await trigger.click()
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
  const rect = (await plane.boundingBox())!
  await page.mouse.move(rect.x + rect.width * .3, rect.y + rect.height * .3)
  await page.mouse.down()
  await page.mouse.move(rect.x + rect.width * .6, rect.y + rect.height * .5, { steps: 4 })
  await page.mouse.up()
  await expect(page.locator('#commits')).toHaveText('1')
  await page.mouse.down()
  await page.mouse.move(rect.x + rect.width * .4, rect.y + rect.height * .2, { steps: 4 })
  const beforeClose = await page.locator('.apple-color__value').textContent()
  await page.keyboard.press('Escape')
  await page.mouse.move(rect.x + rect.width * .9, rect.y + rect.height * .9)
  await page.mouse.up()
  await expect(menu).toBeHidden()
  await expect(page.locator('#commits')).toHaveText('1')
  await trigger.click()
  await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
  await page.mouse.move(rect.x + rect.width * .7, rect.y + rect.height * .7)
  await expect(page.locator('.apple-color__value')).toHaveText(beforeClose!)
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})

test('system reduced motion avoids a full-length color reveal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/tests/e2e/fixtures/color-motion.html')
  await page.locator('.apple-color-picker').click()
  const duration = await page.locator('.apple-color-menu').evaluate(el => el.getAnimations()[0]?.effect?.getTiming().duration ?? 0)
  expect(Number(duration)).toBeLessThanOrEqual(80)
  await expect.poll(() => page.locator('.apple-color-menu').evaluate(el => el.getAnimations().length)).toBe(0)
  await page.keyboard.press('Escape')
  await expect(page.locator('.apple-color-menu')).toBeHidden()
})

for (const width of [390, 1440]) {
  test(`HEX drafts support deletion, paste, composition and explicit submission at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/tests/e2e/fixtures/color-motion.html')
    const trigger = page.locator('.apple-color-picker')
    const menu = page.locator('.apple-color-menu')
    const hex = page.getByRole('textbox', { name: 'HEX 颜色' })
    const apply = page.getByRole('button', { name: '应用 HEX 颜色' })
    const selected = page.locator('.apple-color__value')
    await trigger.click()
    await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
    await hex.focus()
    await hex.press('End')
    await hex.press('Backspace')
    await expect(hex).toHaveValue('#0071e')
    await expect(selected).toHaveText('#0071E3')
    await hex.fill('')
    await expect(hex).toHaveValue('')
    await hex.pressSequentially('f80')
    await expect(hex).toHaveValue('f80')
    await expect(selected).toHaveText('#0071E3')
    await expect(page.locator('#commits')).toHaveText('0')
    await apply.click()
    await expect(selected).toHaveText('#FF8800')
    await expect(hex).toHaveValue('#ff8800')
    await hex.fill('nope')
    await apply.click()
    await expect(hex).toHaveValue('nope')
    await expect(hex).toHaveAttribute('aria-invalid', 'true')
    await expect(menu.getByRole('alert')).toContainText('HEX')
    await expect(selected).toHaveText('#FF8800')
    await expect(page.locator('#commits')).toHaveText('1')
    await hex.fill('#a')
    await hex.press('Escape')
    await expect(menu).toBeHidden()
    await trigger.click()
    await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(hex).toHaveValue('#a')
    await expect(selected).toHaveText('#FF8800')
    await hex.evaluate(element => {
      const input = element as HTMLInputElement
      input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
      input.value = '00ff00'
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', data: '00ff00', isComposing: true }))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }))
    })
    await expect(hex).toHaveValue('00ff00')
    await expect(selected).toHaveText('#FF8800')
    await expect(page.locator('#commits')).toHaveText('1')
    await hex.dispatchEvent('compositionend', { data: '00ff00' })
    await expect(selected).toHaveText('#FF8800')
    await hex.press('Enter')
    await expect(selected).toHaveText('#00FF00')
    await expect(page.locator('#commits')).toHaveText('2')
    await hex.evaluate(element => {
      const input = element as HTMLInputElement
      input.value = 'abcdef'
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: 'abcdef' }))
    })
    await expect(hex).toHaveValue('abcdef')
    await page.locator('#outside').click()
    await expect(menu).toBeHidden()
    await trigger.click()
    await expect.poll(() => menu.evaluate(el => el.getAnimations().length)).toBe(0)
    await expect(hex).toHaveValue('abcdef')
    await expect(selected).toHaveText('#00FF00')
    await expect(page.locator('#commits')).toHaveText('2')
    await hex.press('Enter')
    await expect(selected).toHaveText('#ABCDEF')
    await menu.getByRole('button', { name: '#ffffff', exact: true }).click()
    await expect(selected).toHaveText('#FFFFFF')
    await expect(hex).toHaveValue('#ffffff')
    await page.screenshot({ path: `/tmp/apptify-forms-task/color-apply-${width}.png` })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })
}

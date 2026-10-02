import { expect, test } from '@playwright/test'

const colors: Record<string, string> = {
  accent: 'rgb(0, 113, 227)', info: 'rgb(0, 113, 227)', success: 'rgb(52, 199, 89)',
  warning: 'rgb(255, 170, 0)', danger: 'rgb(201, 56, 48)', custom: 'rgb(199, 92, 134)',
}

const fixture = '/tests/e2e/fixtures/theme-colors.html'

test('all semantic and custom tag borders and icons retain exact colors on both themes and all surfaces', async ({ page }) => {
  await page.goto(fixture)
  const samples: unknown[] = []
  for (const theme of ['浅色', '深色']) {
    await page.getByRole('button', { name: `切换${theme}`, exact: true }).click()
    const snapshot = await page.locator('.surface .apple-tag:not([data-tone=neutral])').evaluateAll(tags => tags.map(tag => {
      const css = getComputedStyle(tag)
      const parent = getComputedStyle(tag.parentElement!)
      const rgb = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(channel => color.startsWith('color(srgb') ? channel * 255 : channel)
      const luminance = (color: string) => rgb(color).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0)
      const foreground = luminance(css.color), background = luminance(parent.backgroundColor)
      return {
        tone: tag.getAttribute('data-tone')!, surface: tag.parentElement!.getAttribute('data-surface'), border: css.borderTopColor,
        icon: getComputedStyle(tag.querySelector('svg')!).color, close: getComputedStyle(tag.querySelector('button svg')!).color,
        background: css.backgroundColor, text: css.color, textChannels: rgb(css.color), contrast: (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05),
      }
    }))
    expect(snapshot).toHaveLength(18)
    for (const item of snapshot) {
      expect(item.border).toBe(colors[item.tone])
      expect(item.icon).toBe(colors[item.tone])
      expect(item.close).toBe(colors[item.tone])
      expect(item.background).toBe('rgba(0, 0, 0, 0)')
      const border = colors[item.tone].match(/[\d.]+/g)!.slice(0, 3).map(Number)
      const body = theme === '浅色' ? [29, 29, 31] : [238, 238, 239]
      item.textChannels.forEach((channel, index) => expect(channel).toBeCloseTo((border[index] + body[index]) / 2, 2))
    }
    console.log(`Tag ${theme} 50:50 contrast: ${JSON.stringify(snapshot.map(({ tone, surface, contrast }) => ({ tone, surface, ratio: Number(contrast.toFixed(2)) })))}`)
    samples.push(snapshot.map(({ text, textChannels, contrast, ...color }) => color))
  }
  expect(samples[1]).toEqual(samples[0])
})

test('tag close hover and press use neutral gray covers and preserve same-color icons and keyboard actions', async ({ page }) => {
  await page.goto(fixture)
  const snapshots: unknown[] = []
  for (const theme of ['浅色', '深色']) {
    await page.getByRole('button', { name: `切换${theme}`, exact: true }).click()
    const states = []
    for (const tone of Object.keys(colors)) {
      const button = page.locator(`[data-surface=bg] [data-tone=${tone}] button`)
      await button.hover()
      const hover = await button.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }))
      await page.mouse.down()
      const active = await button.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }))
      await page.mouse.up()
      expect(hover.color).toBe(colors[tone])
      expect(active.color).toBe(colors[tone])
      expect(hover.background).toBe('rgba(128, 128, 128, 0.08)')
      expect(active.background).toBe('rgba(128, 128, 128, 0.12)')
      states.push({ tone, hover, active })
    }
    snapshots.push(states)
  }
  expect(snapshots[1]).toEqual(snapshots[0])
  const close = page.locator('[data-surface=bg] [data-tone=custom] button')
  const before = Number(await page.locator('#closed').textContent())
  await close.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#closed')).toHaveText(String(before + 1))
})

test('alert icons, badges and progress fills keep all semantic colors in both themes', async ({ page }) => {
  await page.goto(fixture)
  for (const theme of ['浅色', '深色']) {
    await page.getByRole('button', { name: `切换${theme}`, exact: true }).click()
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      const sample = page.locator(`[data-semantic=${tone}]`)
      await expect(sample.locator('.apple-alert > svg')).toHaveCSS('color', colors[tone])
      await expect(sample.locator('.apple-badge__value')).toHaveCSS('background-color', colors[tone])
      await expect(sample.locator('.apple-progress__fill')).toHaveCSS('background-color', colors[tone])
    }
  }
})

for (const width of [320, 1440]) {
  test(`same-color tags fit and remain readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(fixture)
    for (const theme of ['浅色', '深色']) {
      await page.getByRole('button', { name: `切换${theme}`, exact: true }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
      await page.screenshot({ path: `/tmp/apptify-colors-${width}-${theme === '浅色' ? 'light' : 'dark'}.png`, fullPage: true })
    }
  })
}

test('settings previews use the same blue from the theme palette', async ({ page }) => {
  await page.goto('/settings')
  const light = page.getByRole('button', { name: '浅色', exact: true }).locator('.theme-swatch')
  const dark = page.getByRole('button', { name: '深色', exact: true }).locator('.theme-swatch')
  await expect(light).toHaveCSS('color', colors.accent)
  await expect(dark).toHaveCSS('color', colors.accent)
})

for (const theme of ['浅色', '深色']) {
  test(`tag close joins the right edge with square left corners and keyboard focus in ${theme}`, async ({ page }) => {
    await page.goto(fixture)
    await page.getByRole('button', { name: `切换${theme}`, exact: true }).click()
    for (const tone of Object.keys(colors)) {
      const tag = page.locator(`[data-surface=bg] [data-tone=${tone}]`)
      const button = tag.getByRole('button')
      const geometry = await tag.evaluate(el => {
        const button = el.querySelector('button')!
        const host = el.getBoundingClientRect(), rect = button.getBoundingClientRect()
        const css = getComputedStyle(button)
        return { right: host.right - rect.right, top: rect.top - host.top, bottom: host.bottom - rect.bottom, width: rect.width, leftTopRadius: css.borderTopLeftRadius, leftBottomRadius: css.borderBottomLeftRadius, rightTopRadius: css.borderTopRightRadius, rightBottomRadius: css.borderBottomRightRadius, hostOverflow: getComputedStyle(el).overflow, buttonOverflow: css.overflow }
      })
      expect(geometry.right).toBeCloseTo(1, 3)
      expect(geometry.top).toBeCloseTo(1, 3)
      expect(geometry.bottom).toBeCloseTo(1, 3)
      expect(geometry.width).toBeGreaterThanOrEqual(24)
      expect(geometry.leftTopRadius).toBe('0px')
      expect(geometry.leftBottomRadius).toBe('0px')
      expect(parseFloat(geometry.rightTopRadius)).toBeGreaterThan(0)
      expect(parseFloat(geometry.rightBottomRadius)).toBeGreaterThan(0)
      expect(geometry.hostOverflow).toBe('hidden')
      expect(geometry.buttonOverflow).toBe('hidden')
      await button.focus()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Shift+Tab')
      await expect(button).toHaveCSS('outline-style', 'solid')
      expect(await button.evaluate(el => parseFloat(getComputedStyle(el).outlineOffset))).toBeLessThan(0)
      const before = Number(await page.locator('#closed').textContent())
      await page.keyboard.press('Space')
      await expect(page.locator('#closed')).toHaveText(String(before + 1))
      await button.blur()
      await button.hover()
      await tag.screenshot({ path: `/tmp/apptify-tag-edge-${theme === '浅色' ? 'light' : 'dark'}-${tone}.png` })
    }
  })
}

test('tag close ripple stays neutral and clipped while disabled and motion-none policies hold', async ({ page }) => {
  await page.goto(`${fixture}?motion=full`)
  const tag = page.locator('[data-surface=bg] [data-tone=info]')
  const button = tag.getByRole('button')
  await button.hover()
  await page.mouse.down()
  const effect = button.locator('.v-ripple__container')
  await expect(effect).toHaveCount(1)
  await expect(effect).toHaveCSS('color', 'rgb(128, 128, 128)')
  await expect(effect).toHaveCSS('overflow', 'hidden')
  const radius = await effect.evaluate(el => ({ left: getComputedStyle(el).borderTopLeftRadius, right: getComputedStyle(el).borderTopRightRadius }))
  expect(radius.left).toBe('0px')
  expect(parseFloat(radius.right)).toBeGreaterThan(0)
  await expect(button.locator('svg')).toHaveCSS('opacity', '1')
  await tag.screenshot({ path: '/tmp/apptify-tag-close-neutral-ripple.png' })
  await page.mouse.up()
  const disabled = page.locator('#disabled-tag button')
  await expect(disabled).toBeDisabled()
  const before = await page.locator('#closed').textContent()
  await disabled.evaluate(el => (el as HTMLButtonElement).click())
  await expect(page.locator('#closed')).toHaveText(before!)
  await expect(disabled.locator('.v-ripple__container')).toHaveCount(0)
  await page.goto(fixture)
  const instant = page.locator('[data-surface=bg] [data-tone=info] button')
  await instant.hover()
  await page.mouse.down()
  await expect(instant.locator('.v-ripple__container')).toHaveCount(0)
  await page.mouse.up()
})

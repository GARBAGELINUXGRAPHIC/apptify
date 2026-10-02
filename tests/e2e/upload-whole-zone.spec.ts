import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/upload-whole-zone.html')
  await expect(page.locator('.apple-upload')).toBeVisible()
})

test('whole area, copy and icon open one chooser; nested actions and remove never open it', async ({ page }) => {
  const zone = page.locator('.apple-upload')
  let choosers = 0
  page.on('filechooser', () => choosers++)
  for (const click of [() => zone.click({ position: { x: 12, y: 12 } }), () => zone.locator('p').click(), () => zone.locator('svg').click(), () => zone.locator('.apple-upload__trigger span').click()]) {
    const chooserPromise = page.waitForEvent('filechooser')
    await click()
    const chooser = await chooserPromise
    await chooser.setFiles({ name: `selected-${choosers}.txt`, mimeType: 'text/plain', buffer: Buffer.from('selected') })
  }
  expect(choosers).toBe(4)
  await page.locator('#preview span').click()
  await page.locator('#cancel').click()
  await page.getByRole('button', { name: '移除 selected-1.txt', exact: true }).click()
  await expect(page.locator('#actions')).toHaveText('2')
  expect(choosers).toBe(4)
  await expect(page.locator('button button')).toHaveCount(0)
  await expect(page.locator('.apple-upload__file')).toHaveCount(3)
})

test('keyboard selection prevents scroll and disabled/loading block click, keyboard and drop', async ({ page }) => {
  const zone = page.locator('.apple-upload')
  let choosers = 0
  page.on('filechooser', () => choosers++)
  await zone.evaluate(element => element.addEventListener('keydown', event => { if ((event as KeyboardEvent).key === ' ') element.setAttribute('data-space-prevented', String(event.defaultPrevented)) }))
  for (const key of ['Enter', 'Space']) {
    await zone.focus()
    const chooserPromise = page.waitForEvent('filechooser')
    await page.keyboard.press(key)
    await (await chooserPromise).setFiles([])
  }
  expect(choosers).toBe(2)
  await expect(zone).toHaveAttribute('data-space-prevented', 'true')
  for (const state of ['disable', 'loading']) {
    await page.locator(`#${state}`).click()
    await expect(zone).toHaveAttribute('aria-disabled', 'true')
    await expect(zone).toHaveAttribute('tabindex', '-1')
    await zone.click({ position: { x: 12, y: 12 }, force: true })
    await zone.dispatchEvent('keydown', { key: 'Enter' })
    const transfer = await page.evaluateHandle(() => { const data = new DataTransfer(); data.items.add(new File(['drop'], 'blocked.txt')); return data })
    await zone.dispatchEvent('drop', { dataTransfer: transfer })
    await expect(page.locator('.apple-upload__file')).toHaveCount(0)
    expect(choosers).toBe(2)
    await page.locator(`#${state}`).click()
  }
})

test('drop remains functional and neutral ripple covers and clips to the dropzone', async ({ page }) => {
  const zone = page.locator('.apple-upload')
  const transfer = await page.evaluateHandle(() => { const data = new DataTransfer(); data.items.add(new File(['drop'], 'dropped.txt')); return data })
  await zone.dispatchEvent('dragenter', { dataTransfer: transfer })
  await expect(zone).toHaveClass(/is-dragging/)
  await zone.dispatchEvent('drop', { dataTransfer: transfer })
  await expect(zone).not.toHaveClass(/is-dragging/)
  await expect(page.locator('.apple-upload__file-name')).toHaveText('dropped.txt')
  const box = (await zone.boundingBox())!
  await page.mouse.move(box.x + 12, box.y + 12)
  await page.mouse.down()
  const wave = zone.locator(':scope > .v-ripple__container')
  await expect(wave).toHaveCount(1)
  const styles = await wave.evaluate(element => {
    const parent = element.parentElement!, host = getComputedStyle(parent), ripple = getComputedStyle(element), animation = getComputedStyle(element.firstElementChild!)
    const a = parent.getBoundingClientRect(), b = element.getBoundingClientRect()
    return { overflow: host.overflow, radius: host.borderRadius, rippleRadius: ripple.borderRadius, clip: ripple.overflow, color: animation.backgroundColor, dx: b.x - a.x, dy: b.y - a.y, width: b.width, height: b.height, hostWidth: a.width, hostHeight: a.height }
  })
  expect(styles.overflow).toBe('hidden')
  expect(styles.clip).toBe('hidden')
  expect(styles.rippleRadius).toBe(styles.radius)
  expect(styles.color).toBe('rgb(128, 128, 128)')
  expect(Math.abs(styles.dx)).toBeLessThanOrEqual(1)
  expect(Math.abs(styles.dy)).toBeLessThanOrEqual(1)
  expect(Math.abs(styles.width - styles.hostWidth)).toBeLessThanOrEqual(2)
  expect(Math.abs(styles.height - styles.hostHeight)).toBeLessThanOrEqual(2)
  await page.waitForTimeout(180)
  await page.screenshot({ path: '/tmp/apptify-upload-ripple.png' })
  await page.mouse.up()
})

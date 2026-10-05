import { expect, test, type Locator, type Page } from '@playwright/test'

const fixture = '/tests/e2e/fixtures/field-labels.html'
const descriptions = '.apple-field__label, .apple-field__message, .apple-choice__label, .apple-field__required, .apple-choice__label strong'

async function clearEvents(page: Page) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur()
    ;(window as any).fieldEvents = []
  })
}

async function expectNoActivation(page: Page, action: () => Promise<void>, message: string) {
  await clearEvents(page)
  const values = await page.locator('#values').textContent()
  await action()
  expect(await page.evaluate(() => (window as any).fieldEvents), message).toEqual([])
  await expect(page.locator('#values'), message).toHaveText(values!)
  await expect(page.locator('[aria-expanded="true"]'), message).toHaveCount(0)
}

async function pressDescription(page: Page, locator: Locator, description: string) {
  await locator.scrollIntoViewIfNeeded()
  const box = (await locator.boundingBox())!
  await expectNoActivation(page, async () => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    expect(await page.evaluate(() => (window as any).fieldEvents), `${description}: mousedown`).toEqual([])
    await page.mouse.up()
  }, description)
}

for (const width of [390, 1280]) {
  for (const errors of [false, true]) {
    test(`labels, ${errors ? 'errors' : 'hints'}, choice text and row gaps never activate fields at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      let fileChoosers = 0
      page.on('filechooser', () => { fileChoosers++ })
      await page.goto(fixture + (errors ? '?errors' : ''))
      await expect(page.locator('#values')).toBeVisible()
      const texts = page.locator(descriptions)
      expect(await texts.count()).toBeGreaterThan(30)
      for (let index = 0; index < await texts.count(); index++) {
        const text = texts.nth(index)
        await pressDescription(page, text, (await text.textContent())!)
        await expectNoActivation(page, () => text.evaluate(element => (element as HTMLElement).click()), `programmatic click: ${await text.textContent()}`)
      }
      // A native wrapping label used to activate the control from these empty areas.
      const rows = page.locator('.apple-choice, .apple-switch-row')
      for (let index = 0; index < await rows.count(); index++) {
        const row = rows.nth(index)
        await row.scrollIntoViewIfNeeded()
        const point = await row.evaluate(element => {
          const row = element.getBoundingClientRect()
          const input = element.querySelector('input')!.getBoundingClientRect()
          const copy = element.querySelector('.apple-switch__copy, .apple-choice__label')!.getBoundingClientRect()
          const isSwitch = element.classList.contains('apple-switch-row')
          return {
            x: isSwitch ? (copy.right + input.left) / 2 : (input.right + copy.left) / 2,
            y: row.y + row.height / 2,
          }
        })
        await expectNoActivation(page, () => page.mouse.click(point.x, point.y), `empty gap in choice row ${index}`)
        const rowBox = (await row.boundingBox())!
        await expectNoActivation(page, () => page.mouse.click(rowBox.x + 2, rowBox.y + 1), `empty upper edge in choice row ${index}`)
      }
      expect(fileChoosers, 'upload descriptions must not open a file chooser').toBe(0)
    })
  }
}

test('controls keep accessible names, direct clicks and keyboard operation', async ({ page }) => {
  await page.goto(fixture)
  const input = page.getByRole('textbox', { name: 'input 名称', exact: true })
  await input.click()
  await expect(input).toBeFocused()
  await input.fill('已编辑')
  await expect(input).toHaveValue('已编辑')
  await expect(input).toHaveAccessibleDescription('input 提示')
  await expect(page.getByRole('textbox', { name: 'textarea 名称', exact: true })).toHaveCount(1)
  await expect(page.getByRole('textbox', { name: '自定义名称', exact: true })).toHaveCount(1)
  const custom = page.getByRole('textbox', { name: 'form-field 名称', exact: true })
  await custom.click()
  await expect(custom).toBeFocused()
  await expect(custom).toHaveAccessibleDescription('form-field 提示')

  for (const [role, name] of [['checkbox', 'checkbox 名称'], ['switch', 'switch 名称'], ['checkbox', '插槽复选名称'], ['switch', '插槽开关名称']] as const) {
    const control = page.getByRole(role, { name, exact: true })
    await control.click()
    await expect(control).toBeChecked()
    await control.press('Space')
    await expect(control).not.toBeChecked()
  }
  const radio = page.locator('#case-radio')
  await expect(radio.getByRole('radiogroup', { name: 'radio 名称', exact: true })).toHaveCount(1)
  const first = radio.getByRole('radio', { name: '选项一', exact: true })
  const second = radio.getByRole('radio', { name: '选项二', exact: true })
  await second.click()
  await expect(second).toBeChecked()
  await second.press('ArrowUp')
  await expect(first).toBeChecked()
  await expect(first).toBeFocused()

  const select = page.getByRole('combobox', { name: 'select 名称', exact: true })
  await select.click()
  await expect(select).toHaveAttribute('aria-expanded', 'true')
  await page.locator('#case-select').getByRole('option', { name: '选项二', exact: true }).click()
  await expect(select).toContainText('选项二')
  await select.press('ArrowDown')
  await expect(select).toHaveAttribute('aria-expanded', 'true')
  await select.press('Escape')
  await expect(select).toHaveAttribute('aria-expanded', 'false')

  const autocomplete = page.getByRole('combobox', { name: 'autocomplete 名称', exact: true })
  await autocomplete.click()
  await expect(autocomplete).toBeFocused()
  await expect(autocomplete).toHaveAttribute('aria-expanded', 'true')
  await autocomplete.press('Escape')

  const date = page.locator('#case-date')
  const year = date.getByRole('textbox', { name: 'date 名称年', exact: true })
  await year.click()
  await expect(year).toBeFocused()
  await date.getByRole('button', { name: '打开日历', exact: true }).click()
  await expect(date.getByRole('dialog')).toBeVisible()
  await date.getByRole('button', { name: '完成', exact: true }).click()
  const color = page.getByRole('button', { name: 'color 名称', exact: true })
  await color.click()
  await expect(color).toHaveAttribute('aria-expanded', 'true')
  await color.press('Escape')
  await expect(color).toHaveAttribute('aria-expanded', 'false')

  const slider = page.getByRole('slider', { name: 'slider 名称', exact: true })
  await slider.click()
  await expect(slider).toBeFocused()
  await slider.press('Home')
  await expect(slider).toHaveValue('0')
  await slider.press('ArrowRight')
  await expect(slider).toHaveValue('1')
  const stepper = page.getByRole('spinbutton', { name: 'stepper 名称', exact: true })
  await stepper.click()
  await expect(stepper).toBeFocused()
  await page.locator('#case-stepper').getByRole('button', { name: '增加', exact: true }).click()
  await expect(stepper).toHaveValue('3')
  const otp = page.getByRole('textbox', { name: 'otp 名称，第 1 位，共 4 位', exact: true })
  await otp.fill('1234')
  await expect.poll(() => page.locator('#values').textContent()).toContain('"otp":"1234"')
  const cascader = page.locator('#case-cascader').getByRole('combobox').first()
  await cascader.click()
  await page.locator('#case-cascader').getByRole('option', { name: '地区一', exact: true }).click()
  await expect(page.locator('#case-cascader').getByRole('combobox')).toHaveCount(2)
  const rating = page.locator('#case-rate').getByRole('radio', { name: '3 星', exact: true })
  await rating.click()
  await expect(rating).toBeChecked()
  await rating.press('ArrowRight')
  await expect(page.locator('#case-rate').getByRole('radio', { name: '4 星', exact: true })).toBeChecked()

  const segmented = page.locator('#case-segmented')
  await segmented.getByText('选项二', { exact: true }).click()
  await expect(segmented.getByRole('radio', { name: '选项二', exact: true })).toBeChecked()
})

test('Tab reaches controls directly without a stop on their descriptive text', async ({ page }) => {
  await page.goto(fixture)
  await page.locator('#outside').focus()
  for (const [role, name] of [['textbox', 'input 名称'], ['textbox', 'textarea 名称'], ['combobox', 'select 名称'], ['combobox', 'autocomplete 名称']] as const) {
    await page.keyboard.press('Tab')
    await expect(page.getByRole(role, { name, exact: true })).toBeFocused()
  }
})

test('HEX caption does not focus the editor, while the editor and Apply remain usable', async ({ page }) => {
  await page.goto(fixture)
  const color = page.locator('#case-color')
  const trigger = color.getByRole('button', { name: 'color 名称', exact: true })
  await trigger.click()
  const caption = color.getByText('HEX', { exact: true })
  await caption.scrollIntoViewIfNeeded()
  const box = (await caption.boundingBox())!
  // Keep the focused trigger: manually blurring it would close the panel before the gesture.
  await page.evaluate(() => { (window as any).fieldEvents = [] })
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  expect(await page.evaluate(() => (window as any).fieldEvents)).toEqual([])
  await page.mouse.up()
  expect(await page.evaluate(() => (window as any).fieldEvents)).toEqual([])
  // A click on nonfocusable text may blur the trigger and close the existing popup.
  if (await trigger.getAttribute('aria-expanded') === 'false') await trigger.click()
  const hex = color.getByRole('textbox', { name: 'HEX 颜色', exact: true })
  await hex.fill('#ff0000')
  await color.getByRole('button', { name: '应用 HEX 颜色', exact: true }).click()
  await expect(color.locator('.apple-color__value')).toHaveText('#FF0000')
})

test('the settings preview label never outlines, focuses or opens its select', async ({ page }) => {
  await page.goto('/settings')
  const field = page.locator('#setting-glass .apple-field')
  const label = field.getByText('点击查看效果', { exact: true })
  const combo = field.getByRole('combobox', { name: '点击查看效果', exact: true })
  await label.scrollIntoViewIfNeeded()
  const box = (await label.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await expect(combo).not.toBeFocused()
  await expect(combo).toHaveAttribute('aria-expanded', 'false')
  await page.mouse.up()
  await expect(combo).not.toBeFocused()
  await expect(combo).toHaveAttribute('aria-expanded', 'false')
  await expect(combo).toContainText('Item 1')
  await combo.click()
  await expect(combo).toHaveAttribute('aria-expanded', 'true')
})

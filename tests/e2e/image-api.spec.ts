import { expect, test } from '@playwright/test'

for (const hasTouch of [false, true]) for (const packaged of [false, true]) {
  test(`gallery object and array retain preview with no single-image arrows (touch=${hasTouch}, package=${packaged})`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, hasTouch })
    const page = await context.newPage()
    try {
      await page.goto('/tests/e2e/fixtures/image-api.html' + (packaged ? '?package' : ''))
      for (const id of ['single-object', 'single-array']) {
        const figure = page.locator(`#${id}`)
        await expect(figure.locator('img')).toHaveAttribute('alt', '湖泊')
        await expect(figure.locator('.apple-image__arrows')).toHaveCount(0)
        await figure.getByRole('button', { name:'放大图片：湖泊',exact:true }).click()
        const viewer = page.getByRole('dialog', { name:'图片预览',exact:true })
        await expect(viewer).toBeVisible()
        await expect(viewer.getByRole('button', {name:'上一张',exact:true})).toHaveCount(0)
        await expect(viewer.getByRole('button', {name:'下一张',exact:true})).toHaveCount(0)
        await viewer.getByRole('button',{name:'关闭图片预览',exact:true}).click()
        await expect(viewer).toHaveCount(0)
      }
      await page.locator('#select').click()
      await expect(page.locator('#multi')).toHaveAttribute('data-index','1')
      await page.locator('#multi [aria-label="上一张图片"]').click()
      await expect(page.locator('#index')).toHaveText('0')
      await page.locator('#multi [aria-label="下一张图片"]').click()
      await expect(page.locator('#index')).toHaveText('1')
      await page.locator('#multi [aria-label="放大图片：耳机"]').click()
      await expect(page.getByRole('dialog',{name:'图片预览',exact:true})).toBeVisible()
      await page.getByRole('button',{name:'关闭图片预览',exact:true}).click()
      await page.locator('#empty').click()
      await expect(page.locator('#multi img')).toHaveCount(0)
      await expect(page.locator('#multi')).toHaveAttribute('data-index','0')
      await expect(page.locator('#multi [aria-label="暂无图片"]')).toBeVisible()
    } finally { await context.close() }
  })
}

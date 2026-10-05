import { waitForPageLayout } from './component-navigation'
import { expect, test } from '@playwright/test'
import { catalog } from '../../playground/catalog'

for (const [width, columns] of [[320,1],[768,1],[1440,2],[1920,2],[2240,2],[2560,2]]) {
  test(`component cards use ${columns} columns in ${width}px available layout`, async ({page}) => {
    await page.setViewportSize({width:width!,height:1000})
    await page.goto('/components')
    await expect.poll(()=>page.locator('main').evaluate(el=>el.getAnimations().length)).toBe(0)
    await expect(page.locator('.component-card').first()).toBeVisible()
    await waitForPageLayout(page)
    const actual=await page.locator('.masonry-feed').first().evaluate(el=>new Set(Array.from(el.children).map(card=>(card as HTMLElement).offsetLeft)).size)
    expect(actual).toBe(columns)
    await expect(page.locator('.component-demo')).toHaveCount(catalog.length)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width!)
  })
}

for (const [theme,label,surface] of [['light','浅色','rgb(255, 255, 255)'],['dark','深色','rgb(34, 34, 36)']]) {
  test(`account menu and auth card stay opaque on ${theme}, with compact paired buttons`,async({page})=>{
    await page.setViewportSize({width:390,height:900})
    await page.goto('/settings')
    await page.getByRole('button',{name:label!,exact:true}).click()
    const trigger=page.getByRole('button',{name:'打开用户菜单',exact:true})
    await expect(trigger).toHaveCSS('border-width','0px')
    await trigger.click()
    const popup=page.getByRole('dialog',{name:'用户菜单',exact:true})
    await expect(popup).toHaveCSS('background-color',surface!)
    await expect(popup).toHaveCSS('backdrop-filter','none')
    await popup.getByRole('button',{name:/登录.*Login/}).click()
    let auth=page.getByRole('dialog',{name:'登录示例',exact:true})
    await expect(auth).toHaveCSS('background-color',surface!)
    await expect(auth).toHaveCSS('backdrop-filter','none')
    await expect(auth.locator('.user-auth-symbol')).toHaveText('a')
    await expect(auth.locator('input[aria-label="密码"]')).toHaveAttribute('type','password')
    const paired=auth.locator('.user-auth-actions .apple-button')
    await expect(paired).toHaveCount(2)
    for(const button of await paired.all()) await expect(button).toHaveCSS('border-radius','8px')
    await expect(paired.last()).toHaveClass(/apple-button--outline/)
    await auth.locator('input[aria-label="密码"]').fill('temporary-demo-value')
    await auth.getByRole('link',{name:'注册账户',exact:true}).click()
    auth=page.getByRole('dialog',{name:'注册示例',exact:true})
    await expect(auth.getByRole('textbox', { name: '姓名', exact: true })).toBeFocused()
    await expect(auth.locator('input[aria-label="密码"]')).toHaveValue('')
    await auth.getByRole('link',{name:'已有账户？登录',exact:true}).press('Enter')
    auth=page.getByRole('dialog',{name:'登录示例',exact:true})
    await expect(auth.getByRole('textbox', { name: '电子邮箱', exact: true })).toBeFocused()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({path: test.info().outputPath(`auth-final-${theme}.png`)})
  })
}

test('sidebar hover has one background and unchanged row geometry',async({page})=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('/components#apple-card')
  const row=page.locator('.sidebar .apple-tree__row').filter({hasText:/^卡片$/})
  await waitForPageLayout(page)
  await page.mouse.move(500,70)
  const before=await row.boundingBox()
  await row.hover()
  const after=await row.boundingBox()
  expect(after).toEqual(before)
  await expect(row).toHaveCSS('border-radius','0px')
  await expect(row).toHaveCSS('transform','none')
  expect(await row.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
  expect(await row.evaluate(el => getComputedStyle(el, '::before').content)).toBe('none')
  expect(await row.evaluate(el => getComputedStyle(el, '::after').content)).toBe('none')
  expect(await row.evaluate(el=>getComputedStyle(el).transitionProperty)).toBe('background-color, color')
})
